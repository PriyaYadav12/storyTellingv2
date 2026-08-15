import { internalAction } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";
import { generateMergedNarration } from "../narrationGenerator";

export const generateNarration = internalAction({
  args: {
    storyId: v.id("stories"),
    child: v.object({
      name: v.string(),
      gender: v.union(v.literal("male"), v.literal("female"), v.literal("other")),
    }),
  },

  handler: async (ctx, { storyId, child }) => {
    const story = await ctx.runQuery(api.stories.getContentOnly, { storyId });
    if (!story?.content) throw new Error("Story content missing");

    const childName = child.name || "Child";
    const childGender = child.gender;

    try {
      await generateMergedNarration(ctx, {
        storyId,
        title: story.title || "",
        content: story.content,
        childName,
        childGender,
        language: story.params?.language || "english",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("[generateNarration] failed:", message);
      await ctx.runMutation(api.stories._markStatus, {
        storyId,
        status: "error",
        error: `Narration failed: ${message}`,
      });
      throw err;
    }

    await ctx.runMutation(api.stories._markStatus, {
      storyId,
      status: "voice_ready",
    });

    // If images are already done, both pipelines are complete → mark ready.
    // (If images finish after us, generateSceneImage will check narrationFilePath and mark ready.)
    const freshStory = await ctx.runQuery(api.stories.get, { storyId });
    if (freshStory?.status === "images_ready") {
      await ctx.runMutation(api.stories._markStatus, { storyId, status: "ready" });
    }

    return { ok: true };
  },
});
