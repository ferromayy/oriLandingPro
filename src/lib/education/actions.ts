"use server";

import { getSuperAdminSession } from "@/lib/auth/server";
import {
  createEducationNoteAdmin,
  updateEducationNoteAdmin,
} from "@/lib/education/admin";
import { ensurePrimaryImageFlag } from "@/lib/education/helpers";
import {
  validateEducationNoteForm,
  type FormValidationIssue,
} from "@/lib/education/schema";

export type SaveEducationNoteResult =
  | { ok: true; noteId: string }
  | { ok: false; message: string; issues?: FormValidationIssue[] };

export async function saveEducationNoteAction(
  mode: "create" | "edit",
  noteId: string | undefined,
  data: unknown,
): Promise<SaveEducationNoteResult> {
  const session = await getSuperAdminSession();
  if (!session) {
    return { ok: false, message: "Sesión expirada. Volvé a iniciar sesión en el admin." };
  }

  const validation = validateEducationNoteForm(data);
  if (!validation.success) {
    return {
      ok: false,
      message: validation.issues[0]?.message ?? "Datos inválidos",
      issues: validation.issues,
    };
  }

  if (mode === "edit" && !noteId) {
    return { ok: false, message: "Nota no encontrada" };
  }

  try {
    const payload = {
      ...validation.data,
      images: ensurePrimaryImageFlag(validation.data.images),
    };

    const note =
      mode === "create"
        ? await createEducationNoteAdmin(payload)
        : await updateEducationNoteAdmin(noteId!, payload);

    return { ok: true, noteId: note.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al guardar";
    return { ok: false, message };
  }
}
