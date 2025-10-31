import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	
	user_profiles: defineTable({
		userId: v.string(),
		parentName: v.string(),
		childName: v.string(),
		childNickName: v.optional(v.string()),
		childAge: v.number(),
		childGender: v.union(v.literal("male"), v.literal("female"), v.literal("other")),
		favoriteColor: v.optional(v.string()),
		favoriteAnimal: v.optional(v.string()),
		createdAt: v.number(),
		updatedAt: v.number(),
	}).index("by_user", ["userId"]),
});
