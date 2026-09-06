// Dev-only free-tier Gemini text generation, for trying out story-writing
// changes without spending paid-key credits during local development.
//
// Why this is safe to keep in the same codebase/deployment as production:
// - `testFreeTierStory` below is an `internalAction`, not a public `action`.
// Internal functions are never part of the client-callable API surface --
// nothing in the real /generate flow (or any other client code) can invoke
// this, regardless of environment. It can only be run via `npx convex run`
// or the Convex dashboard, by someone with deploy access to this project.
// - It never touches the `stories` table, never charges credits, and never
// triggers the image/narration pipeline -- it only returns generated text
// for inspection.
// - GEMINI_FREE_TIER_KEY is a separate env var from GEMINI_API_KEY. If it
// is ever unset, generateWithFreeTierFallback simply always uses the paid
// key/model -- there is no path where a missing free-tier key breaks or
// changes production behaviour.
//
// Free-tier keys can only reach the Gemini 3.x model family (2.5-series
// models return 404 for new/unbilled projects, confirmed by testing), so
// the free path necessarily calls a different model than the paid path.
// `thinkingLevel: "MINIMAL"` is required for Gemini 3 models -- without it,
// real testing showed ~12,000-22,000 "thinking" tokens spent per story call
// (10-20x the actual story length) with no measurable quality difference;
// the legacy `thinkingBudget` parameter used by Gemini 2.5 is silently
// ignored on Gemini 3 models.

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { GoogleGenAI } from "@google/genai";

const FREE_TIER_MODEL = "gemini-3.6-flash";

let freeTierClient: GoogleGenAI | null = null;
function getFreeTierClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_FREE_TIER_KEY;
  if (!key) return null;
  if (!freeTierClient) freeTierClient = new GoogleGenAI({ apiKey: key });
  return freeTierClient;
}

interface GenerateRequest {
  temperature?: number;
  systemInstruction?: string;
  text: string;
}

interface FallbackResult {
  responseText: string;
  usedFreeTier: boolean;
  modelUsed: string;
  usage?: { promptTokenCount?: number; candidatesTokenCount?: number; thoughtsTokenCount?: number };
}

/**
 * Tries the free-tier key first (if configured), falling back to the given
 * paid client/model on any error -- quota exhaustion, free tier unset,
 * transient failure, or anything else.
 */
export async function generateWithFreeTierFallback(
  paidClient: GoogleGenAI,
  paidModel: string,
  req: GenerateRequest
): Promise<FallbackResult> {
  const free = getFreeTierClient();
  if (free) {
    try {
      const resp = await free.models.generateContent({
        model: FREE_TIER_MODEL,
        config: {
          temperature: req.temperature,
          systemInstruction: req.systemInstruction,
          thinkingConfig: { thinkingLevel: "MINIMAL" },
        },
        contents: [{ role: "user", parts: [{ text: req.text }] }],
      });
      const responseText = resp.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
      if (responseText) {
        return { responseText, usedFreeTier: true, modelUsed: FREE_TIER_MODEL, usage: resp.usageMetadata };
      }
      console.warn("[geminiFreeTier] Free-tier call returned empty text, falling back to paid key.");
    } catch (err) {
      console.warn("[geminiFreeTier] Free-tier call failed, falling back to paid key:", err instanceof Error ? err.message : err);
    }
  }

  const resp = await paidClient.models.generateContent({
    model: paidModel,
    config: { temperature: req.temperature, systemInstruction: req.systemInstruction },
    contents: [{ role: "user", parts: [{ text: req.text }] }],
  });
  const responseText = resp.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
  return { responseText, usedFreeTier: false, modelUsed: paidModel, usage: resp.usageMetadata };
}

/**
 * Manual dev tool: generate one test story via the free tier (falling back
 * to the paid key/model if the free tier is unavailable or fails), using
 * the same SYSTEM_PROMPT config the real pipeline uses, so results are
 * representative. Never writes to the stories table or charges credits.
 *
 * Run with e.g.:
 *   npx convex run geminiFreeTier:testFreeTierStory '{"childName":"Vanya","age":6,"theme":"Ocean Adventure","lesson":"Kindness","language":"English"}'
 */
export const testFreeTierStory = internalAction({
  args: {
    childName: v.string(),
    age: v.number(),
    theme: v.string(),
    lesson: v.optional(v.string()),
    language: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const paidClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    const systemInstruction = process.env.SYSTEM_PROMPT;

    const prompt =
      `Write a personalised children's story.\n` +
      `Child: ${args.childName}, age ${args.age}.\n` +
      `Theme: ${args.theme}.\n` +
      `Lesson: ${args.lesson ?? "none specified"}.\n` +
      `Language: ${args.language ?? "English"}.\n` +
      `Story length: short (roughly 550-650 words in the story body).`;

    const result = await generateWithFreeTierFallback(paidClient, "gemini-2.5-pro", {
      temperature: 0.4,
      systemInstruction,
      text: prompt,
    });

    console.log(`[geminiFreeTier] Used ${result.usedFreeTier ? "FREE tier" : "PAID"} key, model=${result.modelUsed}, usage=${JSON.stringify(result.usage)}`);

    return result;
  },
});
