import { query } from "./_generated/server";
import { v } from "convex/values";

// Read-only aggregate stats for the standalone analytics dashboard
// (../../../analytics-dashboard). Guarded by a shared secret rather than user
// auth since it's called server-to-server, not from the browser.
// Set the secret with: npx convex env set ADMIN_STATS_SECRET <value>
// and put the same value in analytics-dashboard/.env.local as CONVEX_ADMIN_SECRET.
function assertAuthorized(secret: string) {
	const expected = process.env.ADMIN_STATS_SECRET;
	if (!expected || secret !== expected) {
		throw new Error("Unauthorized");
	}
}

function dayKey(ms: number): string {
	return new Date(ms).toISOString().slice(0, 10);
}

export const getDashboardStats = query({
	args: {
		secret: v.string(),
		rangeStart: v.string(), // YYYY-MM-DD
		rangeEnd: v.string(), // YYYY-MM-DD
	},
	handler: async (ctx, { secret, rangeStart, rangeEnd }) => {
		assertAuthorized(secret);

		const rangeStartMs = new Date(`${rangeStart}T00:00:00.000Z`).getTime();
		const rangeEndMs = new Date(`${rangeEnd}T23:59:59.999Z`).getTime();

		const [profiles, stories, subscriptions, plans] = await Promise.all([
			ctx.db.query("user_profiles").collect(),
			ctx.db.query("stories").collect(),
			ctx.db.query("user_subscriptions").collect(),
			ctx.db.query("razorpay_plans").collect(),
		]);

		const totalUsers = profiles.length;
		const totalStories = stories.length;
		const activeSubs = subscriptions.filter((s) => s.status === "active");
		const activeSubscriptions = activeSubs.length;

		const planPriceById = new Map(plans.map((p) => [p.planId, p]));
		const mrr = activeSubs.reduce((sum, s) => {
			const plan = planPriceById.get(s.planId);
			const price = plan?.price ?? s.price ?? 0;
			const interval = plan?.interval ?? s.interval;
			return sum + (interval === "yearly" ? price / 12 : price);
		}, 0);

		const statusCounts = new Map<string, number>();
		const languageCounts = new Map<string, number>();
		const themeCounts = new Map<string, number>();
		for (const story of stories) {
			statusCounts.set(story.status, (statusCounts.get(story.status) ?? 0) + 1);
			const language = story.params?.language ?? "unknown";
			languageCounts.set(language, (languageCounts.get(language) ?? 0) + 1);
			const theme = story.params?.theme ?? "unknown";
			themeCounts.set(theme, (themeCounts.get(theme) ?? 0) + 1);
		}

		const dailyMap = new Map<string, { newUsers: number; storiesGenerated: number; newSubscriptions: number }>();
		const ensureDay = (key: string) => {
			if (!dailyMap.has(key)) dailyMap.set(key, { newUsers: 0, storiesGenerated: 0, newSubscriptions: 0 });
			return dailyMap.get(key)!;
		};
		for (const p of profiles) {
			if (p.createdAt >= rangeStartMs && p.createdAt <= rangeEndMs) {
				ensureDay(dayKey(p.createdAt)).newUsers += 1;
			}
		}
		for (const s of stories) {
			if (s.createdAt >= rangeStartMs && s.createdAt <= rangeEndMs) {
				ensureDay(dayKey(s.createdAt)).storiesGenerated += 1;
			}
		}
		for (const sub of subscriptions) {
			if (sub.createdAt >= rangeStartMs && sub.createdAt <= rangeEndMs) {
				ensureDay(dayKey(sub.createdAt)).newSubscriptions += 1;
			}
		}
		const daily = Array.from(dailyMap.entries())
			.map(([date, v]) => ({ date, ...v }))
			.sort((a, b) => a.date.localeCompare(b.date));

		const planBreakdown = new Map<string, { count: number; revenue: number }>();
		planBreakdown.set("Free", { count: totalUsers - activeSubscriptions, revenue: 0 });
		for (const s of activeSubs) {
			const plan = planPriceById.get(s.planId);
			const label = plan?.name ?? s.planId;
			const price = plan?.price ?? s.price ?? 0;
			const entry = planBreakdown.get(label) ?? { count: 0, revenue: 0 };
			entry.count += 1;
			entry.revenue += price;
			planBreakdown.set(label, entry);
		}

		return {
			totalUsers,
			totalStories,
			activeSubscriptions,
			mrr: Math.round(mrr),
			storiesByStatus: Array.from(statusCounts.entries()).map(([status, count]) => ({ status, count })),
			storiesByLanguage: Array.from(languageCounts.entries()).map(([language, count]) => ({ language, count })),
			storiesByTheme: Array.from(themeCounts.entries()).map(([theme, count]) => ({ theme, count })),
			daily,
			planBreakdown: Array.from(planBreakdown.entries()).map(([plan, v]) => ({ plan, ...v })),
		};
	},
});
