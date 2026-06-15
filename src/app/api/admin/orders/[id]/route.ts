import { NextResponse } from "next/server";
import { requireSuperAdminApi } from "@/lib/auth/api-guard";
import {
  deleteCustomerOrderAdmin,
  updateCustomerOrderItemsAdmin,
  updateCustomerOrderStatusAdmin,
} from "@/lib/orders/admin";
import { updateOrderSchema } from "@/lib/orders/schema";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const denied = await requireSuperAdminApi();
  if (denied) return denied;

  const { id } = await params;
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "JSON inválido" }, { status: 400 });
  }

  const parsed = updateOrderSchema.safeParse(body);
  if (!parsed.success) {
    const errors = parsed.error.issues.map((issue) => issue.message);
    return NextResponse.json(
      { ok: false, message: errors[0] ?? "Datos inválidos", errors },
      { status: 400 },
    );
  }

  try {
    if ("status" in parsed.data) {
      const order = await updateCustomerOrderStatusAdmin(id, parsed.data.status);
      return NextResponse.json({ ok: true, order });
    }

    const order = await updateCustomerOrderItemsAdmin(id, parsed.data);
    return NextResponse.json({ ok: true, order });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al actualizar pedido";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const denied = await requireSuperAdminApi();
  if (denied) return denied;

  const { id } = await params;

  try {
    await deleteCustomerOrderAdmin(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al eliminar pedido";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
