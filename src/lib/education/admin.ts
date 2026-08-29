import {
  combineEducationBlocksText,
  normalizeEducationBlocks,
} from "@/lib/education/blocks";
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

function buildContentFields(data: EducationNoteFormData) {
  const content_blocks = normalizeEducationBlocks(data.content_blocks).map(
    (block) => ({
      text: block.text.trim(),
      images: block.images.slice(0, 3),
    }),
  );
  const content = combineEducationBlocksText(content_blocks);
  // Compat: el primer párrafo va a before; el resto concatenado a after.
  const content_before_image = content_blocks[0]?.text ?? "";
  const content_after_image = content_blocks
    .slice(1)
    .map((block) => block.text.trim())
    .filter(Boolean)
    .join("\n\n");

  return {
    content_blocks,
    content_before_image,
    content_after_image,
    content,
  };
}

function coreNotePayload(data: EducationNoteFormData) {
  return {
    title: data.title.trim(),
    slug: data.slug.trim(),
    section: data.section,
    ...buildContentFields(data),
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

function payloadWithoutContentBlocks(data: EducationNoteFormData) {
  const { content_blocks: _blocks, ...rest } = fullNotePayload(data);
  return rest;
}

async function insertEducationNote(
  supabase: ReturnType<typeof createAdminClient>,
  data: EducationNoteFormData,
) {
  const full = fullNotePayload(data);
  let result = await supabase.from("education_notes").insert(full).select("id").single();

  // Si falta content_blocks, reintentamos sin esa columna pero SIEMPRE con section.
  if (result.error && isMissingColumnError(result.error.message, "content_blocks")) {
    result = await supabase
      .from("education_notes")
      .insert(payloadWithoutContentBlocks(data))
      .select("id")
      .single();
  }

  if (
    result.error &&
    (isMissingColumnError(result.error.message, "source") ||
      isMissingColumnError(result.error.message, "nombre") ||
      isMissingColumnError(result.error.message, "content_before_image") ||
      isMissingColumnError(result.error.message, "content_after_image"))
  ) {
    // Fallback parcial: mantiene section + content_blocks si existen en el payload.
    const { source: _s, nombre: _n, content_before_image: _b, content_after_image: _a, ...rest } =
      fullNotePayload(data);
    result = await supabase
      .from("education_notes")
      .insert({
        ...rest,
        content: full.content,
      })
      .select("id")
      .single();
  }

  if (result.error) {
    if (isMissingColumnError(result.error.message, "section")) {
      throw new Error(
        "Falta la columna section en education_notes. Ejecutá supabase/migrations/026_education_note_section.sql en Supabase (SQL Editor) y volvé a guardar.",
      );
    }
    if (isMissingColumnError(result.error.message, "content_blocks")) {
      throw new Error(
        "Falta la columna content_blocks. Ejecutá supabase/migrations/027_education_note_content_blocks.sql en Supabase y volvé a guardar.",
      );
    }
    throw new Error(result.error.message);
  }
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

  if (result.error && isMissingColumnError(result.error.message, "content_blocks")) {
    result = await supabase
      .from("education_notes")
      .update({
        ...payloadWithoutContentBlocks(data),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
  }

  if (
    result.error &&
    (isMissingColumnError(result.error.message, "source") ||
      isMissingColumnError(result.error.message, "nombre") ||
      isMissingColumnError(result.error.message, "content_before_image") ||
      isMissingColumnError(result.error.message, "content_after_image"))
  ) {
    const {
      source: _s,
      nombre: _n,
      content_before_image: _b,
      content_after_image: _a,
      ...rest
    } = fullNotePayload(data);
    result = await supabase
      .from("education_notes")
      .update({
        ...rest,
        content: full.content,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
  }

  if (result.error) {
    if (isMissingColumnError(result.error.message, "section")) {
      throw new Error(
        "Falta la columna section en education_notes. Ejecutá supabase/migrations/026_education_note_section.sql en Supabase (SQL Editor) y volvé a guardar.",
      );
    }
    if (isMissingColumnError(result.error.message, "content_blocks")) {
      throw new Error(
        "Falta la columna content_blocks. Ejecutá supabase/migrations/027_education_note_content_blocks.sql en Supabase y volvé a guardar.",
      );
    }
    throw new Error(result.error.message);
  }
}

async function syncImages(
  supabase: ReturnType<typeof createAdminClient>,
  noteId: string,
  images: EducationNoteFormData["images"],
) {
  // Solo se persiste la portada; las imágenes de párrafos viven en content_blocks.
  const normalized = ensureEducationImageFlags(images)
    .filter((image) => image.is_primary)
    .slice(0, 1)
    .map((image) => ({
      ...image,
      is_primary: true,
      is_inline: false,
      sort_order: 0,
    }));

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
