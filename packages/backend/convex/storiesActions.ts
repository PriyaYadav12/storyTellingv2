import { action } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";
import OpenAI from "openai";
import { api } from "./_generated/api";

export const generateNow: ReturnType<typeof action> = action({
	args: {
		params: v.object({
			theme: v.string(),
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

		// Create record and mark generating
		const storyId = await ctx.runMutation(api.stories._create, { title: params.theme, params });
		await ctx.runMutation(api.stories._markStatus, { storyId, status: "generating" });

		try {
			const client = new OpenAI({ apiKey: process.env.OPEN_AI_API! });

			const name = profile.childNickName?.trim() || profile.childName;
			const age = profile.childAge;
			const gender = profile.childGender;
			const favColor = params.useFavorites ? profile.favoriteColor : undefined;
			const favAnimal = params.useFavorites ? profile.favoriteAnimal : undefined;

			const targetWords =
				params.length === "short" ? 300 : params.length === "medium" ? 700 : 1200;

			const system = process.env.SYSTEM_PROMPT;
			if (!system) throw new Error("System prompt not found");

			const userPrompt = `
Create a children's story in ${params.language || "English"}.
Audience: a ${age}-year-old ${gender} named ${name}.
Theme: ${params.theme}.
${favAnimal ? `Include the child's favorite animal: ${favAnimal}.` : ""}
${favColor ? `Tastefully weave in the favorite color: ${favColor}.` : ""}
Length: about ${targetWords} words.
Tone: warm, imaginative, and encouraging. End with a gentle moral aligned to the theme.
Return plain text paragraphs (no markdown).
			`.trim();

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


