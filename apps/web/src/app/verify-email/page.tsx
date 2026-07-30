"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get("error");
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const isError = !!error;

  async function handleResend() {
    setResending(true);
    try {
      const { authClient } = await import("@/lib/auth-client");
      await authClient.sendVerificationEmail({
        email: "",
        callbackURL: "/onboarding",
      });
      setResent(true);
    } catch {
      // silently ignore — user may not be logged in
    } finally {
      setResending(false);
    }
  }

  if (isError) {
    const isExpired =
      error?.toLowerCase().includes("expired") ||
      error?.toLowerCase().includes("token");

    return (
      <div
        className="min-h-screen flex items-center justify-center px-6"
        style={{ background: "var(--lf-cream)" }}
      >
        <div className="w-full text-center" style={{ maxWidth: 460 }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>😔</div>
          <h1
            style={{
              fontFamily: "'Baloo 2', sans-serif",
              fontSize: "clamp(1.7rem, 3vw, 2.2rem)",
              fontWeight: 800,
              color: "var(--lf-dark)",
              lineHeight: 1.2,
              marginBottom: "0.75rem",
            }}
          >
            {isExpired ? "Link expired" : "Verification failed"}
          </h1>
          <p
            style={{
              color: "rgba(45,45,45,0.6)",
              fontSize: "1rem",
              lineHeight: 1.6,
              marginBottom: "2rem",
            }}
          >
            {isExpired
              ? "This verification link has expired. Links are only valid for 24 hours — please request a new one."
              : "We couldn't verify your email. The link may have already been used or may be invalid."}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "center" }}>
            {resent ? (
              <p style={{ color: "var(--lf-purple)", fontWeight: 700, fontSize: "0.95rem" }}>
                ✅ New verification email sent — check your inbox!
              </p>
            ) : (
              <button
                className="btn-primary"
                onClick={handleResend}
                disabled={resending}
                style={{ display: "inline-flex", justifyContent: "center", fontSize: "1rem", padding: "0.85rem 2rem", opacity: resending ? 0.7 : 1 }}
              >
                {resending ? "Sending…" : "✉️ Resend verification email"}
              </button>
            )}
            <Link
              href="/sign-in"
              style={{ color: "rgba(45,45,45,0.4)", fontSize: "0.85rem" }}
            >
              Back to sign in →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "var(--lf-cream)" }}
    >
      <div className="w-full text-center" style={{ maxWidth: 460 }}>
        <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>✅</div>
        <h1
          style={{
            fontFamily: "'Baloo 2', sans-serif",
            fontSize: "clamp(1.7rem, 3vw, 2.2rem)",
            fontWeight: 800,
            color: "var(--lf-dark)",
            lineHeight: 1.2,
            marginBottom: "0.75rem",
          }}
        >
          Email verified!
        </h1>
        <p
          style={{
            color: "rgba(45,45,45,0.6)",
            fontSize: "1rem",
            lineHeight: 1.6,
            marginBottom: "2rem",
          }}
        >
          Your Lalli Fafa account is now active. Time to create your child's first magical story!
        </p>
        <Link
          href="/onboarding"
          className="btn-primary"
          style={{ display: "inline-flex", justifyContent: "center", fontSize: "1rem", padding: "0.85rem 2rem" }}
        >
          ✨ Let's get started
        </Link>
        <p style={{ marginTop: "1.5rem" }}>
          <Link
            href="/dashboard"
            style={{ color: "rgba(45,45,45,0.4)", fontSize: "0.85rem" }}
          >
            Already set up? Go to dashboard →
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
