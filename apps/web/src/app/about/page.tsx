import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Heart, Sparkles, ShieldCheck, Languages, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ObfuscatedEmail } from "@/components/shared/ObfuscatedEmail";

const BASE = "https://www.lallifafa.com";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Lalli Fafa is a personalised storytelling platform for children, made in India, bringing your child into magical, bilingual (English & Hindi) bedtime stories as the hero.",
  alternates: { canonical: `${BASE}/about` },
  openGraph: {
    title: "About Lalli Fafa",
    description:
      "We believe every child deserves to be the hero of their own story. Here's why we built Lalli Fafa, what we stand for, and the research behind our approach.",
    url: `${BASE}/about`,
    images: [
      {
        url: `${BASE}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "About Lalli Fafa: our mission and values",
      },
    ],
  },
};

const faqItems = [
  {
    q: "Who is Lalli?",
    a: "Lalli is a six-year-old girl with a big heart and an even bigger sense of adventure. She is Fafa's elder sister, the one who leads the way, keeps things (mostly) in order, and finds magic in the tiniest corners of everyday life. You will recognise her by her dark brown hair in two playful ponytails, her cheerful dresses with star and flower prints, and the little blue sling bag she carries everywhere, packed with crayons, shiny pebbles, and whatever she has decided is a magical find that day.",
  },
  {
    q: "Who is Fafa?",
    a: "Fafa is three years old, Lalli's little brother, and the cause of at least half the adventures they go on, usually by accident. He is curious, bouncy, and wonderfully clumsy. He once tried to wash his shoes in the teapot. He asks questions like why do stars twinkle and whether clouds can tickle. He finds something magical in almost everything he looks at, and his big round eyes and chubby-cheeked grin are impossible to say no to.",
  },
  {
    q: "Are Lalli and Fafa siblings?",
    a: "Yes! Lalli is the elder sister at six, and Fafa is her three-year-old little brother. Their sibling bond is the emotional heart of every story: Lalli is protective and a little bossy, Fafa is chaotic and endlessly loveable, and together they balance each other out perfectly. They argue sometimes (mostly about whether to follow the path or chase the butterfly), but they always find their way back to each other.",
  },
  {
    q: "How old are Lalli and Fafa?",
    a: "Lalli is around six years old, old enough to lead the way and explain things to Fafa, young enough to still believe a shiny pebble might be magical. Fafa is three, at that perfect age where everything is a discovery and nothing is too strange to investigate. The three-year gap between them is what creates the warmth and the comedy of their adventures.",
  },
  {
    q: "What is Lalli like as a big sister?",
    a: "Lalli is the kind of big sister who holds your hand in the scary part, rolls her eyes when you trip over your own feet, and then quietly makes sure you are okay. She is responsible, brave, and a natural leader, but she can be a little bossy when she thinks she knows best (which is most of the time). She teaches Fafa things in her very serious teacher voice, collects leaves and buttons as magical tools, and explains the world through the most vivid metaphors. She is never mean, just wonderfully, warmly certain that she is right.",
  },
  {
    q: "What is Fafa like as a little brother?",
    a: "Fafa is the kind of little brother who accidentally starts the adventure, then has no idea that is what just happened. He pulls the mysterious rope, opens the door nobody else noticed, and chases the butterfly straight into the enchanted forest. His mistakes are never mean. They are funny, innocent, and full of heart. He cries when he is lost and cheers up the moment Lalli gives him a hug. Younger children especially love Fafa because they see themselves in him: small, curious, and convinced that everything just might be a little bit magical.",
  },
  {
    q: "What kind of adventures do Lalli and Fafa go on?",
    a: "Fafa usually starts them: by finding a glowing pebble, following a talking bird, or accidentally sitting on a magic button. Lalli figures out what to do next. Their adventures take them to enchanted forests, rainy-day forts, busy festival nights, quiet grandparent kitchens, and worlds full of giggling stars. Every story carries a gentle lesson (about kindness, curiosity, courage, or honesty) woven naturally into the adventure, never announced as a lesson.",
  },
  {
    q: "Why does the child appear in every Lalli and Fafa story?",
    a: "Because Lalli and Fafa's world is built to be joined. Every story begins the moment a real child steps into it alongside them. The child is not a side character watching from the edges. They are in the middle of the adventure, the one Lalli and Fafa turn to when things get tricky. Lalli always makes sure to highlight what makes each child uniquely wonderful. That is just how she is.",
  },
];

const values = [
  {
    icon: Heart,
    color: "var(--lf-mango)",
    bg: "rgba(255,87,34,0.08)",
    title: "Every child is the hero",
    body:
      "Not a generic character with their name slapped on: a story genuinely built around who your child is, what they love, and what they're learning.",
  },
  {
    icon: Languages,
    color: "var(--lf-electric)",
    bg: "rgba(124,77,255,0.08)",
    title: "Bilingual from day one",
    body:
      "English and Hindi aren't an afterthought. Both are first-class: narrated with care, not just translated subtitles.",
  },
  {
    icon: ShieldCheck,
    color: "var(--lf-teal)",
    bg: "rgba(0,201,167,0.08)",
    title: "Safe, ad-free, calm",
    body:
      "No ads, no autoplay into unrelated content, no surprises. Just a story, told gently, and then quiet.",
  },
  {
    icon: Sparkles,
    color: "var(--lf-sunshine)",
    bg: "rgba(255,193,7,0.12)",
    title: "Made for Indian families",
    body:
      "Themes, values, festivals, and characters that feel familiar, alongside the universal magic every child responds to.",
  },
];

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main style={{ background: "var(--lf-cream)", paddingTop: 72 }}>
        {/* Hero */}
        <section className="mx-auto px-5 pt-8 pb-6" style={{ maxWidth: 1000 }}>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 flex flex-col gap-4">
              <h1
                style={{
                  fontFamily: "'Baloo 2', sans-serif",
                  fontWeight: 800,
                  fontSize: "clamp(2.2rem,5vw,3.2rem)",
                  color: "var(--lf-dark)",
                  lineHeight: 1.1,
                }}
              >
                Hi, we&apos;re Lalli &amp; Fafa.
              </h1>
              <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: "1.02rem", color: "var(--lf-dark)", lineHeight: 1.75, maxWidth: 480 }}>
                <strong>Lalli Fafa is a personalised children&apos;s storytelling platform for Indian families: generating fully illustrated, narrated bedtime stories in English and Hindi, with your child as the hero alongside Lalli (age 6) and Fafa (age 3), her younger brother.</strong>
              </p>
              <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: "1.05rem", color: "rgba(45,45,45,0.75)", lineHeight: 1.8, maxWidth: 480 }}>
                We started with one simple belief: every child deserves to hear stories where <strong>they</strong> are the one who&apos;s brave, kind, curious, and clever, told in a voice they trust, in the languages they grow up speaking.
              </p>
              <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: "1.05rem", color: "rgba(45,45,45,0.75)", lineHeight: 1.8, maxWidth: 480 }}>
                So we built a platform that takes a few details about your child and turns them into a fully illustrated, narrated adventure, in English or Hindi, featuring two characters who are quickly becoming family favourites: us.
              </p>
              <div className="flex gap-3 mt-2">
                <Link href="/generate" className="btn-primary">
                  Create your first story <ArrowRight size={18} />
                </Link>
              </div>
            </div>
            <div className="flex-shrink-0" style={{ width: 260 }}>
              <Image
                src="/lf-scene-about-hero.png"
                alt="Lalli and Fafa waving hello"
                width={520}
                height={520}
                className="w-full h-auto rounded-3xl"
                priority
              />
            </div>
          </div>
        </section>

        {/* Mission */}
        <section style={{ background: "var(--lf-mint)" }}>
          <div className="mx-auto px-5 py-8" style={{ maxWidth: 1000 }}>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <h2
                  style={{
                    fontFamily: "'Baloo 2', sans-serif",
                    fontWeight: 800,
                    fontSize: "clamp(1.6rem,3.5vw,2.2rem)",
                    color: "var(--lf-dark)",
                    lineHeight: 1.2,
                    marginBottom: "1rem",
                  }}
                >
                  Our mission
                </h2>
                <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: "1.05rem", color: "rgba(45,45,45,0.75)", lineHeight: 1.85 }}>
                  Bedtime is one of the few moments in a child&apos;s day that&apos;s entirely about them, and we think it should feel that way. Our mission is to make personalised, high-quality storytelling accessible to every family, in the languages spoken at home, without ads, gimmicks, or screen-time guilt.
                </p>
                <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: "1.05rem", color: "rgba(45,45,45,0.75)", lineHeight: 1.85, marginTop: "0.9rem" }}>
                  Every story your child generates is unique to them: built from their name, age, favourite things, and the lesson you want to gently weave in, then illustrated and narrated end-to-end by AI we&apos;ve spent a long time tuning to feel warm rather than mechanical.
                </p>
              </div>
              <div className="flex-shrink-0" style={{ width: 260 }}>
                <Image
                  src="/lf-scene-mission.png"
                  alt="Lalli and Fafa sharing a story together"
                  width={520}
                  height={520}
                  className="w-full h-auto rounded-3xl"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Values grid */}
        <section className="mx-auto px-5 py-8" style={{ maxWidth: 1000 }}>
          <h2
            style={{
              fontFamily: "'Baloo 2', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(1.6rem,3.5vw,2.2rem)",
              color: "var(--lf-dark)",
              lineHeight: 1.2,
              marginBottom: "1.25rem",
              textAlign: "center",
            }}
          >
            What we stand for
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {values.map(({ icon: Icon, color, bg, title, body }) => (
              <div
                key={title}
                className="flex flex-col gap-3 p-6 rounded-2xl"
                style={{ background: "#fff", border: "1.5px solid rgba(0,0,0,0.06)" }}
              >
                <div
                  className="flex items-center justify-center rounded-xl"
                  style={{ width: 44, height: 44, background: bg, color }}
                >
                  <Icon size={22} />
                </div>
                <h3
                  style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "var(--lf-dark)" }}
                >
                  {title}
                </h3>
                <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: "0.95rem", color: "rgba(45,45,45,0.7)", lineHeight: 1.7 }}>
                  {body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Q&A — Meet Lalli & Fafa */}
        <section style={{ background: "var(--lf-mint)" }}>
          <div className="mx-auto px-5 py-8" style={{ maxWidth: 800 }}>
            <div className="flex flex-col items-center gap-2 mb-6 text-center">
              <h2
                style={{
                  fontFamily: "'Baloo 2', sans-serif",
                  fontWeight: 800,
                  fontSize: "clamp(1.6rem,3.5vw,2.2rem)",
                  color: "var(--lf-dark)",
                  lineHeight: 1.2,
                }}
              >
                Meet Lalli &amp; Fafa
              </h2>
              <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: "1rem", color: "rgba(45,45,45,0.6)", maxWidth: 500, lineHeight: 1.7 }}>
                Everything you&apos;ve ever wanted to know about the two friends at the heart of every story.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {faqItems.map(({ q, a }) => (
                <div
                  key={q}
                  className="flex flex-col gap-2 p-5 rounded-2xl"
                  style={{ background: "#fff", border: "1.5px solid rgba(0,0,0,0.06)" }}
                >
                  <h3
                    style={{
                      fontFamily: "'Baloo 2', sans-serif",
                      fontWeight: 700,
                      fontSize: "1.08rem",
                      color: "var(--lf-dark)",
                      lineHeight: 1.3,
                      margin: 0,
                    }}
                  >
                    {q}
                  </h3>
                  <p
                    style={{
                      fontFamily: "'Nunito', sans-serif",
                      fontSize: "0.97rem",
                      color: "rgba(45,45,45,0.72)",
                      lineHeight: 1.8,
                      margin: 0,
                    }}
                  >
                    {a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ structured data for Google */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqItems.map(({ q, a }) => ({
                "@type": "Question",
                name: q,
                acceptedAnswer: { "@type": "Answer", text: a },
              })),
            }),
          }}
        />
        {/* Founder entity for GEO / E-E-A-T */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Raj Kothari",
              jobTitle: "Founder",
              worksFor: {
                "@type": "Organization",
                name: "Lalli Fafa",
                url: BASE,
              },
              url: `${BASE}/about`,
              sameAs: ["https://www.linkedin.com/in/raj-kothari-3262b918/"],
            }),
          }}
        />
        {/* Organization entity for GEO / E-E-A-T */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Lalli Fafa",
              url: BASE,
              logo: `${BASE}/lf-logo.png`,
              description:
                "Personalised, bilingual (English & Hindi) storytelling platform for children, made in India.",
              founder: {
                "@type": "Person",
                name: "Raj Kothari",
              },
              sameAs: [
                "https://youtube.com/@lallifafa",
                "https://instagram.com/lallifafa",
                "https://facebook.com/lallifafa",
                "https://linkedin.com/company/lallifafa",
              ],
            }),
          }}
        />

        {/* Founder */}
        <section className="mx-auto px-5 py-8" style={{ maxWidth: 800 }}>
          <h2
            style={{
              fontFamily: "'Baloo 2', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(1.4rem,3vw,1.9rem)",
              color: "var(--lf-dark)",
              marginBottom: "1rem",
              textAlign: "center",
            }}
          >
            Built by a parent, for parents
          </h2>
          <div
            className="flex flex-col md:flex-row items-start gap-6 p-6 rounded-3xl"
            style={{ background: "#fff", border: "1.5px solid rgba(0,0,0,0.06)" }}
          >
            <div className="flex-shrink-0 flex flex-col items-center gap-3">
              <Image
                src="/raj-kothari.jpg"
                alt="Raj Kothari, Founder of Lalli Fafa"
                width={120}
                height={120}
                className="rounded-2xl"
                style={{ objectFit: "cover", width: 120, height: 120 }}
              />
              <a
                href="https://www.linkedin.com/in/raj-kothari-3262b918/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5"
                style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  color: "#0a66c2",
                  textDecoration: "none",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#0a66c2" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </a>
            </div>
            <div>
              <p style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "var(--lf-dark)", marginBottom: "0.15rem" }}>
                Raj Kothari
              </p>
              <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: "0.85rem", fontWeight: 700, color: "var(--lf-teal)", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Founder
              </p>
              <p
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  color: "#b8860b",
                  background: "rgba(249,199,0,0.12)",
                  border: "1px solid rgba(249,199,0,0.3)",
                  borderRadius: 999,
                  padding: "0.25rem 0.7rem",
                  marginBottom: "0.9rem",
                }}
              >
                🏆 Icon of North Bengal — Dainik Jagran
              </p>
              <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: "0.97rem", color: "rgba(45,45,45,0.72)", lineHeight: 1.85, marginBottom: "0.75rem" }}>
                I&apos;m an Indian parent, and like most Indian parents, I grew up in a home where stories were everywhere: told by grandparents at night, woven into festivals, passed down without ever being written down. When my daughter Vanya was born, I wanted to give her that same feeling: a story just for her, in the languages she&apos;d grow up speaking.
              </p>
              <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: "0.97rem", color: "rgba(45,45,45,0.72)", lineHeight: 1.85, marginBottom: "0.75rem" }}>
                What I found instead were platforms that were generic, English-only, or filled with ads and autoplay. So I built Lalli Fafa: a place where Vanya (and every child like her) could step into a story where <em>she</em> was the brave one, the clever one, the one Lalli and Fafa turned to when things got tricky. I hope it becomes part of your bedtime ritual the way I always hoped it would be for ours.
              </p>
              <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: "0.97rem", color: "rgba(45,45,45,0.72)", lineHeight: 1.85, marginBottom: "0.9rem" }}>
                I was recognised as an &quot;Icon of North Bengal&quot; by Dainik Jagran for my contribution to entrepreneurship in the region.
              </p>
              <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: "0.85rem", color: "rgba(45,45,45,0.55)", lineHeight: 1.7, paddingTop: "0.75rem", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                Our approach to storytelling and child development is reviewed against published research, including findings from the{" "}
                <Link href="/blog/how-storytelling-helps-child-development" style={{ color: "var(--lf-teal)", textDecoration: "underline" }}>
                  National Literacy Trust, UNESCO, and the American Academy of Pediatrics
                </Link>
                . Last reviewed: <time dateTime="2026-08-30">August 2026</time>.
              </p>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section style={{ background: "var(--lf-peach)" }}>
          <div className="mx-auto px-5 py-8 text-center" style={{ maxWidth: 700 }}>
            <h2
              style={{
                fontFamily: "'Baloo 2', sans-serif",
                fontWeight: 800,
                fontSize: "clamp(1.5rem,3vw,2rem)",
                color: "var(--lf-dark)",
                lineHeight: 1.2,
                marginBottom: "0.75rem",
              }}
            >
              Say hello
            </h2>
            <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: "1rem", color: "rgba(45,45,45,0.7)", lineHeight: 1.8, marginBottom: "1.5rem" }}>
              Questions, feedback, or just want to tell us your child&apos;s favourite story moment? We&apos;d genuinely love to hear it.
            </p>
            <ObfuscatedEmail
              linkText="Email us →"
              className="inline-flex items-center gap-2"
              style={{ color: "var(--lf-teal)", fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: "1.05rem", textDecoration: "none" }}
            />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
