import { createAdminClient } from "@/lib/supabase/admin";
import type { CoffeeFormData } from "@/lib/coffees/types";
import type { CoffeeInsert, CoffeeUpdate } from "@/types/database";

function toInsertPayload(data: CoffeeFormData): CoffeeInsert {
  return {
    name: data.name.trim(),
    slug: data.slug.trim(),
    codename: data.codename.trim() || null,
    tasting_notes: data.tasting_notes.trim(),
    description: data.description.trim(),
    price_250g: data.price_250g,
    price_1000g: data.price_1000g,
    image_url: data.image_url.trim() || null,
    sold_out: data.sold_out,
    is_active: data.is_active,
    sort_order: data.sort_order,
  };
}

export async function getAllCoffeesAdmin() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("coffees")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getCoffeeByIdAdmin(id: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("coffees")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function createCoffeeAdmin(data: CoffeeFormData) {
  const supabase = createAdminClient();
  const { data: created, error } = await supabase
    .from("coffees")
    .insert(toInsertPayload(data))
    .select()
    .single();

  if (error) throw new Error(error.message);
  return created;
}

export async function updateCoffeeAdmin(id: string, data: CoffeeFormData) {
  const supabase = createAdminClient();
  const payload: CoffeeUpdate = {
    ...toInsertPayload(data),
    updated_at: new Date().toISOString(),
  };

  const { data: updated, error } = await supabase
    .from("coffees")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return updated;
}

export async function deleteCoffeeAdmin(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("coffees").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function uploadCoffeeImageAdmin(file: File): Promise<string> {
  const supabase = createAdminClient();
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage
    .from("coffee-images")
    .upload(path, buffer, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from("coffee-images").getPublicUrl(path);
  return data.publicUrl;
}
