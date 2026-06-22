import { stripMarkdown } from "@/lib/education/markdown";

const DEFAULT_EXCERPT_LENGTH = 320;

export function getEducationExcerpt(
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

export function educationNoteHasMore(content: string, maxLength = DEFAULT_EXCERPT_LENGTH): boolean {
  return stripMarkdown(content).replace(/\s+/g, " ").length > maxLength;
}
