import { z } from "zod";
import { MAX_EDUCATION_NOTE_IMAGES } from "@/lib/education/types";

const educationNoteImageSchema = z.object({
  url: z.string().trim().min(1, "URL de imagen inválida"),
  sort_order: z.number().int().min(0),
  is_primary: z.boolean(),
});

export const educationNoteFormSchema = z.object({
  title: z.string().trim().min(1, "El título es obligatorio"),
  slug: z
    .string()
    .trim()
    .min(1, "El slug es obligatorio")
    .regex(
      /^[a-z0-9-]+$/,
      "El slug solo puede tener minúsculas, números y guiones",
    ),
  content: z.string().trim().min(1, "El contenido es obligatorio"),
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
