import { internalAction, internalMutation } from "../_generated/server";
import { components, internal } from "../_generated/api";
import { v } from "convex/values";

// One-shot backfill: creates a user_roles entry for every betterAuth user
// that doesn't already have one (i.e. users who signed up before the
// databaseHooks fix was deployed and never completed onboarding).
//
// Run with:  npx convex run migration/backfillUserRoles:run
export const run = internalAction({
  args: {},
  handler: async (ctx) => {
    let cursor: string | null = null;
    let totalUsers = 0;
    let created = 0;
    let skipped = 0;

    do {
      const result: any = await ctx.runQuery(
        (components.betterAuth as any).adapter.findMany,
        { model: "user", paginationOpts: { numItems: 100, cursor } },
      );

      for (const user of result.page as any[]) {
        totalUsers++;
        const userId: string = user._id ?? user.id ?? "";
        const email: string = user.email ?? "";
        if (!userId) { skipped++; continue; }

        const wasCreated: boolean = await ctx.runMutation(
          internal.migration.backfillUserRoles.createRoleIfMissing,
          { userId, email },
        );
        if (wasCreated) created++; else skipped++;
      }

      cursor = result.isDone ? null : (result.continueCursor ?? null);
    } while (cursor !== null);

    return { totalUsers, created, skipped, message: `Done — ${created} created, ${skipped} already had a role.` };
  },
});

export const createRoleIfMissing = internalMutation({
  args: { userId: v.string(), email: v.string() },
  handler: async (ctx, { userId, email }) => {
    const existing = await ctx.db
      .query("user_roles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (existing) return false;
    await ctx.db.insert("user_roles", {
      userId,
      role: "user",
      email,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return true;
  },
});
