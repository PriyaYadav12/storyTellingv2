/**
 * Shared pillar constants — single source of truth for both the story engine
 * (generateStoryV2.ts) and the Story Challenge system (testserver/_shared.ts).
 *
 * All pillar-related constants live here. Neither consumer defines its own.
 */

export const PILLARS = ["listening", "attention", "emotional", "cognitive"] as const;
export type Pillar = (typeof PILLARS)[number];

/** Display labels shown in the UI (Story Challenge results screen) — must
 * match the brand architecture's pillar names exactly. */
export const PILLAR_LABELS: Record<Pillar, string> = {
  listening:  "Listening Skills",
  attention:  "Attention & Focus",
  emotional:  "Emotional Intelligence",
  cognitive:  "Cognitive Growth",
};

/**
 * What each pillar looks like when it works as the plot mechanic.
 * Used by the LLM validator to check that the primary pillar is genuinely
 * plot-essential, not decorative.
 */
export const PILLAR_DESCRIPTIONS: Record<Pillar, string> = {
  listening:  "a character notices, remembers, or correctly interprets something they heard earlier — the plot CANNOT resolve without it",
  attention:  "a character observes a detail or follows a trail of clues that others missed — the plot CANNOT resolve without it",
  emotional:  "a character recognises a feeling (own or another's) and responds — modelled through Lalli–Fafa dialogue, never narrator exposition",
  cognitive:  "a character reasons, compares options, predicts an outcome, or connects two clues to solve the problem",
};

/**
 * Targeted repair instructions for each pillar.
 * Used when the LLM validator finds the primary pillar mechanic is missing or
 * decorative — the repair prompt injects this hint so the model knows exactly
 * what to add.
 */
export const PILLAR_REPAIR_HINTS: Record<Pillar, string> = {
  listening:  "Add a moment where a character remembers something they heard earlier and it directly enables the resolution. The plot must be unable to resolve without this callback.",
  attention:  "Add a moment where a character notices a detail others missed (a sound, an object, a clue) that becomes the key to solving the problem.",
  emotional:  "Add a Lalli–Fafa exchange: Lalli initiates by noticing a feeling, Fafa reacts emotionally and in-character. This exchange must advance the plot, not just describe feelings.",
  cognitive:  "Add a moment where a character thinks through the problem — comparing two options, predicting what would happen, or connecting two separate clues — and this reasoning drives the resolution.",
};

/**
 * Fixed 10-question distribution for Story Challenge.
 * (Functional Spec §5.5): 3 Cognitive, 2 Attention, 2 Listening, 3 Emotional.
 * The indices correspond to question positions in the challenge array.
 */
export const CHALLENGE_PILLAR_PLAN: Pillar[] = [
  "cognitive", "cognitive", "cognitive",
  "attention", "attention",
  "listening", "listening",
  "emotional", "emotional", "emotional",
];
