"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

// Assembles the address client-side at runtime so it never appears as a
// contiguous "hello@lallifafa.com" string (or a working mailto: link) in
// the server-rendered HTML or JS bundle that scrapers actually read.
const USER = "hello";
const DOMAIN = "lallifafa.com";

export function ObfuscatedEmail({
  className,
  style,
  linkText,
  children,
}: {
  className?: string;
  style?: CSSProperties;
  /** Optional fixed label (e.g. "Email us"). Defaults to the address itself. */
  linkText?: string;
  /** Optional custom content (e.g. an icon + label). Takes priority over linkText. */
  children?: ReactNode;
}) {
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    setAddress(`${USER}@${DOMAIN}`);
  }, []);

  const label = children ?? linkText ?? address;

  if (!address) {
    return (
      <span className={className} style={style} aria-label="Email address (loading)">
        {children ?? linkText ?? "hello (at) lallifafa (dot) com"}
      </span>
    );
  }

  return (
    <a href={`mailto:${address}`} className={className} style={style}>
      {label}
    </a>
  );
}
