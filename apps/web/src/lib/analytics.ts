/* ─────────────────────────────────────────────────────────────
   Lalli Fafa — Analytics helpers
   Usage:  import { trackEvent } from "@/lib/analytics";
           trackEvent("sign_up", { method: "email" });
───────────────────────────────────────────────────────────── */

type GtagEventParams = Record<string, string | number | boolean | undefined>;

export function trackEvent(eventName: string, params?: GtagEventParams) {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;
  window.gtag("event", eventName, params);
}

/* ── Typed helpers for key conversion events ── */

/** Fired when a new account is created (email or Google) */
export function trackSignUp(method: "email" | "google") {
  trackEvent("sign_up", { method });
}

/** Fired when onboarding is completed — also sends a Google Ads conversion if the label is configured */
export function trackOnboardingComplete() {
  trackEvent("onboarding_complete");
  // Fire Google Ads conversion for "Free Trial Sign Up"
  // Set NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL in Vercel env vars once you create
  // the conversion action in Google Ads (Goals → Conversions → New conversion action).
  const conversionLabel = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL;
  if (typeof window !== "undefined" && typeof window.gtag === "function" && conversionLabel) {
    window.gtag("event", "conversion", {
      send_to: `AW-17812500793/${conversionLabel}`,
      value: 0,
      currency: "INR",
    });
  }
}

/** Fired every time a story is generated */
export function trackStoryGenerated(params: {
  theme: string;
  language: "English" | "Hindi";
  length: "short" | "medium" | "long";
}) {
  trackEvent("story_generated", params);
}

/** Fired when user clicks any upgrade / pricing CTA */
export function trackUpgradeClick(plan: "monthly" | "yearly", source: string) {
  trackEvent("upgrade_click", { plan, source });
}

/** Fired when a story is shared */
export function trackStoryShared(method: "link" | "whatsapp" | "facebook") {
  trackEvent("story_shared", { method });
}

/** Fired when verification email is requested */
export function trackEmailVerificationRequested() {
  trackEvent("email_verification_requested");
}
