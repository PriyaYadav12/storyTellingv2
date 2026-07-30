import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) return [];
    const userId = String(user._id);
    const rows = await ctx.db
      .query("story_favourites")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    return rows.map((r) => r.storyId as string);
  },
});

export const toggle = mutation({
  args: { storyId: v.id("stories") },
  handler: async (ctx, { storyId }) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const userId = String(user._id);
    const existing = await ctx.db
      .query("story_favourites")
      .withIndex("by_user_story", (q) => q.eq("userId", userId).eq("storyId", storyId))
      .first();
    if (existing) {
      await ctx.db.delete(existing._id);
      return false;
    } else {
      await ctx.db.insert("story_favourites", { userId, storyId });
      return true;
    }
  },
});
