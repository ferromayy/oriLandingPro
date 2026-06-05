import { createClient } from "@/lib/supabase/server";
import { EDUCATION_NOTE_SELECT } from "@/lib/education/select";
import type { EducationNote } from "@/lib/education/types";
import { normalizeEducationNote } from "@/lib/education/types";

export async function getActiveEducationNotes(): Promise<EducationNote[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("education_notes")
    .select(EDUCATION_NOTE_SELECT)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getActiveEducationNotes:", error.message);
    return [];
  }

  return (data ?? []).map((row) => normalizeEducationNote(row as EducationNote));
}

export async function getEducationNoteBySlug(
  slug: string,
): Promise<EducationNote | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("education_notes")
    .select(EDUCATION_NOTE_SELECT)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("getEducationNoteBySlug:", error.message);
    return null;
  }

  return data ? normalizeEducationNote(data as EducationNote) : null;
}

