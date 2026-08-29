import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { crossDomain } from "@convex-dev/better-auth/plugins";
import { components, internal } from "./_generated/api";
import { DataModel, Id } from "./_generated/dataModel";
import { query, mutation, internalMutation } from "./_generated/server";
import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins/email-otp";
import { v } from "convex/values";
import { Resend } from "resend";

const siteUrl = process.env.SITE_URL!;

/* ── Email template helpers ── */
function buildWelcomeEmail(name?: string) {
  const first = name ? name.split(" ")[0] : "there";
  return `
<div style="font-family:'Nunito',Arial,sans-serif;max-width:560px;margin:0 auto;background:#fff;border-radius:20px;overflow:hidden;border:1.5px solid rgba(0,0,0,0.06)">
  <div style="background:#1a1a2e;padding:32px;text-align:center">
    <h1 style="color:#fff;font-size:26px;margin:0;font-weight:800">Lalli <span style="color:#4ecdc4">Fafa</span></h1>
    <p style="color:rgba(255,255,255,0.45);font-size:13px;margin:6px 0 0">Personalised AI stories for your little one</p>
  </div>
  <div style="padding:40px 32px">
    <h2 style="color:#1a1a2e;font-size:24px;font-weight:800;margin:0 0 8px">Hi ${first}, welcome to Lalli Fafa! 🎉</h2>
    <p style="color:#555;font-size:15px;line-height:1.7;margin:0 0 28px">
      You've just unlocked a world of magical, personalised bedtime stories for your child — starring <strong>Lalli</strong> (the curious big sister) and <strong>Fafa</strong> (her adventurous little brother).
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px">
      <tr>
        <td width="48%" style="vertical-align:top;padding:16px;background:#f5fffe;border-radius:14px;border:1px solid rgba(0,201,167,0.15)">
          <div style="font-size:26px;margin-bottom:6px">👂</div>
          <div style="font-size:13px;font-weight:800;color:#1a1a2e;margin-bottom:4px">Listening Skills</div>
          <div style="font-size:12px;color:#666;line-height:1.5">Rich narration and dialogue train children to follow stories with focus and comprehension.</div>
        </td>
        <td width="4%"></td>
        <td width="48%" style="vertical-align:top;padding:16px;background:#fffdf0;border-radius:14px;border:1px solid rgba(249,199,0,0.2)">
          <div style="font-size:26px;margin-bottom:6px">🎯</div>
          <div style="font-size:13px;font-weight:800;color:#1a1a2e;margin-bottom:4px">Attention &amp; Focus</div>
          <div style="font-size:12px;color:#666;line-height:1.5">Personalised stories featuring your child's name keep them engaged far longer than generic books.</div>
        </td>
      </tr>
      <tr><td colspan="3" style="height:12px"></td></tr>
      <tr>
        <td width="48%" style="vertical-align:top;padding:16px;background:#fdf5ff;border-radius:14px;border:1px solid rgba(160,80,200,0.12)">
          <div style="font-size:26px;margin-bottom:6px">🌈</div>
          <div style="font-size:13px;font-weight:800;color:#1a1a2e;margin-bottom:4px">Creativity</div>
          <div style="font-size:12px;color:#666;line-height:1.5">Imaginative worlds and vivid scenes spark original thinking and a lifelong love of stories.</div>
        </td>
        <td width="4%"></td>
        <td width="48%" style="vertical-align:top;padding:16px;background:#f0faff;border-radius:14px;border:1px solid rgba(0,150,220,0.12)">
          <div style="font-size:26px;margin-bottom:6px">🧠</div>
          <div style="font-size:13px;font-weight:800;color:#1a1a2e;margin-bottom:4px">Cognitive Growth</div>
          <div style="font-size:12px;color:#666;line-height:1.5">Story structure, cause-and-effect, and moral lessons strengthen memory and reasoning skills.</div>
        </td>
      </tr>
    </table>
    <p style="color:#555;font-size:14px;line-height:1.7;margin:0 0 28px">
      Children who enjoy regular story time develop <strong>vocabulary 2–3× faster</strong> and show stronger empathy. Every story is a small investment in your child's future. 💛
    </p>
    <div style="text-align:center;margin-bottom:28px">
      <a href="https://www.lallifafa.com/dashboard" style="display:inline-block;background:linear-gradient(135deg,#f9c700,#ffab00);color:#1a1a2e;text-decoration:none;font-weight:800;font-size:15px;padding:16px 40px;border-radius:50px;box-shadow:0 4px 20px rgba(249,199,0,0.35)">
        ✨ Create your first story →
      </a>
    </div>
    <p style="color:#888;font-size:13px;line-height:1.6;margin:0">Your account starts with <strong>200 free credits</strong> — enough for 2 stories to start. Short stories cost 80 credits, longer ones up to 150. Happy storytelling! 🌙</p>
  </div>
  <div style="padding:24px 32px;background:#f9f6ef;text-align:center">
    <p style="color:#aaa;font-size:11px;margin:0">© ${new Date().getFullYear()} Lalli Fafa · <a href="https://www.lallifafa.com" style="color:#4ecdc4;text-decoration:none">lallifafa.com</a></p>
  </div>
</div>`;
}

