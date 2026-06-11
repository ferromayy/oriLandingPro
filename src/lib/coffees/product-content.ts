import { getExtendedContentHref } from "@/lib/coffees/extended-content";
import type { Coffee } from "@/lib/coffees/types";
import { EDUCATION_PUBLIC_ENABLED } from "@/lib/site/features";

export const GRIND_OPTIONS = [
  "Café en grano",
  "Cold brew",
  "Moka / Italiana",
  "Aeropress",
  "Prensa francesa",
  "V60",
  "Espresso",
  "Otro",
] as const;

export type GrindOption = (typeof GRIND_OPTIONS)[number];

export function parseTastingNotes(notes: string): string[] {
  return notes
    .replace(/^Notas:\s*/i, "")
    .split(/[,;\n]+/)
    .map((n) => n.trim())
    .filter(Boolean);
}

export type DescriptionBlock =
  | { type: "paragraph"; parts: string[] }
  | { type: "bold-lead"; lead: string; parts: string[] };

function splitParagraphParts(text: string): string[] {
  return text
    .split(/\n\n+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function hasTechSheet(coffee: {
  origin: string;
  varietal: string;
  beneficio: string;
  altitude: string;
}): boolean {
  return Boolean(
    coffee.origin || coffee.varietal || coffee.beneficio || coffee.altitude,
  );
}

/** Texto visible en la ficha del producto (siempre la descripción corta). */
export function buildProductStory(coffee: Coffee): DescriptionBlock[] {
  if (!coffee.short_description.trim()) return [];

  return [
    {
      type: "paragraph",
      parts: splitParagraphParts(coffee.short_description),
    },
  ];
}

/** Enlace a la nota de educación vinculada (vacío = sin versión extendida). */
export function getExtendedContentUrl(coffee: Coffee): string | null {
  if (!EDUCATION_PUBLIC_ENABLED) return null;
  return getExtendedContentHref(coffee.extended_content_url ?? "");
}

export function buildProductStoryPreview(coffee: Coffee): DescriptionBlock[] {
  return buildProductStory(coffee);
}

export function hasExtendedContentUrl(coffee: Coffee): boolean {
  return getExtendedContentUrl(coffee) !== null;
}

export function hasProductStory(coffee: Coffee): boolean {
  return buildProductStory(coffee).length > 0;
}

export function hasProductStoryPreview(coffee: Coffee): boolean {
  return buildProductStoryPreview(coffee).length > 0;
}
