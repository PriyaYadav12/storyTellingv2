import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/** Fetch the N most recent story_memory records for a child, newest first. */
export const getRecentForChild = query({
  args: {
    profileId: v.id("user_profiles"),
    childId:   v.union(v.literal("1"), v.literal("2")),
    limit:     v.optional(v.number()),
  },
  handler: async (ctx, { profileId, childId, limit }) => {
    const records = await ctx.db
      .query("story_memory")
      .withIndex("by_profile_child", (q) =>
        q.eq("profileId", profileId).eq("childId", childId)
      )
      .order("desc")
      .take(limit ?? 8);
    return records;
  },
});

/** Write a story_memory record after a successful v2 generation. */
export const create = mutation({
  args: {
    storyId:   v.id("stories"),
    userId:    v.string(),
    profileId: v.id("user_profiles"),
    childId:   v.union(v.literal("1"), v.literal("2")),
    mode:      v.union(v.literal("quest"), v.literal("wonder")),
    primaryPillar: v.union(
      v.literal("listening"),
      v.literal("attention"),
      v.literal("emotional"),
      v.literal("cognitive")
    ),
    secondaryPillar: v.optional(v.union(
      v.literal("listening"),
      v.literal("attention"),
      v.literal("emotional"),
      v.literal("cognitive")
    )),
    structureShape: v.string(),
    storyLength: v.union(v.literal("quick"), v.literal("big")),
    endingType:    v.optional(v.string()),
    worldVariety: v.optional(v.object({
      time:        v.string(),
      location:    v.string(),
      environment: v.string(),
    })),
    preferenceRoles: v.optional(v.object({
      favoriteAnimal: v.optional(v.union(
        v.literal("primary"), v.literal("secondary"),
        v.literal("background"), v.literal("omitted")
      )),
      favoriteColor: v.optional(v.union(
        v.literal("primary"), v.literal("secondary"),
        v.literal("background"), v.literal("omitted")
      )),
    })),
    resolvedBy: v.optional(v.union(
      v.literal("child"), v.literal("lalli"), v.literal("fafa")
    )),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("story_memory", {
      ...args,
      createdAt: Date.now(),
    });
  },
});
