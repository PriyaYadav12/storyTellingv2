"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  useQuery,
  useAction,
  useConvexAuth,
  AuthLoading,
  Authenticated,
  Unauthenticated,
} from "convex/react";
import { api } from "../../../convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import { UserPill } from "@/components/layout/UserPill";
import {
  BookOpen,
  Sparkles,
  Flame,
  Star,
  User,
  Library,
  ChevronRight,
  Zap,
  Loader2,
  Plus,
  Play,
} from "lucide-react";
import { toast } from "sonner";

/* ── Theme → scene image map ── */
const THEME_IMAGES: Record<string, string> = {
  adventure: "/lf-scene-jungle.png",
  friendship: "/lf-scene-balloons.png",
  courage: "/lf-scene-kite.png",
  kindness: "/lf-scene-puppy.png",
  bedtime: "/lf-scene-bedtime.png",
  space: "/lf-scene-planets.png",
  nature: "/lf-scene-orchard.png",
  culture: "/lf-scene-krishna.png",
  india: "/lf-scene-redfort.png",
  mythology: "/lf-scene-ganesha.png",
  animals: "/lf-scene-puppy.png",
  games: "/lf-scene-boardgame.png",
  travel: "/lf-scene-street.png",
};

function getSceneForTheme(theme?: string): string {
  if (!theme) return "/lf-scene-orchard.png";
  const key = theme.toLowerCase();
  for (const [k, v] of Object.entries(THEME_IMAGES)) {
    if (key.includes(k)) return v;
  }
  const all = Object.values(THEME_IMAGES);
  return all[Math.abs(theme.charCodeAt(0)) % all.length];
}

/* ── Stat card colours ── */
const STAT_COLORS = [
  { bg: "linear-gradient(135deg,#00c9a7 0%,#00a38d 100%)", icon: "rgba(255,255,255,0.3)", text: "#fff" },
  { bg: "linear-gradient(135deg,#ff6b35 0%,#e84e1b 100%)", icon: "rgba(255,255,255,0.3)", text: "#fff" },
  { bg: "linear-gradient(135deg,#f9c700 0%,#e6ac00 100%)", icon: "rgba(255,255,255,0.3)", text: "#fff" },
  { bg: "linear-gradient(135deg,#a855f7 0%,#8b2cf5 100%)", icon: "rgba(255,255,255,0.3)", text: "#fff" },
];

/* ── Floating sparkle decoration ── */
function FloatingSparkle({ style }: { style: React.CSSProperties }) {
  return (
    <div className="absolute pointer-events-none select-none" style={{ fontSize: "1.2rem", animation: "float 3s ease-in-out infinite", ...style }}>
      ✨
    </div>
  );
}

/* ================================================================
   MAIN PAGE
   ================================================================ */
export default function DashboardPage() {
  const { isAuthenticated } = useConvexAuth();

  return (
    <>
      <style>{`
        @keyframes float {
          0%,100%{transform:translateY(0px) rotate(0deg);}
          33%{transform:translateY(-8px) rotate(5deg);}
          66%{transform:translateY(-4px) rotate(-3deg);}
        }
        @keyframes pulse-glow {
          0%,100%{box-shadow:0 0 0 0 rgba(0,201,167,0.4);}
          50%{box-shadow:0 0 0 12px rgba(0,201,167,0);}
        }
        @keyframes shimmer {
          0%{background-position:-400px 0;}
          100%{background-position:400px 0;}
        }
        @keyframes slide-in-right {
          from{transform:translateX(100%);}
          to{transform:translateX(0);}
        }
        @keyframes fade-in {
          from{opacity:0;transform:translateY(16px);}
          to{opacity:1;transform:translateY(0);}
        }
        .stat-card{animation:fade-in 0.5s ease both;}
        .story-card{animation:fade-in 0.4s ease both;}
        .drawer-panel{animation:slide-in-right 0.35s cubic-bezier(0.34,1.2,0.64,1) both;}
        .story-img-skel{background:linear-gradient(90deg,rgba(0,0,0,0.06) 25%,rgba(0,0,0,0.1) 50%,rgba(0,0,0,0.06) 75%);background-size:400px 100%;animation:shimmer 1.4s ease-in-out infinite;}
      `}</style>

      <AuthLoading>
        <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg,#FFF8E7 0%,#E6FAF6 100%)" }}>
          <div className="flex flex-col items-center gap-4">
            <div className="relative" style={{ width: 64, height: 64 }}>
              <Image src="/lf-logo.png" alt="Lalli Fafa" fill className="object-contain animate-bounce" />
            </div>
            <p style={{ color: "var(--lf-dark)", fontFamily: "'Baloo 2', sans-serif", fontWeight: 700 }}>Loading your stories…</p>
          </div>
        </div>
      </AuthLoading>

      <Unauthenticated>
        <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg,#FFF8E7 0%,#E6FAF6 100%)" }}>
          <div className="text-center flex flex-col gap-4">
            <p style={{ color: "var(--lf-dark)", fontFamily: "'Nunito', sans-serif" }}>Please sign in to continue.</p>
            <Link href="/sign-in" className="btn-primary" style={{ justifyContent: "center" }}>Sign in</Link>
          </div>
        </div>
      </Unauthenticated>

      <Authenticated>
        <DashboardContent isAuthenticated={isAuthenticated} />
      </Authenticated>
    </>
  );
}

