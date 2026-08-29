import { isHeicImage } from "@/lib/uploads/image-types";

export type PreparedImageUpload = {
  buffer: Buffer;
  contentType: string;
  extension: string;
};

function fileExtension(file: File): string {
  return file.name.split(".").pop()?.toLowerCase() ?? "";
}

async function optimizeWithSharp(buffer: Buffer): Promise<PreparedImageUpload> {
  const { default: sharp } = await import("sharp");
  const jpeg = await sharp(buffer)
    .rotate()
    .resize({
      width: 2000,
      height: 2000,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer();

  return {
    buffer: jpeg,
    contentType: "image/jpeg",
    extension: "jpg",
  };
}

export async function prepareImageUpload(file: File): Promise<PreparedImageUpload> {
  const buffer = Buffer.from(await file.arrayBuffer());

  if (isHeicImage(file)) {
    try {
      return await optimizeWithSharp(buffer);
    } catch {
      throw new Error(
        "No se pudo convertir el archivo HEIC. Exportalo como JPG desde Fotos e intentá de nuevo.",
      );
    }
  }

  // JPG/PNG/WebP grandes: achicar en servidor también.
  if (buffer.length > 1.2 * 1024 * 1024 || file.type === "image/png") {
    try {
      return await optimizeWithSharp(buffer);
    } catch {
      // Si sharp falla, seguimos con el archivo original.
    }
  }

  const extension = fileExtension(file) || "jpg";
  return {
    buffer,
    contentType: file.type || "image/jpeg",
    extension,
  };
}
