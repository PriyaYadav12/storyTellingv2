"use node";
import { action } from "../_generated/server";
import { getRazorpay } from "./initiate_razorpay";
import { v, ConvexError } from "convex/values";
import { api } from "../_generated/api";
import { authComponent } from "../auth";

export const cancelRazorpaySubscription = action({
  args: { cancelAtCycleEnd: v.optional(v.boolean()) },
  handler: async (ctx, { cancelAtCycleEnd = true }) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new ConvexError("Not authenticated");

    const subscription = await ctx.runQuery(api.subscription.getSubscription, {});
    if (!subscription) throw new ConvexError("No active subscription found");
    if (subscription.status !== "active") throw new ConvexError("Subscription is not active");

    const rz = getRazorpay();
    try {
      await (rz.subscriptions as any).cancel(subscription.subscriptionId, cancelAtCycleEnd);
    } catch (err: any) {
      const msg = err?.error?.description || err?.message || "Failed to cancel subscription";
      throw new ConvexError(msg);
    }

    if (!cancelAtCycleEnd) {
      await ctx.runMutation(api.subscription.updateSubscriptionStatus, {
        subscriptionId: subscription.subscriptionId,
        status: "inactive",
      });
    }

    return { success: true, cancelAtCycleEnd };
  },
});
