import type { Coffee, CoffeeImage, CoffeeVariant } from "@/lib/coffees/types";
import { COFFEE_SIZES_GRAMS } from "@/lib/coffees/types";

const LAUNCH_TIMEZONE = "America/Argentina/Cordoba";

function toLocalDateKey(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** True el mismo día calendario en que se creó el café (hora Argentina). */
export function isCoffeeLaunchDay(coffee: { created_at: string }): boolean {
  const created = new Date(coffee.created_at);
  if (Number.isNaN(created.getTime())) return false;
  return (
    toLocalDateKey(created, LAUNCH_TIMEZONE) ===
    toLocalDateKey(new Date(), LAUNCH_TIMEZONE)
  );
}

export function sortImages(images: CoffeeImage[]): CoffeeImage[] {
  return [...images].sort((a, b) => a.sort_order - b.sort_order);
}

export function getPrimaryImage(coffee: Coffee): string | null {
  const sorted = sortImages(coffee.coffee_images);
  return sorted.find((img) => img.is_primary)?.url ?? sorted[0]?.url ?? null;
}

export function getGalleryImages(coffee: Coffee): CoffeeImage[] {
  return sortImages(coffee.coffee_images);
}

export function getVariant(
  coffee: Coffee,
  sizeGrams: number,
): CoffeeVariant | undefined {
  return coffee.coffee_variants.find((v) => v.size_grams === sizeGrams);
}

export function getAvailableVariants(coffee: Coffee): CoffeeVariant[] {
  return [...(coffee.coffee_variants ?? [])]
    .filter((variant) => variant.is_available && variant.price > 0)
    .sort((a, b) => a.size_grams - b.size_grams);
}

export function isCoffeeSoldOut(coffee: Coffee): boolean {
  return getAvailableVariants(coffee).length === 0;
}

export function getDisplayPrice(coffee: Coffee): number | null {
  const available = getAvailableVariants(coffee);
  if (available.length === 0) return null;
  return Math.min(...available.map((v) => v.price));
}

/** Precio más bajo configurado (admin), aunque esté sin stock. */
export function getConfiguredPrice(coffee: Coffee): number | null {
  const prices = coffee.coffee_variants
    .filter((v) => v.price > 0)
    .map((v) => v.price);
  if (prices.length === 0) return null;
  return Math.min(...prices);
}

export function getDefaultVariant(coffee: Coffee): CoffeeVariant | null {
  const available = getAvailableVariants(coffee);
  if (available.length === 0) return null;
  return (
    available.find((v) => v.size_grams === 250) ??
    available[0] ??
    null
  );
}
