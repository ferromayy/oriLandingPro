import { createClient } from "@/lib/supabase/server";
import { COFFEE_RELATIONS_SELECT } from "@/lib/coffees/select";
import type { Coffee } from "@/lib/coffees/types";

function normalizeCoffee(raw: Coffee): Coffee {
  return {
    ...raw,
    coffee_images: raw.coffee_images ?? [],
    coffee_variants: raw.coffee_variants ?? [],
  };
}

export async function getActiveCoffees(): Promise<Coffee[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("coffees")
    .select(COFFEE_RELATIONS_SELECT)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getActiveCoffees:", error.message);
    return [];
  }

  return (data ?? []).map((row) => normalizeCoffee(row as Coffee));
}

export async function getCoffeeBySlug(slug: string): Promise<Coffee | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("coffees")
    .select(COFFEE_RELATIONS_SELECT)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("getCoffeeBySlug:", error.message);
    return null;
  }

  return data ? normalizeCoffee(data as Coffee) : null;
}
