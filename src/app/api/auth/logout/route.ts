import { NextResponse } from "next/server";
import { getSessionCookieOptions } from "@/lib/auth/cookie-options";

export async function POST() {
  const cookie = getSessionCookieOptions();
  const response = NextResponse.json({ ok: true, message: "Sesión cerrada" });

  response.cookies.set(cookie.name, "", { ...cookie, maxAge: 0 });

  return response;
}
