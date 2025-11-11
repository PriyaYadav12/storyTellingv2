import { ActionCtx } from "./_generated/server";
import { api } from "./_generated/api";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js/Client";
import { VOICE_MAP } from "./voiceMap";
import { Id } from "./_generated/dataModel";

type Gender = "male" | "female" | "other";

function resolveChildVoice(gender: Gender, language: string) {
  if (gender === "male") return language === "Hindi" ? VOICE_MAP.HindiBoyChild : VOICE_MAP.BoyChild;
  if (gender === "female") return language === "Hindi" ? VOICE_MAP.HindiGirlChild : VOICE_MAP.GirlChild;
  return language === "Hindi" ? VOICE_MAP.HindiGirlChild : VOICE_MAP.GirlChild;
}

function pickVoiceForSpeaker(speaker: string, childName: string, gender: Gender, language: string): string {
  const s = speaker.trim().toLowerCase();
  if (s === "narrator") return language === "Hindi" ? VOICE_MAP.HindiNarrator : VOICE_MAP.Narrator;
  if (s === "lalli") return language === "Hindi" ? VOICE_MAP.HindiLalli : VOICE_MAP.Lalli;
  if (s === "fafa") return language === "Hindi" ? VOICE_MAP.HindiFafa : VOICE_MAP.Fafa;
  if (s === "child" || s === "girl child" || s === "boy child" || s === childName.trim().toLowerCase()) {
    resolveChildVoice(gender, language);
  }
  return language === "Hindi" ? VOICE_MAP.HindiNarrator : VOICE_MAP.Narrator;
}

function parseStoryToSpeakerLines(content: string, childName: string) {
  const lines = content.split("\n").map(l => l.trim()).filter(Boolean);
  const childLabel = (childName || "").trim().toLowerCase();

  const out: Array<{ order: number; speaker: string; text: string }> = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lower = line.toLowerCase();

    if (lower.startsWith("lalli:")) {
      out.push({ order: i, speaker: "Lalli", text: line.replace(/^lalli:/i, "").trim() });
    } else if (lower.startsWith("fafa:")) {
      out.push({ order: i, speaker: "Fafa", text: line.replace(/^fafa:/i, "").trim() });
    } else if (childLabel && lower.startsWith(childLabel + ":")) {
      out.push({ order: i, speaker: childName, text: line.slice(childName.length + 1).trim() });
    } else if (lower.startsWith("child:") || lower.startsWith("girl child:") || lower.startsWith("boy child:")) {
      out.push({ order: i, speaker: "Child", text: line.replace(/^(child|girl child|boy child):/i, "").trim() });
    } else {
      out.push({ order: i, speaker: "Narrator", text: line });
    }
  }
  return out;
}

async function ttsArrayBuffer(voiceId: string, text: string): Promise<ArrayBuffer> {
  const apiKey = process.env.ELEVEN_LABS_API_KEY;
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY missing");

  const client = new ElevenLabsClient({ apiKey });

  const resp = await client.textToSpeech.convert(voiceId, {
    text,
    modelId: "eleven_multilingual_v2",
    outputFormat: "mp3_22050_32", 
    voiceSettings: { stability: 0.5, speed: 0.8 },
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

// concurrency limiter
async function mapWithConcurrencyLimit<T, R>(
  array: T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  const executing = new Set<Promise<void>>();

  for (const item of array) {
    const p = (async () => {
      const res = await fn(item);
      results.push(res);
    })();

    executing.add(p);
    p.finally(() => executing.delete(p));
    if (executing.size >= limit) {
      await Promise.race(executing);
    }
  }

  await Promise.all(Array.from(executing));
  return results;
}

export async function generateMergedNarration(
  ctx: ActionCtx,
  args: {
    storyId: Id<"stories">;
    content: string;
    childName: string;
    childGender: Gender;
    language: string;
  }
) {
  console.log("Generating voice narration for story");
  const { storyId, content, childName, childGender, language } = args;

  const lines = parseStoryToSpeakerLines(content, childName);
  console.log("Parsed Lines:", lines);

  // Limit concurrency to 3 TTS calls at a time
  const results = await mapWithConcurrencyLimit(lines, 1, async (l) => {
    const voiceId = pickVoiceForSpeaker(l.speaker, childName, childGender, language);
    const ab = await ttsArrayBuffer(voiceId, l.text);
    return { order: l.order, ab };
  });

  // sort and merge
  results.sort((a, b) => a.order - b.order);
  const merged = concatMp3(results.map(r => r.ab));

  const mergedBlob = new Blob([merged], { type: "audio/mpeg" });
  const storageId = await ctx.storage.store(mergedBlob);

  await ctx.runMutation(api.stories._setNarrationFilePath, {
    storyId: storyId,
    filePath: storageId,
  });

  console.log("✅ Narration generated and stored:", storageId);
  return { storageId };
}
