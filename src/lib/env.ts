import { z } from "zod";

export type ClientEnv = {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: string;
};

function readPublishableKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

function readSecretKey(): string | undefined {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY
  );
}

const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
});

const serverEnvSchema = clientEnvSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
});

function formatEnvError(error: z.ZodError): string {
  const missing = error.issues.map((issue) => issue.path.join(".")).join(", ");
  return `Variables de entorno inválidas o faltantes: ${missing}. Revisa .env.local (URL + NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY).`;
}

function parseClientEnv() {
  return clientEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: readPublishableKey(),
  });
}

/** Variables públicas (browser + server). */
export function getClientEnv(): ClientEnv {
  const parsed = parseClientEnv();

  if (!parsed.success) {
    throw new Error(formatEnvError(parsed.error));
  }

  return parsed.data;
}

/** Variables del servidor (incluye secret key opcional). */
export function getServerEnv() {
  const parsed = serverEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: readPublishableKey(),
    SUPABASE_SERVICE_ROLE_KEY: readSecretKey(),
  });

  if (!parsed.success) {
    throw new Error(formatEnvError(parsed.error));
  }

  return parsed.data;
}

/** Comprueba si las variables mínimas están definidas (sin lanzar en build sin .env). */
export function hasSupabaseEnv(): boolean {
  return parseClientEnv().success;
}

const superAdminEnvSchema = z.object({
  SUPERADMIN_EMAIL: z.string().email(),
  SUPERADMIN_PASSWORD: z.string().min(8),
  SUPERADMIN_SESSION_SECRET: z.string().min(32),
});

export type SuperAdminEnv = {
  email: string;
  password: string;
  sessionSecret: string;
};

function parseSuperAdminEnv() {
  return superAdminEnvSchema.safeParse({
    SUPERADMIN_EMAIL: process.env.SUPERADMIN_EMAIL,
    SUPERADMIN_PASSWORD: process.env.SUPERADMIN_PASSWORD,
    SUPERADMIN_SESSION_SECRET: process.env.SUPERADMIN_SESSION_SECRET,
  });
}

function formatSuperAdminEnvError(error: z.ZodError): string {
  const missing = error.issues.map((issue) => issue.path.join(".")).join(", ");
  return `Variables de superadmin inválidas o faltantes: ${missing}. Añádelas en .env.local (ver .env.local.example).`;
}

/** Credenciales y secreto de sesión del superadmin (solo servidor). */
export function getSuperAdminEnv(): SuperAdminEnv {
  const parsed = parseSuperAdminEnv();

  if (!parsed.success) {
    throw new Error(formatSuperAdminEnvError(parsed.error));
  }

  const { SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD, SUPERADMIN_SESSION_SECRET } =
    parsed.data;

  return {
    email: SUPERADMIN_EMAIL,
    password: SUPERADMIN_PASSWORD,
    sessionSecret: SUPERADMIN_SESSION_SECRET,
  };
}

export function hasSuperAdminEnv(): boolean {
  return parseSuperAdminEnv().success;
}

export function hasSecretKey(): boolean {
  return Boolean(readSecretKey());
}
