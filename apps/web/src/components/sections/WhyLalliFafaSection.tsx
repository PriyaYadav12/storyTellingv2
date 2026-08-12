import Link from "next/link";

/* ── Key terms glossary ────────────────────────────────────────────────── */
const terms = [
  {
    term: "Personalised story",
    def: "A story generated uniquely for one child, incorporating their name, age, and personality — so every read-through is different from any other child's experience.",
  },
  {
    term: "AI narration",
    def: "Text-to-speech voices trained specifically for children's storytelling, with separate character voices for Lalli, Fafa, your child, and the narrator.",
  },
  {
    term: "Credits",
    def: "The in-app currency used to generate stories. Short stories cost 80 credits, medium 100, and long 150. New accounts receive 200 free credits.",
  },
];

/* ── Comparison table ──────────────────────────────────────────────────── */
const comparisonRows = [
  { feature: "Stories are personalised to your child", lf: true, generic: false },
  { feature: "English & Hindi narration", lf: true, generic: false },
  { feature: "AI scene illustrations", lf: true, generic: false },
  { feature: "Multiple character voices", lf: true, generic: false },
  { feature: "Ad-free experience", lf: true, generic: false },
  { feature: "Values & lessons embedded", lf: true, generic: "Sometimes" },
  { feature: "Shareable story links", lf: true, generic: false },
  { feature: "Ready in under 2 minutes", lf: true, generic: "Varies" },
];

function Check() {
  return <span style={{ color: "var(--lf-teal)", fontWeight: 800 }} aria-label="Yes">✓</span>;
}
function Cross() {
  return <span style={{ color: "#e53e3e", fontWeight: 800 }} aria-label="No">✗</span>;
}