function buildWelcomeText(name?: string) {
  const first = name ? name.split(" ")[0] : "there";
  return `Hi ${first}, welcome to Lalli Fafa!\n\nYou've unlocked personalised bedtime stories for your child featuring Lalli and Fafa.\n\nOur stories help children:\n• Build listening skills through rich narration\n• Improve attention and focus with personalised content\n• Spark creativity through imaginative worlds\n• Develop cognitive abilities via story structure and moral lessons\n\nYour account starts with 200 free credits. Create your first story at https://www.lallifafa.com/dashboard\n\n— The Lalli Fafa team`;
}

export const authComponent = createClient<DataModel>(components.betterAuth);

function createAuth(
  ctx: GenericCtx<DataModel>,
  { optionsOnly }: { optionsOnly?: boolean } = { optionsOnly: false },
) {
  return betterAuth({
    baseURL: "https://www.lallifafa.com",
    logger: {
      disabled: optionsOnly,
    },
    trustedOrigins: [
      siteUrl,
      "http://localhost:3000",
      "https://story-tellingv2-web.vercel.app",
      // v2 branch alias (stable across commits on nextjs-v2)
      "https://story-tellingv2-web-git-n-8c7fbe-raj-kotharis-projects-cbc53c03.vercel.app",
      "https://www.lallifafa.com",
      "https://lallifafa.com",
    ],
    database: authComponent.adapter(ctx),
    emailVerification: {
      sendVerificationEmail: async ({ user, url }) => {
        const resendKey = process.env.RESEND_API_KEY;
        if (resendKey) {
          try {
            const resend = new Resend(resendKey);
            await resend.emails.send({
              from: "Lalli Fafa <raj@lallifafa.com>",
              to: [user.email],
              subject: "Verify your Lalli Fafa email ✨",
              html: `
                <div style="font-family:'Nunito',Arial,sans-serif;max-width:520px;margin:0 auto;background:#fffef9;border-radius:16px;overflow:hidden;border:1.5px solid rgba(0,0,0,0.06)">
                  <div style="background:#1a1a2e;padding:32px;text-align:center">
                    <h1 style="color:#fff;font-size:24px;margin:0;font-weight:800">Lalli <span style="color:#4ecdc4">Fafa</span></h1>
                    <p style="color:rgba(255,255,255,0.5);font-size:13px;margin:6px 0 0">Personalised stories for your little one</p>
                  </div>
                  <div style="padding:40px 32px">
                    <h2 style="color:#1a1a2e;font-size:22px;font-weight:800;margin:0 0 12px">Almost there! ✨</h2>
                    <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 28px">
                      Hi ${user.name?.split(" ")[0] || "there"},<br/><br/>
                      Please verify your email address to activate your Lalli Fafa account and start creating magical stories for your child.
                    </p>
                    <a href="${url}" style="display:inline-block;background:#f9c700;color:#1a1a2e;text-decoration:none;font-weight:800;font-size:15px;padding:14px 36px;border-radius:50px">
                      Verify my email →
                    </a>
                    <p style="color:#999;font-size:12px;margin:28px 0 0;line-height:1.6">
                      This link expires in 24 hours. If you didn't create a Lalli Fafa account, you can safely ignore this email.
                    </p>
                  </div>
                </div>
              `,
              text: `Hi ${user.name?.split(" ")[0] || "there"},\n\nPlease verify your Lalli Fafa email by visiting:\n${url}\n\nThis link expires in 24 hours.`,
            });
          } catch (err) {
            console.error("Failed to send verification email:", err);
          }
        } else {
          console.log(`[email-verify] Verification URL for ${user.email}: ${url}`);
        }
      },
      // OTP-at-generate (emailOTP plugin below) is the only verification path
      // now — this magic-link sender stays wired for API completeness but must
      // never fire automatically at signup, or every signup gets both this
      // email AND the OTP email.
      sendOnSignUp: false,
      // Send the welcome email only after verification is confirmed — not at
      // account creation — to avoid sending to unverified/wrong addresses.
      afterEmailVerification: async (user) => {
        const resendKey = process.env.RESEND_API_KEY;
        if (!resendKey || !user.email) return;
        try {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              from: "Lalli Fafa <raj@lallifafa.com>",
              to: [user.email],
              subject: "Welcome to Lalli Fafa — your child's story journey begins 🌙",
              html: buildWelcomeEmail(user.name ?? undefined),
              text: buildWelcomeText(user.name ?? undefined),
            }),
          });
        } catch (err) {
          console.error("Failed to send welcome email after verification:", err);
        }
      },
    },
    emailAndPassword: {
      enabled: true,
      sendResetPassword: async ({ user, url }) => {
        const resendKey = process.env.RESEND_API_KEY;
        if (resendKey) {
          try {
            const resend = new Resend(resendKey);
            await resend.emails.send({
              from: "Lalli Fafa <raj@lallifafa.com>",
              to: [user.email],
              subject: "Reset your Lalli Fafa password 🔐",
              html: `
                <div style="font-family:'Nunito',Arial,sans-serif;max-width:520px;margin:0 auto;background:#fffef9;border-radius:16px;overflow:hidden;border:1.5px solid rgba(0,0,0,0.06)">
                  <div style="background:#1a1a2e;padding:32px;text-align:center">
                    <h1 style="color:#fff;font-size:24px;margin:0;font-weight:800">Lalli <span style="color:#4ecdc4">Fafa</span></h1>
                    <p style="color:rgba(255,255,255,0.5);font-size:13px;margin:6px 0 0">Personalised stories for your little one</p>
                  </div>
                  <div style="padding:40px 32px">
                    <h2 style="color:#1a1a2e;font-size:22px;font-weight:800;margin:0 0 12px">Reset your password 🔐</h2>
                    <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 28px">
                      Hi ${user.name?.split(" ")[0] || "there"},<br/><br/>
                      We received a request to reset your Lalli Fafa password. Click the button below to choose a new one. This link expires in 1 hour.
                    </p>
                    <a href="${url}" style="display:inline-block;background:#f9c700;color:#1a1a2e;text-decoration:none;font-weight:800;font-size:15px;padding:14px 36px;border-radius:50px">
                      Reset my password →
                    </a>
                    <p style="color:#999;font-size:12px;margin:28px 0 0;line-height:1.6">
                      If you didn't request a password reset, you can safely ignore this email — your password won't change.
                    </p>
                  </div>
                </div>
              `,
              text: `Hi ${user.name?.split(" ")[0] || "there"},\n\nReset your Lalli Fafa password by visiting:\n${url}\n\nThis link expires in 1 hour. If you didn't request this, ignore this email.`,
            });
          } catch (err) {
            console.error("Failed to send password reset email:", err);
          }
        } else {
          console.log(`[password-reset] Reset URL for ${user.email}: ${url}`);
        }
      },
    },
    socialProviders: {
      google: {
        prompt: "select_account",
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      },
    },
    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            // Create a user_roles entry immediately at signup so the admin
            // tool shows all signups, not just users who completed onboarding.
            try {
              await (ctx as any).runMutation(internal.auth.initUserRoleRecord, {
                userId: user.id,
                email: user.email ?? "",
                name: user.name ?? undefined,
              });
            } catch (err) {
              console.error("Failed to initialize user role record:", err);
            }

            // Welcome email is sent via afterEmailVerification (for email+password users)
            // or at this point only for social-login users whose email is already verified.
            if (!(user as any).emailVerified) return;
            const resendKey = process.env.RESEND_API_KEY;
            if (!resendKey || !user.email) return;
            try {
              await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                  from: "Lalli Fafa <raj@lallifafa.com>",
                  to: [user.email],
                  subject: "Welcome to Lalli Fafa — your child's story journey begins 🌙",
                  html: buildWelcomeEmail(user.name ?? undefined),
                  text: buildWelcomeText(user.name ?? undefined),
                }),
              });
            } catch (err) {
              console.error("Failed to send welcome email:", err);
            }
          },
        },
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
                from: "Lalli Fafa <raj@lallifafa.com>",
                to: [email],
                subject:
                  type === "forget-password"
                    ? "Reset your password"
                    : "Your verification code",
                html: `
                  <div style="font-family:'Nunito',Arial,sans-serif;max-width:520px;margin:0 auto;background:#fffef9;border-radius:16px;overflow:hidden;border:1.5px solid rgba(0,0,0,0.06)">
                    <div style="background:#1a1a2e;padding:32px;text-align:center">
                      <h1 style="color:#fff;font-size:24px;margin:0;font-weight:800">Lalli <span style="color:#4ecdc4">Fafa</span></h1>
                      <p style="color:rgba(255,255,255,0.5);font-size:13px;margin:6px 0 0">Personalised stories for your little one</p>
                    </div>
                    <div style="padding:40px 32px;text-align:center">
                      <h2 style="color:#1a1a2e;font-size:22px;font-weight:800;margin:0 0 12px">${type === "forget-password" ? "Reset your password 🔐" : "Your verification code ✨"}</h2>
                      <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 28px">
                        ${type === "forget-password" ? "Use this code to reset your password." : "Enter this code to verify your email and continue creating your child's story."} It expires in 5 minutes.
                      </p>
                      <div style="display:inline-block;background:#fff8e1;border:1.5px dashed #f9c700;border-radius:12px;padding:16px 32px;margin:0 0 28px">
                        <span style="font-size:32px;font-weight:800;letter-spacing:8px;color:#1a1a2e">${otp}</span>
                      </div>
                      <p style="color:#999;font-size:12px;margin:0;line-height:1.6">
                        If you didn't request this, you can safely ignore this email — no changes will be made to your account.
                      </p>
                    </div>
                    <div style="background:#f5f4ef;padding:20px 32px;text-align:center">
                      <p style="color:#aaa;font-size:11px;margin:0;line-height:1.6">
                        Lalli Fafa · <a href="https://www.lallifafa.com" style="color:#aaa">lallifafa.com</a><br/>
                        Questions? Reply to this email or contact us at raj@lallifafa.com
                      </p>
                    </div>
                  </div>
                `,
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

