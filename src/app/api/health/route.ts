import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";

export async function GET() {
  if (!hasSupabaseEnv()) {
    return NextResponse.json(
      {
        ok: false,
        supabase: "not_configured",
        message:
          "Faltan NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY en .env.local",
      },
      { status: 503 },
    );
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.getSession();

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          supabase: "error",
          message: error.message,
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      supabase: "connected",
      message: "Cliente Supabase inicializado correctamente",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json(
      {
        ok: false,
        supabase: "error",
        message,
      },
      { status: 500 },
    );
  }
}
