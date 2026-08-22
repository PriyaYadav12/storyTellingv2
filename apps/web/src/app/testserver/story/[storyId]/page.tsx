"use client";

// TESTSERVER screen 3 — Watching story, with an in-story quick check
// (Functional Spec v1.1 §5.3; v1.3 amendment §13.5 — 3 quick checks, synced
// to scene transitions rather than a flat time percentage). Reuses the
// existing story content, scene images, and narration audio queries as-is
// (api.stories.*). This is a new, deliberately simple player built for this
// review screen — not the production cinematic player at /story/[id], which
// has bespoke audio-scene-sync logic out of scope here — but it borrows that
// player's dark theatre backdrop and motion classes (.scene-anim-kenburns,
// .scene-shimmer, radial glow blobs) already defined in globals.css / used
// on /story/[id], so the look and feel matches.
//
// Narration is never paused by the quick check card — no code path here
// calls audio.pause() when a quick check appears; it only overlays the
// player while playback continues, per the spec's "never blocks playback"
// rule.

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { Loader2, Pause, Play } from "lucide-react";
import { FAFA_COLOR, LALLI_COLOR, PILLAR_EMOJI, PILLAR_LABELS, type Pillar } from "../../_lib/pillars";

function fmt(s: number) {
  if (!isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

// Spread the 3 quick checks across scene transitions (roughly 25/50/75%
// of the way through the scenes) instead of a flat playback-time percentage.
function sceneThresholdForSlot(slot: number, numScenes: number) {
  return Math.max(1, Math.floor(((slot + 1) * numScenes) / 4));
}

export default function WatchStoryScreen() {
  const { storyId } = useParams<{ storyId: string }>();
  const router = useRouter();
  const sid = storyId as Id<"stories">;

  const story = useQuery(api.stories.get, { storyId: sid });
  const imageUrls = useQuery(api.stories.getSceneImageUrls, { storyId: sid });
  const narration = useQuery(api.stories.getNarrationFileUrl, { storyId: sid });
  const challenge = useQuery(api["testserver/challenge"].getForStory, { storyId: sid });
  const pendingQuickChecks = useQuery(
    api["testserver/challenge"].getNextQuickCheck,
    challenge ? { challengeId: challenge._id } : "skip"
  );

  const generateChallenge = useAction(api["testserver/challenge"].generateChallenge);
  const submitQuickCheck = useMutation(api["testserver/challenge"].submitQuickCheck);

  const triggeredRef = useRef(false);
  useEffect(() => {
    if (story?.content && challenge === null && !triggeredRef.current) {
      triggeredRef.current = true;
      generateChallenge({ storyId: sid }).catch(() => { triggeredRef.current = false; });
    }
  }, [story?.content, challenge, generateChallenge, sid]);

  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeQuickCheck, setActiveQuickCheck] = useState<{ index: number; pillar: string; question: string; options: string[] } | null>(null);
  const [quickCheckAck, setQuickCheckAck] = useState<"answered" | "skipped" | null>(null);
  const shownSlotsRef = useRef<Set<number>>(new Set());

  const ready = !!story?.content && !!narration?.url && !!imageUrls && imageUrls.length > 0;
  const numScenes = imageUrls?.length ?? 1;
  const sceneIndex = duration > 0 ? Math.min(numScenes - 1, Math.floor((currentTime / duration) * numScenes)) : 0;
  const sceneUrl = imageUrls?.[sceneIndex]?.url ?? null;

  // Trigger the next pending quick check once we cross its scene threshold —
  // anchored to story beats (scene changes), not a fixed clock.
  useEffect(() => {
    if (!challenge?.quickCheckIndices || !pendingQuickChecks || activeQuickCheck) return;
    for (const q of pendingQuickChecks) {
      const slot = challenge.quickCheckIndices.indexOf(q.index);
      if (slot === -1 || shownSlotsRef.current.has(slot)) continue;
      if (sceneIndex >= sceneThresholdForSlot(slot, numScenes)) {
        shownSlotsRef.current.add(slot);
        setActiveQuickCheck(q);
        setQuickCheckAck(null);
        break;
      }
    }
  }, [sceneIndex, pendingQuickChecks, challenge?.quickCheckIndices, numScenes, activeQuickCheck]);

  function togglePlay() {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) { a.play(); setIsPlaying(true); } else { a.pause(); setIsPlaying(false); }
  }

  async function answerQuickCheck(optionIndex: number | null) {
    if (!activeQuickCheck) return;
    if (optionIndex !== null && challenge) {
      await submitQuickCheck({ challengeId: challenge._id, questionIndex: activeQuickCheck.index, answeredIndex: optionIndex });
      setQuickCheckAck("answered");
    } else {
      setQuickCheckAck("skipped");
    }
    setTimeout(() => { setActiveQuickCheck(null); setQuickCheckAck(null); }, 1400);
  }

  if (!ready) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, background: "#0e0c1a" }}>
        <Loader2 className="animate-spin" size={32} color="var(--lf-teal)" />
        <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.75)" }}>Bringing the pictures and sounds to life… ✨</p>
      </div>
    );
  }

  const qcPillar = (activeQuickCheck?.pillar as Pillar) ?? "listening";

  return (
    <div style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column", background: "#0e0c1a", overflow: "hidden" }}>
      {/* Dark theatre backdrop with floating glow blobs — matches /story/[id] */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,#1a1740 0%,#0d2d26 50%,#1a1040 100%)", opacity: 0.9 }} />
      <div style={{ position: "absolute", top: "10%", left: "5%", width: 220, height: 220, background: "radial-gradient(circle,rgba(0,201,167,0.16) 0%,transparent 70%)", borderRadius: "50%" }} />
      <div style={{ position: "absolute", bottom: "12%", right: "4%", width: 260, height: 260, background: "radial-gradient(circle,rgba(249,199,0,0.12) 0%,transparent 70%)", borderRadius: "50%" }} />
      <div style={{ position: "absolute", top: "45%", right: "8%", width: 180, height: 180, background: "radial-gradient(circle,rgba(168,85,247,0.12) 0%,transparent 70%)", borderRadius: "50%" }} />

      <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", padding: 16, maxWidth: 460, margin: "0 auto", width: "100%" }}>
        <audio
          ref={audioRef}
          src={narration!.url!}
          preload="auto"
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onEnded={() => { setIsPlaying(false); router.push(`/testserver/story/${storyId}/end`); }}
        />

        <div style={{ position: "relative", width: "100%", aspectRatio: "4 / 3", borderRadius: 20, overflow: "hidden", background: "#1a1730", flexShrink: 0, boxShadow: "0 16px 44px rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.08)" }}>
          {sceneUrl && (
            <div key={sceneIndex} className="scene-anim-kenburns" style={{ position: "absolute", inset: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={sceneUrl} alt={`Scene ${sceneIndex + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          )}
          <div className="scene-shimmer" />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 35%)" }} />
          <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,0.5)", color: "#fff", fontSize: 11, fontFamily: "'Nunito', sans-serif", fontWeight: 700, padding: "4px 10px", borderRadius: 999, backdropFilter: "blur(4px)" }}>
            Scene {sceneIndex + 1} of {numScenes}
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <div
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              if (audioRef.current) audioRef.current.currentTime = pct * duration;
            }}
            style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,0.12)", cursor: "pointer", position: "relative" }}
          >
            <div style={{ position: "absolute", inset: 0, width: `${duration ? (currentTime / duration) * 100 : 0}%`, background: "linear-gradient(90deg, var(--lf-sunshine), var(--lf-teal))", borderRadius: 999, transition: "width 0.1s linear" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
            <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.55)", fontWeight: 700, width: 60 }}>{fmt(currentTime)} / {fmt(duration)}</span>
            <button
              onClick={togglePlay}
              style={{ width: 60, height: 60, borderRadius: "50%", background: "linear-gradient(135deg, var(--lf-sunshine), #ffab00)", color: "#1a1a2e", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 6px 22px rgba(255,193,7,0.4)" }}
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} style={{ marginLeft: 3 }} />}
            </button>
            <div style={{ width: 60 }} />
          </div>
        </div>

        {activeQuickCheck && (
          <div style={{ position: "absolute", left: 12, right: 12, bottom: 12, background: "#fff", borderRadius: 20, padding: 14, boxShadow: "0 12px 36px rgba(0,0,0,0.4)" }}>
            {!quickCheckAck ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <span style={{ display: "inline-flex", width: 20, height: 20, borderRadius: "50%", background: LALLI_COLOR, alignItems: "center", justifyContent: "center", fontSize: 10 }}>⭐</span>
                  <span style={{ display: "inline-flex", width: 20, height: 20, borderRadius: "50%", background: FAFA_COLOR, alignItems: "center", justifyContent: "center", fontSize: 10, marginLeft: -10 }}>💙</span>
                  <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, fontWeight: 800, color: "var(--lf-electric)", textTransform: "uppercase", letterSpacing: "0.04em", margin: 0 }}>
                    Quick check {PILLAR_EMOJI[qcPillar]} {PILLAR_LABELS[qcPillar]}
                  </p>
                </div>
                <p style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 15, color: "var(--lf-dark)", margin: "0 0 10px" }}>
                  {activeQuickCheck.question}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {activeQuickCheck.options.map((opt: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => answerQuickCheck(i)}
                      style={{ minHeight: 44, padding: "9px 15px", borderRadius: 999, border: "1.5px solid rgba(14,10,31,0.1)", background: "var(--lf-peach)", fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => answerQuickCheck(null)}
                  style={{ marginTop: 8, background: "none", border: "none", color: "rgba(14,10,31,0.4)", fontFamily: "'Nunito', sans-serif", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                >
                  Skip — I&apos;ll ask again after the story
                </button>
              </>
            ) : (
              <p style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: 16, color: "var(--lf-teal)", margin: 0, textAlign: "center" }}>
                {quickCheckAck === "answered" ? "Thanks for sharing! ✨" : "Okay! 👍"}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
