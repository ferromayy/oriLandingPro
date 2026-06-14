export const IMAGE_UPLOAD_ACCEPT =
  "image/*,.heic,.heif,image/heic,image/heif";

const HEIC_MIME_TYPES = new Set([
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/heif-sequence",
]);

const HEIC_EXTENSIONS = new Set(["heic", "heif"]);

function fileExtension(file: File): string {
  return file.name.split(".").pop()?.toLowerCase() ?? "";
}

export function isHeicImage(file: File): boolean {
  const mime = file.type.toLowerCase();
  const ext = fileExtension(file);
  return HEIC_MIME_TYPES.has(mime) || HEIC_EXTENSIONS.has(ext);
}

export function isAllowedImageUpload(file: File): boolean {
  if (file.type.startsWith("image/")) return true;
  return isHeicImage(file);
}
