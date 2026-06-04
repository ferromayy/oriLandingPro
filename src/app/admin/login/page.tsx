import { Suspense } from "react";
import Link from "next/link";
import { AdminLoginForm } from "@/components/admin/login-form";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-zinc-50 px-6 py-16">
      <div className="w-full max-w-sm space-y-6 rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="space-y-1 text-center">
          <h1 className="text-xl font-semibold text-zinc-900">Superadmin</h1>
          <p className="text-sm text-zinc-500">Acceso restringido al panel</p>
        </div>

        <Suspense fallback={<p className="text-sm text-zinc-500">Cargando…</p>}>
          <AdminLoginForm />
        </Suspense>

        <p className="text-center text-xs text-zinc-400">
          <Link href="/" className="underline hover:text-zinc-600">
            Volver al inicio
          </Link>
        </p>
      </div>
    </div>
  );
}
