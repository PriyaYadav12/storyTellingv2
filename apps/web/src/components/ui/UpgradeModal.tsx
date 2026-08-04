"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Sparkles, Zap } from "lucide-react";
import { trackUpgradeClick } from "@/lib/analytics";

export type UpgradeTrigger =
  | "locked_length"
  | "no_credits"
  | "low_credits"
  | "end_of_story";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  trigger: UpgradeTrigger;
  childName?: string;
  lockedLength?: "medium" | "long";
}

const COPY: Record<UpgradeTrigger, (childName?: string, lockedLength?: string) => {
  emoji: string;
  headline: string;
  sub: string;
  cta: string;
}> = {
  locked_length: (childName, lockedLength) => ({
    emoji: "🔮",
    headline: lockedLength === "long"
      ? `A 10-minute epic for ${childName ?? "your little one"}!`
      : `A richer story for ${childName ?? "your little one"}!`,
    sub: lockedLength === "long"
      ? "Fafa says the BEST part happens on page 3... but only Magic Pass readers get that far. 🌟"
      : "Lalli whispers: “the medium story has plot twists and a surprise ending...” — upgrade to unlock it! ✨",
    cta: "Unlock with Magic Pass →",
  }),
  no_credits: (childName) => ({
    emoji: "⚡",
    headline: "Fafa ran out of story magic!",
    sub: `${childName ?? "Your child"} is waiting for tonight's bedtime story... Quick, get Magic Pass before the stars come out! 🌙`,
    cta: "Get Magic Pass — ₹199/mo →",
  }),
  low_credits: (childName) => ({
    emoji: "🌟",
    headline: "Almost out of story magic!",
    sub: `${childName ?? "Your little one"} has more adventures ahead — don't let the stories stop! Get unlimited stories with Magic Pass. ✨`,
    cta: "Get Magic Pass — ₹199/mo →",
  }),
  end_of_story: (childName) => ({
    emoji: "🥹",
    headline: `Did ${childName ?? "your child"} love the story?`,
    sub: "Lalli & Fafa have 999 more adventures waiting... but your free credits are running low. Unlock unlimited stories tonight! 🌙",
    cta: "Start Magic Pass — ₹199/mo →",
  }),
};

const PERKS = [
  { icon: "📚", text: "Unlimited stories, every day" },
  { icon: "🎧", text: "Beautiful voice narration (EN + HI)" },
  { icon: "🎨", text: "AI illustrations in every tale" },
  { icon: "⚡", text: "Medium & long story lengths unlocked" },
];

export function UpgradeModal({ open, onClose, trigger, childName, lockedLength }: UpgradeModalProps) {
  const copy = COPY[trigger](childName, lockedLength);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0"
      style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(14px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl relative overflow-hidden"
        style={{
          background: "linear-gradient(160deg,#1a1740 0%,#0e2920 55%,#1a1040 100%)",
          border: "1.5px solid rgba(0,201,167,0.35)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dismiss */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-white/15"
          style={{ color: "rgba(255,255,255,0.5)" }}
          aria-label="Close"
        >
          <X size={16} />
        </button>

        {/* Character + glow */}
        <div className="relative flex justify-center pt-6 pb-2">
          <div
            className="absolute inset-x-0 top-0 h-36"
            style={{
              background: "radial-gradient(ellipse at 50% 0%, rgba(0,201,167,0.18) 0%, transparent 70%)",
            }}
          />
          <div className="relative" style={{ width: 120, height: 120 }}>
            <Image
              src="/lf-hero.png"
              alt="Lalli and Fafa"
              fill
              className="object-contain drop-shadow-lg"
              priority
            />
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 flex flex-col gap-5">
          {/* Headline */}
          <div className="text-center flex flex-col gap-2">
            <span style={{ fontSize: "2rem", lineHeight: 1 }}>{copy.emoji}</span>
            <h2
              style={{
                fontFamily: "'Baloo 2', sans-serif",
                fontWeight: 800,
                fontSize: "1.35rem",
                color: "#fff",
                lineHeight: 1.2,
              }}
            >
              {copy.headline}
            </h2>
            <p
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontSize: "0.88rem",
                color: "rgba(255,255,255,0.65)",
                lineHeight: 1.5,
              }}
            >
              {copy.sub}
            </p>
          </div>

          {/* Perks */}
          <div className="flex flex-col gap-2">
            {PERKS.map((p) => (
              <div key={p.text} className="flex items-center gap-3">
                <span style={{ fontSize: "1.05rem", flexShrink: 0 }}>{p.icon}</span>
                <span
                  style={{
                    fontFamily: "'Nunito', sans-serif",
                    fontSize: "0.83rem",
                    color: "rgba(255,255,255,0.75)",
                    fontWeight: 600,
                  }}
                >
                  {p.text}
                </span>
              </div>
            ))}
          </div>

          {/* Price hint */}
          <div
            className="flex items-center justify-center gap-2 py-2 px-4 rounded-2xl"
            style={{ background: "rgba(0,201,167,0.12)", border: "1px solid rgba(0,201,167,0.25)" }}
          >
            <Zap size={14} style={{ color: "var(--lf-teal)", flexShrink: 0 }} />
            <span
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontSize: "0.8rem",
                color: "rgba(255,255,255,0.7)",
              }}
            >
              Just <strong style={{ color: "#fff" }}>₹199/month</strong> — less than a comic book
            </span>
          </div>

          {/* CTA */}
          <Link
            href="/pricing"
            onClick={() => {
              trackUpgradeClick("monthly", `upgrade_modal_${trigger}`);
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base transition-all hover:scale-[1.02] active:scale-95"
            style={{
              background: "linear-gradient(135deg,var(--lf-teal) 0%,#00a38d 100%)",
              color: "#fff",
              fontFamily: "'Baloo 2', sans-serif",
              boxShadow: "0 6px 24px rgba(0,201,167,0.4)",
              letterSpacing: "0.01em",
            }}
          >
            <Sparkles size={17} />
            {copy.cta}
          </Link>

          <p
            className="text-center"
            style={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: "0.72rem",
              color: "rgba(255,255,255,0.3)",
            }}
          >
            Cancel anytime · No hidden fees
          </p>
        </div>
      </div>
    </div>
  );
}
