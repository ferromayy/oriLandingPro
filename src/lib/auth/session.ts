import { type NextRequest } from "next/server";
import { getSuperAdminEnv, hasSuperAdminEnv } from "@/lib/env";
import { SUPERADMIN_SESSION_COOKIE } from "@/lib/auth/superadmin-config";

const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export type SessionPayload = {
  email: string;
  exp: number;
};

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

async function signPayload(payload: string, sessionSecret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(sessionSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return Buffer.from(signature).toString("base64url");
}

export async function createSessionToken(): Promise<string> {
  const { email, sessionSecret } = getSuperAdminEnv();

  const payload = Buffer.from(
    JSON.stringify({
      email,
      exp: Date.now() + SESSION_MAX_AGE_MS,
    } satisfies SessionPayload),
  ).toString("base64url");

  return `${payload}.${await signPayload(payload, sessionSecret)}`;
}

export async function verifySessionToken(
  token: string | undefined,
): Promise<SessionPayload | null> {
  if (!token || !hasSuperAdminEnv()) return null;

  const { email: adminEmail, sessionSecret } = getSuperAdminEnv();

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = await signPayload(payload, sessionSecret);
  if (!constantTimeEqual(signature, expected)) return null;

  try {
    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as SessionPayload;

    if (data.email.toLowerCase() !== adminEmail.toLowerCase()) return null;
    if (typeof data.exp !== "number" || data.exp < Date.now()) return null;

    return data;
  } catch {
    return null;
  }
}

export async function getSessionFromRequest(
  request: NextRequest,
): Promise<SessionPayload | null> {
  const token = request.cookies.get(SUPERADMIN_SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}
