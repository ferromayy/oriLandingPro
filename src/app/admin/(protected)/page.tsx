import Link from "next/link";
import { getAllCoffeesAdmin } from "@/lib/coffees/admin";

export default async function AdminDashboardPage() {
  let count = 0;
  let error: string | null = null;

  try {
    const coffees = await getAllCoffeesAdmin();
    count = coffees.length;
  } catch (err) {
    error = err instanceof Error ? err.message : "Error al conectar con Supabase";
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Gestioná los cafés que se muestran en la landing.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <p className="font-medium">No se pudo cargar la base de datos</p>
          <p className="mt-1">{error}</p>
          <p className="mt-2 text-xs">
            Verificá que ejecutaste{" "}
            <code className="rounded bg-white/70 px-1">001_coffees.sql</code> y que{" "}
            <code className="rounded bg-white/70 px-1">SUPABASE_SERVICE_ROLE_KEY</code>{" "}
            está en <code className="rounded bg-white/70 px-1">.env.local</code>.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <p className="text-sm text-zinc-500">Cafés en catálogo</p>
          <p className="mt-2 text-3xl font-semibold text-zinc-900">{count}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <p className="text-sm text-zinc-500">Acción rápida</p>
          <Link
            href="/admin/coffees/new"
            className="mt-3 inline-block rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-black"
          >
            + Nuevo café
          </Link>
        </div>
      </div>
    </div>
  );
}
