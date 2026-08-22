// TESTSERVER — Story Challenge: generation (screen 5.5), scoring, and Stars
// (Functional Spec v1.1 §5.3, §5.5, §5.6, §6.1; v1.3 amendment §13.5 —
// 3 in-story quick checks + 7 base Challenge questions, unanswered quick
// checks roll into the Challenge). Isolated folder — delete along with the
// rest of convex/testserver/* and apps/web/src/app/testserver/* if no
// longer needed.

import { action, internalMutation, mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { GoogleGenAI } from "@google/genai";
import { api, internal } from "../_generated/api";
import {
  assertAdmin,
  assertAdminInAction,
  CHALLENGE_PILLAR_PLAN,
  PILLARS,
  QUICK_CHECK_INDICES,
  STARS,
  type Pillar,
} from "./_shared";

const PILLAR_ARG = v.union(
  v.literal("listening"),
  v.literal("attention"),
  v.literal("emotional"),
  v.literal("cognitive")
);

function cleanJson(raw: string): string {
  return raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
}

function storyBody(content: string): string {
  return content.split(/^SCENE METADATA$/m)[0].trim();
}

// ─── Generate the 10 Story Challenge questions from the story text ───
// (3 of them double as in-story quick checks — see QUICK_CHECK_INDICES)

export const generateChallenge = action({
  args: { storyId: v.id("stories") },
  handler: async (ctx, { storyId }): Promise<{ challengeId: string }> => {
    const { userId } = await assertAdminInAction(ctx);

    const story = await ctx.runQuery(api.stories.get, { storyId });
    if (!story || !story.content) throw new Error("Story not ready yet");

    const profile: any = await ctx.runQuery(api.userProfiles.getProfile, {});
    const childName = story.params.childName || profile?.childName || "the child";
    const childAge = profile?.childAge ?? 5;

    const body = storyBody(story.content);

    const prompt = `You are generating a "Story Challenge" (a warm, playful post-story checkpoint — NEVER call it a test, quiz, or assessment) for a ${childAge}-year-old named ${childName}, based on the story below.

STORY:
"""
${body}
"""

IMPORTANT: Write every question, snippet, and option in ENGLISH, even though the story above may be in a different language. The child reading the Story Challenge should see only English text.

Return ONLY strict JSON (no markdown fences, no commentary) with this exact shape:
{
  "questions": [
    { "pillar": "cognitive", "snippet": string, "question": string, "options": string[2-4], "correctIndex": number },
    { "pillar": "cognitive", "snippet": string, "question": string, "options": string[2-4], "correctIndex": number },
    { "pillar": "cognitive", "snippet": string, "question": string, "options": string[2-4], "correctIndex": number },
    { "pillar": "attention", "snippet": string, "question": string, "options": string[2-4], "correctIndex": number },
    { "pillar": "attention", "snippet": string, "question": string, "options": string[2-4], "correctIndex": number },
    { "pillar": "listening", "snippet": string, "question": string, "options": string[2-4], "correctIndex": number },
    { "pillar": "listening", "snippet": string, "question": string, "options": string[2-4], "correctIndex": number },
    { "pillar": "emotional", "snippet": string, "question": string, "options": string[2-4], "expectedIndex": number },
    { "pillar": "emotional", "snippet": string, "question": string, "options": string[2-4], "expectedIndex": number },
    { "pillar": "emotional", "snippet": string, "question": string, "options": string[2-4], "expectedIndex": number }
  ]
}

Rules:
- "questions" must have EXACTLY 10 items in EXACTLY this pillar order: cognitive, cognitive, cognitive, attention, attention, listening, listening, emotional, emotional, emotional.
- "snippet" is two short lines of dialogue or narration taken directly from the story (translated to English if the story itself is in another language), grounding the question in what was told.
- "cognitive"/"attention"/"listening" questions must have exactly ONE clearly, unambiguously correct answer given the story — correctIndex must point to it. Do not write options that could plausibly all seem wrong or all seem right; a child who listened carefully should be able to pick the right one confidently.
- "emotional" questions ask how a character felt at a specific moment — set expectedIndex to the option that most clearly matches what the story depicts (the story should make one answer clearly the best fit, not three equally-plausible feelings).
- The 3 "emotional" questions must be about 3 DIFFERENT moments/characters and must NOT all use the same sentence pattern (e.g. do not write "How did ___ feel?" three times in a row) — vary the phrasing: e.g. one could ask what a character was feeling, another what a character might have been thinking, another why a character reacted the way they did. They should read as three distinct questions, not a repeated template with the names swapped.
- Never use percentile, ranking, or comparison-to-other-children language anywhere.
- Keep every question and option short enough for a young child to read or have read to them.`;

    const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

    async function ask(): Promise<any> {
      const resp = await gemini.models.generateContent({
        model: "gemini-2.5-pro",
        config: { temperature: 0.6, responseMimeType: "application/json" },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });
      const text = resp.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
      return JSON.parse(cleanJson(text));
    }

    let parsed: any;
    try {
      parsed = await ask();
      if (!Array.isArray(parsed?.questions) || parsed.questions.length !== 10) {
        parsed = await ask();
      }
    } catch {
      parsed = await ask();
    }
    if (!Array.isArray(parsed?.questions) || parsed.questions.length !== 10) {
      throw new Error("Story Challenge generation failed — please retry");
    }

    const questions = parsed.questions.map((q: any, i: number) => ({
      pillar: CHALLENGE_PILLAR_PLAN[i],
      snippet: String(q.snippet ?? ""),
      question: String(q.question ?? ""),
      options: (q.options ?? []).map(String),
      correctIndex: typeof q.correctIndex === "number" ? q.correctIndex : undefined,
      expectedIndex: typeof q.expectedIndex === "number" ? q.expectedIndex : undefined,
    }));

    const challengeId: string = await ctx.runMutation(internal.testserver.challenge._store, {
      userId,
      storyId,
      childName,
      childAge,
      theme: story.params.theme,
      lesson: story.params.lesson,
      length: story.params.length ?? "medium",
      questions,
    });

    return { challengeId };
  },
});

export const _store = internalMutation({
  args: {
    userId: v.string(),
    storyId: v.id("stories"),
    childName: v.string(),
    childAge: v.number(),
    theme: v.string(),
    lesson: v.optional(v.string()),
    length: v.union(v.literal("short"), v.literal("medium"), v.literal("long")),
    questions: v.array(
      v.object({
        pillar: PILLAR_ARG,
        snippet: v.string(),
        question: v.string(),
        options: v.array(v.string()),
        correctIndex: v.optional(v.number()),
        expectedIndex: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("testserver_challenges", {
      ...args,
      quickCheckIndices: QUICK_CHECK_INDICES,
      answeredIndices: [],
      status: "ready",
      createdAt: Date.now(),
    });
  },
});

// ─── In-story quick check: answering is always optional, +2 stars whether right or wrong ───

export const submitQuickCheck = mutation({
  args: { challengeId: v.id("testserver_challenges"), questionIndex: v.number(), answeredIndex: v.number() },
  handler: async (ctx, { challengeId, questionIndex, answeredIndex }) => {
    const { userId } = await assertAdmin(ctx);
    const row = await ctx.db.get(challengeId);
    if (!row || row.userId !== userId) throw new Error("Not found");
    const quickCheckIndices = row.quickCheckIndices ?? [];
    if (!quickCheckIndices.includes(questionIndex)) throw new Error("Not a quick-check question");

    const existing = row.answeredIndices ?? [];
    if (existing.some((a) => a.index === questionIndex)) return; // already recorded, idempotent

    await ctx.db.patch(challengeId, {
      answeredIndices: [...existing, { index: questionIndex, answeredIndex }],
    });
    await ctx.db.insert("testserver_stars", {
      userId,
      amount: STARS.quickCheck,
      reason: "quick_check",
      refId: challengeId,
      createdAt: Date.now(),
    });
  },
});

// The N-th not-yet-shown quick check for a story, given how far into playback
// the child has reached (0..1). Returns null once all 3 have been shown.
export const getNextQuickCheck = query({
  args: { challengeId: v.id("testserver_challenges") },
  handler: async (ctx, { challengeId }) => {
    const { userId } = await assertAdmin(ctx);
    const row = await ctx.db.get(challengeId);
    if (!row || row.userId !== userId) return null;
    const quickCheckIndices = row.quickCheckIndices ?? [];
    const answered = new Set((row.answeredIndices ?? []).map((a) => a.index));
    const pending = quickCheckIndices.filter((i) => !answered.has(i));
    return pending.map((i) => ({ index: i, ...row.questions[i] }));
  },
});

// ─── Story Challenge submission: base 7 + any unanswered quick checks ───

function resolveChallengeIndices(row: { quickCheckIndices?: number[]; questions: any[]; answeredIndices?: { index: number; answeredIndex: number }[] }) {
  const quickCheckIndices = new Set(row.quickCheckIndices ?? []);
  const answeredSoFar = new Set((row.answeredIndices ?? []).map((a) => a.index));
  const indices: number[] = [];
  row.questions.forEach((_, i) => {
    if (!quickCheckIndices.has(i)) indices.push(i); // base 7
    else if (!answeredSoFar.has(i)) indices.push(i); // unanswered quick check rolls in
  });
  return indices;
}

export const getChallengeQuestions = query({
  args: { challengeId: v.id("testserver_challenges") },
  handler: async (ctx, { challengeId }) => {
    const { userId } = await assertAdmin(ctx);
    const row = await ctx.db.get(challengeId);
    if (!row || row.userId !== userId) return null;
    const indices = resolveChallengeIndices(row);
    return indices.map((i) => ({ index: i, ...row.questions[i] }));
  },
});

export const submitChallenge = mutation({
  args: {
    challengeId: v.id("testserver_challenges"),
    answers: v.array(v.object({ index: v.number(), answeredIndex: v.number() })),
  },
  handler: async (ctx, { challengeId, answers }) => {
    const { userId } = await assertAdmin(ctx);
    const row = await ctx.db.get(challengeId);
    if (!row || row.userId !== userId) throw new Error("Not found");
    if (row.status === "completed") return row.score; // idempotent

    const challengeIndices = resolveChallengeIndices(row);
    const answerMap = new Map(answers.map((a) => [a.index, a.answeredIndex]));
    if (challengeIndices.some((i) => !answerMap.has(i))) throw new Error("Missing an answer");

    // Score across all 10 questions, not just the ones just submitted here —
    // a question answered live as an in-story quick check still counts
    // toward the score once the Challenge is complete, it just isn't asked
    // again. Fixes a v1.3 bug where quick-check answers were silently
    // excluded from the visible score, making "X out of Y" not add up to
    // what the child actually answered.
    const fullAnswerMap = new Map<number, number>();
    for (const a of row.answeredIndices ?? []) fullAnswerMap.set(a.index, a.answeredIndex);
    for (const [i, v2] of answerMap) fullAnswerMap.set(i, v2);

    const perPillar = new Map<Pillar, { correct: number; total: number }>();
    for (const p of PILLARS) perPillar.set(p, { correct: 0, total: 0 });

    let gradableCorrect = 0;
    let gradableTotal = 0;

    // v1.3.2 (16 Aug 2026, owner request): score out of all 10 questions,
    // including Emotional intelligence — expectedIndex is treated as the
    // correct answer for those too. This reverses the original §5.5 rule
    // that Emotional questions are never folded into the number; see
    // functional spec §13.7.
    row.questions.forEach((q, i) => {
      const selected = fullAnswerMap.get(i);
      if (selected === undefined) return; // shouldn't happen once Challenge is complete
      const bucket = perPillar.get(q.pillar as Pillar)!;
      bucket.total += 1;
      const target = q.pillar === "emotional" ? q.expectedIndex : q.correctIndex;
      const isMatch = target !== undefined && selected === target;
      if (isMatch) bucket.correct += 1;
      gradableTotal += 1;
      if (isMatch) gradableCorrect += 1;
    });

    const ratios = PILLARS.map((p) => {
      const b = perPillar.get(p)!;
      return { pillar: p, ratio: b.total > 0 ? b.correct / b.total : 0, correct: b.correct, total: b.total };
    });
    const superpower = ratios.reduce((best, r) => (r.ratio > best.ratio ? r : best));
    const growingIn = ratios.reduce((worst, r) => (r.ratio < worst.ratio ? r : worst));

    const bonus = gradableTotal > 0 ? Math.round((gradableCorrect / gradableTotal) * STARS.challengeBonusMax) : 0;
    const starsEarned = STARS.challengeComplete + bonus;

    const score = {
      gradableCorrect,
      gradableTotal,
      perPillar: ratios.map(({ pillar, correct, total }) => ({ pillar, correct, total })),
      growingInPillar: growingIn.pillar,
      superpowerPillar: superpower.pillar,
      starsEarned,
      challengeIndices,
    };

    const mergedAnswered = [...(row.answeredIndices ?? [])];
    for (const i of challengeIndices) {
      if (!mergedAnswered.some((a) => a.index === i)) mergedAnswered.push({ index: i, answeredIndex: answerMap.get(i)! });
    }

    await ctx.db.patch(challengeId, {
      answeredIndices: mergedAnswered,
      status: "completed",
      score,
      completedAt: Date.now(),
    });

    await ctx.db.insert("testserver_stars", {
      userId,
      amount: STARS.challengeComplete,
      reason: "challenge_complete",
      refId: challengeId,
      createdAt: Date.now(),
    });
    if (bonus > 0) {
      await ctx.db.insert("testserver_stars", {
        userId,
        amount: bonus,
        reason: "challenge_bonus",
        refId: challengeId,
        createdAt: Date.now(),
      });
    }

    return score;
  },
});

export const getChallenge = query({
  args: { challengeId: v.id("testserver_challenges") },
  handler: async (ctx, { challengeId }) => {
    const { userId } = await assertAdmin(ctx);
    const row = await ctx.db.get(challengeId);
    if (!row || row.userId !== userId) return null;
    return row;
  },
});

export const getForStory = query({
  args: { storyId: v.id("stories") },
  handler: async (ctx, { storyId }) => {
    const { userId } = await assertAdmin(ctx);
    return await ctx.db
      .query("testserver_challenges")
      .withIndex("by_story", (q) => q.eq("storyId", storyId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();
  },
});

// All completed challenges for the calling admin, most recent first — used
// by the results screen to show "up from N last time".
export const getHistory = query({
  args: {},
  handler: async (ctx) => {
    const { userId } = await assertAdmin(ctx);
    const rows = await ctx.db
      .query("testserver_challenges")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    return rows
      .filter((r) => r.status === "completed")
      .sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0));
  },
});

export const getStarsBalance = query({
  args: {},
  handler: async (ctx) => {
    const { userId } = await assertAdmin(ctx);
    const rows = await ctx.db
      .query("testserver_stars")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    return rows.reduce((sum, r) => sum + r.amount, 0);
  },
});
