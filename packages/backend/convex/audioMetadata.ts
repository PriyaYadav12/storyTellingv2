/**
 * Phase 5 — audio metadata module.
 *
 * extractVoiceEmotionMetadata: scene-level emotion + hero-line overrides
 * computeStingPlacements:      sparse, gap-enforced placement of audio stings
 *
 * Both are plain async functions called from within _generateContentV2 (an
 * internalAction). They receive a makeRequest helper from the handler's scope
 * rather than being Convex actions themselves, so they run inside the same
 * scheduled job with no extra round-trips.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type StoryEmotion =
  | "happy" | "excited" | "curious" | "warm" | "playful"
  | "thoughtful" | "gentle" | "naughty" | "surprised"
  | "proud" | "calm" | "reassuring";

export interface SceneEmotionTag {
  sceneNumber: number;
  emotion:     StoryEmotion;
  intensity:   "subtle" | "medium";
}

export interface LineOverride {
  type:      "fafa_gag" | "emotional_exchange";
  emotion:   StoryEmotion;
  intensity: "subtle" | "medium";
}

export interface VoiceEmotionMetadata {
  scenes:        SceneEmotionTag[];
  lineOverrides: LineOverride[];
}

export interface AvailableSting {
  stingId:         string;   // Convex ID, kept as string here for transport
  stingName:       string;
  emotion:         string;
  intensity:       "subtle" | "medium";
  durationSeconds: number;
}

export interface StingPlacement {
  stingId:         string;
  stingName:       string;
  emotion:         string;
  intensity:       "subtle" | "medium";
  durationSeconds: number;
  targetScene:     number;
  placementHint:   string;
  volumeDb:        number;
}

type GeminiRequest = (text: string) => Promise<{
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
}>;

// ─── Allowed emotion vocabulary (closed set — Section N) ─────────────────────

const ALLOWED_EMOTIONS = new Set<StoryEmotion>([
  "happy", "excited", "curious", "warm", "playful",
  "thoughtful", "gentle", "naughty", "surprised",
  "proud", "calm", "reassuring",
]);

function isAllowedEmotion(e: string): e is StoryEmotion {
  return ALLOWED_EMOTIONS.has(e as StoryEmotion);
}

// ─── Voice/emotion metadata extraction ───────────────────────────────────────

/**
 * Extracts scene-level emotion tags and line-level overrides from the story.
 *
 * Uses a dedicated Gemini call with no system instruction (pure analysis task).
 * Soft-fails with an empty result if parsing fails — never blocks the story.
 */
