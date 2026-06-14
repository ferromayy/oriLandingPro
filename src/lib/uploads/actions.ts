"use server";

import { getSuperAdminSession } from "@/lib/auth/server";
import { uploadCoffeeImageAdmin } from "@/lib/coffees/admin";
import { isAllowedImageUpload } from "@/lib/uploads/image-types";

export type UploadImageResult =
  | { ok: true; url: string }
  | { ok: false; message: string };

export async function uploadAdminImageAction(
  formData: FormData,
): Promise<UploadImageResult> {
  const session = await getSuperAdminSession();
  if (!session) {
    return { ok: false, message: "Sesión expirada. Volvé a iniciar sesión en el admin." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Archivo de imagen requerido" };
  }

  if (!isAllowedImageUpload(file)) {
    return {
      ok: false,
      message: "Solo se permiten imágenes (JPG, PNG, WebP, HEIC…)",
    };
  }

  if (file.size > 4 * 1024 * 1024) {
    return {
      ok: false,
      message: "La imagen supera 4 MB. Usá JPG o reducí el tamaño.",
    };
  }

  try {
    const url = await uploadCoffeeImageAdmin(file);
    return { ok: true, url };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al subir imagen";
    return { ok: false, message };
  }
}
