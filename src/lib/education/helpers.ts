import type { EducationNote, EducationNoteImageForm } from "@/lib/education/types";
import type { EducationNoteImageRow } from "@/types/database";

export function getPrimaryEducationImage(
  note: EducationNote,
): EducationNoteImageRow | null {
  const images = note.education_note_images ?? [];
  return images.find((image) => image.is_primary) ?? null;
}

export function getInlineEducationImages(note: EducationNote): EducationNoteImageRow[] {
  const images = note.education_note_images ?? [];
  return images
    .filter((image) => image.is_inline && !image.is_primary)
    .sort((a, b) => a.sort_order - b.sort_order);
}

/** @deprecated Usar getInlineEducationImages */
export function getInlineEducationImage(note: EducationNote): EducationNoteImageRow | null {
  return getInlineEducationImages(note)[0] ?? null;
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
  const inline = images
    .filter((image) => image.is_inline && !image.is_primary)
    .sort((a, b) => a.sort_order - b.sort_order);
  const footer = images.filter((image) => !image.is_primary && !image.is_inline);
  return { primary, inline, footer };
}

export function flattenEducationImages(
  primary: EducationNoteImageForm | null,
  inline: EducationNoteImageForm[],
  footer: EducationNoteImageForm[],
): EducationNoteImageForm[] {
  const merged: EducationNoteImageForm[] = [];

  if (primary) {
    merged.push({ ...primary, is_primary: true, is_inline: false });
  }
  for (const image of inline) {
    merged.push({ ...image, is_primary: false, is_inline: true });
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
  return images.map((image) => ({
    ...image,
    is_primary: Boolean(image.is_primary),
    is_inline: Boolean(image.is_inline) && !image.is_primary,
  }));
}

/** @deprecated Usar ensureEducationImageFlags */
export function ensurePrimaryImageFlag(
  images: EducationNoteImageForm[],
): EducationNoteImageForm[] {
  return ensureEducationImageFlags(images);
}
