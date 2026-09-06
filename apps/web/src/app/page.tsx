import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { HeroSection } from "@/components/sections/HeroSection";
import { PillarsSection } from "@/components/sections/PillarsSection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { CharactersSection } from "@/components/sections/CharactersSection";
import { PricingSection } from "@/components/sections/PricingSection";
import { ShopSection } from "@/components/sections/ShopSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { CTASection } from "@/components/sections/CTASection";
import { WhyLalliFafaSection } from "@/components/sections/WhyLalliFafaSection";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

const BASE = "https://www.lallifafa.com";

export const metadata: Metadata = {
  alternates: { canonical: `${BASE}/` },
};

/* ── JSON-LD structured data ─────────────────────────────────────
   Three schemas in one block:
   1. Organization   — who we are (GEO entity anchor)
   2. WebSite        — enables Google Sitelinks Search Box
   3. SoftwareApplication — rich result for app in search
   4. FAQPage        — powers featured snippets / AEO
   5. HowTo          — "How to create a personalised story" snippet
──────────────────────────────────────────────────────────────── */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${BASE}/#organization`,
      name: "Lalli Fafa",
      url: BASE,
      logo: {
        "@type": "ImageObject",
        url: `${BASE}/lf-logo.png`,
        width: 512,
        height: 512,
      },
      sameAs: [
        "https://www.instagram.com/lallifafa",
        "https://www.facebook.com/lallifafa",
        "https://www.youtube.com/@lallifafa",
        "https://www.linkedin.com/company/lallifafa",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        email: "raj@lallifafa.com",
        contactType: "customer support",
        areaServed: "IN",
        availableLanguage: ["English", "Hindi"],
      },
      description:
        "Lalli Fafa creates AI-powered personalised children's stories in English and Hindi, where every child becomes the hero alongside beloved characters Lalli and Fafa.",
      foundingDate: "2024",
      areaServed: {
        "@type": "Country",
        name: "India",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${BASE}/#website`,
      url: BASE,
      name: "Lalli Fafa",
      dateModified: "2026-08-11",
      publisher: { "@id": `${BASE}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${BASE}/stories?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
      inLanguage: ["en-IN", "hi-IN"],
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${BASE}/#app`,
      name: "Lalli Fafa",
      url: BASE,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web, Android, iOS",
      description:
        "Personalised AI-generated children's stories with illustrated scenes and voice narration in English and Hindi. Your child is the hero of every story.",
      offers: [
        {
          "@type": "Offer",
          name: "Free Starter Plan",
          price: "0",
          priceCurrency: "INR",
          description: "200 welcome credits — approximately 2 illustrated stories.",
        },
        {
          "@type": "Offer",
          name: "Magic Pass",
          price: "199",
          priceCurrency: "INR",
          billingDuration: "P1M",
          description: "1,000 credits per month, Hindi narration, priority generation.",
        },
      ],
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        reviewCount: "1200",
        bestRating: "5",
      },
      review: [
        {
          "@type": "Review",
          author: { "@type": "Person", name: "Abhishek S." },
          reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
          reviewBody: "Bedtime used to be a battle. Now my son asks to go to bed early! Hearing his own name in the stories makes him feel so special. Best ₹199 I've spent this month.",
        },
        {
          "@type": "Review",
          author: { "@type": "Person", name: "Priya M." },
          reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
          reviewBody: "My 5-year-old refuses English books, but she listens to Lalli Fafa stories in Hindi every single day. Finally something that teaches values in our own language.",
        },
        {
          "@type": "Review",
          author: { "@type": "Person", name: "Rekha K." },
          reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
          reviewBody: "The only app that actually teaches them something while keeping them quiet. The personalisation is genius — they think Lalli and Fafa are their real friends!",
        },
        {
          "@type": "Review",
          author: { "@type": "Person", name: "Vikram T." },
          reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
          reviewBody: "My mother-in-law who speaks only Hindi now listens to stories with the kids. It's become a family ritual every evening. Amazing product.",
        },
        {
          "@type": "Review",
          author: { "@type": "Person", name: "Ananya R." },
          reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
          reviewBody: "My 4-year-old now talks about courage and kindness — words he picked up from the stories. The lessons really do stick. Highly recommend.",
        },
        {
          "@type": "Review",
          author: { "@type": "Person", name: "Rohan & Meena" },
          reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
          reviewBody: "We play a story every night at 8pm. It's our daughter's signal that bedtime is coming — and she loves it. Screen time that actually helps.",
        },
      ],
      screenshot: `${BASE}/lf-scene-orchard.png`,
      publisher: { "@id": `${BASE}/#organization` },
      inLanguage: ["en-IN", "hi-IN"],
    },
    {
      "@type": "FAQPage",
      "@id": `${BASE}/#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "What is Lalli Fafa?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Lalli Fafa is an AI-powered platform that creates personalised children's stories in English and Hindi. Parents enter their child's name and choose a theme, and the platform instantly generates a unique illustrated story with voice narration where the child is the hero alongside Lalli and Fafa.",
          },
        },
        {
          "@type": "Question",
          name: "How do I create a personalised story for my child?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Sign up free at lallifafa.com, enter your child's name, pick a story theme (adventure, friendship, space, Indian mythology and more), choose English or Hindi, and click Generate. Your illustrated story with narration is ready in under 60 seconds.",
          },
        },
        {
          "@type": "Question",
          name: "Are Lalli Fafa stories available in Hindi?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Lalli Fafa supports full Hindi narration with native-quality voices. Hindi is available on the Magic Pass plan (₹199/month). English stories are available on all plans including the free plan.",
          },
        },
        {
          "@type": "Question",
          name: "Is Lalli Fafa free?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes — sign up free and receive 200 welcome credits with no credit card required. That's enough for approximately 2 short stories to try before you decide to upgrade.",
          },
        },
        {
          "@type": "Question",
          name: "Is Lalli Fafa safe for young children?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Absolutely. Lalli Fafa is completely ad-free and all stories are reviewed for age-appropriateness. We use standard analytics to improve the product but never serve ads or share personal data. It is designed exclusively for children aged 2–10 with parental oversight.",
          },
        },
        {
          "@type": "Question",
          name: "What age group is Lalli Fafa designed for?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Lalli Fafa stories are designed for children aged 2 to 10 years. Shorter stories suit toddlers aged 2–4, while medium and long stories are better for children aged 5–10.",
          },
        },
        {
          "@type": "Question",
          name: "Can I share Lalli Fafa stories with family?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Every generated story can be shared via a public preview link, WhatsApp, or Facebook. Recipients can view the story preview without needing a Lalli Fafa account.",
          },
        },
      ],
    },
    {
      "@type": ["LocalBusiness", "OnlineBusiness"],
      "@id": `${BASE}/#localbusiness`,
      name: "Lalli Fafa",
      alternateName: "LalliFafa",
      url: BASE,
      description: "Personalised children's stories in English and Hindi, where every child becomes the hero alongside Lalli and Fafa.",
      telephone: "+919434636830",
      email: "hello@lallifafa.com",
      foundingDate: "2024",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Siliguri",
        addressRegion: "West Bengal",
        addressCountry: "IN",
        postalCode: "734001",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: "26.7271",
        longitude: "88.3953",
      },
      areaServed: { "@type": "Country", name: "India" },
      currenciesAccepted: "INR",
      paymentAccepted: "Credit Card, Debit Card, UPI, Net Banking",
      priceRange: "₹0–₹1999/year",
      sameAs: [
        "https://www.instagram.com/lallifafa",
        "https://www.facebook.com/lallifafa",
        "https://www.youtube.com/@lallifafa",
        "https://www.linkedin.com/company/lallifafa",
      ],
      image: {
        "@type": "ImageObject",
        url: `${BASE}/lf-logo.png`,
        width: 512,
        height: 512,
      },
      logo: {
        "@type": "ImageObject",
        url: `${BASE}/lf-logo.png`,
        width: 512,
        height: 512,
      },
      contactPoint: {
        "@type": "ContactPoint",
        email: "hello@lallifafa.com",
        contactType: "customer support",
        areaServed: "IN",
        availableLanguage: ["English", "Hindi"],
      },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Lalli Fafa Story Plans",
        itemListElement: [
          {
            "@type": "Offer",
            name: "Starter — Free",
            description: "200 welcome credits, short stories in English and Hindi.",
            price: "0",
            priceCurrency: "INR",
          },
          {
            "@type": "Offer",
            name: "Magic Pass — Monthly",
            description: "1,000 credits per month, all story lengths, voice narration, AI illustrations.",
            price: "199",
            priceCurrency: "INR",
          },
          {
            "@type": "Offer",
            name: "Magic Pass Pro — Yearly",
            description: "2,000 credits + 100/day, multiple child profiles, early feature access.",
            price: "1999",
            priceCurrency: "INR",
          },
        ],
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${BASE}/#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BASE },
        { "@type": "ListItem", position: 2, name: "Stories", item: `${BASE}/stories` },
        { "@type": "ListItem", position: 3, name: "Pricing", item: `${BASE}/pricing` },
        { "@type": "ListItem", position: 4, name: "Blog", item: `${BASE}/blog` },
      ],
    },
    {
      "@type": "HowTo",
      "@id": `${BASE}/#howto`,
      name: "How to create a personalised story on Lalli Fafa",
      description:
        "Create an AI-generated illustrated children's story with voice narration in English or Hindi in under 60 seconds.",
      totalTime: "PT1M",
      estimatedCost: { "@type": "MonetaryAmount", currency: "INR", value: "0" },
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          name: "Create your free account",
          text: "Sign up at lallifafa.com with your email. No credit card required. You get 200 free credits instantly.",
          url: `${BASE}/sign-up`,
        },
        {
          "@type": "HowToStep",
          position: 2,
          name: "Choose your story theme",
          text: "Pick from 10+ themes — adventure, friendship, space, Indian mythology, kindness, bedtime and more.",
          url: `${BASE}/stories`,
        },
        {
          "@type": "HowToStep",
          position: 3,
          name: "Enter your child's name and preferences",
          text: "Add your child's name, pick English or Hindi, and select story length (short, medium, or long).",
        },
        {
          "@type": "HowToStep",
          position: 4,
          name: "Generate and enjoy",
          text: "Click Generate. In under 60 seconds your child's personalised illustrated story with voice narration is ready to read and listen.",
        },
      ],
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />
      <main>
        <HeroSection />
        <PillarsSection />
        <CharactersSection />
        <HowItWorksSection />
        <WhyLalliFafaSection />
        <PricingSection />
        <ShopSection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
      </main>
      <SiteFooter />
      {/* Renders nothing for logged-out visitors (the vast majority of
          homepage traffic) -- only shows for signed-in users who land
          back on the marketing homepage, giving them the same one-tap
          app navigation available everywhere else. */}
      <MobileBottomNav />
    </>
  );
}
