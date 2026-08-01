import { describe, expect, it } from "vitest";
import { createOrderSchema } from "@/lib/orders/schema";
import {
  addItemToOrderTicket,
  computeOrderTotal,
  getOrderTicketLineKey,
  withOrderItemQuantity,
} from "@/lib/orders/helpers";
import { resolveOrderSource } from "@/lib/orders/types";
import type { CustomerOrderItem } from "@/lib/orders/types";

const COFFEE_A = "11111111-1111-4111-8111-111111111111";
const COFFEE_B = "22222222-2222-4222-8222-222222222222";

function line(
  overrides: Partial<CustomerOrderItem> &
    Pick<CustomerOrderItem, "coffee_id" | "name" | "size_grams" | "unit_price">,
): CustomerOrderItem {
  const quantity = overrides.quantity ?? 1;
  const unit_price = overrides.unit_price;
  return {
    codename: overrides.codename ?? "ORI-01",
    grind: overrides.grind ?? "Café en grano",
    quantity,
    line_total: overrides.line_total ?? unit_price * quantity,
    ...overrides,
    unit_price,
  };
}

describe("comanda de pedido staff (Take Order)", () => {
  it("fusiona el mismo café/tamaño/molienda sumando cantidades", () => {
    const first = line({
      coffee_id: COFFEE_A,
      name: "Brasil Natural",
      size_grams: 250,
      unit_price: 10000,
      quantity: 1,
    });
    const second = line({
      coffee_id: COFFEE_A,
      name: "Brasil Natural",
      size_grams: 250,
      unit_price: 10000,
      quantity: 2,
    });

    const ticket = addItemToOrderTicket(addItemToOrderTicket([], first), second);

    expect(ticket).toHaveLength(1);
    expect(ticket[0]?.quantity).toBe(3);
    expect(ticket[0]?.line_total).toBe(30000);
    expect(getOrderTicketLineKey(ticket[0]!)).toBe(
      `${COFFEE_A}-250-Café en grano`,
    );
  });

  it("mantiene líneas separadas si cambia tamaño o molienda", () => {
    const base = line({
      coffee_id: COFFEE_A,
      name: "Brasil Natural",
      size_grams: 250,
      unit_price: 10000,
    });
    const otherSize = line({
      coffee_id: COFFEE_A,
      name: "Brasil Natural",
      size_grams: 500,
      unit_price: 18000,
    });
    const otherGrind = line({
      coffee_id: COFFEE_A,
      name: "Brasil Natural",
      size_grams: 250,
      unit_price: 10000,
      grind: "Espresso",
    });
    const otherCoffee = line({
      coffee_id: COFFEE_B,
      name: "Colombia Honey",
      size_grams: 250,
      unit_price: 12000,
      codename: "ORI-02",
    });

    const ticket = [base, otherSize, otherGrind, otherCoffee].reduce(
      (acc, item) => addItemToOrderTicket(acc, item),
      [] as CustomerOrderItem[],
    );

    expect(ticket).toHaveLength(4);
    expect(computeOrderTotal(ticket)).toBe(10000 + 18000 + 10000 + 12000);
  });

  it("recalcula subtotal al cambiar cantidad y arma un payload válido", () => {
    const item = line({
      coffee_id: COFFEE_A,
      name: "Brasil Natural",
      size_grams: 250,
      unit_price: 10000,
      quantity: 1,
    });
    const updated = withOrderItemQuantity(item, 4);
    const ticket = [updated];
    const total = computeOrderTotal(ticket);

    expect(updated.line_total).toBe(40000);
    expect(total).toBe(40000);

    const parsed = createOrderSchema.safeParse({ items: ticket, total });
    expect(parsed.success).toBe(true);
  });

  it("rechaza un pedido cuyo total no coincide (como haría el API admin)", () => {
    const item = line({
      coffee_id: COFFEE_A,
      name: "Brasil Natural",
      size_grams: 250,
      unit_price: 10000,
      quantity: 2,
    });

    const parsed = createOrderSchema.safeParse({
      items: [item],
      total: 999,
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues.some((issue) => issue.path.includes("total"))).toBe(
        true,
      );
    }
  });

  it("acepta source staff en el payload de creación", () => {
    const item = line({
      coffee_id: COFFEE_A,
      name: "Brasil Natural",
      size_grams: 250,
      unit_price: 10000,
      quantity: 1,
    });

    const parsed = createOrderSchema.safeParse({
      items: [item],
      total: 10000,
      source: "staff",
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.source).toBe("staff");
    }
  });

  it("detecta pedido de operario por marcador aunque no exista columna source", () => {
    expect(resolveOrderSource(undefined, "[Cargado por operario Orí]\n\n☕ PEDIDO")).toBe(
      "staff",
    );
    expect(resolveOrderSource("whatsapp", "☕ PEDIDO DE CAFÉ")).toBe("whatsapp");
    expect(resolveOrderSource("staff", "☕ PEDIDO DE CAFÉ")).toBe("staff");
  });

  it("rechaza un pedido vacío", () => {
    const parsed = createOrderSchema.safeParse({ items: [], total: 0 });
    expect(parsed.success).toBe(false);
  });
});
