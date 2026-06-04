import { NextResponse } from "next/server";
import { requireSuperAdminApi } from "@/lib/auth/api-guard";
import { getAllCoffeesAdmin, createCoffeeAdmin } from "@/lib/coffees/admin";
import { coffeeFormSchema } from "@/lib/coffees/schema";

export async function GET() {
  const denied = await requireSuperAdminApi();
  if (denied) return denied;

  try {
    const coffees = await getAllCoffeesAdmin();
    return NextResponse.json({ ok: true, coffees });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al listar cafés";
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

  const parsed = coffeeFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 },
    );
  }

  try {
    const coffee = await createCoffeeAdmin(parsed.data);
    return NextResponse.json({ ok: true, coffee }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al crear café";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
