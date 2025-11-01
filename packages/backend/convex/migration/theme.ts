import { mutation, query } from "../_generated/server";

export const list = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query("themes").collect();
	},
});

export const seedDefaults = mutation({
	args: {},
	handler: async (ctx) => {
		const now = Date.now();
		const defaults = [
			{
				name: "Magical Forest",
			},
			{
				name: "Ocean Adventure",
			},
			{
				name: "Jungle Safari",
			},
		];

		let inserted = 0;
		for (const s of defaults) {
			const existing = await ctx.db
				.query("themes")
				.withIndex("by_name", (q) => q.eq("name", s.name))
				.first();

			if (!existing) {
				await ctx.db.insert("themes", {
					...s,
					createdAt: now,
				});
				inserted++;
			}
		}
		return { inserted };
	},
});