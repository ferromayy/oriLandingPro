import { getEducationNotePublicPath } from "@/lib/site/public-url";

const EDUCATION_SLUG_RE = /^[a-z0-9-]+$/;

export function extractEducationSlugFromUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("/")) {
    const match = trimmed.match(/^\/educacion\/([a-z0-9-]+)\/?$/);
    return match?.[1] ?? null;
  }

  try {
    const pathname = new URL(trimmed).pathname.replace(/\/$/, "");
    const match = pathname.match(/^\/educacion\/([a-z0-9-]+)$/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

/** Guarda siempre como ruta interna `/educacion/{slug}`. */
export function normalizeExtendedContentUrl(value: string): string {
  const slug = extractEducationSlugFromUrl(value);
  if (!slug || !EDUCATION_SLUG_RE.test(slug)) return "";
  return getEducationNotePublicPath(slug);
}

export function isValidExtendedContentUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  return extractEducationSlugFromUrl(trimmed) !== null;
}

export function getExtendedContentHref(value: string): string | null {
  const normalized = normalizeExtendedContentUrl(value);
  return normalized || null;
}

export const MAX_EXTENDED_CATCH_WORDS = 30;

export const DEFAULT_EXTENDED_CATCH_BODY =
  "Este es solo un adelanto. La historia completa, el origen y todos los detalles están en nuestra nota de Educación.";

export function getDefaultExtendedCatchHeading(productName: string): string {
  return `Conocé más sobre ${productName}`;
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function isValidExtendedCatchText(text: string): boolean {
  const words = countWords(text);
  return words > 0 && words <= MAX_EXTENDED_CATCH_WORDS;
}

export function isInternalExtendedContentHref(href: string): boolean {
  return href.startsWith("/");
}
