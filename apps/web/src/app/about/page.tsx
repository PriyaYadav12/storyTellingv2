import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Heart, Sparkles, ShieldCheck, Languages, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

const BASE = "https://www.lallifafa.com";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Lalli Fafa is an AI-powered personalised storytelling platform for children, made in India — bringing your child into magical, bilingual (English & Hindi) bedtime stories as the hero.",
  alternates: { canonical: `${BASE}/about` },
  openGraph: {
    title: "About Lalli Fafa",
    description:
      "We believe every child deserves to be the hero of their own story. Here's why we built Lalli Fafa, and what we stand for.",
    url: `${BASE}/about`,
  },
};

const values = [
  {
    icon: Heart,
    color: "var(--lf-mango)",
    bg: "rgba(255,87,34,0.08)",
    title: "Every child is the hero",
    body:
      "Not a generic character with their name slapped on — a story genuinely built around who your child is, what they love, and what they're learning.",
  },
  {
    icon: Languages,
    color: "var(--lf-electric)",
    bg: "rgba(124,77,255,0.08)",
    title: "Bilingual from day one",
    body:
      "English and Hindi aren't an afterthought. Both are first-class — narrated with care, not just translated subtitles.",
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
      "Themes, values, festivals, and characters that feel familiar — alongside the universal magic every child responds to.",
  },
];

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main style={{ background: "var(--lf-cream)", paddingTop: 72 }}>
        {/* Hero */}
        <section className="mx-auto px-5 pt-14 pb-10" style={{ maxWidth: 1000 }}>
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1 flex flex-col gap-5">
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
              <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: "1.05rem", color: "rgba(45,45,45,0.75)", lineHeight: 1.8, maxWidth: 480 }}>
                We started Lalli Fafa with one simple belief: every child deserves to hear stories where <strong>they</strong> are the one who&apos;s brave, kind, curious, and clever — told in a voice they trust, in the languages they grow up speaking.
              </p>
              <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: "1.05rem", color: "rgba(45,45,45,0.75)", lineHeight: 1.8, maxWidth: 480 }}>
                So we built a platform that takes a few details about your child and turns them into a fully illustrated, narrated adventure — in English or Hindi — featuring two characters who are quickly becoming family favourites: us.
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
          <div className="mx-auto px-5 py-14" style={{ maxWidth: 800 }}>
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
              Bedtime is one of the few moments in a child&apos;s day that&apos;s entirely about them — and we think it should feel that way. Our mission is to make personalised, high-quality storytelling accessible to every family, in the languages spoken at home, without ads, gimmicks, or screen-time guilt.
            </p>
            <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: "1.05rem", color: "rgba(45,45,45,0.75)", lineHeight: 1.85, marginTop: "0.9rem" }}>
              Every story your child generates is unique to them — built from their name, age, favourite things, and the lesson you want to gently weave in, then illustrated and narrated end-to-end by AI we&apos;ve spent a long time tuning to feel warm rather than mechanical.
            </p>
          </div>
        </section>

        {/* Values grid */}
        <section className="mx-auto px-5 py-14" style={{ maxWidth: 1000 }}>
          <h2
            style={{
              fontFamily: "'Baloo 2', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(1.6rem,3.5vw,2.2rem)",
              color: "var(--lf-dark)",
              lineHeight: 1.2,
              marginBottom: "2rem",
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

        {/* Contact CTA */}
        <section style={{ background: "var(--lf-peach)" }}>
          <div className="mx-auto px-5 py-14 text-center" style={{ maxWidth: 700 }}>
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
            <a
              href="mailto:hello@lallifafa.com"
              className="inline-flex items-center gap-2"
              style={{ color: "var(--lf-teal)", fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: "1.05rem", textDecoration: "none" }}
            >
              hello@lallifafa.com
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