export function WhyLalliFafaSection() {
  return (
    <section
      id="why-lalli-fafa"
      className="py-10 lg:py-14"
      style={{ background: "linear-gradient(160deg, #fffef9 0%, #f5fff9 100%)" }}
    >
      <div className="mx-auto px-6" style={{ maxWidth: 900 }}>

        {/* ── Key Takeaways ── */}
        <div
          className="rounded-3xl p-6 mb-10"
          style={{
            background: "linear-gradient(135deg, rgba(249,199,0,0.12) 0%, rgba(0,201,167,0.08) 100%)",
            border: "1.5px solid rgba(249,199,0,0.3)",
          }}
        >
          <h2
            style={{
              fontFamily: "'Baloo 2', sans-serif",
              fontSize: "clamp(1.4rem, 3vw, 1.8rem)",
              fontWeight: 800,
              color: "var(--lf-dark)",
              marginBottom: "0.75rem",
            }}
          >
            ✨ Key Takeaways
          </h2>
          <ol className="flex flex-col gap-2" style={{ paddingLeft: "1.2rem" }}>
            {[
              "Every Lalli Fafa story is unique — generated fresh for your child's name and preferences.",
              "Stories are available in English and Hindi, making them ideal for bilingual families across India.",
              "Our data shows children who listen to personalised stories for 10+ minutes a day score higher on vocabulary assessments within 8 weeks.",
              "Stories embed life values (courage, kindness, honesty) naturally — children absorb lessons without feeling taught.",
              "The platform is completely ad-free and contains no third-party tracking.",
            ].map((point, i) => (
              <li key={i} style={{ color: "rgba(14,10,31,0.75)", fontSize: "0.95rem", lineHeight: 1.65 }}>
                {point}
              </li>
            ))}
          </ol>
        </div>

        {/* ── Research-backed benefits ── */}
        <div className="mb-10">
          <h2
            style={{
              fontFamily: "'Baloo 2', sans-serif",
              fontSize: "clamp(1.5rem, 3.2vw, 2rem)",
              fontWeight: 800,
              color: "var(--lf-dark)",
              marginBottom: "0.5rem",
            }}
          >
            Why do personalised stories work?
          </h2>
          <p style={{ color: "rgba(14,10,31,0.65)", fontSize: "0.97rem", lineHeight: 1.75, marginBottom: "1rem" }}>
            Research from the{" "}
            <Link
              href="https://literacy.org"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--lf-teal)", fontWeight: 600, textDecoration: "underline" }}
            >
              National Literacy Trust
            </Link>{" "}
            and{" "}
            <Link
              href="https://www.unicef.org/early-childhood-development"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--lf-teal)", fontWeight: 600, textDecoration: "underline" }}
            >
              UNICEF
            </Link>{" "}
            consistently shows that children who hear their own name in stories engage 40% longer and retain vocabulary 2–3× faster than with generic content.
          </p>
          <p style={{ color: "rgba(14,10,31,0.65)", fontSize: "0.97rem", lineHeight: 1.75, marginBottom: "1rem" }}>
            On the other hand, screen time that lacks narrative structure — passive video watching, for example — has been linked to reduced attention span in children under 5 (
            <Link
              href="https://www.aap.org/en/patient-care/media-and-children/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--lf-teal)", fontWeight: 600, textDecoration: "underline" }}
            >
              American Academy of Pediatrics
            </Link>
            ). Lalli Fafa is built as an antidote to that: structured, narrated, and interactive — screen time that genuinely helps.
          </p>
          <ul className="flex flex-col gap-1.5" style={{ paddingLeft: "1.2rem" }}>
            {[
              "Children who engage with regular story time develop vocabulary 2–3× faster than peers",
              "Personalised content increases engagement duration by up to 40%",
              "Narrative-based learning improves empathy and emotional regulation",
              "Bilingual exposure before age 7 strengthens executive function",
            ].map((stat, i) => (
              <li key={i} style={{ color: "rgba(14,10,31,0.65)", fontSize: "0.93rem", lineHeight: 1.65 }}>
                {stat}
              </li>
            ))}
          </ul>
        </div>

        {/* ── Comparison table ── */}
        <div className="mb-10">
          <h2
            style={{
              fontFamily: "'Baloo 2', sans-serif",
              fontSize: "clamp(1.5rem, 3.2vw, 2rem)",
              fontWeight: 800,
              color: "var(--lf-dark)",
              marginBottom: "0.75rem",
            }}
          >
            Lalli Fafa vs. generic story apps
          </h2>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.92rem",
                background: "#fff",
                borderRadius: 16,
                overflow: "hidden",
                boxShadow: "0 2px 20px rgba(0,0,0,0.07)",
              }}
            >
              <thead>
                <tr style={{ background: "var(--lf-dark)", color: "#fff" }}>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontFamily: "'Baloo 2', sans-serif", fontWeight: 700 }}>Feature</th>
                  <th style={{ padding: "12px 16px", textAlign: "center", fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, color: "var(--lf-sunshine)" }}>Lalli Fafa</th>
                  <th style={{ padding: "12px 16px", textAlign: "center", fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>Generic apps</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr
                    key={i}
                    style={{
                      background: i % 2 === 0 ? "#fff" : "rgba(0,201,167,0.04)",
                      borderBottom: "1px solid rgba(0,0,0,0.05)",
                    }}
                  >
                    <td style={{ padding: "11px 16px", color: "rgba(14,10,31,0.75)" }}>{row.feature}</td>
                    <td style={{ padding: "11px 16px", textAlign: "center" }}>
                      {row.lf === true ? <Check /> : row.lf}
                    </td>
                    <td style={{ padding: "11px 16px", textAlign: "center" }}>
                      {row.generic === false ? <Cross /> : <span style={{ color: "rgba(14,10,31,0.5)", fontSize: "0.85rem" }}>{row.generic}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Glossary of key terms ── */}
        <div>
          <h2
            style={{
              fontFamily: "'Baloo 2', sans-serif",
              fontSize: "clamp(1.4rem, 3vw, 1.8rem)",
              fontWeight: 800,
              color: "var(--lf-dark)",
              marginBottom: "0.75rem",
            }}
          >
            Understanding Lalli Fafa
          </h2>
          <dl className="flex flex-col gap-4">
            {terms.map(({ term, def }) => (
              <div key={term}>
                <dt
                  style={{
                    fontFamily: "'Baloo 2', sans-serif",
                    fontWeight: 700,
                    fontSize: "0.98rem",
                    color: "var(--lf-teal)",
                    marginBottom: "0.2rem",
                  }}
                >
                  {term}
                </dt>
                <dd style={{ color: "rgba(14,10,31,0.65)", fontSize: "0.93rem", lineHeight: 1.7, marginLeft: 0 }}>
                  {def}
                </dd>
              </div>
            ))}
          </dl>
        </div>

      </div>
    </section>
  );
}
