import { stripMarkdown } from "@/lib/education/markdown";
import type { EducationNote } from "@/lib/education/types";

const DEFAULT_EXCERPT_LENGTH = 320;

export function combineEducationContent(before: string, after: string): string {
  const top = before.trim();
  const bottom = after.trim();
  if (!top) return bottom;
  if (!bottom) return top;
  return `${top}\n\n${bottom}`;
}

export function getEducationContentBefore(note: Pick<EducationNote, "content" | "content_before_image">): string {
  return note.content_before_image?.trim() || note.content?.trim() || "";
}

export function getEducationContentAfter(note: Pick<EducationNote, "content_after_image">): string {
  return note.content_after_image?.trim() || "";
}

export function getFullEducationContent(
  note: Pick<EducationNote, "content" | "content_before_image" | "content_after_image">,
): string {
  return combineEducationContent(
    getEducationContentBefore(note),
    getEducationContentAfter(note),
  );
}

export function getEducationExcerpt(
  note: Pick<EducationNote, "content" | "content_before_image" | "content_after_image">,
  maxLength = DEFAULT_EXCERPT_LENGTH,
): string {
  return getEducationExcerptFromText(getFullEducationContent(note), maxLength);
}

export function getEducationExcerptFromText(
  content: string,
  maxLength = DEFAULT_EXCERPT_LENGTH,
): string {
  const normalized = stripMarkdown(content).replace(/\s+/g, " ");
  if (normalized.length <= maxLength) return normalized;

  const cut = normalized.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  const excerpt = lastSpace > 120 ? cut.slice(0, lastSpace) : cut;

  return `${excerpt.trim()}…`;
}

export function educationNoteHasMore(
  note: Pick<EducationNote, "content" | "content_before_image" | "content_after_image">,
  maxLength = DEFAULT_EXCERPT_LENGTH,
): boolean {
  return stripMarkdown(getFullEducationContent(note)).replace(/\s+/g, " ").length > maxLength;
}
