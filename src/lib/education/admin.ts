import { createAdminClient } from "@/lib/supabase/admin";
import { ensureEducationImageFlags } from "@/lib/education/helpers";
import { EDUCATION_NOTE_SELECT } from "@/lib/education/select";
import type {
  EducationNote,
  EducationNoteFormData,
} from "@/lib/education/types";
import { normalizeEducationNote } from "@/lib/education/types";

function isMissingColumnError(message: string, column: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes(column.toLowerCase()) &&
    (lower.includes("schema cache") ||
      lower.includes("does not exist") ||
      lower.includes("could not find"))
  );
}

function coreNotePayload(data: EducationNoteFormData) {
  return {
    title: data.title.trim(),
    slug: data.slug.trim(),
    content: data.content.trim(),
    is_active: data.is_active,
    sort_order: data.sort_order,
  };
}

function fullNotePayload(data: EducationNoteFormData) {
  return {
    ...coreNotePayload(data),
    source: data.source.trim(),
    nombre: data.nombre.trim(),
  };
}

async function insertEducationNote(
  supabase: ReturnType<typeof createAdminClient>,
  data: EducationNoteFormData,
) {
  const full = fullNotePayload(data);
  let result = await supabase.from("education_notes").insert(full).select("id").single();

  if (
    result.error &&
    (isMissingColumnError(result.error.message, "source") ||
      isMissingColumnError(result.error.message, "nombre"))
  ) {
    result = await supabase
      .from("education_notes")
      .insert(coreNotePayload(data))
      .select("id")
      .single();
  }

  if (result.error) throw new Error(result.error.message);
  return result.data;
}

async function updateEducationNoteRow(
  supabase: ReturnType<typeof createAdminClient>,
  id: string,
  data: EducationNoteFormData,
) {
  const full = {
    ...fullNotePayload(data),
    updated_at: new Date().toISOString(),
  };

  let result = await supabase.from("education_notes").update(full).eq("id", id);

  if (
    result.error &&
    (isMissingColumnError(result.error.message, "source") ||
      isMissingColumnError(result.error.message, "nombre"))
  ) {
    result = await supabase
      .from("education_notes")
      .update({
        ...coreNotePayload(data),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
  }

  if (result.error) throw new Error(result.error.message);
}

async function syncImages(
  supabase: ReturnType<typeof createAdminClient>,
  noteId: string,
  images: EducationNoteFormData["images"],
) {
  const normalized = ensureEducationImageFlags(images);

  await supabase.from("education_note_images").delete().eq("education_note_id", noteId);

  if (normalized.length === 0) return;

  const withFlags = normalized.map((image, index) => ({
    education_note_id: noteId,
    url: image.url.trim(),
    sort_order: image.sort_order ?? index,
    is_primary: image.is_primary,
    is_inline: image.is_inline,
  }));

  let result = await supabase.from("education_note_images").insert(withFlags);

  if (result.error && isMissingColumnError(result.error.message, "is_inline")) {
    result = await supabase.from("education_note_images").insert(
      normalized.map((image, index) => ({
        education_note_id: noteId,
        url: image.url.trim(),
        sort_order: image.sort_order ?? index,
        is_primary: image.is_primary,
      })),
    );
  }

  if (result.error && isMissingColumnError(result.error.message, "is_primary")) {
    result = await supabase.from("education_note_images").insert(
      normalized.map((image, index) => ({
        education_note_id: noteId,
        url: image.url.trim(),
        sort_order: image.sort_order ?? index,
      })),
    );
  }

  if (result.error) {
    if (result.error.message.includes("education_note_images")) {
      throw new Error(
        `${result.error.message} — Ejecutá supabase/migrations/017_education_images_catch_up.sql en Supabase.`,
      );
    }
    throw new Error(result.error.message);
  }
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

export async function createEducationNoteAdmin(
  data: EducationNoteFormData,
): Promise<{ id: string }> {
  const supabase = createAdminClient();
  const created = await insertEducationNote(supabase, data);
  await syncImages(supabase, created.id, data.images);
  return { id: created.id };
}

export async function updateEducationNoteAdmin(
  id: string,
  data: EducationNoteFormData,
): Promise<{ id: string }> {
  const supabase = createAdminClient();
  await updateEducationNoteRow(supabase, id, data);
  await syncImages(supabase, id, data.images);
  return { id };
}

export async function deleteEducationNoteAdmin(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("education_notes").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
