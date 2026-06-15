import { formatArsPrice } from "@/lib/coffees/types";
import type { CoffeeSizeGrams } from "@/types/database";
import type { CustomerOrder, CustomerOrderItem } from "@/lib/orders/types";
import { formatOrderCode } from "@/lib/orders/types";

function formatOrderSize(sizeGrams: CoffeeSizeGrams): string {
  if (sizeGrams === 1000) return "1kg";
  return `${sizeGrams}gr`;
}

function formatProductTitle(item: CustomerOrderItem): string {
  if (!item.codename?.trim()) return item.name;
  const tail = item.name.includes(" - ")
    ? item.name.split(" - ").pop()!.trim()
    : item.name;
  return `${item.codename.trim()} - ${tail}`;
}

export function formatOrderProductTitle(item: CustomerOrderItem): string {
  return formatProductTitle(item);
}

function formatGrind(grind: string): string {
  if (grind === "Café en grano") return "Sin molienda";
  return grind;
}

export function formatOrderItemDetails(item: CustomerOrderItem): string {
  return [
    `Tamaño: ${formatOrderSize(item.size_grams)}`,
    `Molienda: ${formatGrind(item.grind)}`,
    `Cantidad: ${item.quantity}`,
    `Precio: ${formatArsPrice(item.line_total)}`,
  ].join(" · ");
}

export function formatOrderItemLine(item: CustomerOrderItem, index: number): string {
  return [
    `${index + 1}. ${formatProductTitle(item)}`,
    formatOrderItemDetails(item),
  ].join(" · ");
}

export function formatOrderDate(value: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Cordoba",
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function getOrderCode(order: CustomerOrder): string {
  return formatOrderCode(order.order_code);
}

export function getOrderNumber(order: CustomerOrder): number {
  return order.order_number;
}
