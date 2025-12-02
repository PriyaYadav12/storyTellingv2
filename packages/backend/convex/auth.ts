import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { crossDomain } from "@convex-dev/better-auth/plugins";
import { components } from "./_generated/api";
import { DataModel, Id } from "./_generated/dataModel";
import { query, mutation } from "./_generated/server";
import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins/email-otp";
import { v } from "convex/values";

const siteUrl = process.env.SITE_URL!;

export const authComponent = createClient<DataModel>(components.betterAuth);

function createAuth(
  ctx: GenericCtx<DataModel>,
  { optionsOnly }: { optionsOnly?: boolean } = { optionsOnly: false },
) {
  return betterAuth({
    logger: {
      disabled: optionsOnly,
    },
    trustedOrigins: [siteUrl],
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    socialProviders: {
      google: {
        prompt: "select_account",
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      },
    },
    plugins: [
      crossDomain({ siteUrl }),
      convex(),
      emailOTP({
        async sendVerificationOTP({ email, otp, type }) {
          // Prefer a real email provider when available; fallback to console for development
          const resendKey = process.env.RESEND_API_KEY;
          if (resendKey) {
            try {
              // Dynamic import to avoid bundling if not configured
              const { Resend } = await import("resend");
              const resend = new Resend(resendKey);
              await resend.emails.send({
                from: "Lalli Fafa <onboarding@resend.dev>",
                to: [email],
                subject:
                  type === "forget-password"
                    ? "Reset your password"
                    : "Your verification code",
                text:
                  type === "forget-password"
                    ? `Use this code to reset your password: ${otp}\nThis code expires in 5 minutes.`
                    : `Your verification code is: ${otp}\nThis code expires in 5 minutes.`,
              });
              return;
            } catch (err) {
              // If sending fails, log and continue to console output to avoid blocking dev
              console.error("Failed to send OTP email via Resend:", err);
            }
          }
          // Dev fallback
          console.log(`[email-otp] (${type}) OTP for ${email}: ${otp}`);
        },
        otpLength: 6,
        expiresIn: 60 * 5,
      }),
    ],
  });
}

export { createAuth };

export const getCurrentUser = query({
  args: {},
  returns: v.any(),
  handler: async function (ctx, args) {
    try {
      return await authComponent.getAuthUser(ctx);
    } catch {
      // Return null instead of throwing to avoid noisy unauthenticated errors
      return null;
    }
  },
});

export const getUserRole = query({
  args: {},
  returns: v.union(v.string(), v.null()),
  handler: async function (ctx, args) {
    try {
      const user = await authComponent.getAuthUser(ctx);
      if (!user) return null;

      // Use userId or _id as the identifier
      const userIdentifier = (user as any).userId || (user as any)._id;

      // Query the user_roles table
      const userRole = await ctx.db
        .query("user_roles")
        .withIndex("by_user", (q) => q.eq("userId", userIdentifier))
        .first();

      // Return the role, defaulting to "user" if not found
      return userRole?.role ?? "user";
    } catch {
      return null;
    }
  },
});

// Set the current authenticated user's role to admin
export const setCurrentUserRole = mutation({
  args: {
    role: v.union(v.literal("admin"), v.literal("user")),
  },
  handler: async function (ctx, args) {
	console.log("Setting current user role");
    const user = await authComponent.getAuthUser(ctx);
	console.log("User:", user);
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Use the same identifier scheme as getUserRole/initializeUserRole
    const userIdentifier = (user as any).userId || (user as any)._id;
	console.log("User identifier:", userIdentifier);
    if (!userIdentifier) {
      throw new Error("User identifier not found for admin role assignment");
    }

    const existingRole = await ctx.db
      .query("user_roles")
      .withIndex("by_user", (q) => q.eq("userId", userIdentifier))
      .first();

	console.log("Existing role:", existingRole);
    const now = Date.now();

    if (existingRole) {
      // Update existing role
      await ctx.db.patch(existingRole._id, {
        role: args.role,
        updatedAt: now,
      });
    } else {
      // Create new role entry
      await ctx.db.insert("user_roles", {
        userId: userIdentifier,
        role: args.role,
        email: user.email,
        createdAt: now,
        updatedAt: now,
      });
    }

    return { success: true };
  },
});

// List all users with their profiles and roles (admin only)
export const listAllUsers = query({
  args: {},
  returns: v.array(v.any()),
  handler: async function (ctx, args) {
    // Check if user is admin
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }
    const userIdentifier = (user as any).userId || (user as any)._id;
    const userRole = await ctx.db
      .query("user_roles")
      .withIndex("by_user", (q) => q.eq("userId", userIdentifier))
      .first();
    
    if (userRole?.role !== "admin") {
      throw new Error("Admin access required");
    }

    // Start with user_roles as the base
    const allRoles = await ctx.db
      .query("user_roles")
      .collect();
    const nonAdmins = allRoles.filter(r => r.role !== "admin");
    // Get all profiles
    const allProfiles = await ctx.db
      .query("user_profiles")
      .collect();

    // Create a map of profiles by userId for quick lookup
    const profilesMap = new Map(allProfiles.map(p => [p.userId, p]));
    console.log('profilesMap:',profilesMap);
    // Build user details starting from user_roles
    const usersWithDetails = await Promise.all(nonAdmins.map(async (role) => {
      const profile = profilesMap.get(role.userId);
      console.log('profile:',profile);
      
      // Get image URLs if storage IDs exist
      const childProfilePictureUrl = profile?.childProfilePicture 
        ? await ctx.storage.getUrl(profile.childProfilePicture as Id<"_storage">)
        : null;
      const childAvatarUrl = profile?.childAvatarStorageId 
        ? await ctx.storage.getUrl(profile.childAvatarStorageId as Id<"_storage">)
        : null;
      const child2ProfilePictureUrl = profile?.child2ProfilePicture 
        ? await ctx.storage.getUrl(profile.child2ProfilePicture as Id<"_storage">)
        : null;
      const child2AvatarUrl = profile?.child2AvatarStorageId 
        ? await ctx.storage.getUrl(profile.child2AvatarStorageId as Id<"_storage">)
        : null;
      
      return {
        id: role.userId,
        email: role.email,
        name: profile?.parentName,
        createdAt: role.createdAt,
        profile: profile ? {
          childName: profile.childName,
          childNickName: profile.childNickName,
          childAge: profile.childAge,
          childGender: profile.childGender,
          favoriteColor: profile.favoriteColor,
          favoriteAnimal: profile.favoriteAnimal,
          childAvatarStorageId: profile.childAvatarStorageId,
          childProfilePicture: profile.childProfilePicture,
          childProfilePictureUrl,
          childAvatarUrl,
          child2Name: profile.child2Name,
          child2Age: profile.child2Age,
          child2Gender: profile.child2Gender,
          child2NickName: profile.child2NickName,
          child2FavoriteColor: profile.child2FavoriteColor,
          child2FavoriteAnimal: profile.child2FavoriteAnimal,
          child2AvatarStorageId: profile.child2AvatarStorageId,
          child2ProfilePicture: profile.child2ProfilePicture,
          child2ProfilePictureUrl,
          child2AvatarUrl,
          currentStreak: profile.currentStreak,
          longestStreak: profile.longestStreak,
        } : null,
      };
    }));
    
    console.log("Users with details:", usersWithDetails);
    // Sort by creation date (newest first)
    usersWithDetails.sort((a, b) => b.createdAt - a.createdAt);

    return usersWithDetails;
  },
});
