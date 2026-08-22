"use client";

// TESTSERVER screen 1 — Onboarding and consent (Functional Spec v1.1 §5.1,
// amended per owner request 2026-08-16 to mirror the live /generate page's
// full option set and terminology — see "Onboarding v1.2 addendum" in the
// functional spec doc). Reuses the exact same Convex queries, option lists,
// fallback data, and copy as /generate; only consent capture and the child
// recap are new, additive UI on top. No existing file was modified.

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { BookOpen, Check, Globe, Loader2, Ruler, Sparkles, Zap } from "lucide-react";
import { toast } from "sonner";
import { UpgradeModal, type UpgradeTrigger } from "@/components/ui/UpgradeModal";
import {
  CARD_TINTS,
  DEFAULT_THEME_ICON,
  FALLBACK_LANGUAGES,
  FALLBACK_STORY_TYPES,
  LENGTHS,
  THEME_ICONS,
} from "./_lib/storyOptions";
import { DEFAULT_LESSON_ICON, LESSON_ICONS } from "./_lib/pillars";

const CONSENT_TEXT =
  "I'm this child's parent or guardian. I consent to Lalli Fafa generating a personalised story and Story Challenge for my child, and to receiving a weekly progress report by email.";

export default function TestServerOnboarding() {
  const router = useRouter();

  const profile = useQuery(api.userProfiles.getProfile, {});
  const credits = useQuery(api.credit.list, {});
  const lessons = useQuery(api["migration/lesson"].list, {});
  const themes = useQuery(api["migration/theme"].list, {});
  const subscription = useQuery(api.subscription.getSubscription, {});
  const dbStoryTypes = useQuery((api as any)["migration/story_types"].list, {});
  const dbLanguages = useQuery((api as any)["migration/languages"].list, {});
  const consent = useQuery(api["testserver/consent"].getLatest, {});

  const recordConsent = useMutation(api["testserver/consent"].record);
  const generateStory = useAction(api.generateStoryV2.enqueueStoryV2);

  const [storyType, setStoryType] = useState("adventure");
  const [length, setLength] = useState<"short" | "medium" | "long">("short");
  const [languageCode, setLanguageCode] = useState("en");
  const [theme, setTheme] = useState("");
  const [lesson, setLesson] = useState("");
  const [consentChecked, setConsentChecked] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [upgradeModal, setUpgradeModal] = useState<{ open: boolean; trigger: UpgradeTrigger; lockedLength?: "medium" | "long" }>({ open: false, trigger: "no_credits" });

  const isPremium = subscription?.status === "active";
  const resolvedStoryTypes = dbStoryTypes && dbStoryTypes.length > 0 ? dbStoryTypes : FALLBACK_STORY_TYPES;
  const resolvedLanguages = dbLanguages && dbLanguages.length > 0
    ? dbLanguages
    : FALLBACK_LANGUAGES;

  const hasConsentOnFile = !!consent;
  const availableCredits = credits?.[0]?.availableCredits ?? 0;
  const CREDIT_COST = LENGTHS.find((l) => l.value === length)?.credits ?? 80;
  const canAfford = availableCredits >= CREDIT_COST;
  const canGenerate = !canAfford ? true : (!!theme && !submitting);

  if (profile === undefined) {
    return <Centered><Loader2 className="animate-spin" size={28} color="var(--lf-teal)" /></Centered>;
  }

  if (profile === null) {
    return (
      <Centered>
        <span style={{ fontSize: 40 }}>👶</span>
        <p style={{ fontFamily: "'Nunito', sans-serif", color: "var(--lf-dark)", textAlign: "center", maxWidth: 300, margin: "10px 0 0" }}>
          No child profile on this account yet. Complete the real onboarding once, then come back to /testserver.
        </p>
        <Link href="/onboarding" className="btn-primary" style={{ marginTop: 14 }}>Go to onboarding</Link>
      </Centered>
    );
  }

  async function handleCreate() {
    if (!theme) {
      toast.error("Select a theme to continue");
      return;
    }
    if (!hasConsentOnFile && !consentChecked) {
      setConsentError(true);
      return;
    }
    if (!canAfford) {
      setUpgradeModal({ open: true, trigger: "no_credits" });
      return;
    }
    setSubmitting(true);
    try {
      if (!hasConsentOnFile) {
        await recordConsent({
          parentName: profile!.parentName,
          childName: profile!.childName,
          childAge: profile!.childAge,
        });
      }
      const langRecord = resolvedLanguages.find((l: any) => l.code === languageCode);
      const result = await generateStory({
        params: {
          theme,
          lesson: lesson || undefined,
          storyType,
          length,
          language: langRecord?.name ?? "English",
          childId: "1",
        },
      });
      router.push(`/testserver/generating/${result.storyId}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Couldn't start the story");
      setSubmitting(false);
    }
  }

  return (
    <div style={{ flex: 1, position: "relative", background: "linear-gradient(160deg,#FFF8E7 0%,#E6FAF6 60%,#F3EEFF 100%)" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", width: "100%", padding: "20px 20px 28px", display: "flex", flexDirection: "column", gap: 16 }}>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: 22, color: "var(--lf-dark)", margin: 0 }}>
              Let&apos;s create {profile!.childName}&apos;s story ✨
            </h1>
            <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12.5, color: "rgba(14,10,31,0.5)", margin: "2px 0 0" }}>
              For: {profile!.childName}, {profile!.childAge} years
            </p>
          </div>
          <Image src="/lf-hero.png" alt="Lalli and Fafa" width={56} height={56} className="object-contain animate-float-slow" style={{ height: 56, width: "auto", flexShrink: 0 }} priority />
        </div>

        {/* Credits — same banner as /generate */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderRadius: 16, background: "#fff", border: "1.5px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <Zap size={16} style={{ color: "#a855f7" }} />
            <span style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, color: "var(--lf-dark)", fontSize: 13 }}>{availableCredits} credits available</span>
            <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11.5, color: "rgba(45,45,45,0.4)" }}>· 80–150 credits/story</span>
          </div>
          <Link href="/pricing" style={{ fontSize: 12, fontWeight: 700, color: "var(--lf-teal)", fontFamily: "'Nunito', sans-serif" }}>Top up →</Link>
        </div>

        <Section icon={<Sparkles size={17} />} title="Story type">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {resolvedStoryTypes.map((st: any) => (
              <button
                key={st.code}
                onClick={() => setStoryType(st.code)}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 12, padding: 12, borderRadius: 16, textAlign: "left", cursor: "pointer",
                  background: storyType === st.code ? "var(--lf-dark)" : "#fff",
                  border: `2px solid ${storyType === st.code ? "var(--lf-dark)" : "rgba(0,0,0,0.08)"}`,
                  color: storyType === st.code ? "#fff" : "var(--lf-dark)",
                }}
              >
                <span style={{ fontSize: 26, lineHeight: 1, flexShrink: 0 }}>{st.emoji}</span>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: 14 }}>{st.name}</span>
                    {storyType === st.code && <Check size={13} color="var(--lf-teal)" />}
                  </div>
                  <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, opacity: storyType === st.code ? 0.8 : 0.55 }}>{st.description}</span>
                </div>
              </button>
            ))}
          </div>
        </Section>

        <Section icon={<Ruler size={17} />} title="Story length">
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {LENGTHS.map((l) => {
              const locked = l.premium && !isPremium;
              const selected = length === l.value;
              return (
                <button
                  key={l.value}
                  onClick={() => {
                    if (locked) setUpgradeModal({ open: true, trigger: "locked_length", lockedLength: l.value as "medium" | "long" });
                    else setLength(l.value);
                  }}
                  style={{
                    display: "flex", flexDirection: "column", gap: 2, padding: "10px 16px", borderRadius: 16, minWidth: 90, textAlign: "left", cursor: "pointer",
                    background: selected ? "var(--lf-dark)" : "#fff",
                    border: `2px solid ${selected ? "var(--lf-dark)" : locked ? "rgba(0,201,167,0.3)" : "rgba(0,0,0,0.08)"}`,
                    color: selected ? "#fff" : "var(--lf-dark)",
                  }}
                >
                  <span style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: 13.5 }}>{l.label}{locked ? " 🔒" : ""}</span>
                  <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11.5, opacity: 0.75 }}>{l.desc}</span>
                  <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 10.5, fontWeight: 700, color: selected || locked ? "var(--lf-teal)" : "rgba(45,45,45,0.45)" }}>
                    {locked ? "Magic Pass only ✨" : `${l.credits} credits`}
                  </span>
                </button>
              );
            })}
          </div>
        </Section>

        <Section icon={<Globe size={17} />} title="Language">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {resolvedLanguages.map((lang: any) => (
              <button
                key={lang.code}
                onClick={() => setLanguageCode(lang.code)}
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito', sans-serif",
                  background: languageCode === lang.code ? "var(--lf-teal)" : "#fff",
                  border: `1.5px solid ${languageCode === lang.code ? "var(--lf-teal)" : "rgba(0,0,0,0.1)"}`,
                  color: languageCode === lang.code ? "#fff" : "var(--lf-dark)",
                }}
              >
                <span>{lang.flag}</span><span>{lang.name}</span>
                {lang.nativeName !== lang.name && <span style={{ opacity: 0.7, fontSize: 11.5 }}>({lang.nativeName})</span>}
              </button>
            ))}
          </div>
        </Section>

        <Section icon={<Sparkles size={17} />} title="Theme *">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {(themes ?? []).map((t: { name: string }, i: number) => {
              const isSelected = theme === t.name;
              return (
                <button
                  key={t.name}
                  onClick={() => setTheme(theme === t.name ? "" : t.name)}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "10px 4px", borderRadius: 16, textAlign: "center", cursor: "pointer",
                    background: isSelected ? "var(--lf-dark)" : CARD_TINTS[i % CARD_TINTS.length],
                    border: `1.5px solid ${isSelected ? "var(--lf-dark)" : "rgba(0,0,0,0.06)"}`,
                    color: isSelected ? "#fff" : "var(--lf-dark)",
                  }}
                >
                  <span style={{ fontSize: 22, lineHeight: 1 }}>{THEME_ICONS[t.name] ?? DEFAULT_THEME_ICON}</span>
                  <span style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 11, lineHeight: 1.2 }}>{t.name}</span>
                  {isSelected && <Check size={12} color="var(--lf-teal)" />}
                </button>
              );
            })}
          </div>
          {!theme && <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11.5, color: "rgba(45,45,45,0.4)", margin: "6px 0 0" }}>Select a theme to continue</p>}
        </Section>

        <Section icon={<BookOpen size={17} />} title="Lesson (optional)">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            <button
              onClick={() => setLesson("")}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "10px 4px", borderRadius: 16, cursor: "pointer",
                background: lesson === "" ? "var(--lf-teal)" : "#fff",
                border: `1.5px solid ${lesson === "" ? "var(--lf-teal)" : "rgba(0,0,0,0.08)"}`,
                color: lesson === "" ? "#fff" : "var(--lf-dark)",
              }}
            >
              <span style={{ fontSize: 22 }}>🚫</span>
              <span style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 11 }}>None</span>
              {lesson === "" && <Check size={12} />}
            </button>
            {(lessons ?? []).map((l: { name: string }, i: number) => {
              const isSelected = lesson === l.name;
              return (
                <button
                  key={l.name}
                  onClick={() => setLesson(lesson === l.name ? "" : l.name)}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "10px 4px", borderRadius: 16, cursor: "pointer",
                    background: isSelected ? "var(--lf-teal)" : CARD_TINTS[(i + 1) % CARD_TINTS.length],
                    border: `1.5px solid ${isSelected ? "var(--lf-teal)" : "rgba(0,0,0,0.06)"}`,
                    color: isSelected ? "#fff" : "var(--lf-dark)",
                  }}
                >
                  <span style={{ fontSize: 22 }}>{LESSON_ICONS[l.name] ?? DEFAULT_LESSON_ICON}</span>
                  <span style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 11, lineHeight: 1.2 }}>{l.name}</span>
                  {isSelected && <Check size={12} />}
                </button>
              );
            })}
          </div>
        </Section>

        {/* Consent — spec-required, not present on the live /generate page */}
        {hasConsentOnFile ? (
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,201,167,0.08)", border: "1px solid rgba(0,201,167,0.2)", borderRadius: 14, padding: "10px 14px" }}>
            <Check size={14} color="var(--lf-teal)" />
            <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, color: "#00806c", margin: 0, fontWeight: 700 }}>Consent already on file for {profile!.childName}</p>
          </div>
        ) : (
          <label style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer", background: "#fff", border: "1.5px solid rgba(0,0,0,0.06)", borderRadius: 16, padding: 14 }}>
            <input
              type="checkbox"
              checked={consentChecked}
              onChange={(e) => { setConsentChecked(e.target.checked); setConsentError(false); }}
              style={{ marginTop: 3, width: 18, height: 18, flexShrink: 0, accentColor: "var(--lf-teal)" }}
            />
            <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12.5, color: "var(--lf-dark)", lineHeight: 1.5 }}>
              {CONSENT_TEXT} See our <Link href="/legal/privacy" style={{ color: "var(--lf-teal)", fontWeight: 700 }}>privacy policy</Link>.
            </span>
          </label>
        )}
        {consentError && (
          <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, color: "#e53935", margin: 0, fontWeight: 700 }}>Please confirm consent to continue.</p>
        )}

        {!canAfford && (
          <p style={{ textAlign: "center", fontFamily: "'Nunito', sans-serif", fontSize: 12.5, color: "#b83030" }}>
            Not enough credits ({availableCredits} available, {CREDIT_COST} needed). <Link href="/pricing" style={{ color: "var(--lf-teal)", fontWeight: 700 }}>Top up →</Link>
          </p>
        )}

        <button
          onClick={handleCreate}
          disabled={canAfford && !canGenerate}
          className="btn-primary"
          style={{ justifyContent: "center", width: "100%", fontSize: 15.5, padding: "0.9rem", opacity: (canAfford && !canGenerate) ? 0.45 : 1 }}
        >
          {submitting ? <><Loader2 className="animate-spin" size={17} /> Starting your story…</> : <><Sparkles size={17} /> Create our first story · {CREDIT_COST} credits</>}
        </button>
      </div>

      <UpgradeModal
        open={upgradeModal.open}
        onClose={() => setUpgradeModal((m) => ({ ...m, open: false }))}
        trigger={upgradeModal.trigger}
        lockedLength={upgradeModal.lockedLength}
        childName={profile?.childName}
      />
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>{children}</div>;
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: 16, borderRadius: 18, background: "#fff", border: "1.5px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--lf-dark)" }}>
        <span style={{ color: "var(--lf-teal)" }}>{icon}</span>
        <span style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 14 }}>{title}</span>
      </div>
      {children}
    </div>
  );
}
