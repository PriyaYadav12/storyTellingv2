import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";

export const list = query({
	args: {},
	handler: async (ctx) => {
		const user = await authComponent.getAuthUser(ctx);
		if (!user) return [];
		const userId = String(user._id);
		const docs = await ctx.db
			.query("stories")
			.withIndex("by_user", (q) => q.eq("userId", userId))
			.order("desc")
			.collect();
		return docs.filter((doc) => doc.status != "error");
	},
});

export const get = query({
	args: { storyId: v.id("stories") },
	handler: async (ctx, { storyId }) => {
		return await ctx.db.get(storyId);
	},
});

export const _create = mutation({
	args: {
		title: v.string(),
		params: v.object({
			theme: v.string(),
			lesson: v.optional(v.string()),
			length: v.union(v.literal("short"), v.literal("medium"), v.literal("long")),
			language: v.optional(v.string()),
			useFavorites: v.optional(v.boolean()),
		}),
	},
	handler: async (ctx, { title, params }) => {
		const user = await authComponent.getAuthUser(ctx);
		if (!user) throw new Error("Not authenticated");
		const userId = String(user._id);

		const profile = await ctx.db
			.query("user_profiles")
			.withIndex("by_user", (q) => q.eq("userId", userId))
			.first();
		if (!profile) throw new Error("Profile not found");

		const now = Date.now();
		const storyId = await ctx.db.insert("stories", {
			userId,
			profileId: profile._id,
			title,
			params,
			status: "queued",
			createdAt: now,
			updatedAt: now,
		});
		return storyId;
	},
});

export const _markStatus = mutation({
	args: {
		storyId: v.id("stories"),
		status: v.union(v.literal("generating"), v.literal("ready"), v.literal("error")),
		error: v.optional(v.string()),
	},
	handler: async (ctx, { storyId, status, error }) => {
		const story = await ctx.db.get(storyId);
		if (!story) throw new Error("Story not found");
		return await ctx.db.patch(storyId, {
			status,
			error,
			updatedAt: Date.now(),
		});
	},
});

export const _setContent = mutation({
	args: { storyId: v.id("stories"), content: v.string() },
	handler: async (ctx, { storyId, content }) => {
		const story = await ctx.db.get(storyId);
		if (!story) throw new Error("Story not found");
		
		// Split content into lines
		const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
		
		// First line is the title
		const title = lines.length > 0 ? lines[0] : story.title || "Untitled Story";
		
		// Find SCENE METADATA separator
		const metadataStartIndex = lines.findIndex(line => line.toUpperCase() === 'SCENE METADATA');
		
		let contentBody: string;
		let sceneMetadata: any[] | undefined;
		
		if (metadataStartIndex !== -1) {
			// Content is everything between title and metadata
			contentBody = lines.slice(1, metadataStartIndex).join('\n').trim();
			
			// Parse scene metadata
			const metadataLines = lines.slice(metadataStartIndex + 1);
			sceneMetadata = metadataLines
				.map(line => {
					// Parse: "Scene 1: Sunset beach shoreline, friends begin exploring, warm-excited-cozy, peach-gold sky, gentle waves, soft sand texture, salty breeze."
					const match = line.match(/Scene (\d+):\s*(.+)/);
					if (!match) return null;
					
					const sceneNumber = parseInt(match[1]);
					const rest = match[2];
					
					// Try to extract structured data (location, description, moods, visuals)
					return {
						sceneNumber,
						description: rest || '',
						filePath: '',
					};
				})
				.filter(item => item !== null);
		} else {
			// No metadata separator, everything after title is content
			contentBody = lines.length > 1 ? lines.slice(1).join('\n') : content;
		}
		
		return await ctx.db.patch(storyId, {
			title,
			content: contentBody,
			sceneMetadata,
			status: "ready",
			updatedAt: Date.now(),
		});
	},
});

export const _updateSceneFilePath = mutation({
	args: { 
		storyId: v.id("stories"),
		sceneNumber: v.number(),
		filePath: v.string(),
	},
	handler: async (ctx, { storyId, sceneNumber, filePath }) => {
		const story = await ctx.db.get(storyId);
		if (!story) throw new Error("Story not found");
		
		if (!story.sceneMetadata) return;
		
		const updatedSceneMetadata = story.sceneMetadata.map(scene => 
			scene.sceneNumber === sceneNumber 
				? { ...scene, filePath }
				: scene
		);
		
		return await ctx.db.patch(storyId, {
			sceneMetadata: updatedSceneMetadata,
			updatedAt: Date.now(),
		});
	},
});

// generateNow action moved to storiesActions.ts to avoid circular type inference