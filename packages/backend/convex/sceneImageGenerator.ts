import { GoogleGenAI, Part } from "@google/genai";
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

// Image/Model constants
const PNG_MIME_TYPE = "image/png";
const GEMINI_IMAGE_MODEL = "gemini-2.5-flash-image";

// Shared helpers
async function blobToBase64(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Gemini API key not found");
  return new GoogleGenAI({ apiKey });
}

function assemblePromptParts(textPrompt: string, base64Images: Array<string | undefined>): Part[] {
  const promptParts: Part[] = [{ text: textPrompt }];
  for (const img of base64Images) {
    if (!img) continue;
    promptParts.push({
      inlineData: {
        mimeType: PNG_MIME_TYPE,
        data: img,
      },
    });
  }
  return promptParts;
}

/**
 * Loads the reference image as base64 directly from Convex storage
 */
async function loadReferenceImage(ctx: ActionCtx): Promise<string | undefined> {
  try {
    const blob = await ctx.storage.get(LALLI_FAFA_STORAGE_ID);
    if (!blob) throw new Error("Could not read reference image from storage");

    return await blobToBase64(blob);
  } catch (err) {
    console.warn("Failed to load reference image:", err);
    return undefined;
  }
}

/**
 * Loads an image from Convex storage by its ID and returns it as a base64 string.
 */
