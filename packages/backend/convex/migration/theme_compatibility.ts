import { mutation, query } from "../_generated/server";

export const list = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query("theme_flavor_compatibility").collect();
	},
});

export const seedDefaults = mutation({
	args: {},
	handler: async (ctx) => {
		const now = Date.now();

		// From your example map (Openings/Triggers/Obstacles)
		const OPENINGS = {
			"Ocean Adventure": ["OP_02", "OP_06", "OP_08", "OP_19"],
			"Space Journey": ["OP_05", "OP_14", "OP_18"],
			"Magical Forest": ["OP_01", "OP_03", "OP_04", "OP_13"],
			"Castle Adventure": ["OP_03","OP_04","OP_05","OP_06","OP_09","OP_14"],
			"Beach Day": ["OP_01","OP_02","OP_06","OP_07","OP_08","OP_14"],
			"Art Studio": ["OP_03","OP_09","OP_10","OP_12","OP_15"],
			"Science Lab": ["OP_06","OP_09","OP_10","OP_12","OP_14"],
			"Circus Fun": ["OP_02","OP_04","OP_07","OP_08","OP_12","OP_14"],
			"Cooking Class": ["OP_01","OP_03","OP_09","OP_10","OP_15"],
			"Nature Garden": ["OP_01","OP_03","OP_06","OP_08","OP_13","OP_14"],
		} as const;

		const TRIGGERS = {
			"Ocean Adventure": ["MT_01", "MT_03", "MT_05"],
			"Space Journey": ["MT_03", "MT_08"],
			"Magical Forest": ["MT_01", "MT_04", "MT_08"],
			"Castle Adventure": ["MT_01","MT_03","MT_04","MT_06","MT_08"],
			"Beach Day": ["MT_01","MT_03","MT_05","MT_06"],
			"Art Studio": ["MT_02","MT_05","MT_06","MT_08"],
			"Science Lab": ["MT_03","MT_05","MT_08","MT_02"],
			"Circus Fun": ["MT_02","MT_04","MT_06","MT_08"],
			"Cooking Class": ["MT_07","MT_05","MT_08"],
			"Nature Garden": ["MT_01","MT_03","MT_04"],
		} as const;

		const OBSTACLES = {
			"Ocean Adventure": ["OB_02", "OB_05", "OB_07"],
			"Space Journey": ["OB_04", "OB_06"],
			"Magical Forest": ["OB_01", "OB_04", "OB_05"],
			"Castle Adventure": ["OB_01","OB_02","OB_04","OB_06","OB_07"],
			"Beach Day": ["OB_02","OB_03","OB_06","OB_07"],
			"Art Studio": ["OB_03","OB_04","OB_06","OB_05"],
			"Science Lab": ["OB_04","OB_06","OB_07"],
			"Circus Fun": ["OB_01","OB_02","OB_03","OB_05","OB_07"],
			"Cooking Class": ["OB_04","OB_06","OB_05","OB_07"],
			"Nature Garden": ["OB_01","OB_02","OB_05","OB_07","OB_03"],
		} as const;

		// Include Payoffs and Endings too (defaulting to allowing all known codes)
		const PAYOFFS_ALL = ["PY_01","PY_02","PY_03","PY_04","PY_05","PY_06","PY_07","PY_08"];
		const ENDINGS_ALL = ["EN_01","EN_02","EN_03","EN_04","EN_05","EN_06","EN_07","EN_08","EN_09","EN_10"];

		// const THEMES = ["Ocean Adventure", "Space Journey", "Magical Forest",];
		const THEMES = await ctx.db.query("themes").collect();
		let inserted = 0;

		for (const theme of THEMES) {

			const themeName = theme.name;
			const themeId = theme._id;
			if (!themeId) {
				// Skip if theme doesn't exist yet (e.g., Space Journey not seeded)
				continue;
			}

			const toSeed: Array<{ category: "OP" | "MT" | "OB" | "PY" | "EN"; allowedCodes: string[] }> = [
				{ category: "OP", allowedCodes: [...(OPENINGS[themeName as keyof typeof OPENINGS] ?? [])] },
				{ category: "MT", allowedCodes: [...(TRIGGERS[themeName as keyof typeof TRIGGERS] ?? [])] },
				{ category: "OB", allowedCodes: [...(OBSTACLES[themeName as keyof typeof OBSTACLES] ?? [])] },
				{ category: "PY", allowedCodes: PAYOFFS_ALL },
				{ category: "EN", allowedCodes: ENDINGS_ALL },
			];

			for (const row of toSeed) {
				// Avoid duplicates for a given themeId + category
				const existing = await ctx.db
					.query("theme_flavor_compatibility")
					.withIndex("by_theme_category", (q) => q.eq("themeId", themeId).eq("category", row.category))
					.first();

				if (!existing) {
					await ctx.db.insert("theme_flavor_compatibility", {
						themeId,
						category: row.category,
						allowedCodes: row.allowedCodes,
						createdAt: now,
					});
					inserted++;
				}
			}
		}

		return { inserted };
	},
});