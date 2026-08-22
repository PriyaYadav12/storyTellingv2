/**
 * Story Engine v2 — parallel action path.
 * The live engine (generateStory.ts) is untouched. This file is the isolated
 * v2 path that grows through Phases 1–6. Single cutover happens at Phase 7.
 *
 * Phase 1: age group, mode, primary pillar, structure shape, SystemPromptv5, story_memory write
 * Phase 2: preference rotation, world variety, resolver rotation, ending types, comedic dial,
 *          structure variants, secondary pillar
 * Phase 3: Hinglish-native generation path — script detection, Devanagari validation,
 *          targeted retry when model falls back to English or formal Hindi, in-payload
 *          Hinglish reminders reinforcing Layer 3, age-adjusted temperature for Hinglish
 * Phase 4: deterministic validator (title, scene count, speaker minimums, prohibited words,
 *          moralising phrases) + LLM validator (primary pillar, resolver, brand voice) +
 *          targeted repair (surgical correction prompt, soft-fail on error)
 * Phase 5: voice/emotion metadata extraction (scene-level + hero-line overrides) +
 *          situational sting placement (sparse, gap-enforced, LLM-driven)
 */

import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";
import { GoogleGenAI } from "@google/genai";
import { api, internal } from "./_generated/api";
import {
  extractVoiceEmotionMetadata,
  computeStingPlacements,
} from "./audioMetadata";
import {
  PILLARS as ALL_PILLARS,
  PILLAR_DESCRIPTIONS,
  PILLAR_REPAIR_HINTS,
  type Pillar,
} from "./pillars";

// ─── Types ────────────────────────────────────────────────────────────────────

type AgeGroup = "A" | "B" | "C";
type Mode = "quest" | "wonder";
type StoryLength = "quick" | "big";
type PreferenceRole = "primary" | "secondary" | "background" | "omitted";
type Resolver = "child" | "lalli" | "fafa";

// ─── Flavor tables ────────────────────────────────────────────────────────────

const ALL_MODES: Mode[] = ["quest", "wonder"];
const RESOLVER_CYCLE: Resolver[] = ["child", "lalli", "fafa"];

const ENDING_TYPES = [
  "warm_resolution",       // everyone feels good; cozy landing
  "funny_twist",           // Fafa's gag or comic beat seals it
  "unexpected_discovery",  // solving one thing reveals something delightful
  "quiet_payoff",          // gentle, internal resolution — best for Wonder
] as const;

const TIME_OPTIONS    = ["morning", "afternoon", "evening", "night"];
const LOCATION_OPTIONS = [
  "home", "park", "school", "forest", "beach",
  "city", "garden", "library", "farm", "hilltop",
];
const ENVIRONMENT_OPTIONS = ["sunny", "cloudy", "breezy", "misty", "golden-hour"];

// Narrative arc variants — appended to the base structureShape in the payload
const NARRATIVE_ARC_VARIANTS: Record<string, [string, string]> = {
  compressed_5beat: [
    "Linear — characters move outward toward a goal and return changed.",
    "Circular — characters start and end in the same place; the journey changes them, not the location.",
  ],
  full_9beat: [
    "Classic arc — stakes escalate through the middle, satisfying resolution at the end.",
    "Discovery-led — curiosity drives the plot; the answer reveals itself gradually rather than arriving at a climax.",
  ],
};

// ─── Hinglish script helpers ──────────────────────────────────────────────────

const DEVANAGARI_RE = /[ऀ-ॿ]/;

/** True when the text contains Devanagari characters as expected for Hinglish. */
function hasDevanagari(text: string): boolean {
  return DEVANAGARI_RE.test(text);
}

/**
 * True when the story body looks like an English fallback.
 * We strip structural labels and dialogue prefixes (always Latin) before counting,
 * then check if > 75% of remaining words are ASCII-only.
 * In genuine Hinglish the ASCII portion is English loanwords, so it stays well below 75%.
 */
