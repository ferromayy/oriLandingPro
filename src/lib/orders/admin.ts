import { createAdminClient } from "@/lib/supabase/admin";
import type { CreateOrderInput, UpdateOrderItemsInput } from "@/lib/orders/schema";
import type { CustomerOrder, OrderStatus } from "@/lib/orders/types";
import type { CustomerOrderInsert } from "@/types/database";
import {
  legacyOrderCodeFromNumber,
  ORDER_CODE_START,
  resolveOrderSource,
  withStaffOrderMarker,
} from "@/lib/orders/types";
import { buildWhatsAppOrderMessage } from "@/lib/site/whatsapp-order";

function normalizeOrder(raw: CustomerOrder): CustomerOrder {
  const orderNumber = raw.order_number;
  const orderCode =
    raw.order_code ?? legacyOrderCodeFromNumber(orderNumber);

  return {
    ...raw,
    order_number: orderNumber,
    order_code: orderCode,
    status: raw.status ?? "pending",
    source: resolveOrderSource(raw.source, raw.whatsapp_message),
    items: Array.isArray(raw.items) ? raw.items : [],
  };
}

function isMissingColumnError(error: { message?: string } | null, column: string): boolean {
  const message = error?.message?.toLowerCase() ?? "";
  if (!message.includes(column.toLowerCase())) return false;
  return (
    message.includes("schema cache") ||
    message.includes("does not exist") ||
    message.includes("could not find")
  );
}

function finalizeWhatsAppMessage(
  message: string,
  source: CreateOrderInput["source"],
): string {
  return source === "staff" ? withStaffOrderMarker(message) : message;
}

type OrderSlots =
  | { legacySchema: true }
  | { legacySchema: false; order_number: number; order_code: number };

