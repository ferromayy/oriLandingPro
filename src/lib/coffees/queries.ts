import { createClient } from "@/lib/supabase/server";
import type { Coffee } from "@/lib/coffees/types";

export async function getActiveCoffees(): Promise<Coffee[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("coffees")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getActiveCoffees:", error.message);
    return [];
  }

  return data ?? [];
}

export async function getCoffeeBySlug(slug: string): Promise<Coffee | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("coffees")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("getCoffeeBySlug:", error.message);
    return null;
  }

  return data;
}
