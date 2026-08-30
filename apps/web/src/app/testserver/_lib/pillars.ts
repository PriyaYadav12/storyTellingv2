// TESTSERVER — shared UI constants for the seven screens. Locked terminology
// per Functional Spec v1.1 §3 — this order, this wording, everywhere.

import { Ear, Eye, Heart, Brain } from "lucide-react";

export type Pillar = "listening" | "attention" | "emotional" | "cognitive";

export const PILLAR_ORDER: Pillar[] = ["listening", "attention", "emotional", "cognitive"];

export const PILLAR_LABELS: Record<Pillar, string> = {
  listening: "Listening",
  attention: "Attention and focus",
  emotional: "Emotional intelligence",
  cognitive: "Cognitive growth",
};

// Shortened for tight spaces (dashboard teaser card mini-badges) — the
// Growth tab and Results screen use the full PILLAR_LABELS above instead.
export const PILLAR_LABELS_SHORT: Record<Pillar, string> = {
  listening: "Listening",
  attention: "Focus",
  emotional: "Feelings",
  cognitive: "Thinking",
};

export const PILLAR_COLORS: Record<Pillar, string> = {
  listening: "#2979FF",
  attention: "#FF5722",
  emotional: "#7C4DFF",
  cognitive: "#00C9A7",
};

export const PILLAR_ICONS: Record<Pillar, typeof Ear> = {
  listening: Ear,
  attention: Eye,
  emotional: Heart,
  cognitive: Brain,
};

export const PILLAR_EMOJI: Record<Pillar, string> = {
  listening: "👂",
  attention: "🎯",
  emotional: "💗",
  cognitive: "🧠",
};

export const LENGTH_LABELS: Record<string, { label: string; minutes: string }> = {
  short: { label: "5 minutes", minutes: "~5 min" },
  medium: { label: "10 minutes", minutes: "~10 min" },
  long: { label: "15 minutes", minutes: "~15 min" },
};

export const SUPERPOWER_COPY: Record<Pillar, string> = {
  listening: "spotted every detail the story told them.",
  attention: "stayed locked in from start to finish.",
  emotional: "read the characters' feelings beautifully.",
  cognitive: "connected the dots in the story like a pro.",
};

export const GROWING_IN_COPY: Record<Pillar, string> = {
  listening: "more read-aloud moments will help this grow.",
  attention: "shorter, focused check-ins will help this grow.",
  emotional: "more stories with feelings will help this grow.",
  cognitive: "more \"what happens next\" questions will help this grow.",
};

// Next-story suggestions targeting each pillar — lesson name (matches the
// existing lessons table where possible) + a specific, friendly title.
export const GROWTH_STORY_SUGGESTIONS: Record<Pillar, { lesson: string; title: string; emoji: string }> = {
  listening: { lesson: "Kindness", title: "The whispering woods", emoji: "🌳" },
  attention: { lesson: "Teamwork", title: "The great treasure hunt", emoji: "🗺️" },
  emotional: { lesson: "Sharing", title: "The sharing garden", emoji: "🌷" },
  cognitive: { lesson: "Honesty", title: "The puzzle at midnight", emoji: "🧩" },
};

// Same lesson → emoji mapping used on the live /generate page, reused here
// (not imported directly since that file's icon map isn't exported).
export const LESSON_ICONS: Record<string, string> = {
  Kindness: "💖",
  Sharing: "🤝",
  Honesty: "🌟",
  Courage: "🦁",
  Teamwork: "🙌",
  "Caring for Nature": "🌱",
  Respect: "🙏",
  Gratitude: "💛",
  Friendship: "👫",
  Perseverance: "💪",
  Creativity: "🎨",
  Responsibility: "✅",
};
export const DEFAULT_LESSON_ICON = "📖";

// Lalli (sunshine) and Fafa (teal) — the two "voices" the Story Challenge
// and quick check are framed as coming from together (spec §5.5).
export const LALLI_COLOR = "var(--lf-sunshine)";
export const FAFA_COLOR = "var(--lf-teal)";
