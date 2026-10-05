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
