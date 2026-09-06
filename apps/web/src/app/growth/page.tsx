"use client";

// Growth tab (Story Challenge Phase 4) — full pillar breakdown for a child's
// most recent completed Story Challenge, plus history. Staged-rollout gated:
// redirects home if this account isn't allowlisted (mirrors the dashboard
// teaser card's own gate in apps/web/src/app/dashboard/page.tsx).

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  useQuery,
  useConvexAuth,
  Authenticated,
  AuthLoading,
  Unauthenticated,
} from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../../convex/_generated/api";
import { UserPill } from "@/components/layout/UserPill";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { ArrowLeft, Trophy, Sparkles, Loader2 } from "lucide-react";
import { PILLAR_ORDER, PILLAR_EMOJI, PILLAR_LABELS, PILLAR_COLORS, type Pillar } from "../testserver/_lib/pillars";

export default function GrowthPage() {
  return (
    <>
      <AuthLoading>
        <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg,#FFF8E7 0%,#E6FAF6 100%)" }}>
          <Loader2 className="animate-spin" size={28} color="var(--lf-teal)" />
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
        <GrowthContent />
      </Authenticated>
    </>
  );
}

function GrowthContent() {
  const router = useRouter();
  const { isAuthenticated } = useConvexAuth();
  const challengeEnabled = useQuery(
    api["testserver/_shared"].isChallengeRolloutEnabled,
    isAuthenticated ? {} : "skip"
  );
  const summary = useQuery(
    api["testserver/challenge"].getDashboardSummary,
    isAuthenticated && challengeEnabled ? {} : "skip"
  );
  const history = useQuery(
    api["testserver/challenge"].getHistory,
    isAuthenticated && challengeEnabled ? {} : "skip"
  );

  useEffect(() => {
    if (challengeEnabled === false) router.replace("/dashboard");
  }, [challengeEnabled, router]);

  if (challengeEnabled === undefined || challengeEnabled === false) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg,#FFF8E7 0%,#E6FAF6 100%)" }}>
        <Loader2 className="animate-spin" size={28} color="var(--lf-teal)" />
      </div>
    );
  }

  const latest = summary?.latest;

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg,#FFF8E7 0%,#E6FAF6 50%,#F3EEFF 100%)" }}>
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-5 py-3"
        style={{ background: "rgba(255,252,245,0.92)", backdropFilter: "blur(16px)", borderBottom: "1.5px solid rgba(0,0,0,0.07)", height: 72 }}
      >
        <Link href="/dashboard" className="flex items-center gap-2" style={{ color: "var(--lf-dark)", fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: "0.9rem" }}>
          <ArrowLeft size={18} /> Dashboard
        </Link>
        <span style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "var(--lf-dark)" }}>
          🌱 Growth
        </span>
        <UserPill variant="light" />
      </header>

      <main className="max-w-2xl mx-auto px-5 py-8 pb-24 md:pb-8 flex flex-col gap-6">
        {!summary || !latest ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <span style={{ fontSize: "2.5rem" }}>🌙</span>
            <p style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "var(--lf-dark)" }}>
              No Story Challenges completed yet
            </p>
            <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: "0.9rem", color: "rgba(45,45,45,0.55)", maxWidth: 320 }}>
              Finish a story and take the Story Challenge with Lalli &amp; Fafa to start tracking growth here.
            </p>
            <Link href="/dashboard" className="btn-primary" style={{ marginTop: 8 }}>
              <Sparkles size={16} /> Back to Dashboard
            </Link>
          </div>
        ) : (
          <>
            <div>
              <h1 style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: "1.5rem", color: "var(--lf-dark)", margin: 0 }}>
                {latest.childName}&apos;s growth
              </h1>
              <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: "0.85rem", color: "rgba(45,45,45,0.5)", margin: "2px 0 0" }}>
                Based on the most recent Story Challenge
                {summary.previous && (
                  <> · {latest.gradableCorrect}/{latest.gradableTotal}, up from {summary.previous.gradableCorrect}/{summary.previous.gradableTotal} last time</>
                )}
              </p>
            </div>

            {/* Superpower */}
            <div style={{ background: "linear-gradient(135deg,#FFF9DB,#FFF3E0)", borderRadius: 20, padding: 18, border: "1px solid rgba(249,199,0,0.3)" }}>
              <p style={{ margin: 0, fontFamily: "'Nunito', sans-serif", fontSize: 11.5, fontWeight: 800, color: "#a16a00", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                <Trophy size={12} style={{ display: "inline", marginRight: 4, verticalAlign: -1 }} /> Superpower
              </p>
              <p style={{ margin: "6px 0 0", fontFamily: "'Baloo 2', sans-serif", fontSize: 18, fontWeight: 700, color: "var(--lf-dark)" }}>
                {PILLAR_EMOJI[latest.superpower as Pillar]} {PILLAR_LABELS[latest.superpower as Pillar]}
              </p>
            </div>

            {/* Growing in */}
            <div style={{ background: "linear-gradient(135deg,#F3EEFF,#F5FFFE)", borderRadius: 20, padding: 18, border: "1px solid rgba(168,85,247,0.25)" }}>
              <p style={{ margin: 0, fontFamily: "'Nunito', sans-serif", fontSize: 11.5, fontWeight: 800, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                🌱 Growing in
              </p>
              <p style={{ margin: "6px 0 0", fontFamily: "'Baloo 2', sans-serif", fontSize: 18, fontWeight: 700, color: "var(--lf-dark)" }}>
                {PILLAR_EMOJI[latest.growingIn as Pillar]} {PILLAR_LABELS[latest.growingIn as Pillar]}
              </p>
            </div>

            {/* Full pillar breakdown */}
            <div className="flex flex-col gap-2.5">
              <p style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 12.5, color: "rgba(45,45,45,0.55)", textTransform: "uppercase", letterSpacing: "0.05em", margin: "8px 0 0" }}>
                By pillar
              </p>
              {PILLAR_ORDER.map((p) => {
                const bucket = latest.perPillar.find((b: { pillar: string; correct: number; total: number }) => b.pillar === p);
                const correct = bucket?.correct ?? 0;
                const total = bucket?.total ?? 0;
                return (
                  <div key={p} className="flex items-center justify-between p-3.5 rounded-2xl" style={{ background: "#fff", border: "1.5px solid rgba(14,10,31,0.08)" }}>
                    <div className="flex items-center gap-2.5">
                      <span style={{ width: 30, height: 30, borderRadius: "50%", background: PILLAR_COLORS[p], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>
                        {PILLAR_EMOJI[p]}
                      </span>
                      <span style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 14, color: "var(--lf-dark)" }}>
                        {PILLAR_LABELS[p]}
                      </span>
                    </div>
                    <span style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: 15, color: PILLAR_COLORS[p] }}>
                      {total > 0 ? `${correct}/${total}` : "—"}
                    </span>
                  </div>
                );
              })}
            </div>

            {history && history.length > 1 && (
              <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12.5, color: "rgba(45,45,45,0.4)", textAlign: "center", marginTop: 4 }}>
                {history.length} Story Challenges completed so far
              </p>
            )}
          </>
        )}
      </main>
      <MobileBottomNav />
    </div>
  );
}
