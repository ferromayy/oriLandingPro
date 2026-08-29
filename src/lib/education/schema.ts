import { z } from "zod";
import {
  MAX_EDUCATION_PRIMARY_IMAGES,
  MAX_EDUCATION_NOTE_IMAGES,
} from "@/lib/education/types";
import {
  MAX_EDUCATION_PARAGRAPHS,
  MAX_IMAGES_PER_PARAGRAPH,
  MIN_EDUCATION_PARAGRAPHS,
} from "@/lib/education/blocks";
import {
  EDUCATION_SECTIONS,
  isReservedEducationSlug,
} from "@/lib/education/sections";

const educationNoteImageSchema = z.object({
  url: z.string().trim().min(1, "URL de imagen inválida"),
  sort_order: z.number().int().min(0),
  is_primary: z.boolean().optional().default(false),
  is_inline: z.boolean().optional().default(false),
});

const educationContentBlockSchema = z.object({
  text: z.string().default(""),
  images: z
    .array(z.string().trim().min(1))
    .max(
      MAX_IMAGES_PER_PARAGRAPH,
      `Máximo ${MAX_IMAGES_PER_PARAGRAPH} imágenes por párrafo`,
    )
    .default([]),
});

export const educationNoteFormSchema = z
  .object({
    title: z.string().trim().min(1, "El título es obligatorio"),
    slug: z
      .string()
      .trim()
      .min(1, "El slug es obligatorio")
      .regex(
        /^[a-z0-9-]+$/,
        "El slug solo puede tener minúsculas, números y guiones",
      ),
    section: z.enum(
      EDUCATION_SECTIONS as unknown as [
        (typeof EDUCATION_SECTIONS)[number],
        ...(typeof EDUCATION_SECTIONS)[number][],
      ],
    ),
    content_blocks: z
      .array(educationContentBlockSchema)
      .min(MIN_EDUCATION_PARAGRAPHS, "Agregá al menos un párrafo")
      .max(
        MAX_EDUCATION_PARAGRAPHS,
        `Máximo ${MAX_EDUCATION_PARAGRAPHS} párrafos por nota`,
      ),
    source: z.string().trim().max(500, "La fuente es demasiado larga").default(""),
    nombre: z.string().trim().max(200, "El nombre es demasiado largo").default(""),
    images: z
      .array(educationNoteImageSchema)
      .max(
        MAX_EDUCATION_NOTE_IMAGES,
        `Máximo ${MAX_EDUCATION_PRIMARY_IMAGES} imagen principal`,
      )
      .default([]),
    is_active: z.boolean(),
    sort_order: z.number().int().min(0, "El orden debe ser 0 o mayor"),
  })
  .superRefine((data, ctx) => {
    if (isReservedEducationSlug(data.slug)) {
      ctx.addIssue({
        code: "custom",
        message: `El slug “${data.slug}” está reservado para las secciones de Educación`,
        path: ["slug"],
      });
    }

    const primaryCount = data.images.filter((image) => image.is_primary).length;
    if (primaryCount > 1) {
      ctx.addIssue({
        code: "custom",
        message: "Solo puede haber una imagen principal",
        path: ["images"],
      });
    }

    const hasText = data.content_blocks.some((block) => block.text.trim().length > 0);
    if (!hasText) {
      ctx.addIssue({
        code: "custom",
        message: "Escribí al menos un párrafo con texto",
        path: ["content_blocks"],
      });
    }

    data.content_blocks.forEach((block, index) => {
      if (!block.text.trim() && block.images.length === 0) {
        ctx.addIssue({
          code: "custom",
          message: `El párrafo ${index + 1} está vacío: agregá texto o imágenes`,
          path: ["content_blocks", String(index)],
        });
      }
    });
  });

export type FormValidationIssue = {
  field: string;
  message: string;
};

export function validateEducationNoteForm(data: unknown): {
  success: true;
  data: z.infer<typeof educationNoteFormSchema>;
} | {
  success: false;
  issues: FormValidationIssue[];
} {
  const parsed = educationNoteFormSchema.safeParse(data);
  if (parsed.success) {
    return { success: true, data: parsed.data };
  }

  return {
    success: false,
    issues: parsed.error.issues.map((issue) => ({
      field: issue.path.join(".") || "form",
      message: issue.message,
    })),
  };
}
