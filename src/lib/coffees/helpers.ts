import type { Coffee, CoffeeImage, CoffeeVariant } from "@/lib/coffees/types";
import { COFFEE_SIZES_GRAMS } from "@/lib/coffees/types";

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
  return COFFEE_SIZES_GRAMS.map(
    (size) => getVariant(coffee, size),
  ).filter((v): v is CoffeeVariant => Boolean(v?.is_available && v.price > 0));
}

export function isCoffeeSoldOut(coffee: Coffee): boolean {
  return getAvailableVariants(coffee).length === 0;
}

export function getDisplayPrice(coffee: Coffee): number | null {
  const available = getAvailableVariants(coffee);
  if (available.length === 0) {
    const fallback = getVariant(coffee, 250) ?? coffee.coffee_variants[0];
    return fallback?.price ?? null;
  }
  return Math.min(...available.map((v) => v.price));
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
