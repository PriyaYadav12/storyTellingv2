"use client";

// TESTSERVER screen 2 — Generating story (Functional Spec v1.1 §5.2).
// Polls the existing story status field; never a dead end on failure.

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import Image from "next/image";
import Lottie from "lottie-react";
import { useLottieJson } from "../../_lib/useLottie";

export default function GeneratingScreen() {
  const { storyId } = useParams<{ storyId: string }>();
  const router = useRouter();
  const story = useQuery(api.stories.get, { storyId: storyId as Id<"stories"> });
  const [elapsed, setElapsed] = useState(0);
  const [retrying, setRetrying] = useState(false);
  const sparkle = useLottieJson("/lottie/sparkle.json");

  useEffect(() => {
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Text is ready as soon as the Story Challenge / player can use it —
  // images and narration continue generating in the background afterward.
  useEffect(() => {
    if (story && ["text_ready", "images_ready", "voice_ready", "ready"].includes(story.status)) {
      router.push(`/testserver/story/${storyId}`);
    }
  }, [story, storyId, router]);

  const failed = story?.status === "error";
  const statusLine =
    failed ? "That one didn't come out right."
      : elapsed > 90 ? "This one's taking a little longer — hang tight!"
      : "Lalli and Fafa are picking today's adventure…";

  return (
    <div style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center", gap: 18, overflow: "hidden" }}>
      <div className="absolute inset-0 -z-0 pointer-events-none" aria-hidden style={{ background: "radial-gradient(circle at 50% 40%, rgba(255,193,7,0.14) 0%, transparent 60%)" }} />
      <span className="animate-float absolute select-none" style={{ top: "18%", left: "14%", fontSize: 20, opacity: 0.55 }}>⭐</span>
      <span className="animate-float-slow absolute select-none" style={{ top: "22%", right: "16%", fontSize: 18, opacity: 0.55 }}>✨</span>
      <span className="animate-wiggle absolute select-none" style={{ bottom: "22%", left: "18%", fontSize: 18, opacity: 0.5 }}>🌙</span>

      {story && (
        <div style={{ position: "relative", background: "#fff", borderRadius: 999, padding: "8px 18px", border: "1px solid rgba(14,10,31,0.08)", fontFamily: "'Nunito', sans-serif", fontSize: 12.5, color: "var(--lf-dark)", fontWeight: 700, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
          For {story.params.childName ?? "your child"} · {story.params.lesson ?? "—"} · {story.params.length ?? "medium"}
        </div>
      )}

      <div style={{ position: "relative", width: 180, height: 180, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {!failed && sparkle && (
          <div style={{ position: "absolute", inset: 0 }}>
            <Lottie animationData={sparkle} loop autoplay style={{ width: "100%", height: "100%" }} />
          </div>
        )}
        {!failed && !sparkle && (
          <div style={{ width: 44, height: 44, borderRadius: "50%", border: "4px solid rgba(0,201,167,0.2)", borderTopColor: "var(--lf-teal)", animation: "ts-spin 0.8s linear infinite" }} />
        )}
        <Image src="/lf-hero.png" alt="Lalli and Fafa" width={110} height={110} className="animate-float-slow" style={{ position: "relative", zIndex: 1, height: 100, width: "auto", objectFit: "contain" }} priority />
        {failed && <span style={{ position: "absolute", fontSize: 38 }}>😔</span>}
      </div>
      <style>{`@keyframes ts-spin { to { transform: rotate(360deg); } }`}</style>

      <p style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 17, color: "var(--lf-dark)", maxWidth: 280, margin: 0, position: "relative" }}>
        {statusLine}
      </p>

      {failed && (
        <button
          className="btn-primary"
          disabled={retrying}
          onClick={() => { setRetrying(true); router.push("/testserver"); }}
          style={{ position: "relative" }}
        >
          Try again
        </button>
      )}
    </div>
  );
}
