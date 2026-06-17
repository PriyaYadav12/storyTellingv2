import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Sparkles, BookOpen } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { STORY_THEMES, getStoryTheme } from "@/lib/story-themes";

export function generateStaticParams() {
  return STORY_THEMES.map((t) => ({ theme: t.slug }));
}

const BASE = "https://www.lallifafa.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ theme: string }>;
}): Promise<Metadata> {
  const { theme: slug } = await params;
  const theme = getStoryTheme(slug);
  if (!theme) return { title: "Not found" };
  return {
    title: theme.metaTitle,
    description: theme.metaDescription,
    alternates: { canonical: `${BASE}/stories/${slug}` },
    openGraph: {
      title: theme.metaTitle,
      description: theme.metaDescription,
      url: `${BASE}/stories/${slug}`,
      images: [{ url: `${BASE}/opengraph-image`, width: 1200, height: 630 }],
    },
  };
}

export default async function ThemePage({
  params,
}: {
  params: Promise<{ theme: string }>;
}) {
  const { theme: slug } = await params;
  const theme = getStoryTheme(slug);
  if (!theme) notFound();

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE },
      { "@type": "ListItem", position: 2, name: "Story Themes", item: `${BASE}/stories` },
      { "@type": "ListItem", position: 3, name: theme.title, item: `${BASE}/stories/${slug}` },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: theme.faqs.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <SiteHeader />
      <main style={{ background: "var(--lf-cream)", paddingTop: 72 }}>

        {/* Hero */}
        <section
          className="mx-auto px-5 pt-14 pb-12"
          style={{ maxWidth: 860 }}
        >
          {/* Back link */}
          <Link
            href="/stories"
            className="inline-flex items-center gap-2 mb-8 text-sm font-semibold"
            style={{ color: "rgba(45,45,45,0.5)", fontFamily: "'Nunito', sans-serif", textDecoration: "none" }}
          >
            <ArrowLeft size={14} /> All story themes
          </Link>

          {/* Badge */}
          <div className="flex items-center gap-3 mb-5">
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider"
              style={{ background: theme.bg, color: theme.color, border: `1.5px solid ${theme.color}33` }}
            >
              <BookOpen size={13} /> Story Theme
            </span>
          </div>

          {/* Headline */}
          <div className="flex items-center gap-4 mb-4">
            <span style={{ fontSize: "3rem", lineHeight: 1 }}>{theme.emoji}</span>
            <h1
              style={{
                fontFamily: "'Baloo 2', sans-serif",
                fontWeight: 800,
                fontSize: "clamp(2rem,5vw,3rem)",
                color: "var(--lf-dark)",
                lineHeight: 1.1,
              }}
            >
              {theme.headline}
            </h1>
          </div>

          <p
            style={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: "1.15rem",
              color: "rgba(45,45,45,0.65)",
              lineHeight: 1.7,
              maxWidth: 640,
              marginBottom: "1.5rem",
            }}
          >
            {theme.subheadline}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-8">
            {theme.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-xs font-bold capitalize"
                style={{ background: `${theme.color}18`, color: theme.color }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* CTA */}
          <Link href="/generate" className="btn-primary inline-flex items-center gap-2">
            <Sparkles size={16} /> Create this story for your child
          </Link>
        </section>

        {/* Story description */}
        <section style={{ background: "#fff" }}>
          <div className="mx-auto px-5 py-14" style={{ maxWidth: 860 }}>
            <div className="flex flex-col lg:flex-row gap-12 items-start">
              <div className="flex-1">
                <h2
                  style={{
                    fontFamily: "'Baloo 2', sans-serif",
                    fontWeight: 800,
                    fontSize: "clamp(1.4rem,3vw,1.9rem)",
                    color: "var(--lf-dark)",
                    marginBottom: "1rem",
                  }}
                >
                  What happens in the story
                </h2>
                <p
                  style={{
                    fontFamily: "'Nunito', sans-serif",
                    fontSize: "1.05rem",
                    color: "rgba(45,45,45,0.72)",
                    lineHeight: 1.85,
                  }}
                >
                  {theme.description}
                </p>
              </div>

              {/* Sample excerpt */}
              <div
                className="flex-shrink-0 rounded-3xl p-6"
                style={{
                  width: "min(100%, 300px)",
                  background: theme.bg,
                  border: `2px solid ${theme.color}33`,
                }}
              >
                <p
                  style={{
                    fontFamily: "'Baloo 2', sans-serif",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    color: theme.color,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: "0.75rem",
                  }}
                >
                  Story sample
                </p>
                <p
                  style={{
                    fontFamily: "'Nunito', sans-serif",
                    fontSize: "1rem",
                    color: "var(--lf-dark)",
                    lineHeight: 1.75,
                    fontStyle: "italic",
                  }}
                >
                  &ldquo;{theme.sample}&rdquo;
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What children learn */}
        <section style={{ background: "var(--lf-cream)" }}>
          <div className="mx-auto px-5 py-14" style={{ maxWidth: 860 }}>
            <h2
              style={{
                fontFamily: "'Baloo 2', sans-serif",
                fontWeight: 800,
                fontSize: "clamp(1.4rem,3vw,1.9rem)",
                color: "var(--lf-dark)",
                marginBottom: "2rem",
              }}
            >
              What your child takes away
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {theme.lessons.map(({ title, body }) => (
                <div
                  key={title}
                  className="flex flex-col gap-3 p-6 rounded-2xl"
                  style={{ background: "#fff", border: "1.5px solid rgba(0,0,0,0.06)" }}
                >
                  <div
                    className="flex items-center justify-center rounded-xl"
                    style={{
                      width: 40,
                      height: 40,
                      background: theme.bg,
                      color: theme.color,
                      fontSize: "1.2rem",
                    }}
                  >
                    ✦
                  </div>
                  <h3
                    style={{
                      fontFamily: "'Baloo 2', sans-serif",
                      fontWeight: 700,
                      fontSize: "1rem",
                      color: "var(--lf-dark)",
                    }}
                  >
                    {title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "'Nunito', sans-serif",
                      fontSize: "0.92rem",
                      color: "rgba(45,45,45,0.68)",
                      lineHeight: 1.75,
                    }}
                  >
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Who it's for */}
        <section style={{ background: "var(--lf-mint)" }}>
          <div className="mx-auto px-5 py-12" style={{ maxWidth: 860 }}>
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div
                className="flex items-center justify-center rounded-2xl flex-shrink-0"
                style={{ width: 56, height: 56, background: theme.bg, fontSize: "1.75rem" }}
              >
                {theme.emoji}
              </div>
              <div>
                <h2
                  style={{
                    fontFamily: "'Baloo 2', sans-serif",
                    fontWeight: 800,
                    fontSize: "1.2rem",
                    color: "var(--lf-dark)",
                    marginBottom: "0.5rem",
                  }}
                >
                  Who this theme is best for
                </h2>
                <p
                  style={{
                    fontFamily: "'Nunito', sans-serif",
                    fontSize: "1rem",
                    color: "rgba(45,45,45,0.72)",
                    lineHeight: 1.8,
                    maxWidth: 620,
                  }}
                >
                  {theme.whoItsFor}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ background: "#fff" }}>
          <div className="mx-auto px-5 py-14" style={{ maxWidth: 860 }}>
            <h2
              style={{
                fontFamily: "'Baloo 2', sans-serif",
                fontWeight: 800,
                fontSize: "clamp(1.4rem,3vw,1.9rem)",
                color: "var(--lf-dark)",
                marginBottom: "1.75rem",
              }}
            >
              Common questions
            </h2>
            <div className="flex flex-col gap-5">
              {theme.faqs.map(({ q, a }) => (
                <div
                  key={q}
                  className="flex flex-col gap-2 p-6 rounded-2xl"
                  style={{ background: "var(--lf-cream)", border: "1.5px solid rgba(0,0,0,0.06)" }}
                >
                  <h3
                    style={{
                      fontFamily: "'Baloo 2', sans-serif",
                      fontWeight: 700,
                      fontSize: "1.05rem",
                      color: "var(--lf-dark)",
                      margin: 0,
                    }}
                  >
                    {q}
                  </h3>
                  <p
                    style={{
                      fontFamily: "'Nunito', sans-serif",
                      fontSize: "0.96rem",
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

        {/* Bottom CTA */}
        <section
          className="mx-auto px-5 py-16 text-center"
          style={{ maxWidth: 700 }}
        >
          <h2
            style={{
              fontFamily: "'Baloo 2', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(1.6rem,3.5vw,2.2rem)",
              color: "var(--lf-dark)",
              lineHeight: 1.2,
              marginBottom: "0.75rem",
            }}
          >
            Ready to create your child&apos;s story?
          </h2>
          <p
            style={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: "1rem",
              color: "rgba(45,45,45,0.65)",
              lineHeight: 1.75,
              marginBottom: "1.75rem",
            }}
          >
            Takes two minutes. Free to start. Your child will ask for it again tomorrow.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/generate" className="btn-primary inline-flex items-center gap-2">
              <Sparkles size={16} /> Create this story free
            </Link>
            <Link href="/stories" className="btn-ghost inline-flex items-center gap-2">
              <ArrowLeft size={14} /> Browse all themes
            </Link>
          </div>
        </section>

      </main>
      <SiteFooter />
    </>
  );
}
