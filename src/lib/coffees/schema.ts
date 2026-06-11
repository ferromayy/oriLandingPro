import { isValidExtendedContentUrl } from "@/lib/coffees/extended-content";
import { z } from "zod";
import {
  COFFEE_SIZES_GRAMS,
  MAX_COFFEE_IMAGES,
  MIN_COFFEE_IMAGES,
} from "@/types/database";
import type { CoffeeFormData } from "@/lib/coffees/types";

const imageSchema = z.object({
  url: z.string().min(1),
  sort_order: z.coerce.number().int().min(0),
  is_primary: z.coerce.boolean(),
});

const variantSchema = z.object({
  size_grams: z.coerce
    .number()
    .int()
    .refine(
      (v): v is (typeof COFFEE_SIZES_GRAMS)[number] =>
        COFFEE_SIZES_GRAMS.includes(v as (typeof COFFEE_SIZES_GRAMS)[number]),
    ),
  price: z.coerce.number().int().min(0),
  is_available: z.coerce.boolean(),
});

export const coffeeFormSchema = z
  .object({
    name: z.string().min(1, "El nombre es obligatorio"),
    slug: z
      .string()
      .min(1, "El slug es obligatorio")
      .regex(/^[a-z0-9-]+$/, "El slug solo puede tener minúsculas, números y guiones"),
    codename: z.string().optional().default(""),
    tasting_notes: z.string().min(1, "Las notas de cata son obligatorias"),
    short_description: z
      .string()
      .min(1, "La descripción corta es obligatoria (se muestra en el detalle del producto)"),
    long_description: z.string().optional().default(""),
    extended_content_url: z
      .string()
      .optional()
      .default("")
      .refine(isValidExtendedContentUrl, {
        message:
          "La URL debe apuntar a una nota de Educación (ej. /educacion/metodos-de-filtrado)",
      }),
    origin: z.string().optional().default(""),
    varietal: z.string().optional().default(""),
    beneficio: z.string().optional().default(""),
    altitude: z.string().optional().default(""),
    images: z
      .array(imageSchema)
      .min(
        MIN_COFFEE_IMAGES,
        `Subí al menos ${MIN_COFFEE_IMAGES} fotos (tenés que marcar una como principal)`,
      )
      .max(MAX_COFFEE_IMAGES, `Máximo ${MAX_COFFEE_IMAGES} fotos por café`),
    variants: z
      .array(variantSchema)
      .length(
        COFFEE_SIZES_GRAMS.length,
        "Faltan tamaños: 150g, 250g, 500g o 1kg",
      ),
    is_active: z.coerce.boolean().optional().default(true),
    sort_order: z.coerce.number().int().optional().default(0),
  })
  .superRefine((data, ctx) => {
    const primaryCount = data.images.filter((img) => img.is_primary).length;
    if (data.images.length > 0 && primaryCount !== 1) {
      ctx.addIssue({
        code: "custom",
        message: "Seleccioná exactamente una foto como principal",
        path: ["images"],
      });
    }

    for (const variant of data.variants) {
      if (variant.is_available && variant.price <= 0) {
        ctx.addIssue({
          code: "custom",
          message: `El tamaño ${variant.size_grams}g está en stock pero no tiene precio`,
          path: ["variants", String(variant.size_grams)],
        });
      }
    }
  });

export type CoffeeFormInput = z.infer<typeof coffeeFormSchema>;

export type FormSection = "general" | "images" | "variants";

export type FormValidationIssue = {
  field: string;
  message: string;
  section: FormSection;
};

const FIELD_SECTION: Record<string, FormSection> = {
  name: "general",
  slug: "general",
  codename: "general",
  tasting_notes: "general",
  short_description: "general",
  long_description: "general",
  extended_content_url: "general",
  sort_order: "general",
  images: "images",
  variants: "variants",
};

function resolveSection(field: string): FormSection {
  const root = field.split(".")[0];
  return FIELD_SECTION[root] ?? "general";
}

export function validateCoffeeForm(data: CoffeeFormData): FormValidationIssue[] {
  const parsed = coffeeFormSchema.safeParse(data);

  if (parsed.success) return [];

  return parsed.error.issues.map((issue) => {
    const field = issue.path.join(".") || "form";
    return {
      field,
      message: issue.message,
      section: resolveSection(field),
    };
  });
}

export function formatValidationSummary(issues: FormValidationIssue[]): string {
  if (issues.length === 0) return "";
  if (issues.length === 1) return issues[0].message;
  return `Hay ${issues.length} campos por completar o corregir`;
}
