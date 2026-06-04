import { NextResponse } from "next/server";
import { requireSuperAdminApi } from "@/lib/auth/api-guard";
import {
  deleteEducationNoteAdmin,
  getEducationNoteByIdAdmin,
  updateEducationNoteAdmin,
} from "@/lib/education/admin";
import { educationNoteFormSchema } from "@/lib/education/schema";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const denied = await requireSuperAdminApi();
  if (denied) return denied;

  const { id } = await params;

  try {
    const note = await getEducationNoteByIdAdmin(id);
    if (!note) {
      return NextResponse.json(
        { ok: false, message: "Nota no encontrada" },
        { status: 404 },
      );
    }
    return NextResponse.json({ ok: true, note });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al obtener nota";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Params) {
  const denied = await requireSuperAdminApi();
  if (denied) return denied;

  const { id } = await params;
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "JSON inválido" }, { status: 400 });
  }

  const parsed = educationNoteFormSchema.safeParse(body);
  if (!parsed.success) {
    const errors = parsed.error.issues.map((issue) => issue.message);
    return NextResponse.json(
      {
        ok: false,
        message: errors[0] ?? "Datos inválidos",
        errors,
      },
      { status: 400 },
    );
  }

  try {
    const note = await updateEducationNoteAdmin(id, parsed.data);
    return NextResponse.json({ ok: true, note });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al actualizar nota";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const denied = await requireSuperAdminApi();
  if (denied) return denied;

  const { id } = await params;

  try {
    await deleteEducationNoteAdmin(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al eliminar nota";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
