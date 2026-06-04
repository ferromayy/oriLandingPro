import { type NextRequest } from "next/server";
import { protectAdminRoutes } from "@/lib/auth/middleware";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const adminGuard = await protectAdminRoutes(request);
  if (adminGuard) return adminGuard;

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
