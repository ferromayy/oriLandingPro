"use server";

import { getSuperAdminSession } from "@/lib/auth/server";
import {
  createAcademiaEventAdmin,
  updateAcademiaEventAdmin,
} from "@/lib/academia/admin";
import {
  validateAcademiaEventForm,
  type FormValidationIssue,
} from "@/lib/academia/schema";

export type SaveAcademiaEventResult =
  | { ok: true; eventId: string }
  | { ok: false; message: string; issues?: FormValidationIssue[] };

export async function saveAcademiaEventAction(
  mode: "create" | "edit",
  eventId: string | undefined,
  data: unknown,
): Promise<SaveAcademiaEventResult> {
  const session = await getSuperAdminSession();
  if (!session) {
    return { ok: false, message: "Sesión expirada. Volvé a iniciar sesión en el admin." };
  }

  const validation = validateAcademiaEventForm(data);
  if (!validation.success) {
    return {
      ok: false,
      message: validation.issues[0]?.message ?? "Datos inválidos",
      issues: validation.issues,
    };
  }

  if (mode === "edit" && !eventId) {
    return { ok: false, message: "Evento no encontrado" };
  }

  try {
    const event =
      mode === "create"
        ? await createAcademiaEventAdmin(validation.data)
        : await updateAcademiaEventAdmin(eventId!, validation.data);

    return { ok: true, eventId: event.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al guardar";
    return { ok: false, message };
  }
}
