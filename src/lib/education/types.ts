import { combineEducationContent, getEducationContentAfter, getEducationContentBefore } from "@/lib/education/content";
import { ensureEducationImageFlags } from "@/lib/education/helpers";
import { slugify } from "@/lib/coffees/types";
import type { EducationNoteImageRow, EducationNoteRow } from "@/types/database";

export const MAX_EDUCATION_PRIMARY_IMAGES = 1;
export const MAX_EDUCATION_INLINE_IMAGES = 1;
export const MAX_EDUCATION_FOOTER_IMAGES = 4;
export const MIN_EDUCATION_FOOTER_IMAGES = 2;
export const MAX_EDUCATION_NOTE_IMAGES =
  MAX_EDUCATION_PRIMARY_IMAGES +
  MAX_EDUCATION_INLINE_IMAGES +
  MAX_EDUCATION_FOOTER_IMAGES;

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
  content_before_image: string;
  content_after_image: string;
  source: string;
  nombre: string;
  images: EducationNoteImageForm[];
  is_active: boolean;
  sort_order: number;
};

export function normalizeEducationNote(raw: EducationNote): EducationNote {
  return {
    ...raw,
    content_before_image: raw.content_before_image ?? "",
    content_after_image: raw.content_after_image ?? "",
    education_note_images: [...(raw.education_note_images ?? [])].sort(
      (a, b) => a.sort_order - b.sort_order,
    ),
  };
}

export function toEducationNoteFormData(note: EducationNote): EducationNoteFormData {
  const normalized = normalizeEducationNote(note);
  return {
    title: normalized.title,
    slug: normalized.slug ?? "",
    content_before_image: getEducationContentBefore(normalized),
    content_after_image: getEducationContentAfter(normalized),
    source: normalized.source ?? "",
    nombre: normalized.nombre ?? "",
    images: ensureEducationImageFlags(
      normalized.education_note_images.map((image) => ({
        url: image.url,
        sort_order: image.sort_order,
        is_primary: image.is_primary ?? false,
        is_inline: image.is_inline ?? false,
      })),
    ),
    is_active: normalized.is_active,
    sort_order: normalized.sort_order,
  };
}

export { slugify };
