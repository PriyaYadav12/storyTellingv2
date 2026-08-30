import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

const STORY_TYPES = [
  {
    code: "quest",
    name: "Quest",
    emoji: "🗺️",
    description: "A goal to reach, a puzzle to solve, or something to find, with energy ranging playful to bold.",
    promptHint: "Quest mode (external, goal-driven): a place to reach, a thing to find, or a puzzle to solve. Energy ranges playful to bold. Comedic dial is applied as a tone setting inside this structure — never as a separate unconstrained mode. Lalli leads the plan, Fafa's wild idea or gag contributes, child's observation unlocks the resolution.",
    sortOrder: 1,
  },
  {
    code: "wonder",
    name: "Wonder",
    emoji: "🌙",
    description: "Built on noticing, feeling, and connecting: calm and warm, anytime of day.",
    promptHint: "Wonder mode (internal, reflective): built on noticing, feeling, and connecting rather than external obstacles. Energy ranges calm to warm. Rich sensory detail, emotional resonance, slower pacing. Not restricted to bedtime — a parent can request a Wonder story at 4pm.",
    sortOrder: 2,
  },
];

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    let seeded = 0;
    for (const st of STORY_TYPES) {
      const existing = await ctx.db
        .query("story_types")
        .withIndex("by_code", (q) => q.eq("code", st.code))
        .first();
      if (!existing) {
        await ctx.db.insert("story_types", { ...st, isActive: true, createdAt: now, updatedAt: now });
        seeded++;
      }
    }
    return { seeded };
  },
});

/** Replace the old three-mode system (adventure/silly/cozy) with quest/wonder. Safe to run multiple times. */
export const migrate = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    let deactivated = 0;
    let upserted = 0;

    // Deactivate legacy modes
    for (const legacyCode of ["adventure", "silly", "cozy"]) {
      const rec = await ctx.db
        .query("story_types")
        .withIndex("by_code", (q) => q.eq("code", legacyCode))
        .first();
      if (rec && rec.isActive) {
        await ctx.db.patch(rec._id, { isActive: false, updatedAt: now });
        deactivated++;
      }
    }

    // Upsert quest and wonder
    for (const st of STORY_TYPES) {
      const existing = await ctx.db
        .query("story_types")
        .withIndex("by_code", (q) => q.eq("code", st.code))
        .first();
      if (!existing) {
        await ctx.db.insert("story_types", { ...st, isActive: true, createdAt: now, updatedAt: now });
        upserted++;
      } else {
        await ctx.db.patch(existing._id, { ...st, isActive: true, updatedAt: now });
        upserted++;
      }
    }

    return { deactivated, upserted };
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("story_types").collect();
    return all.filter((st) => st.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("story_types").collect();
    return all.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const update = mutation({
  args: {
    id: v.id("story_types"),
    name: v.optional(v.string()),
    emoji: v.optional(v.string()),
    description: v.optional(v.string()),
    promptHint: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, { id, ...fields }) => {
    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [k, v] of Object.entries(fields)) {
      if (v !== undefined) patch[k] = v;
    }
    await ctx.db.patch(id, patch as any);
    return { ok: true };
  },
});

export const getByCode = query({
  args: { code: v.string() },
  handler: async (ctx, { code }) => {
    return ctx.db
      .query("story_types")
      .withIndex("by_code", (q) => q.eq("code", code))
      .first();
  },
});
