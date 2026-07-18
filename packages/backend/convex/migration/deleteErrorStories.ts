import { internalMutation, internalQuery } from "../_generated/server";

// Check what statuses exist and how many stories per status
export const checkStatuses = internalQuery({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("stories").collect();
    const counts: Record<string, number> = {};
    for (const s of all) {
      counts[s.status] = (counts[s.status] ?? 0) + 1;
    }
    return { total: all.length, byStatus: counts };
  },
});

// One-shot migration: delete all incomplete stories and free their storage files.
// Targets: images_ready, text_ready, voice_ready (stuck mid-pipeline, not fully usable)
// Run with: npx convex run migration/deleteErrorStories:run
export const run = internalMutation({
  args: {},
  handler: async (ctx) => {
    const incompleteStatuses = ["error", "images_ready", "text_ready", "voice_ready"] as const;
    const errorStories = (
      await Promise.all(
        incompleteStatuses.map((status) =>
          ctx.db
            .query("stories")
            .withIndex("by_status", (q) => q.eq("status", status as any))
            .collect()
        )
      )
    ).flat();

    let deletedDocs = 0;
    let deletedFiles = 0;

    for (const story of errorStories) {
      // Delete scene images
      if (story.sceneMetadata) {
        for (const scene of story.sceneMetadata) {
          if (scene.filePath) {
            try {
              await ctx.storage.delete(scene.filePath as any);
              deletedFiles++;
            } catch {
              // Already gone
            }
          }
        }
      }

      // Delete narration audio
      if (story.narrationFilePath) {
        try {
          await ctx.storage.delete(story.narrationFilePath as any);
          deletedFiles++;
        } catch {
          // Already gone
        }
      }

      await ctx.db.delete(story._id);
      deletedDocs++;
    }

    return { deletedDocs, deletedFiles, message: `Deleted ${deletedDocs} error stories and ${deletedFiles} storage files.` };
  },
});
