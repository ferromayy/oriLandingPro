import { formatArsPrice } from "@/lib/coffees/types";
import { formatOrderCode } from "@/lib/orders/types";
import type { CoffeeSizeGrams } from "@/types/database";
import type { GrindOption } from "@/lib/coffees/product-content";

export const WHATSAPP_ORDER_NUMBER = "543513053755";
export const WHATSAPP_PAYMENT_ALIAS = "oricafe";

export type WhatsAppOrderLine = {
  codename: string | null;
  name: string;
  sizeGrams: CoffeeSizeGrams;
  grind: GrindOption;
  quantity: number;
  price: number;
};

function formatOrderSize(sizeGrams: CoffeeSizeGrams): string {
  if (sizeGrams === 1000) return "1kg";
  return `${sizeGrams}gr`;
}

function formatOrderGrind(grind: GrindOption): string {
  if (grind === "Café en grano") return "Sin molienda";
  return grind;
}

function formatOrderProductTitle(codename: string | null, name: string): string {
  if (!codename?.trim()) return name;
  const tail = name.includes(" - ") ? name.split(" - ").pop()!.trim() : name;
  return `${codename.trim()} - ${tail}`;
}

export function buildWhatsAppOrderMessage(
  items: WhatsAppOrderLine[],
  total: number,
  orderNumber: number | string,
): string {
  const orderCode =
    typeof orderNumber === "number" ? formatOrderCode(orderNumber) : orderNumber;

  const lines = items.map((item, index) => {
    const title = formatOrderProductTitle(item.codename, item.name);
    const lineTotal = item.price * item.quantity;

    return [
      `${index + 1}. ${title}`,
      `   - Tamaño: ${formatOrderSize(item.sizeGrams)}`,
      `   - Molienda: ${formatOrderGrind(item.grind)}`,
      `   - Cantidad: ${item.quantity}`,
      `   - Precio: ${formatArsPrice(lineTotal)}`,
    ].join("\n");
  });

  return [
    "☕ PEDIDO DE CAFÉ",
    `Pedido #${orderCode}`,
    "",
    "Hola! Quiero realizar el siguiente pedido:",
    "",
    lines.join("\n\n"),
    "",
    `TOTAL: ${formatArsPrice(total)}`,
    `Alias: ${WHATSAPP_PAYMENT_ALIAS}`,
    "",
    "Gracias!",
  ].join("\n");
}

export function buildWhatsAppCheckoutUrl(message: string): string {
  const text = encodeURIComponent(message);
  return `https://api.whatsapp.com/send?phone=${WHATSAPP_ORDER_NUMBER}&text=${text}`;
}

export function openWhatsAppWithMessage(message: string): void {
  window.open(buildWhatsAppCheckoutUrl(message), "_blank", "noopener,noreferrer");
}
