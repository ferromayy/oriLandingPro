import { NextResponse } from "next/server";
import { getSuperAdminSession } from "@/lib/auth/server";

export async function GET() {
  const session = await getSuperAdminSession();

  if (!session) {
    return NextResponse.json({ ok: false, authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    authenticated: true,
    email: session.email,
    role: "superadmin",
  });
}
