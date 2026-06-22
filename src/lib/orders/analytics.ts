import type { CoffeeSizeGrams } from "@/types/database";
import type { CustomerOrder, CustomerOrderItem, OrderStatus } from "@/lib/orders/types";
import { formatOrderProductTitle } from "@/lib/orders/display";

export type CoffeeSalesRow = {
  coffee_id: string;
  label: string;
  orderCount: number;
  unitsSold: number;
  revenue: number;
};

export type CoffeeSizeSalesRow = {
  coffee_id: string;
  label: string;
  size_grams: CoffeeSizeGrams;
  orderCount: number;
  unitsSold: number;
  revenue: number;
};

export type SizeSalesRow = {
  size_grams: CoffeeSizeGrams;
  unitsSold: number;
  revenue: number;
};

export type OrderAnalytics = {
  orderCounts: Record<OrderStatus, number>;
  totalOrders: number;
  revenueByStatus: Record<OrderStatus, number>;
  totalRevenueAllStatuses: number;
  averageCompletedOrder: number;
  coffeeSales: CoffeeSalesRow[];
  coffeeSizeSales: CoffeeSizeSalesRow[];
  sizeSales: SizeSalesRow[];
};

function sumOrderRevenue(orders: CustomerOrder[]): number {
  return orders.reduce((sum, order) => sum + order.total, 0);
}

function aggregateCoffeeSales(orders: CustomerOrder[]): CoffeeSalesRow[] {
  const byCoffee = new Map<
    string,
    { label: string; orderIds: Set<string>; unitsSold: number; revenue: number }
  >();

  for (const order of orders) {
    for (const item of order.items) {
      const key = item.coffee_id || item.name;
      const existing = byCoffee.get(key) ?? {
        label: formatOrderProductTitle(item),
        orderIds: new Set<string>(),
        unitsSold: 0,
        revenue: 0,
      };

      existing.orderIds.add(order.id);
      existing.unitsSold += item.quantity;
      existing.revenue += item.line_total;
      byCoffee.set(key, existing);
    }
  }

  return [...byCoffee.entries()]
    .map(([coffee_id, row]) => ({
      coffee_id,
      label: row.label,
      orderCount: row.orderIds.size,
      unitsSold: row.unitsSold,
      revenue: row.revenue,
    }))
    .sort((a, b) => b.revenue - a.revenue || b.unitsSold - a.unitsSold);
}

function aggregateCoffeeSizeSales(orders: CustomerOrder[]): CoffeeSizeSalesRow[] {
  const byCoffeeSize = new Map<
    string,
    {
      coffee_id: string;
      label: string;
      size_grams: CoffeeSizeGrams;
      orderIds: Set<string>;
      unitsSold: number;
      revenue: number;
    }
  >();

  for (const order of orders) {
    for (const item of order.items) {
      const coffeeKey = item.coffee_id || item.name;
      const key = `${coffeeKey}:${item.size_grams}`;
      const existing = byCoffeeSize.get(key) ?? {
        coffee_id: coffeeKey,
        label: formatOrderProductTitle(item),
        size_grams: item.size_grams,
        orderIds: new Set<string>(),
        unitsSold: 0,
        revenue: 0,
      };

      existing.orderIds.add(order.id);
      existing.unitsSold += item.quantity;
      existing.revenue += item.line_total;
      byCoffeeSize.set(key, existing);
    }
  }

  return [...byCoffeeSize.values()]
    .map((row) => ({
      coffee_id: row.coffee_id,
      label: row.label,
      size_grams: row.size_grams,
      orderCount: row.orderIds.size,
      unitsSold: row.unitsSold,
      revenue: row.revenue,
    }))
    .sort(
      (a, b) =>
        a.label.localeCompare(b.label, "es") ||
        a.size_grams - b.size_grams ||
        b.revenue - a.revenue,
    );
}

function aggregateSizeSales(items: CustomerOrderItem[]): SizeSalesRow[] {
  const bySize = new Map<CoffeeSizeGrams, { unitsSold: number; revenue: number }>();

  for (const item of items) {
    const existing = bySize.get(item.size_grams) ?? { unitsSold: 0, revenue: 0 };
    existing.unitsSold += item.quantity;
    existing.revenue += item.line_total;
    bySize.set(item.size_grams, existing);
  }

  return [...bySize.entries()]
    .map(([size_grams, row]) => ({
      size_grams,
      unitsSold: row.unitsSold,
      revenue: row.revenue,
    }))
    .sort((a, b) => a.size_grams - b.size_grams);
}

export function computeOrderAnalytics(orders: CustomerOrder[]): OrderAnalytics {
  const byStatus = {
    pending: orders.filter((order) => order.status === "pending"),
    completed: orders.filter((order) => order.status === "completed"),
    cancelled: orders.filter((order) => order.status === "cancelled"),
  };

  const orderCounts = {
    pending: byStatus.pending.length,
    completed: byStatus.completed.length,
    cancelled: byStatus.cancelled.length,
  };

  const revenueByStatus = {
    pending: sumOrderRevenue(byStatus.pending),
    completed: sumOrderRevenue(byStatus.completed),
    cancelled: sumOrderRevenue(byStatus.cancelled),
  };

  const completedItems = byStatus.completed.flatMap((order) => order.items);

  return {
    orderCounts,
    totalOrders: orders.length,
    revenueByStatus,
    totalRevenueAllStatuses: sumOrderRevenue(orders),
    averageCompletedOrder:
      byStatus.completed.length > 0
        ? Math.round(revenueByStatus.completed / byStatus.completed.length)
        : 0,
    coffeeSales: aggregateCoffeeSales(byStatus.completed),
    coffeeSizeSales: aggregateCoffeeSizeSales(byStatus.completed),
    sizeSales: aggregateSizeSales(completedItems),
  };
}
