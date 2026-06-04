import { NextResponse } from "next/server";
import { getSuperAdminSession } from "@/lib/auth/server";

export async function requireSuperAdminApi() {
  const session = await getSuperAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, message: "No autorizado" }, { status: 401 });
  }
  return null;
}
