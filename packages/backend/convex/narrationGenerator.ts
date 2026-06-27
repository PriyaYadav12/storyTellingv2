import { ActionCtx } from "./_generated/server";
import { api } from "./_generated/api";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js/Client";
import { Id } from "./_generated/dataModel";

type Gender = "male" | "female" | "other";

/**
 * Returns true if the language is Hindi (uses Hindi-specific trained voice IDs).
 */
function isHindiLanguage(language: string): boolean {
  return language.toLowerCase() === "hindi";
}

/**
 * Returns true if the language needs the ElevenLabs multilingual model.
 * English uses eleven_turbo_v2_5 (English-only, faster/cheaper).
 * All other languages use eleven_multilingual_v2.
 */
function isMultilingualLanguage(language: string): boolean {
  return language.toLowerCase() !== "english";
}

type VoiceMap = {
  Narrator?: string;
  Lalli?: string;
  Fafa?: string;
  GirlChild?: string;
  BoyChild?: string;
  HindiNarrator?: string;
  HindiLalli?: string;
  HindiFafa?: string;
  HindiGirlChild?: string;
  HindiBoyChild?: string;
};

async function loadVoiceMap(ctx: ActionCtx): Promise<VoiceMap> {
  const voices = await ctx.runQuery(api.migration.voice_models.list);
  const voiceMap: VoiceMap = {};
  
  for (const voice of voices) {
    voiceMap[voice.name as keyof VoiceMap] = voice.voiceId;
  }
  
  return voiceMap;
}

function resolveChildVoice(voiceMap: VoiceMap, gender: Gender, language: string): string {
  const useHindi = isHindiLanguage(language);
  if (gender === "male") {
    return useHindi
      ? (voiceMap.HindiBoyChild || voiceMap.BoyChild || "")
      : (voiceMap.BoyChild || "");
  }
  if (gender === "female") {
    return useHindi
      ? (voiceMap.HindiGirlChild || voiceMap.GirlChild || "")
      : (voiceMap.GirlChild || "");
  }
  return useHindi
    ? (voiceMap.HindiGirlChild || voiceMap.GirlChild || "")
    : (voiceMap.GirlChild || "");
}

function pickVoiceForSpeaker(
  voiceMap: VoiceMap,
  speaker: string,
  childName: string,
  gender: Gender,
  language: string
): string {
  const s = speaker.trim().toLowerCase();
  const useHindi = isHindiLanguage(language);
  if (s === "narrator") {
    return useHindi
      ? (voiceMap.HindiNarrator || voiceMap.Narrator || "")
      : (voiceMap.Narrator || "");
  }
  if (s === "lalli") {
    return useHindi
      ? (voiceMap.HindiLalli || voiceMap.Lalli || "")
      : (voiceMap.Lalli || "");
  }
  if (s === "fafa") {
    return useHindi
      ? (voiceMap.HindiFafa || voiceMap.Fafa || "")
      : (voiceMap.Fafa || "");
  }
  if (s === "child" || s === "girl child" || s === "boy child" || s === childName.trim().toLowerCase()) {
    return resolveChildVoice(voiceMap, gender, language);
  }
  return useHindi
    ? (voiceMap.HindiNarrator || voiceMap.Narrator || "")
    : (voiceMap.Narrator || "");
}

/**
 * Split a narrator paragraph into individual sentences for TTS.
 * Each sentence becomes its own TTS call, so the voice resets to its
 * neutral warm tone between sentences — preventing tonal drift from
 * carrying across an entire paragraph.
 */
function splitToSentences(text: string): string[] {
  const raw = text.match(/[^.!?।]+[.!?।]+/g);
  if (!raw) return [text];
  // Merge very short segments (like "Boing!", "Click!") into the next or previous sentence
  // to avoid choppy single-word TTS calls
  const merged: string[] = [];
  for (const s of raw) {
    const trimmed = s.trim();
    if (!trimmed) continue;
    if (trimmed.length < 15 && merged.length > 0) {
      merged[merged.length - 1] += " " + trimmed;
    } else {
      merged.push(trimmed);
    }
  }
  return merged.filter(s => s.length > 0);
}

