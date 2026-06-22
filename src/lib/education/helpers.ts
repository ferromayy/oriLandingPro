import type { EducationNote, EducationNoteImageForm } from "@/lib/education/types";
import type { EducationNoteImageRow } from "@/types/database";

export function getPrimaryEducationImage(
  note: EducationNote,
): EducationNoteImageRow | null {
  const images = note.education_note_images ?? [];
  return images.find((image) => image.is_primary) ?? images[0] ?? null;
}

export function getInlineEducationImage(note: EducationNote): EducationNoteImageRow | null {
  const images = note.education_note_images ?? [];
  return images.find((image) => image.is_inline && !image.is_primary) ?? null;
}

export function getFooterEducationImages(note: EducationNote): EducationNoteImageRow[] {
  return note.education_note_images.filter(
    (image) => !image.is_primary && !image.is_inline,
  );
}

/** @deprecated Usar getFooterEducationImages */
export function getSecondaryEducationImages(note: EducationNote): EducationNoteImageRow[] {
  return getFooterEducationImages(note);
}

export function partitionEducationImages(images: EducationNoteImageForm[]) {
  const primary = images.find((image) => image.is_primary) ?? null;
  const inline = images.find((image) => image.is_inline && !image.is_primary) ?? null;
  const footer = images.filter((image) => !image.is_primary && !image.is_inline);
  return { primary, inline, footer };
}

export function flattenEducationImages(
  primary: EducationNoteImageForm | null,
  inline: EducationNoteImageForm | null,
  footer: EducationNoteImageForm[],
): EducationNoteImageForm[] {
  const merged: EducationNoteImageForm[] = [];

  if (primary) {
    merged.push({ ...primary, is_primary: true, is_inline: false });
  }
  if (inline) {
    merged.push({ ...inline, is_primary: false, is_inline: true });
  }
  for (const image of footer) {
    merged.push({ ...image, is_primary: false, is_inline: false });
  }

  return merged.map((image, index) => ({
    ...image,
    sort_order: index,
  }));
}

export function ensureEducationImageFlags(
  images: EducationNoteImageForm[],
): EducationNoteImageForm[] {
  if (images.length === 0) return images;

  const hasPrimary = images.some((image) => image.is_primary);
  return images.map((image, index) => ({
    ...image,
    is_primary: hasPrimary ? image.is_primary : index === 0,
    is_inline: image.is_inline && !image.is_primary,
  }));
}

/** @deprecated Usar ensureEducationImageFlags */
export function ensurePrimaryImageFlag(
  images: EducationNoteImageForm[],
): EducationNoteImageForm[] {
  return ensureEducationImageFlags(images);
}
