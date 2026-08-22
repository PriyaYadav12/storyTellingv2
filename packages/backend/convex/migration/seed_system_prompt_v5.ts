import { mutation } from "../_generated/server";
import { SYSTEM_PROMPT_V5 } from "../systemPromptV5";

// Run once to push SystemPromptv5 to system_config.
// The live engine reads system_config["system_prompt"] on every call —
// this replaces v4 in place. Run from the Convex dashboard or via:
//   npx convex run migration/seed_system_prompt_v5:run
export const run = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("system_config")
      .withIndex("by_key", (q) => q.eq("key", "system_prompt"))
      .first();

    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, { value: SYSTEM_PROMPT_V5, updatedAt: now });
      return { action: "updated", version: "v5" };
    } else {
      await ctx.db.insert("system_config", {
        key: "system_prompt",
        value: SYSTEM_PROMPT_V5,
        updatedAt: now,
      });
      return { action: "created", version: "v5" };
    }
  },
});
