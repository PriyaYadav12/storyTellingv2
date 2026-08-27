"use client";

// TESTSERVER screen 6 — Results (Functional Spec v1.1 §5.6, amended per
// owner request 2026-08-16 — see "Results screen v1.2 addendum" in the
// functional spec doc). Adds: a mood-reactive celebration header with Lalli
// & Fafa speech bubbles, and an expandable full Story Challenge review with
// per-question correct/incorrect colour coding. The aggregate score itself
// is still absolute-only, never a percentile, and Emotional intelligence
// questions are still never graded right/wrong (§5.5) — only the 7 gradable
// questions get green/red treatment in the review.

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAction, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { Check, ChevronDown, Loader2, Star, X } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import Lottie from "lottie-react";
import { useLottieJson } from "../../_lib/useLottie";
import {
  GROWING_IN_COPY,
  GROWTH_STORY_SUGGESTIONS,
  PILLAR_COLORS,
  PILLAR_EMOJI,
  PILLAR_LABELS,
  PILLAR_ORDER,
  SUPERPOWER_COPY,
  type Pillar,
} from "../../_lib/pillars";

type Mood = "high" | "average" | "low";

const MOOD_THEME: Record<Mood, {
  bg: string; border: string; badge: string; moodEmoji: string; headline: (name: string) => string;
  lalliLine: (name: string) => string; fafaLine: (name: string) => string;
}> = {
  high: {
    bg: "linear-gradient(160deg,#FFF9DB 0%,#FFE8A8 100%)",
    border: "rgba(255,193,7,0.4)",
    badge: "#a16a00",
    moodEmoji: "🤩",
    headline: (name) => `Amazing job, ${name}!!`,
    lalliLine: (name) => `You were AMAZING, ${name}! ⭐`,
    fafaLine: () => "Woohoo!! Let's do that again!! 🎉",
  },
  average: {
    bg: "linear-gradient(160deg,#E8F8F5 0%,#D5F3ED 100%)",
    border: "rgba(0,201,167,0.35)",
    badge: "#00695c",
    moodEmoji: "💪",
    headline: (name) => `Great try, ${name}! 💪`,
    lalliLine: (name) => `You did great, ${name}! Let's explore even more 🌈`,
    fafaLine: () => "Next time we'll go even further! 🚀",
  },
  low: {
    bg: "linear-gradient(160deg,#F3EEFF 0%,#FFF3E0 100%)",
    border: "rgba(124,77,255,0.3)",
    badge: "#6a3fd6",
    moodEmoji: "🥺",
    headline: (name) => `You tried so hard, ${name}! 💛`,
    lalliLine: () => "Every story makes us smarter — let's try again together 🌙",
    fafaLine: (name) => `I believe in you, ${name}! We'll practice more next time 🤗`,
  },
};

function moodFor(ratio: number): Mood {
  if (ratio >= 0.8) return "high";
  if (ratio >= 0.5) return "average";
  return "low";
}

