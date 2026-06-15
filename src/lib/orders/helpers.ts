import type { CustomerOrderItem } from "@/lib/orders/types";

export function computeOrderTotal(items: CustomerOrderItem[]): number {
  return items.reduce((sum, item) => sum + item.line_total, 0);
}

export function withOrderItemQuantity(
  item: CustomerOrderItem,
  quantity: number,
): CustomerOrderItem {
  const safeQuantity = Math.max(1, Math.floor(quantity));
  return {
    ...item,
    quantity: safeQuantity,
    line_total: item.unit_price * safeQuantity,
  };
}
