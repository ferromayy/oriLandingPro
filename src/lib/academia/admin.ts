import { createAdminClient } from "@/lib/supabase/admin";
import type { AcademiaEvent, AcademiaEventFormData } from "@/lib/academia/types";
import type { AcademiaEventInsert } from "@/types/database";

function toPayload(data: AcademiaEventFormData): AcademiaEventInsert {
  return {
    image_url: data.image_url.trim(),
    title: data.title.trim(),
    subtitle: data.subtitle.trim(),
    duration: data.duration.trim(),
    description: data.description.trim(),
    is_active: data.is_active,
    sort_order: data.sort_order,
  };
}

export async function getAllAcademiaEventsAdmin(): Promise<AcademiaEvent[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("academia_events")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    if (/academia_events/i.test(error.message)) {
      throw new Error(
        `${error.message} — Ejecutá en Supabase las migraciones de academia, incluida 030_academia_events_details.sql.`,
      );
    }
    throw new Error(error.message);
  }

  return (data ?? []) as AcademiaEvent[];
}

export async function getAcademiaEventByIdAdmin(
  id: string,
): Promise<AcademiaEvent | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("academia_events")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as AcademiaEvent | null;
}

export async function createAcademiaEventAdmin(
  data: AcademiaEventFormData,
): Promise<{ id: string }> {
  const supabase = createAdminClient();
  const { data: created, error } = await supabase
    .from("academia_events")
    .insert(toPayload(data))
    .select("id")
    .single();

  if (error) {
    if (/academia_events/i.test(error.message)) {
      throw new Error(
        `${error.message} — Ejecutá en Supabase las migraciones de academia, incluida 030_academia_events_details.sql.`,
      );
    }
    throw new Error(error.message);
  }

  return { id: created.id };
}

export async function updateAcademiaEventAdmin(
  id: string,
  data: AcademiaEventFormData,
): Promise<{ id: string }> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("academia_events")
    .update({
      ...toPayload(data),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  return { id };
}

export async function deleteAcademiaEventAdmin(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("academia_events").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
