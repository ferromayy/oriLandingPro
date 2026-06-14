import { createAdminClient } from "@/lib/supabase/admin";
import { EDUCATION_NOTE_SELECT } from "@/lib/education/select";
import type {
  EducationNote,
  EducationNoteFormData,
} from "@/lib/education/types";
import { normalizeEducationNote } from "@/lib/education/types";
import type { EducationNoteInsert, EducationNoteUpdate } from "@/types/database";

function toPayload(data: EducationNoteFormData): EducationNoteInsert {
  return {
    title: data.title.trim(),
    slug: data.slug.trim(),
    content: data.content.trim(),
    source: data.source.trim(),
    nombre: data.nombre.trim(),
    is_active: data.is_active,
    sort_order: data.sort_order,
  };
}

async function syncImages(
  supabase: ReturnType<typeof createAdminClient>,
  noteId: string,
  images: EducationNoteFormData["images"],
) {
  await supabase.from("education_note_images").delete().eq("education_note_id", noteId);

  if (images.length === 0) return;

  const { error } = await supabase.from("education_note_images").insert(
    images.map((image, index) => ({
      education_note_id: noteId,
      url: image.url.trim(),
      sort_order: image.sort_order ?? index,
      is_primary: image.is_primary,
    })),
  );

  if (error) throw new Error(error.message);
}

export async function getAllEducationNotesAdmin(): Promise<EducationNote[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("education_notes")
    .select(EDUCATION_NOTE_SELECT)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => normalizeEducationNote(row as EducationNote));
}

export async function getEducationNoteByIdAdmin(
  id: string,
): Promise<EducationNote | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("education_notes")
    .select(EDUCATION_NOTE_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? normalizeEducationNote(data as EducationNote) : null;
}

export async function createEducationNoteAdmin(data: EducationNoteFormData) {
  const supabase = createAdminClient();
  const { data: created, error } = await supabase
    .from("education_notes")
    .insert(toPayload(data))
    .select()
    .single();

  if (error) throw new Error(error.message);

  await syncImages(supabase, created.id, data.images);

  const full = await getEducationNoteByIdAdmin(created.id);
  if (!full) throw new Error("No se pudo cargar la nota creada");
  return full;
}

export async function updateEducationNoteAdmin(
  id: string,
  data: EducationNoteFormData,
) {
  const supabase = createAdminClient();
  const payload: EducationNoteUpdate = {
    ...toPayload(data),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("education_notes").update(payload).eq("id", id);
  if (error) throw new Error(error.message);

  await syncImages(supabase, id, data.images);

  const full = await getEducationNoteByIdAdmin(id);
  if (!full) throw new Error("No se pudo cargar la nota actualizada");
  return full;
}

export async function deleteEducationNoteAdmin(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("education_notes").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
