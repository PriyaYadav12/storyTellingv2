/**
 * Debug tools for Story Engine v2 — testserver only.
 * These internalActions are never reachable from production handlers.
 * Call them from the Convex dashboard → Functions panel.
 *
 * checkHinglishThreshold — verify the 75% ASCII threshold against real story text
 * checkWordShares        — compare actual speaker word-share vs age-group targets
 */

import { internalAction, internalMutation, internalQuery } from "../_generated/server";
import { v } from "convex/values";
import { api, internal } from "../_generated/api";
import {
  computeSpeakerWordShares,
  resolveDialogueTargets,
  type AgeGroup,
} from "../generateStoryV2";

// ─── Hinglish threshold checker ───────────────────────────────────────────────

const DEVANAGARI_RE = /[ऀ-ॿ]/;
const SPEAKER_STRIP_RE = /^(Lalli|Fafa|SCENE METADATA|Scene\s*\d+)[:\s].*/gim;

/**
 * checkHinglishThreshold
 *
 * Usage: call from Convex dashboard with either:
 *   { text: "<paste story body here>" }
 *   { storyId: "<id>" }   ← looks up content from the stories table
 *
 * Returns:
 *   hasDevanagari    — whether any Devanagari script was detected
 *   totalWords       — word count after stripping speaker labels
 *   asciiWords       — how many of those words are ASCII-only
 *   asciiRatio       — asciiWords / totalWords (0–1)
 *   threshold        — the current gate value (0.75)
 *   looksLikeFallback — true if asciiRatio > threshold (retry would fire)
 *   verdict          — human-readable conclusion
 */
