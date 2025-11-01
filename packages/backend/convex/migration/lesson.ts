import { mutation, query } from "../_generated/server";

export const list = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query("lessons").collect();
	},
});

export const seedDefaults = mutation({
	args: {},
	handler: async (ctx) => {
		const now = Date.now();
		const defaults = [
			{
				name: "Kindness",
			},
			{
				name: "Sharing",
			},
			{
				name: "Honesty",
			},
            {
                name: "Courage",
            },
            {
                name: "Teamwork",
            },
            {
                name: "Caring for Animals",
            },
            {
                name: "Respect",
            },
            {
                name: "Gratitude",
            },
            {
                name: "Friendship",
            },
            {
                name: "Helping others ",
            },
		];

		let inserted = 0;
		for (const s of defaults) {
			const existing = await ctx.db
				.query("lessons")
				.withIndex("by_name", (q) => q.eq("name", s.name))
				.first();

			if (!existing) {
				await ctx.db.insert("lessons", {
					...s,
					createdAt: now,
				});
				inserted++;
			}
		}
		return { inserted };
	},
});