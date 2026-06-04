import { NextResponse } from "next/server";
import { requireSuperAdminApi } from "@/lib/auth/api-guard";
import { uploadCoffeeImageAdmin } from "@/lib/coffees/admin";

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

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { ok: false, message: "Solo se permiten imágenes" },
        { status: 400 },
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
