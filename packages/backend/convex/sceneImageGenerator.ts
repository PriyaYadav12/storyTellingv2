import OpenAI from "openai";
import { ActionCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { api } from "./_generated/api";

export interface ChildInfo {
  name: string;
  gender: "male" | "female" | "other";
  age: number;
}

export interface SceneMetadata {
  sceneNumber: number;
  description: string;
  filePath: string;
}

/**
 * Reference image of Lalli & Fafa in Convex Storage
 */
const LALLI_FAFA_STORAGE_ID = "kg26dz7f94zyhf1f0nhvbfr1157tmatf" as Id<"_storage">;

/**
 * Loads the reference image as base64 (used for visual consistency)
 */
async function loadReferenceImage(ctx: ActionCtx): Promise<string | undefined> {
  try {
    const imageUrl = await ctx.storage.getUrl(LALLI_FAFA_STORAGE_ID);
    if (!imageUrl) throw new Error("Missing reference image URL");

    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);

    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer).toString("base64");
  } catch (err) {
    console.warn("Reference image load failed:", err);
    return undefined;
  }
}

/**
 * Creates an image generation prompt for a story scene.
 */
function createImagePrompt(scene: SceneMetadata, child: ChildInfo): string {
  const genderLabel =
    child.gender === "male"
      ? "boy"
      : child.gender === "female"
      ? "girl"
      : "child";

  return `
Create a vibrant children's storybook illustration for this scene:

SCENE DESCRIPTION:
${scene.description}

Include the characters Lalli and Fafa exactly as they appear in the reference image.
Also include ${child.name}, a ${child.age}-year-old ${genderLabel}, matching the story context.

Art Style: bright, clean, warm cartoon style, consistent with the reference image.
Composition: engaging and centered, child-friendly lighting, colorful background.
`;
}

/**
 * Generates one scene image using DALL·E 3
 */
async function generateSceneImage(
  ctx: ActionCtx,
  openai: OpenAI,
  scene: SceneMetadata,
  child: ChildInfo,
  referenceBase64?: string
): Promise<{ imageUrl?: string; error?: string }> {
  try {
    const prompt = createImagePrompt(scene, child);

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
      ...(referenceBase64
        ? { image: `data:image/png;base64,${referenceBase64}` }
        : {}),
    });

    const imageUrl = response.data?.[0]?.url;
    if (!imageUrl) return { error: "No image URL returned" };

    return { imageUrl };
  } catch (err: any) {
    return { error: err?.message || "Image generation failed" };
  }
}

/**
 * Stores an image URL into Convex storage
 */
async function storeImageInConvex(ctx: ActionCtx, url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.statusText}`);
  const blob = await res.blob();
  return ctx.storage.store(blob);
}

/**
 * Generates and stores an image for a single scene
 */
export async function generateAndStoreSceneImage(
  ctx: ActionCtx,
  openai: OpenAI,
  scene: SceneMetadata,
  child: ChildInfo
) {
  try {
    const refBase64 = await loadReferenceImage(ctx);
    const result = await generateSceneImage(ctx, openai, scene, child, refBase64);
    if (result.error || !result.imageUrl)
      return { sceneNumber: scene.sceneNumber, success: false, error: result.error };

    const storageId = await storeImageInConvex(ctx, result.imageUrl);
    await ctx.runMutation(api.stories._updateSceneFilePath, {
      storyId: scene.filePath as Id<"stories">, // adjust if storyId separate
      sceneNumber: scene.sceneNumber,
      filePath: storageId,
    });

    return { sceneNumber: scene.sceneNumber, success: true };
  } catch (err: any) {
    console.error(`Scene ${scene.sceneNumber} failed:`, err);
    return { sceneNumber: scene.sceneNumber, success: false, error: err.message };
  }
}

/**
 * Generates and stores all scene images in parallel
 */
export async function generateAllSceneImages(
  ctx: ActionCtx,
  openai: OpenAI,
  scenes: SceneMetadata[],
  child: ChildInfo,
  storyId: Id<"stories">
) {
  if (!scenes.length) return [];

  const refBase64 = await loadReferenceImage(ctx);
  const tasks = scenes.map(async (scene) => {
    const result = await generateSceneImage(ctx, openai, scene, child, refBase64);
    if (result.error || !result.imageUrl)
      return { sceneNumber: scene.sceneNumber, success: false, error: result.error };

    const storageId = await storeImageInConvex(ctx, result.imageUrl);
    await ctx.runMutation(api.stories._updateSceneFilePath, {
      storyId,
      sceneNumber: scene.sceneNumber,
      filePath: storageId,
    });

    return { sceneNumber: scene.sceneNumber, success: true };
  });

  const results = await Promise.all(tasks);
  const failed = results.filter((r) => !r.success);
  if (failed.length) console.warn("Failed scenes:", failed);

  return results;
}
