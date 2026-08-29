import {
  getEducationContentAfter,
  getEducationContentBefore,
} from "@/lib/education/content";
import {
  getFooterEducationImages,
  getInlineEducationImages,
} from "@/lib/education/helpers";
import type { EducationNote } from "@/lib/education/types";

export const MIN_EDUCATION_PARAGRAPHS = 1;
export const MAX_EDUCATION_PARAGRAPHS = 10;
export const MAX_IMAGES_PER_PARAGRAPH = 3;

export type EducationContentBlock = {
  text: string;
  images: string[];
};

export function emptyEducationBlock(): EducationContentBlock {
  return { text: "", images: [] };
}

export function normalizeEducationBlock(raw: unknown): EducationContentBlock | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  const text = typeof record.text === "string" ? record.text : "";
  const images = Array.isArray(record.images)
    ? record.images
        .filter((url): url is string => typeof url === "string" && url.trim().length > 0)
        .map((url) => url.trim())
        .slice(0, MAX_IMAGES_PER_PARAGRAPH)
    : [];
  return { text, images };
}

export function normalizeEducationBlocks(raw: unknown): EducationContentBlock[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map(normalizeEducationBlock)
    .filter((block): block is EducationContentBlock => block !== null)
    .slice(0, MAX_EDUCATION_PARAGRAPHS);
}

/** Une el texto de todos los párrafos (para excerpt / content legacy). */
export function combineEducationBlocksText(blocks: EducationContentBlock[]): string {
  return blocks
    .map((block) => block.text.trim())
    .filter(Boolean)
    .join("\n\n");
}

/**
 * Lee bloques nuevos o reconstruye desde el modelo viejo
 * (texto superior / imágenes del medio / texto inferior / galería final).
 */
export function getEducationContentBlocks(
  note: Pick<
    EducationNote,
    | "content"
    | "content_before_image"
    | "content_after_image"
    | "content_blocks"
    | "education_note_images"
  >,
): EducationContentBlock[] {
  const fromDb = normalizeEducationBlocks(note.content_blocks);
  if (fromDb.length > 0) return fromDb;

  const before = getEducationContentBefore(note);
  const after = getEducationContentAfter(note);
  const inlineUrls = getInlineEducationImages(note as EducationNote).map((image) => image.url);
  const footerUrls = getFooterEducationImages(note as EducationNote).map((image) => image.url);

  const blocks: EducationContentBlock[] = [];

  if (before.trim() || inlineUrls.length > 0) {
    blocks.push({
      text: before,
      images: inlineUrls.slice(0, MAX_IMAGES_PER_PARAGRAPH),
    });
  }

  if (after.trim() || footerUrls.length > 0) {
    const footerChunks: string[][] = [];
    for (let i = 0; i < footerUrls.length; i += MAX_IMAGES_PER_PARAGRAPH) {
      footerChunks.push(footerUrls.slice(i, i + MAX_IMAGES_PER_PARAGRAPH));
    }

    if (footerChunks.length === 0) {
      blocks.push({ text: after, images: [] });
    } else {
      footerChunks.forEach((chunk, index) => {
        blocks.push({
          text: index === 0 ? after : "",
          images: chunk,
        });
      });
    }
  }

  if (blocks.length === 0 && note.content?.trim()) {
    blocks.push({ text: note.content, images: [] });
  }

  return blocks.length > 0 ? blocks.slice(0, MAX_EDUCATION_PARAGRAPHS) : [emptyEducationBlock()];
}
