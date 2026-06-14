import { NextResponse } from "next/server";
import { requireSuperAdminApi } from "@/lib/auth/api-guard";
import { ensurePrimaryImageFlag } from "@/lib/education/helpers";
import {
  createEducationNoteAdmin,
  getAllEducationNotesAdmin,
} from "@/lib/education/admin";
import { educationNoteFormSchema } from "@/lib/education/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(message: string, status = 500) {
  return NextResponse.json({ ok: false, message }, { status });
}

export async function GET() {
  try {
    const denied = await requireSuperAdminApi();
    if (denied) return denied;

    const notes = await getAllEducationNotesAdmin();
    return NextResponse.json({ ok: true, notes });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al listar notas";
    return jsonError(message);
  }
}

export async function POST(request: Request) {
  try {
    const denied = await requireSuperAdminApi();
    if (denied) return denied;

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

    const note = await createEducationNoteAdmin({
      ...parsed.data,
      images: ensurePrimaryImageFlag(parsed.data.images),
    });

    return NextResponse.json({ ok: true, note }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al crear nota";
    return jsonError(message);
  }
}
