/**
 * Formats story inputs into a structured prompt for the AI
 */

type ChildInfo = {
  name: string;
  gender: string;
  age: number;
  nickname?: string;
  favoriteAnimal?: string;
  favoriteColor?: string;
};

type StoryParams = {
  theme: string;
  lesson?: string;
  language?: string;
  length?: "short" | "medium" | "long";
  storyType?: string | null;
  storyTypeName?: string;
  storyTypePromptHint?: string;
  previousStoryContent?: string;
};

/**
 * Returns a clean language label for the prompt
 */
function getLanguageLabel(language?: string): string {
  if (!language) return "English";
  // Normalize: capitalise first letter
  return language.charAt(0).toUpperCase() + language.slice(1).toLowerCase();
}

/**
 * Formats the complete story prompt sent to GPT.
 * Returns a JSON string with structured inputs.
 */
export function formatStoryPrompt(
  childInfo: ChildInfo,
  params: StoryParams
): string {
  const genderLabel =
    childInfo.gender === "male" ? "boy" : childInfo.gender === "female" ? "girl" : "child";

  const language = getLanguageLabel(params.language);

  const lengthConfig = {
    short:  { total: "200–230", perScene: "40–46", readTime: "~3 min" },
    medium: { total: "430–460", perScene: "86–92", readTime: "~6 min" },
    long:   { total: "620–660", perScene: "124–132", readTime: "~10 min" },
  }[params.length ?? "medium"];
  const wordInstruction = `MANDATORY: The story body must be ${lengthConfig.total} words (title excluded, SCENE METADATA excluded). Count your words before finalising. Each of the 5 scenes must be approximately ${lengthConfig.perScene} words of story content. Do not go below the minimum and do not exceed the maximum.`;

  const storyTypeName = params.storyTypeName || mapStoryTypeCode(params.storyType);
  const storyTypeHint = params.storyTypePromptHint || getDefaultHint(params.storyType);

  // Build personalisation block — only include fields the user has set
  const personalisation: Record<string, string> = {};
  if (childInfo.nickname) personalisation.nickname = childInfo.nickname;
  if (childInfo.favoriteAnimal) personalisation.favoriteAnimal = childInfo.favoriteAnimal;
  if (childInfo.favoriteColor) personalisation.favoriteColor = childInfo.favoriteColor;
  const hasPersonalisation = Object.keys(personalisation).length > 0;

  // Compose personalisation rules only when details are available
  const personalisationRules = hasPersonalisation ? [
    childInfo.nickname
      ? `NICKNAME: Lalli and Fafa call ${childInfo.name} by the nickname "${childInfo.nickname}" in dialogue 1–2 times — use it naturally, not every sentence.`
      : null,
    childInfo.favoriteAnimal
      ? `FAVOURITE ANIMAL (${childInfo.favoriteAnimal.toUpperCase()}): A ${childInfo.favoriteAnimal} must play a meaningful role in the story — not just mentioned in passing, but an active participant in the adventure (e.g., helps solve a problem, leads the children somewhere, is in danger and needs rescuing, or guards a magical object). Give it a small personality.`
      : null,
    childInfo.favoriteColor
      ? `FAVOURITE COLOUR (${childInfo.favoriteColor.toUpperCase()}): At least one everyday object in the story must be ${childInfo.favoriteColor} (e.g., a ${childInfo.favoriteColor} bag, a ${childInfo.favoriteColor} kite, a ${childInfo.favoriteColor} ribbon, a ${childInfo.favoriteColor} door). This colour should feel natural and noticed by ${childInfo.name} — not a magical or glowing object.`
      : null,
  ].filter(Boolean).join(" ") : null;

  const payload = {
    child: {
      name: childInfo.name,
      gender: childInfo.gender,
      genderLabel,
      age: childInfo.age,
      ...(hasPersonalisation ? { personalisation } : {}),
    },
    story: {
      theme: params.theme,
      lesson: params.lesson || null,
      language,
      storyType: storyTypeName,
      storyTypeGuidance: storyTypeHint,
    },
    ...(params.previousStoryContent ? {
      sequel: {
        previousStory: params.previousStoryContent,
        guidance: `This is a SEQUEL. The previous story is provided above. Continue the adventure from where it ended — reference what happened, keep the same characters and world, but introduce a NEW challenge or discovery. Do not retell the previous story. Start with a brief callback (1-2 sentences), then launch into the new adventure.`,
      },
    } : {}),
    instructions: [
      `BEGIN STORY NOW.`,
      wordInstruction,
      `SCENE METADATA RULE (CRITICAL): Every one of the 5 scene description lines MUST follow this pattern: "Lalli, ${childInfo.name}, and Fafa [doing action together] in [setting]." — ${childInfo.name} must be NAMED and given a SPECIFIC VISIBLE ACTION in every single scene description. A scene description that says only "Lalli and Fafa" without mentioning ${childInfo.name} is WRONG. ${childInfo.name} is the HERO — they should be described as the central figure in each scene, with Lalli on their left and Fafa on their right.`,
      personalisationRules ? `PERSONALISATION RULES (MANDATORY — do not skip): ${personalisationRules}` : null,
    ].filter(Boolean).join(" "),
  };

  return JSON.stringify(payload, null, 2);
}

function mapStoryTypeCode(code?: string | null): string {
  const map: Record<string, string> = {
    adventure: "Big Adventure",
    silly: "Silly & Funny",
    cozy: "Cozy Bedtime",
  };
  return code ? (map[code] ?? "Big Adventure") : "Big Adventure";
}

function getDefaultHint(code?: string | null): string {
  const map: Record<string, string> = {
    adventure: "Quest structure: problem → journey → unexpected twist → resolution. Sense of movement and discovery.",
    silly: "Twist structure: comic misunderstanding escalates → Fafa's absurd solution attempted → goes hilariously wrong → accidentally fixes everything.",
    cozy: "Cozy structure: quiet beginning → soft exploration → gentle resolution. Slow pacing, rich sensory detail, no dramatic tension.",
  };
  return code ? (map[code] ?? map.adventure) : map.adventure;
}

export type { ChildInfo, StoryParams };
