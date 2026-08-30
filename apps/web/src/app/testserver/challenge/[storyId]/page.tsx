"use client";

// TESTSERVER screen 5 — Story Challenge (Spec v2.1). Format-aware question
// cards: mcq, fill_blank, match_column, sequence. Per-question retry state
// is UI-side only — first wrong = gentle feedback + retry; second wrong =
// show revealFraming + auto-advance. Backend receives final answer only.

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { Loader2 } from "lucide-react";
import {
  FAFA_COLOR,
  LALLI_COLOR,
  PILLAR_COLORS,
  PILLAR_EMOJI,
  PILLAR_LABELS,
  type Pillar,
} from "../../_lib/pillars";

const BG_TRACKS = ["/music/bg-1.mp3", "/music/bg-2.mp3", "/music/bg-3.mp3", "/music/bg-4.mp3", "/music/bg-5.mp3"];
const BG_VOLUME = 0.16;

type Answer = { index: number; answeredIndex?: number; answeredData?: string; firstAttemptCorrect: boolean };

function getOpts(q: any): { id: string; text: string }[] {
  if (q.richOptions?.length) return q.richOptions;
  return (q.options ?? []).map((t: string, i: number) => ({ id: String(i), text: t }));
}

function checkCorrect(q: any, answeredData: string, answeredIndex?: number): boolean {
  const fmt: string = q.format ?? "mcq";
  try {
    const a = JSON.parse(answeredData);
    if (fmt === "mcq") {
      if (q.correctOptionIds?.length) return q.correctOptionIds.includes(a.selectedId);
      if (answeredIndex === undefined) return false;
      const target = q.correctIndex ?? q.expectedIndex;
      if (target === undefined || target === -1) return false;
      return target === answeredIndex;
    }
    if (fmt === "fill_blank") return a.selectedWord === q.correctWord;
    if (fmt === "match_column") {
      const correct: [string, string][] = q.correctPairs ?? [];
      const answered: [string, string][] = a.pairs ?? [];
      if (answered.length !== correct.length) return false;
      return correct.every(([l, r]) =>
        answered.some(([al, ar]: [string, string]) => al === l && ar === r)
      );
    }
    if (fmt === "sequence") {
      const correct: string[] = q.correctOrder ?? [];
      const answered: string[] = a.order ?? [];
      return correct.length === answered.length && correct.every((id, i) => answered[i] === id);
    }
  } catch { /**/ }
  return false;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FillBlankArea({
  question,
  onSubmit,
  disabled,
  wrongWords,
}: {
  question: any;
  onSubmit: (word: string) => void;
  disabled: boolean;
  wrongWords: Set<string>;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const parts: string[] = (question.sentenceWithBlank ?? "___").split("___");
  const wordBank: string[] = question.wordBank ?? [];

  // Clear the blank when the selected word becomes wrong (parent signals via wrongWords)
  useEffect(() => {
    if (selected !== null && wrongWords.has(selected)) setSelected(null);
  }, [wrongWords, selected]);

  return (
    <div>
      <div
        style={{
          fontFamily: "'Baloo 2', sans-serif",
          fontSize: 17,
          fontWeight: 700,
          color: "var(--lf-dark)",
          marginBottom: 18,
          lineHeight: 1.6,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 4,
        }}
      >
        <span>{parts[0]}</span>
        <span
          style={{
            display: "inline-block",
            minWidth: 90,
            borderBottom: "3px solid var(--lf-teal)",
            textAlign: "center",
            padding: "2px 8px",
            color: selected ? "var(--lf-teal)" : "rgba(14,10,31,0.3)",
            fontStyle: selected ? "normal" : "italic",
            fontSize: selected ? 17 : 14,
            transition: "all 0.15s",
          }}
        >
          {selected ?? "______"}
        </span>
        {parts[1] && <span>{parts[1]}</span>}
      </div>

      <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, fontWeight: 700, color: "rgba(14,10,31,0.45)", margin: "0 0 10px" }}>
        Tap the right word:
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {wordBank.map((word) => {
          const isWrong = wrongWords.has(word);
          const isSelected = !isWrong && selected === word;
          const isDisabled = disabled || isWrong;
          return (
            <button
              key={word}
              onClick={() => {
                if (isDisabled) return;
                setSelected(word);
                onSubmit(word);
              }}
              disabled={isDisabled}
              style={{
                minHeight: 52,
                padding: "10px 18px",
                borderRadius: 14,
                border: `2px solid ${isWrong ? "#e57373" : isSelected ? "var(--lf-teal)" : "#c9b99a"}`,
                background: isWrong ? "rgba(229,115,115,0.1)" : isSelected ? "rgba(0,201,167,0.1)" : "#fff",
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 700,
                fontSize: 15,
                color: isWrong ? "#c62828" : "var(--lf-dark)",
                cursor: isDisabled ? "default" : "pointer",
                opacity: isWrong ? 0.7 : 1,
                transition: "all 0.15s",
              }}
            >
              {word}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const PAIR_COLORS = ["#00c9a7", "#7c4dff", "#ff9800", "#f06292"];

function MatchColumnArea({
  question,
  selectedLeft,
  matchedPairs,
  wrongPairs,
  onTapLeft,
  onTapRight,
  disabled,
}: {
  question: any;
  selectedLeft: string | null;
  matchedPairs: [string, string][];
  wrongPairs: [string, string][];
  onTapLeft: (id: string) => void;
  onTapRight: (id: string) => void;
  disabled: boolean;
}) {
  const leftItems: { id: string; text: string }[] = question.leftItems ?? [];
  const rightItems: { id: string; text: string }[] = question.rightItems ?? [];

  const wrongLeftIds = new Set(wrongPairs.map(([l]) => l));
  const wrongRightIds = new Set(wrongPairs.map(([, r]) => r));

  return (
    <div>
      <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, fontWeight: 700, color: "rgba(14,10,31,0.45)", margin: "0 0 10px" }}>
        Tap a left item, then its match on the right:
      </p>
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          {leftItems.map((item) => {
            const pairIdx = matchedPairs.findIndex(([l]) => l === item.id);
            const isMatched = pairIdx >= 0;
            const isSelected = selectedLeft === item.id;
            const isWrong = !isMatched && wrongLeftIds.has(item.id);
            const borderColor = isMatched
              ? PAIR_COLORS[pairIdx % PAIR_COLORS.length]
              : isWrong
              ? "#e57373"
              : isSelected
              ? "var(--lf-teal)"
              : "#c9b99a";
            return (
              <button
                key={item.id}
                onClick={() => !isMatched && !disabled && onTapLeft(item.id)}
                disabled={disabled || isMatched}
                style={{
                  minHeight: 52,
                  padding: "10px 12px",
                  borderRadius: 14,
                  border: `2px solid ${borderColor}`,
                  background: isMatched
                    ? `${PAIR_COLORS[pairIdx % PAIR_COLORS.length]}18`
                    : isWrong
                    ? "rgba(229,115,115,0.08)"
                    : isSelected
                    ? "rgba(0,201,167,0.08)"
                    : "#fff",
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 700,
                  fontSize: 13,
                  color: isWrong ? "#c62828" : "var(--lf-dark)",
                  cursor: disabled || isMatched ? "default" : "pointer",
                  textAlign: "left",
                  transition: "all 0.15s",
                }}
              >
                {isMatched && (
                  <span style={{ color: PAIR_COLORS[pairIdx % PAIR_COLORS.length], marginRight: 4, fontSize: 11 }}>✓ </span>
                )}
                {item.text}
              </button>
            );
          })}
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          {rightItems.map((item) => {
            const pairIdx = matchedPairs.findIndex(([, r]) => r === item.id);
            const isMatched = pairIdx >= 0;
            const isWrong = !isMatched && wrongRightIds.has(item.id);
            const canTap = !!selectedLeft && !isMatched && !disabled;
            return (
              <button
                key={item.id}
                onClick={() => canTap && onTapRight(item.id)}
                disabled={!canTap}
                style={{
                  minHeight: 52,
                  padding: "10px 12px",
                  borderRadius: 14,
                  border: `2px solid ${isMatched ? PAIR_COLORS[pairIdx % PAIR_COLORS.length] : isWrong ? "#e57373" : "#c9b99a"}`,
                  background: isMatched ? `${PAIR_COLORS[pairIdx % PAIR_COLORS.length]}18` : isWrong ? "rgba(229,115,115,0.08)" : "#fff",
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 700,
                  fontSize: 13,
                  color: isWrong ? "#c62828" : "var(--lf-dark)",
                  cursor: canTap ? "pointer" : "default",
                  textAlign: "left",
                  opacity: !canTap && !isMatched && !isWrong ? 0.55 : 1,
                  transition: "all 0.15s",
                }}
              >
                {isMatched && (
                  <span style={{ color: PAIR_COLORS[pairIdx % PAIR_COLORS.length], marginRight: 4, fontSize: 11 }}>✓ </span>
                )}
                {item.text}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SequenceArea({
  question,
  orderedIds,
  onTapCard,
  onConfirm,
  disabled,
  pillar,
}: {
  question: any;
  orderedIds: string[];
  onTapCard: (id: string) => void;
  onConfirm: () => void;
  disabled: boolean;
  pillar: Pillar;
}) {
  const items: { id: string; text: string }[] = question.sequenceItems ?? [];
  const allOrdered = orderedIds.length === items.length;

  return (
    <div>
      <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, fontWeight: 700, color: "rgba(14,10,31,0.45)", margin: "0 0 10px" }}>
        Tap the cards in order, first to last:
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((item) => {
          const pos = orderedIds.indexOf(item.id);
          const isOrdered = pos >= 0;
          return (
            <button
              key={item.id}
              onClick={() => !disabled && onTapCard(item.id)}
              disabled={disabled}
              style={{
                minHeight: 60,
                padding: "12px 14px",
                borderRadius: 16,
                border: `2px solid ${isOrdered ? PILLAR_COLORS[pillar] : "#c9b99a"}`,
                background: isOrdered ? `${PILLAR_COLORS[pillar]}12` : "#fff",
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 700,
                fontSize: 14,
                color: "var(--lf-dark)",
                cursor: disabled ? "default" : "pointer",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: 12,
                transition: "all 0.15s",
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: isOrdered ? PILLAR_COLORS[pillar] : "rgba(14,10,31,0.08)",
                  color: isOrdered ? "#fff" : "rgba(14,10,31,0.3)",
                  fontWeight: 800,
                  fontSize: 14,
                  flexShrink: 0,
                  transition: "all 0.15s",
                }}
              >
                {isOrdered ? pos + 1 : "?"}
              </span>
              {item.text}
            </button>
          );
        })}
      </div>
      {allOrdered && !disabled && (
        <button
          onClick={onConfirm}
          style={{
            marginTop: 14,
            width: "100%",
            minHeight: 52,
            borderRadius: 14,
            background: PILLAR_COLORS[pillar],
            color: "#fff",
            fontFamily: "'Baloo 2', sans-serif",
            fontWeight: 800,
            fontSize: 15,
            border: "none",
            cursor: "pointer",
          }}
        >
          Lock in my order! ✓
        </button>
      )}
    </div>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function StoryChallengeScreen() {
  const { storyId } = useParams<{ storyId: string }>();
  const router = useRouter();
  const sid = storyId as Id<"stories">;

  const challenge = useQuery(api["testserver/challenge"].getForStory, { storyId: sid });
  const questions = useQuery(
    api["testserver/challenge"].getChallengeQuestions,
    challenge ? { challengeId: challenge._id } : "skip"
  );
  const generateChallenge = useAction(api["testserver/challenge"].generateChallenge);
  const submitChallenge = useMutation(api["testserver/challenge"].submitChallenge);

  const triggeredRef = useRef(false);
  const [genError, setGenError] = useState<string | null>(null);
  useEffect(() => {
    if (challenge === null && !triggeredRef.current) {
      triggeredRef.current = true;
      setGenError(null);
      generateChallenge({ storyId: sid }).catch((err: unknown) => {
        triggeredRef.current = false;
        setGenError(err instanceof Error ? err.message : "Couldn't get your questions ready");
      });
    }
  }, [challenge, generateChallenge, sid]);

  function retryGeneration() {
    setGenError(null);
    triggeredRef.current = true;
    generateChallenge({ storyId: sid }).catch((err: unknown) => {
      triggeredRef.current = false;
      setGenError(err instanceof Error ? err.message : "Couldn't get your questions ready");
    });
  }

  useEffect(() => {
    if (challenge?.status === "completed") {
      router.replace(`/testserver/results/${storyId}`);
    }
  }, [challenge, router, storyId]);

  // Background music
  const bgAudioRef = useRef<HTMLAudioElement>(null);
  const [track] = useState(() => BG_TRACKS[Math.floor(Math.random() * BG_TRACKS.length)]);
  useEffect(() => {
    const a = bgAudioRef.current;
    if (!a) return;
    a.volume = 0;
    a.play().catch(() => {});
    let v = 0;
    const fade = setInterval(() => {
      v = Math.min(BG_VOLUME, v + 0.02);
      a.volume = v;
      if (v >= BG_VOLUME) clearInterval(fade);
    }, 80);
    return () => { clearInterval(fade); a.pause(); };
  }, []);

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [ack, setAck] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Retry state — per question, reset by useEffect below
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [showReveal, setShowReveal] = useState(false);
  // wrongMcqIds: all option IDs tapped wrong this question (stays marked red for the
  // remainder of the question so a child can't accidentally pick the same wrong answer twice)
  const [wrongMcqIds, setWrongMcqIds] = useState<Set<string>>(new Set());
  const [selectedMcqId, setSelectedMcqId] = useState<string | null>(null);

  // fill_blank: word-bank tiles tapped wrong (stay red+disabled for question lifetime)
  const [wrongFillWords, setWrongFillWords] = useState<Set<string>>(new Set());

  // match_column: pairs from the most recent wrong submission (shown as red on retry)
  const [wrongMatchPairs, setWrongMatchPairs] = useState<[string, string][]>([]);

  // Prevents rapid double-tap from firing two handleAnswer calls in quick
  // succession and skipping from first-wrong straight to second-wrong.
  const answerCooldownRef = useRef(false);

  // Captures correctness of the child's very first tap per question.
  // Never overwritten after the first call — used for first-attempt scoring.
  const firstAttemptCorrectRef = useRef<boolean | null>(null);

  // match_column interaction state (parent-managed so parent can reset on retry)
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<[string, string][]>([]);

  // sequence interaction state (parent-managed)
  const [orderedIds, setOrderedIds] = useState<string[]>([]);

  // Reset everything when moving to the next question
  useEffect(() => {
    answerCooldownRef.current = false;
    firstAttemptCorrectRef.current = null;
    setWrongAttempts(0);
    setShowReveal(false);
    setAck(false);
    setWrongMcqIds(new Set());
    setSelectedMcqId(null);
    setWrongFillWords(new Set());
    setWrongMatchPairs([]);
    setSelectedLeft(null);
    setMatchedPairs([]);
    setOrderedIds([]);
  }, [index]);

  if (!challenge || challenge.status === "completed" || !questions) {
    if (genError) {
      return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 24, textAlign: "center" }}>
          <span style={{ fontSize: 38 }}>😔</span>
          <p style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 17, color: "var(--lf-dark)", maxWidth: 280, margin: 0 }}>
            That one didn&apos;t come out right.
          </p>
          <button className="btn-primary" onClick={retryGeneration}>Try again</button>
        </div>
      );
    }
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
        <Loader2 className="animate-spin" size={32} color="var(--lf-teal)" />
        <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 14, color: "var(--lf-dark)" }}>
          Lalli and Fafa are getting your questions ready…
        </p>
      </div>
    );
  }

  const q = questions[index];
  const total = questions.length;
  const pillar = q.pillar as Pillar;
  const fmt: string = q.format ?? "mcq";

  function playCorrectSound() {
    try {
      const ctx = new AudioContext();
      const play = (freq: number, start: number, dur: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = "sine"; osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, ctx.currentTime + start);
        gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + start + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
        osc.start(ctx.currentTime + start); osc.stop(ctx.currentTime + start + dur);
      };
      play(523, 0, 0.15);   // C5
      play(659, 0.1, 0.15); // E5
      play(784, 0.2, 0.3);  // G5
    } catch { /**/ }
  }

  function playWrongSound() {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = "triangle";
      osc.frequency.setValueAtTime(370, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(280, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.32, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.28, ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
      osc.start(); osc.stop(ctx.currentTime + 0.55);
    } catch { /**/ }
  }

  async function advance(next: Answer[]) {
    if (index + 1 < total) {
      setIndex(index + 1);
    } else {
      setSubmitting(true);
      try {
        await submitChallenge({ challengeId: challenge._id, answers: next });
        router.push(`/testserver/results/${storyId}`);
      } catch {
        setSubmitting(false);
      }
    }
  }

  function handleAnswer(answeredData: string, answeredIndex?: number) {
    if (ack || answerCooldownRef.current) return;
    const correct = checkCorrect(q, answeredData, answeredIndex);

    // Capture first-attempt correctness exactly once per question
    if (firstAttemptCorrectRef.current === null) {
      firstAttemptCorrectRef.current = correct;
    }

    const newAnswer: Answer = {
      index: q.index,
      answeredData,
      ...(answeredIndex !== undefined ? { answeredIndex } : {}),
      firstAttemptCorrect: firstAttemptCorrectRef.current,
    };

    if (correct) {
      const next = [...answers, newAnswer];
      setAnswers(next);
      setAck(true);
      playCorrectSound();
      setTimeout(() => advance(next), 700);
      return;
    }

    if (wrongAttempts === 0) {
      // First wrong — lock briefly to prevent double-tap racing to second-wrong
      answerCooldownRef.current = true;
      setTimeout(() => { answerCooldownRef.current = false; }, 700);
      setWrongAttempts(1);
      setSelectedLeft(null);
      setMatchedPairs([]);
      setOrderedIds([]);
      // Persist wrong fill-blank word as red+disabled
      if (fmt === "fill_blank") {
        try { setWrongFillWords(prev => new Set(prev).add(JSON.parse(answeredData).selectedWord)); } catch { /**/ }
      }
      // Persist wrong match pairs as red on retry
      if (fmt === "match_column") {
        try { setWrongMatchPairs(JSON.parse(answeredData).pairs ?? []); } catch { /**/ }
      }
      playWrongSound();
      return;
    }

    // Second wrong — record answer, show reveal, auto-advance
    const next = [...answers, newAnswer];
    setAnswers(next);
    setShowReveal(true);
    setAck(true);
    playWrongSound();
    setTimeout(() => advance(next), 2400);
  }

  function chooseMCQ(opt: { id: string; text: string }, i: number) {
    if (ack || answerCooldownRef.current || wrongMcqIds.has(opt.id)) return;
    const isLegacy = !q.richOptions?.length && !q.correctOptionIds?.length;
    const data = JSON.stringify({ selectedId: opt.id });
    const answeredIndex = isLegacy ? i : undefined;
    setSelectedMcqId(opt.id);
    if (!checkCorrect(q, data, answeredIndex)) {
      setWrongMcqIds(prev => new Set(prev).add(opt.id));
    }
    handleAnswer(data, answeredIndex);
  }

  function tapLeft(id: string) {
    if (ack) return;
    setSelectedLeft(id === selectedLeft ? null : id);
  }

  function tapRight(rightId: string) {
    if (ack || !selectedLeft) return;
    if (matchedPairs.some(([l]) => l === selectedLeft)) return;
    const newPairs: [string, string][] = [...matchedPairs, [selectedLeft, rightId]];
    setMatchedPairs(newPairs);
    setSelectedLeft(null);
    if (newPairs.length === (q.leftItems?.length ?? 0)) {
      handleAnswer(JSON.stringify({ pairs: newPairs }));
    }
  }

  const opts = getOpts(q);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: 20, maxWidth: 460, margin: "0 auto", width: "100%" }}>
      <audio ref={bgAudioRef} src={track} loop />

      {/* Progress row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12.5, fontWeight: 800, color: "rgba(14,10,31,0.5)" }}>
          Question {index + 1} of {total}
        </span>
        <div style={{ display: "flex", gap: 4 }}>
          {questions.map((_: unknown, i: number) => (
            <div
              key={i}
              style={{
                width: i === index ? 18 : 6,
                height: 6,
                borderRadius: 99,
                background: i <= index
                  ? "linear-gradient(90deg, var(--lf-sunshine), var(--lf-teal))"
                  : "rgba(14,10,31,0.12)",
                transition: "all 0.2s",
              }}
            />
          ))}
        </div>
      </div>

      {/* Character + pillar tag */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
        <span style={{ display: "inline-flex", width: 22, height: 22, borderRadius: "50%", background: LALLI_COLOR, alignItems: "center", justifyContent: "center", fontSize: 11, boxShadow: "0 2px 6px rgba(0,0,0,0.15)" }}>⭐</span>
        <span style={{ display: "inline-flex", width: 22, height: 22, borderRadius: "50%", background: FAFA_COLOR, alignItems: "center", justifyContent: "center", fontSize: 11, marginLeft: -12, boxShadow: "0 2px 6px rgba(0,0,0,0.15)" }}>💙</span>
        <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, fontWeight: 800, color: "#fff", background: PILLAR_COLORS[pillar], padding: "4px 12px", borderRadius: 999, marginLeft: 4 }}>
          {PILLAR_EMOJI[pillar]} {PILLAR_LABELS[pillar]}
        </span>
      </div>

      {/* Story grounding snippet */}
      {(q.storyGrounding ?? q.snippet) && (
        <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12.5, fontStyle: "italic", color: "rgba(14,10,31,0.55)", background: "var(--lf-peach)", borderRadius: 14, padding: "10px 14px", margin: "0 0 14px" }}>
          &ldquo;{q.storyGrounding ?? q.snippet}&rdquo;
        </p>
      )}

      {/* Question text — skipped for fill_blank (FillBlankArea renders the sentence with blank itself) */}
      {fmt !== "fill_blank" && (
        <p style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: 19, fontWeight: 700, color: "var(--lf-dark)", margin: "0 0 18px" }}>
          {q.promptText ?? q.question}
        </p>
      )}

      {/* MCQ */}
      {fmt === "mcq" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {opts.map((opt, i) => {
            const isWrong = wrongMcqIds.has(opt.id);
            const isCorrect = ack && !showReveal && selectedMcqId === opt.id;
            const isDisabled = ack || submitting || isWrong;
            return (
              <button
                key={opt.id}
                onClick={() => chooseMCQ(opt, i)}
                disabled={isDisabled}
                style={{
                  minHeight: 56,
                  padding: "12px 18px",
                  borderRadius: 16,
                  border: `2px solid ${
                    isWrong
                      ? "#e57373"
                      : isCorrect
                      ? "#4caf50"
                      : "#c9b99a"
                  }`,
                  background: isWrong
                    ? "rgba(229,115,115,0.1)"
                    : isCorrect
                    ? "rgba(76,175,80,0.1)"
                    : "#fff",
                  color: isWrong ? "#c62828" : "var(--lf-dark)",
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 700,
                  fontSize: 15,
                  textAlign: "left",
                  cursor: isDisabled ? "default" : "pointer",
                  opacity: isWrong ? 0.7 : 1,
                  transform: isCorrect ? "scale(1.02)" : "scale(1)",
                  transition: "all 0.18s",
                }}
              >
                {opt.text}
              </button>
            );
          })}
        </div>
      )}

      {/* Fill in the blank — keyed to question only; wrong words stay red without remounting */}
      {fmt === "fill_blank" && (
        <FillBlankArea
          key={`fb-${index}`}
          question={q}
          onSubmit={(word) => handleAnswer(JSON.stringify({ selectedWord: word }))}
          disabled={ack}
          wrongWords={wrongFillWords}
        />
      )}

      {/* Match the column */}
      {fmt === "match_column" && (
        <MatchColumnArea
          question={q}
          selectedLeft={selectedLeft}
          matchedPairs={matchedPairs}
          wrongPairs={wrongMatchPairs}
          onTapLeft={tapLeft}
          onTapRight={tapRight}
          disabled={ack}
        />
      )}

      {/* Sequencing */}
      {fmt === "sequence" && (
        <SequenceArea
          question={q}
          orderedIds={orderedIds}
          onTapCard={(id) => {
            if (ack) return;
            setOrderedIds((prev) =>
              prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
            );
          }}
          onConfirm={() => handleAnswer(JSON.stringify({ order: orderedIds }))}
          disabled={ack}
          pillar={pillar}
        />
      )}

      <div style={{ flex: 1 }} />

      {/* Feedback strip */}
      {wrongAttempts === 1 && !ack && (
        <p style={{ textAlign: "center", fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: 15, color: "#b85c00", margin: "12px 0 0" }}>
          Hmm, not quite, give it another go! 🌟
        </p>
      )}
      {showReveal && (
        <div style={{ background: "var(--lf-peach)", borderRadius: 14, padding: "10px 14px", margin: "12px 0 0", textAlign: "center" }}>
          <p style={{ margin: 0, fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 13, color: "var(--lf-dark)" }}>
            💡 {q.revealFraming ?? "That's a tricky one, keep exploring with Lalli and Fafa! 🌙"}
          </p>
        </div>
      )}
      {ack && !showReveal && (
        <div style={{ textAlign: "center", margin: "14px 0 0" }}>
          <p style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: 20, color: "#4caf50", margin: 0, lineHeight: 1.2 }}>
            {submitting ? "Adding it all up… ✨" : "Great job! ✨"}
          </p>
          {!submitting && (
            <p style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 13, color: "rgba(14,10,31,0.5)", margin: "4px 0 0" }}>
              ⭐ Lalli and Fafa are proud of you!
            </p>
          )}
        </div>
      )}
    </div>
  );
}
