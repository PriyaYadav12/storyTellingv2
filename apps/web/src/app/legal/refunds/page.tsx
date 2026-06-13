import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

const BASE = "https://www.lallifafa.com";

export const metadata: Metadata = {
  title: "Refund Policy — Lalli Fafa",
  description: "Lalli Fafa Refund Policy. How refunds, cancellations, and billing issues are handled for Magic Pass subscriptions.",
  alternates: { canonical: `${BASE}/legal/refunds` },
};

const LAST_UPDATED = "13 Jun 2026";

export default function RefundsPage() {
  return (
    <>
      <SiteHeader />
      <main style={{ background: "var(--lf-cream)", paddingTop: 72 }}>
        <div className="mx-auto px-5 py-14" style={{ maxWidth: 760 }}>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 mb-8 text-sm font-semibold transition-all hover:opacity-70"
            style={{ color: "var(--lf-teal)", fontFamily: "'Nunito', sans-serif" }}
          >
            <ArrowLeft size={15} /> Back to home
          </Link>

          <h1
            style={{
              fontFamily: "'Baloo 2', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(2rem,4vw,2.8rem)",
              color: "var(--lf-dark)",
              lineHeight: 1.15,
            }}
          >
            Refund Policy
          </h1>
          <p className="mt-2 mb-10" style={{ fontFamily: "'Nunito', sans-serif", fontSize: "0.88rem", color: "rgba(45,45,45,0.45)" }}>
            Last updated: {LAST_UPDATED}
          </p>

          <div className="legal-content flex flex-col gap-8">

            <Section title="1. Free Plan">
              <p>Every account starts on our free plan with a one-time allotment of welcome credits — no payment information is required, and there is nothing to refund.</p>
            </Section>

            <Section title="2. Magic Pass Subscriptions">
              <p>Magic Pass (Monthly and Yearly) is a recurring subscription billed via Razorpay in Indian Rupees (INR). Because credits are made available to your account immediately and in full at the start of each billing period:</p>
              <ul>
                <li>Subscription fees are <strong>generally non-refundable</strong>, including for partially used billing periods</li>
                <li>Unused credits do not roll over and are not eligible for cash refunds</li>
                <li>You can cancel auto-renewal at any time from your dashboard — you&apos;ll keep access to your current plan&apos;s features and remaining credits until the end of the period you&apos;ve already paid for</li>
              </ul>
            </Section>

            <Section title="3. When We Do Issue Refunds">
              <p>We will issue a full or partial refund in the following situations:</p>
              <ul>
                <li><strong>Duplicate or accidental charges</strong> — if you were charged more than once for the same billing period due to a technical error</li>
                <li><strong>Payment processed but credits not received</strong> — if Razorpay confirms a successful charge but your account was not credited due to a system error on our end, and the issue cannot be resolved by crediting your account</li>
                <li><strong>Unauthorised transactions</strong> — if your payment method was used without your authorisation, subject to verification</li>
                <li><strong>Service unavailability</strong> — if a paid feature you subscribed for (e.g. voice narration) is unavailable for an extended period due to an issue on our side</li>
              </ul>
              <p>We assess these on a case-by-case basis. Where we&apos;re able to, our first step is usually to fix the issue and credit your account directly rather than process a monetary refund — let us know if you&apos;d prefer a refund instead.</p>
            </Section>

            <Section title="4. What's Not Covered">
              <p>Refunds are not provided for:</p>
              <ul>
                <li>Change of mind after a subscription has been purchased and credits issued</li>
                <li>Dissatisfaction with AI-generated story content, illustrations, or narration quality (we&apos;re always improving — please share feedback so we can do better, but content quality alone isn&apos;t grounds for a refund)</li>
                <li>Forgetting to cancel before a renewal date</li>
                <li>Account suspension due to a violation of our <Link href="/legal/terms" style={{ color: "var(--lf-teal)", fontWeight: 600 }}>Terms of Service</Link></li>
              </ul>
            </Section>

            <Section title="5. How to Request a Refund">
              <p>Email <a href="mailto:hello@lallifafa.com" style={{ color: "var(--lf-teal)" }}>hello@lallifafa.com</a> with:</p>
              <ul>
                <li>The email address associated with your account</li>
                <li>The payment date and amount (or a screenshot of the Razorpay receipt/email)</li>
                <li>A brief description of the issue</li>
              </ul>
              <p>We aim to respond within 3–5 business days. Approved refunds are processed back to your original payment method via Razorpay and typically appear within 5–10 business days, depending on your bank or card issuer.</p>
            </Section>

            <Section title="6. Cancelling Your Subscription">
              <p>You can cancel auto-renewal anytime from <strong>Dashboard → Subscription</strong>. Cancelling stops future charges — it does not retroactively refund the current billing period, which you&apos;ll continue to have full access to.</p>
            </Section>

            <Section title="7. Questions">
              <p>If anything about a charge looks wrong, reach out before disputing it with your bank — we&apos;re usually able to sort billing issues out quickly and directly.</p>
              <p>
                <strong>Lalli Fafa</strong><br />
                Email: <a href="mailto:hello@lallifafa.com" style={{ color: "var(--lf-teal)" }}>hello@lallifafa.com</a>
              </p>
            </Section>

          </div>

          <div className="mt-12 pt-8" style={{ borderTop: "1.5px solid rgba(0,0,0,0.07)" }}>
            <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: "0.85rem", color: "rgba(45,45,45,0.45)", lineHeight: 1.6 }}>
              Also see our <Link href="/legal/terms" style={{ color: "var(--lf-teal)", fontWeight: 600 }}>Terms of Service</Link> and <Link href="/legal/privacy" style={{ color: "var(--lf-teal)", fontWeight: 600 }}>Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />

      <style>{`
        .legal-content p {
          font-family: 'Nunito', sans-serif;
          font-size: 0.95rem;
          color: rgba(45,45,45,0.75);
          line-height: 1.8;
          margin-bottom: 0.75rem;
        }
        .legal-content ul {
          margin: 0.5rem 0 0.75rem 1.5rem;
          list-style: disc;
        }
        .legal-content li {
          font-family: 'Nunito', sans-serif;
          font-size: 0.93rem;
          color: rgba(45,45,45,0.7);
          line-height: 1.75;
          margin-bottom: 0.3rem;
        }
        .legal-content strong {
          color: var(--lf-dark);
          font-weight: 700;
        }
      `}</style>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2
        style={{
          fontFamily: "'Baloo 2', sans-serif",
          fontWeight: 800,
          fontSize: "1.15rem",
          color: "var(--lf-dark)",
          lineHeight: 1.2,
        }}
      >
        {title}
      </h2>
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  );
}
