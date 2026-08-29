/**
 * Comprime imágenes en el navegador antes de subirlas (evita el límite de body).
 * HEIC/HEIF se deja intacto: lo convierte el servidor con sharp.
 */
export async function compressImageForUpload(file: File): Promise<File> {
  const type = (file.type || "").toLowerCase();
  const name = file.name.toLowerCase();
  const isHeic =
    type.includes("heic") ||
    type.includes("heif") ||
    name.endsWith(".heic") ||
    name.endsWith(".heif");

  if (isHeic) return file;

  // Ya es chica: no hace falta tocar.
  if (file.size <= 1.5 * 1024 * 1024 && (type === "image/jpeg" || type === "image/webp")) {
    return file;
  }

  if (typeof createImageBitmap !== "function" && typeof document === "undefined") {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const maxSide = 2000;
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }

    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.85),
    );

    if (!blob || blob.size === 0) return file;

    const baseName = file.name.replace(/\.[^.]+$/, "") || "imagen";
    return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
  } catch {
    return file;
  }
}
