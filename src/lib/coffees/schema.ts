import { z } from "zod";

export const coffeeFormSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  slug: z
    .string()
    .min(1, "El slug es obligatorio")
    .regex(/^[a-z0-9-]+$/, "Slug inválido (solo minúsculas, números y guiones)"),
  codename: z.string().optional().default(""),
  tasting_notes: z.string().min(1, "Las notas de cata son obligatorias"),
  description: z.string().optional().default(""),
  price_250g: z.coerce.number().int().min(0),
  price_1000g: z
    .union([z.coerce.number().int().min(0), z.literal(""), z.null()])
    .optional()
    .transform((v) => (v === "" || v === undefined ? null : v)),
  image_url: z.string().optional().default(""),
  sold_out: z.coerce.boolean().optional().default(false),
  is_active: z.coerce.boolean().optional().default(true),
  sort_order: z.coerce.number().int().optional().default(0),
});

export type CoffeeFormInput = z.infer<typeof coffeeFormSchema>;
