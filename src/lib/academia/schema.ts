import { z } from "zod";
import { ACADEMIA_TEXT_MAX } from "@/lib/academia/types";

export const academiaEventFormSchema = z.object({
  image_url: z.string().trim().min(1, "La imagen es obligatoria"),
  title: z
    .string()
    .trim()
    .min(1, "El primer texto es obligatorio")
    .max(ACADEMIA_TEXT_MAX, `Máximo ${ACADEMIA_TEXT_MAX} caracteres`),
  subtitle: z
    .string()
    .trim()
    .min(1, "El segundo texto es obligatorio")
    .max(ACADEMIA_TEXT_MAX, `Máximo ${ACADEMIA_TEXT_MAX} caracteres`),
  is_active: z.boolean().optional().default(true),
  sort_order: z.coerce.number().int().min(0).optional().default(0),
});

export type FormValidationIssue = {
  field: string;
  message: string;
};

export function validateAcademiaEventForm(data: unknown):
  | { success: true; data: z.infer<typeof academiaEventFormSchema> }
  | { success: false; issues: FormValidationIssue[] } {
  const parsed = academiaEventFormSchema.safeParse(data);
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
