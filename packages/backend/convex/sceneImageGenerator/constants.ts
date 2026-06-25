/**
 * Constants for scene image generation
 */
import { Id } from "../_generated/dataModel";

// Separate character reference images in Convex Storage
// Upload the individual Lalli and Fafa cinematic images and update these IDs
export const LALLI_STORAGE_ID = "kg23bhz4jvpj2kgbdr0cwwgzts89a1fj" as Id<"_storage">;
export const FAFA_STORAGE_ID = "kg2dth451tnn3awpsk4kw9hm5h89bkrh" as Id<"_storage">;

export const PNG_MIME_TYPE = "image/png";
export const GEMINI_IMAGE_MODEL = "gemini-2.5-flash-image";

export const PROMPT_LABELS = {
  LALLI_REFERENCE: "REFERENCE IMAGE — LALLI: This shows Lalli's EXACT 3D animated appearance. Copy her facial features, hair style (two pigtails with orange bows), yellow star dress, teal bag, and proportions PRECISELY in the scene. Do not modify her look.",
  FAFA_REFERENCE: "REFERENCE IMAGE — FAFA: This shows Fafa's EXACT 3D animated appearance. Copy his facial features, hair style (short messy brown), teal overalls over yellow shirt, blue bunny toy, and proportions PRECISELY in the scene. Do not modify his look.",
  CHILD_REFERENCE: "REFERENCE IMAGE — CHILD HERO: This shows the child character's EXACT appearance. Copy their facial features, hair, clothing, skin tone, and proportions PRECISELY. This child must appear in EVERY scene as the central hero.",
  VISUAL_CONTINUITY: "VISUAL CONTINUITY: Match the art style, lighting, and character designs from this previous scene exactly.",
} as const;
