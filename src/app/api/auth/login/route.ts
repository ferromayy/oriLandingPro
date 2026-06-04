import { NextResponse } from "next/server";
import { z } from "zod";
import { validateSuperAdminCredentials } from "@/lib/auth/credentials";
import { createSessionToken } from "@/lib/auth/session";
import { getSessionCookieOptions } from "@/lib/auth/cookie-options";
import { hasSuperAdminEnv } from "@/lib/env";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Cuerpo JSON inválido" },
      { status: 400 },
    );
  }

  if (!hasSuperAdminEnv()) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "Superadmin no configurado. Define SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD y SUPERADMIN_SESSION_SECRET en .env.local",
      },
      { status: 503 },
    );
  }

  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "Email y contraseña son obligatorios" },
      { status: 400 },
    );
  }

  const { email, password } = parsed.data;

  if (!validateSuperAdminCredentials(email, password)) {
    return NextResponse.json(
      { ok: false, message: "Credenciales incorrectas" },
      { status: 401 },
    );
  }

  const token = await createSessionToken();
  const cookie = getSessionCookieOptions();
  const response = NextResponse.json({ ok: true, message: "Sesión iniciada" });

  response.cookies.set(cookie.name, token, cookie);

  return response;
}
