import type { Metadata } from "next";

const BASE = "https://www.lallifafa.com";

export const metadata: Metadata = {
  title: "How Lalli Fafa Works — Personalised Kids' Stories in English & Hindi",
  description:
    "Your child becomes the hero of every story. Learn how Lalli Fafa generates personalised bedtime stories, which Hindi voices we use, what data we collect, and what each plan includes.",
  alternates: { canonical: `${BASE}/learn` },
  openGraph: {
    title: "How Lalli Fafa Works — Personalised Kids' Stories in English & Hindi",
    description:
      "Your child becomes the hero of every story. Personalised bedtime stories in English and Hindi, ad-free, safe, and ready in under 2 minutes.",
    url: `${BASE}/learn`,
    images: [
      {
        url: `${BASE}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "Lalli Fafa FAQ — common questions answered",
      },
    ],
  },
};

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return children;
}
