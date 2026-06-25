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

  const childPrompt = hasChildAvatar
    ? `Copy the EXACT appearance from the child reference image — match facial features, skin tone, hair, clothing, and proportions precisely. 3D animated cinematic style. Do NOT change their look.`
    : childFallbackDescription;

  const continuityPrompt = hasPreviousScene
    ? `\nVISUAL CONTINUITY: Match the art style, lighting, and character designs from the previous scene reference image.`
    : "";

  return `
THREE CHARACTERS REQUIRED — THIS IS THE #1 RULE:
This image MUST show EXACTLY three children together:
1. LALLI (girl in yellow star dress) — on the LEFT
2. ${child.name.toUpperCase()} (${genderLabel}, the hero) — in the CENTER
3. FAFA (boy in teal overalls with bunny) — on the RIGHT
If ${child.name} is missing from the image, the image is WRONG. All three must be clearly visible.

---

${STYLE_LOCK}

---

SCENE ${scene.sceneNumber}:
${scene.description}

---

CHARACTERS (3D animated, cinematic quality):

LALLI (left side, approx 105 cm / 3 ft 5 in):
• Indian girl, warm brown skin, rosy cheeks, large expressive dark brown eyes, wide warm smile
• Hair: dark brown/black, TWO HIGH PIGTAILS with orange bow hair ties
• Outfit: yellow short-sleeve dress with orange star print — ALWAYS this exact outfit
• Accessories: teal/turquoise crossbody sling bag with gold button clasp
• Shoes: cream ankle socks, orange Mary Jane shoes
• Copy her appearance EXACTLY from the Lalli reference image

${child.name.toUpperCase()} (center — THE HERO):
${childPrompt}

FAFA (right side, approx 100 cm / 3 ft 3 in):
• Indian boy, warm brown skin, rosy cheeks, large expressive dark brown eyes, wide happy open-mouth smile
• Hair: short dark brown, slightly messy/tousled
• Outfit: yellow short-sleeve t-shirt UNDER teal/turquoise bib overalls (dungarees) with yellow buttons
• Prop: ALWAYS holding a light blue sleeping bunny plush toy in one hand
• Shoes: yellow ankle socks, orange rounded shoes
• Copy his appearance EXACTLY from the Fafa reference image

---

COMPOSITION:
• Landscape orientation (wider than tall), cinematic framing
• All THREE characters in the scene, naturally interacting with the environment
• ${child.name} is positioned between Lalli and Fafa, slightly forward — ${child.name} is the hero
• Rich, detailed background matching the scene setting — vibrant and immersive
• Warm cinematic lighting with soft shadows
• Ultra-high-definition quality — sharp details, professional 3D animation
${continuityPrompt}
`.trim();
}

/**
 * Creates a prompt for generating a child avatar in cinematic 3D style
 */
export function createChildAvatarPrompt(child: ChildInfo): string {
  const genderLabel = getGenderLabel(child.gender);

  return `
${STYLE_LOCK}

---

Create a 3D animated CHARACTER PORTRAIT of a child for a children's storybook.
This portrait will be the REFERENCE IMAGE for all story scenes — it must clearly
establish the character's fixed, consistent appearance in cinematic 3D animated style.

CHARACTER DETAILS:
- Name: ${child.name}
- Age: ${child.age} years old
- Gender: ${genderLabel}
- Height: approximately ${85 + child.age * 5} cm

APPEARANCE (3D cinematic animated style):
- Indian/South Asian ethnicity
- Warm brown/tan skin tone with subsurface scattering (natural Indian complexion)
- Large expressive dark brown eyes (slightly stylized/big, Pixar-like)
- Natural Indian facial features — round face, small nose, warm smile
${child.gender === "female"
    ? "- Long straight dark black hair worn LOOSE past shoulders with a bright PINK HEADBAND — NO pigtails (pigtails belong to a different character called Lalli)\n- Bright pink t-shirt with a white star print, blue skirt"
    : child.gender === "male"
      ? "- Neat dark black hair with a clean SIDE PARTING — NOT messy or spiky (messy hair belongs to a different character called Fafa)\n- Bright red t-shirt with a white star print, blue shorts — NO bunny toy"
      : "- Dark black hair with a bright purple headband\n- Bright purple t-shirt with a white star print, blue shorts"}

PORTRAIT REQUIREMENTS:
- Full body visible, standing pose
- Clean white or very light background
- Ultra-high-definition 3D animated style (Pixar/Disney quality)
- Character must be recognisably Indian, matching the age and gender
- Friendly, welcoming expression

If a child reference photo is provided: adapt the facial features into 3D animated style while keeping them recognisable.
`.trim();
}