export const checkHinglishThreshold = internalAction({
  args: {
    text:    v.optional(v.string()),
    storyId: v.optional(v.string()),
  },
  handler: async (ctx, { text, storyId }) => {
    let body = text;

    if (!body && storyId) {
      const story = await ctx.runQuery(api.stories.get, { storyId: storyId as any });
      if (!story) throw new Error(`Story ${storyId} not found`);
      body = (story as any).content ?? "";
    }

    if (!body) throw new Error("Provide either `text` or `storyId`.");

    const hasDevanagari = DEVANAGARI_RE.test(body);

    const stripped = body.replace(SPEAKER_STRIP_RE, "").trim();
    const words    = stripped.split(/\s+/).filter((w) => w.length > 1);
    const ascii    = words.filter((w) => /^[A-Za-z0-9\-'.,:!?]+$/.test(w));

    const totalWords = words.length;
    const asciiWords = ascii.length;
    const asciiRatio = totalWords === 0 ? 0 : asciiWords / totalWords;
    const threshold  = 0.75;
    const looksLikeFallback = totalWords >= 10 && asciiRatio > threshold;

    const verdict = !hasDevanagari
      ? "⚠️  No Devanagari detected — story may already be English-only (or Devanagari check failed)"
      : looksLikeFallback
        ? `🔴 Would trigger Hinglish retry: ${Math.round(asciiRatio * 100)}% ASCII > ${threshold * 100}% threshold`
        : `✅ Passes: ${Math.round(asciiRatio * 100)}% ASCII ≤ ${threshold * 100}% threshold`;

    return {
      hasDevanagari,
      totalWords,
      asciiWords,
      asciiRatio: Math.round(asciiRatio * 1000) / 1000,
      threshold,
      looksLikeFallback,
      verdict,
      // Show which words counted as ASCII (first 30) for manual inspection
      sampleAsciiWords: ascii.slice(0, 30),
    };
  },
});

// ─── Word-share checker ───────────────────────────────────────────────────────

/**
 * checkWordShares
 *
 * Usage: call from Convex dashboard with:
 *   { storyId: "<id>", childName: "Arjun", ageGroup: "A" | "B" | "C" }
 *
 * Returns per-speaker actual vs target percentages and whether each is in-tolerance.
 * The ±15pp tolerance is applied against each speaker's target share.
 *
 * Run on 5–10 real stories before confirming the ±15pp tolerance is appropriate.
 */
export const checkWordShares = internalAction({
  args: {
    storyId: v.string(),
  },
  handler: async (ctx, { storyId }) => {
    const story = await ctx.runQuery(api.stories.get, { storyId: storyId as any });
    if (!story) throw new Error(`Story ${storyId} not found`);

    const body = (story as any).content ?? "";
    if (!body) throw new Error("Story has no content yet.");

    // Derive childName and ageGroup from the story's own data — no manual input needed.
    const childName: string = (story as any).params?.childName ?? "";
    if (!childName) throw new Error("Story params.childName is missing.");

    const profileId = (story as any).profileId;
    const profile = await ctx.runQuery(internal.userProfiles._getProfileById, {
      profileId,
    });
    if (!profile) throw new Error(`Profile ${profileId} not found`);

    // Match the story's childName to child1 or child2 to get the right age.
    const nameMatchesChild2 =
      profile.child2Name &&
      profile.child2Name.toLowerCase() === childName.toLowerCase();
    const childAge: number = nameMatchesChild2
      ? (profile.child2Age ?? profile.childAge)
      : profile.childAge;

    const ageGroup: AgeGroup = childAge <= 5 ? "A" : childAge <= 8 ? "B" : "C";

    const shares  = computeSpeakerWordShares(body, childName);
    const targets = resolveDialogueTargets(ageGroup);
    const TOLERANCE = 0.15;

    type Speaker = "narrator" | "lalli" | "fafa" | "child";
    const speakers: Speaker[] = ["narrator", "lalli", "fafa", "child"];

    const rows = speakers.map((s) => {
      const actual    = shares.total === 0 ? 0 : (shares[s] as number) / shares.total;
      const target    = targets[s];
      const diff      = actual - target;
      const inBand    = Math.abs(diff) <= TOLERANCE;
      return {
        speaker:      s === "child" ? childName : s.charAt(0).toUpperCase() + s.slice(1),
        target:       `${Math.round(target * 100)}%`,
        actual:       `${Math.round(actual * 100)}%`,
        diff:         `${diff >= 0 ? "+" : ""}${Math.round(diff * 100)}pp`,
        inTolerance:  inBand,
        verdict:      inBand ? "✅ ok" : `🔴 off by ${Math.abs(Math.round(diff * 100))}pp`,
      };
    });

    return {
      childName,
      childAge,
      ageGroup,
      tolerance: "±15pp",
      totalWords: shares.total,
      rows,
      allInBand: rows.every((r) => r.inTolerance),
    };
  },
});

// ─── Story lookup by email (for test account access) ─────────────────────────

/**
 * listStoriesForEmail
 *
 * Usage: call from Convex dashboard with:
 *   { email: "lallifafastory@gmail.com", limit: 5 }
 *
 * Returns the N most recent ready stories for the given user account.
 * Includes scene metadata summary for Challenge compatibility check.
 */
export const listStoriesForEmail = internalQuery({
  args: {
    email: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { email, limit = 5 }) => {
    const role = await ctx.db
      .query("user_roles")
      .filter((q: any) => q.eq(q.field("email"), email))
      .first();
    if (!role) return { error: `No user_roles row found for email: ${email}` };

    const userId = role.userId;
    const all = await ctx.db
      .query("stories")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .order("desc")
      .collect();

    const complete = all.filter((s: any) => s.status === "ready" || s.status === "voice_ready");
    const top = complete.slice(0, limit);

    return {
      userId,
      email,
      totalStories: all.length,
      completedStories: complete.length,
      stories: top.map((s: any) => ({
        _id: s._id,
        title: s.title,
        status: s.status,
        createdAt: s._creationTime,
        params: s.params ?? null,
        sceneCount: s.sceneMetadata?.length ?? 0,
        hasContent: typeof s.content === "string" && s.content.length > 0,
        // For Challenge compatibility: check each scene has format field
        sceneMetadataSample: (s.sceneMetadata ?? []).slice(0, 2).map((sc: any) => ({
          sceneNumber: sc.sceneNumber,
          hasDescription: !!sc.description,
          hasFormat: !!sc.format,
          hasFilePath: !!sc.filePath,
        })),
        profileId: s.profileId ?? null,
      })),
    };
  },
});

export const getProfileForStory = internalQuery({
  args: { storyId: v.string() },
  handler: async (ctx, { storyId }) => {
    const story = await ctx.db.get(storyId as any);
    if (!story) return { error: "Story not found" };
    const profileId = (story as any).profileId;
    if (!profileId) return { error: "Story has no profileId", storyId };
    const profile = await ctx.runQuery(internal.userProfiles._getProfileById, { profileId });
    if (!profile) return { error: "Profile not found", profileId };
    return {
      profileId,
      childName: (profile as any).childName,
      childAge: (profile as any).childAge,
      child2Name: (profile as any).child2Name ?? null,
      child2Age: (profile as any).child2Age ?? null,
    };
  },
});

// ─── Authoritative userId lookup ──────────────────────────────────────────────
//
// Returns the userId exactly as stored on the story document itself.
// Use this when a userId from user_roles or elsewhere doesn't match what
// generateChallengeBypass needs — the story's own userId is definitive.
//
// Usage: internal > testserver > debugTools > getStoryUserId
//   Args: { "storyId": "<id>" }
export const getStoryUserId = internalQuery({
  args: { storyId: v.string() },
  handler: async (ctx, { storyId }) => {
    const story = await ctx.db.get(storyId as any);
    if (!story) return { error: "Story not found", storyId };
    return {
      storyId,
      userId: (story as any).userId ?? null,
      title: (story as any).title ?? null,
      status: (story as any).status ?? null,
    };
  },
});

// ─── Seed system_config defaults for Story Challenge ─────────────────────────
//
// Seeds QuestionGenPromptV1 and ChallengeConfigV1 into system_config if they
// are not already present.  Safe to run multiple times — skips any key that
// already has a value, never overwrites customised config.
//
// Usage: Convex dashboard → Functions → Run internal function
//   internal > testserver > debugTools > seedChallengeDefaults
//   Args: {}
//   To force-overwrite existing values: { "force": true }
//
// After seeding, verify in the admin panel at /admin → Story Challenge tab.
export const seedChallengeDefaults = internalMutation({
  args: {
    force: v.optional(v.boolean()),
  },
  handler: async (ctx, { force = false }) => {
    const results: Record<string, string> = {};

    // ── QuestionGenPromptV1 ────────────────────────────────────────────────────
    const existingPrompt = await ctx.db
      .query("system_config")
      .withIndex("by_key", (q: any) => q.eq("key", "QuestionGenPromptV1"))
      .first();

    if (!existingPrompt || force) {
      const promptText = `You are generating the Story Challenge for Lalli & Fafa -- a short set of playful questions Lalli and Fafa ask together after a story, to help a child remember, notice, feel, and think about what just happened.

CORE RULE -- GROUND EVERY QUESTION IN THIS SPECIFIC STORY

Every question must reference something that actually happened in the story you were given -- a real line of dialogue, a real detail from a scene, a real moment. Never write a generic question that could apply to any story. If you cannot find real story content to ground a question in a given pillar, choose a different angle within that pillar rather than inventing a detail that isn't in the story.

THE FOUR PILLARS -- WHAT EACH ONE ACTUALLY TESTS

- Listening: the child must recall or interpret something a character SAID or that was narrated aloud -- not something they merely saw.
- Attention and focus: the child must recall a specific visual or descriptive DETAIL -- a color, a number, an object -- something noticed, not the main plot event.
- Cognitive growth: the child must reason -- word meaning, cause and effect, opposites, comparing two things, predicting what happens next.
- Emotional intelligence: the child must identify a feeling a character had, or how a feeling changed, grounded in a real story moment. There is no single "correct" feeling -- see the EQ rules below.

FORMAT RULES -- WHICH FORMAT FOR WHICH PILLAR

- Emotional intelligence questions are ALWAYS multiple choice. Never fill-in-the-blank, never match-the-column, never sequencing.
- Listening and Attention questions are multiple choice by default.
- Cognitive growth questions may use multiple choice, fill-in-the-blank, or match-the-column -- this pillar carries most of the format variety.
- Sequencing (ordering 3 story moments) may only be used for a Listening question, and only when age_group is "C".

FORMAT RULES -- WHAT'S ALLOWED BY AGE BAND (age_group is in the payload)

- age_group "A": multiple choice ONLY, every question. Keep options short, favor concrete words a pre-reader would recognize read aloud.
- age_group "B": multiple choice, fill-in-the-blank, or 3-item match-the-column.
- age_group "C": all of the above, plus 3-4 item match-the-column and sequencing.

Never use a format outside what's allowed for the given age_group, even if a pillar technically permits it.

HARD RULE -- NO FREE TEXT, EVER

Every answer must be selectable by tapping, never typed. Fill-in-the-blank means the child taps a word from a small provided word bank into the blank -- never an open text field. This applies at every age band.

EMOTIONAL INTELLIGENCE -- ACCEPTED ANSWER SETS, NOT ONE RIGID ANSWER

Feelings are genuinely more ambiguous than facts. For every EQ question, define 2 to 3 reasonably valid feeling words for that moment as the accepted set, not a single correct answer -- for example, both "nervous" and "worried" should be accepted for a child who felt scared but not frightened. The remaining wrong options should be feelings that clearly do NOT fit the scene, not near-misses.

MULTIPLE CHOICE OPTION RULES

- Use between 2 and 4 options per question -- vary this across the set.
- Vary where the correct answer sits -- do not put it in the same position across multiple questions in the same set.
- Vary option style where natural.

DO NOT REPEAT THE SAME PILLAR-FORMAT PAIRING AS RECENT STORIES

You will be given a short history of which pillar used which format in this child's last few Story Challenges. Avoid repeating an identical pairing where a different valid format exists for that pillar and age band. A child noticing "the format always tells me which pillar this is" is a pattern worth actively avoiding.

QUESTION ORDERING -- MANDATORY

You MUST output questions in this exact pillar sequence:
  1. All Cognitive growth questions (e.g. 3 in a row)
  2. All Attention and focus questions
  3. All Listening questions
  4. All Emotional intelligence questions

The array index of a question determines whether it is quick-check eligible. Outputting questions in any other order will cause the wrong questions to be treated as in-story quick checks. Do not reorder for "narrative flow" or any other reason.

QUICK-CHECK ELIGIBILITY

Exactly three questions in every set are eligible to double as in-story "quick checks" during playback. They are always:
  - Question at index 0 (the FIRST Cognitive growth question)
  - Question at index [cognitive count] (the FIRST Attention and focus question)
  - Question at index [cognitive count + attention count] (the FIRST Listening question)

The payload includes a "questionSequence" array listing the exact pillar for every index -- use it to confirm which three indices these are.

Mark those three questions with "isQuickCheckEligible": true. All other questions -- including every Emotional intelligence question and every subsequent Cognitive/Attention/Listening question -- must have "isQuickCheckEligible": false.

IMPORTANT: All three quick-check-eligible questions must use format: "mcq". Quick checks appear mid-story during audio playback and require simple tap-to-select interaction -- fill-in-the-blank, match-the-column, and sequencing are not available in that context.

TONE -- LALLI AND FAFA ARE ASKING, NOT TESTING

Every question and every reveal line should sound like Lalli and Fafa are curious and warm, not like a teacher grading an exam. Never phrase a question or a reveal as "the correct answer is" -- reveal lines should sound like a character speaking, e.g. "Close! Fafa was actually nervous here," never "Incorrect. The answer is nervous."

REVEAL FRAMING IS PART OF YOUR OUTPUT

For every question, write a one-line "revealFraming" string -- the warm line shown if a child gets two tries wrong. It should reference the correct answer naturally, in Lalli or Fafa's voice, grounded in the same story moment as the question itself.

OUTPUT FORMAT

Return ONLY valid JSON matching the schema you were given. No preamble, no explanation, no markdown code fences -- the raw JSON object only.

OUTPUT SCHEMA:
{
  "questions": [
    {
      "id": "q1",
      "pillar": "listening" | "attention" | "cognitive" | "emotional",
      "format": "mcq" | "fill_blank" | "match_column" | "sequence",
      "isQuickCheckEligible": true | false,
      "storyGrounding": "brief note on which story moment this references",
      "promptText": "the question shown to the child",
      "content": {
        // mcq: { "options": [{"id":"a","text":"..."},...], "correctOptionIds": ["b"] }
        // EQ mcq: { "options": [...], "correctOptionIds": ["b","c"] }
        // fill_blank: { "sentenceWithBlank": "Fafa felt ___ when he saw the puppy.", "wordBank": ["nervous","excited","sleepy","angry"], "correctWord": "nervous" }
        // match_column: { "leftItems": [{"id":"l1","text":"..."}], "rightItems": [{"id":"r1","text":"..."}], "correctPairs": [["l1","r1"]] }
        // sequence: { "items": [{"id":"s1","text":"..."}], "correctOrder": ["s2","s1","s3"] }
      },
      "revealFraming": "warm one-line reveal, in Lalli or Fafa voice"
    }
  ]
}`;
      const now = Date.now();
      if (existingPrompt) {
        await ctx.db.patch(existingPrompt._id, { value: promptText, updatedAt: now });
        results["QuestionGenPromptV1"] = "overwritten (force=true)";
      } else {
        await ctx.db.insert("system_config", { key: "QuestionGenPromptV1", value: promptText, updatedAt: now });
        results["QuestionGenPromptV1"] = "seeded";
      }
    } else {
      results["QuestionGenPromptV1"] = `skipped — already set (${existingPrompt.value.length} chars). Pass force:true to overwrite.`;
    }

    // ── ChallengeConfigV1 ──────────────────────────────────────────────────────
    const existingConfig = await ctx.db
      .query("system_config")
      .withIndex("by_key", (q: any) => q.eq("key", "ChallengeConfigV1"))
      .first();

    if (!existingConfig || force) {
      const configJson = JSON.stringify({
        pillarDistribution: {
          quick: { cognitive: 3, attention: 2, listening: 2, emotional: 3 },
          big:   { cognitive: 4, attention: 2, listening: 2, emotional: 4 },
        },
        rewardTiers: [
          { minPercent: 0,  maxPercent: 24,  stars: 5  },
          { minPercent: 25, maxPercent: 49,  stars: 10 },
          { minPercent: 50, maxPercent: 79,  stars: 15 },
          { minPercent: 80, maxPercent: 100, stars: 25 },
        ],
        retryCap: 2,
        quickCheckStars: 2,
      }, null, 2);

      const now2 = Date.now();
      if (existingConfig) {
        await ctx.db.patch(existingConfig._id, { value: configJson, updatedAt: now2 });
        results["ChallengeConfigV1"] = "overwritten (force=true)";
      } else {
        await ctx.db.insert("system_config", { key: "ChallengeConfigV1", value: configJson, updatedAt: now2 });
        results["ChallengeConfigV1"] = "seeded";
      }
    } else {
      results["ChallengeConfigV1"] = `skipped — already set. Pass force:true to overwrite.`;
    }

    return results;
  },
});

// ─── Fetch recent challenge questions for a userId ───────────────────────────
//
// Returns the N most recent testserver_challenges for a given userId, with
// just enough question data to diagnose retry / correctness issues.
//
// Usage: internal > testserver > debugTools > getRecentChallenges
//   Args: { "userId": "<id>", "limit": 1 }
export const getRecentChallenges = internalQuery({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { userId, limit = 1 }) => {
    const rows = await ctx.db
      .query("testserver_challenges")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .order("desc")
      .take(limit);

    return rows.map((row: any) => ({
      _id: row._id,
      storyId: row.storyId,
      status: row.status,
      createdAt: row._creationTime,
      questionCount: (row.questions ?? []).length,
      questions: (row.questions ?? []).map((q: any, i: number) => ({
        arrayIndex: i,
        index: q.index,
        pillar: q.pillar,
        format: q.format,
        promptText: (q.promptText ?? "").slice(0, 80),
        isQuickCheckEligible: q.isQuickCheckEligible,
        hasRichOptions: !!(q.richOptions?.length),
        richOptionCount: q.richOptions?.length ?? 0,
        correctOptionIds: q.correctOptionIds ?? null,
        hasCorrectWord: !!q.correctWord,
        hasCorrectPairs: !!(q.correctPairs?.length),
        hasCorrectOrder: !!(q.correctOrder?.length),
        correctIndex: q.correctIndex ?? null,
        expectedIndex: q.expectedIndex ?? null,
      })),
    }));
  },
});
