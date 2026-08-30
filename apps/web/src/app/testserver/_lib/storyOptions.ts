// TESTSERVER — same option maps/fallbacks used on the live /generate page
// (apps/web/src/app/generate/page.tsx), duplicated here rather than
// exported from that file so it stays untouched. Keeps terminology and
// values identical between the two screens.

export const THEME_ICONS: Record<string, string> = {
  "Magical Forest": "🌳",
  "Ocean Adventure": "🌊",
  "Space Journey": "🚀",
  "Jungle Safari": "🐘",
  "Mountain Quest": "⛰️",
  "Dinosaurs Park": "🦕",
  "Dinosaur Park": "🦕",
  "Birthday Party": "🎂",
  "Circus Fun": "🎪",
  "Desert Trek": "🏜️",
  "Treasure Hunt": "🗺️",
  "Ancient Kingdom": "🏰",
  "Festival Night": "🎉",
  "Cloud Kingdom": "☁️",
  "Underwater City": "🐠",
  "Village Fair": "🎡",
};
export const DEFAULT_THEME_ICON = "✨";

export const CARD_TINTS = ["#FFF4E0", "#E6FAF6", "#F3EEFF", "#FFE8EC", "#E8F5E9", "#FFF9DB"];

export const FALLBACK_STORY_TYPES = [
  { code: "adventure", name: "Big Adventure", emoji: "🗺️", description: "A quest full of discovery, teamwork, and a twist that changes everything." },
  { code: "silly", name: "Silly & Funny", emoji: "🌀", description: "Chaotic fun where Fafa's impossible ideas somehow save the day." },
  { code: "cozy", name: "Cozy Bedtime", emoji: "🌙", description: "A gentle, slow story full of warmth, perfect for winding down." },
];

export const FALLBACK_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
  { code: "hi", name: "Hindi", nativeName: "हिंदी", flag: "🇮🇳" },
];

export const LENGTHS: { value: "short" | "medium" | "long"; label: string; desc: string; credits: number; premium?: boolean }[] = [
  { value: "short", label: "Short", desc: "~3 min read", credits: 80 },
  { value: "medium", label: "Medium", desc: "~6 min read", credits: 100, premium: true },
  { value: "long", label: "Long", desc: "~10 min read", credits: 150, premium: true },
];