/* ================================================================
   DASHBOARD CONTENT
   ================================================================ */
function DashboardContent({ isAuthenticated }: { isAuthenticated: boolean }) {
  const router = useRouter();

  const { data: session } = authClient.useSession();
  const isEmailVerified = session?.user?.emailVerified ?? true; // default true so banner doesn't flash on load
  const userEmail = session?.user?.email ?? "";
  const [verifyBannerDismissed, setVerifyBannerDismissed] = useState(false);
  const [resendingVerify, setResendingVerify] = useState(false);

  async function handleResendVerification() {
    if (!userEmail) return;
    setResendingVerify(true);
    try {
      await authClient.sendVerificationEmail({ email: userEmail, callbackURL: "/dashboard" });
      toast.success("Verification email sent! Check your inbox.");
    } catch {
      toast.error("Couldn't send verification email. Please try again.");
    } finally {
      setResendingVerify(false);
    }
  }

  const profile = useQuery(api.userProfiles.getProfile, isAuthenticated ? {} : "skip");
  const hasProfile = useQuery(api.userProfiles.hasProfile, isAuthenticated ? {} : "skip");
  const stories = useQuery(api.stories.list, isAuthenticated ? {} : "skip");
  const achievementsData = useQuery(api.userProfiles.getAchievements, isAuthenticated ? {} : "skip");
  const credits = useQuery(api.credit.list, isAuthenticated ? {} : "skip");

  const userName = profile?.parentName ?? "Friend";
  const childName = profile?.childName ?? "your child";
  const availableCredits = credits?.[0]?.availableCredits ?? 0;

  const stats = useMemo(() => {
    const list = stories ?? [];
    const storiesCreated = list.length;
    const readingTime = storiesCreated * 3;
    let favoriteTheme = "Adventure";
    if (list.length > 0) {
      const counts = new Map<string, number>();
      for (const s of list) {
        const t = (s?.params?.theme as string) ?? "Adventure";
        counts.set(t, (counts.get(t) ?? 0) + 1);
      }
      let max = 0;
      for (const [t, c] of counts) {
        if (c > max) { max = c; favoriteTheme = t; }
      }
    }
    return { storiesCreated, readingTime, favoriteTheme };
  }, [stories, achievementsData]);

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/");
    toast.success("Signed out successfully");
  }


  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg,#FFF8E7 0%,#E6FAF6 50%,#F3EEFF 100%)" }}>

      {/* ── Header ── */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-5 py-3"
        style={{ background: "rgba(255,252,245,0.92)", backdropFilter: "blur(16px)", borderBottom: "1.5px solid rgba(0,0,0,0.07)", height: 72 }}
      >
        <Link href="/" className="flex items-center gap-3 flex-shrink-0">
          <div className="relative flex-shrink-0" style={{ width: 52, height: 52 }}>
            <Image src="/lf-logo.png" alt="Lalli Fafa" fill className="object-contain" priority />
          </div>
          <span style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: "1.25rem", color: "var(--lf-dark)" }}>
            Lalli <span style={{ color: "var(--lf-teal)" }}>Fafa</span>
          </span>
        </Link>

        {/* Centre nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Link href="/library" className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:bg-black/5" style={{ color: "var(--lf-dark)", fontFamily: "'Nunito', sans-serif" }}>
            <Library size={15} /> Library
          </Link>
          <Link href="/profile" className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:bg-black/5" style={{ color: "var(--lf-dark)", fontFamily: "'Nunito', sans-serif" }}>
            <User size={15} /> Profile
          </Link>
          <Link href="/checkout?plan=monthly" className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:bg-black/5" style={{ color: "var(--lf-dark)", fontFamily: "'Nunito', sans-serif" }}>
            <Zap size={15} /> Upgrade
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {/* Credits pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "linear-gradient(135deg,rgba(168,85,247,0.12),rgba(168,85,247,0.06))", border: "1.5px solid rgba(168,85,247,0.25)" }}>
            <Zap size={14} style={{ color: "#a855f7" }} />
            <span style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: "0.82rem", color: "#7c3aed" }}>
              {availableCredits} credits
            </span>
          </div>
          <UserPill variant="light" />
        </div>
      </header>

      {/* Redirect to onboarding if no profile */}
      {hasProfile === false && <OnboardingRedirect />}

      {/* Email verification banner */}
      {!isEmailVerified && !verifyBannerDismissed && session && (
        <div
          className="flex items-center justify-between gap-3 px-5 py-3"
          style={{ background: "linear-gradient(90deg,#fff8e1,#fffde7)", borderBottom: "1.5px solid rgba(249,199,0,0.4)" }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span style={{ fontSize: "1rem", flexShrink: 0 }}>📧</span>
            <p style={{ fontSize: "0.85rem", color: "#7a5800", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              Please verify your email address to secure your account.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleResendVerification}
              disabled={resendingVerify}
              style={{ background: "#f9c700", border: "none", color: "#1a1a2e", fontSize: "0.8rem", fontWeight: 700, padding: "0.35rem 1rem", borderRadius: 50, cursor: "pointer" }}
            >
              {resendingVerify ? "Sending…" : "Resend email"}
            </button>
            <button
              onClick={() => setVerifyBannerDismissed(true)}
              style={{ background: "none", border: "none", color: "rgba(122,88,0,0.5)", cursor: "pointer", padding: "0.25rem", fontSize: "1rem", lineHeight: 1 }}
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-5 py-8 flex flex-col gap-8">

        {/* ── Hero welcome banner ── */}
        <section
          className="relative overflow-hidden rounded-3xl"
          style={{
            background: "linear-gradient(135deg,#131020 0%,#1a1740 50%,#0d2d26 100%)",
            minHeight: 220,
          }}
        >
          {/* Floating sparkles */}
          <FloatingSparkle style={{ top: 20, left: "10%", animationDelay: "0s" }} />
          <FloatingSparkle style={{ top: 40, left: "25%", animationDelay: "0.8s", fontSize: "0.9rem" }} />
          <FloatingSparkle style={{ top: 15, left: "55%", animationDelay: "1.5s" }} />
          <FloatingSparkle style={{ top: 60, right: "30%", animationDelay: "0.4s", fontSize: "0.8rem" }} />
          <FloatingSparkle style={{ bottom: 30, left: "40%", animationDelay: "1.1s" }} />

          {/* Glow orbs */}
          <div className="absolute" style={{ top: -60, right: 120, width: 280, height: 280, background: "radial-gradient(circle,rgba(0,201,167,0.25) 0%,transparent 70%)", pointerEvents: "none" }} />
          <div className="absolute" style={{ bottom: -40, left: 80, width: 200, height: 200, background: "radial-gradient(circle,rgba(249,199,0,0.2) 0%,transparent 70%)", pointerEvents: "none" }} />

          <div className="relative flex flex-col md:flex-row items-center gap-6 px-8 py-8">
            {/* Text */}
            <div className="flex-1 flex flex-col gap-4">
              <div>
                <p style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 600, fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                  Welcome back 👋
                </p>
                <h1 style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: "clamp(1.7rem,3.5vw,2.4rem)", color: "#fff", lineHeight: 1.2 }}>
                  Hey {userName}!{" "}
                  <span style={{ color: "var(--lf-sunshine)" }}>{childName}</span>'s next adventure awaits.
                </h1>
              </div>
              <p style={{ fontFamily: "'Nunito', sans-serif", color: "rgba(255,255,255,0.6)", fontSize: "0.95rem", lineHeight: 1.6 }}>
                Lalli &amp; Fafa are ready to tell a brand new tale — crafted just for your little one. 🌟
              </p>
              <button
                onClick={() => router.push('/generate')}
                className="flex items-center gap-2 self-start px-7 py-3.5 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95"
                style={{
                  background: "linear-gradient(135deg,var(--lf-teal),#00a38d)",
                  color: "#fff",
                  fontFamily: "'Baloo 2', sans-serif",
                  fontSize: "1rem",
                  boxShadow: "0 4px 20px rgba(0,201,167,0.5)",
                  animation: "pulse-glow 2.5s ease-in-out infinite",
                }}
              >
                <Sparkles size={18} />
                Create a New Story
                <Plus size={16} />
              </button>
            </div>

            {/* Lalli Fafa character image */}
            <div className="relative flex-shrink-0" style={{ width: 180, height: 180 }}>
              <Image
                src="/lf-hero.png"
                alt="Lalli and Fafa"
                fill
                className="object-contain"
                style={{ filter: "drop-shadow(0 8px 24px rgba(0,201,167,0.4))" }}
              />
              {/* Name badges */}
              <div
                className="absolute flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold"
                style={{ bottom: 50, left: -10, background: "rgba(249,199,0,0.9)", color: "#131020", fontSize: "0.7rem", whiteSpace: "nowrap" }}
              >
                ⭐ Lalli · age 6
              </div>
              <div
                className="absolute flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold"
                style={{ bottom: 20, right: -10, background: "rgba(0,201,167,0.9)", color: "#fff", fontSize: "0.7rem", whiteSpace: "nowrap" }}
              >
                💙 Fafa · age 3
              </div>
            </div>
          </div>
        </section>

        {/* ── Low credits warning ── */}
        {availableCredits < 30 && availableCredits > 0 && (
          <div
            className="flex items-center justify-between p-4 rounded-2xl"
            style={{ background: "rgba(255,100,60,0.08)", border: "1.5px solid rgba(255,100,60,0.25)" }}
          >
            <div className="flex items-center gap-3">
              <Zap size={20} style={{ color: "#e84040" }} />
              <p style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 600, color: "#b83030", fontSize: "0.9rem" }}>
                Only {availableCredits} credits left — top up to keep the magic going!
              </p>
            </div>
            <Link href="/checkout?plan=monthly" className="btn-primary" style={{ padding: "0.5rem 1.2rem", fontSize: "0.85rem", flexShrink: 0 }}>
              Top up
            </Link>
          </div>
        )}

        {/* ── Stats row ── */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <BookOpen size={22} />, label: "Stories created", value: stats.storiesCreated, delay: "0s" },
            { icon: <Flame size={22} />, label: "Reading minutes", value: `${stats.readingTime}m`, delay: "0.08s" },
            { icon: <Star size={22} />, label: "Fave theme", value: stats.favoriteTheme, delay: "0.16s" },
            { icon: <Zap size={22} />, label: "Credits left", value: availableCredits, delay: "0.24s" },
          ].map((s, i) => (
            <div
              key={s.label}
              className="stat-card flex flex-col gap-3 p-5 rounded-2xl relative overflow-hidden"
              style={{ background: STAT_COLORS[i].bg, animationDelay: s.delay }}
            >
              {/* Background glow */}
              <div className="absolute top-0 right-0 w-20 h-20 rounded-full" style={{ background: STAT_COLORS[i].icon, transform: "translate(30%,-30%)" }} />
              <div style={{ color: STAT_COLORS[i].text, opacity: 0.9, position: "relative" }}>{s.icon}</div>
              <p style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: "1.7rem", color: STAT_COLORS[i].text, lineHeight: 1, position: "relative" }}>
                {s.value}
              </p>
              <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: "0.78rem", color: STAT_COLORS[i].text, opacity: 0.8, fontWeight: 600, position: "relative" }}>
                {s.label}
              </p>
            </div>
          ))}
        </section>

        {/* ── Quick actions ── */}
        <section className="grid sm:grid-cols-3 gap-4">
          <button
            onClick={() => router.push('/generate')}
            className="flex flex-col items-start gap-3 p-5 rounded-2xl text-left transition-all hover:-translate-y-1 hover:shadow-lg active:scale-98"
            style={{ background: "linear-gradient(135deg,rgba(0,201,167,0.12),rgba(0,201,167,0.06))", border: "1.5px solid rgba(0,201,167,0.35)" }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--lf-teal)" }}>
              <Sparkles size={20} color="#fff" />
            </div>
            <div>
              <p style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: "1rem", color: "var(--lf-dark)" }}>Generate Story</p>
              <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: "0.82rem", color: "rgba(45,45,45,0.55)" }}>Ready in under 2 minutes</p>
            </div>
          </button>

          <Link
            href="/library"
            className="flex flex-col items-start gap-3 p-5 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-lg"
            style={{ background: "linear-gradient(135deg,rgba(249,199,0,0.12),rgba(249,199,0,0.06))", border: "1.5px solid rgba(249,199,0,0.4)" }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#f9c700" }}>
              <Library size={20} color="#fff" />
            </div>
            <div>
              <p style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: "1rem", color: "var(--lf-dark)" }}>My Library</p>
              <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: "0.82rem", color: "rgba(45,45,45,0.55)" }}>All {stats.storiesCreated} stories</p>
            </div>
          </Link>

          <Link
            href="/profile"
            className="flex flex-col items-start gap-3 p-5 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-lg"
            style={{ background: "linear-gradient(135deg,rgba(168,85,247,0.1),rgba(168,85,247,0.05))", border: "1.5px solid rgba(168,85,247,0.3)" }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#a855f7" }}>
              <User size={20} color="#fff" />
            </div>
            <div>
              <p style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: "1rem", color: "var(--lf-dark)" }}>Child Profile</p>
              <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: "0.82rem", color: "rgba(45,45,45,0.55)" }}>Update {childName}'s info</p>
            </div>
          </Link>
        </section>

        {/* ── Recent stories ── */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: "1.3rem", color: "var(--lf-dark)" }}>
              Recent Stories 📖
            </h2>
            <Link
              href="/library"
              className="flex items-center gap-1 text-sm font-bold"
              style={{ color: "var(--lf-teal)", fontFamily: "'Nunito', sans-serif" }}
            >
              View all <ChevronRight size={15} />
            </Link>
          </div>

          {stories === undefined ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-56 rounded-2xl" style={{ background: "linear-gradient(90deg,rgba(0,0,0,0.06) 25%,rgba(0,0,0,0.1) 50%,rgba(0,0,0,0.06) 75%)", backgroundSize: "400px 100%", animation: "shimmer 1.4s ease-in-out infinite" }} />
              ))}
            </div>
          ) : stories.length === 0 ? (
            <div
              className="flex flex-col items-center gap-4 py-16 rounded-3xl relative overflow-hidden"
              style={{ background: "linear-gradient(135deg,rgba(255,193,7,0.1),rgba(0,201,167,0.08))", border: "2px dashed rgba(0,201,167,0.3)" }}
            >
              <div className="relative" style={{ width: 80, height: 80 }}>
                <Image src="/lf-hero.png" alt="Lalli Fafa" fill className="object-contain" />
              </div>
              <div className="text-center flex flex-col gap-1">
                <p style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "var(--lf-dark)" }}>
                  No stories yet!
                </p>
                <p style={{ fontFamily: "'Nunito', sans-serif", color: "rgba(45,45,45,0.5)", fontSize: "0.9rem" }}>
                  Create {childName}'s first magical story with Lalli &amp; Fafa
                </p>
              </div>
              <button
                onClick={() => router.push('/generate')}
                className="btn-primary"
                style={{ padding: "0.7rem 1.6rem" }}
              >
                <Sparkles size={16} /> Create First Story
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(stories as Array<{ _id: string; title?: string; params?: { theme?: string; language?: string }; status?: string; coverImageUrl?: string }>)
                .slice(0, 6)
                .map((story, idx) => {
                  const sceneImg = story.coverImageUrl ?? getSceneForTheme(story.params?.theme);
                  return (
                    <Link
                      key={story._id}
                      href={`/story/${story._id}`}
                      className="story-card flex flex-col rounded-2xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl group"
                      style={{ background: "#fff", border: "1.5px solid rgba(0,0,0,0.07)", animationDelay: `${idx * 0.06}s` }}
                    >
                      {/* Story scene image */}
                      <div className="relative overflow-hidden story-img-skel" style={{ height: 140 }}>
                        <Image
                          src={sceneImg}
                          alt={story.title ?? "Story"}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          style={{ objectPosition: "center 30%" }}
                        />
                        {/* Overlay gradient */}
                        <div className="absolute inset-0" style={{ background: "linear-gradient(to top,rgba(0,0,0,0.45) 0%,transparent 60%)" }} />

                        {/* Play button */}
                        <div
                          className="absolute bottom-3 right-3 w-9 h-9 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ background: "var(--lf-teal)", boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }}
                        >
                          <Play size={14} fill="#fff" color="#fff" />
                        </div>

                        {/* Status badge */}
                        {story.status === "generating" && (
                          <div
                            className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                            style={{ background: "rgba(249,199,0,0.95)", color: "#131020" }}
                          >
                            <Loader2 size={11} className="animate-spin" />
                            Generating…
                          </div>
                        )}

                        {/* Language badge */}
                        {story.params?.language && (
                          <div
                            className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-bold"
                            style={{ background: "rgba(255,255,255,0.9)", color: "var(--lf-dark)" }}
                          >
                            {story.params.language === "Hindi" ? "🇮🇳" : "🇬🇧"} {story.params.language}
                          </div>
                        )}
                      </div>

                      {/* Story info */}
                      <div className="flex flex-col gap-2 p-4">
                        <p style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: "0.95rem", color: "var(--lf-dark)", lineHeight: 1.3 }}>
                          {story.title ?? "Untitled Story"}
                        </p>
                        {story.params?.theme && (
                          <span
                            className="self-start px-2.5 py-0.5 rounded-full text-xs font-semibold"
                            style={{ background: "rgba(0,201,167,0.1)", color: "var(--lf-teal)" }}
                          >
                            {story.params.theme}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
            </div>
          )}
        </section>

        {/* ── Scenes strip — decorative ── */}
        <section
          className="rounded-3xl overflow-hidden relative"
          style={{ background: "linear-gradient(135deg,#131020 0%,#1a1740 100%)", padding: "24px 28px" }}
        >
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex -space-x-4">
              {["/lf-scene-jungle.png", "/lf-scene-balloons.png", "/lf-scene-kite.png", "/lf-scene-planets.png"].map((src, i) => (
                <div
                  key={i}
                  className="relative rounded-2xl overflow-hidden border-2 flex-shrink-0"
                  style={{ width: 56, height: 56, borderColor: "rgba(255,255,255,0.2)", zIndex: 4 - i }}
                >
                  <Image src={src} alt="" fill className="object-cover" style={{ objectPosition: "center 30%" }} />
                </div>
              ))}
              <div
                className="relative rounded-2xl flex-shrink-0 flex items-center justify-center text-white font-bold text-sm border-2"
                style={{ width: 56, height: 56, background: "var(--lf-teal)", borderColor: "rgba(255,255,255,0.2)", zIndex: 0 }}
              >
                +8
              </div>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <p style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "#fff" }}>
                12 stunning adventure worlds to explore
              </p>
              <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: "0.85rem", color: "rgba(255,255,255,0.55)", marginTop: 4 }}>
                Each story features unique AI illustrations tailored to your child
              </p>
            </div>
            <button
              onClick={() => router.push('/generate')}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold flex-shrink-0 transition-all hover:scale-105"
              style={{ background: "var(--lf-sunshine)", color: "#131020", fontFamily: "'Baloo 2', sans-serif", fontSize: "0.9rem" }}
            >
              <Sparkles size={16} /> Create Story
            </button>
          </div>
        </section>

      </main>

    </div>
  );
}

/* ── Onboarding redirect ── */
function OnboardingRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/onboarding"); }, [router]);
  return null;
}
