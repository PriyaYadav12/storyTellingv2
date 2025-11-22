import { action } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";
import OpenAI from "openai";
import { api } from "./_generated/api";
import { formatStoryPrompt } from "./storyPromptFormatter";
import { generateAllSceneImages } from "./sceneImageGenerator/index";
import { generateMergedNarration } from "./narrationGenerator";

export const generateStory: ReturnType<typeof action> = action({
	args: {
		params: v.object({
			theme: v.string(),
			lesson:v.optional(v.string()),
			length: v.union(v.literal("short"), v.literal("medium"), v.literal("long")),
			language: v.optional(v.string()),
			useFavorites: v.optional(v.boolean()),
			childId: v.optional(v.union(v.literal("1"), v.literal("2"))),
		}),
	},
	handler: async (ctx, { params }) => {
		const user = await authComponent.getAuthUser(ctx);
		if (!user) throw new Error("Not authenticated");
		// Get profile to personalize
		const profile = await ctx.runQuery(api.userProfiles.getProfile, {});
		if (!profile) throw new Error("Profile not found");
		
		// Determine which child to use (default to "1")
		const childId = params.childId || "1";
		
		// Get child info based on childId
		const name = childId === "1" 
			? (profile.childName || profile.childNickName?.trim())
			: (profile.child2Name || profile.child2NickName?.trim());
		const age = childId === "1" ? profile.childAge : (profile.child2Age || 0);
		const gender = childId === "1" ? profile.childGender : (profile.child2Gender || "male");
		
		// Store child name in params for searchability (remove childId from params before saving)
		const { childId: _, ...paramsWithoutChildId } = params;
		const paramsWithChildName = {
			...paramsWithoutChildId,
			childName: name || undefined,
		};
		
		// Get selected story elements
		const allowedFlavorElements = await ctx.runMutation(api.storyElementSelector.selectStoryElements, { themeName: params.theme });
		
		// Fetch structure info using the structureCode
		const structure = await ctx.runQuery(api.migration.structure.getByCode, { 
			code: allowedFlavorElements.structureCode 
		});
		if (!structure) throw new Error(`Structure "${allowedFlavorElements.structureCode}" not found`);
		
		// Create record and mark generating
		const storyId = await ctx.runMutation(api.stories._create, {title: '', params: paramsWithChildName });
		await ctx.runMutation(api.stories._markStatus, { storyId, status: "generating" });

		try {
			const client = new OpenAI({ apiKey: process.env.OPEN_AI_API! });

			// Format the story prompt using the utility function
			const formattedPrompt = formatStoryPrompt(
				allowedFlavorElements, // selectedElements
				{
					code: structure.code,
					name: structure.name,
					pattern: structure.pattern,
				}, // structureInfo
				{
					name: name || "",
					gender,
					age,
				}, // childInfo
				{
					theme: params.theme,
					lesson: params.lesson,
					language: params.language,
					length: params.length,
				} // params
			);

			const system = process.env.SYSTEM_PROMPT;
			if (!system) throw new Error("System prompt not found");

			// Use the formatted prompt as the user prompt
			const userPrompt = formattedPrompt;
			const resp = await client.chat.completions.create({
				model: "gpt-4o-mini",
				temperature: 0.7,
				messages: [
					{ role: "system", content: system },
					{ role: "user", content: userPrompt },
				],
			});
			const content =
				resp.choices?.[0]?.message?.content?.toString().trim() || "Story generation failed.";			
			// Validate scene metadata is present
			if (!content.includes("SCENE METADATA") && !/Scene \d+:/i.test(content)) {
				console.error("ERROR: Generated story missing scene metadata!");
				await ctx.runMutation(api.stories._markStatus, {
					storyId,
					status: "error",
					error: "Story generation failed: Missing scene metadata. Please try again.",
				});
				throw new Error("Generated story missing required scene metadata");
			}
			
			await ctx.runMutation(api.stories._setContent, { storyId, content });

			// Get the updated story with sceneMetadata
			const story = await ctx.runQuery(api.stories.get, { storyId });
			if (!story) throw new Error("Story not found after content set");

			// Generate images for each scene in parallel if sceneMetadata exists
			if (story.sceneMetadata && story.sceneMetadata.length > 0) {
				const childInfo = {
					name: name || "",
					gender,
					age,
				};
				const avatarStorageId = childId === "1" 
					? profile.childAvatarStorageId 
					: profile.child2AvatarStorageId;
				await generateAllSceneImages(
					ctx,
					story.sceneMetadata,
					childInfo,
					storyId,
					avatarStorageId
				);
				//   return { ok: true };
			}
			//generate voice narration
			await generateMergedNarration(ctx, {
				storyId: storyId,
				content: story.content || "",
				childName: (name || "Child").trim(),
				childGender: gender,
				language: params.language || "english",
			  });
			  console.log("Voice narration generated for story");
			
			// Update streak tracking after successful story generation
			await ctx.runMutation(api.userProfiles.updateStreak, {});
			
			return { storyId };
		} catch (err: any) {
			await ctx.runMutation(api.stories._markStatus, {
				storyId,
				status: "error",
				error: err?.message || "Unknown error",
			});
			throw err;
		}
	},
});


