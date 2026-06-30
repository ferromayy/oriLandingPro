import { normalizeExtendedContentUrl } from "@/lib/coffees/extended-content";
import { createAdminClient } from "@/lib/supabase/admin";
import { prepareImageUpload } from "@/lib/uploads/prepare-image";
import { COFFEE_RELATIONS_SELECT } from "@/lib/coffees/select";
import type { CoffeeFormData } from "@/lib/coffees/types";
import type { Coffee } from "@/lib/coffees/types";
import type { CoffeeInsert, CoffeeUpdate } from "@/types/database";

function toCoffeePayload(data: CoffeeFormData): CoffeeInsert {
  return {
    name: data.name.trim(),
    slug: data.slug.trim(),
    codename: data.codename.trim() || null,
    tasting_notes: data.tasting_notes.trim(),
    short_description: data.short_description.trim(),
    long_description: "",
    extended_content_url: normalizeExtendedContentUrl(data.extended_content_url ?? ""),
    extended_content_catch_text:
      data.extended_content_url.trim() && data.extended_content_catch_text.trim()
        ? data.extended_content_catch_text.trim()
        : "",
    origin: data.origin.trim(),
    varietal: data.varietal.trim(),
    beneficio: data.beneficio.trim(),
    altitude: data.altitude.trim(),
    producer: data.producer.trim(),
    is_active: data.is_active,
    sort_order: data.sort_order,
  };
}

async function syncImages(
  supabase: ReturnType<typeof createAdminClient>,
  coffeeId: string,
  images: CoffeeFormData["images"],
) {
  await supabase.from("coffee_images").delete().eq("coffee_id", coffeeId);

  if (images.length === 0) return;

  const { error } = await supabase.from("coffee_images").insert(
    images.map((img, index) => ({
      coffee_id: coffeeId,
      url: img.url.trim(),
      sort_order: img.sort_order ?? index,
      is_primary: img.is_primary,
    })),
  );

  if (error) throw new Error(error.message);
}

async function syncVariants(
  supabase: ReturnType<typeof createAdminClient>,
  coffeeId: string,
  variants: CoffeeFormData["variants"],
) {
  await supabase.from("coffee_variants").delete().eq("coffee_id", coffeeId);

  const { error } = await supabase.from("coffee_variants").insert(
    variants.map((variant) => ({
      coffee_id: coffeeId,
      size_grams: variant.size_grams,
      price: variant.price,
      is_available: variant.is_available,
    })),
  );

  if (error) throw new Error(error.message);
}

function normalizeCoffee(raw: Coffee): Coffee {
  return {
    ...raw,
    coffee_images: raw.coffee_images ?? [],
    coffee_variants: raw.coffee_variants ?? [],
  };
}

export async function getAllCoffeesAdmin(): Promise<Coffee[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("coffees")
    .select(COFFEE_RELATIONS_SELECT)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => normalizeCoffee(row as Coffee));
}

export async function getCoffeeByIdAdmin(id: string): Promise<Coffee | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("coffees")
    .select(COFFEE_RELATIONS_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? normalizeCoffee(data as Coffee) : null;
}

export async function createCoffeeAdmin(data: CoffeeFormData) {
  const supabase = createAdminClient();
  const { data: created, error } = await supabase
    .from("coffees")
    .insert(toCoffeePayload(data))
    .select()
    .single();

  if (error) throw new Error(error.message);

  await syncImages(supabase, created.id, data.images);
  await syncVariants(supabase, created.id, data.variants);

  const full = await getCoffeeByIdAdmin(created.id);
  if (!full) throw new Error("No se pudo cargar el café creado");
  return full;
}

export async function updateCoffeeAdmin(id: string, data: CoffeeFormData) {
  const supabase = createAdminClient();
  const payload: CoffeeUpdate = {
    ...toCoffeePayload(data),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("coffees").update(payload).eq("id", id);
  if (error) throw new Error(error.message);

  await syncImages(supabase, id, data.images);
  await syncVariants(supabase, id, data.variants);

  const full = await getCoffeeByIdAdmin(id);
  if (!full) throw new Error("No se pudo cargar el café actualizado");
  return full;
}

export async function deleteCoffeeAdmin(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("coffees").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function uploadCoffeeImageAdmin(file: File): Promise<string> {
  const supabase = createAdminClient();
  const prepared = await prepareImageUpload(file);
  const path = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${prepared.extension}`;

  const { error } = await supabase.storage
    .from("coffee-images")
    .upload(path, prepared.buffer, {
      contentType: prepared.contentType,
      upsert: false,
    });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from("coffee-images").getPublicUrl(path);
  return data.publicUrl;
}
