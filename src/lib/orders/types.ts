import type { CoffeeSizeGrams } from "@/types/database";
import type { GrindOption } from "@/lib/coffees/product-content";

export type CustomerOrderItem = {
  coffee_id: string;
  name: string;
  codename: string | null;
  size_grams: CoffeeSizeGrams;
  grind: GrindOption;
  quantity: number;
  unit_price: number;
  line_total: number;
};

export const ORDER_STATUSES = ["pending", "completed", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type CustomerOrder = {
  id: string;
  /** Posición en la lista (1, 2, 3…). Se renumera al eliminar pedidos. */
  order_number: number;
  /** Código público fijo (1600, 1601…). No cambia al eliminar otros pedidos. */
  order_code: number;
  status: OrderStatus;
  items: CustomerOrderItem[];
  total: number;
  whatsapp_message: string;
  created_at: string;
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pendiente",
  completed: "Finalizado",
  cancelled: "Cancelado",
};

/** Primer código visible para clientes (WhatsApp, etc.). */
export const ORDER_CODE_START = 1600;

/** Fallback para filas creadas antes de la columna order_code. */
export function legacyOrderCodeFromNumber(orderNumber: number): number {
  return ORDER_CODE_START + orderNumber - 1;
}

export function formatOrderCode(orderCode: number): string {
  return String(orderCode);
}