export async function extractVoiceEmotionMetadata(
  content:    string,
  makeRequest: GeminiRequest
): Promise<VoiceEmotionMetadata> {
  const empty: VoiceEmotionMetadata = { scenes: [], lineOverrides: [] };

  const prompt =
    `You are extracting voice and emotion metadata from a children's story for audio narration.\n\n` +

    `EMOTION VOCABULARY — use only these exact words:\n` +
    `happy, excited, curious, warm, playful, thoughtful, gentle, naughty, surprised, proud, calm, reassuring\n\n` +

    `INTENSITY — "subtle" for gentle/background moments, "medium" for clear emotional beats.\n\n` +

    `TASKS:\n` +
    `1. Read the SCENE METADATA at the end of the story. For each scene, assign the best-fitting ` +
    `emotion and intensity from the vocabulary above.\n` +
    `2. Find Fafa's gag line (his one comedic line ≤ 8 words). Assign emotion and intensity.\n` +
    `3. Find the emotional-intelligence exchange between Lalli and Fafa (where Lalli notices a ` +
    `feeling and Fafa reacts emotionally and in-character). Assign emotion and intensity.\n` +
    `   If no such exchange exists, omit the emotional_exchange entry.\n` +
    `   If no gag line exists, omit the fafa_gag entry.\n\n` +

    `STORY:\n${content}\n\n` +

    `Return ONLY valid JSON — no markdown, no extra text:\n` +
    `{"scenes":[{"sceneNumber":1,"emotion":"curious","intensity":"subtle"}],"lineOverrides":[{"type":"fafa_gag","emotion":"naughty","intensity":"medium"}]}`;

  try {
    const resp = await makeRequest(prompt);
    const raw  = resp.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "{}";
    const json = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const parsed = JSON.parse(json) as {
      scenes?: Array<{ sceneNumber?: number; emotion?: string; intensity?: string }>;
      lineOverrides?: Array<{ type?: string; emotion?: string; intensity?: string }>;
    };

    const scenes: SceneEmotionTag[] = (parsed.scenes ?? [])
      .filter((s) => s.sceneNumber && isAllowedEmotion(s.emotion ?? ""))
      .map((s) => ({
        sceneNumber: s.sceneNumber!,
        emotion:     s.emotion as StoryEmotion,
        intensity:   s.intensity === "medium" ? "medium" : "subtle",
      }));

    const lineOverrides: LineOverride[] = (parsed.lineOverrides ?? [])
      .filter(
        (o) =>
          (o.type === "fafa_gag" || o.type === "emotional_exchange") &&
          isAllowedEmotion(o.emotion ?? "")
      )
      .map((o) => ({
        type:      o.type as "fafa_gag" | "emotional_exchange",
        emotion:   o.emotion as StoryEmotion,
        intensity: o.intensity === "medium" ? "medium" : "subtle",
      }));

    console.log(
      `[v2] Voice metadata: ${scenes.length} scenes, ${lineOverrides.length} line override(s).`
    );
    return { scenes, lineOverrides };
  } catch (err) {
    console.warn("[v2] Voice metadata extraction failed (soft fail):", err);
    return empty;
  }
}

// ─── Scene timing estimation ──────────────────────────────────────────────────

/**
 * Estimates the start timestamp (seconds) of each scene based on word count.
 * Assumes ~100 words/minute for children's narration.
 * Phase 6 will replace these estimates with real ElevenLabs word-timing output.
 */
function estimateSceneStartTimes(content: string): Map<number, number> {
  const [body, metaBlock] = content.split(/^SCENE METADATA$/m);
  if (!metaBlock) return new Map();

  // Count words per scene by splitting the body at scene-like boundaries
  // We use a simple heuristic: divide word count equally across scenes
  const sceneLines = metaBlock
    .split("\n")
    .filter((l) => /^Scene\s*\d+:/i.test(l.trim()));

  const totalWords   = (body ?? "").split(/\s+/).filter(Boolean).length;
  const sceneCount   = sceneLines.length;
  if (sceneCount === 0) return new Map();

  const wordsPerScene  = totalWords / sceneCount;
  const secondsPerWord = 60 / 100; // 100 wpm

  const map = new Map<number, number>();
  for (let i = 0; i < sceneCount; i++) {
    map.set(i + 1, Math.round(i * wordsPerScene * secondsPerWord));
  }
  return map;
}

// ─── Sting placement ──────────────────────────────────────────────────────────

const MIN_GAP_SECONDS = 8;
const MAX_PLACEMENTS  = 5;
const DEFAULT_VOLUME_DB = -3;

/**
 * Determines where to place audio stings.
 *
 * Governing principle (Section P): sparse by default. Silence is correct.
 * Never places to hit a quota.
 *
 * - Queries available stings grouped by emotion.
 * - Sends scene descriptions + emotion metadata to an LLM.
 * - Enforces minimum gap, available emotions, and placement count.
 * - Soft-fails with empty array on any error.
 */
