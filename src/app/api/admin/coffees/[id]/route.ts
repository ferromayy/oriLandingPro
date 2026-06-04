import { NextResponse } from "next/server";
import { requireSuperAdminApi } from "@/lib/auth/api-guard";
import {
  getCoffeeByIdAdmin,
  updateCoffeeAdmin,
  deleteCoffeeAdmin,
} from "@/lib/coffees/admin";
import { coffeeFormSchema } from "@/lib/coffees/schema";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const denied = await requireSuperAdminApi();
  if (denied) return denied;

  const { id } = await params;

  try {
    const coffee = await getCoffeeByIdAdmin(id);
    if (!coffee) {
      return NextResponse.json({ ok: false, message: "Café no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, coffee });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al obtener café";
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

  const parsed = coffeeFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 },
    );
  }

  try {
    const coffee = await updateCoffeeAdmin(id, parsed.data);
    return NextResponse.json({ ok: true, coffee });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al actualizar café";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const denied = await requireSuperAdminApi();
  if (denied) return denied;

  const { id } = await params;

  try {
    await deleteCoffeeAdmin(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al eliminar café";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
