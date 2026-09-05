/**
 * Core image generation logic using Gemini AI
 */
import { ActionCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { api, internal } from "../_generated/api";
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
 * Generates a style-lock reference image — a neutral character lineup (Lalli, child, Fafa)
 * used as the visual continuity anchor for EVERY scene in the story. Pinning all scenes to
 * one reference keeps each scene exactly one hop from the style source, regardless of scene
 * count, so drift can't compound across sequential scenes.
 */
async function generateStyleLockImage(
  ctx: ActionCtx,
  child: ChildInfo,
  lalliRefBase64?: string,
  fafaRefBase64?: string,
  childAvatarBase64?: string
): Promise<string | undefined> {
  try {
    const textPrompt = `CHARACTER STYLE REFERENCE for this story. Establish the exact visual style, character proportions, colour palette, and lighting to maintain across all story scenes.

Do NOT depict any story action, setting, or background.

Show three characters side by side on a plain light gradient background (#e8f4fc top, #f5f5f5 bottom):
LEFT: Lalli — 6-year-old girl, yellow star dress, two pigtails with orange bows, teal bag, warm brown skin, bright eyes
CENTER: ${child.name} — ${child.age}-year-old ${child.gender === "male" ? "boy" : child.gender === "female" ? "girl" : "child"}, match the child avatar reference exactly
RIGHT: Fafa — 3-year-old boy, teal overalls over yellow shirt, short messy brown hair, carries a small blue bunny

All characters facing forward, standing naturally, friendly neutral expressions. Pixar/Disney 3D animated style. Warm soft front lighting. Consistent proportions. This is a style reference sheet, not a story scene.`;

    const promptParts = assemblePromptPartsWithLabels({
      textPrompt,
      lalliRefBase64,
      fafaRefBase64,
      childAvatarBase64,
    });

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: GEMINI_IMAGE_MODEL,
      contents: promptParts,
    });

    for (const part of response?.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData?.data) return part.inlineData.data;
    }
    console.warn("[generateStyleLockImage] No image returned");
    return undefined;
  } catch (err: any) {
    console.warn("[generateStyleLockImage] Failed (soft-fail):", err?.message);
    return undefined;
  }
}

/**
 * Generates and stores all scene images with separate character references.
 * Auto-generates a child avatar if none exists and persists it to the profile.
 * Uses a style-lock reference image as the visual anchor for every scene so that
 * each scene is exactly one hop from the source — prevents drift compounding as
 * scene count grows.
 */
