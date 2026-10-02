import { NextResponse } from "next/server";
import { requireSuperAdminApi } from "@/lib/auth/api-guard";
import { deleteAcademiaEventAdmin } from "@/lib/academia/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const denied = await requireSuperAdminApi();
    if (denied) return denied;

    const { id } = await params;
    await deleteAcademiaEventAdmin(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al eliminar";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
