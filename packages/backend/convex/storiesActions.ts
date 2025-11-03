import { action } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";
import OpenAI from "openai";
import { api } from "./_generated/api";
import { formatStoryPrompt } from "./storyPromptFormatter";
import { generateAllSceneImages } from "./sceneImageGenerator";

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
		console.log(allowedFlavorElements);
		
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
			console.log(userPrompt);
			const resp = await client.chat.completions.create({
				model: "gpt-5",
				temperature: 1,
				messages: [
					{ role: "system", content: system },
					{ role: "user", content: userPrompt },
				],
			});
			console.log(resp);
			const content =
				resp.choices?.[0]?.message?.content?.toString().trim() || "Story generation failed.";

			await ctx.runMutation(api.stories._setContent, { storyId, content });

			// Get the updated story with sceneMetadata
			const story = await ctx.runQuery(api.stories.get, { storyId });
			if (!story) throw new Error("Story not found after content set");

			// Generate images for each scene in parallel if sceneMetadata exists
			console.log("Generating images for story:", story);
			if (story.sceneMetadata && story.sceneMetadata.length > 0) {
				const childInfo = {
					name: name || "",
					gender,
					age,
				};
				console.log("Generating images for story:", story.sceneMetadata);
				console.log("Child info:", childInfo);
				console.log("Story ID:", storyId);
				await generateAllSceneImages(
					ctx,
					story.sceneMetadata,
					childInfo,
					storyId
				);
			}
			console.log("Generating images for story completed");
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


