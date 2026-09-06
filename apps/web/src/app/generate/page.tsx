"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import {
  Sparkles,
  ChevronLeft,
  User,
  Zap,
  BookOpen,
  Globe,
  Loader2,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { UserPill } from "@/components/layout/UserPill";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { trackStoryGenerated, trackUpgradeClick } from "@/lib/analytics";
import { UpgradeModal, type UpgradeTrigger } from "@/components/ui/UpgradeModal";
import { authClient } from "@/lib/auth-client";
import { PILLAR_ORDER, PILLAR_EMOJI, PILLAR_LABELS_SHORT, PILLAR_COLORS } from "../testserver/_lib/pillars";

const OTP_RESEND_COOLDOWN = 60;

const THEME_ICONS: Record<string, string> = {
  "Magical Forest": "🌳",
  "Ocean Adventure": "🌊",
  "Space Journey": "🚀",
  "Space Adventure": "🚀",
  "Jungle Safari": "🐘",
  "Mountain Quest": "⛰️",
  "Dinosaurs Park": "🦕",
  "Dinosaur Park": "🦕",
  "Birthday Party": "🎂",
  "Circus Fun": "🎪",
  "Desert Trek": "🏜️",
  "Treasure Hunt": "🗺️",
  "Festival Night": "🎉",
  "Underwater City": "🐠",
  "Village Fair": "🎡",
  "School Day Adventure": "🎒",
  "Camping Trip": "🏕️",
};
const DEFAULT_THEME_ICON = "✨";

const LESSON_ICONS: Record<string, string> = {
  Kindness: "💖",
  Sharing: "🤝",
  Honesty: "🌟",
  Courage: "🦁",
  Teamwork: "🙌",
  "Caring for Nature": "🌱",
  Respect: "🙏",
  Gratitude: "💛",
  Friendship: "👫",
  Perseverance: "💪",
  Creativity: "🎨",
  Responsibility: "✅",
};
const DEFAULT_LESSON_ICON = "📖";

// Every story is Short now (~3 min read) — Medium/Long removed entirely.
const SHORT_STORY_CREDITS = 80;

// Subtle pastel backgrounds cycled across unselected cards for a bit of color variety.
const CARD_TINTS = ["#FFF4E0", "#E6FAF6", "#F3EEFF", "#FFE8EC", "#E8F5E9", "#FFF9DB"];

const LF_BORDER_IDLE = "#c9b99a";

// Shared "premium" card surface — a soft warm gradient + deeper shadow
// instead of flat white, used across every Section/strip/bar on this page.
const SURFACE_BG = "linear-gradient(180deg,#FFFFFF 0%,#FFFAF0 100%)";
const SURFACE_BORDER = "1.5px solid rgba(201,185,154,0.3)";
const SURFACE_SHADOW = "0 6px 20px rgba(80,60,20,0.07), 0 1px 3px rgba(0,0,0,0.04)";

