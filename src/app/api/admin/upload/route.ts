import { NextResponse } from "next/server";
import { requireSuperAdminApi } from "@/lib/auth/api-guard";
import { uploadCoffeeImageAdmin } from "@/lib/coffees/admin";
import { isAllowedImageUpload } from "@/lib/uploads/image-types";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;

export async function POST(request: Request) {
  const denied = await requireSuperAdminApi();
  if (denied) return denied;

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { ok: false, message: "Archivo de imagen requerido" },
        { status: 400 },
      );
    }

    if (!isAllowedImageUpload(file)) {
      return NextResponse.json(
        { ok: false, message: "Solo se permiten imágenes (JPG, PNG, WebP, HEIC…)" },
        { status: 400 },
      );
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        {
          ok: false,
          message: "La imagen supera 12 MB. Reducila o exportala como JPG más liviano.",
        },
        { status: 413 },
      );
    }

    const url = await uploadCoffeeImageAdmin(file);
    return NextResponse.json({ ok: true, url });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al subir imagen";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
