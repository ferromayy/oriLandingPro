import type { EducationNote, EducationNoteImageForm } from "@/lib/education/types";
import type { EducationNoteImageRow } from "@/types/database";

export function getPrimaryEducationImage(
  note: EducationNote,
): EducationNoteImageRow | null {
  const images = note.education_note_images ?? [];
  return images.find((image) => image.is_primary) ?? images[0] ?? null;
}

export function getSecondaryEducationImages(note: EducationNote): EducationNoteImageRow[] {
  const primary = getPrimaryEducationImage(note);
  if (!primary) return [];

  return note.education_note_images.filter((image) => image.id !== primary.id);
}

export function ensurePrimaryImageFlag(
  images: EducationNoteImageForm[],
): EducationNoteImageForm[] {
  if (images.length === 0) return images;

  const hasPrimary = images.some((image) => image.is_primary);
  return images.map((image, index) => ({
    ...image,
    is_primary: hasPrimary ? image.is_primary : index === 0,
  }));
}