export async function computeStingPlacements(
  content:         string,
  metadata:        VoiceEmotionMetadata,
  availableStings: AvailableSting[],
  makeRequest:     GeminiRequest
): Promise<StingPlacement[]> {
  if (availableStings.length === 0) {
    console.log("[v2] No stings in library — skipping placement.");
    return [];
  }
  if (metadata.scenes.length === 0) {
    console.log("[v2] No scene emotion metadata — skipping placement.");
    return [];
  }

  // Group available stings by emotion (LLM only gets what exists)
  const byEmotion: Record<string, AvailableSting[]> = {};
  for (const s of availableStings) {
    (byEmotion[s.emotion] ??= []).push(s);
  }
  const availableEmotions = Object.keys(byEmotion);

  // Scene timing estimates (Phase 5: approximate, replaced by real timing in Phase 6)
  const sceneTimes = estimateSceneStartTimes(content);

  // Scene summary for the LLM
  const sceneSummary = metadata.scenes
    .map((s) => {
      const startSec = sceneTimes.get(s.sceneNumber) ?? (s.sceneNumber - 1) * 30;
      return `Scene ${s.sceneNumber} (~${startSec}s): emotion="${s.emotion}", intensity="${s.intensity}"`;
    })
    .join("\n");

  const stingCatalogue = availableEmotions
    .map((em) => {
      const items = byEmotion[em]
        .map((s) => `  id=${s.stingId} name="${s.stingName}" intensity=${s.intensity} dur=${s.durationSeconds}s`)
        .join("\n");
      return `${em}:\n${items}`;
    })
    .join("\n\n");

  const prompt =
    `You are placing audio stings in a children's story narration.\n\n` +
    `GOVERNING PRINCIPLE: Sparse by default. Silence is correct. ` +
    `Place a sting ONLY where it genuinely enhances a specific moment — never to fill a quota.\n\n` +

    `CONSTRAINTS:\n` +
    `- Maximum ${MAX_PLACEMENTS} placements total.\n` +
    `- Minimum ${MIN_GAP_SECONDS} seconds between placements.\n` +
    `- Only place emotions that appear in the catalogue below.\n` +
    `- Each placement must name an exact stingId from the catalogue.\n` +
    `- If no placement is genuinely warranted, return an empty placements array.\n\n` +

    `SCENE TIMELINE:\n${sceneSummary}\n\n` +

    `AVAILABLE STINGS:\n${stingCatalogue}\n\n` +

    `Return ONLY valid JSON — no markdown:\n` +
    `{"placements":[{"targetScene":2,"placementHint":"after Fafa discovers the kite","emotion":"excited","intensity":"medium","stingId":"<id>","stingName":"<name>","durationSeconds":3.5,"volumeDb":${DEFAULT_VOLUME_DB}}]}`;

  try {
    const resp  = await makeRequest(prompt);
    const raw   = resp.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "{}";
    const json  = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const parsed = JSON.parse(json) as {
      placements?: Array<{
        targetScene?:     number;
        placementHint?:   string;
        emotion?:         string;
        intensity?:       string;
        stingId?:         string;
        stingName?:       string;
        durationSeconds?: number;
        volumeDb?:        number;
      }>;
    };

    const raw_placements = (parsed.placements ?? []).slice(0, MAX_PLACEMENTS);

    // Validate and enforce minimum gap using estimated timestamps
    const result: StingPlacement[] = [];
    let lastEndTime = -MIN_GAP_SECONDS - 1;

    for (const p of raw_placements) {
      if (!p.targetScene || !p.stingId || !availableEmotions.includes(p.emotion ?? "")) continue;

      const startSec = sceneTimes.get(p.targetScene) ?? (p.targetScene - 1) * 30;
      if (startSec - lastEndTime < MIN_GAP_SECONDS) {
        console.log(`[v2] Sting placement at scene ${p.targetScene} skipped — gap too small.`);
        continue;
      }

      const dur = p.durationSeconds ?? 3;
      result.push({
        stingId:         p.stingId!,
        stingName:       p.stingName ?? "",
        emotion:         p.emotion ?? "",
        intensity:       p.intensity === "medium" ? "medium" : "subtle",
        durationSeconds: dur,
        targetScene:     p.targetScene,
        placementHint:   p.placementHint ?? "",
        volumeDb:        p.volumeDb ?? DEFAULT_VOLUME_DB,
      });
      lastEndTime = startSec + dur;
    }

    console.log(`[v2] Sting placements: ${result.length}/${raw_placements.length} accepted.`);
    return result;
  } catch (err) {
    console.warn("[v2] Sting placement failed (soft fail):", err);
    return [];
  }
}
