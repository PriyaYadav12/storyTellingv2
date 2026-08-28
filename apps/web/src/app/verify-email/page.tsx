"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, AlertTriangle, XCircle, Loader2 } from "lucide-react";
import { useState } from "react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const isError = !!error;
  const isExpired =
    error?.toLowerCase().includes("expired") ||
    error?.toLowerCase().includes("token");

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

  return (
    <div className="min-h-screen flex" style={{ background: "var(--lf-dark)" }}>

      {/* ── Left panel ── */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 flex-shrink-0 relative overflow-hidden"
        style={{ width: 420, background: "linear-gradient(160deg,#131020 0%,#1c1640 100%)" }}
      >
        {/* Glow orbs */}
        <div className="absolute pointer-events-none" style={{ top: -80, right: -60, width: 300, height: 300, background: "radial-gradient(circle,rgba(0,201,167,0.18) 0%,transparent 70%)" }} />
        <div className="absolute pointer-events-none" style={{ bottom: 60, left: -60, width: 240, height: 240, background: "radial-gradient(circle,rgba(249,199,0,0.12) 0%,transparent 70%)" }} />

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 relative z-10">
          <div className="relative" style={{ width: 44, height: 44 }}>
            <Image src="/lf-logo.png" alt="Lalli Fafa" fill className="object-contain" />
          </div>
          <span style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: 20, fontWeight: 800, color: "#fff" }}>
            Lalli <span style={{ color: "var(--lf-teal)" }}>Fafa</span>
          </span>
        </Link>

        {/* Hero + copy */}
        <div className="flex flex-col items-center gap-6 relative z-10">
          <div className="relative" style={{ width: 200, height: 200 }}>
            <Image src="/lf-hero.png" alt="Lalli and Fafa" fill className="object-contain animate-float-slow" />
          </div>
          <div className="flex flex-col gap-3 text-center">
            <h2 style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: "1.5rem", color: "#fff", lineHeight: 1.25 }}>
              {isError ? "Almost there!" : "You're in! 🎉"}
            </h2>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.88rem", lineHeight: 1.7 }}>
              {isError
                ? "Every adventure begins with one step — let's sort this out and get you started."
                : "Your child is about to become the hero of every story. The magic starts now."}
            </p>
          </div>
        </div>

        <p style={{ color: "rgba(255,255,255,0.18)", fontSize: "0.8rem", position: "relative", zIndex: 10 }}>
          &copy; {new Date().getFullYear()} Lalli Fafa
        </p>
      </div>

      {/* ── Right panel ── */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-6 py-12"
        style={{ background: "#FFF8E7", minHeight: "100vh" }}
      >
        {/* Mobile logo */}
        <Link href="/" className="flex items-center gap-2 mb-10 lg:hidden">
          <div className="relative" style={{ width: 36, height: 36 }}>
            <Image src="/lf-logo.png" alt="Lalli Fafa" fill className="object-contain" />
          </div>
          <span style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: "1.15rem", color: "var(--lf-dark)" }}>
            Lalli <span style={{ color: "var(--lf-teal)" }}>Fafa</span>
          </span>
        </Link>

        <div className="w-full flex flex-col items-center gap-6" style={{ maxWidth: 420 }}>

          {isError ? (
            <>
              {/* Error icon */}
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "rgba(251,113,133,0.12)" }}>
                {isExpired
                  ? <AlertTriangle size={38} style={{ color: "#f43f5e" }} />
                  : <XCircle size={38} style={{ color: "#f43f5e" }} />}
              </div>

              <div className="flex flex-col items-center gap-3 text-center">
                <h1 style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: "clamp(1.7rem,3vw,2.1rem)", color: "var(--lf-dark)", lineHeight: 1.2 }}>
                  {isExpired ? "Link expired" : "Verification failed"}
                </h1>
                <p style={{ color: "rgba(45,45,45,0.6)", fontSize: "1rem", lineHeight: 1.65, maxWidth: 360 }}>
                  {isExpired
                    ? "This verification link has expired. Links are only valid for 24 hours — request a new one below."
                    : "We couldn't verify your email. The link may have already been used or may be invalid."}
                </p>
              </div>

              <div className="flex flex-col gap-3 w-full items-center">
                {resent ? (
                  <div className="flex items-center gap-2 px-5 py-3 rounded-2xl w-full justify-center" style={{ background: "rgba(0,201,167,0.1)", border: "1.5px solid rgba(0,201,167,0.25)" }}>
                    <CheckCircle2 size={18} style={{ color: "var(--lf-teal)" }} />
                    <p style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: "0.95rem", color: "var(--lf-dark)" }}>
                      Sent! Check your inbox.
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={handleResend}
                    disabled={resending}
                    className="btn-primary w-full justify-center"
                    style={{ fontSize: "1rem", padding: "0.9rem 2rem", opacity: resending ? 0.7 : 1 }}
                  >
                    {resending ? <Loader2 size={18} className="animate-spin" /> : null}
                    {resending ? "Sending…" : "Resend verification email"}
                  </button>
                )}
                <Link href="/sign-in" style={{ color: "rgba(45,45,45,0.4)", fontSize: "0.85rem", fontFamily: "'Nunito', sans-serif" }}>
                  Back to sign in →
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* Success icon */}
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "rgba(0,201,167,0.12)" }}>
                <CheckCircle2 size={42} style={{ color: "var(--lf-teal)" }} />
              </div>

              <div className="flex flex-col items-center gap-3 text-center">
                <h1 style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: "clamp(1.7rem,3vw,2.1rem)", color: "var(--lf-dark)", lineHeight: 1.2 }}>
                  Email verified!
                </h1>
                <p style={{ color: "rgba(45,45,45,0.6)", fontSize: "1rem", lineHeight: 1.65, maxWidth: 360 }}>
                  Your Lalli Fafa account is now active. Time to create your child's first magical story!
                </p>
              </div>

              <div className="flex flex-col gap-3 w-full items-center">
                <Link
                  href="/onboarding"
                  className="btn-primary w-full justify-center"
                  style={{ fontSize: "1rem", padding: "0.9rem 2rem" }}
                >
                  Let&apos;s get started →
                </Link>
                <Link href="/dashboard" style={{ color: "rgba(45,45,45,0.4)", fontSize: "0.85rem", fontFamily: "'Nunito', sans-serif" }}>
                  Already set up? Go to dashboard →
                </Link>
              </div>
            </>
          )}
        </div>
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
