import { mutation, query } from "../_generated/server";

export const list = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query("structures").collect();
	},
});

export const seedDefaults = mutation({
	args: {},
	handler: async (ctx) => {
		const now = Date.now();
		const defaults = [
			{
				name: "Adventure Quest",
				pattern: ["Problem", "Journey", "Challenges", "Resolution"],
				useFor: "Action stories",
			},
			{
				name: "Rule of Three",
				pattern: ["Try #1 (fail)", "Try #2 (fail)", "Try #3 (success!)"],
				useFor: "Funny stories",
			},
			{
				name: "Everyday Wonder",
				pattern: ["Familiar place", "Gentle discovery", "Cozy close"],
				useFor: "Bedtime stories",
			},
		];

		let inserted = 0;
		for (const s of defaults) {
			const existing = await ctx.db
				.query("structures")
				.withIndex("by_name", (q) => q.eq("name", s.name))
				.first();

			if (!existing) {
				await ctx.db.insert("structures", {
					...s,
					createdAt: now,
					updatedAt: now,
				});
				inserted++;
			}
		}
		return { inserted };
	},
});