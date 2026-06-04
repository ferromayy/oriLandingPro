import type { Coffee } from "@/lib/coffees/types";

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

function parseDescriptionBlock(block: string): DescriptionBlock {
  const trimmed = block.trim();

  const boldMarkdown = trimmed.match(/^\*\*(.+?)\*\*\s*([\s\S]*)$/);
  if (boldMarkdown) {
    return {
      type: "bold-lead",
      lead: boldMarkdown[1],
      parts: splitParagraphParts(boldMarkdown[2] ?? ""),
    };
  }

  const boldLeadSentence = trimmed.match(
    /^(Hablemos un poco más del [^.]+\.)\s*([\s\S]*)$/i,
  );
  if (boldLeadSentence) {
    return {
      type: "bold-lead",
      lead: boldLeadSentence[1],
      parts: splitParagraphParts(boldLeadSentence[2] ?? ""),
    };
  }

  return { type: "paragraph", parts: splitParagraphParts(trimmed) };
}

export function parseLongDescription(text: string): DescriptionBlock[] {
  if (!text.trim()) return [];

  return text
    .trim()
    .split(/\n\n+/)
    .filter((block) => block.trim())
    .map(parseDescriptionBlock);
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

/** Combina descripción corta + larga como en oricafe.com.ar */
export function buildProductStory(coffee: Coffee): DescriptionBlock[] {
  const blocks: DescriptionBlock[] = [];

  if (coffee.short_description.trim()) {
    blocks.push({
      type: "paragraph",
      parts: splitParagraphParts(coffee.short_description),
    });
  }

  blocks.push(...parseLongDescription(coffee.long_description));

  return blocks;
}

/** En la ficha del producto: si hay URL extendida, solo el adelanto (descripción corta). */
export function buildProductStoryPreview(coffee: Coffee): DescriptionBlock[] {
  const extendedUrl = coffee.extended_content_url?.trim();

  if (extendedUrl) {
    if (!coffee.short_description.trim()) return [];
    return [
      {
        type: "paragraph",
        parts: splitParagraphParts(coffee.short_description),
      },
    ];
  }

  return buildProductStory(coffee);
}

export function hasExtendedContentUrl(coffee: Coffee): boolean {
  return Boolean(coffee.extended_content_url?.trim());
}

export function hasProductStory(coffee: Coffee): boolean {
  return buildProductStory(coffee).length > 0;
}

export function hasProductStoryPreview(coffee: Coffee): boolean {
  return buildProductStoryPreview(coffee).length > 0;
}
