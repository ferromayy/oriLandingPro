import type { CartItem } from "@/components/site/cart-context";
import { openWhatsAppWithMessage } from "@/lib/site/whatsapp-order";

function toOrderPayload(items: CartItem[], total: number) {
  return {
    items: items.map((item) => ({
      coffee_id: item.coffeeId,
      name: item.name,
      codename: item.codename,
      size_grams: item.sizeGrams,
      grind: item.grind,
      quantity: item.quantity,
      unit_price: item.price,
      line_total: item.price * item.quantity,
    })),
    total,
  };
}

export async function createOrderAndOpenWhatsApp(
  items: CartItem[],
  total: number,
): Promise<void> {
  const res = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toOrderPayload(items, total)),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message ?? "No se pudo registrar el pedido");
  }

  openWhatsAppWithMessage(data.order.whatsapp_message);
}
