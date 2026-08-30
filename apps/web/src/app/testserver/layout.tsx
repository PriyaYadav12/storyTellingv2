"use client";

// TESTSERVER — staging route for the Story Challenge admin/dev flows
// (Functional Spec v1.1 §8), now ALSO the production route for Story
// Challenge itself: real end-of-story/results pages link here once a user
// is allowlisted for the staged rollout (see testserver/_shared.ts,
// assertChallengeAccess). Admins keep full access to every page here
// (dev/testing); allowlisted non-admin users get the same pages but without
// the admin-only chrome below, since they're real families, not testers.
//
// Access rule: unauthenticated visitors are redirected to sign-in;
// authenticated users who are neither admin nor allowlisted get notFound()
// — a plain 404, never a login prompt that would reveal this route exists.

import { useEffect } from "react";
import { useRouter, notFound } from "next/navigation";
import Link from "next/link";
import { useQuery, useConvexAuth } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function TestServerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useConvexAuth();
  const role = useQuery(api.auth.getUserRole, isAuthenticated ? {} : "skip") as string | null | undefined;
  const rolloutEnabled = useQuery(
    api["testserver/_shared"].isChallengeRolloutEnabled,
    isAuthenticated ? {} : "skip"
  ) as boolean | undefined;

  const isAdmin = role === "admin";
  const allowed = isAdmin || rolloutEnabled === true;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/sign-in?redirect=/testserver");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || (isAuthenticated && (role === undefined || rolloutEnabled === undefined))) {
    return (
      <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--lf-cream)" }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid rgba(0,184,166,0.2)", borderTopColor: "var(--lf-teal)", animation: "ts-spin 0.7s linear infinite" }} />
        <style>{`@keyframes ts-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAuthenticated) return null; // redirect handled above

  if (!allowed) {
    notFound();
  }

  return (
    <div style={{ minHeight: "100dvh", background: "var(--lf-cream)", display: "flex", flexDirection: "column" }}>
      {isAdmin && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            background: "#1a1a2e",
            padding: "7px 14px",
            flexShrink: 0,
            fontFamily: "'Nunito', sans-serif",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10.5, fontWeight: 800, letterSpacing: "0.07em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--lf-sunshine)" }} />
            Test server · admin only
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            <Link href="/testserver" className="ts-navlink">🏠 Home</Link>
            <Link href="/testserver/report" className="ts-navlink">📬 Report</Link>
          </div>
        </div>
      )}
      <style>{`
        .ts-navlink {
          font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.75);
          text-decoration: none; padding: 3px 10px; border-radius: 999px;
          background: rgba(255,255,255,0.08); transition: background 0.15s;
        }
        .ts-navlink:hover { background: rgba(255,255,255,0.18); color: #fff; }
      `}</style>
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflowY: "auto" }}>{children}</div>
    </div>
  );
}
