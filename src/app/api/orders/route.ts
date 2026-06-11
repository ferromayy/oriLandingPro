import { NextResponse } from "next/server";
import { createCustomerOrder } from "@/lib/orders/admin";
import { createOrderSchema } from "@/lib/orders/schema";
import { formatOrderCode } from "@/lib/orders/types";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "JSON inválido" }, { status: 400 });
  }

  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    const errors = parsed.error.issues.map((issue) => issue.message);
    return NextResponse.json(
      { ok: false, message: errors[0] ?? "Datos inválidos", errors },
      { status: 400 },
    );
  }

  try {
    const order = await createCustomerOrder(parsed.data);
    return NextResponse.json(
      {
        ok: true,
        order: {
          id: order.id,
          order_number: order.order_number,
          order_code: formatOrderCode(order.order_code),
          whatsapp_message: order.whatsapp_message,
        },
      },
      { status: 201 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al registrar pedido";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
