import { NextResponse } from "next/server";
import { requireSuperAdminApi } from "@/lib/auth/api-guard";
import {
  createEducationNoteAdmin,
  getAllEducationNotesAdmin,
} from "@/lib/education/admin";
import { educationNoteFormSchema } from "@/lib/education/schema";

export async function GET() {
  const denied = await requireSuperAdminApi();
  if (denied) return denied;

  try {
    const notes = await getAllEducationNotesAdmin();
    return NextResponse.json({ ok: true, notes });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al listar notas";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const denied = await requireSuperAdminApi();
  if (denied) return denied;

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
    const note = await createEducationNoteAdmin(parsed.data);
    return NextResponse.json({ ok: true, note }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al crear nota";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
