import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { crossDomain } from "@convex-dev/better-auth/plugins";
import { components } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";
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
								subject: type === "forget-password" ? "Reset your password" : "Your verification code",
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
			const userIdentifier = user.userId || user._id;
			
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

// Create or update a user's role (admin only or for initial setup)
export const setUserRole = mutation({
	args: {
		userId: v.string(),
		role: v.union(v.literal("user"), v.literal("admin")),
	},
	handler: async function (ctx, args) {
		// Check if role already exists
		const existingRole = await ctx.db
			.query("user_roles")
			.withIndex("by_user", (q) => q.eq("userId", args.userId))
			.first();
		
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
				userId: args.userId,
				role: args.role,
				createdAt: now,
				updatedAt: now,
			});
		}
		
		return { success: true };
	},
});

// Initialize role for new users (call this after user signup)
export const initializeUserRole = mutation({
	args: {},
	handler: async function (ctx, args) {
		const user = await authComponent.getAuthUser(ctx);
		if (!user) {
			throw new Error("User not authenticated");
		}
		
		// Use userId or _id as the identifier
		const userIdentifier = user.userId || user._id;
		
		// Check if role already exists
		const existingRole = await ctx.db
			.query("user_roles")
			.withIndex("by_user", (q) => q.eq("userId", userIdentifier))
			.first();
		
		if (!existingRole) {
			const now = Date.now();
			await ctx.db.insert("user_roles", {
				userId: userIdentifier,
				role: "user",
				createdAt: now,
				updatedAt: now,
			});
		}
		
		return { success: true };
	},
});
