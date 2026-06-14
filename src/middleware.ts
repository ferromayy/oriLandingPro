import { type NextRequest, NextResponse } from "next/server";
import { protectAdminRoutes } from "@/lib/auth/middleware";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  try {
    const adminGuard = await protectAdminRoutes(request);
    if (adminGuard) return adminGuard;

    return await updateSession(request);
  } catch {
    return NextResponse.next({ request });
  }
}

export const config = {
  matcher: [
    "/((?!api/|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|heic|heif)$).*)",
  ],
};
