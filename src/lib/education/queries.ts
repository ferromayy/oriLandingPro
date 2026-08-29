import { createClient } from "@/lib/supabase/server";
import { EDUCATION_NOTE_SELECT } from "@/lib/education/select";
import type { EducationSection } from "@/lib/education/sections";
import type { EducationNote } from "@/lib/education/types";
import { normalizeEducationNote } from "@/lib/education/types";

export async function getActiveEducationNotes(
  section?: EducationSection,
): Promise<EducationNote[]> {
  const supabase = await createClient();
  let query = supabase
    .from("education_notes")
    .select(EDUCATION_NOTE_SELECT)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (section) {
    query = query.eq("section", section);
  }

  const { data, error } = await query;

  if (error) {
    // Fallback si aún no corrió la migración 026 (columna section).
    if (section && /section/i.test(error.message)) {
      console.warn(
        "getActiveEducationNotes: falta columna section; devolviendo todas las notas activas.",
        error.message,
      );
      if (section === "blog") {
        return getActiveEducationNotes();
      }
      return [];
    }
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
