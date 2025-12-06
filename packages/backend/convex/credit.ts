import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";

export const list = query({
    args: {},
    handler: async (ctx) => {
        const user = await authComponent.getAuthUser(ctx);
        if (!user) return [];
        const userId = String(user._id);
        const docs = await ctx.db
            .query("user_credits")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .order("desc")
            .collect();
        return docs;
    },
});

export const _updateCredit = mutation({
    args: {
        creditId: v.id("user_credits"),
        usedCredits: v.number(),
    },
    handler: async (ctx, { creditId, usedCredits }) => {
        //calculate available credits
        const userCredit = await ctx.db.get(creditId);
        if (!userCredit) return { success: false, error: "User credit not found" };
        const availableCredits = userCredit.availableCredits - usedCredits;
        await ctx.db.patch(creditId, { usedCredits, availableCredits, updatedAt: Date.now() });
        return { success: true };
    },
});

export const _createCredit = mutation({
    args: {},
    handler: async (ctx) => {
        const user = await authComponent.getAuthUser(ctx);
        if (!user) {
            throw new Error("Not authenticated");
        }
        const userId = String(user._id);
        await ctx.db.insert("user_credits", { userId, totalCredits: 250, usedCredits: 0, availableCredits: 250, createdAt: Date.now(), updatedAt: Date.now() });
        return { success: true };
    },
});