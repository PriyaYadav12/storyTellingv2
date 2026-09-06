import type { Metadata } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import { Toaster } from "sonner";
import { ConvexAuthProvider } from "@/providers/ConvexAuthProvider";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import Script from "next/script";
import "./globals.css";

const baloo2 = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const BASE = "https://www.lallifafa.com";

export const metadata: Metadata = {
  /* ── Core ── */
  metadataBase: new URL(BASE),
  title: {
    default: "Lalli Fafa — Personalised Kids Stories in English & Hindi",
    template: "%s | Lalli Fafa",
  },
  description:
    "Personalised kids stories in English and Hindi, where your child becomes the hero alongside Lalli and Fafa. Free to start, safe, and completely ad-free.",
  keywords: [
    "personalised stories for kids",
    "ai children stories",
    "bedtime stories in hindi",
    "kids stories english hindi",
    "lalli fafa",
    "children storytelling app india",
    "personalised bedtime stories",
    "stories for kids india",
    "ai story generator for children",
    "hindi stories for kids",
    "bilingual children stories",
    "children audio books india",
    "stories with child as hero",
    "interactive stories for toddlers",
  ],
  authors: [{ name: "Lalli Fafa", url: BASE }],
  creator: "Lalli Fafa",
  publisher: "Lalli Fafa",
  category: "Education",

  /* ── Canonical / alternate ──
     Per-page canonicals are set via each page's own `metadata.alternates.canonical`.
     This is just the fallback for pages that don't override it. */
  alternates: {
    canonical: BASE,
    languages: {
      "x-default": BASE,
      "en-IN": BASE,
      "hi-IN": BASE,
    },
  },

  /* ── Open Graph ── */
  openGraph: {
    type: "website",
    locale: "en_IN",
    alternateLocale: ["hi_IN"],
    url: BASE,
    siteName: "Lalli Fafa",
    title: "Lalli Fafa — Personalised Stories for Kids in English & Hindi",
    description:
      "Personalised children's stories where your child is the hero alongside Lalli & Fafa. English & Hindi. Safe, ad-free, loved by families across India.",
    images: [
      {
        url: `${BASE}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "Lalli Fafa — Personalised children's stories in English & Hindi",
        type: "image/png",
      },
    ],
  },

  /* ── Twitter / X ── */
  twitter: {
    card: "summary_large_image",
    site: "@lallifafa",
    creator: "@lallifafa",
    title: "Lalli Fafa — Personalised Stories for Kids",
    description:
      "Personalised children's stories in English & Hindi. Your child is the hero!",
    images: [`${BASE}/opengraph-image`],
  },

  /* ── Icons & manifest ── */
  icons: {
    icon: [
      { url: "/icon.png", sizes: "32x32", type: "image/png" },
      { url: "/lf-logo.png", sizes: "any", type: "image/png" },
    ],
    shortcut: "/icon.png",
    apple: "/apple-icon.png",
  },
  manifest: "/site.webmanifest",

  /* ── Crawlers ── */
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  /* ── Verification ── */
  // To verify: go to Google Search Console → Add property → HTML tag method
  // Then replace the empty string below with the token from the <meta> tag content value
  // verification: { google: "YOUR_TOKEN_HERE" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-IN"
      className={`${baloo2.variable} ${nunito.variable} h-full`}
    >
      <head>
        {/* No preconnect to fonts.googleapis.com/gstatic.com -- next/font
            downloads and self-hosts these at build time, so nothing at
            runtime ever actually connects to Google's font CDN. */}
        <link rel="alternate" type="application/rss+xml" title="Lalli Fafa Blog" href="/feed.xml" />
        {/* Explicit hreflang links — belt-and-suspenders alongside metadata alternates */}
        <link rel="alternate" hrefLang="x-default" href="https://www.lallifafa.com/" />
        <link rel="alternate" hrefLang="en-IN" href="https://www.lallifafa.com/" />
        <link rel="alternate" hrefLang="hi-IN" href="https://www.lallifafa.com/" />
        {/* max-image-preview in standard robots tag for tools that don't check googlebot tag */}
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
        {/* Mobile browser UI colour */}
        <meta name="theme-color" content="#FFF8E7" />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <GoogleAnalytics />
        {process.env.NEXT_PUBLIC_FB_PIXEL_ID && (
          <>
            <Script id="fb-pixel" strategy="afterInteractive">{`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${process.env.NEXT_PUBLIC_FB_PIXEL_ID}');
              fbq('track', 'PageView');
            `}</Script>
            <noscript>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                height="1"
                width="1"
                style={{ display: "none" }}
                src={`https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_FB_PIXEL_ID}&ev=PageView&noscript=1`}
                alt=""
              />
            </noscript>
          </>
        )}
        <ConvexAuthProvider>
          {children}
          <Toaster richColors position="top-right" />
        </ConvexAuthProvider>
      </body>
    </html>
  );
}
