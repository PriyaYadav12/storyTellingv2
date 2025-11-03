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

/**
 * Loads the reference image as base64 directly from Convex storage
 */
async function loadReferenceImage(ctx: ActionCtx): Promise<string | undefined> {
  try {
    const blob = await ctx.storage.get(LALLI_FAFA_STORAGE_ID);
    if (!blob) throw new Error("Could not read reference image from storage");

    const arrayBuffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }

    const base64 = btoa(binary);
    return base64;
  } catch (err) {
    console.warn("Failed to load reference image:", err);
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
Maintain visual consistency with the previous scene image - keep characters looking the same, same art style, same color palette, and smooth visual continuity.
`;
}

/**
 * Loads an image from storage as base64
 */
async function loadImageFromStorage(ctx: ActionCtx, storageId: string): Promise<string | undefined> {
  try {
    const blob = await ctx.storage.get(storageId as any);
    if (!blob) return undefined;

    const arrayBuffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }

    const base64 = btoa(binary);
    return base64;
  } catch (err) {
    console.warn("Failed to load image from storage:", err);
    return undefined;
  }
}

/**
 * Generates one scene image using DALL·E 3
 * Can accept multiple reference images: the Lalli/Fafa reference and previous scene image
 */
async function generateSceneImage(
  ctx: ActionCtx,
  scene: SceneMetadata,
  child: ChildInfo,
  characterReferenceBase64?: string,
  previousSceneBase64?: string
): Promise<{ imageBase64?: string; error?: string }> {
  try {
    const textPrompt = createImagePrompt(scene, child);
    console.log("Prompt:", textPrompt);

    const promptParts: Part[] = [{ text: textPrompt }];
    
    // Add character reference (Lalli & Fafa) if available
    if (characterReferenceBase64) {
      promptParts.push({
        inlineData: {
          mimeType: "image/png",
          data: characterReferenceBase64,
        },
      });
    }
    
    // Add previous scene image for visual consistency
    if (previousSceneBase64) {
      promptParts.push({
        inlineData: {
          mimeType: "image/png",
          data: previousSceneBase64,
        },
      });
    }

    const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});
    if (!ai) throw new Error("Gemini API key not found");
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: promptParts,
    });

    for (const part of response?.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
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
 * Generates and stores all scene images sequentially
 * Each scene uses the previous scene's image as reference to maintain visual consistency
 */
export async function generateAllSceneImages(
  ctx: ActionCtx,
  scenes: SceneMetadata[],
  child: ChildInfo,
  storyId: Id<"stories">
) {
  if (!scenes.length) return [];

  // Sort scenes by sceneNumber to process in order
  const sortedScenes = [...scenes].sort((a, b) => a.sceneNumber - b.sceneNumber);
  
  // Load character reference image (Lalli & Fafa) once
  const characterRefBase64 = await loadReferenceImage(ctx);
  
  let previousSceneStorageId: string | undefined = undefined;
  const results = [];

  // Process scenes sequentially so each can use the previous scene as reference
  for (const scene of sortedScenes) {
    let previousSceneBase64: string | undefined = undefined;
    
    // Load previous scene image if available
    if (previousSceneStorageId) {
      previousSceneBase64 = await loadImageFromStorage(ctx, previousSceneStorageId);
    }

    console.log(`Generating scene ${scene.sceneNumber}...`);
    const result = await generateSceneImage(
      ctx,
      scene,
      child,
      characterRefBase64,
      previousSceneBase64
    );

    if (result.error || !result.imageBase64) {
      results.push({
        sceneNumber: scene.sceneNumber,
        success: false,
        error: result.error,
      });
      continue; // Skip to next scene if this one failed
    }

    // Store the generated image
    const storageId = await storeImageFromBase64(ctx, result.imageBase64);
    await ctx.runMutation(api.stories._updateSceneFilePath, {
      storyId,
      sceneNumber: scene.sceneNumber,
      filePath: storageId,
    });

    // Update previous scene reference for next iteration
    previousSceneStorageId = storageId;
    
    results.push({
      sceneNumber: scene.sceneNumber,
      success: true,
    });
  }

  const failed = results.filter((r) => !r.success);
  if (failed.length) console.warn("Failed scenes:", failed);

  return results;
}