async function loadImageFromStorage(ctx: ActionCtx, storageId: string): Promise<string | undefined> {
  try {
    const blob = await ctx.storage.get(storageId);
    if (!blob) throw new Error("Could not read image from storage");

    return await blobToBase64(blob);
  } catch (err) {
    console.warn("Failed to load image from storage:", err);
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
Also include ${child.name}, a ${child.age}-year-old ${genderLabel}. If a child character reference image is provided, use it to maintain consistent appearance of ${child.name}.

Art Style: bright, clean, warm cartoon style, consistent with the reference images.
Composition: engaging and centered, child-friendly lighting, colorful background.
Maintain visual consistency with the previous scene image - keep characters looking the same, same art style, same color palette, and smooth visual continuity.
`;
}
/**
 * Generates one scene image using Gemini
 * Accepts multiple reference images: character reference, child avatar, and previous scene image
 */
async function generateSceneImage(
  ctx: ActionCtx,
  scene: SceneMetadata,
  child: ChildInfo,
  characterReferenceBase64?: string,
  previousSceneBase64?: string,
  childAvatarBase64?: string // Add this parameter
): Promise<{ imageBase64?: string; error?: string }> {
  try {
    const textPrompt = createImagePrompt(scene, child);
    console.log("Prompt:", textPrompt);

    const promptParts = assemblePromptParts(textPrompt, [
      characterReferenceBase64,
      childAvatarBase64,
      previousSceneBase64,
    ]);

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
 * Stores an image from a base64 string into Convex storage
 */
async function storeImageFromBase64(ctx: ActionCtx, base64: string) {
  const binary_string = atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  const blob = new Blob([bytes.buffer], { type: "image/png" });
  return ctx.storage.store(blob);
}

/**
 * Creates a prompt for generating a child avatar
 */
function createChildAvatarPrompt(child: ChildInfo): string {
  const genderLabel =
    child.gender === "male"
      ? "boy"
      : child.gender === "female"
      ? "girl"
      : "child";

  return `
Create a vibrant children's storybook character portrait for:

CHARACTER DETAILS:
- Name: ${child.name}
- Age: ${child.age} years old
- Gender: ${genderLabel}

Art Style: bright, clean, warm cartoon style, consistent with children's storybook illustrations.
Composition: centered character portrait, friendly expression, colorful background.
The character should be recognizable and suitable for a ${child.age}-year-old ${genderLabel}.
Make the character look friendly, approachable, and age-appropriate.
`;
}

/**
 * Generates a child avatar image
 */
export async function generateChildAvatar(
  ctx: ActionCtx,
  child: ChildInfo
): Promise<{ avatarStorageId?: string; error?: string }> {
  try {
    const textPrompt = createChildAvatarPrompt(child);
    console.log("Avatar Prompt:", textPrompt);

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: GEMINI_IMAGE_MODEL,
      contents: [{ text: textPrompt }],
    });

    for (const part of response?.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData && part.inlineData.data) {
        const avatarStorageId = await storeImageFromBase64(ctx, part.inlineData.data);
        return { avatarStorageId };
      }
    }
    return { error: "No image data returned" };
  } catch (err: any) {
    console.error("Avatar generation failed:", err);
    return { error: err?.message || "Avatar generation failed" };
  }
}

/**
 * Generates and stores all scene images with hybrid approach:
 * - Scene 1 generated first
 * - Remaining scenes generated in parallel, all using Scene 1 as reference
 * This balances speed (parallel processing) with consistency (shared reference)
 */
export async function generateAllSceneImages(
  ctx: ActionCtx,
  scenes: SceneMetadata[],
  child: ChildInfo,
  storyId: Id<"stories">,
  childAvatarStorageId?: string // Add this parameter
) {
  if (!scenes.length) return [];

  // Sort scenes by sceneNumber
  const sortedScenes = [...scenes].sort((a, b) => a.sceneNumber - b.sceneNumber);
  
  // Load character reference image (Lalli & Fafa) once
  const characterRefBase64 = await loadReferenceImage(ctx);
  
  // Load child avatar if available
  const childAvatarBase64 = childAvatarStorageId 
    ? await loadImageFromStorage(ctx, childAvatarStorageId)
    : undefined;
  
  const results = [];

  // STEP 1: Generate first scene
  const firstScene = sortedScenes[0];
  console.log(`Generating scene ${firstScene.sceneNumber} (anchor scene)...`);
  
  const firstResult = await generateSceneImage(
    ctx,
    firstScene,
    child,
    characterRefBase64,
    undefined, // No previous scene for first one
    childAvatarBase64 // Pass child avatar
  );

  let firstSceneBase64: string | undefined = undefined;
  let firstSceneStorageId: string | undefined = undefined;

  if (firstResult.error || !firstResult.imageBase64) {
    results.push({
      sceneNumber: firstScene.sceneNumber,
      success: false,
      error: firstResult.error,
    });
  } else {
    firstSceneStorageId = await storeImageFromBase64(ctx, firstResult.imageBase64);
    firstSceneBase64 = firstResult.imageBase64;

    await ctx.runMutation(api.stories._updateSceneFilePath, {
      storyId,
      sceneNumber: firstScene.sceneNumber,
      filePath: firstSceneStorageId,
    });

    results.push({
      sceneNumber: firstScene.sceneNumber,
      success: true,
    });
  }

  // STEP 2: Generate remaining scenes in parallel
  const remainingScenes = sortedScenes.slice(1);
  
  if (remainingScenes.length > 0) {
    console.log(`Generating ${remainingScenes.length} remaining scenes in parallel...`);
    
    const parallelPromises = remainingScenes.map(async (scene) => {
      console.log(`Starting scene ${scene.sceneNumber}...`);
      
      const result = await generateSceneImage(
        ctx,
        scene,
        child,
        characterRefBase64,
        firstSceneBase64,
        childAvatarBase64 // Pass child avatar
      );

      if (result.error || !result.imageBase64) {
        return {
          sceneNumber: scene.sceneNumber,
          success: false,
          error: result.error,
        };
      }

      const storageId = await storeImageFromBase64(ctx, result.imageBase64);
      await ctx.runMutation(api.stories._updateSceneFilePath, {
        storyId,
        sceneNumber: scene.sceneNumber,
        filePath: storageId,
      });

      return {
        sceneNumber: scene.sceneNumber,
        success: true,
      };
    });

    const parallelResults = await Promise.all(parallelPromises);
    results.push(...parallelResults);
  }

  const failed = results.filter((r) => !r.success);
  if (failed.length) console.warn("Failed scenes:", failed);

  return results;
}