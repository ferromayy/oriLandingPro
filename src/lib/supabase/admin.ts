import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getServerEnv } from "@/lib/env";

/**
 * Cliente con service role: solo en Route Handlers / Server Actions.
 * Bypasea RLS — nunca exponer al cliente ni importar en componentes "use client".
 */
export function createAdminClient() {
  const env = getServerEnv();

  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "Falta la secret key de Supabase. Añade SUPABASE_SERVICE_ROLE_KEY (o SUPABASE_SECRET_KEY) en .env.local — Supabase → Project Settings → API → secret key.",
    );
  }

  return createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
