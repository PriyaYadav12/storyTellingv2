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

/* ── Research citations — each verified directly against its primary source ── */
const researchFacts = [
  {
    claim: "Children who enjoy reading score significantly higher on reading tests.",
    source: "National Literacy Trust",
    href: "https://literacytrust.org.uk/research-services/research-themes/reading/",
  },
  {
    claim: "Children told stories regularly are 61% more likely to be on track for literacy & numeracy.",
    source: "Ghana ECDI study, PMC",
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10447571/",
  },
  {
    claim: "Bilingual children get regular practice juggling two language systems — a workout for the young brain.",
    source: "Cerebrum, Dana Foundation (2012)",
    href: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3583091/",
  },
  {
    claim: "Well-designed digital media with clear learning goals may support academic skills like reading and mathematics.",
    source: "AAP Policy Statement, Pediatrics (2026)",
    href: "https://publications.aap.org/pediatrics/article/157/2/e2025075320/206129/Digital-Ecosystems-Children-and-Adolescents-Policy",
  },
  {
    claim: "Starting in a child's mother tongue supports better understanding and academic success.",
    source: "UNESCO, Bhasha Matters (2025)",
    href: "https://www.unesco.org/en/articles/unesco-launch-bhasha-matters-state-education-report-india-2025-mother-tongue-and-multilingual",
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
      className="py-6 lg:py-8"
      style={{ background: "linear-gradient(160deg, #fffef9 0%, #f5fff9 100%)" }}
    >
      <div className="mx-auto px-6" style={{ maxWidth: 900 }}>

        {/* ── Table of Contents ── */}
        <nav
          aria-label="Section contents"
          className="rounded-2xl p-5 mb-6"
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
          className="rounded-3xl p-6 mb-6"
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
              "Personalised stories, built around a child's own name and interests, are designed to hold attention and support vocabulary building more than generic, one-size-fits-all content.",
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
        <div id="research-benefits" className="mb-6">
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
            Educational psychologists call it the self-reference effect: people, including young children, pay closer attention to and better remember information connected to themselves, like hearing their own name in a story. Personalised narrative is designed to draw on that effect, so every child's brain responds differently to a story about <em>themselves</em>.
          </p>
          <p style={{ color: "rgba(14,10,31,0.65)", fontSize: "0.97rem", lineHeight: 1.75, marginBottom: "1rem" }}>
            The{" "}
            <Link
              href="https://www.aap.org/en/patient-care/media-and-children/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--lf-teal)", fontWeight: 600, textDecoration: "underline" }}
            >
              American Academy of Pediatrics
            </Link>{" "}
            recommends parents favour high-quality, engaging content over passive screen time for young children, prioritising quality and context rather than strict time limits alone. Lalli Fafa is built around that principle: structured, narrated, and interactive, not passive video to fill time.
          </p>
          <p style={{ color: "rgba(14,10,31,0.65)", fontSize: "0.97rem", lineHeight: 1.75 }}>
            Bilingual exposure is another strength. Research published in{" "}
            <Link
              href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3583091/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--lf-teal)", fontWeight: 600, textDecoration: "underline" }}
            >
              Cerebrum, the Dana Foundation's forum on brain science (2012)
            </Link>{" "}
            found that bilingual children show stronger executive function, including better attention control and task-switching, than monolinguals. Lalli Fafa's English and Hindi stories give Indian families an easy path to raising confident bilingual readers.
          </p>
        </div>

        {/* ── Quick facts ── */}
        <div
          id="quick-facts"
          className="rounded-2xl p-5 mb-6"
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
              { label: "Languages supported", value: "English and Hindi" },
              { label: "Story generation time", value: "Under 2 minutes" },
              { label: "Free starter credits", value: "200 credits (approx. 2 short stories)" },
              { label: "Age range", value: "2–10 years" },
              { label: "Ads served", value: "Zero — completely ad-free" },
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

          {/* ── Backed by research ── */}
          <div style={{ borderTop: "1px solid rgba(0,0,0,0.08)", marginTop: "0.9rem", paddingTop: "0.9rem" }}>
            <p
              style={{
                fontWeight: 700,
                fontSize: "0.78rem",
                color: "rgba(14,10,31,0.45)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: "0.6rem",
              }}
            >
              Backed by research
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {researchFacts.map(({ claim, source, href }) => (
                <div key={source} style={{ fontSize: "0.82rem", lineHeight: 1.5 }}>
                  <p style={{ color: "rgba(14,10,31,0.75)", margin: 0 }}>{claim}</p>
                  <Link
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "var(--lf-teal)", fontWeight: 700, fontSize: "0.74rem", textDecoration: "underline" }}
                  >
                    {source}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Comparison table ── */}
        <div id="comparison" className="mb-6">
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
        <div id="glossary" className="mb-6">
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
