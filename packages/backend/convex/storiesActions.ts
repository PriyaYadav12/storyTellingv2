import { action } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";
import OpenAI from "openai";
import { api } from "./_generated/api";
import { formatStoryPrompt } from "./storyPromptFormatter";
import { generateAllSceneImages } from "./sceneImageGenerator";
import { generateMergedNarration } from "./narrationGenerator";

export const generateNow: ReturnType<typeof action> = action({
	args: {
		params: v.object({
			theme: v.string(),
			lesson:v.optional(v.string()),
			length: v.union(v.literal("short"), v.literal("medium"), v.literal("long")),
			language: v.optional(v.string()),
			useFavorites: v.optional(v.boolean()),
		}),
	},
	handler: async (ctx, { params }) => {
		const user = await authComponent.getAuthUser(ctx);
		if (!user) throw new Error("Not authenticated");
		// Get profile to personalize
		const profile = await ctx.runQuery(api.userProfiles.getProfile, {});
		if (!profile) throw new Error("Profile not found");
		
		// Get selected story elements
		const allowedFlavorElements = await ctx.runMutation(api.storyElementSelector.selectStoryElements, { themeName: params.theme });
		
		// Fetch structure info using the structureCode
		const structure = await ctx.runQuery(api.migration.structure.getByCode, { 
			code: allowedFlavorElements.structureCode 
		});
		if (!structure) throw new Error(`Structure "${allowedFlavorElements.structureCode}" not found`);
		
		// Create record and mark generating
		const storyId = await ctx.runMutation(api.stories._create, {title: '', params });
		await ctx.runMutation(api.stories._markStatus, { storyId, status: "generating" });

		try {
			const client = new OpenAI({ apiKey: process.env.OPEN_AI_API! });

			const name = profile.childName || profile.childNickName?.trim();
			const age = profile.childAge;
			const gender = profile.childGender;

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
				model: "gpt-4o",
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
				await generateAllSceneImages(
					ctx,
					story.sceneMetadata,
					childInfo,
					storyId,
					profile.childAvatarStorageId
				);
				//   return { ok: true };
			}
			//generate voice narration
			await generateMergedNarration(ctx, {
				storyId: storyId,
				content: story.content || "",
				childName: (profile.childName || profile.childNickName || "Child").trim(),
				childGender: profile.childGender,
			  });
			  console.log("Voice narration generated for story");
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


