import Link from "next/link";
import { getAllCoffeesAdmin } from "@/lib/coffees/admin";
import { getAllEducationNotesAdmin } from "@/lib/education/admin";

export default async function AdminDashboardPage() {
  let coffeeCount = 0;
  let educationCount = 0;
  let error: string | null = null;

  try {
    const [coffees, notes] = await Promise.all([
      getAllCoffeesAdmin(),
      getAllEducationNotesAdmin(),
    ]);
    coffeeCount = coffees.length;
    educationCount = notes.length;
  } catch (err) {
    error = err instanceof Error ? err.message : "Error al conectar con Supabase";
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Gestioná los cafés y las notas de educación del sitio.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <p className="font-medium">No se pudo cargar la base de datos</p>
          <p className="mt-1">{error}</p>
          <p className="mt-2 text-xs">
            Verificá las migraciones SQL y que{" "}
            <code className="rounded bg-white/70 px-1">SUPABASE_SERVICE_ROLE_KEY</code>{" "}
            está en <code className="rounded bg-white/70 px-1">.env.local</code>.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <p className="text-sm text-zinc-500">Cafés en catálogo</p>
          <p className="mt-2 text-3xl font-semibold text-zinc-900">{coffeeCount}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <p className="text-sm text-zinc-500">Notas de educación</p>
          <p className="mt-2 text-3xl font-semibold text-zinc-900">{educationCount}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <p className="text-sm text-zinc-500">Acciones rápidas</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href="/admin/coffees/new"
              className="inline-block rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-black"
            >
              + Nuevo café
            </Link>
            <Link
              href="/admin/education/new"
              className="inline-block rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50"
            >
              + Nueva nota
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
