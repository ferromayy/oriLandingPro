import { z } from "zod";
import { GRIND_OPTIONS } from "@/lib/coffees/product-content";
import { COFFEE_SIZES_GRAMS } from "@/types/database";

const orderItemSchema = z.object({
  coffee_id: z.string().uuid(),
  name: z.string().min(1),
  codename: z.string().nullable().optional().default(null),
  size_grams: z.coerce
    .number()
    .int()
    .refine(
      (v): v is (typeof COFFEE_SIZES_GRAMS)[number] =>
        COFFEE_SIZES_GRAMS.includes(v as (typeof COFFEE_SIZES_GRAMS)[number]),
    ),
  grind: z.enum(GRIND_OPTIONS),
  quantity: z.coerce.number().int().min(1),
  unit_price: z.coerce.number().int().min(0),
  line_total: z.coerce.number().int().min(0),
});

export const createOrderSchema = z
  .object({
    items: z.array(orderItemSchema).min(1, "El pedido no tiene productos"),
    total: z.coerce.number().int().min(0),
  })
  .superRefine((data, ctx) => {
    const computedTotal = data.items.reduce((sum, item) => sum + item.line_total, 0);
    if (computedTotal !== data.total) {
      ctx.addIssue({
        code: "custom",
        message: "El total del pedido no coincide",
        path: ["total"],
      });
    }

    for (const [index, item] of data.items.entries()) {
      if (item.unit_price * item.quantity !== item.line_total) {
        ctx.addIssue({
          code: "custom",
          message: "Precio de línea inválido",
          path: ["items", index, "line_total"],
        });
      }
    }
  });

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const updateOrderStatusSchema = z.object({
  status: z.enum(["completed", "cancelled"]),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