function parseStoryToSpeakerLines(title: string, content: string, childName: string) {
  const metadataIdx = content.search(/^SCENE METADATA/mi);
  const storyOnly = metadataIdx !== -1 ? content.slice(0, metadataIdx) : content;

  const titleLines = title ? [title] : [];
  const lines = [...titleLines, ...storyOnly.split("\n").map(l => l.trim()).filter(Boolean)];
  const childLabel = (childName || "").trim().toLowerCase();

  const out: Array<{ order: number; speaker: string; text: string }> = [];
  let orderIdx = 0;
  for (const line of lines) {
    const lower = line.toLowerCase();

    if (lower.startsWith("lalli:")) {
      out.push({ order: orderIdx++, speaker: "Lalli", text: line.replace(/^lalli:/i, "").trim() });
    } else if (lower.startsWith("fafa:")) {
      out.push({ order: orderIdx++, speaker: "Fafa", text: line.replace(/^fafa:/i, "").trim() });
    } else if (childLabel && lower.startsWith(childLabel + ":")) {
      out.push({ order: orderIdx++, speaker: childName, text: line.slice(childName.length + 1).trim() });
    } else if (lower.startsWith("child:") || lower.startsWith("girl child:") || lower.startsWith("boy child:")) {
      out.push({ order: orderIdx++, speaker: "Child", text: line.replace(/^(child|girl child|boy child):/i, "").trim() });
    } else {
      // Narrator: split long paragraphs into individual sentences.
      // Each sentence gets its own TTS call so the voice resets between them.
      const sentences = splitToSentences(line);
      for (const sentence of sentences) {
        out.push({ order: orderIdx++, speaker: "Narrator", text: sentence });
      }
    }
  }
  return out;
}

/**
 * ElevenLabs reads the spelling "Lalli" with a short first vowel ("La-li"),
 * but the character's name is pronounced with a long first vowel ("Laa-li").
 * For narration only (never the stored story text/subtitles, which must keep
 * the "Lalli" spelling), respell every occurrence as "Laalli" so the TTS
 * voice says it correctly. Preserves the original capitalisation.
 */
function applyPronunciationFixes(text: string): string {
  let result = text.replace(/\bLalli\b/gi, (match) => {
    if (match === match.toUpperCase()) return "LAALI";
    if (match[0] === match[0].toUpperCase()) return "Laali";
    return "laali";
  });
  result = result.replace(/\bFafa\b/gi, (match) => {
    if (match === match.toUpperCase()) return "FAAFA";
    if (match[0] === match[0].toUpperCase()) return "Faafa";
    return "faafa";
  });
  return result;
}

const LANGUAGE_CODES: Record<string, string> = {
  hindi: "hi", bengali: "bn", gujarati: "gu",
  tamil: "ta", marathi: "mr", telugu: "te",
};

async function ttsArrayBuffer(voiceId: string, text: string, language: string): Promise<ArrayBuffer> {
  const apiKey = process.env.ELEVEN_LABS_API_KEY;
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY missing");

  const client = new ElevenLabsClient({ apiKey });

  const isMultilingual = isMultilingualLanguage(language);
  const modelId = isMultilingual ? "eleven_multilingual_v2" : "eleven_turbo_v2_5";
  const langCode = LANGUAGE_CODES[language.toLowerCase()];

  const resp = await client.textToSpeech.convert(voiceId, {
    text,
    modelId,
    outputFormat: "mp3_44100_64",
    // Force the correct language so the model doesn't flip between
    // Hindi and English pronunciation on mixed-language text
    ...(langCode ? { languageCode: langCode } : {}),
    voiceSettings: {
      stability: 0.78,
      similarityBoost: 0.80,
      style: 0.10,
      useSpeakerBoost: true,
      speed: 0.82,
    },
  });

  // handle web ReadableStream -> ArrayBuffer
  const reader = resp.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  // Ensure Blob receives parts backed by standard ArrayBuffer
  const safeChunks = chunks.map((c) => new Uint8Array(c));
  const blob = new Blob(safeChunks, { type: "audio/mpeg" });
  return await blob.arrayBuffer();
}