// List all users with their profiles, credits, subscriptions, and story stats (admin only)
export const listAllUsers = query({
  args: {},
  returns: v.array(v.any()),
  handler: async function (ctx, args) {
    // Check if user is admin
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const userIdentifier = (user as any).userId || (user as any)._id;
    const userRole = await ctx.db
      .query("user_roles")
      .withIndex("by_user", (q) => q.eq("userId", userIdentifier))
      .first();
    if (userRole?.role !== "admin") throw new Error("Admin access required");

    // Fetch all supporting data in parallel
    const [allRoles, allProfiles, allCredits, allSubscriptions, allStories] = await Promise.all([
      ctx.db.query("user_roles").collect(),
      ctx.db.query("user_profiles").collect(),
      ctx.db.query("user_credits").collect(),
      ctx.db.query("user_subscriptions").collect(),
      ctx.db.query("stories").collect(),
    ]);

    const profilesMap = new Map(allProfiles.map(p => [p.userId, p]));
    const creditsMap = new Map(allCredits.map(c => [c.userId, c]));
    const rolesMap = new Map(allRoles.map(r => [r.userId, r]));

    // Build the unified user list: start from roles (non-admin), then add any
    // profiles that have NO role entry (e.g. onboarding failed mid-way).
    const nonAdminRoles = allRoles.filter(r => r.role !== "admin");
    const roleUserIds = new Set(allRoles.map(r => r.userId));
    const orphanProfiles = allProfiles.filter(p => !roleUserIds.has(p.userId));

    // Represent orphan profiles as synthetic role-like objects so we can
    // iterate a single list below.
    const syntheticEntries = orphanProfiles.map(p => ({
      userId: p.userId,
      email: "",      // no role row → no email stored there; will fall back to profile
      role: "NO_ROLE" as const,
      createdAt: p.createdAt,
    }));

    const allEntries = [...nonAdminRoles, ...syntheticEntries];

    // Keep only the most-recent subscription per user (prefer active)
    const subscriptionsMap = new Map<string, any>();
    for (const sub of allSubscriptions) {
      const prev = subscriptionsMap.get(sub.userId);
      if (!prev || sub.status === "active" || sub.createdAt > (prev.createdAt ?? 0)) {
        subscriptionsMap.set(sub.userId, sub);
      }
    }

    // Count stories and record latest story date per user.
    // Stories are stored with userId = String(user._id), but user_roles may use
    // a different identifier (user.userId). We index stories by every known alias
    // so the count is accurate regardless of which format was used at creation time.
    const storyCountMap = new Map<string, number>();
    const lastStoryMap = new Map<string, number>();

    for (const story of allStories) {
      // Normalise: try to map the story's userId to the role's userId
      const uid = story.userId;
      storyCountMap.set(uid, (storyCountMap.get(uid) ?? 0) + 1);
      const prev = lastStoryMap.get(uid);
      if (!prev || story.createdAt > prev) lastStoryMap.set(uid, story.createdAt);
    }

    const usersWithDetails = await Promise.all(allEntries.map(async (role) => {
      const profile = profilesMap.get(role.userId);

      // Resolve storage URLs
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

      const credit = creditsMap.get(role.userId);
      const subscription = subscriptionsMap.get(role.userId);

      // Story counts: try role.userId first, then profile.userId as fallback
      // (stories may have been written with a different ID format than user_roles)
      const storyUserId = role.userId;
      const storyUserIdAlt = profile?.userId;
      const storyCount =
        storyCountMap.get(storyUserId) ??
        (storyUserIdAlt ? storyCountMap.get(storyUserIdAlt) : undefined) ??
        0;
      const lastStoryAt =
        lastStoryMap.get(storyUserId) ??
        (storyUserIdAlt ? lastStoryMap.get(storyUserIdAlt) : undefined) ??
        null;

      return {
        id: role.userId,
        email: role.email || profile?.userId || "",
        name: profile?.parentName,
        role: (role as any).role ?? "user",
        createdAt: role.createdAt,
        // Credits
        credits: credit
          ? { available: credit.availableCredits, total: credit.totalCredits, used: credit.usedCredits }
          : null,
        // Subscription
        subscription: subscription
          ? { interval: subscription.interval, status: subscription.status, createdAt: subscription.createdAt }
          : null,
        // Story stats
        storyCount,
        lastStoryAt,
        // Profile
        profile: profile ? {
          parentName: profile.parentName,
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
          lastStoryDate: profile.lastStoryDate,
          city: profile.city,
          country: profile.country,
        } : null,
      };
    }));

    usersWithDetails.sort((a, b) => b.createdAt - a.createdAt);
    return usersWithDetails;
  },
});

