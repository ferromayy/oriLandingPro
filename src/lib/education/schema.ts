import { z } from "zod";
import {
  MAX_EDUCATION_FOOTER_IMAGES,
  MAX_EDUCATION_NOTE_IMAGES,
  MIN_EDUCATION_FOOTER_IMAGES,
} from "@/lib/education/types";

const educationNoteImageSchema = z.object({
  url: z.string().trim().min(1, "URL de imagen inválida"),
  sort_order: z.number().int().min(0),
  is_primary: z.boolean().optional().default(false),
  is_inline: z.boolean().optional().default(false),
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
    content_before_image: z.string().trim().default(""),
    content_after_image: z.string().trim().default(""),
    source: z.string().trim().max(500, "La fuente es demasiado larga").default(""),
    nombre: z.string().trim().max(200, "El nombre es demasiado largo").default(""),
    images: z
      .array(educationNoteImageSchema)
      .max(
        MAX_EDUCATION_NOTE_IMAGES,
        `Máximo ${MAX_EDUCATION_NOTE_IMAGES} imágenes por nota`,
      )
      .default([]),
    is_active: z.boolean(),
    sort_order: z.number().int().min(0, "El orden debe ser 0 o mayor"),
  })
  .superRefine((data, ctx) => {
    const primaryCount = data.images.filter((image) => image.is_primary).length;
    const inlineCount = data.images.filter(
      (image) => image.is_inline && !image.is_primary,
    ).length;
    const footerCount = data.images.filter(
      (image) => !image.is_primary && !image.is_inline,
    ).length;

    if (primaryCount > 1) {
      ctx.addIssue({
        code: "custom",
        message: "Solo puede haber una imagen principal",
        path: ["images"],
      });
    }

    if (inlineCount > 1) {
      ctx.addIssue({
        code: "custom",
        message: "Solo puede haber una imagen al medio del texto",
        path: ["images"],
      });
    }

    if (data.images.some((image) => image.is_primary && image.is_inline)) {
      ctx.addIssue({
        code: "custom",
        message: "La imagen principal no puede ser también la del medio",
        path: ["images"],
      });
    }

    if (footerCount > MAX_EDUCATION_FOOTER_IMAGES) {
      ctx.addIssue({
        code: "custom",
        message: `Máximo ${MAX_EDUCATION_FOOTER_IMAGES} imágenes al final`,
        path: ["images"],
      });
    }

    if (inlineCount > 0 && footerCount < MIN_EDUCATION_FOOTER_IMAGES) {
      ctx.addIssue({
        code: "custom",
        message: `Con imagen al medio necesitás al menos ${MIN_EDUCATION_FOOTER_IMAGES} imágenes al final`,
        path: ["images"],
      });
    }

    const hasContent =
      data.content_before_image.trim().length > 0 ||
      data.content_after_image.trim().length > 0;

    if (!hasContent) {
      ctx.addIssue({
        code: "custom",
        message: "Escribí al menos texto en la parte superior o inferior",
        path: ["content_before_image"],
      });
    }

    if (inlineCount > 0 && !data.content_before_image.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Con imagen al medio, la parte superior del texto es obligatoria",
        path: ["content_before_image"],
      });
    }
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
