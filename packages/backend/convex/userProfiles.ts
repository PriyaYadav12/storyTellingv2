import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";
import { v, GenericId } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { generateChildAvatar } from "./sceneImageGenerator";

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

export const updateChild2 = mutation({
	args: {
		child2Name: v.optional(v.string()),
		child2Age: v.optional(v.number()),
		child2Gender: v.optional(v.union(v.literal("male"), v.literal("female"), v.literal("other"))),
		child2NickName: v.optional(v.string()),
		child2FavoriteColor: v.optional(v.string()),
		child2FavoriteAnimal: v.optional(v.string()),
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

		// If child2Name is empty or undefined, clear all child2 fields
		const updateData: any = {
			updatedAt: Date.now(),
		};

		if (!args.child2Name) {
			// Clear child2 data
			updateData.child2Name = undefined;
			updateData.child2Age = undefined;
			updateData.child2Gender = undefined;
			updateData.child2NickName = undefined;
			updateData.child2FavoriteColor = undefined;
			updateData.child2FavoriteAnimal = undefined;
		} else {
			// Update with provided values
			if (args.child2Name !== undefined) updateData.child2Name = args.child2Name;
			if (args.child2Age !== undefined) updateData.child2Age = args.child2Age;
			if (args.child2Gender !== undefined) updateData.child2Gender = args.child2Gender;
			if (args.child2NickName !== undefined) updateData.child2NickName = args.child2NickName;
			if (args.child2FavoriteColor !== undefined) updateData.child2FavoriteColor = args.child2FavoriteColor;
			if (args.child2FavoriteAnimal !== undefined) updateData.child2FavoriteAnimal = args.child2FavoriteAnimal;
		}

		return await ctx.db.patch(profile._id, updateData);
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

export const generateAndStoreAvatar: ReturnType<typeof action> = action({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    // Get profile
    const profile = await ctx.runQuery(api.userProfiles.getProfile, {});
    if (!profile) {
      throw new Error("Profile not found");
    }

    // Check if avatar already exists
    if (profile.childAvatarStorageId) {
      return { avatarStorageId: profile.childAvatarStorageId, generated: false };
    }

    // Generate avatar
    const childInfo = {
      name: profile.childName || profile.childNickName || "Child",
      gender: profile.childGender,
      age: profile.childAge,
    };

    const result = await generateChildAvatar(
      ctx,
      childInfo,
      // Use the uploaded child profile picture as a reference if available
      profile.childProfilePicture
    );
    
    if (result.error || !result.avatarStorageId) {
      throw new Error(result.error || "Avatar generation failed");
    }

    // Store avatar ID in profile
    await ctx.runMutation(api.userProfiles._updateAvatarStorageId, {
      avatarStorageId: result.avatarStorageId,
    });

    return { avatarStorageId: result.avatarStorageId, generated: true };
  },
});

// Internal mutation to update avatar storage ID
export const _updateAvatarStorageId = mutation({
  args: {
    avatarStorageId: v.string(),
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
      childAvatarStorageId: args.avatarStorageId,
      updatedAt: Date.now(),
    });
  },
});

export const generateProfilePictureUploadUrl = mutation({
	args: {},
	handler: async (ctx) => {
		const user = await authComponent.getAuthUser(ctx);
		if (!user) {
			throw new Error("Not authenticated");
		}
		return await ctx.storage.generateUploadUrl();
	},
});

export const setProfilePicture = mutation({
	args: {
		storageId: v.string(),
	},
	handler: async (ctx, { storageId }) => {
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
			childProfilePicture: storageId,
			updatedAt: Date.now(),
		});
	},
});

export const getProfilePhotoUrl = query({
	args: {},
	handler: async (ctx) => {
		const user = await authComponent.getAuthUser(ctx);
		if (!user) {
			return null;
		}

		const userId = user._id as unknown as GenericId<"betterAuth:user">;
		const profile = await ctx.db
			.query("user_profiles")
			.withIndex("by_user", (q) => q.eq("userId", userId))
			.first();

		if (!profile?.childProfilePicture) {
			return null;
		}

		return await ctx.storage.getUrl(profile.childProfilePicture);
	},
});