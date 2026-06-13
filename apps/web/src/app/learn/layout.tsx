import type { Metadata } from "next";

const BASE = "https://www.lallifafa.com";

export const metadata: Metadata = {
  title: "FAQ — Learn About Lalli Fafa",
  description:
    "Answers to common questions about Lalli Fafa — personalised AI stories for kids, bilingual English & Hindi narration, pricing, safety, and the technology behind it.",
  alternates: { canonical: `${BASE}/learn` },
  openGraph: {
    title: "Lalli Fafa FAQ — Got Questions? We've Got Answers.",
    description:
      "Everything you need to know about Lalli Fafa — personalised stories, bilingual narration, safety, and pricing.",
    url: `${BASE}/learn`,
  },
};

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return children;
}
