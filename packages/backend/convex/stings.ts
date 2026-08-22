import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

/** Generate a one-time upload URL for Convex file storage. */
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

/** Hard-delete a sting and its associated storage file. */
export const remove = mutation({
  args: { stingId: v.id("stings") },
  handler: async (ctx, { stingId }) => {
    const sting = await ctx.db.get(stingId);
    if (!sting) return;
    try { await ctx.storage.delete(sting.filePath as Id<"_storage">); } catch { /* already gone */ }
    await ctx.db.delete(stingId);
  },
});

/** Replace the audio file for an existing sting. */
export const replace = mutation({
  args: {
    stingId: v.id("stings"),
    filePath: v.string(),
    durationSeconds: v.number(),
  },
  handler: async (ctx, { stingId, filePath, durationSeconds }) => {
    const sting = await ctx.db.get(stingId);
    if (!sting) throw new Error("Sting not found");
    try { await ctx.storage.delete(sting.filePath as Id<"_storage">); } catch { /* already gone */ }
    await ctx.db.patch(stingId, { filePath, durationSeconds });
  },
});

/** All stings with resolved storage URLs — for the admin panel. */
export const listWithUrls = query({
  args: {},
  handler: async (ctx) => {
    const stings = await ctx.db.query("stings").withIndex("by_active").order("desc").collect();
    return Promise.all(
      stings.map(async (s) => ({
        ...s,
        url: await ctx.storage.getUrl(s.filePath as Id<"_storage">),
      }))
    );
  },
});

const EMOTION_VALIDATOR = v.union(
  v.literal("happy"),      v.literal("excited"),   v.literal("curious"),
  v.literal("warm"),       v.literal("playful"),   v.literal("thoughtful"),
  v.literal("gentle"),     v.literal("naughty"),   v.literal("surprised"),
  v.literal("proud"),      v.literal("calm"),      v.literal("reassuring")
);

/** Upload a new sting to the global library. */
export const add = mutation({
  args: {
    name:            v.string(),
    filePath:        v.string(),
    emotion:         EMOTION_VALIDATOR,
    durationSeconds: v.number(),
    intensity:       v.union(v.literal("subtle"), v.literal("medium")),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("stings", {
      ...args,
      isActive:  true,
      createdAt: Date.now(),
    });
  },
});

/** Soft-delete or re-activate a sting. */
export const setActive = mutation({
  args: { stingId: v.id("stings"), isActive: v.boolean() },
  handler: async (ctx, { stingId, isActive }) => {
    await ctx.db.patch(stingId, { isActive });
  },
});

/** All active stings, optionally filtered by emotion. */
export const listActive = query({
  args: { emotion: v.optional(EMOTION_VALIDATOR) },
  handler: async (ctx, { emotion }) => {
    if (emotion) {
      return ctx.db
        .query("stings")
        .withIndex("by_emotion", (q) => q.eq("emotion", emotion).eq("isActive", true))
        .collect();
    }
    return ctx.db
      .query("stings")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
  },
});

/** All stings (active + retired), for admin UI. */
export const listAll = query({
  args: {},
  handler: async (ctx) =>
    ctx.db.query("stings").withIndex("by_active").order("desc").collect(),
});

/**
 * Resolve Convex storage URLs for a list of sting IDs.
 * Returns an array of { stingId, url } pairs. IDs whose sting no longer exists
 * or whose storage entry has expired are silently omitted.
 * Used by the story player to load sting audio files.
 */
export const getFileUrls = query({
  args: { stingIds: v.array(v.string()) },
  handler: async (ctx, { stingIds }) => {
    const results: Array<{ stingId: string; url: string }> = [];
    for (const stingId of stingIds) {
      const sting = await ctx.db.get(stingId as Id<"stings">);
      if (!sting) continue;
      const url = await ctx.storage.getUrl(sting.filePath as Id<"_storage">);
      if (url) results.push({ stingId, url });
    }
    return results;
  },
});