function concatMp3(buffers: ArrayBuffer[]): ArrayBuffer {
  const total = buffers.reduce((s, b) => s + b.byteLength, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const buf of buffers) {
    out.set(new Uint8Array(buf), offset);
    offset += buf.byteLength;
  }
  return out.buffer;
}

// concurrency limiter — errors are logged and that line is skipped (not swallowed silently)
async function mapWithConcurrencyLimit<T, R>(
  array: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<(R | null)[]> {
  const results: (R | null)[] = new Array(array.length).fill(null);
  let activeCount = 0;
  let nextIndex = 0;

  await new Promise<void>((resolve, reject) => {
    function startNext() {
      while (activeCount < limit && nextIndex < array.length) {
        const idx = nextIndex++;
        activeCount++;
        fn(array[idx], idx)
          .then(res => {
            results[idx] = res;
          })
          .catch(err => {
            console.error(`[TTS] Line ${idx} failed:`, err?.message ?? err);
            results[idx] = null; // skip this line rather than crashing everything
          })
          .finally(() => {
            activeCount--;
            if (nextIndex < array.length) {
              startNext();
            } else if (activeCount === 0) {
              resolve();
            }
          });
      }
      if (nextIndex >= array.length && activeCount === 0) resolve();
    }
    startNext();
  });

  return results;
}

export async function generateMergedNarration(
  ctx: ActionCtx,
  args: {
    storyId: Id<"stories">;
    title: string;
    content: string;
    childName: string;
    childGender: Gender;
    language: string;
  }
) {
  console.log("Generating voice narration for story");
  const { storyId, title, content, childName, childGender, language } = args;

  // Load voice map from database once
  const voiceMap = await loadVoiceMap(ctx);
  if (!voiceMap.Narrator) {
    throw new Error("Voice models not found in database. Please run the seed function.");
  }

  const lines = parseStoryToSpeakerLines(title, content, childName);
  console.log(`[Narration] ${lines.length} lines to TTS. Language: ${language}. First 3:`, lines.slice(0, 3).map(l => `${l.speaker}: ${l.text.slice(0, 40)}`));

  // Limit concurrency to 2 TTS calls at a time.
  const isEnglish = !isMultilingualLanguage(language);
  const results = await mapWithConcurrencyLimit(lines, 2, async (l, _idx) => {
    const voiceId = pickVoiceForSpeaker(voiceMap, l.speaker, childName, childGender, language);
    if (!voiceId) {
      console.error(`[TTS] No voice ID for speaker: ${l.speaker}`);
      return null;
    }
    // Pronunciation fixes apply to all languages (names stay in English in Hindi text)
    const fixedText = applyPronunciationFixes(l.text);
    const pauseSuffix = isEnglish ? " ..." : " ।";
    const ab = await ttsArrayBuffer(voiceId, fixedText + pauseSuffix, language);
    return { order: l.order, ab };
  });

  // Filter out failed lines and merge in order
  const successful = results.filter((r): r is { order: number; ab: ArrayBuffer } => r !== null);
  console.log(`[Narration] ${successful.length}/${lines.length} lines succeeded.`);
  successful.sort((a, b) => a.order - b.order);
  const merged = concatMp3(successful.map(r => r.ab));

  const mergedBlob = new Blob([merged], { type: "audio/mpeg" });
  const storageId = await ctx.storage.store(mergedBlob);

  // Calculate duration from byte size.
  // Format is mp3_44100_64 (64 kbps) → 64000 bits/s = 8000 bytes/s
  const audioDurationSeconds = Math.round(merged.byteLength / 8000);

  await ctx.runMutation(api.stories._setNarrationFilePath, {
    storyId: storyId,
    filePath: storageId,
  });

  await ctx.runMutation(api.stories._setNarrationDuration, {
    storyId: storyId,
    durationSeconds: audioDurationSeconds,
  });

  console.log("✅ Narration generated and stored:", storageId, `(${audioDurationSeconds}s)`);
  return { storageId, audioDurationSeconds };
}
