import { isHeicImage } from "@/lib/uploads/image-types";

export type PreparedImageUpload = {
  buffer: Buffer;
  contentType: string;
  extension: string;
};

function fileExtension(file: File): string {
  return file.name.split(".").pop()?.toLowerCase() ?? "";
}

export async function prepareImageUpload(file: File): Promise<PreparedImageUpload> {
  const buffer = Buffer.from(await file.arrayBuffer());

  if (isHeicImage(file)) {
    try {
      const { default: sharp } = await import("sharp");
      const jpeg = await sharp(buffer).rotate().jpeg({ quality: 90 }).toBuffer();
      return {
        buffer: jpeg,
        contentType: "image/jpeg",
        extension: "jpg",
      };
    } catch {
      throw new Error(
        "No se pudo convertir el archivo HEIC. Exportalo como JPG desde Fotos e intentá de nuevo.",
      );
    }
  }

  const extension = fileExtension(file) || "jpg";
  return {
    buffer,
    contentType: file.type || "image/jpeg",
    extension,
  };
}
