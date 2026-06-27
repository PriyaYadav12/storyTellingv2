/**
 * Prompt building logic for image generation — cinematic 3D animated style
 */
import { Part } from "@google/genai";
import { ChildInfo, SceneMetadata } from "./types";
import { PROMPT_LABELS, PNG_MIME_TYPE } from "./constants";
import { getGenderLabel } from "./utils";

const STYLE_LOCK = `
STYLE LOCK — APPLY TO EVERY SCENE, NO EXCEPTIONS:
• Art style: Ultra-high-definition 3D animated characters (Pixar/Disney quality), cinematic storytelling
• Characters: Stylized 3D animated children with large expressive eyes, smooth skin, soft rounded features
• Environment: Rich, detailed, vibrant backgrounds — lush and immersive, semi-realistic or stylized
• Lighting: Warm cinematic lighting with soft shadows, volumetric light rays, golden-hour warmth
• Rendering: High-quality 3D with subsurface scattering on skin, soft cloth simulation on clothing
• Proportions: Slightly stylized — large heads, big expressive eyes, small rounded bodies (chibi-adjacent)
• Color palette: Vibrant and warm — rich greens, warm golds, soft teals, sky blues — never muted or dark
• Mood: Warm, cheerful, magical, safe — suitable for children aged 2–8
• Quality: Ultra-high resolution, sharp details, professional animation studio quality
• DO NOT produce flat 2D, watercolour, sketch, or painterly styles — ONLY 3D cinematic animation
`.trim();

/**
 * Assembles prompt parts with separate Lalli, Fafa, and child reference images
 */
export function assemblePromptPartsWithLabels({
  textPrompt,
  lalliRefBase64,
  fafaRefBase64,
  childAvatarBase64,
  previousSceneBase64,
}: {
  textPrompt: string;
  lalliRefBase64?: string;
  fafaRefBase64?: string;
  childAvatarBase64?: string;
  previousSceneBase64?: string;
}): Part[] {
  const parts: Part[] = [];

  if (lalliRefBase64) {
    parts.push({ text: PROMPT_LABELS.LALLI_REFERENCE });
    parts.push({ inlineData: { mimeType: PNG_MIME_TYPE, data: lalliRefBase64 } });
  }

  if (fafaRefBase64) {
    parts.push({ text: PROMPT_LABELS.FAFA_REFERENCE });
    parts.push({ inlineData: { mimeType: PNG_MIME_TYPE, data: fafaRefBase64 } });
  }

  if (childAvatarBase64) {
    parts.push({ text: PROMPT_LABELS.CHILD_REFERENCE });
    parts.push({ inlineData: { mimeType: PNG_MIME_TYPE, data: childAvatarBase64 } });
  }

  if (previousSceneBase64) {
    parts.push({ text: PROMPT_LABELS.VISUAL_CONTINUITY });
    parts.push({ inlineData: { mimeType: PNG_MIME_TYPE, data: previousSceneBase64 } });
  }

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

  // Child must look VISUALLY DISTINCT from Lalli (pigtails, yellow dress) and Fafa (messy hair, teal overalls)
  const childFallbackDescription =
    child.gender === "female"
      ? `${child.name} is a ${child.age}-year-old Indian girl, 3D animated style. Warm brown skin, long straight dark black hair worn LOOSE past her shoulders with a bright pink headband — NO pigtails (pigtails are Lalli's signature, ${child.name} must look DIFFERENT from Lalli). Large expressive dark brown eyes, small round nose, bright friendly smile. Wears a bright pink t-shirt with a white star and a blue skirt. Approx ${85 + child.age * 5} cm tall. IMPORTANT: ${child.name} must NOT resemble Lalli — different hair, different clothes, different accessories.`
      : child.gender === "male"
        ? `${child.name} is a ${child.age}-year-old Indian boy, 3D animated style. Warm brown skin, neat dark black hair with a clean side parting — NOT messy or spiky (messy hair is Fafa's signature, ${child.name} must look DIFFERENT from Fafa). Large expressive dark brown eyes, small round nose, wide friendly smile. Wears a bright red t-shirt with a white star and blue shorts. No bunny toy. Approx ${85 + child.age * 5} cm tall. IMPORTANT: ${child.name} must NOT resemble Fafa — different hair, different outfit, no plush toy.`
        : `${child.name} is a ${child.age}-year-old Indian child, 3D animated style. Warm brown skin, dark black hair with a bright purple headband, large expressive dark brown eyes, friendly smile. Wears a bright purple t-shirt with a white star and blue shorts. Approx ${85 + child.age * 5} cm tall.`;

  const childDesc = hasChildAvatar
    ? `${child.name} (${child.age}-year-old Indian ${genderLabel}, the hero) — match child avatar reference image exactly`
    : `${child.name} (${child.age}-year-old Indian ${genderLabel}, the hero) — ${childFallbackDescription.slice(childFallbackDescription.indexOf('.') + 2, 200)}. Different from Lalli — NO pigtails.`;

  return `Ultra-high-definition 3D animated children's storybook illustration, Pixar/Disney quality, warm cinematic lighting.

SCENE ${scene.sceneNumber}: ${scene.description}

THREE CHARACTERS — ALL MUST BE VISIBLE:
• LEFT: Lalli (girl) — match Lalli reference image exactly
• CENTER: ${childDesc}
• RIGHT: Fafa (boy) — match Fafa reference image exactly

Landscape orientation, vibrant colors, all three children clearly visible and interacting with the scene.`.trim();
}

/**
 * Creates a prompt for generating a child avatar in cinematic 3D style
 */
export function createChildAvatarPrompt(child: ChildInfo): string {
  const genderLabel = getGenderLabel(child.gender);

  return `Ultra-high-definition 3D animated character portrait, Pixar/Disney quality.

Convert this child into a 3D animated character for a children's storybook.
Keep the child's facial features, hair style, and expression recognisable.

REQUIREMENTS:
- 3D animated Pixar/Disney style, full body, white background
- ${child.age}-year-old Indian ${genderLabel}, recognisable from the photo
- Warm, friendly, joyful expression

If no photo provided: create a ${child.age}-year-old Indian ${genderLabel} with ${
    child.gender === "female"
      ? "long loose black hair with pink headband (NO pigtails), pink star t-shirt, blue skirt"
      : child.gender === "male"
        ? "neat hair with side parting (NOT messy), red star t-shirt, blue shorts"
        : "dark hair with purple headband, purple star t-shirt, blue shorts"
  }.`.trim();
}