function CheckBadge() {
  return (
    <div style={{ position: "absolute", top: 6, right: 6, width: 18, height: 18,
      borderRadius: "50%", background: "var(--lf-teal)", display: "flex",
      alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Check size={11} color="#fff" strokeWidth={3} />
    </div>
  );
}

export default function GeneratePage() {
  const { isAuthenticated } = useConvexAuth();

  return (
    <>
      <AuthLoading>
        <FullPageSpinner />
      </AuthLoading>
      <Unauthenticated>
        <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--lf-cream)" }}>
          <div className="text-center flex flex-col gap-4">
            <p style={{ color: "var(--lf-dark)", fontFamily: "'Nunito', sans-serif" }}>Please sign in to continue.</p>
            <Link href="/sign-in" className="btn-primary" style={{ justifyContent: "center" }}>Sign in</Link>
          </div>
        </div>
      </Unauthenticated>
      <Authenticated>
        <Suspense>
          <GenerateForm isAuthenticated={isAuthenticated} />
        </Suspense>
      </Authenticated>
    </>
  );
}

function GenerateForm({ isAuthenticated }: { isAuthenticated: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefilledTheme = searchParams.get("theme") ?? "";

  const profile = useQuery(api.userProfiles.getProfile, isAuthenticated ? {} : "skip");
  const credits = useQuery(api.credit.list, isAuthenticated ? {} : "skip");
  const themes = useQuery(api["migration/theme"].list, isAuthenticated ? {} : "skip");
  const lessons = useQuery(api["migration/lesson"].list, isAuthenticated ? {} : "skip");
  // Story types and languages from DB so admin panel toggles (isActive) control what users see.
  const dbStoryTypes = useQuery((api as any)["migration/story_types"].list, isAuthenticated ? {} : "skip");
  const dbLanguages = useQuery((api as any)["migration/languages"].list, isAuthenticated ? {} : "skip");

  // Redirect to onboarding if user has no profile yet
  useEffect(() => {
    if (profile === null) router.replace("/onboarding");
  }, [profile, router]);

  const generateStory = useAction(api.generateStoryV2.enqueueStoryV2);

  const availableCredits = credits?.[0]?.availableCredits ?? 0;
  const hasSecondChild = !!(profile as { child2Name?: string } | null | undefined)?.child2Name;

  const [childId, setChildId] = useState<"1" | "2">("1");
  const [storyType, setStoryType] = useState<string>("quest");
  // Only one story length exists now — Medium/Long (previously a Magic Pass
  // paywall differentiator) are gone from this page entirely, not just hidden.
  const length = "short" as const;
  const [languageCode, setLanguageCode] = useState<string>("en");
  const [theme, setTheme] = useState(prefilledTheme);
  const [lesson, setLesson] = useState("");
  const [generating, setGenerating] = useState(false);
  const [upgradeModal, setUpgradeModal] = useState<{ open: boolean; trigger: UpgradeTrigger }>({ open: false, trigger: "no_credits" });

  const { data: session } = authClient.useSession();
  const [otpModal, setOtpModal] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpCooldown, setOtpCooldown] = useState(0);

  useEffect(() => {
    if (otpCooldown <= 0) return;
    const t = setInterval(() => setOtpCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [otpCooldown]);

  const CREDIT_COST = SHORT_STORY_CREDITS;
  const canAfford = availableCredits >= CREDIT_COST;
  // If the user can't afford the story, the button is always clickable to open the upgrade modal.
  // If they can afford it, the button requires a theme and no in-progress generation.
  const canGenerate = !canAfford ? true : (!!theme && !generating);
  const childName = (childId === "1" ? profile?.childName : (profile as any)?.child2Name) ?? undefined;

  async function doGenerate() {
    setGenerating(true);
    try {
      const langRecord = resolvedLanguages.find((l: any) => l.code === languageCode);
      const languageName = langRecord?.name ?? "English";
      const result = await generateStory({
        params: {
          theme,
          lesson: lesson || undefined,
          storyType,
          length,
          language: languageName,
          childId: hasSecondChild ? childId : undefined,
        },
      });
      trackStoryGenerated({
        theme,
        language: languageName === "Hindi" ? "Hindi" : "English",
        length,
      });
      router.push(`/story/${result.storyId}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Story generation failed. Please try again.";
      toast.error(msg);
      setGenerating(false);
    }
  }

  async function handleGenerate() {
    if (!theme || generating) return;
    if (!canAfford) {
      setUpgradeModal({ open: true, trigger: "no_credits" });
      return;
    }
    if (!session?.user?.emailVerified) {
      const email = session?.user?.email ?? "";
      setOtpError("");
      setOtpValue("");
      setOtpSending(true);
      try {
        await authClient.emailOtp.sendVerificationOtp({ email, type: "email-verification" });
        setOtpCooldown(OTP_RESEND_COOLDOWN);
        setOtpModal(true);
      } catch {
        toast.error("Couldn't send verification code — please try again.");
      } finally {
        setOtpSending(false);
      }
      return;
    }
    await doGenerate();
  }

  async function handleVerifyOtp() {
    const email = session?.user?.email ?? "";
    setOtpError("");
    setOtpVerifying(true);
    try {
      const res = await authClient.emailOtp.verifyEmail({ email, otp: otpValue });
      if (res.error) {
        setOtpError(res.error.message ?? "Invalid code — please try again.");
        setOtpVerifying(false);
        return;
      }
      setOtpModal(false);
      await doGenerate();
    } catch {
      setOtpError("Verification failed — please try again.");
      setOtpVerifying(false);
    }
  }

  async function handleResendOtp() {
    if (otpCooldown > 0) return;
    const email = session?.user?.email ?? "";
    setOtpError("");
    try {
      await authClient.emailOtp.sendVerificationOtp({ email, type: "email-verification" });
      setOtpCooldown(OTP_RESEND_COOLDOWN);
    } catch {
      toast.error("Couldn't resend — please try again.");
    }
  }

  // Fallback story types if DB not yet seeded (matches Section G: Quest + Wonder only)
  const FALLBACK_STORY_TYPES = [
    { code: "quest",  name: "Quest",   emoji: "🗺️", description: "A goal to reach, a puzzle to solve, or something to find — energy ranges playful to bold." },
    { code: "wonder", name: "Wonder",  emoji: "🌙", description: "Built on noticing, feeling, and connecting — calm and warm, anytime of day." },
  ];
  const FALLBACK_LANGUAGES = [
    { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
    { code: "hi", name: "Hindi", nativeName: "हिंदी", flag: "🇮🇳" },
    // Regional languages hidden until proper voice IDs are configured per language.
    // Re-enable from Admin → Languages when ready.
    { code: "bn", name: "Bengali", nativeName: "বাংলা", flag: "🇧🇩" },
    { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", flag: "🇮🇳" },
    { code: "ta", name: "Tamil", nativeName: "தமிழ்", flag: "🇮🇳" },
    { code: "mr", name: "Marathi", nativeName: "मराठी", flag: "🇮🇳" },
    { code: "te", name: "Telugu", nativeName: "తెలుగు", flag: "🇮🇳" },
  ];

  const resolvedStoryTypes = (dbStoryTypes && dbStoryTypes.length > 0) ? dbStoryTypes : FALLBACK_STORY_TYPES;
  // Use DB list (respects isActive toggle from admin panel); fall back to EN+HI only if DB is empty or loading.
  const resolvedLanguages = (dbLanguages && dbLanguages.length > 0)
    ? dbLanguages
    : FALLBACK_LANGUAGES.filter((l: any) => l.code === "en" || l.code === "hi");

  const isLoading =
    profile === undefined ||
    themes === undefined ||
    lessons === undefined ||
    credits === undefined;

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg,#FFF8E7 0%,#E6FAF6 60%,#F3EEFF 100%)" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-6 py-3"
        style={{ background: "rgba(14,12,26,0.97)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.07)", height: 62 }}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <div className="relative" style={{ width: 44, height: 44 }}>
            <Image src="/lf-logo.png" alt="Lalli Fafa" fill className="object-contain" />
          </div>
          <span style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "#fff" }}>
            Lalli <span style={{ color: "var(--lf-teal)" }}>Fafa</span>
          </span>
        </Link>
        <nav className="flex items-center gap-2">
          {/* Hidden on mobile: overflowed the header ~32px on narrow
              screens (the bottom nav's Create/Library tabs already cover
              this navigation there), which corrupted the fixed bottom
              nav's rendering on real phones until a scroll forced a repaint. */}
          <Link href="/dashboard" className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all hover:bg-white/10" style={{ color: "rgba(255,255,255,0.6)", fontFamily: "'Nunito', sans-serif" }}>
            <ChevronLeft size={15} /> Dashboard
          </Link>
          <UserPill variant="dark" />
        </nav>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10 pb-24 md:pb-10 flex flex-col gap-8">
        {/* Page title */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,4vw,2.4rem)", color: "var(--lf-dark)" }}>
              Create a new story ✨
            </h1>
            <p style={{ color: "rgba(45,45,45,0.55)", fontFamily: "'Nunito', sans-serif", fontSize: "1rem" }}>
              Pick your options below — your personalised story is ready in seconds.
            </p>
          </div>
          <div className="relative flex-shrink-0 hidden sm:block" style={{ width: 64, height: 64 }}>
            <Image src="/lf-hero.png" alt="Lalli Fafa" fill className="object-contain" style={{ filter: "drop-shadow(0 4px 12px rgba(0,201,167,0.3))" }} />
          </div>
        </div>

        {/* Every story builds these 4 skills — reinforces the app's core value
            right where a parent decides to create one. */}
        <PillarStrip />

        {/* Credits */}
        <div className="flex items-center justify-between px-5 py-3 rounded-2xl" style={{ background: SURFACE_BG, border: SURFACE_BORDER, boxShadow: SURFACE_SHADOW }}>
          <div className="flex items-center gap-2 flex-wrap">
            <Zap size={18} style={{ color: "var(--lf-electric)" }} />
            <span style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 600, color: "var(--lf-dark)", fontSize: "0.9rem" }}>
              {isLoading ? "—" : availableCredits} credits available
            </span>
            <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: "0.78rem", color: "rgba(45,45,45,0.4)" }}>
              · {SHORT_STORY_CREDITS} credits/story
            </span>
          </div>
          {!isLoading && availableCredits < 120 && (
            <Link
              href="/pricing"
              onClick={() => trackUpgradeClick("monthly", "generate_credits_banner")}
              className="text-xs font-semibold"
              style={{ color: "var(--lf-teal)", fontFamily: "'Nunito', sans-serif" }}
            >
              Top up →
            </Link>
          )}
        </div>

        {isLoading ? (
          <FullPageSpinner />
        ) : (
          <div className="flex flex-col gap-6">

            {/* Child selector */}
            {hasSecondChild && (
              <Section icon={<User size={18} />} title="Which child?">
                <div className="flex gap-3">
                  {(["1", "2"] as const).map((id, i) => {
                    const name = id === "1" ? profile?.childName : (profile as { child2Name?: string })?.child2Name;
                    return (
                      <OptionButton
                        key={id}
                        selected={childId === id}
                        onClick={() => setChildId(id)}
                        label={name ?? `Child ${id}`}
                        tint={CARD_TINTS[i % CARD_TINTS.length]}
                      />
                    );
                  })}
                </div>
              </Section>
            )}

            {/* Story type + Language — merged into one section (was two full
                cards for two simple choices; Story length used to sit
                between them but is gone now that every story is Short). */}
            <Section icon={<Sparkles size={18} />} title="Story type & language">
              <div className="flex flex-col gap-2.5">
                {resolvedStoryTypes.map((st: any, i: number) => (
                  <button
                    key={st.code}
                    onClick={() => setStoryType(st.code)}
                    className="flex items-center gap-3 p-3 rounded-2xl text-left transition-all"
                    style={{
                      position: "relative",
                      background: CARD_TINTS[i % CARD_TINTS.length],
                      border: `2px solid ${storyType === st.code ? "var(--lf-teal)" : LF_BORDER_IDLE}`,
                      color: "var(--lf-dark)",
                      overflow: "hidden",
                    }}
                  >
                    <span style={{ fontSize: "1.6rem", flexShrink: 0, lineHeight: 1 }}>{st.emoji}</span>
                    <div className="flex flex-col gap-0.5 flex-1">
                      <span style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: "0.95rem" }}>
                        {st.name}
                      </span>
                      <span style={{
                        fontFamily: "'Nunito', sans-serif",
                        fontSize: "0.8rem",
                        opacity: 0.55,
                      }}>
                        {st.description}
                      </span>
                    </div>
                    {i === 0 && <CharacterPortrait src="/Lalli-new.png" height={96} />}
                    {i === 1 && <CharacterPortrait src="/Fafa_1.jpg" height={96} />}
                    {storyType === st.code && <CheckBadge />}
                  </button>
                ))}
              </div>

              <div style={{ height: 1, background: "rgba(0,0,0,0.06)", margin: "2px 0" }} />

              <div className="flex items-center gap-2 flex-wrap">
                <Globe size={15} style={{ color: "rgba(45,45,45,0.4)", flexShrink: 0 }} />
                {resolvedLanguages.map((lang: any, i: number) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguageCode(lang.code)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all"
                    style={{
                      background: CARD_TINTS[i % CARD_TINTS.length],
                      border: `2px solid ${languageCode === lang.code ? "var(--lf-teal)" : LF_BORDER_IDLE}`,
                      color: "var(--lf-dark)",
                      fontFamily: "'Nunito', sans-serif",
                    }}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                    {lang.nativeName !== lang.name && (
                      <span style={{ opacity: 0.7, fontSize: "0.78rem" }}>({lang.nativeName})</span>
                    )}
                    {languageCode === lang.code && <Check size={13} style={{ color: "var(--lf-teal)" }} />}
                  </button>
                ))}
              </div>
            </Section>

            {/* Theme */}
            <Section icon={<Sparkles size={18} />} title="Theme *">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {(themes ?? []).map((t: { name: string }, i: number) => {
                  const isSelected = theme === t.name;
                  return (
                    <button
                      key={t.name}
                      onClick={() => setTheme(theme === t.name ? "" : t.name)}
                      className="flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl text-center transition-all"
                      style={{
                        position: "relative",
                        background: CARD_TINTS[i % CARD_TINTS.length],
                        border: `2px solid ${isSelected ? "var(--lf-teal)" : LF_BORDER_IDLE}`,
                        color: "var(--lf-dark)",
                      }}
                    >
                      <span style={{ fontSize: "1.4rem", lineHeight: 1 }}>
                        {THEME_ICONS[t.name] ?? DEFAULT_THEME_ICON}
                      </span>
                      <span style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: "0.76rem", lineHeight: 1.2 }}>
                        {t.name}
                      </span>
                      {isSelected && <CheckBadge />}
                    </button>
                  );
                })}
              </div>
              {!theme && (
                <p className="text-xs mt-1" style={{ color: "rgba(45,45,45,0.4)", fontFamily: "'Nunito', sans-serif" }}>
                  Select a theme to continue
                </p>
              )}
            </Section>

            {/* Lesson — no explicit "None" card: tap a lesson to select it,
                tap again to deselect. Keeps the grid even (matches the
                Theme grid's card count/rhythm) and every card the same size. */}
            <Section icon={<BookOpen size={18} />} title="Lesson (optional)">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {(lessons ?? []).map((l: { name: string }, i: number) => {
                  const isSelected = lesson === l.name;
                  return (
                    <button
                      key={l.name}
                      onClick={() => setLesson(lesson === l.name ? "" : l.name)}
                      className="flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl text-center transition-all"
                      style={{
                        position: "relative",
                        background: CARD_TINTS[i % CARD_TINTS.length],
                        border: `2px solid ${isSelected ? "var(--lf-teal)" : LF_BORDER_IDLE}`,
                        color: "var(--lf-dark)",
                      }}
                    >
                      <span style={{ fontSize: "1.4rem", lineHeight: 1 }}>
                        {LESSON_ICONS[l.name] ?? DEFAULT_LESSON_ICON}
                      </span>
                      <span style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: "0.76rem", lineHeight: 1.2 }}>
                        {l.name}
                      </span>
                      {isSelected && <CheckBadge />}
                    </button>
                  );
                })}
              </div>
            </Section>

            {/* Generate button */}
            {availableCredits <= 0 ? (
              <div className="flex flex-col gap-3 items-center py-6 px-6 rounded-2xl" style={{ background: "rgba(255,100,60,0.06)", border: "1.5px solid rgba(255,100,60,0.2)" }}>
                <p style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 600, color: "#b83030", textAlign: "center", fontSize: "0.95rem" }}>
                  You&apos;re out of credits. Top up to generate stories!
                </p>
                <Link
                  href="/pricing"
                  onClick={() => trackUpgradeClick("monthly", "generate_out_of_credits")}
                  className="btn-primary"
                  style={{ justifyContent: "center" }}
                >
                  <Zap size={16} /> View plans
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {!canAfford && (
                  <p className="text-sm text-center" style={{ color: "#b83030", fontFamily: "'Nunito', sans-serif" }}>
                    Not enough credits ({availableCredits} available, {CREDIT_COST} needed).{" "}
                    <Link
                      href="/pricing"
                      onClick={() => trackUpgradeClick("monthly", "generate_insufficient_credits")}
                      style={{ color: "var(--lf-teal)", fontWeight: 600 }}
                    >
                      Top up →
                    </Link>
                  </p>
                )}
                <button
                  onClick={handleGenerate}
                  disabled={(canAfford && !canGenerate) || otpSending}
                  className="btn-primary w-full justify-center transition-all hover:scale-[1.02] active:scale-95"
                  style={{
                    background: "linear-gradient(135deg,#f9c700,#e6ac00)",
                    fontSize: "1.1rem",
                    padding: "1.15rem",
                    boxShadow: (canGenerate && !otpSending) ? "0 6px 24px rgba(249,199,0,0.45)" : "none",
                    opacity: (canGenerate && !otpSending) ? 1 : 0.45,
                    cursor: (canGenerate && !otpSending) ? "pointer" : "not-allowed",
                  }}
                >
                  {generating ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Starting your story…
                    </>
                  ) : otpSending ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Sending code…
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Generate story · {CREDIT_COST} credits
                    </>
                  )}
                </button>
                {generating && (
                  <p className="text-center text-sm" style={{ color: "rgba(45,45,45,0.5)", fontFamily: "'Nunito', sans-serif" }}>
                    Opening your story… ✨
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <UpgradeModal
        open={upgradeModal.open}
        onClose={() => setUpgradeModal((m) => ({ ...m, open: false }))}
        trigger={upgradeModal.trigger}
        childName={childName}
      />

      {/* OTP verification modal */}
      {otpModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(19,16,32,0.72)", backdropFilter: "blur(4px)" }}
        >
          <div
            className="w-full flex flex-col gap-5 rounded-3xl p-8"
            style={{ maxWidth: 420, background: "#FFF8E7", boxShadow: "0 20px 60px rgba(0,0,0,0.35)" }}
          >
            <div className="flex flex-col gap-1 text-center">
              <h2 style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: "1.5rem", color: "var(--lf-dark)" }}>
                Verify your email
              </h2>
              <p style={{ fontSize: "0.9rem", color: "rgba(45,45,45,0.6)", lineHeight: 1.6 }}>
                We sent a 6-digit code to <strong style={{ color: "var(--lf-dark)" }}>{session?.user?.email}</strong>. Enter it below to generate your story.
              </p>
            </div>

            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={otpValue}
              onChange={(e) => { setOtpValue(e.target.value.replace(/\D/g, "").slice(0, 6)); setOtpError(""); }}
              disabled={otpVerifying}
              className="w-full text-center outline-none rounded-2xl"
              style={{
                fontSize: "2rem",
                fontWeight: 800,
                letterSpacing: "0.35em",
                padding: "0.75rem 1rem",
                background: "#fff",
                border: `2px solid ${otpError ? "#e53935" : "var(--lf-teal)"}`,
                color: "var(--lf-dark)",
                fontFamily: "'Nunito', sans-serif",
              }}
            />

            {otpError && (
              <p style={{ fontSize: "0.82rem", color: "#e53935", textAlign: "center", marginTop: -8 }}>{otpError}</p>
            )}

            <button
              onClick={handleVerifyOtp}
              disabled={otpVerifying || otpValue.length < 6}
              className="btn-primary justify-center"
              style={{
                fontSize: "1rem",
                padding: "0.85rem",
                opacity: otpValue.length < 6 ? 0.55 : 1,
                cursor: otpValue.length < 6 ? "default" : "pointer",
              }}
            >
              {otpVerifying ? <Loader2 size={18} className="animate-spin" /> : null}
              {otpVerifying ? "Verifying…" : "Verify & generate story"}
            </button>

            <div className="flex items-center justify-between" style={{ fontSize: "0.82rem" }}>
              <button
                onClick={handleResendOtp}
                disabled={otpCooldown > 0}
                style={{
                  background: "none",
                  border: "none",
                  color: otpCooldown > 0 ? "rgba(45,45,45,0.35)" : "var(--lf-teal)",
                  cursor: otpCooldown > 0 ? "default" : "pointer",
                  fontWeight: 700,
                  fontFamily: "'Nunito', sans-serif",
                  padding: 0,
                  fontSize: "inherit",
                }}
              >
                {otpCooldown > 0 ? `Resend in ${otpCooldown}s` : "Resend code"}
              </button>
              <button
                onClick={() => setOtpModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "rgba(45,45,45,0.4)",
                  cursor: "pointer",
                  fontFamily: "'Nunito', sans-serif",
                  padding: 0,
                  fontSize: "inherit",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <MobileBottomNav />
    </div>
  );
}

/* ── Small helpers ── */

function PillarStrip() {
  return (
    <div className="rounded-2xl p-4" style={{ position: "relative", background: SURFACE_BG, border: SURFACE_BORDER, boxShadow: SURFACE_SHADOW }}>
      <div className="flex items-start justify-between">
        <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: "0.7rem", fontWeight: 800, color: "rgba(45,45,45,0.45)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 10px" }}>
          Every story builds
        </p>
        <div className="relative flex-shrink-0" style={{ width: 64, height: 82, marginTop: -36 }}>
          <Image src="/lf-hero.png" alt="Lalli and Fafa" fill className="object-contain" style={{ objectPosition: "top", filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.15))" }} />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {PILLAR_ORDER.map((p) => (
          <div key={p} className="flex flex-col items-center gap-1 text-center">
            <div
              style={{
                width: 38, height: 38, borderRadius: "50%",
                background: `${PILLAR_COLORS[p]}1a`,
                border: `1.5px solid ${PILLAR_COLORS[p]}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.1rem", flexShrink: 0,
              }}
            >
              {PILLAR_EMOJI[p]}
            </div>
            <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: "0.64rem", fontWeight: 800, color: PILLAR_COLORS[p], lineHeight: 1.2 }}>
              {PILLAR_LABELS_SHORT[p]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Solo character portraits — reuses the same standalone Lalli/Fafa cutouts
// already live on the Results screen (CharacterAvatar there), rather than
// trying to crop one character out of the two-kid lf-hero.png duo shot.
// Lalli-new.png (waving, energetic) pairs with Quest; Fafa_1.jpg (calm,
// hugging his bunny) pairs with Wonder — the poses already carry the right
// personality contrast between the two story types.
function CharacterPortrait({ src, height }: { src: string; height: number }) {
  return (
    <div className="relative flex-shrink-0" style={{ width: Math.round(height * 0.667), height, borderRadius: 10, overflow: "hidden", background: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,0.12)" }}>
      <Image src={src} alt="" fill style={{ objectFit: "contain" }} />
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 p-5 rounded-2xl" style={{ background: SURFACE_BG, border: SURFACE_BORDER, boxShadow: SURFACE_SHADOW }}>
      <div className="flex items-center gap-2.5" style={{ color: "var(--lf-dark)" }}>
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(0,201,167,0.12)", color: "var(--lf-teal)" }}
        >
          {icon}
        </div>
        <span style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: "0.95rem" }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function OptionButton({ selected, onClick, label, tint }: { selected: boolean; onClick: () => void; label: React.ReactNode; tint?: string }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-semibold transition-all"
      style={{
        background: tint ?? "#fff",
        border: `2px solid ${selected ? "var(--lf-teal)" : LF_BORDER_IDLE}`,
        color: "var(--lf-dark)",
        fontFamily: "'Nunito', sans-serif",
        fontSize: "0.9rem",
      }}
    >
      {selected && <Check size={14} style={{ color: "var(--lf-teal)" }} />}
      {label}
    </button>
  );
}

function FullPageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(160deg,#FFF8E7 0%,#E6FAF6 60%,#F3EEFF 100%)" }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: "var(--lf-teal)", borderTopColor: "transparent" }} />
        <p style={{ color: "var(--lf-dark)", fontFamily: "'Nunito', sans-serif", opacity: 0.6 }}>Loading…</p>
      </div>
    </div>
  );
}
