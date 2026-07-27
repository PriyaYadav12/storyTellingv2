import Link from "next/link";
import { ArrowRight } from "lucide-react";

const faqs = [
  {
    q: "What age group is Lalli Fafa designed for?",
    a: "Lalli Fafa stories are crafted for children aged 2 to 10. Shorter stories suit toddlers (age 2–4) who love narration, while medium and long stories engage older children who follow along with text. Themes and lesson complexity adapt based on the age you set.",
  },
  {
    q: "Is there a free plan — and what does it include?",
    a: "Yes. Sign up free and receive 250 welcome credits with no credit card required. That's enough for approximately 3–4 fully illustrated and narrated stories. There's no time limit on free credits. Upgrade to the Magic Pass (₹199/month) to unlock Hindi narration, longer stories, and priority generation.",
  },
  {
    q: "How long does it take to generate a personalised story?",
    a: "Under 2 minutes from clicking Generate to a fully narrated story with illustrations. Story text, AI scene images, and voice narration are all generated simultaneously — so there's no waiting between steps.",
  },
  {
    q: "Are Lalli Fafa stories available in Hindi?",
    a: "Yes. Full Hindi narration with native-quality voices is available on all paid plans. English narration is available on every plan including the free tier. Both languages feature separate character voices for Lalli, Fafa, your child, and the narrator.",
  },
  {
    q: "How is Lalli Fafa different from other kids' story apps?",
    a: "Most story apps offer fixed, generic stories. Lalli Fafa generates a unique story every time, personalised with your child's name and interests. There are no ads, no random content, and no passive watching — every story is an active, narrated experience designed to build vocabulary, listening skills, and values.",
  },
  {
    q: "Is the content safe and age-appropriate?",
    a: "Absolutely. Lalli Fafa is 100% ad-free and contains no third-party trackers. All stories are generated within carefully designed templates that ensure age-appropriate themes, positive values, and safe language. Parents retain full control over the content their child experiences.",
  },
  {
    q: "Can I share a Lalli Fafa story with family members?",
    a: "Yes. Every generated story has a shareable public preview link. Family members — including grandparents — can view and listen to the story without needing a Lalli Fafa account. Stories can also be shared directly via WhatsApp or Facebook.",
  },
];

export function FAQSection() {
  return (
    <section className="py-7 lg:py-10" style={{ background: "linear-gradient(160deg, #FFF0E6 0%, #FFE4D4 100%)" }}>
      <div className="mx-auto px-6" style={{ maxWidth: 760 }}>
        <div className="text-center mb-5 flex flex-col items-center gap-2">
          <h2
            style={{
              fontFamily: "'Baloo 2', sans-serif",
              fontSize: "clamp(1.8rem, 3.5vw, 2.4rem)",
              fontWeight: 800,
              color: "var(--lf-dark)",
            }}
          >
            Have questions about Lalli Fafa?
          </h2>
          <p style={{ color: "rgba(14,10,31,0.55)", fontSize: "0.95rem" }}>
            Still curious?{" "}
            <Link href="/learn" style={{ color: "var(--lf-teal)", fontWeight: 700 }}>
              Visit our Learn page
            </Link>{" "}
            for everything.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {faqs.map((faq, i) => (
            <details
              key={i}
              className="rounded-2xl overflow-hidden group"
              style={{
                background: "rgba(255,255,255,0.55)",
                border: "1.5px solid rgba(0,0,0,0.06)",
              }}
            >
              <summary
                className="flex items-center justify-between gap-4 p-5 cursor-pointer list-none"
                style={{ WebkitAppearance: "none" }}
              >
                <span
                  style={{
                    fontFamily: "'Baloo 2', sans-serif",
                    fontWeight: 700,
                    fontSize: "0.98rem",
                    color: "var(--lf-dark)",
                  }}
                >
                  {faq.q}
                </span>
                <span
                  style={{ color: "var(--lf-teal)", fontSize: "1.2rem", flexShrink: 0, lineHeight: 1 }}
                  aria-hidden="true"
                >
                  +
                </span>
              </summary>
              <div className="px-5 pb-5">
                <p style={{ color: "rgba(14,10,31,0.65)", fontSize: "0.92rem", lineHeight: 1.7 }}>{faq.a}</p>
              </div>
            </details>
          ))}
        </div>

        <div className="text-center mt-6">
          <Link
            href="/learn"
            className="inline-flex items-center gap-2 font-bold"
            style={{ color: "var(--lf-teal)", fontSize: "0.95rem" }}
          >
            See all questions &amp; answers
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
