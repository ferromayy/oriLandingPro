import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SUPERADMIN_SESSION_COOKIE } from "@/lib/auth/superadmin-config";
import { verifySessionToken } from "@/lib/auth/session";

export async function getSuperAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SUPERADMIN_SESSION_COOKIE)?.value;
  return await verifySessionToken(token);
}

export async function requireSuperAdmin() {
  const session = await getSuperAdminSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}

export async function isSuperAdmin(): Promise<boolean> {
  const session = await getSuperAdminSession();
  return session !== null;
}
