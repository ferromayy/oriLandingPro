import { slugify } from "@/lib/coffees/types";
import type { EducationNoteImageRow, EducationNoteRow } from "@/types/database";

export const MAX_EDUCATION_NOTE_IMAGES = 3;

export type EducationNote = EducationNoteRow & {
  education_note_images: EducationNoteImageRow[];
};

export type EducationNoteImageForm = {
  url: string;
  sort_order: number;
};

export type EducationNoteFormData = {
  title: string;
  slug: string;
  content: string;
  source: string;
  nombre: string;
  images: EducationNoteImageForm[];
  is_active: boolean;
  sort_order: number;
};

export function normalizeEducationNote(raw: EducationNote): EducationNote {
  return {
    ...raw,
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
    content: normalized.content,
    source: normalized.source ?? "",
    nombre: normalized.nombre ?? "",
    images: normalized.education_note_images.map((image) => ({
      url: image.url,
      sort_order: image.sort_order,
    })),
    is_active: normalized.is_active,
    sort_order: normalized.sort_order,
  };
}

export { slugify };
