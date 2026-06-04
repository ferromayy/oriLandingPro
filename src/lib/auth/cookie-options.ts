import { SUPERADMIN_SESSION_COOKIE } from "@/lib/auth/superadmin-config";

const SESSION_MAX_AGE_SEC = 7 * 24 * 60 * 60;

export function getSessionCookieOptions() {
  return {
    name: SUPERADMIN_SESSION_COOKIE,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SEC,
  };
}
