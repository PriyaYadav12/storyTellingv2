/**
 * Core image generation logic using Gemini AI
 */
import { ActionCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { api } from "../_generated/api";
import {
  ChildInfo,
  SceneMetadata,
  ImageGenerationResult,
  AvatarGenerationResult,
  SceneGenerationResult,
} from "./types";
import { GEMINI_IMAGE_MODEL } from "./constants";
import {
  getGeminiClient,
  loadImageFromStorage,
  loadCharacterReferences,
  storeImageFromBase64,
} from "./utils";
import { assemblePromptPartsWithLabels, createScenePrompt, createChildAvatarPrompt } from "./promptBuilder";

/**
 * Generates one scene image using Gemini
 */
export async function generateSceneImage(
  ctx: ActionCtx,
  scene: SceneMetadata,
  child: ChildInfo,
  lalliRefBase64?: string,
  fafaRefBase64?: string,
  previousSceneBase64?: string,
  childAvatarBase64?: string
): Promise<ImageGenerationResult> {
  try {
    const textPrompt = createScenePrompt(scene, child, !!childAvatarBase64, !!previousSceneBase64);

    const promptParts = assemblePromptPartsWithLabels({
      textPrompt,
      lalliRefBase64,
      fafaRefBase64,
      childAvatarBase64,
      previousSceneBase64,
    });

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: GEMINI_IMAGE_MODEL,
      contents: promptParts,
    });

    for (const part of response?.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData && part.inlineData.data) {
        return { imageBase64: part.inlineData.data };
      }
    }
    return { error: "No image data returned" };
  } catch (err: any) {
    return { error: err?.message || "Image generation failed" };
  }
}

/**
 * Generates a child avatar image in cinematic 3D style
 */
export async function generateChildAvatar(
  ctx: ActionCtx,
  child: ChildInfo,
  referenceStorageId?: string
): Promise<AvatarGenerationResult> {
  try {
    const textPrompt = createChildAvatarPrompt(child);

    const referenceBase64 = referenceStorageId
      ? await loadImageFromStorage(ctx, referenceStorageId)
      : undefined;

    const promptParts = assemblePromptPartsWithLabels({
      textPrompt,
      childAvatarBase64: referenceBase64,
    });

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: GEMINI_IMAGE_MODEL,
      contents: promptParts,
    });

    for (const part of response?.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData && part.inlineData.data) {
        const avatarStorageId = await storeImageFromBase64(ctx, part.inlineData.data);
        return { avatarStorageId, avatarBase64: part.inlineData.data };
      }
    }
    return { error: "No image data returned" };
  } catch (err: any) {
    console.error("Avatar generation failed:", err);
    return { error: err?.message || "Avatar generation failed" };
  }
}

/**
 * Processes and stores a single scene image.
 */
async function processSceneImage(
  ctx: ActionCtx,
  scene: SceneMetadata,
  child: ChildInfo,
  storyId: Id<"stories">,
  lalliRefBase64?: string,
  fafaRefBase64?: string,
  previousSceneBase64?: string,
  childAvatarBase64?: string
): Promise<SceneGenerationResult> {

  const result = await generateSceneImage(
    ctx, scene, child,
    lalliRefBase64, fafaRefBase64,
    previousSceneBase64, childAvatarBase64
  );

  if (result.error || !result.imageBase64) {
    return { sceneNumber: scene.sceneNumber, success: false, error: result.error };
  }

  const storageId = await storeImageFromBase64(ctx, result.imageBase64);
  await ctx.runMutation(api.stories._updateSceneFilePath, {
    storyId,
    sceneNumber: scene.sceneNumber,
    filePath: storageId,
  });

  return { sceneNumber: scene.sceneNumber, success: true, imageBase64: result.imageBase64 };
}

async function mapWithConcurrencyLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;
  let active = 0;

  return new Promise((resolve, reject) => {
    function startNext() {
      while (active < limit && nextIndex < items.length) {
        const idx = nextIndex++;
        active++;
        fn(items[idx], idx)
          .then((res) => { results[idx] = res; })
          .catch(reject)
          .finally(() => {
            active--;
            if (nextIndex < items.length) startNext();
            else if (active === 0) resolve(results);
          });
      }
    }
    startNext();
  });
}

/**
 * Generates and stores all scene images with separate character references.
 * Auto-generates a child avatar if none exists.
 */
export async function generateAllSceneImages(
  ctx: ActionCtx,
  scenes: SceneMetadata[],
  child: ChildInfo,
  storyId: Id<"stories">,
  childAvatarStorageId?: string
): Promise<SceneGenerationResult[]> {
  if (!scenes.length) return [];

  const sortedScenes = [...scenes].sort((a, b) => a.sceneNumber - b.sceneNumber);

  // Load Lalli and Fafa references separately
  const charRefs = await loadCharacterReferences(ctx);

  // Load or auto-generate child avatar
  let childAvatarBase64: string | undefined;
  if (childAvatarStorageId) {
    childAvatarBase64 = await loadImageFromStorage(ctx, childAvatarStorageId);
  }
  if (!childAvatarBase64) {
    console.log(`[generateAllSceneImages] No child avatar — auto-generating for ${child.name}`);
    const avatarResult = await generateChildAvatar(ctx, child, childAvatarStorageId);
    if ((avatarResult as any).avatarBase64) {
      childAvatarBase64 = (avatarResult as any).avatarBase64;
      console.log(`[generateAllSceneImages] Auto-generated child avatar successfully`);
    } else {
      console.warn(`[generateAllSceneImages] Child avatar generation failed: ${avatarResult.error}`);
    }
  }

  const results = await mapWithConcurrencyLimit(sortedScenes, 3, async (scene) => {
    console.log(`[generateAllSceneImages] Generating scene ${scene.sceneNumber}`);

    let result = await processSceneImage(
      ctx, scene, child, storyId,
      charRefs.lalli, charRefs.fafa,
      undefined,
      childAvatarBase64
    );

    if (!result.success) {
      console.warn(`[generateAllSceneImages] Scene ${scene.sceneNumber} failed (${result.error}), retrying...`);
      result = await processSceneImage(
        ctx, scene, child, storyId,
        charRefs.lalli, charRefs.fafa,
        undefined,
        childAvatarBase64
      );
    }

    console.log(`[generateAllSceneImages] Scene ${scene.sceneNumber} done (success: ${result.success})`);
    return result;
  });

  const failed = results.filter((r) => !r.success);
  if (failed.length) console.warn("Failed scenes:", failed);

  return results;
}
