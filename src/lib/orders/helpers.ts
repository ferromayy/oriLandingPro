import type { CustomerOrderItem } from "@/lib/orders/types";

/** Precio unitario registrado en el pedido (no el precio actual del catálogo). */
export function getOrderItemUnitPrice(item: CustomerOrderItem): number {
  if (typeof item.unit_price === "number" && item.unit_price > 0) {
    return item.unit_price;
  }
  if (
    typeof item.line_total === "number" &&
    item.line_total > 0 &&
    item.quantity > 0
  ) {
    return Math.round(item.line_total / item.quantity);
  }
  return 0;
}

/** Subtotal de la línea según lo guardado en el pedido. */
export function getOrderItemLineTotal(item: CustomerOrderItem): number {
  if (typeof item.line_total === "number" && item.line_total > 0) {
    return item.line_total;
  }
  return getOrderItemUnitPrice(item) * item.quantity;
}

export function computeOrderTotal(items: CustomerOrderItem[]): number {
  return items.reduce((sum, item) => sum + getOrderItemLineTotal(item), 0);
}

export function withOrderItemQuantity(
  item: CustomerOrderItem,
  quantity: number,
): CustomerOrderItem {
  const safeQuantity = Math.max(1, Math.floor(quantity));
  const unitPrice = getOrderItemUnitPrice(item);
  return {
    ...item,
    quantity: safeQuantity,
    unit_price: unitPrice,
    line_total: unitPrice * safeQuantity,
  };
}
