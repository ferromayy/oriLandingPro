import { NextResponse } from "next/server";
import { requireSuperAdminApi } from "@/lib/auth/api-guard";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Diagnóstico del admin (requiere sesión). Útil para depurar errores en Vercel. */
export async function GET() {
  const denied = await requireSuperAdminApi();
  if (denied) return denied;

  const checks: Record<string, string> = {
    supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "ok" : "falta",
    service_role_key: process.env.SUPABASE_SERVICE_ROLE_KEY ? "ok" : "falta",
    superadmin_email: process.env.SUPERADMIN_EMAIL ? "ok" : "falta",
    superadmin_secret: process.env.SUPERADMIN_SESSION_SECRET ? "ok" : "falta",
  };

  try {
    const supabase = createAdminClient();

    const notes = await supabase
      .from("education_notes")
      .select("id, source, nombre")
      .limit(1);
    checks.education_notes = notes.error?.message ?? "ok";

    const images = await supabase
      .from("education_note_images")
      .select("id, is_primary")
      .limit(1);
    checks.education_note_images = images.error?.message ?? "ok";
  } catch (err) {
    checks.supabase_client =
      err instanceof Error ? err.message : "error al conectar";
  }

  const healthy = Object.values(checks).every((value) => value === "ok");

  return NextResponse.json({
    ok: healthy,
    checks,
    hint: healthy
      ? "Todo OK en servidor y Supabase."
      : "Corregí lo que no dice 'ok' (env en Vercel o migraciones 017–018 en Supabase).",
  });
}
