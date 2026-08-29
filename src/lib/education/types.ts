import {
  combineEducationBlocksText,
  getEducationContentBlocks,
  type EducationContentBlock,
} from "@/lib/education/blocks";
import { ensureEducationImageFlags, getPrimaryEducationImage } from "@/lib/education/helpers";
import {
  EDUCATION_SECTION_DEFAULT,
  normalizeEducationSection,
  type EducationSection,
} from "@/lib/education/sections";
import { slugify } from "@/lib/coffees/types";
import type { EducationNoteImageRow, EducationNoteRow } from "@/types/database";

export type { EducationSection, EducationContentBlock };

export const MAX_EDUCATION_PRIMARY_IMAGES = 1;
/** @deprecated Se reemplazó por párrafos con imágenes propias. */
export const MIN_EDUCATION_INLINE_IMAGES = 0;
/** @deprecated Se reemplazó por párrafos con imágenes propias. */
export const MAX_EDUCATION_INLINE_IMAGES = 3;
/** @deprecated Se reemplazó por párrafos con imágenes propias. */
export const MAX_EDUCATION_FOOTER_IMAGES = 0;
/** @deprecated Se reemplazó por párrafos con imágenes propias. */
export const MIN_EDUCATION_FOOTER_IMAGES = 0;
export const MAX_EDUCATION_NOTE_IMAGES = MAX_EDUCATION_PRIMARY_IMAGES;

export type EducationNote = EducationNoteRow & {
  education_note_images: EducationNoteImageRow[];
};

export type EducationNoteImageForm = {
  url: string;
  sort_order: number;
  is_primary: boolean;
  is_inline: boolean;
};

export type EducationNoteFormData = {
  title: string;
  slug: string;
  content_blocks: EducationContentBlock[];
  source: string;
  nombre: string;
  section: EducationSection;
  /** Solo imagen principal (portada). */
  images: EducationNoteImageForm[];
  is_active: boolean;
  sort_order: number;
};

export function normalizeEducationNote(raw: EducationNote): EducationNote {
  return {
    ...raw,
    content_before_image: raw.content_before_image ?? "",
    content_after_image: raw.content_after_image ?? "",
    content_blocks: Array.isArray(raw.content_blocks) ? raw.content_blocks : [],
    section: normalizeEducationSection(raw.section),
    education_note_images: [...(raw.education_note_images ?? [])].sort(
      (a, b) => a.sort_order - b.sort_order,
    ),
  };
}

export function toEducationNoteFormData(note: EducationNote): EducationNoteFormData {
  const normalized = normalizeEducationNote(note);
  const primary = getPrimaryEducationImage(normalized);

  return {
    title: normalized.title,
    slug: normalized.slug ?? "",
    content_blocks: getEducationContentBlocks(normalized),
    source: normalized.source ?? "",
    nombre: normalized.nombre ?? "",
    section: normalized.section ?? EDUCATION_SECTION_DEFAULT,
    images: ensureEducationImageFlags(
      primary
        ? [
            {
              url: primary.url,
              sort_order: 0,
              is_primary: true,
              is_inline: false,
            },
          ]
        : [],
    ),
    is_active: normalized.is_active,
    sort_order: normalized.sort_order,
  };
}

export { combineEducationBlocksText, slugify };
