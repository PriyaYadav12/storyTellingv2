// TESTSERVER — consent capture (Functional Spec v1.1 §5.1, §6.2).
// Append-only, stored separately from any profile record, exactly as spec'd.

import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { assertAdmin } from "./_shared";

export const CONSENT_TEXT_VERSION = "testserver-v1";
export const CONSENT_TEXT =
  "I'm this child's parent or guardian. I consent to Lalli Fafa generating a personalised story and Story Challenge for my child, and to receiving a weekly progress report by email.";

export const record = mutation({
  args: {
    parentName: v.string(),
    childName: v.string(),
    childAge: v.number(),
  },
  handler: async (ctx, { parentName, childName, childAge }) => {
    const { userId } = await assertAdmin(ctx);
    return await ctx.db.insert("testserver_consent", {
      userId,
      parentName,
      childName,
      childAge,
      consentTextVersion: CONSENT_TEXT_VERSION,
      method: "checkbox_click",
      createdAt: Date.now(),
    });
  },
});

// Latest consent record for the calling admin, if any — used to skip
// re-showing the consent checkbox on "New story" per spec §5.4.
export const getLatest = query({
  args: {},
  handler: async (ctx) => {
    const { userId } = await assertAdmin(ctx);
    const rows = await ctx.db
      .query("testserver_consent")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    if (rows.length === 0) return null;
    return rows.reduce((latest, r) => (r.createdAt > latest.createdAt ? r : latest));
  },
});