function looksLikeEnglishFallback(storyBody: string): boolean {
  const stripped = storyBody
    .replace(/^(Lalli|Fafa|SCENE METADATA|Scene \s*\d+)[:\s].*/gim, "")
    .trim();
  const words = stripped.split(/\s+/).filter((w) => w.length > 1);
  if (words.length < 10) return false;
  const asciiOnly = words.filter((w) => /^[A-Za-z0-9\-'.,:!?]+$/.test(w));
  return asciiOnly.length / words.length > 0.75;
}

// ─── Validation types ─────────────────────────────────────────────────────────

type ValidationSeverity = "critical" | "warning";

interface ValidationIssue {
  code:        string;
  severity:    ValidationSeverity;
  description: string;
  repairHint:  string;
}

// ─── Deterministic validator ──────────────────────────────────────────────────

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function computeSpeakerWordShares(
  body:      string,
  childName: string
): { narrator: number; lalli: number; fafa: number; child: number; total: number } {
  const lalliRx = /^Lalli:\s*/i;
  const fafaRx  = /^Fafa:\s*/i;
  const childRx = new RegExp(`^${escapeRegex(childName)}:\\s*`, "i");
  const counts  = { narrator: 0, lalli: 0, fafa: 0, child: 0 };

  for (const line of body.split("\n")) {
    const t = line.trim();
    if (!t) continue;
    let speaker: keyof typeof counts = "narrator";
    let text = t;
    if      (lalliRx.test(t)) { speaker = "lalli"; text = t.replace(lalliRx, ""); }
    else if (fafaRx.test(t))  { speaker = "fafa";  text = t.replace(fafaRx,  ""); }
    else if (childRx.test(t)) { speaker = "child"; text = t.replace(childRx, ""); }
    counts[speaker] += text.split(/\s+/).filter(Boolean).length;
  }

  const total = counts.narrator + counts.lalli + counts.fafa + counts.child;
  return { ...counts, total };
}

function runDeterministicValidation(
  content:  string,
  childName: string,
  ageGroup:  AgeGroup
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const splitAt = content.search(/^SCENE METADATA$/m);
  const body    = (splitAt !== -1 ? content.slice(0, splitAt) : content).trim();
  const meta    = splitAt !== -1 ? content.slice(splitAt) : "";

  // 1. Title contains all three characters
  const titleLine = body.split("\n").map((l) => l.trim()).find(Boolean) ?? "";
  const tl = titleLine.toLowerCase();
  if (!tl.includes("lalli") || !tl.includes("fafa") ||
      !tl.includes(childName.toLowerCase())) {
    issues.push({
      code: "TITLE_MISSING_CHARACTERS",
      severity: "critical",
      description: `Title "${titleLine}" is missing one or more characters (Lalli, Fafa, ${childName}).`,
      repairHint:  `Change the title to include the exact phrase "Lalli, Fafa and ${childName}".`,
    });
  }

  // 2. Scene metadata present
  if (splitAt === -1) {
    issues.push({
      code: "SCENE_METADATA_MISSING",
      severity: "critical",
      description: "The SCENE METADATA section is absent.",
      repairHint:  "Append a SCENE METADATA section after the story body with one line per scene.",
    });
  } else {
    // 3. Scene count in expected range for age group
    const sceneLines = meta.split("\n").filter((l) => /^Scene\s*\d+:/i.test(l.trim()));
    const [minS, maxS] = ageGroup === "A" ? [3, 4] : ageGroup === "B" ? [4, 5] : [5, 6];
    if (sceneLines.length < minS || sceneLines.length > maxS) {
      issues.push({
        code: "SCENE_COUNT_OUT_OF_RANGE",
        severity: "warning",
        description: `Scene metadata has ${sceneLines.length} scene(s); expected ${minS}–${maxS} for age group ${ageGroup}.`,
        repairHint:  `Adjust to ${minS}–${maxS} scenes in the SCENE METADATA section.`,
      });
    }
    // 4. Each scene metadata line must name the child
    const missChild = sceneLines.filter(
      (l) => !l.toLowerCase().includes(childName.toLowerCase())
    );
    if (missChild.length > 0) {
      issues.push({
        code: "SCENE_METADATA_CHILD_ABSENT",
        severity: "warning",
        description: `${missChild.length} scene metadata line(s) do not name ${childName}.`,
        repairHint:  `Every scene line must name ${childName} with a specific visible action.`,
      });
    }
  }

  // 5. Minimum speaker lines
  const lalliCount = (body.match(/^Lalli:/gim) ?? []).length;
  const fafaCount  = (body.match(/^Fafa:/gim)  ?? []).length;
  const childCount = (body.match(new RegExp(`^${escapeRegex(childName)}:`, "gim")) ?? []).length;

  if (lalliCount < 2) issues.push({
    code: "LALLI_TOO_FEW_LINES",
    severity: "critical",
    description: `Lalli speaks ${lalliCount} line(s); minimum is 2.`,
    repairHint:  "Add at least one more Lalli dialogue line that fits naturally in the story.",
  });
  if (fafaCount < 2) issues.push({
    code: "FAFA_TOO_FEW_LINES",
    severity: "critical",
    description: `Fafa speaks ${fafaCount} line(s); minimum is 2 (gag + one other).`,
    repairHint:  "Add a Fafa dialogue line (not the gag) that fits naturally.",
  });
  if (childCount < 1) issues.push({
    code: "CHILD_NO_LINES",
    severity: "critical",
    description: `${childName} has no dialogue.`,
    repairHint:  `Add one meaningful dialogue line for ${childName} that actively contributes to the plot.`,
  });

  // 6. Prohibited emotion words
  for (const word of ["afraid", "angry", "terrified", "furious"]) {
    if (new RegExp(`\\b${word}\\b`, "i").test(body)) {
      issues.push({
        code: `PROHIBITED_WORD_${word.toUpperCase()}`,
        severity: "critical",
        description: `Story contains prohibited word "${word}".`,
        repairHint:  `Replace "${word}" with a gentler alternative (afraid→unsure, angry→upset).`,
      });
    }
  }

  // 7. Moralising phrases
  for (const phrase of ["learned that", "remembered that", "the lesson", "the moral", "moral of"]) {
    if (new RegExp(phrase, "i").test(body)) {
      issues.push({
        code: "MORALISING_PHRASE",
        severity: "critical",
        description: `Story contains moralising phrase "${phrase}".`,
        repairHint:  `Remove the sentence with "${phrase}". Show the value through what characters do, never what they conclude.`,
      });
    }
  }

  // 8. Dialogue word-share against age-group targets (§I — ±15pp tolerance)
  const targets = resolveDialogueTargets(ageGroup);
  const shares  = computeSpeakerWordShares(body, childName);
  if (shares.total > 0) {
    const TOLERANCE = 0.15;
    const offTarget: string[] = [];
    const speakerMap: Array<[keyof typeof targets, keyof typeof shares]> = [
      ["narrator", "narrator"],
      ["lalli", "lalli"],
      ["fafa", "fafa"],
      ["child", "child"],
    ];
    for (const [tk, sk] of speakerMap) {
      const actual = (shares[sk] as number) / shares.total;
      const diff   = actual - targets[tk];
      if (Math.abs(diff) > TOLERANCE) {
        offTarget.push(
          `${tk}: target ${Math.round(targets[tk] * 100)}%, actual ${Math.round(actual * 100)}% (${diff > 0 ? "+" : ""}${Math.round(diff * 100)}pp)`
        );
      }
    }
    if (offTarget.length > 0) {
      issues.push({
        code:        "DIALOGUE_WORD_SHARE_OFF_TARGET",
        severity:    "critical",
        description: `Word-share distribution off-target: ${offTarget.join("; ")}.`,
        repairHint:  `Rebalance dialogue so each speaker stays within 15pp of age-group ${ageGroup} targets — narrator ${Math.round(targets.narrator * 100)}%, Lalli ${Math.round(targets.lalli * 100)}%, Fafa ${Math.round(targets.fafa * 100)}%, ${childName} ${Math.round(targets.child * 100)}%.`,
      });
    }
  }

  return issues;
}

// ─── LLM validator ────────────────────────────────────────────────────────────

async function runLLMValidation(
  content:     string,
  primaryPillar: Pillar,
  resolvedBy:  Resolver,
  makeValidationRequest: (text: string) => Promise<{ candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }>
): Promise<ValidationIssue[]> {
  const prompt =
    `You are a children's story quality validator. Read the story and evaluate it. Return ONLY valid JSON — no markdown, no extra text.\n\n` +

    `RULE 1 — PRIMARY PILLAR (${primaryPillar}): Does the story clearly contain a "${primaryPillar}" mechanic where ` +
    `${PILLAR_DESCRIPTIONS[primaryPillar]}? The mechanic must be plot-essential, not decorative.\n\n` +

    `RULE 2 — RESOLVER: Does "${resolvedBy}" actually solve the main problem? (Not just participate — ` +
    `they must drive the key action that resolves the central challenge.)\n\n` +

    `RULE 3 — BRAND VOICE: Is the story free from moralising? No character should state, imply, or ` +
    `summarise a lesson — even indirectly (e.g. "she knew now that sharing was important" is moralising).\n\n` +

    `STORY:\n${content}\n\n` +

    `Return exactly:\n` +
    `{"primary_pillar":{"pass":true,"note":"brief"},"resolver":{"pass":true,"note":"brief"},"brand_voice":{"pass":true,"note":"brief"}}`;

  try {
    const resp = await makeValidationRequest(prompt);
    const raw  = resp.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "{}";
    const json = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const result = JSON.parse(json) as {
      primary_pillar: { pass: boolean; note: string };
      resolver:       { pass: boolean; note: string };
      brand_voice:    { pass: boolean; note: string };
    };

    const issues: ValidationIssue[] = [];

    if (!result.primary_pillar?.pass) {
      issues.push({
        code:        "PRIMARY_PILLAR_MISSING",
        severity:    "critical",
        description: `Primary pillar "${primaryPillar}" mechanic is not clearly plot-essential. ${result.primary_pillar?.note ?? ""}`.trim(),
        repairHint:  PILLAR_REPAIR_HINTS[primaryPillar],
      });
    }
    if (!result.resolver?.pass) {
      issues.push({
        code:        "RESOLVER_TARGET_MISSED",
        severity:    "warning",
        description: `"${resolvedBy}" did not clearly drive the resolution. ${result.resolver?.note ?? ""}`.trim(),
        repairHint:  `Revise the resolution beat so ${resolvedBy} is the one who takes the decisive action that solves the main problem.`,
      });
    }
    if (!result.brand_voice?.pass) {
      issues.push({
        code:        "BRAND_VOICE_MORALISING",
        severity:    "critical",
        description: `Moralising detected. ${result.brand_voice?.note ?? ""}`.trim(),
        repairHint:  "Remove any line where a character states or implies a lesson. Values must appear only through what characters do, never through what they conclude.",
      });
    }

    return issues;
  } catch (err) {
    console.warn("[v2] LLM validation parse error (soft fail):", err);
    return [];
  }
}

// ─── Targeted repair ──────────────────────────────────────────────────────────

async function runTargetedRepair(
  content:       string,
  issues:        ValidationIssue[],
  wordCountLabel: string,
  makeRequest:   (temp: number, text: string) => Promise<{ candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }>
): Promise<string> {
  const criticals = issues.filter((i) => i.severity === "critical");
  const warnings  = issues.filter((i) => i.severity === "warning");

  const issueBlock = [
    ...criticals.map((i, n) => `CRITICAL ${n + 1}: ${i.description}\n  FIX: ${i.repairHint}`),
    ...warnings .map((i, n) => `WARNING  ${n + 1}: ${i.description}\n  FIX: ${i.repairHint}`),
  ].join("\n\n");

  const prompt =
    `The children's story below has quality issues that need fixing.\n\n` +
    `ISSUES:\n${issueBlock}\n\n` +
    `REPAIR RULES (follow exactly):\n` +
    `• Fix ONLY the listed issues — do not change plot, setting, or character names.\n` +
    `• Keep the word count close to ${wordCountLabel} words in the story body.\n` +
    `• Do not add or remove scenes.\n` +
    `• Keep all structural labels (SCENE METADATA, Scene 1:, Lalli:, Fafa:) unchanged.\n` +
    `• Return the COMPLETE corrected story: title + body + SCENE METADATA.\n\n` +
    `ORIGINAL STORY:\n${content}\n\nCORRECTED STORY:`;

  try {
    const resp    = await makeRequest(0.3, prompt);
    const repaired = resp.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (repaired && repaired.length > 200) return repaired;
    console.warn("[v2] Repair returned unusable content — keeping original.");
    return content;
  } catch (err) {
    console.warn("[v2] Targeted repair failed (soft fail):", err);
    return content;
  }
}

// ─── Resolution helpers ───────────────────────────────────────────────────────

function resolveAgeGroup(age: number): AgeGroup {
  if (age <= 5) return "A";
  if (age <= 8) return "B";
  return "C";
}

function resolveStoryLength(length: "short" | "medium" | "long" | undefined): StoryLength {
  return length === "short" ? "quick" : "big";
}

function resolveWordCount(
  storyLength: StoryLength,
  language: string
): { min: number; target: number; max: number; label: string } {
  const isHindi = language.toLowerCase().includes("hindi") ||
                  language.toLowerCase().includes("hinglish");
  if (storyLength === "quick") {
    return isHindi
      ? { min: 300, target: 350, max: 380, label: "320–380" }
      : { min: 330, target: 385, max: 420, label: "350–420" };
  }
  return isHindi
    ? { min: 580, target: 660, max: 730, label: "600–730" }
    : { min: 630, target: 720, max: 800, label: "650–800" };
}

function resolveDialogueTargets(ageGroup: AgeGroup) {
  const map: Record<AgeGroup, { narrator: number; lalli: number; fafa: number; child: number }> = {
    A: { narrator: 0.45, lalli: 0.25, fafa: 0.20, child: 0.10 },
    B: { narrator: 0.35, lalli: 0.25, fafa: 0.20, child: 0.20 },
    C: { narrator: 0.30, lalli: 0.23, fafa: 0.22, child: 0.25 },
  };
  return map[ageGroup];
}

function resolveStructureShape(storyLength: StoryLength, ageGroup: AgeGroup): string {
  if (storyLength === "quick" || ageGroup === "A") return "compressed_5beat";
  return "full_9beat";
}

/** Alternates between the two arc descriptions for this structureShape. */
function resolveNarrativeArc(
  structureShape: string,
  recordCount: number
): { variant: "a" | "b"; description: string } {
  const variants = NARRATIVE_ARC_VARIANTS[structureShape] ??
    ["Default linear arc.", "Default circular arc."];
  const idx = recordCount % 2;
  return { variant: idx === 0 ? "a" : "b", description: variants[idx] };
}

function resolveModeFromHistory(recentRecords: Array<{ mode: Mode }>): Mode {
  if (recentRecords.length === 0) return "quest";
  return recentRecords[0].mode === "quest" ? "wonder" : "quest";
}

function resolvePrimaryPillarFromHistory(
  recentRecords: Array<{ primaryPillar: Pillar }>
): Pillar {
  if (recentRecords.length === 0) return "cognitive";
  const recentPillars = recentRecords.map((r) => r.primaryPillar);
  for (const pillar of ALL_PILLARS) {
    if (!recentPillars.includes(pillar)) return pillar;
  }
  return recentPillars[recentPillars.length - 1];
}

/**
 * Secondary pillar: only for Big Story (full_9beat) — Quick stories keep one pillar.
 * Pick the pillar that's not primary and least recently used as either primary or secondary.
 */
function resolveSecondaryPillar(
  primaryPillar: Pillar,
  storyLength: StoryLength,
  recentRecords: Array<{ primaryPillar: Pillar; secondaryPillar?: Pillar }>
): Pillar | undefined {
  if (storyLength === "quick") return undefined;
  if (recentRecords.length < 2) return undefined; // need history to pick sensibly

  const recentlyUsed = new Set(
    recentRecords.slice(0, 4).flatMap((r) =>
      [r.primaryPillar, r.secondaryPillar].filter(Boolean) as Pillar[]
    )
  );

  for (const pillar of ALL_PILLARS) {
    if (pillar !== primaryPillar && !recentlyUsed.has(pillar)) return pillar;
  }
  // All used recently — pick the non-primary one used least recently
  const others = ALL_PILLARS.filter((p) => p !== primaryPillar);
  return others[recentRecords.length % others.length];
}

/**
 * Preference role cycle: primary → secondary → background → primary (repeating).
 * "omitted" is reserved for Phase 3+ when theme inference deems the preference a poor fit.
 */
function resolvePreferenceRole(
  recentRoles: Array<PreferenceRole | undefined>
): PreferenceRole {
  if (recentRoles.length === 0) return "primary";
  const last = recentRoles[0];
  if (!last || last === "background" || last === "omitted") return "primary";
  if (last === "primary") return "secondary";
  if (last === "secondary") return "background";
  return "primary";
}

/** Pick time/location/environment least recently used for this child. */
function resolveWorldVariety(
  recentRecords: Array<{ worldVariety?: { time: string; location: string; environment: string } }>
): { time: string; location: string; environment: string } {
  const usedTimes    = recentRecords.map((r) => r.worldVariety?.time).filter(Boolean) as string[];
  const usedLocs     = recentRecords.map((r) => r.worldVariety?.location).filter(Boolean) as string[];
  const usedEnvs     = recentRecords.map((r) => r.worldVariety?.environment).filter(Boolean) as string[];

  const pickLRU = (options: string[], used: string[]): string => {
    for (const opt of options) {
      if (!used.includes(opt)) return opt;
    }
    // All used — pick based on position (simple LRU fallback)
    return options[used.length % options.length];
  };

  return {
    time:        pickLRU(TIME_OPTIONS,       usedTimes),
    location:    pickLRU(LOCATION_OPTIONS,   usedLocs),
    environment: pickLRU(ENVIRONMENT_OPTIONS, usedEnvs),
  };
}

/** Resolver cycle: child → lalli → fafa → child */
function resolveResolver(
  recentRecords: Array<{ resolvedBy?: Resolver }>
): Resolver {
  if (recentRecords.length === 0) return "child";
  const last = recentRecords[0].resolvedBy;
  if (!last) return "child";
  const idx = RESOLVER_CYCLE.indexOf(last);
  return RESOLVER_CYCLE[(idx + 1) % RESOLVER_CYCLE.length];
}

/** Ending type cycles through the four types based on story count. */
function resolveEndingType(
  recentRecords: Array<{ endingType?: string }>,
  mode: Mode
): string {
  // Wonder mode prefers quiet_payoff; cycle the rest for Quest
  if (mode === "wonder") {
    const wonderTypes = ["quiet_payoff", "warm_resolution", "unexpected_discovery"];
    return wonderTypes[recentRecords.length % wonderTypes.length];
  }
  const count = recentRecords.length;
  return ENDING_TYPES[count % ENDING_TYPES.length];
}

/**
 * Comedic dial: 0.0 (serious/calm) → 1.0 (maximum comedy).
 * Wonder is always low. Quest varies by age group and alternates.
 */
function resolveComedicDial(
  mode: Mode,
  ageGroup: AgeGroup,
  recordCount: number
): number {
  if (mode === "wonder") {
    return [0.1, 0.15, 0.2][recordCount % 3];
  }
  const options: Record<AgeGroup, number[]> = {
    A: [0.5, 0.4, 0.6],
    B: [0.6, 0.8, 0.7, 0.9],
    C: [0.4, 0.6, 0.5],
  };
  const arr = options[ageGroup];
  return arr[recordCount % arr.length];
}

// ─── Preference payload builder ───────────────────────────────────────────────

const PREFERENCE_GUIDANCE: Record<PreferenceRole, string> = {
  primary:    "Must be a major character or central to the problem. Give it personality and let it contribute meaningfully to the resolution.",
  secondary:  "Appears in 2–3 moments as a supporting element — visible and noticed but not the main focus.",
  background: "A single natural mention only — in the setting or passing. No emphasis, no plot role.",
  omitted:    "Do not include this preference anywhere in the story.",
};

function buildPreferenceBlock(
  nickname: string | undefined,
  favoriteAnimal: string | undefined,
  animalRole: PreferenceRole,
  favoriteColor: string | undefined,
  colorRole: PreferenceRole
): Record<string, unknown> | null {
  const block: Record<string, unknown> = {};
  if (nickname) block.nickname = {
    value: nickname,
    guidance: `Lalli and Fafa call the child by this nickname in dialogue 1–2 times — naturally, not every sentence.`,
  };
  if (favoriteAnimal) block.favoriteAnimal = {
    value: favoriteAnimal,
    role: animalRole,
    guidance: PREFERENCE_GUIDANCE[animalRole],
  };
  if (favoriteColor) block.favoriteColor = {
    value: favoriteColor,
    role: colorRole,
    guidance: colorRole === "primary"
      ? `At least one everyday object must be ${favoriteColor} (e.g., a ${favoriteColor} bag, kite, ribbon, door). Natural and noticed — not a magical or glowing object.`
      : colorRole === "secondary"
        ? `${favoriteColor} appears on 1–2 objects in passing. The child may notice it briefly.`
        : colorRole === "background"
          ? `${favoriteColor} may appear on one object in the setting without comment.`
          : `Do not use ${favoriteColor} anywhere in the story.`,
  };
  return Object.keys(block).length > 0 ? block : null;
}

// ─── Payload builder (Layer 4 + 5) ───────────────────────────────────────────

function buildPayload(args: {
  child: { name: string; age: number; ageGroup: AgeGroup; gender: string };
  language: string;
  mode: Mode;
  structureShape: string;
  narrativeArc: { variant: "a" | "b"; description: string };
  primaryPillar: Pillar;
  secondaryPillar?: Pillar;
  storyLength: StoryLength;
  wordCount: { min: number; target: number; max: number; label: string };
  dialogueTargets: { narrator: number; lalli: number; fafa: number; child: number };
  comedicDial: number;
  theme: string;
  lesson?: string;
  resolvedBy: Resolver;
  endingType: string;
  worldVariety: { time: string; location: string; environment: string };
  preferences: Record<string, unknown> | null;
  previousStoryContent?: string;
}): string {
  const {
    child, language, mode, structureShape, narrativeArc,
    primaryPillar, secondaryPillar, storyLength, wordCount,
    dialogueTargets, comedicDial, theme, lesson,
    resolvedBy, endingType, worldVariety, preferences, previousStoryContent,
  } = args;

  const isHinglish  = language.toLowerCase().includes("hindi") ||
                      language.toLowerCase().includes("hinglish");
  const languageLabel = isHinglish ? "Hinglish" : "English";

  const payload: Record<string, unknown> = {
    child: {
      name:     child.name,
      age:      child.age,
      ageGroup: child.ageGroup,
      gender:   child.gender,
    },
    language: languageLabel,
    mode,
    structureShape,
    narrativeArc: {
      variant:     narrativeArc.variant,
      description: narrativeArc.description,
    },
    pillars: {
      primary:   primaryPillar,
      secondary: secondaryPillar ?? null,
    },
    storyLength,
    wordCountTarget: {
      min:    wordCount.min,
      target: wordCount.target,
      max:    wordCount.max,
      label:  wordCount.label,
    },
    dialogueDistributionTarget: dialogueTargets,
    comedicDial,
    story: {
      theme,
      lesson: lesson || null,
    },
    worldSetting: worldVariety,
    resolverTarget: resolvedBy,
    endingType,
  };

  if (preferences) payload.personalisation = preferences;

  if (isHinglish) {
    payload.hinglishGeneration = {
      reminder:
        "Generate DIRECTLY in Hinglish — do NOT write an English draft first and translate. Native generation only.",
      scriptRules: [
        "Devanagari is the base script for all narration and dialogue.",
        "English loanwords (colours, animal names, and common nouns: bag, ball, phone, school, park, birthday) stay in LATIN script inline — e.g. 'उसने red kite देखी', never 'उसने लाल पतंग देखी'.",
        "Character names (Lalli, Fafa, child's name) always in Latin script.",
        "Structural labels (SCENE METADATA, Scene 1:, Lalli:, Fafa:, child's name as speaker) always in Latin script.",
        "Grammar and sentence structure stay Hindi: verb-final, postpositions, gendered verb agreement.",
      ],
      examples: {
        GOOD: "Fafa ne apna blue ball dhoondha, lekin woh kahin nahi mila.",
        BAD_englishFallback: "Fafa searched for his blue ball but could not find it.",
        BAD_formalHindi: "ففا ने अपनी नीली गेंद खोजी, परंतु वह कहीं नहीं मिली।",
        BAD_randomSwitch: "Fafa searched for his ball जो नीला था।",
      },
    };
  }

  if (previousStoryContent) {
    payload.sequel = {
      previousStory: previousStoryContent,
      guidance:
        "SEQUEL: Continue from where the previous story ended. Reference what happened, " +
        "keep the same characters and world, introduce a NEW challenge or discovery. " +
        "Do not retell the previous story. Brief callback (1–2 sentences), then new adventure.",
    };
  }

  payload.instructions =
    `BEGIN STORY NOW. ` +
    `MANDATORY: The story body must be ${wordCount.label} words (title excluded, SCENE METADATA excluded). ` +
    `Count your words before finalising.`;

  return JSON.stringify(payload, null, 2);
}

// ─── Internal action: background Gemini work ─────────────────────────────────

export const _generateContentV2 = internalAction({
  args: {
    storyId:   v.id("stories"),
    profileId: v.id("user_profiles"),
    childId:   v.union(v.literal("1"), v.literal("2")),
    childInfo: v.object({
      name:            v.string(),
      gender:          v.union(v.literal("male"), v.literal("female"), v.literal("other")),
      age:             v.number(),
      avatarStorageId: v.optional(v.string()),
      nickname:        v.optional(v.string()),
      favoriteAnimal:  v.optional(v.string()),
      favoriteColor:   v.optional(v.string()),
    }),
    userId:   v.string(),
    theme:    v.string(),
    lesson:   v.optional(v.string()),
    language: v.optional(v.string()),
    length:        v.optional(v.union(v.literal("short"), v.literal("medium"), v.literal("long"))),
    requestedMode: v.optional(v.union(v.literal("quest"), v.literal("wonder"))),
    creditId: v.id("user_credits"),
    previousStoryContent: v.optional(v.string()),
  },

  handler: async (ctx, args) => {
    const {
      storyId, profileId, childId, childInfo, userId,
      theme, lesson, language, length, requestedMode, creditId, previousStoryContent,
    } = args;

    await ctx.runMutation(api.stories._markStatus, { storyId, status: "generating" });

    // ── 1. Load recent story_memory (up to 8 stories) ────────────────────
    type MemoryRecord = {
      mode: Mode;
      primaryPillar: Pillar;
      secondaryPillar?: Pillar;
      structureShape: string;
      storyLength: StoryLength;
      worldVariety?: { time: string; location: string; environment: string };
      preferenceRoles?: {
        favoriteAnimal?: PreferenceRole;
        favoriteColor?: PreferenceRole;
      };
      resolvedBy?: Resolver;
      endingType?: string;
    };
    const recentMemory = await ctx.runQuery(
      (api as any).storyMemory.getRecentForChild,
      { profileId, childId, limit: 8 }
    ) as MemoryRecord[];

    const recordCount = recentMemory.length;

    // Challenge "growing in" signal — look up the most recent completed Challenge
    // from the child's last 8 stories (joined via story_memory storyIds).
    // Window: completed within 7 days. Returns null when Challenge is not in production.
    const recentStoryIds = recentMemory.map((r: any) => r.storyId).filter(Boolean) as string[];
    const rawChallengeSignal: string | null = recentStoryIds.length > 0
      ? await ctx.runQuery(
          (internal as any).testserver.challenge.getGrowingInForStories,
          { storyIds: recentStoryIds }
        )
      : null;
    const VALID_PILLARS = new Set(["listening", "attention", "emotional", "cognitive"]);
    const challengeSignal: Pillar | null =
      rawChallengeSignal && VALID_PILLARS.has(rawChallengeSignal)
        ? rawChallengeSignal as Pillar
        : null;

    // ── 2. Resolve all engine dimensions ──────────────────────────────────
    const ageGroup        = resolveAgeGroup(childInfo.age);
    const storyLength     = resolveStoryLength(length);
    const lang            = language || "English";
    const wordCount       = resolveWordCount(storyLength, lang);
    const dialogueTargets = resolveDialogueTargets(ageGroup);
    const mode            = requestedMode ?? resolveModeFromHistory(recentMemory);
    const pillarSource    = challengeSignal ? "challenge_signal" : "lru_rotation";
    const primaryPillar   = challengeSignal ?? resolvePrimaryPillarFromHistory(recentMemory);
    const secondaryPillar = resolveSecondaryPillar(primaryPillar, storyLength, recentMemory);
    const structureShape  = resolveStructureShape(storyLength, ageGroup);
    const narrativeArc    = resolveNarrativeArc(structureShape, recordCount);
    const comedicDial     = resolveComedicDial(mode, ageGroup, recordCount);
    const resolvedBy      = resolveResolver(recentMemory);
    const endingType      = resolveEndingType(recentMemory, mode);
    const worldVariety    = resolveWorldVariety(recentMemory);

    // Preference role rotation
    const animalRoles = recentMemory.map((r) => r.preferenceRoles?.favoriteAnimal);
    const colorRoles  = recentMemory.map((r) => r.preferenceRoles?.favoriteColor);
    const animalRole  = childInfo.favoriteAnimal ? resolvePreferenceRole(animalRoles) : "omitted";
    const colorRole   = childInfo.favoriteColor  ? resolvePreferenceRole(colorRoles)  : "omitted";

    const preferences = buildPreferenceBlock(
      childInfo.nickname,
      childInfo.favoriteAnimal,
      animalRole,
      childInfo.favoriteColor,
      colorRole
    );

    const isHinglish = lang.toLowerCase().includes("hindi") ||
                       lang.toLowerCase().includes("hinglish");

    // ── 3. Build Layer 4+5 JSON payload ───────────────────────────────────
    const payload = buildPayload({
      child: { name: childInfo.name, age: childInfo.age, ageGroup, gender: childInfo.gender },
      language: lang,
      mode,
      structureShape,
      narrativeArc,
      primaryPillar,
      secondaryPillar,
      storyLength,
      wordCount,
      dialogueTargets,
      comedicDial,
      theme,
      lesson,
      resolvedBy,
      endingType,
      worldVariety,
      preferences,
      previousStoryContent,
    });

    // ── 4. Load SystemPromptv5 from DB ────────────────────────────────────
    const systemConfig = await ctx.runQuery((api as any).systemConfig.get, {
      key: "system_prompt",
    });
    const system = systemConfig?.value || process.env.SYSTEM_PROMPT;
    if (!system) {
      await ctx.runMutation(api.stories._markStatus, {
        storyId, status: "error", error: "SYSTEM_PROMPT not configured",
      });
      throw new Error("SYSTEM_PROMPT not configured.");
    }

    const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

    const makeRequest = (temperature: number, text: string) =>
      gemini.models.generateContent({
        model: "gemini-2.5-pro",
        config: { temperature, systemInstruction: system },
        contents: [{ role: "user", parts: [{ text }] }],
      });

    // ── 5. Initial generation ─────────────────────────────────────────────
    // Hinglish needs slightly higher temperature — the model's English-generation prior
    // is strong; more temperature helps it commit to Devanagari-base output natively.
    const initialTemp = isHinglish ? 0.5 : 0.4;
    let resp = await makeRequest(initialTemp, payload);
    let content = resp.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    // Retry 1: non-story response (RULE_CONFLICT, empty, or very short)
    const isNonStory = !content || content.length < 200 || /^[A-Z_]+$/.test(content);
    if (isNonStory) {
      console.warn("[v2] Non-story response, retrying:", content.slice(0, 80));
      resp = await makeRequest(0.7,
        payload +
        "\n\nReminder: write the story now. Keep all structural labels " +
        "(SCENE METADATA, Scene 1:, Scene 2:, Lalli:, Fafa:) in English. " +
        "Only story prose and dialogue should be in the requested language."
      );
      content = resp.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    }

    // Retry 1b (Hinglish only): detect English fallback or formal-Hindi output
    if (isHinglish && content.length > 200) {
      const storyBodyForScript = content.split(/^SCENE METADATA$/m)[0].trim();
      const devanagariMissing  = !hasDevanagari(storyBodyForScript);
      const englishDominant    = looksLikeEnglishFallback(storyBodyForScript);

      if (devanagariMissing || englishDominant) {
        console.warn(
          `[v2] Hinglish fallback detected (devanagariMissing=${devanagariMissing}, ` +
          `englishDominant=${englishDominant}). Retrying with native Hinglish correction...`
        );
        resp = await makeRequest(0.6,
          payload +
          "\n\nCRITICAL — HINGLISH CORRECTION: Your previous response was written in English " +
          "or formal Hindi, not Hinglish. You MUST generate natively in Hinglish:\n" +
          "• Devanagari is the base script for all narration and dialogue.\n" +
          "• English loanwords (colours, animal names, bag, ball, school, park) stay in Latin " +
          "script inline — e.g. 'Fafa ne apna blue ball dhoondha, lekin woh kahin nahi mila.'\n" +
          "• Do NOT write in English then translate — generate directly in Hinglish.\n" +
          "• Do NOT use formal/textbook Hindi with Sanskrit-origin words.\n" +
          "Start the story now in Hinglish."
        );
        content = resp.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || content;
      }
    }

    // Retry 2: word count out of range
    const storyBodyForCount = content.split(/^SCENE METADATA$/m)[0].trim();
    const wordCountActual   = storyBodyForCount.split(/\s+/).filter(Boolean).length;
    const tooShort = wordCountActual < wordCount.min && content.length > 200;
    const tooLong  = wordCountActual > wordCount.max;

    if (tooShort || tooLong) {
      const reason = tooShort
        ? `too short (${wordCountActual} words, need ${wordCount.label})`
        : `too long (${wordCountActual} words, max ${wordCount.max})`;
      console.warn(`[v2] Story body ${reason}, retrying...`);
      resp = await makeRequest(0.5,
        payload +
        `\n\nCRITICAL: Your previous attempt produced ~${wordCountActual} words. ` +
        `The story body MUST be ${wordCount.label} words — no more, no less. ` +
        `Count your words before finalising. Stop at ${wordCount.max} words.`
      );
      content = resp.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || content;
      const retryCount = content.split(/^SCENE METADATA$/m)[0].trim().split(/\s+/).filter(Boolean).length;
      console.log(`[v2] Retry word count: ${retryCount}`);
    } else {
      console.log(`[v2] Story word count: ${wordCountActual}`);
    }

    if (!content) {
      await ctx.runMutation(api.stories._markStatus, {
        storyId, status: "error", error: "Empty response from AI",
      });
      throw new Error("Empty response from AI");
    }

    // ── 5b. Validation + targeted repair ─────────────────────────────────
    // Gemini call with no system instruction — purely evaluating the story text.
    const makeValidationRequest = (text: string) =>
      gemini.models.generateContent({
        model:    "gemini-2.5-pro",
        config:   { temperature: 0.1 },
        contents: [{ role: "user", parts: [{ text }] }],
      });

    // Deterministic pass first (zero cost)
    const deterministicIssues = runDeterministicValidation(
      content, childInfo.name, ageGroup
    );
    const criticalDeterministic = deterministicIssues.filter(
      (i) => i.severity === "critical"
    );

    let validationIssues: ValidationIssue[] = deterministicIssues;

    if (criticalDeterministic.length === 0) {
      // Deterministic passed — run the (cheap) LLM pass for semantic checks
      const llmIssues = await runLLMValidation(
        content, primaryPillar, resolvedBy, makeValidationRequest
      );
      validationIssues = [...deterministicIssues, ...llmIssues];
    }

    const issuesRequiringRepair = validationIssues.filter(
      (i) => i.severity === "critical"
    );

    if (issuesRequiringRepair.length > 0) {
      console.warn(
        `[v2] ${issuesRequiringRepair.length} critical issue(s) — running targeted repair:`,
        issuesRequiringRepair.map((i) => i.code).join(", ")
      );
      content = await runTargetedRepair(
        content, issuesRequiringRepair, wordCount.label, makeRequest
      );
    } else if (validationIssues.length > 0) {
      // Warnings only — log but proceed
      console.log(
        `[v2] ${validationIssues.length} warning(s) (no repair needed):`,
        validationIssues.map((i) => i.code).join(", ")
      );
    } else {
      console.log("[v2] Validation passed.");
    }

    // ── 5c. Voice/emotion metadata extraction ────────────────────────────
    // Plain analysis call — no system instruction, low temperature.
    const makeAnalysisRequest = (text: string) =>
      gemini.models.generateContent({
        model:    "gemini-2.5-pro",
        config:   { temperature: 0.1 },
        contents: [{ role: "user", parts: [{ text }] }],
      });

    const voiceMetadata = await extractVoiceEmotionMetadata(content, makeAnalysisRequest);

    // ── 5d. Situational sting placement ──────────────────────────────────
    const activeStings: { _id: string; name: string; emotion: string; intensity: "subtle" | "medium"; durationSeconds: number }[] =
      await ctx.runQuery((api as any).stings.listActive, {});

    const availableStings: import("./audioMetadata").AvailableSting[] = activeStings.map((s) => ({
      stingId:         s._id,
      stingName:       s.name,
      emotion:         s.emotion,
      intensity:       s.intensity,
      durationSeconds: s.durationSeconds,
    }));

    const stingPlacements = await computeStingPlacements(
      content, voiceMetadata, availableStings, makeAnalysisRequest
    );

    // ── 6. Persist story content ──────────────────────────────────────────
    await ctx.runMutation(api.stories._setContent, { storyId, content });

    // Persist Phase 5 audio metadata (non-blocking — soft fail already handled above)
    await ctx.runMutation((api as any).stories._setVoiceMetadata, {
      storyId,
      voiceEmotionMetadata: voiceMetadata.scenes.length > 0 ? voiceMetadata : undefined,
      stingPlacements:      stingPlacements.length > 0       ? stingPlacements : undefined,
    });

    await ctx.runMutation(api.stories._markStatus, { storyId, status: "text_ready" });

    // ── 7. Deduct credits ─────────────────────────────────────────────────
    const creditCost = ({ short: 80, medium: 100, long: 150 } as const)[length ?? "short"] ?? 80;
    await ctx.runMutation(api.credit._updateCredit, { creditId, usedCredits: creditCost });

    // ── 8. Write story_memory record ──────────────────────────────────────
    await ctx.runMutation((api as any).storyMemory.create, {
      storyId,
      userId,
      profileId,
      childId,
      mode,
      primaryPillar,
      secondaryPillar,
      structureShape: `${structureShape}_${narrativeArc.variant}`,
      storyLength,
      worldVariety,
      preferenceRoles: {
        ...(childInfo.favoriteAnimal ? { favoriteAnimal: animalRole } : {}),
        ...(childInfo.favoriteColor  ? { favoriteColor:  colorRole  } : {}),
      },
      resolvedBy,
      endingType,
      pillarSource,
    });
    console.log(`[v2] primaryPillar="${primaryPillar}" source="${pillarSource}"${challengeSignal ? ` (challenge window hit)` : ""}`);

    // ── 9. Fire image + narration pipelines ──────────────────────────────
    await ctx.scheduler.runAfter(0, internal.internal.generateSceneImage.generateImages, {
      storyId,
      child: {
        id:              childId,
        name:            childInfo.name,
        gender:          childInfo.gender,
        age:             childInfo.age,
        avatarStorageId: childInfo.avatarStorageId,
      },
    });

    await ctx.scheduler.runAfter(0, internal.internal.generateNarration.generateNarration, {
      storyId,
      child: { name: childInfo.name, gender: childInfo.gender },
    });
  },
});

// ─── Public action: returns storyId immediately, runs v2 engine in background ─

export const enqueueStoryV2: ReturnType<typeof action> = action({
  args: {
    params: v.object({
      theme:        v.string(),
      lesson:       v.optional(v.string()),
      language:     v.optional(v.string()),
      childId:      v.optional(v.union(v.literal("1"), v.literal("2"))),
      sequelOfId:   v.optional(v.id("stories")),
      length:       v.optional(v.union(v.literal("short"), v.literal("medium"), v.literal("long"))),
      // Legacy fields accepted but ignored
      storyType:    v.optional(v.string()),
      textOnly:     v.optional(v.boolean()),
      useFavorites: v.optional(v.boolean()),
    }),
  },

  handler: async (ctx, { params }) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const profile = await ctx.runQuery(api.userProfiles.getProfile, {});
    if (!profile) throw new Error("Profile not found");

    const childId = params.childId || "1";
    const name =
      childId === "1"
        ? profile.childName  || profile.childNickName?.trim()
        : profile.child2Name || profile.child2NickName?.trim();
    const age =
      childId === "1" ? (profile.childAge  ?? 0) : (profile.child2Age  ?? 0);
    const gender =
      childId === "1" ? (profile.childGender  || "male") : (profile.child2Gender || "male");
    const avatarStorageId =
      childId === "1" ? profile.childAvatarStorageId : profile.child2AvatarStorageId;
    const nickname =
      childId === "1"
        ? profile.childNickName?.trim()        || undefined
        : profile.child2NickName?.trim()       || undefined;
    const favoriteAnimal =
      childId === "1"
        ? profile.favoriteAnimal?.trim()       || undefined
        : profile.child2FavoriteAnimal?.trim() || undefined;
    const favoriteColor =
      childId === "1"
        ? profile.favoriteColor?.trim()        || undefined
        : profile.child2FavoriteColor?.trim()  || undefined;

    // Credit gate
    const storyLength     = resolveStoryLength(params.length);
    const requiredCredits = ({ short: 80, medium: 100, long: 150 } as const)[params.length ?? "short"] ?? 80;
    const userCredit      = await ctx.runQuery(api.credit.list, {});
    if (!userCredit || userCredit.length === 0) throw new Error("No credit record found");
    if (userCredit[0].availableCredits < requiredCredits) throw new Error("Not enough credits");
    const creditId = userCredit[0]._id;

    // Sequel content
    let previousStoryContent: string | undefined;
    if (params.sequelOfId) {
      const prevStory = await ctx.runQuery(api.stories.get, { storyId: params.sequelOfId });
      if (prevStory?.content) {
        const metaIdx = prevStory.content.search(/^SCENE METADATA/mi);
        previousStoryContent =
          metaIdx !== -1 ? prevStory.content.slice(0, metaIdx).trim() : prevStory.content;
      }
    }

    // Create story record
    const storyId = await ctx.runMutation(api.stories._create, {
      title:  "",
      params: {
        theme:     params.theme,
        lesson:    params.lesson,
        language:  params.language,
        childName: name || undefined,
      },
    });

    await ctx.runMutation(api.userProfiles.updateStreak, {});

    const userId = String((user as any)._id);

    await ctx.scheduler.runAfter(0, internal.generateStoryV2._generateContentV2, {
      storyId,
      profileId: profile._id,
      childId,
      userId,
      childInfo: {
        name:            name || "",
        gender:          gender as "male" | "female" | "other",
        age,
        avatarStorageId,
        nickname,
        favoriteAnimal,
        favoriteColor,
      },
      theme:                params.theme,
      lesson:               params.lesson,
      language:             params.language,
      length:               params.length ?? "medium",
      requestedMode:        (params.storyType === "quest" || params.storyType === "wonder") ? params.storyType as "quest" | "wonder" : undefined,
      creditId,
      previousStoryContent,
    });

    return { storyId };
  },
});
