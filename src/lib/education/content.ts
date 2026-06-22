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

/** Parte el contenido cerca de la mitad para intercalar una imagen. */
export function splitEducationContentAtMiddle(content: string): [string, string] {
  const trimmed = content.trim();
  if (!trimmed) return ["", ""];

  const blocks = trimmed.split(/\n\n+/).filter(Boolean);
  if (blocks.length <= 1) {
    const mid = Math.floor(trimmed.length / 2);
    const breakAt = trimmed.lastIndexOf(". ", mid);
    if (breakAt > trimmed.length * 0.25) {
      return [trimmed.slice(0, breakAt + 1).trim(), trimmed.slice(breakAt + 2).trim()];
    }
    return [trimmed, ""];
  }

  const mid = Math.ceil(blocks.length / 2);
  return [blocks.slice(0, mid).join("\n\n"), blocks.slice(mid).join("\n\n")];
}

