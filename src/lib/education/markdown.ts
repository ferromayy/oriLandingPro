/** Quita sintaxis Markdown para extractos y vistas previas en admin. */
export function stripMarkdown(content: string): string {
  return content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/__([^_]+)_/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^>\s+/gm, "")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/\|/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeComparableTitle(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titlesMatch(a: string, b: string): boolean {
  const left = normalizeComparableTitle(a);
  const right = normalizeComparableTitle(b);
  if (!left || !right) return false;
  return left === right || left.includes(right) || right.includes(left);
}

/**
 * Limpia texto pegado desde ChatGPT u otras fuentes antes de renderizarlo.
 * - Quita un # título inicial si repite el título de la nota
 * - Convierte guiones largos solos (---) en separadores Markdown
 * - Reduce líneas en blanco excesivas
 */
export function normalizeEducationMarkdown(content: string, noteTitle?: string): string {
  let text = content.replace(/\r\n/g, "\n").trim();
  if (!text) return text;

  const lines = text.split("\n");
  const firstLine = lines[0]?.trim() ?? "";
  const h1Match = firstLine.match(/^#\s+(.+)$/);

  if (h1Match && noteTitle?.trim() && titlesMatch(h1Match[1], noteTitle)) {
    text = lines.slice(1).join("\n").replace(/^\n+/, "");
  }

  text = text
    .replace(/^[ \t]*-{3,}[ \t]*$/gm, "\n---\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return text;
}
