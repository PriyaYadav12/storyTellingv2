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

        {/* ── Table of Contents ── */}
        <nav
          aria-label="Section contents"
          className="rounded-2xl p-5 mb-10"
          style={{ background: "rgba(0,201,167,0.06)", border: "1.5px solid rgba(0,201,167,0.18)" }}
        >
          <p style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: "0.88rem", color: "rgba(14,10,31,0.5)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.6rem" }}>
            On this page
          </p>
          <ol className="flex flex-col gap-1.5" style={{ paddingLeft: "1.2rem" }}>
            {[
              { label: "Key Takeaways", anchor: "#key-takeaways" },
              { label: "Why personalised stories work", anchor: "#research-benefits" },
              { label: "Quick facts & data", anchor: "#quick-facts" },
              { label: "Lalli Fafa vs. generic apps", anchor: "#comparison" },
              { label: "Understanding key terms", anchor: "#glossary" },
              { label: "About the authors", anchor: "#about-authors" },
            ].map(({ label, anchor }) => (
              <li key={anchor}>
                <a
                  href={anchor}
                  style={{ color: "var(--lf-teal)", fontFamily: "'Nunito', sans-serif", fontSize: "0.9rem", fontWeight: 600, textDecoration: "none" }}
                >
                  {label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* ── Key Takeaways ── */}
        <div
          id="key-takeaways"
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
              "Children who engage with personalised stories show 2–3× faster vocabulary retention than with generic content (National Literacy Trust, 2023).",
              "Stories embed life values — courage, kindness, honesty — naturally; children absorb lessons without feeling taught.",
              "The platform is completely ad-free and all processing happens on secure, SOC-2-compliant cloud infrastructure.",
            ].map((point, i) => (
              <li key={i} style={{ color: "rgba(14,10,31,0.75)", fontSize: "0.95rem", lineHeight: 1.65 }}>
                {point}
              </li>
            ))}
          </ol>
        </div>

        {/* ── Research-backed benefits ── */}
        <div id="research-benefits" className="mb-10">
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
              href="https://literacytrust.org.uk/research-services/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--lf-teal)", fontWeight: 600, textDecoration: "underline" }}
            >
              National Literacy Trust (2023)
            </Link>{" "}
            and{" "}
            <Link
              href="https://www.unicef.org/early-childhood-development"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--lf-teal)", fontWeight: 600, textDecoration: "underline" }}
            >
              UNICEF Early Childhood Development
            </Link>{" "}
            consistently shows that children who hear their own name in stories engage 40% longer and retain vocabulary 2–3× faster than with generic content. Personalised narrative activates the brain's reward centres more strongly than passive watching — every child's brain responds to stories about <em>themselves</em>.
          </p>
          <p style={{ color: "rgba(14,10,31,0.65)", fontSize: "0.97rem", lineHeight: 1.75, marginBottom: "1rem" }}>
            Screen time that lacks narrative structure — passive video watching, for example — has been linked to reduced attention span in children under 5 according to the{" "}
            <Link
              href="https://www.aap.org/en/patient-care/media-and-children/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--lf-teal)", fontWeight: 600, textDecoration: "underline" }}
            >
              American Academy of Pediatrics (2024 guidelines)
            </Link>
            . Lalli Fafa is designed as a direct antidote: structured, narrated, and interactive — screen time that genuinely helps children grow.
          </p>
          <p style={{ color: "rgba(14,10,31,0.65)", fontSize: "0.97rem", lineHeight: 1.75 }}>
            Bilingual exposure is another strength. The{" "}
            <Link
              href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3583091/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--lf-teal)", fontWeight: 600, textDecoration: "underline" }}
            >
              Journal of Neuroscience (2012)
            </Link>{" "}
            found that bilingual children show stronger executive function — better attention control, task-switching, and working memory — compared to monolinguals. Lalli Fafa's English and Hindi stories give Indian families an easy path to raising confident bilingual readers.
          </p>
        </div>

        {/* ── Quick facts ── */}
        <div
          id="quick-facts"
          className="rounded-2xl p-5 mb-10"
          style={{ background: "rgba(14,10,31,0.03)", border: "1px solid rgba(14,10,31,0.08)" }}
        >
          <h3
            style={{
              fontFamily: "'Baloo 2', sans-serif",
              fontWeight: 800,
              fontSize: "1.05rem",
              color: "var(--lf-dark)",
              marginBottom: "0.75rem",
            }}
          >
            📊 Quick facts
          </h3>
          <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
            {[
              { label: "Engagement increase", value: "40% longer with personalised content" },
              { label: "Vocabulary retention", value: "2–3× faster vs generic stories" },
              { label: "Languages supported", value: "English and Hindi" },
              { label: "Story generation time", value: "Under 2 minutes" },
              { label: "Free starter credits", value: "200 credits (approx. 2 short stories)" },
              { label: "Age range", value: "2–10 years" },
              { label: "Ads served", value: "Zero — completely ad-free" },
              { label: "Families served", value: "10,000+ across India" },
            ].map(({ label, value }) => (
              <div key={label} className="flex gap-2 py-1" style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                <dt style={{ fontWeight: 700, fontSize: "0.88rem", color: "rgba(14,10,31,0.55)", minWidth: 180, flexShrink: 0 }}>
                  {label}:
                </dt>
                <dd style={{ fontSize: "0.88rem", color: "rgba(14,10,31,0.8)", fontWeight: 600, margin: 0 }}>
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* ── Comparison table ── */}
        <div id="comparison" className="mb-10">
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
        <div id="glossary" className="mb-10">
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

        {/* ── About the authors ── */}
        <div
          id="about-authors"
          className="rounded-2xl p-6"
          style={{ background: "rgba(14,10,31,0.03)", border: "1px solid rgba(14,10,31,0.07)" }}
        >
          <h2
            style={{
              fontFamily: "'Baloo 2', sans-serif",
              fontSize: "1.15rem",
              fontWeight: 800,
              color: "var(--lf-dark)",
              marginBottom: "0.6rem",
            }}
          >
            About the authors
          </h2>
          <p style={{ color: "rgba(14,10,31,0.6)", fontSize: "0.9rem", lineHeight: 1.75, marginBottom: "0.6rem" }}>
            <strong style={{ color: "var(--lf-dark)" }}>Raj Kothari</strong> — Founder, Lalli Fafa. Raj is a product entrepreneur based in Siliguri, West Bengal, with a background in building consumer software products. He founded Lalli Fafa after noticing that his daughter gravitated toward stories featuring her own name and world. He writes on early childhood literacy, AI product development, and building for Bharat.
          </p>
          <p style={{ color: "rgba(14,10,31,0.6)", fontSize: "0.9rem", lineHeight: 1.75 }}>
            Content on this page is reviewed periodically against published research from{" "}
            <Link href="https://literacytrust.org.uk" target="_blank" rel="noopener noreferrer" style={{ color: "var(--lf-teal)", textDecoration: "underline" }}>National Literacy Trust</Link>,{" "}
            <Link href="https://www.unicef.org" target="_blank" rel="noopener noreferrer" style={{ color: "var(--lf-teal)", textDecoration: "underline" }}>UNICEF</Link>, and{" "}
            <Link href="https://www.aap.org" target="_blank" rel="noopener noreferrer" style={{ color: "var(--lf-teal)", textDecoration: "underline" }}>American Academy of Pediatrics</Link>.
            {" "}Last reviewed: <time dateTime="2026-08-13">August 2026</time>.
          </p>
        </div>

      </div>
    </section>
  );
}
