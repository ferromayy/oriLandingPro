import type { AcademiaEventRow } from "@/types/database";

export const ACADEMIA_TEXT_MAX = 60;
export const ACADEMIA_DURATION_MAX = 40;
export const ACADEMIA_DESCRIPTION_MAX = 500;

export type AcademiaEvent = AcademiaEventRow;

export type AcademiaEventFormData = {
  image_url: string;
  title: string;
  subtitle: string;
  duration: string;
  description: string;
  is_active: boolean;
  sort_order: number;
};

export function toAcademiaEventFormData(
  event: AcademiaEvent,
): AcademiaEventFormData {
  return {
    image_url: event.image_url ?? "",
    title: event.title ?? "",
    subtitle: event.subtitle ?? "",
    duration: event.duration ?? "",
    description: event.description ?? "",
    is_active: event.is_active,
    sort_order: event.sort_order,
  };
}

const EDUCATOR_MARKER = " POR:";

/** Separa el título visible de los nombres guardados como `TÍTULO POR: Ana - Luis`. */
export function splitAcademiaTitle(stored: string): {
  title: string;
  educators: string;
} {
  const index = stored.indexOf(EDUCATOR_MARKER);
  if (index === -1) return { title: stored, educators: "" };
  const educators = stored
    .slice(index + EDUCATOR_MARKER.length)
    .split(/\s*-\s*/)
    .map((name) => name.trim())
    .filter(Boolean)
    .join("\n");
  return { title: stored.slice(0, index).trim(), educators };
}

export function composeAcademiaTitle(title: string, educators: string): string {
  const names = educators
    .split(/\n+/)
    .map((name) => name.trim())
    .filter(Boolean);
  const heading = title.trim();
  if (names.length === 0) return heading;
  return `${heading}${EDUCATOR_MARKER} ${names.join(" - ")}`;
}

/** Primera línea con fecha (10/10/26) y el resto como edición y lugar. */
export function splitAcademiaSubtitle(stored: string): {
  when: string;
  place: string;
} {
  const lines = stored
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length === 0) return { when: "", place: "" };
  const startsWithDate = /^\d{1,2}\/\d{1,2}\/\d{2}/.test(lines[0]);
  if (lines.length > 1 && startsWithDate) {
    return { when: lines[0], place: lines.slice(1).join(" ") };
  }
  if (startsWithDate || /^próximamente/i.test(lines[0])) {
    return { when: lines[0], place: lines.slice(1).join(" ") };
  }
  return { when: "", place: lines.join(" ") };
}

export function composeAcademiaSubtitle(when: string, place: string): string {
  const date = when.trim();
  const where = place.trim();
  if (date && where) return `${date}\n${where}`;
  return date || where;
}