async function getNextOrderSlots(): Promise<OrderSlots> {
  const supabase = createAdminClient();

  const { data: codeRow, error: codeError } = await supabase
    .from("customer_orders")
    .select("order_code")
    .order("order_code", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (isMissingColumnError(codeError, "order_code")) {
    return { legacySchema: true };
  }

  if (codeError) throw new Error(codeError.message);

  const { data: numberRow, error: numberError } = await supabase
    .from("customer_orders")
    .select("order_number")
    .order("order_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (numberError) throw new Error(numberError.message);

  return {
    legacySchema: false,
    order_number: (numberRow?.order_number ?? 0) + 1,
    order_code: (codeRow?.order_code ?? ORDER_CODE_START - 1) + 1,
  };
}

export async function getAllCustomerOrdersAdmin(): Promise<CustomerOrder[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("customer_orders")
    .select("*")
    .order("order_number", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => normalizeOrder(row as CustomerOrder));
}

export async function createCustomerOrder(
  input: CreateOrderInput,
): Promise<CustomerOrder> {
  const supabase = createAdminClient();
  const slots = await getNextOrderSlots();
  const source = input.source ?? "whatsapp";
  const whatsappItems = input.items.map((item) => ({
    codename: item.codename ?? null,
    name: item.name,
    sizeGrams: item.size_grams,
    grind: item.grind,
    quantity: item.quantity,
    price: item.unit_price,
  }));

  const placeholderMessage = finalizeWhatsAppMessage(
    buildWhatsAppOrderMessage(whatsappItems, input.total, "…"),
    source,
  );

  const insertPayload: CustomerOrderInsert = slots.legacySchema
    ? {
        items: input.items,
        total: input.total,
        whatsapp_message: placeholderMessage,
        source,
      }
    : {
        order_number: slots.order_number,
        order_code: slots.order_code,
        items: input.items,
        total: input.total,
        whatsapp_message: placeholderMessage,
        source,
      };

  const { data, error } = await supabase
    .from("customer_orders")
    .insert(insertPayload)
    .select("*")
    .single();

  if (error) {
    if (!slots.legacySchema && isMissingColumnError(error, "order_code")) {
      throw new Error(
        "Falta la columna order_code en Supabase. Ejecutá la migración 014_customer_orders_production_catch_up.sql en el SQL Editor.",
      );
    }
    if (isMissingColumnError(error, "source")) {
      const { source: _source, ...withoutSource } = insertPayload;
      const retry = await supabase
        .from("customer_orders")
        .insert(withoutSource)
        .select("*")
        .single();
      if (retry.error) throw new Error(retry.error.message);
      const order = normalizeOrder({
        ...(retry.data as CustomerOrder),
        source: "staff",
      });
      const whatsapp_message = finalizeWhatsAppMessage(
        buildWhatsAppOrderMessage(whatsappItems, input.total, order.order_code),
        source,
      );
      const { data: updated, error: updateError } = await supabase
        .from("customer_orders")
        .update({ whatsapp_message })
        .eq("id", order.id)
        .select("*")
        .single();
      if (updateError) throw new Error(updateError.message);
      return normalizeOrder({
        ...(updated as CustomerOrder),
        source,
      });
    }
    throw new Error(error.message);
  }

  const order = normalizeOrder(data as CustomerOrder);
  const whatsapp_message = finalizeWhatsAppMessage(
    buildWhatsAppOrderMessage(whatsappItems, input.total, order.order_code),
    source,
  );

  const { data: updated, error: updateError } = await supabase
    .from("customer_orders")
    .update({ whatsapp_message })
    .eq("id", order.id)
    .select("*")
    .single();

  if (updateError) throw new Error(updateError.message);
  return normalizeOrder({
    ...(updated as CustomerOrder),
    source,
  });
}

export async function updateCustomerOrderStatusAdmin(
  orderId: string,
  status: OrderStatus,
): Promise<CustomerOrder> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("customer_orders")
    .update({ status })
    .eq("id", orderId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return normalizeOrder(data as CustomerOrder);
}

export async function updateCustomerOrderItemsAdmin(
  orderId: string,
  input: UpdateOrderItemsInput,
): Promise<CustomerOrder> {
  const supabase = createAdminClient();

  const { data: existing, error: fetchError } = await supabase
    .from("customer_orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (fetchError) throw new Error(fetchError.message);

  const order = normalizeOrder(existing as CustomerOrder);
  const whatsappItems = input.items.map((item) => ({
    codename: item.codename ?? null,
    name: item.name,
    sizeGrams: item.size_grams,
    grind: item.grind,
    quantity: item.quantity,
    price: item.unit_price,
  }));
  const whatsapp_message = buildWhatsAppOrderMessage(
    whatsappItems,
    input.total,
    order.order_code,
  );

  const { data, error } = await supabase
    .from("customer_orders")
    .update({
      items: input.items,
      total: input.total,
      whatsapp_message,
    })
    .eq("id", orderId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return normalizeOrder(data as CustomerOrder);
}

export async function deleteCustomerOrderAdmin(orderId: string): Promise<void> {
  const supabase = createAdminClient();

  const { data: order, error: fetchError } = await supabase
    .from("customer_orders")
    .select("order_number")
    .eq("id", orderId)
    .single();

  if (fetchError) throw new Error(fetchError.message);

  const deletedNumber = order.order_number;

  const { error: deleteError } = await supabase
    .from("customer_orders")
    .delete()
    .eq("id", orderId);

  if (deleteError) throw new Error(deleteError.message);

  const { data: toRenumber, error: listError } = await supabase
    .from("customer_orders")
    .select("id, order_number")
    .gt("order_number", deletedNumber)
    .order("order_number", { ascending: false });

  if (listError) throw new Error(listError.message);

  for (const row of toRenumber ?? []) {
    const { error: renumberError } = await supabase
      .from("customer_orders")
      .update({ order_number: row.order_number - 1 })
      .eq("id", row.id);

    if (renumberError) throw new Error(renumberError.message);
  }
}
