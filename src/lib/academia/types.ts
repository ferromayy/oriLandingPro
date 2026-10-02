import type { AcademiaEventRow } from "@/types/database";

export const ACADEMIA_TEXT_MAX = 30;

export type AcademiaEvent = AcademiaEventRow;

export type AcademiaEventFormData = {
  image_url: string;
  title: string;
  subtitle: string;
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
    is_active: event.is_active,
    sort_order: event.sort_order,
  };
}
