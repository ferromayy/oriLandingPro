import { createClient } from "@/lib/supabase/server";
import type { AcademiaEvent } from "@/lib/academia/types";

export async function getActiveAcademiaEvents(): Promise<AcademiaEvent[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("academia_events")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getActiveAcademiaEvents:", error.message);
    return [];
  }

  return (data ?? []) as AcademiaEvent[];
}
