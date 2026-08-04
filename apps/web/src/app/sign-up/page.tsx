import type { Metadata } from "next";
import { Suspense } from "react";
import { SignUpForm } from "./SignUpForm";

export const metadata: Metadata = {
  title: "Sign Up Free — 200 Story Credits, No Card Needed",
  description: "Create your free Lalli Fafa account and get 200 credits instantly — start with personalised illustrated stories with voice narration for your child. No credit card required.",
  alternates: { canonical: "https://www.lallifafa.com/sign-up" },
  robots: { index: true, follow: true },
};

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpForm />
    </Suspense>
  );
}
