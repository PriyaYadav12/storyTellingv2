import { internalMutation, query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";

// Rates live in system_config (key "cost_rates") so they can be updated from
// the admin panel without a redeploy — API pricing changes over time.
// Defaults below are Aug 2026 published rates and are only used if
// system_config hasn't been seeded yet: gemini-2.5-pro text ($1.25/$10.00
// per M input/output tokens), gemini-3.1-flash-image-preview ($0.067/call
// at 1K resolution), ElevenLabs eleven_turbo_v2_5 ($0.05/1K chars).
const DEFAULT_RATES = {
  textInputPerMillion: 1.25,
  textOutputPerMillion: 10.0,
  imagePerCall: 0.067,
  audioPerChar: 0.00005,
};

export type CostRates = typeof DEFAULT_RATES;

export async function getCostRates(ctx: { db: any }): Promise<CostRates> {
  const row = await ctx.db
    .query("system_config")
    .withIndex("by_key", (q: any) => q.eq("key", "cost_rates"))
    .first();
  if (!row) return DEFAULT_RATES;
  try {
    return { ...DEFAULT_RATES, ...JSON.parse(row.value) };
  } catch {
    return DEFAULT_RATES;
  }
}

function computeCostUSD(
  rates: CostRates,
  usage: {
    textInputTokens?: number;
    textOutputTokens?: number;
    imageGenerationCalls?: number;
    audioCharactersUsed?: number;
  }
): number {
  const text =
    ((usage.textInputTokens ?? 0) / 1_000_000) * rates.textInputPerMillion +
    ((usage.textOutputTokens ?? 0) / 1_000_000) * rates.textOutputPerMillion;
  const image = (usage.imageGenerationCalls ?? 0) * rates.imagePerCall;
  const audio = (usage.audioCharactersUsed ?? 0) * rates.audioPerChar;
  return Math.round((text + image + audio) * 1_000_000) / 1_000_000;
}

// Called by whichever phase (text/images/narration) finishes last for a
// story. Only writes estimatedCostUSD once all three usage components are
// present, so a story never gets a partial/misleadingly-low cost recorded.
export const maybeComputeFinalCost = internalMutation({
  args: { storyId: v.id("stories") },
  handler: async (ctx, { storyId }) => {
    const story = await ctx.db.get(storyId);
    if (!story) return;
    const hasText = story.textInputTokens != null && story.textOutputTokens != null;
    const hasImages = story.imageGenerationCalls != null;
    const hasAudio = story.audioCharactersUsed != null;
    if (!hasText || !hasImages || !hasAudio) return;

    const rates = await getCostRates(ctx);
    const estimatedCostUSD = computeCostUSD(rates, story);
    await ctx.db.patch(storyId, { estimatedCostUSD });
  },
});

export const getRates = query({
  args: {},
  handler: async (ctx) => getCostRates(ctx),
});

export const setRates = mutation({
  args: {
    textInputPerMillion: v.number(),
    textOutputPerMillion: v.number(),
    imagePerCall: v.number(),
    audioPerChar: v.number(),
  },
  handler: async (ctx, rates) => {
    const user = await authComponent.getAuthUser(ctx);
    const userIdentifier = (user as any)?.userId || (user as any)?._id;
    const userRole = userIdentifier
      ? await ctx.db
          .query("user_roles")
          .withIndex("by_user", (q) => q.eq("userId", userIdentifier))
          .first()
      : null;
    if (userRole?.role !== "admin") throw new Error("Admin access required");

    const existing = await ctx.db
      .query("system_config")
      .withIndex("by_key", (q) => q.eq("key", "cost_rates"))
      .first();
    const value = JSON.stringify(rates);
    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, { value, updatedAt: now });
    } else {
      await ctx.db.insert("system_config", { key: "cost_rates", value, updatedAt: now });
    }
    return { ok: true };
  },
});

// Admin dashboard: per-story cost list + aggregate totals. Only counts
// stories that have a computed cost (i.e. generated after this shipped —
// see the historical-reconstruction note in the Task C report).
export const getCostDashboard = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);
    const userIdentifier = (user as any)?.userId || (user as any)?._id;
    const userRole = userIdentifier
      ? await ctx.db
          .query("user_roles")
          .withIndex("by_user", (q) => q.eq("userId", userIdentifier))
          .first()
      : null;
    if (userRole?.role !== "admin") throw new Error("Admin access required");

    const stories = await ctx.db
      .query("stories")
      .order("desc")
      .collect();
    const withCost = stories.filter((s: any) => s.estimatedCostUSD != null);
    const totalUSD = withCost.reduce((sum: number, s: any) => sum + s.estimatedCostUSD, 0);
    const avgUSD = withCost.length > 0 ? totalUSD / withCost.length : 0;

    // Trend: total cost per calendar day (oldest first), for the stories that have cost data.
    const byDay = new Map<string, number>();
    for (const s of withCost) {
      const day = new Date(s.createdAt).toISOString().slice(0, 10);
      byDay.set(day, (byDay.get(day) ?? 0) + s.estimatedCostUSD);
    }
    const trend = Array.from(byDay.entries())
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .map(([day, costUSD]) => ({ day, costUSD }));

    return {
      totalStoriesWithCostData: withCost.length,
      totalStoriesOverall: stories.length,
      totalUSD,
      avgUSD,
      trend,
      recent: withCost.slice(0, 50).map((s: any) => ({
        storyId: s._id,
        title: s.title || s.params?.theme || "(untitled)",
        length: s.params?.length ?? "short",
        createdAt: s.createdAt,
        textInputTokens: s.textInputTokens,
        textOutputTokens: s.textOutputTokens,
        imageGenerationCalls: s.imageGenerationCalls,
        audioCharactersUsed: s.audioCharactersUsed,
        estimatedCostUSD: s.estimatedCostUSD,
      })),
    };
  },
});
