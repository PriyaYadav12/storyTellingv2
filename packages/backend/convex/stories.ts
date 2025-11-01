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
		return await ctx.db.patch(storyId, {
			content,
			status: "ready",
			updatedAt: Date.now(),
		});
	},
});

// generateNow action moved to storiesActions.ts to avoid circular type inference