// Admin: adjust a user's credits and optionally notify them by email
export const adminAddCredits = mutation({
  args: {
    userId: v.string(),
    userEmail: v.string(),
    credits: v.number(),  // positive = add, negative = deduct
    note: v.optional(v.string()),
    sendEmail: v.optional(v.boolean()),
  },
  returns: v.object({ success: v.boolean(), newBalance: v.number() }),
  handler: async function (ctx, { userId, userEmail, credits, note, sendEmail }) {
    // Verify admin
    const admin = await authComponent.getAuthUser(ctx);
    if (!admin) throw new Error("Not authenticated");
    const adminId = (admin as any).userId || (admin as any)._id;
    const adminRole = await ctx.db
      .query("user_roles")
      .withIndex("by_user", (q) => q.eq("userId", adminId))
      .first();
    if (adminRole?.role !== "admin") throw new Error("Admin access required");

    // Find or create credit record
    const userCredit = await ctx.db
      .query("user_credits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    let newAvailable: number;
    let newTotal: number;

    if (!userCredit) {
      newTotal = Math.max(0, credits);
      newAvailable = newTotal;
      await ctx.db.insert("user_credits", {
        userId,
        totalCredits: newTotal,
        usedCredits: 0,
        availableCredits: newAvailable,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    } else {
      newAvailable = Math.max(0, userCredit.availableCredits + credits);
      newTotal = credits > 0
        ? userCredit.totalCredits + credits
        : userCredit.totalCredits;
      await ctx.db.patch(userCredit._id, {
        totalCredits: newTotal,
        availableCredits: newAvailable,
        updatedAt: Date.now(),
      });
    }

    // Schedule credit email via internal action (mutations cannot call fetch directly)
    if (sendEmail !== false && credits > 0 && userEmail) {
      await ctx.scheduler.runAfter(0, internal.emailActions.sendCreditAddedEmail, {
        email: userEmail,
        credits,
        newBalance: newAvailable,
        note,
      });
    }

    return { success: true, newBalance: newAvailable };
  },
});

// Called immediately on account creation (via databaseHooks) so every signup
// appears in the admin tool regardless of whether the user completes onboarding.
export const initUserRoleRecord = internalMutation({
  args: { userId: v.string(), email: v.string(), name: v.optional(v.string()) },
  handler: async (ctx, { userId, email, name }) => {
    const existing = await ctx.db
      .query("user_roles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (existing) return; // idempotent
    const now = Date.now();
    await ctx.db.insert("user_roles", {
      userId,
      role: "user",
      email,
      createdAt: now,
      updatedAt: now,
    });
    // Schedule a re-engagement email for 1 hour later.
    // sendReengagementIfNeeded checks whether the user completed onboarding
    // before sending — so this is a no-op for anyone who finishes quickly.
    await ctx.scheduler.runAfter(
      60 * 60 * 1000,
      internal.emailActions.sendReengagementIfNeeded,
      { userId, email, name },
    );
  },
});
