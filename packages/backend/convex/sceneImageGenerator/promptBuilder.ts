/**
 * Prompt building logic for image generation
 */
import { Part } from "@google/genai";
import { ChildInfo, SceneMetadata, PromptReferences } from "./types";
import { PROMPT_LABELS, PNG_MIME_TYPE } from "./constants";
import { getGenderLabel } from "./utils";

/**
 * Assembles prompt parts with reference images and labels
 */
export function assemblePromptPartsWithLabels({
  textPrompt,
  characterRefBase64,
  childAvatarBase64,
  previousSceneBase64,
}: {
  textPrompt: string;
  characterRefBase64?: string;
  childAvatarBase64?: string;
  previousSceneBase64?: string;
}): Part[] {
  const parts: Part[] = [];

  if (characterRefBase64) {
    parts.push({ text: PROMPT_LABELS.CHARACTER_REFERENCE });
    parts.push({
      inlineData: {
        mimeType: PNG_MIME_TYPE,
        data: characterRefBase64,
      },
    });
  }

  if (childAvatarBase64) {
    parts.push({ text: PROMPT_LABELS.CHILD_REFERENCE });
    parts.push({
      inlineData: {
        mimeType: PNG_MIME_TYPE,
        data: childAvatarBase64,
      },
    });
  }

  if (previousSceneBase64) {
    parts.push({ text: PROMPT_LABELS.VISUAL_CONTINUITY });
    parts.push({
      inlineData: {
        mimeType: PNG_MIME_TYPE,
        data: previousSceneBase64,
      },
    });
  }

  // Add main text prompt last
  parts.push({ text: textPrompt });

  return parts;
}

/**
 * Creates an image generation prompt for a story scene
 */
export function createScenePrompt(
  scene: SceneMetadata,
  child: ChildInfo,
  hasChildAvatar: boolean,
  hasPreviousScene: boolean
): string {
  const genderLabel = getGenderLabel(child.gender);

  const continuityPrompt = hasPreviousScene
    ? "Maintain visual consistency with the 'Previous scene for visual continuity' image (same art style, color palette, and character appearances)."
    : "";

  const childPrompt = hasChildAvatar
    ? `Copy the EXACT appearance from the child reference image - match facial features, hair color/style, clothing, body proportions precisely.`
    : `Draw ${child.name} as a ${child.age}-year-old ${genderLabel} with consistent appearance across all scenes.`;

  return `
Create a vibrant children's storybook illustration for this scene:

SCENE DESCRIPTION:
${scene.description}

CHARACTER CONSISTENCY REQUIREMENTS (CRITICAL):
- Lalli and Fafa: Copy their EXACT appearance from the reference image - match their facial features, hair color/style, clothing colors and patterns, body proportions, and character design precisely. Do NOT change their appearance.
- Child character (${child.name}): ${childPrompt}

Art Style: bright, clean, warm cartoon style, consistent with all reference images.
Composition: engaging and centered, child-friendly lighting, colorful background.
${continuityPrompt}

IMPORTANT: Maintain character consistency - each character must look identical across all scenes. Match hair, clothing, facial features, and proportions exactly from the reference images.
`.trim();
}

/**
 * Creates a prompt for generating a child avatar
 */
export function createChildAvatarPrompt(child: ChildInfo): string {
  const genderLabel = getGenderLabel(child.gender);

  return `
Create a vibrant children's storybook character portrait for an Indian child:

CHARACTER DETAILS:
- Name: ${child.name}
- Age: ${child.age} years old
- Gender: ${genderLabel}

ETHNICITY & APPEARANCE:
- Indian/South Asian ethnicity
- Warm brown/tan skin tone (natural Indian complexion)
- Dark brown or black hair
- Friendly, expressive dark brown/black eyes
- Natural Indian facial features

Art Style: bright, clean, warm cartoon style, consistent with children's storybook illustrations.
Composition: centered character portrait, friendly expression, colorful vibrant background.
The character should be recognizably Indian, suitable for a ${child.age}-year-old ${genderLabel}.
Make the character look friendly, approachable, age-appropriate, and authentically Indian.
Strictly use child reference image if provided for accurate representation.
`.trim();
}
