import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, BookOpen, Languages, Heart, ShieldCheck, Volume2 } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

const BASE = "https://www.lallifafa.com";

export const metadata: Metadata = {
  title: "Hindi Stories for Kids — Personalised Bedtime Stories in Hindi",
  description:
    "AI-powered personalised Hindi bedtime stories for children aged 2–10. Your child is the hero alongside Lalli & Fafa — fully narrated in natural Hindi with illustrated scenes. Free to try.",
  alternates: { canonical: `${BASE}/hindi-stories` },
  keywords: [
    "hindi stories for kids",
    "hindi bedtime stories",
    "bachon ki kahaniyan hindi mein",
    "personalised hindi stories",
    "hindi kahaniyan for children",
    "hindi audio stories for kids",
    "bilingual stories english hindi",
    "hindi stories india",
    "ai hindi stories",
    "lalli fafa hindi",
  ],
  openGraph: {
    type: "website",
    url: `${BASE}/hindi-stories`,
    title: "Hindi Stories for Kids — Personalised & Narrated | Lalli Fafa",
    description:
      "Personalised Hindi bedtime stories where your child is the hero. Natural Hindi narration, illustrated scenes, safe and ad-free. Loved by families across India.",
    images: [{ url: `${BASE}/opengraph-image`, width: 1200, height: 630, alt: "Hindi bedtime stories for kids — Lalli Fafa" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hindi Stories for Kids | Lalli Fafa",
    description: "Personalised Hindi bedtime stories where your child is the hero — with Lalli & Fafa.",
    images: [`${BASE}/opengraph-image`],
  },
};

const benefits = [
  {
    icon: Languages,
    color: "var(--lf-electric)",
    bg: "rgba(124,77,255,0.1)",
    title: "Natural Hindi, not translated Hindi",
    body: "Our stories are written natively for Hindi — not machine-translated from English. The phrasing, rhythm, and idioms feel like a real dadi or nani telling a story.",
  },
  {
    icon: Heart,
    color: "var(--lf-mango)",
    bg: "rgba(255,87,34,0.08)",
    title: "Your child's name, woven in",
    body: "Lalli and Fafa say your child's name throughout — in Hindi dialogue that sounds warm and natural. Not a name placeholder, but a character who genuinely belongs in the story.",
  },
  {
    icon: Volume2,
    color: "var(--lf-teal)",
    bg: "rgba(0,201,167,0.1)",
    title: "Four distinct Hindi voices",
    body: "A warm narrator voice, Lalli's voice, Fafa's voice, and a child character voice — each distinct, each designed for a young listener's attention span.",
  },
  {
    icon: ShieldCheck,
    color: "var(--lf-sunshine)",
    bg: "rgba(249,199,0,0.12)",
    title: "Safe, ad-free, private",
    body: "No ads. No tracking. No open-ended AI your child can steer. Every story comes from a fixed set of age-appropriate themes and lessons — designed by humans first.",
  },
];

const faqs = [
  {
    q: "Are the Hindi stories actually in Hindi, or just English stories with a Hindi voice?",
    a: "The stories are written in Hindi from the start — not translated from English. The text, phrasing, and dialogue are all native Hindi, so they sound natural when read aloud rather than like a literal translation.",
  },
  {
    q: "Is Hindi available on the free plan?",
    a: "English stories are available on all plans including the free plan (200 welcome credits). Hindi narration is available on the Magic Pass plan (₹199/month), which includes 1,000 credits per month, Hindi voice narration, and illustrated scenes.",
  },
  {
    q: "What themes are available in Hindi?",
    a: "All 10+ story themes are available in Hindi — adventure quests, forest magic, festival celebrations, bedtime journeys, friendship stories, and more. You choose the theme and language when generating, and the story is written natively in Hindi with your child as the hero.",
  },
  {
    q: "Can grandparents who only speak Hindi use Lalli Fafa?",
    a: "Yes — the stories are narrated in clear, warm Hindi that anyone comfortable with the language can follow. Many families use Lalli Fafa specifically so dadi, dadu, nani, and nanu can share a bedtime story with grandchildren even when they're not in the same city.",
  },
  {
    q: "How personalised are the Hindi stories?",
    a: "Very personalised. Your child's name, favourite animal, favourite colour, and gender are woven directly into the Hindi story — not just mentioned, but made part of the plot. Lalli and Fafa use your child's name naturally in Hindi dialogue throughout.",
  },
  {
    q: "Do Hindi stories also have illustrated scenes?",
    a: "Yes. Every story — in any language — generates five illustrated cinematic scenes showing Lalli, Fafa, and your child together. The illustrations are the same regardless of language choice; only the narration and story text change.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BASE },
        { "@type": "ListItem", position: 2, name: "Hindi Stories for Kids", item: `${BASE}/hindi-stories` },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map(({ q, a }) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    },
    {
      "@type": "WebPage",
      "@id": `${BASE}/hindi-stories`,
      name: "Hindi Stories for Kids — Personalised Bedtime Stories in Hindi",
      description: "AI-powered personalised Hindi bedtime stories for children aged 2–10, with natural Hindi narration and illustrated scenes.",
      url: `${BASE}/hindi-stories`,
      inLanguage: ["en-IN", "hi-IN"],
      publisher: { "@type": "Organization", name: "Lalli Fafa", url: BASE },
      speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: ["h1", ".hindi-faq-section"],
      },
    },
  ],
};

const themes = [
  { emoji: "🌙", label: "Bedtime Journey", hindi: "रात की जादुई सैर" },
  { emoji: "🎆", label: "Festival Celebration", hindi: "त्योहार की खुशी" },
  { emoji: "🌳", label: "Forest Magic", hindi: "जंगल का जादू" },
  { emoji: "🚀", label: "Space Adventure", hindi: "अंतरिक्ष की यात्रा" },
  { emoji: "🤝", label: "Friendship", hindi: "दोस्ती की कहानी" },
  { emoji: "💪", label: "Courage", hindi: "हिम्मत की बात" },
];

export default function HindiStoriesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />
      <main>

        {/* ── Hero ── */}
        <section
          style={{
            background: "linear-gradient(160deg, #131020 0%, #0d2d26 60%, #131020 100%)",
            paddingTop: 96,
            paddingBottom: 64,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Glow orbs */}
          <div className="absolute pointer-events-none" style={{ top: -40, right: "10%", width: 400, height: 400, background: "radial-gradient(circle, rgba(0,201,167,0.18) 0%, transparent 70%)" }} />
          <div className="absolute pointer-events-none" style={{ bottom: -60, left: "5%", width: 300, height: 300, background: "radial-gradient(circle, rgba(124,77,255,0.15) 0%, transparent 70%)" }} />

          <div className="mx-auto px-5 relative" style={{ maxWidth: 860 }}>
            {/* Badge */}
            <div className="flex justify-center mb-6">
              <span
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold"
                style={{ background: "rgba(0,201,167,0.15)", color: "var(--lf-teal)", border: "1px solid rgba(0,201,167,0.25)" }}
              >
                <Languages size={14} /> Hindi &amp; English · Bilingual Stories
              </span>
            </div>

            {/* Headline */}
            <h1
              className="text-center"
              style={{
                fontFamily: "'Baloo 2', sans-serif",
                fontWeight: 800,
                fontSize: "clamp(2rem, 5vw, 3.2rem)",
                color: "#fff",
                lineHeight: 1.15,
                marginBottom: "1rem",
              }}
            >
              Hindi Bedtime Stories<br />
              <span style={{ color: "var(--lf-teal)" }}>Where Your Child Is the Hero</span>
            </h1>

            {/* Hindi subheading */}
            <p
              className="text-center"
              style={{
                fontFamily: "'Baloo 2', sans-serif",
                fontWeight: 600,
                fontSize: "clamp(1rem, 2.5vw, 1.3rem)",
                color: "rgba(255,255,255,0.5)",
                marginBottom: "0.75rem",
                letterSpacing: "0.01em",
              }}
            >
              आपका बच्चा — हर कहानी का असली नायक
            </p>

            <p
              className="text-center"
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontSize: "1.05rem",
                color: "rgba(255,255,255,0.6)",
                lineHeight: 1.75,
                maxWidth: 600,
                margin: "0 auto 2rem",
              }}
            >
              AI-powered personalised Hindi stories for children aged 2–10. Every story features your child by name, alongside beloved characters Lalli and Fafa — fully narrated in warm, natural Hindi with illustrated scenes.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-base transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg, var(--lf-teal), #00a38d)", color: "#fff", fontFamily: "'Baloo 2', sans-serif", boxShadow: "0 4px 24px rgba(0,201,167,0.4)" }}
              >
                <Sparkles size={18} /> Try free — no card needed
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-base transition-all hover:bg-white/10"
                style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.75)", fontFamily: "'Baloo 2', sans-serif", border: "1px solid rgba(255,255,255,0.12)" }}
              >
                See Hindi plans
              </Link>
            </div>

            {/* Social proof */}
            <p className="text-center mt-6" style={{ fontFamily: "'Nunito', sans-serif", fontSize: "0.82rem", color: "rgba(255,255,255,0.3)" }}>
              Available in English &amp; Hindi
            </p>
          </div>
        </section>

        {/* ── Story themes in Hindi ── */}
        <section style={{ background: "var(--lf-cream)", padding: "56px 0" }}>
          <div className="mx-auto px-5" style={{ maxWidth: 860 }}>
            <h2
              className="text-center"
              style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: "clamp(1.4rem, 3vw, 1.9rem)", color: "var(--lf-dark)", marginBottom: "0.5rem" }}
            >
              10+ Story Themes — All in Hindi
            </h2>
            <p
              className="text-center"
              style={{ fontFamily: "'Nunito', sans-serif", fontSize: "0.95rem", color: "rgba(45,45,45,0.6)", marginBottom: "2rem" }}
            >
              Every theme is written natively in Hindi — not translated. Choose a theme, and the story is generated fresh, with your child as the hero.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {themes.map(({ emoji, label, hindi }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl text-center"
                  style={{ background: "#fff", border: "1.5px solid rgba(0,0,0,0.06)" }}
                >
                  <span style={{ fontSize: "1.75rem" }}>{emoji}</span>
                  <p style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: "0.9rem", color: "var(--lf-dark)" }}>{label}</p>
                  <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: "0.85rem", color: "rgba(45,45,45,0.5)" }}>{hindi}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-6">
              <Link href="/stories" style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: "0.9rem", color: "var(--lf-teal)", textDecoration: "underline" }}>
                View all story themes →
              </Link>
            </div>
          </div>
        </section>

        {/* ── Why Hindi Stories ── */}
        <section style={{ background: "#fff", padding: "56px 0" }}>
          <div className="mx-auto px-5" style={{ maxWidth: 860 }}>
            <div className="flex flex-col lg:flex-row gap-12 items-center">
              <div className="flex-1">
                <h2
                  style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: "clamp(1.4rem, 3vw, 1.9rem)", color: "var(--lf-dark)", marginBottom: "1rem" }}
                >
                  Why Hindi stories matter for your child
                </h2>
                <div className="flex flex-col gap-4">
                  {[
                    { head: "Language roots stick in childhood", body: "Children who hear stories in their mother tongue develop stronger vocabulary, better reading skills, and deeper cultural connection — even when they're equally fluent in English." },
                    { head: "Grandparents can be part of bedtime", body: "When stories are in Hindi, dadi and dadu can sit alongside, follow along, and share the moment — even from another city over a video call." },
                    { head: "Values land differently in your own language", body: "Lessons about honesty, courage, and kindness feel more personal when they come in the language of home — the one children hear from the people they love most." },
                  ].map(({ head, body }) => (
                    <div key={head} className="flex gap-3">
                      <div style={{ width: 6, minWidth: 6, borderRadius: 3, background: "var(--lf-teal)", marginTop: 4 }} />
                      <div>
                        <p style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: "0.97rem", color: "var(--lf-dark)", marginBottom: 2 }}>{head}</p>
                        <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: "0.92rem", color: "rgba(45,45,45,0.68)", lineHeight: 1.7 }}>{body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Testimonial card */}
              <div
                className="flex-shrink-0 rounded-3xl p-7 flex flex-col gap-4"
                style={{ width: "min(100%, 300px)", background: "linear-gradient(135deg, #0d2d26, #131020)", border: "1px solid rgba(0,201,167,0.2)" }}
              >
                <div style={{ fontSize: "1.5rem" }}>⭐⭐⭐⭐⭐</div>
                <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: "0.95rem", color: "rgba(255,255,255,0.75)", lineHeight: 1.75, fontStyle: "italic" }}>
                  "My mother-in-law who speaks only Hindi now listens to stories with the kids. It's become a family ritual every evening."
                </p>
                <p style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: "0.85rem", color: "var(--lf-teal)" }}>— Vikram T., Mumbai</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Benefits grid ── */}
        <section style={{ background: "var(--lf-cream)", padding: "56px 0" }}>
          <div className="mx-auto px-5" style={{ maxWidth: 860 }}>
            <h2
              className="text-center"
              style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: "clamp(1.4rem, 3vw, 1.9rem)", color: "var(--lf-dark)", marginBottom: "2rem" }}
            >
              What makes Lalli Fafa Hindi stories different
            </h2>
            <div className="grid sm:grid-cols-2 gap-5">
              {benefits.map(({ icon: Icon, color, bg, title, body }) => (
                <div
                  key={title}
                  className="flex gap-4 p-6 rounded-2xl"
                  style={{ background: "#fff", border: "1.5px solid rgba(0,0,0,0.06)" }}
                >
                  <div
                    className="flex items-center justify-center flex-shrink-0 rounded-xl"
                    style={{ width: 44, height: 44, background: bg, color }}
                  >
                    <Icon size={20} />
                  </div>
                  <div>
                    <p style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: "0.97rem", color: "var(--lf-dark)", marginBottom: 4 }}>{title}</p>
                    <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: "0.88rem", color: "rgba(45,45,45,0.65)", lineHeight: 1.7 }}>{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section style={{ background: "#fff", padding: "56px 0" }}>
          <div className="mx-auto px-5" style={{ maxWidth: 680 }}>
            <h2
              className="text-center"
              style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: "clamp(1.4rem, 3vw, 1.9rem)", color: "var(--lf-dark)", marginBottom: "2rem" }}
            >
              A Hindi story in under 2 minutes
            </h2>
            <div className="flex flex-col gap-5">
              {[
                { n: "1", head: "Sign up free", body: "No credit card. 200 welcome credits are waiting for you." },
                { n: "2", head: "Enter your child's name", body: "Lalli and Fafa will use it naturally in Hindi dialogue throughout the story." },
                { n: "3", head: "Choose a theme and select Hindi", body: "Pick from 10+ themes — adventure, festival, bedtime, friendship and more. Select Hindi as the story language." },
                { n: "4", head: "Your story is ready", body: "A fully illustrated, narrated Hindi story in under 2 minutes. Your child will ask for another one tomorrow." },
              ].map(({ n, head, body }) => (
                <div key={n} className="flex gap-4 items-start">
                  <div
                    className="flex items-center justify-center flex-shrink-0 rounded-full"
                    style={{ width: 36, height: 36, background: "var(--lf-teal)", color: "#fff", fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: "1rem" }}
                  >
                    {n}
                  </div>
                  <div>
                    <p style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: "1rem", color: "var(--lf-dark)", marginBottom: 2 }}>{head}</p>
                    <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: "0.9rem", color: "rgba(45,45,45,0.62)", lineHeight: 1.65 }}>{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="hindi-faq-section" style={{ background: "var(--lf-cream)", padding: "56px 0" }}>
          <div className="mx-auto px-5" style={{ maxWidth: 780 }}>
            <h2
              style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: "clamp(1.4rem, 3vw, 1.9rem)", color: "var(--lf-dark)", marginBottom: "1.75rem" }}
            >
              Common questions about Hindi stories
            </h2>
            <div className="flex flex-col gap-4">
              {faqs.map(({ q, a }) => (
                <div
                  key={q}
                  className="flex flex-col gap-2 p-6 rounded-2xl"
                  style={{ background: "#fff", border: "1.5px solid rgba(0,0,0,0.06)" }}
                >
                  <h3 style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: "1.02rem", color: "var(--lf-dark)", margin: 0 }}>{q}</h3>
                  <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: "0.95rem", color: "rgba(45,45,45,0.7)", lineHeight: 1.8, margin: 0 }}>{a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <section style={{ background: "linear-gradient(135deg, #131020, #0d2d26)", padding: "64px 0" }}>
          <div className="mx-auto px-5 text-center" style={{ maxWidth: 640 }}>
            <div className="relative flex justify-center mb-6" style={{ height: 80 }}>
              <Image src="/lf-hero.png" alt="Lalli and Fafa" fill className="object-contain" />
            </div>
            <h2
              style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: "clamp(1.6rem, 3.5vw, 2.2rem)", color: "#fff", lineHeight: 1.2, marginBottom: "0.75rem" }}
            >
              Start your child's Hindi story tonight
            </h2>
            <p
              style={{ fontFamily: "'Nunito', sans-serif", fontSize: "1rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.75, marginBottom: "1.75rem" }}
            >
              Free to start. No credit card. Your first story is ready in under 2 minutes.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-base transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg, var(--lf-teal), #00a38d)", color: "#fff", fontFamily: "'Baloo 2', sans-serif", boxShadow: "0 4px 24px rgba(0,201,167,0.4)" }}
              >
                <Sparkles size={18} /> Try free
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-base transition-all hover:bg-white/10"
                style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)", fontFamily: "'Baloo 2', sans-serif", border: "1px solid rgba(255,255,255,0.12)" }}
              >
                <BookOpen size={16} /> See Hindi plans
              </Link>
            </div>
          </div>
        </section>

      </main>
      <SiteFooter />
    </>
  );
}
