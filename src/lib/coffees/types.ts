import type { CoffeeRow } from "@/types/database";

export type Coffee = CoffeeRow;

export type CoffeeFormData = {
  name: string;
  slug: string;
  codename: string;
  tasting_notes: string;
  description: string;
  price_250g: number;
  price_1000g: number | null;
  image_url: string;
  sold_out: boolean;
  is_active: boolean;
  sort_order: number;
};

export function coffeeToFormData(coffee: Coffee): CoffeeFormData {
  return {
    name: coffee.name,
    slug: coffee.slug,
    codename: coffee.codename ?? "",
    tasting_notes: coffee.tasting_notes,
    description: coffee.description,
    price_250g: coffee.price_250g,
    price_1000g: coffee.price_1000g,
    image_url: coffee.image_url ?? "",
    sold_out: coffee.sold_out,
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

export function formatArsPrice(cents: number): string {
  return `$${cents.toLocaleString("es-AR")}`;
}