export async function generateAllSceneImages(
  ctx: ActionCtx,
  scenes: SceneMetadata[],
  child: ChildInfo,
  storyId: Id<"stories">,
  childAvatarStorageId?: string,
  childId?: "1" | "2",
  profileId?: Id<"user_profiles">
): Promise<SceneGenerationResult[]> {
  if (!scenes.length) return [];

  // Cost tracking (Task C): every Gemini image call this story triggers —
  // avatar auto-gen (first story for a child only), style-lock, and each
  // scene's first attempt + retry. Written once at the end of this function.
  let imageGenerationCalls = 0;

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
    imageGenerationCalls++;
    if (avatarResult.avatarBase64) {
      childAvatarBase64 = avatarResult.avatarBase64;
      console.log(`[generateAllSceneImages] Auto-generated child avatar successfully`);
      // Persist to profile so subsequent stories reuse this avatar instead of re-generating.
      // Uses internalMutation with explicit profileId — the auth-based mutation would throw
      // "Not authenticated" here since we're inside an internalAction with no session context.
      if (avatarResult.avatarStorageId && childId && profileId) {
        await ctx.runMutation(internal.userProfiles._updateAvatarStorageIdById, {
          profileId,
          avatarStorageId: avatarResult.avatarStorageId,
          childId,
        });
        console.log(`[generateAllSceneImages] Saved generated avatar to profile (child ${childId})`);
      }
    } else {
      console.warn(`[generateAllSceneImages] Child avatar generation failed: ${avatarResult.error}`);
    }
  }

  // Style-lock reference image — a neutral character lineup that anchors every
  // scene's visual continuity. Only depends on the child's avatar (+ the fixed
  // Lalli/Fafa refs), not on this story's content, so it's cached on the
  // child's profile and reused across every story for that child instead of
  // being regenerated (and re-billed) from scratch every time. Cleared
  // automatically whenever the avatar changes (see _updateAvatarStorageIdById).
  let styleLockBase64: string | undefined;
  let cachedStyleLockId: string | undefined;
  if (profileId && childId) {
    const cacheProfile: any = await ctx.runQuery(internal.userProfiles._getProfileById, { profileId });
    cachedStyleLockId = childId === "1" ? cacheProfile?.childStyleLockStorageId : cacheProfile?.child2StyleLockStorageId;
  }
  if (cachedStyleLockId) {
    styleLockBase64 = await loadImageFromStorage(ctx, cachedStyleLockId);
    if (styleLockBase64) {
      console.log(`[generateAllSceneImages] Reusing cached style-lock reference (no Gemini call)`);
    } else {
      console.warn(`[generateAllSceneImages] Cached style-lock storage id was unreadable — regenerating`);
    }
  }
  if (!styleLockBase64) {
    console.log(`[generateAllSceneImages] Generating style-lock reference`);
    styleLockBase64 = await generateStyleLockImage(
      ctx, child, charRefs.lalli, charRefs.fafa, childAvatarBase64
    );
    imageGenerationCalls++;
    if (styleLockBase64) {
      console.log(`[generateAllSceneImages] Style-lock ready`);
      if (profileId && childId) {
        const styleLockStorageId = await storeImageFromBase64(ctx, styleLockBase64);
        await ctx.runMutation(internal.userProfiles._updateStyleLockStorageIdById, {
          profileId, styleLockStorageId, childId,
        });
      }
    } else {
      console.warn(`[generateAllSceneImages] Style-lock failed — scenes will use Scene 1 output as fallback anchor`);
    }
  }

  // Generate all scenes. Each scene uses the style-lock as its visual anchor so every
  // scene is exactly one hop from the reference. If style-lock failed, Scene 1 runs
  // without an anchor and its output becomes the anchor for remaining scenes (prior behaviour).
  const [firstScene, ...remainingScenes] = sortedScenes;

  console.log(`[generateAllSceneImages] Generating scene ${firstScene.sceneNumber}`);
  let firstResult = await processSceneImage(
    ctx, firstScene, child, storyId,
    charRefs.lalli, charRefs.fafa,
    styleLockBase64, childAvatarBase64
  );
  imageGenerationCalls++;
  if (!firstResult.success) {
    console.warn(`[generateAllSceneImages] Scene ${firstScene.sceneNumber} failed (${firstResult.error}), retrying...`);
    firstResult = await processSceneImage(
      ctx, firstScene, child, storyId,
      charRefs.lalli, charRefs.fafa,
      styleLockBase64, childAvatarBase64
    );
    imageGenerationCalls++;
  }
  console.log(`[generateAllSceneImages] Scene ${firstScene.sceneNumber} done (success: ${firstResult.success})`);

  // Anchor for remaining scenes: style-lock if available, else Scene 1's output (fallback).
  const anchorBase64 = styleLockBase64 ?? firstResult.imageBase64;

  const remainingResults = await mapWithConcurrencyLimit(remainingScenes, 3, async (scene) => {
    console.log(`[generateAllSceneImages] Generating scene ${scene.sceneNumber}`);

    let result = await processSceneImage(
      ctx, scene, child, storyId,
      charRefs.lalli, charRefs.fafa,
      anchorBase64, childAvatarBase64
    );
    imageGenerationCalls++;

    if (!result.success) {
      console.warn(`[generateAllSceneImages] Scene ${scene.sceneNumber} failed (${result.error}), retrying...`);
      result = await processSceneImage(
        ctx, scene, child, storyId,
        charRefs.lalli, charRefs.fafa,
        anchorBase64, childAvatarBase64
      );
      imageGenerationCalls++;
    }

    console.log(`[generateAllSceneImages] Scene ${scene.sceneNumber} done (success: ${result.success})`);
    return result;
  });

  const results = [firstResult, ...remainingResults];
  const failed = results.filter((r) => !r.success);
  if (failed.length) console.warn("Failed scenes:", failed);

  await ctx.runMutation(api.stories._setImageUsage, { storyId, imageGenerationCalls });

  return results;
}
