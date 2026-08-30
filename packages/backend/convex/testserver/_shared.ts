// TESTSERVER — shared helpers for the /testserver admin-gated staging route
// (Functional Spec v1.1). Isolated folder — delete along with the rest of
// convex/testserver/* and apps/web/src/app/testserver/* if no longer needed.

import type { GenericMutationCtx, GenericQueryCtx, GenericActionCtx } from "convex/server";
import { authComponent } from "../auth";
import { api } from "../_generated/api";
import { query } from "../_generated/server";
export {
  PILLARS,
  PILLAR_LABELS,
  CHALLENGE_PILLAR_PLAN,
  type Pillar,
} from "../pillars";

/**
 * Admin check for query/mutation contexts — mirrors the pattern already used
 * across auth.ts (listAllUsers, adminAddCredits): authenticated + a
 * user_roles row with role "admin".
 */
export async function assertAdmin(
  ctx: GenericQueryCtx<any> | GenericMutationCtx<any>
): Promise<{ userId: string; email: string }> {
  const user = await authComponent.getAuthUser(ctx as any);
  if (!user) throw new Error("Not authenticated");
  const userId = String((user as any).userId || (user as any)._id);

  const role = await ctx.db
    .query("user_roles")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .first();
  if (role?.role !== "admin") throw new Error("Admin access required");

  return { userId, email: String((user as any).email || "") };
}

/**
 * Same check for action contexts, which have no direct db access — routes
 * through the existing public api.auth.getUserRole query instead.
 */
export async function assertAdminInAction(
  ctx: GenericActionCtx<any>
): Promise<{ userId: string; email: string }> {
  const user = await authComponent.getAuthUser(ctx as any);
  if (!user) throw new Error("Not authenticated");
  const role = await ctx.runQuery(api.auth.getUserRole, {});
  if (role !== "admin") throw new Error("Admin access required");
  const userId = String((user as any).userId || (user as any)._id);
  return { userId, email: String((user as any).email || "") };
}

// ─── Story Challenge staged rollout (Phase 5) ──────────────────────────────
//
// Story Challenge is promoted to production but gated behind an allowlist
// stored at system_config key "challenge_rollout_emails" (a JSON array of
// lowercased emails), so it can be verified on real accounts one at a time
// before opening to everyone. Admins always pass (dev/testing convenience,
// same as before promotion). Widen the rollout by adding emails to that
// array via systemConfig.set — no redeploy needed.
const CHALLENGE_ROLLOUT_KEY = "challenge_rollout_emails";

function parseRolloutEmails(raw: string | undefined): Set<string> {
  if (!raw) return new Set();
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.map((e: unknown) => String(e).trim().toLowerCase()).filter(Boolean));
  } catch {
    return new Set();
  }
}

/** Query/mutation contexts: direct db read of the rollout allowlist. */
export async function assertChallengeAccess(
  ctx: GenericQueryCtx<any> | GenericMutationCtx<any>
): Promise<{ userId: string; email: string; isAdmin: boolean }> {
  const user = await authComponent.getAuthUser(ctx as any);
  if (!user) throw new Error("Not authenticated");
  const userId = String((user as any).userId || (user as any)._id);
  const email = String((user as any).email || "").trim().toLowerCase();

  const role = await ctx.db
    .query("user_roles")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .first();
  const isAdmin = role?.role === "admin";
  if (isAdmin) return { userId, email, isAdmin: true };

  const config = await ctx.db
    .query("system_config")
    .withIndex("by_key", (q: any) => q.eq("key", CHALLENGE_ROLLOUT_KEY))
    .first();
  if (!parseRolloutEmails(config?.value).has(email)) {
    throw new Error("Story Challenge is not yet available on this account");
  }
  return { userId, email, isAdmin: false };
}

/** Action contexts: no direct db access, routes through public queries. */
export async function assertChallengeAccessInAction(
  ctx: GenericActionCtx<any>
): Promise<{ userId: string; email: string; isAdmin: boolean }> {
  const user = await authComponent.getAuthUser(ctx as any);
  if (!user) throw new Error("Not authenticated");
  const userId = String((user as any).userId || (user as any)._id);
  const email = String((user as any).email || "").trim().toLowerCase();

  const role = await ctx.runQuery(api.auth.getUserRole, {});
  if (role === "admin") return { userId, email, isAdmin: true };

  const config = await ctx.runQuery(api.systemConfig.get, { key: CHALLENGE_ROLLOUT_KEY });
  if (!parseRolloutEmails(config?.value).has(email)) {
    throw new Error("Story Challenge is not yet available on this account");
  }
  return { userId, email, isAdmin: false };
}

/** Client-side-safe check (no db access needed) — used by production UI to
 * decide whether to show the Story Challenge entry point at all. */
export const isChallengeRolloutEnabled = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx as any);
    if (!user) return false;
    const userId = String((user as any).userId || (user as any)._id);
    const email = String((user as any).email || "").trim().toLowerCase();
    const role = await ctx.db
      .query("user_roles")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .first();
    if (role?.role === "admin") return true;
    const config = await ctx.db
      .query("system_config")
      .withIndex("by_key", (q: any) => q.eq("key", CHALLENGE_ROLLOUT_KEY))
      .first();
    return parseRolloutEmails(config?.value).has(email);
  },
});


// v1.3 (16 Aug 2026, functional spec §13.5): the first cognitive, first
// attention, and first listening question double as the 3 in-story quick
// checks; the remaining 7 (indices 1,2,4,6,7,8,9) always appear in the Story
// Challenge. Any of these 3 left unanswered during playback rolls into the
// Challenge as an 8th/9th/10th question instead of being skipped for good.
// Default quick-check indices for the 3-2-2-3 (quick story) distribution:
// index 0 = first cognitive, index 3 = first attention, index 5 = first listening.
// generateChallenge recomputes these from config; this constant is kept as the
// legacy fallback for any existing challenge rows that pre-date v2.1.
export const QUICK_CHECK_INDICES = [0, 3, 5];

// STARS removed in v2.1 — star values are now config-driven via ChallengeConfigV1
// in system_config. Do not add them back here.
