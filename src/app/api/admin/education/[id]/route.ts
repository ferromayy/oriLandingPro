import { NextResponse } from "next/server";
import { requireSuperAdminApi } from "@/lib/auth/api-guard";
import {
  deleteEducationNoteAdmin,
  getEducationNoteByIdAdmin,
  updateEducationNoteAdmin,
} from "@/lib/education/admin";
import { ensurePrimaryImageFlag } from "@/lib/education/helpers";
import { educationNoteFormSchema } from "@/lib/education/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

function jsonError(message: string, status = 500) {
  return NextResponse.json({ ok: false, message }, { status });
}

export async function GET(_request: Request, { params }: Params) {
  try {
    const denied = await requireSuperAdminApi();
    if (denied) return denied;

    const { id } = await params;
    const note = await getEducationNoteByIdAdmin(id);

    if (!note) {
      return jsonError("Nota no encontrada", 404);
    }

    return NextResponse.json({ ok: true, note });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al obtener nota";
    return jsonError(message);
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const denied = await requireSuperAdminApi();
    if (denied) return denied;

    const { id } = await params;
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return jsonError("JSON inválido", 400);
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

    const note = await updateEducationNoteAdmin(id, {
      ...parsed.data,
      images: ensurePrimaryImageFlag(parsed.data.images),
    });

    return NextResponse.json({ ok: true, note });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al actualizar nota";
    return jsonError(message);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const denied = await requireSuperAdminApi();
    if (denied) return denied;

    const { id } = await params;
    await deleteEducationNoteAdmin(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al eliminar nota";
    return jsonError(message);
  }
}
