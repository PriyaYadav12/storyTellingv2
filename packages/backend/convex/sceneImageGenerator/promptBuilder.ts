/**
 * Prompt building logic for image generation
 */
import { Part } from "@google/genai";
import { ChildInfo, SceneMetadata, PromptReferences } from "./types";
import { PROMPT_LABELS, PNG_MIME_TYPE } from "./constants";
import { getGenderLabel } from "./utils";

/**
 * Universal style lock applied to EVERY scene prompt.
 * This is the single source of truth for the visual language.
 * Gemini must obey these constraints before anything else.
 */
const STYLE_LOCK = `
STYLE LOCK — APPLY TO EVERY SCENE, NO EXCEPTIONS:
• Art style: flat 2D vector cartoon, children's picture book illustration
• Color palette: warm soft pastels (peach, lavender, mint, soft gold, sky blue) — NO neon, NO dark/gritty tones
• Linework: clean smooth outlines, consistent stroke weight throughout
• Rendering: soft cell-shading only — NO photorealism, NO 3D rendering, NO painterly textures
• Lighting: warm, diffused, even — no harsh shadows or dramatic contrast
• Proportions: slightly chibi/big-headed for characters (large expressive eyes, small noses)
• Background: simple, colorful, uncluttered — complements characters without overpowering them
• Mood: warm, cheerful, safe, joyful — suitable for children aged 2–8
`.trim();

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

  const childFallbackDescription =
    child.gender === "female"
      ? `${child.name} is a ${child.age}-year-old Indian girl with warm brown skin, long dark black hair in two pigtails with pink hair ties, large expressive dark brown eyes, a small round nose, and a bright friendly smile. She wears a bright pink t-shirt with a white star on it and blue shorts — ALWAYS this exact outfit.`
      : child.gender === "male"
        ? `${child.name} is a ${child.age}-year-old Indian boy with warm brown skin, short neat dark black hair, large expressive dark brown eyes, a small round nose, and a wide friendly smile. He wears a bright red t-shirt with a white star on it and blue shorts — ALWAYS this exact outfit.`
        : `${child.name} is a ${child.age}-year-old Indian child with warm brown skin, dark black hair, large expressive dark brown eyes, and a friendly smile. Wears a bright purple t-shirt with a white star and blue shorts — ALWAYS this exact outfit.`;

  const childPrompt = hasChildAvatar
    ? `Copy the EXACT appearance from the child reference image — match facial features, skin tone, hair colour/style, clothing colours and patterns, body proportions precisely. Do NOT change their look.`
    : childFallbackDescription;

  const continuityPrompt = hasPreviousScene
    ? `\nVISUAL CONTINUITY: Match the art style, colour palette, and character designs from the previous scene reference image.`
    : "";

  return `
THREE CHARACTERS REQUIRED — THIS IS THE #1 RULE:
This image MUST show EXACTLY three children standing together:
1. LALLI (girl in yellow dress) — on the LEFT
2. ${child.name.toUpperCase()} (${genderLabel} in ${hasChildAvatar ? "outfit from reference" : child.gender === "female" ? "pink t-shirt" : child.gender === "male" ? "red t-shirt" : "purple t-shirt"}) — in the CENTER
3. FAFA (boy in teal overalls) — on the RIGHT
If ${child.name} is missing from the image, the image is WRONG. All three must be clearly visible.

---

${STYLE_LOCK}

---

SCENE ${scene.sceneNumber}:
${scene.description}

---

CHARACTERS:

LALLI (left side):
• Indian girl, warm brown skin, rosy cheeks, large dark eyes, warm smile
• Hair: dark brown, TWO HIGH PIGTAILS with orange hair ties
• Outfit: yellow short-sleeve dress with orange star print
• Accessories: teal crossbody shoulder bag
• Shoes: white socks, orange Mary Jane shoes

${child.name.toUpperCase()} (center — THE HERO):
${childPrompt}

FAFA (right side):
• Indian boy, warm brown skin, rosy cheeks, large dark eyes, happy smile
• Hair: short dark brown, slightly spiky
• Outfit: yellow t-shirt UNDER teal bib overalls (dungarees)
• Prop: ALWAYS holding a light blue bunny plush toy
• Shoes: yellow socks, orange shoes

Use the character reference image to match Lalli and Fafa's faces exactly.

---

COMPOSITION:
• Landscape orientation (wider than tall)
• All THREE characters in the upper 60–70% of the frame
• ${child.name} is positioned between Lalli and Fafa, slightly forward — ${child.name} is the hero
• Simple, colourful background — warm lighting, no harsh shadows
${continuityPrompt}
`.trim();
}

/**
 * Creates a prompt for generating a child avatar
 */
export function createChildAvatarPrompt(child: ChildInfo): string {
  const genderLabel = getGenderLabel(child.gender);

  return `
${STYLE_LOCK}

---

Create a children's storybook CHARACTER PORTRAIT for the following child.
This portrait will be used as the REFERENCE IMAGE for all story scene illustrations,
so it must clearly establish the character's fixed, consistent appearance.

CHARACTER DETAILS:
- Name: ${child.name}
- Age: ${child.age} years old
- Gender: ${genderLabel}

ETHNICITY & APPEARANCE (lock these in — they must not change across scenes):
- Indian/South Asian ethnicity
- Warm brown/tan skin tone (natural Indian complexion)
- Dark brown or black hair — clean, styled, age-appropriate
- Friendly, expressive large dark brown eyes (slightly chibi proportions)
- Natural Indian facial features — round face, small nose, warm smile
- Colourful, age-appropriate clothing — one specific outfit that will be used throughout the story

PORTRAIT REQUIREMENTS:
- Full character visible from waist up, or full body if space allows
- Centred composition, neutral or simple colourful background
- Friendly, welcoming expression — approachable and joyful
- The character must be recognisably Indian, suitable for a ${child.age}-year-old ${genderLabel}

If a child reference photo is provided: copy the facial features, hair, and clothing precisely.
`.trim();
}
