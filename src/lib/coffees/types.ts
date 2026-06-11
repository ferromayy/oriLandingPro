import { normalizeExtendedContentUrl } from "@/lib/coffees/extended-content";
import type {
  CoffeeImageRow,
  CoffeeRow,
  CoffeeSizeGrams,
  CoffeeVariantRow,
} from "@/types/database";
import { COFFEE_SIZES_GRAMS } from "@/types/database";

export type CoffeeImage = CoffeeImageRow;
export type CoffeeVariant = CoffeeVariantRow;

export type Coffee = CoffeeRow & {
  coffee_images: CoffeeImage[];
  coffee_variants: CoffeeVariant[];
};

export type CoffeeImageForm = {
  url: string;
  sort_order: number;
  is_primary: boolean;
};

export type CoffeeVariantForm = {
  size_grams: CoffeeSizeGrams;
  price: number;
  is_available: boolean;
};

export type CoffeeFormData = {
  name: string;
  slug: string;
  codename: string;
  tasting_notes: string;
  short_description: string;
  long_description: string;
  extended_content_url: string;
  origin: string;
  varietal: string;
  beneficio: string;
  altitude: string;
  images: CoffeeImageForm[];
  variants: CoffeeVariantForm[];
  is_active: boolean;
  sort_order: number;
};

export function defaultVariants(): CoffeeVariantForm[] {
  return COFFEE_SIZES_GRAMS.map((size_grams) => ({
    size_grams,
    price: 0,
    is_available: false,
  }));
}

export function coffeeToFormData(coffee: Coffee): CoffeeFormData {
  const images = [...coffee.coffee_images].sort(
    (a, b) => a.sort_order - b.sort_order,
  );
  const variants = COFFEE_SIZES_GRAMS.map((size) => {
    const found = coffee.coffee_variants.find((v) => v.size_grams === size);
    return {
      size_grams: size,
      price: found?.price ?? 0,
      is_available: found?.is_available ?? false,
    };
  });

  return {
    name: coffee.name,
    slug: coffee.slug,
    codename: coffee.codename ?? "",
    tasting_notes: coffee.tasting_notes,
    short_description: coffee.short_description,
    long_description: coffee.long_description,
    extended_content_url: normalizeExtendedContentUrl(
      coffee.extended_content_url ?? "",
    ),
    origin: coffee.origin,
    varietal: coffee.varietal,
    beneficio: coffee.beneficio,
    altitude: coffee.altitude,
    images: images.map((img) => ({
      url: img.url,
      sort_order: img.sort_order,
      is_primary: img.is_primary,
    })),
    variants,
    is_active: coffee.is_active,
    sort_order: coffee.sort_order,
  };
}

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatArsPrice(amount: number): string {
  return `$${amount.toLocaleString("es-AR")}`;
}

export function formatSizeLabel(sizeGrams: CoffeeSizeGrams): string {
  if (sizeGrams === 1000) return "1kg";
  return `${sizeGrams}g`;
}

export {
  COFFEE_SIZES_GRAMS,
  MAX_COFFEE_IMAGES,
  MIN_COFFEE_IMAGES,
  type CoffeeSizeGrams,
} from "@/types/database";
