import { compressImageForUpload } from "@/lib/uploads/compress-client";

export type ClientUploadResult =
  | { ok: true; url: string }
  | { ok: false; message: string };

const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;

/**
 * Sube una imagen por la API admin (evita el bodySizeLimit de Server Actions).
 */
export async function uploadAdminImageClient(file: File): Promise<ClientUploadResult> {
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Archivo de imagen requerido" };
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return {
      ok: false,
      message: "La imagen supera 12 MB. Reducila o exportala como JPG más liviano.",
    };
  }

  const prepared = await compressImageForUpload(file);
  const body = new FormData();
  body.set("file", prepared);

  const res = await fetch("/api/admin/upload", {
    method: "POST",
    body,
  });

  let data: { ok?: boolean; url?: string; message?: string } = {};
  try {
    data = await res.json();
  } catch {
    return {
      ok: false,
      message:
        res.status === 413
          ? "La imagen es demasiado grande para subir."
          : "No se pudo subir la imagen",
    };
  }

  if (!res.ok || !data.ok || !data.url) {
    return {
      ok: false,
      message: data.message ?? "No se pudo subir la imagen",
    };
  }

  return { ok: true, url: data.url };
}