export default function ResultsScreen() {
  const { storyId } = useParams<{ storyId: string }>();
  const router = useRouter();
  const sid = storyId as Id<"stories">;

  const challenge = useQuery(api["testserver/challenge"].getForStory, { storyId: sid });
  const history = useQuery(api["testserver/challenge"].getHistory, {});
  const themes = useQuery(api["migration/theme"].list, {});
  const generateStory = useAction(api.generateStoryV2.enqueueStoryV2);
  const [starting, setStarting] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const stars = useLottieJson("/lottie/stars.json");

  if (!challenge || challenge.status !== "completed" || !challenge.score || !history) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 className="animate-spin" size={28} color="var(--lf-teal)" />
      </div>
    );
  }

  const score = challenge.score;
  const currentPos = history.findIndex((h: any) => h._id === challenge._id);
  const previous = currentPos >= 0 ? history[currentPos + 1] : undefined;

  const growingIn = score.growingInPillar as Pillar;
  const superpower = score.superpowerPillar as Pillar;
  const suggestion = GROWTH_STORY_SUGGESTIONS[growingIn];

  const ratio = score.gradableTotal > 0 ? score.gradableCorrect / score.gradableTotal : 0;
  const mood = moodFor(ratio);
  const theme = MOOD_THEME[mood];
  const childName = challenge.childName;

  async function startGrowthStory() {
    setStarting(true);
    try {
      const setting = themes && themes.length > 0 ? themes[Math.floor(Math.random() * themes.length)].name : "Magical Forest";
      const result = await generateStory({
        params: {
          theme: setting,
          lesson: suggestion.lesson,
          storyType: "adventure",
          length: challenge.length,
          language: "English",
          childId: "1",
        },
      });
      router.push(`/testserver/generating/${result.storyId}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Couldn't start the next story");
      setStarting(false);
    }
  }

  return (
    <div style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column", maxWidth: 460, margin: "0 auto", width: "100%", overflow: "hidden" }}>
      {/* ── Mood-reactive celebration header ── */}
      <div style={{ position: "relative", background: theme.bg, borderBottom: `1px solid ${theme.border}`, padding: "16px 16px 20px", overflow: "hidden" }}>
        {stars && mood === "high" && (
          <div style={{ position: "absolute", top: -20, left: "50%", transform: "translateX(-50%)", width: 260, height: 200, pointerEvents: "none", zIndex: 0, opacity: 0.9 }}>
            <Lottie animationData={stars} loop={false} autoplay style={{ width: "100%", height: "100%" }} />
          </div>
        )}

        {/* Lalli — top-left corner speech bubble */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 10, position: "relative", zIndex: 1 }}>
          <CharacterAvatar src="/Lalli-new.png" ringColor="var(--lf-sunshine)" />
          <Bubble align="left" color="var(--lf-sunshine)">{theme.lalliLine(childName)}</Bubble>
        </div>

        {/* Fafa — top-right corner speech bubble */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 14, flexDirection: "row-reverse", position: "relative", zIndex: 1 }}>
          <CharacterAvatar src="/Fafa_1.jpg" ringColor="var(--lf-teal)" />
          <Bubble align="right" color="var(--lf-teal)">{theme.fafaLine(childName)}</Bubble>
        </div>

        <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, fontWeight: 800, color: theme.badge, textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 2px" }}>
            {theme.moodEmoji} {theme.headline(childName)}
          </p>
          <h1 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: 34, fontWeight: 800, margin: "2px 0 0" }}>
            <span className="text-gradient-teal">{score.gradableCorrect} out of {score.gradableTotal}</span>
          </h1>
          {previous && (
            <p style={{ fontSize: 13, fontWeight: 700, color: "rgba(14,10,31,0.45)", margin: "2px 0 0", fontFamily: "'Nunito', sans-serif" }}>
              up from {previous.score?.gradableCorrect ?? 0} last time
            </p>
          )}
        </div>
      </div>

      <div style={{ padding: "16px 20px 20px", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
          {PILLAR_ORDER.map((p) => (
            <span key={p} style={{ fontFamily: "'Nunito', sans-serif", fontSize: 10.5, fontWeight: 700, color: "rgba(14,10,31,0.55)", background: "#fff", border: "1px solid rgba(14,10,31,0.08)", borderRadius: 999, padding: "4px 10px" }}>
              {PILLAR_EMOJI[p]} {PILLAR_LABELS[p]}
            </span>
          ))}
        </div>

        <div style={{ background: "linear-gradient(135deg,#FFF9DB,#FFF3E0)", borderRadius: 18, padding: 14, marginBottom: 10, border: "1px solid rgba(249,199,0,0.3)" }}>
          <p style={{ margin: 0, fontFamily: "'Nunito', sans-serif", fontSize: 11, fontWeight: 800, color: "#a16a00", textTransform: "uppercase", letterSpacing: "0.04em" }}>🌟 Superpower</p>
          <p style={{ margin: "4px 0 0", fontFamily: "'Baloo 2', sans-serif", fontSize: 15, fontWeight: 700, color: "var(--lf-dark)" }}>
            {PILLAR_EMOJI[superpower]} {PILLAR_LABELS[superpower]} — {childName} {SUPERPOWER_COPY[superpower]}
          </p>
        </div>

        <div style={{ background: "linear-gradient(135deg,#F3EEFF,#F5FFFE)", borderRadius: 18, padding: 14, marginBottom: 12, border: "1px solid rgba(124,77,255,0.2)" }}>
          <p style={{ margin: 0, fontFamily: "'Nunito', sans-serif", fontSize: 11, fontWeight: 800, color: "#6a3fd6", textTransform: "uppercase", letterSpacing: "0.04em" }}>🌱 Growing in</p>
          <p style={{ margin: "4px 0 0", fontFamily: "'Baloo 2', sans-serif", fontSize: 15, fontWeight: 700, color: "var(--lf-dark)" }}>
            {PILLAR_EMOJI[growingIn]} {PILLAR_LABELS[growingIn]} — {GROWING_IN_COPY[growingIn]}
          </p>
        </div>

        {/* ── Full assessment review toggle ── */}
        <button
          onClick={() => setShowReview((v) => !v)}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "none", border: "1.5px dashed rgba(14,10,31,0.18)", borderRadius: 14, padding: "10px", marginBottom: showReview ? 12 : 0, fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 13, color: "var(--lf-dark)", cursor: "pointer" }}
        >
          <ChevronDown size={15} style={{ transform: showReview ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
          {showReview ? "Hide" : "See"} the full Story Challenge review
        </button>

        {showReview && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
            {challenge.questions.map((q: any, qi: number) => {
              const entry = challenge.answeredIndices?.find((a: any) => a.index === qi);
              return (
                <QuestionReviewCard
                  key={qi}
                  index={qi}
                  question={q}
                  selectedIndex={entry?.answeredIndex}
                  answeredData={entry?.answeredData}
                  firstAttemptCorrect={entry?.firstAttemptCorrect}
                />
              );
            })}
          </div>
        )}

        <div style={{ flex: 1 }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, margin: "16px 0 12px" }}>
          <Star size={16} color="var(--lf-sunshine)" fill="var(--lf-sunshine)" />
          <span style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: 15, fontWeight: 800, color: "var(--lf-dark)" }}>+{score.starsEarned} stars</span>
        </div>

        <button onClick={startGrowthStory} disabled={starting} className="btn-primary" style={{ justifyContent: "center", width: "100%", marginBottom: 8, fontSize: 15.5, padding: "0.85rem" }}>
          {starting ? "Starting…" : `${suggestion.emoji} Next: "${suggestion.title}"`}
        </button>
        <button
          onClick={() => router.push("/testserver")}
          className="btn-ghost"
          style={{ justifyContent: "center", fontSize: 13.5, padding: "0.6rem", border: "none" }}
        >
          Back to home
        </button>
      </div>
    </div>
  );
}

function CharacterAvatar({ src, ringColor }: { src: string; ringColor: string }) {
  return (
    <div style={{ width: 40, height: 40, borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: `2.5px solid ${ringColor}`, background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
      <div style={{ position: "relative", width: "100%", height: "100%", transform: "scale(1.6) translateY(6%)" }}>
        <Image src={src} alt="" fill style={{ objectFit: "cover" }} />
      </div>
    </div>
  );
}

function Bubble({ children, align, color }: { children: React.ReactNode; align: "left" | "right"; color: string }) {
  return (
    <div
      style={{
        position: "relative",
        background: "#fff",
        borderRadius: 14,
        padding: "8px 12px",
        maxWidth: 175,
        border: `1.5px solid ${color}`,
        boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
      }}
    >
      <p style={{ margin: 0, fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 11.5, color: "var(--lf-dark)", lineHeight: 1.35 }}>
        {children}
      </p>
      <div
        style={{
          position: "absolute", top: 10, width: 0, height: 0,
          borderTop: "5px solid transparent", borderBottom: "5px solid transparent",
          ...(align === "left"
            ? { left: -6, borderRight: `6px solid ${color}` }
            : { right: -6, borderLeft: `6px solid ${color}` }),
        }}
      />
    </div>
  );
}

function QuestionReviewCard({
  index,
  question,
  selectedIndex,
  answeredData,
  firstAttemptCorrect,
}: {
  index: number;
  question: any;
  selectedIndex?: number;
  answeredData?: string;
  firstAttemptCorrect?: boolean;
}) {
  const pillar = question.pillar as Pillar;
  const fmt: string = question.format ?? "mcq";

  // Use stored first-attempt flag when available (accurate for scoring);
  // fall back to computing from final answer (older rows / quick-check entries).
  let isCorrect = false;
  if (firstAttemptCorrect !== undefined) {
    isCorrect = firstAttemptCorrect;
  } else try {
    if (fmt === "mcq") {
      if (answeredData) {
        const a = JSON.parse(answeredData);
        if (question.correctOptionIds?.length) {
          isCorrect = question.correctOptionIds.includes(a.selectedId);
        } else {
          const target = question.correctIndex ?? question.expectedIndex;
          isCorrect = target !== undefined && Number(a.selectedId) === target;
        }
      } else {
        const target = question.correctIndex ?? question.expectedIndex;
        isCorrect = target !== undefined && selectedIndex === target;
      }
    } else if (fmt === "fill_blank" && answeredData) {
      isCorrect = JSON.parse(answeredData).selectedWord === question.correctWord;
    } else if (fmt === "match_column" && answeredData) {
      const { pairs: answered } = JSON.parse(answeredData);
      const correct: [string, string][] = question.correctPairs ?? [];
      isCorrect =
        correct.length === answered.length &&
        correct.every(([l, r]: [string, string]) =>
          answered.some(([al, ar]: [string, string]) => al === l && ar === r)
        );
    } else if (fmt === "sequence" && answeredData) {
      const { order: answered } = JSON.parse(answeredData);
      const correct: string[] = question.correctOrder ?? [];
      isCorrect =
        correct.length === answered.length && correct.every((id: string, i: number) => answered[i] === id);
    }
  } catch { /**/ }

  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: 12, border: `1.5px solid ${isCorrect ? "rgba(0,201,167,0.35)" : "rgba(255,87,34,0.3)"}` }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 10, fontWeight: 800, color: "#fff", background: PILLAR_COLORS[pillar], borderRadius: 999, padding: "2px 8px" }}>
          {PILLAR_EMOJI[pillar]} {PILLAR_LABELS[pillar]}
        </span>
        {isCorrect ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10.5, fontWeight: 800, color: "#00806c" }}>
            <Check size={12} /> Correct
          </span>
        ) : (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10.5, fontWeight: 800, color: "#c62828" }}>
            <X size={12} /> Not quite
          </span>
        )}
      </div>

      <p style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 13, color: "var(--lf-dark)", margin: "0 0 8px" }}>
        {index + 1}. {question.promptText ?? question.question}
      </p>

      {/* MCQ review */}
      {fmt === "mcq" && (() => {
        const opts: { id: string; text: string }[] = question.richOptions?.length
          ? question.richOptions
          : (question.options ?? []).map((t: string, i: number) => ({ id: String(i), text: t }));
        const selectedId = answeredData
          ? JSON.parse(answeredData).selectedId
          : selectedIndex !== undefined ? String(selectedIndex) : null;
        // All valid answers for this question — may be >1 for EQ multi-accept sets
        const correctIds: Set<string> = question.correctOptionIds?.length
          ? new Set<string>(question.correctOptionIds)
          : new Set<string>([String(question.correctIndex ?? question.expectedIndex)]);
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {opts.map((opt) => {
              const isAccepted = correctIds.has(opt.id);
              const isWrongSel = opt.id === selectedId && !isAccepted;
              const style: React.CSSProperties = isAccepted
                ? { border: "1.5px solid #00c9a7", background: "rgba(0,201,167,0.1)", color: "#00695c" }
                : isWrongSel
                ? { border: "1.5px solid #e57373", background: "rgba(229,115,115,0.1)", color: "#c62828" }
                : { border: "1px solid rgba(14,10,31,0.08)", background: "rgba(14,10,31,0.02)", color: "rgba(14,10,31,0.55)" };
              return (
                <div key={opt.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 10, fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 12.5, ...style }}>
                  {isAccepted && <Check size={13} color="#00c9a7" />}
                  {isWrongSel && <X size={13} color="#e57373" />}
                  {opt.text}
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* Fill-blank review */}
      {fmt === "fill_blank" && (() => {
        const answered = answeredData ? JSON.parse(answeredData).selectedWord : undefined;
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, fontWeight: 700, color: "rgba(14,10,31,0.5)" }}>Your answer:</span>
              <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12.5, fontWeight: 700, color: isCorrect ? "#00695c" : "#c62828", background: isCorrect ? "rgba(0,201,167,0.1)" : "rgba(255,87,34,0.08)", padding: "2px 10px", borderRadius: 8 }}>
                {answered ?? "—"}
              </span>
            </div>
            {!isCorrect && (
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, fontWeight: 700, color: "rgba(14,10,31,0.5)" }}>Correct:</span>
                <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12.5, fontWeight: 700, color: "#00695c", background: "rgba(0,201,167,0.1)", padding: "2px 10px", borderRadius: 8 }}>
                  {question.correctWord}
                </span>
              </div>
            )}
          </div>
        );
      })()}

      {/* Match-column review */}
      {fmt === "match_column" && (() => {
        const answered: [string, string][] = answeredData ? JSON.parse(answeredData).pairs : [];
        const correct: [string, string][] = question.correctPairs ?? [];
        const left: { id: string; text: string }[] = question.leftItems ?? [];
        const right: { id: string; text: string }[] = question.rightItems ?? [];
        const lt = (id: string) => left.find((x) => x.id === id)?.text ?? id;
        const rt = (id: string) => right.find((x) => x.id === id)?.text ?? id;
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {correct.map(([l, r], i) => {
              const userR = answered.find(([al]) => al === l)?.[1];
              const ok = userR === r;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 10, border: `1px solid ${ok ? "#00c9a7" : "#ff5722"}`, background: ok ? "rgba(0,201,167,0.06)" : "rgba(255,87,34,0.06)", flexWrap: "wrap" }}>
                  {ok ? <Check size={12} color="#00c9a7" /> : <X size={12} color="#ff5722" />}
                  <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, fontWeight: 700, color: "var(--lf-dark)" }}>{lt(l)}</span>
                  <span style={{ color: "rgba(14,10,31,0.35)" }}>→</span>
                  <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, fontWeight: 700, color: "var(--lf-dark)" }}>{rt(userR ?? r)}</span>
                  {!ok && <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, color: "#00695c" }}>(should be: {rt(r)})</span>}
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* Sequence review */}
      {fmt === "sequence" && (() => {
        const userOrder: string[] = answeredData ? JSON.parse(answeredData).order : [];
        const correct: string[] = question.correctOrder ?? [];
        const items: { id: string; text: string }[] = question.sequenceItems ?? [];
        const gt = (id: string) => items.find((x) => x.id === id)?.text ?? id;
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {correct.map((id, i) => {
              const userIdx = userOrder.indexOf(id);
              const ok = userIdx === i;
              return (
                <div key={id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 10, border: `1px solid ${ok ? "#00c9a7" : "#ff5722"}`, background: ok ? "rgba(0,201,167,0.06)" : "rgba(255,87,34,0.06)" }}>
                  {ok ? <Check size={12} color="#00c9a7" /> : <X size={12} color="#ff5722" />}
                  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 18, height: 18, borderRadius: "50%", background: ok ? "#00c9a7" : "#ff5722", color: "#fff", fontWeight: 800, fontSize: 11, flexShrink: 0 }}>{i + 1}</span>
                  <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, fontWeight: 700, color: "var(--lf-dark)" }}>{gt(id)}</span>
                  {!ok && userIdx >= 0 && <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, color: "#c62828" }}>(you put #{userIdx + 1})</span>}
                </div>
              );
            })}
          </div>
        );
      })()}
    </div>
  );
}
