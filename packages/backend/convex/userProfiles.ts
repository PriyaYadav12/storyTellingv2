import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";
import { v, GenericId } from "convex/values";

export const getProfile = query({
	args: {},
	handler: async (ctx) => {
		const user = await authComponent.getAuthUser(ctx);
		if (!user) return null;
			const userId = user._id as unknown as GenericId<"betterAuth:user">;
		if (!userId) return null;
		console.log(userId);
		return await ctx.db
			.query("user_profiles")
			.withIndex("by_user", (q) => q.eq("userId", userId))
			.first();
	},
});

export const createProfile = mutation({
	args: {
		parentName: v.string(),
		childName: v.string(),
		childAge: v.number(),
		childGender: v.union(v.literal("male"), v.literal("female"), v.literal("other")),
		childNickName: v.optional(v.string()),
		favoriteColor: v.optional(v.string()),
		favoriteAnimal: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const user = await authComponent.getAuthUser(ctx);
		if (!user) {
			throw new Error("Not authenticated");
		}
		console.log(user);
			const userId = user._id as unknown as GenericId<"betterAuth:user">;

		// Check if profile already exists
		const existingProfile = await ctx.db
			.query("user_profiles")
			.withIndex("by_user", (q) => q.eq("userId", userId))
			.first();

		if (existingProfile) {
			throw new Error("Profile already exists");
		}

		const now = Date.now();
		return await ctx.db.insert("user_profiles", {
			userId,
			...args,
			createdAt: now,
			updatedAt: now,
		});
	},
});

export const updateProfile = mutation({
	args: {
		parentName: v.string(),
		childName: v.string(),
		childAge: v.number(),
		childGender: v.union(v.literal("male"), v.literal("female"), v.literal("other")),
		childNickName: v.optional(v.string()),
		favoriteColor: v.optional(v.string()),
		favoriteAnimal: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const user = await authComponent.getAuthUser(ctx);
		if (!user) {
			throw new Error("Not authenticated");
		}

		const userId = user._id as unknown as GenericId<"betterAuth:user">;

		const profile = await ctx.db
			.query("user_profiles")
			.withIndex("by_user", (q) => q.eq("userId", userId))
			.first();

		if (!profile) {
			throw new Error("Profile not found");
		}

		return await ctx.db.patch(profile._id, {
			...args,
			updatedAt: Date.now(),
		});
	},
});

export const hasProfile = query({
	args: {},
	handler: async (ctx) => {
		try {
			const user = await authComponent.getAuthUser(ctx);
			if (!user) return false;
			
			const userId = user._id as unknown as GenericId<"betterAuth:user">;
			
			const profile = await ctx.db
				.query("user_profiles")
				.withIndex("by_user", (q) => q.eq("userId", userId))
				.first();
			
			return !!profile;
		} catch (error) {
			// If unauthenticated, return false instead of throwing
			return false;
		}
	},
});