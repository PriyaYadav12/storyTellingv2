"use client";

// The 4 Pillars — replaces the old generic "Stories built for giggle & grow"
// feature-card section. Reuses the exact horizontal-scroll-carousel
// mechanism (marquee keyframe + doubled-array loop) already live in
// CharactersSection's "Their adventures so far" scene strip, not a new
// component. Each card's name + tagline is already baked into its image.

import Image from "next/image";

const pillars = [
  { src: "/pillar-listening.jpg", label: "Listening Skills" },
  { src: "/pillar-attention.jpg", label: "Attention & Focus" },
  { src: "/pillar-emotional.jpg", label: "Emotional Intelligence" },
  { src: "/pillar-cognitive.jpg", label: "Cognitive Growth" },
];

export function PillarsSection() {
  return (
    <section className="py-7 lg:py-10" style={{ background: "linear-gradient(150deg, #E6FAF6 0%, #F0FFFD 100%)" }}>
      <div className="mx-auto px-6" style={{ maxWidth: 1200 }}>
        {/* Header */}
        <div className="text-center mb-5 flex flex-col items-center gap-2">
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider"
            style={{ background: "rgba(26,191,166,0.12)", color: "var(--lf-teal)" }}
          >
            ✨ The 4 Pillars
          </span>
          <h2
            style={{
              fontFamily: "'Baloo 2', sans-serif",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 800,
              color: "var(--lf-dark)",
            }}
          >
            Personalised storytelling for{" "}
            <span className="text-gradient-teal">growing minds</span>
          </h2>
          <p style={{ color: "rgba(45,45,45,0.65)", fontSize: "1.05rem", maxWidth: 580 }}>
            Every Lalli Fafa story is built on developmental psychology, one of four pillars at a time.
          </p>
        </div>
      </div>

      {/* Horizontal carousel — same marquee mechanism as "Their adventures so far" */}
      <div className="overflow-hidden pb-2">
        <div
          className="flex gap-5 animate-marquee"
          style={{ width: "max-content" }}
        >
          {[...pillars, ...pillars].map((pillar, i) => (
            <div
              key={i}
              className="flex-shrink-0 rounded-3xl overflow-hidden relative"
              style={{
                width: 400,
                height: 296,
                boxShadow: "0 8px 28px rgba(0,0,0,0.14)",
              }}
            >
              <Image
                src={pillar.src}
                alt={pillar.label}
                fill
                className="object-cover"
                style={{ objectPosition: "center 30%" }}
                sizes="400px"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
