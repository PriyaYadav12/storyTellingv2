// TESTSERVER — shared helpers for the /testserver admin-gated staging route
// (Functional Spec v1.1). Isolated folder — delete along with the rest of
// convex/testserver/* and apps/web/src/app/testserver/* if no longer needed.

import type { GenericMutationCtx, GenericQueryCtx, GenericActionCtx } from "convex/server";
import { authComponent } from "../auth";
import { api } from "../_generated/api";
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


// v1.3 (16 Aug 2026, functional spec §13.5): the first cognitive, first
// attention, and first listening question double as the 3 in-story quick
// checks; the remaining 7 (indices 1,2,4,6,7,8,9) always appear in the Story
// Challenge. Any of these 3 left unanswered during playback rolls into the
// Challenge as an 8th/9th/10th question instead of being skipped for good.
export const QUICK_CHECK_INDICES = [0, 3, 5];

export const STARS = {
  quickCheck: 2,
  challengeComplete: 10,
  challengeBonusMax: 5,
} as const;
