"use client";

// TESTSERVER screen 5 — Story Challenge (Functional Spec v1.1 §5.5; v1.3
// amendment §13.5 — base 7 questions plus any of the 3 in-story quick
// checks that went unanswered during playback). One at a time, no pillar
// switcher, never negative feedback, framed as Lalli and Fafa asking
// together. Soft background music plays throughout, per owner request.

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { Loader2 } from "lucide-react";
import { FAFA_COLOR, LALLI_COLOR, PILLAR_COLORS, PILLAR_EMOJI, PILLAR_LABELS, type Pillar } from "../../_lib/pillars";

const BG_TRACKS = ["/music/bg-1.mp3", "/music/bg-2.mp3", "/music/bg-3.mp3", "/music/bg-4.mp3", "/music/bg-5.mp3"];
const BG_VOLUME = 0.16;

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
  useEffect(() => {
    if (challenge === null && !triggeredRef.current) {
      triggeredRef.current = true;
      generateChallenge({ storyId: sid }).catch(() => { triggeredRef.current = false; });
    }
  }, [challenge, generateChallenge, sid]);

  useEffect(() => {
    if (challenge?.status === "completed") {
      router.replace(`/testserver/results/${storyId}`);
    }
  }, [challenge, router, storyId]);

  // Soft background music while answering — matches the trigger the owner
  // asked for; same low-volume ambient tracks the production player uses.
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
  const [answers, setAnswers] = useState<{ index: number; answeredIndex: number }[]>([]);
  const [ack, setAck] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!challenge || challenge.status === "completed" || !questions) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
        <Loader2 className="animate-spin" size={32} color="var(--lf-teal)" />
        <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 14, color: "var(--lf-dark)" }}>Lalli and Fafa are getting your questions ready…</p>
      </div>
    );
  }

  const q = questions[index];
  const total = questions.length;
  const pillar = q.pillar as Pillar;

  async function choose(optionIndex: number) {
    if (ack) return;
    const next = [...answers, { index: q.index, answeredIndex: optionIndex }];
    setAnswers(next);
    setAck(true);
    setTimeout(async () => {
      setAck(false);
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
    }, 700);
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: 20, maxWidth: 460, margin: "0 auto", width: "100%" }}>
      <audio ref={bgAudioRef} src={track} loop />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12.5, fontWeight: 800, color: "rgba(14,10,31,0.5)" }}>
          Question {index + 1} of {total}
        </span>
        <div style={{ display: "flex", gap: 4 }}>
          {questions.map((_, i) => (
            <div key={i} style={{ width: i === index ? 18 : 6, height: 6, borderRadius: 99, background: i <= index ? "linear-gradient(90deg, var(--lf-sunshine), var(--lf-teal))" : "rgba(14,10,31,0.12)", transition: "all 0.2s" }} />
          ))}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
        <span style={{ display: "inline-flex", width: 22, height: 22, borderRadius: "50%", background: LALLI_COLOR, alignItems: "center", justifyContent: "center", fontSize: 11, boxShadow: "0 2px 6px rgba(0,0,0,0.15)" }}>⭐</span>
        <span style={{ display: "inline-flex", width: 22, height: 22, borderRadius: "50%", background: FAFA_COLOR, alignItems: "center", justifyContent: "center", fontSize: 11, marginLeft: -12, boxShadow: "0 2px 6px rgba(0,0,0,0.15)" }}>💙</span>
        <span
          style={{
            fontFamily: "'Nunito', sans-serif",
            fontSize: 11,
            fontWeight: 800,
            color: "#fff",
            background: PILLAR_COLORS[pillar],
            padding: "4px 12px",
            borderRadius: 999,
            marginLeft: 4,
          }}
        >
          {PILLAR_EMOJI[pillar]} {PILLAR_LABELS[pillar]}
        </span>
      </div>

      {q.snippet && (
        <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12.5, fontStyle: "italic", color: "rgba(14,10,31,0.55)", background: "var(--lf-peach)", borderRadius: 14, padding: "10px 14px", margin: "0 0 14px" }}>
          &ldquo;{q.snippet}&rdquo;
        </p>
      )}

      <p style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: 19, fontWeight: 700, color: "var(--lf-dark)", margin: "0 0 18px" }}>
        {q.question}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {q.options.map((opt: string, i: number) => {
          const isPicked = ack && answers[answers.length - 1]?.answeredIndex === i;
          return (
            <button
              key={i}
              onClick={() => choose(i)}
              disabled={ack || submitting}
              style={{
                minHeight: 52,
                padding: "12px 18px",
                borderRadius: 16,
                border: `2px solid ${isPicked ? PILLAR_COLORS[pillar] : "rgba(14,10,31,0.1)"}`,
                background: isPicked ? `${PILLAR_COLORS[pillar]}1a` : "#fff",
                color: "var(--lf-dark)",
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 700,
                fontSize: 15,
                textAlign: "left",
                cursor: ack ? "default" : "pointer",
                transform: isPicked ? "scale(1.02)" : "scale(1)",
                transition: "all 0.15s",
                boxShadow: isPicked ? "0 6px 18px rgba(0,0,0,0.1)" : "none",
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1 }} />

      {ack && (
        <p style={{ textAlign: "center", fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: 16, color: "var(--lf-teal)", margin: 0 }}>
          {submitting ? "Adding it all up… ✨" : "Nice thinking! ✨"}
        </p>
      )}
    </div>
  );
}
