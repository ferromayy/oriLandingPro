import { NextResponse } from "next/server";
import { requireSuperAdminApi } from "@/lib/auth/api-guard";
import { getAllCustomerOrdersAdmin } from "@/lib/orders/admin";

export async function GET() {
  const denied = await requireSuperAdminApi();
  if (denied) return denied;

  try {
    const orders = await getAllCustomerOrdersAdmin();
    return NextResponse.json({ ok: true, orders });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al listar pedidos";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
