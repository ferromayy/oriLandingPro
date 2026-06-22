import Link from "next/link";
import { OrderAnalyticsDashboard } from "@/components/admin/order-analytics-dashboard";
import { getAllCoffeesAdmin } from "@/lib/coffees/admin";
import { getAllEducationNotesAdmin } from "@/lib/education/admin";
import { getAllCustomerOrdersAdmin } from "@/lib/orders/admin";
import { computeOrderAnalytics } from "@/lib/orders/analytics";

export default async function AdminDashboardPage() {
  let coffeeCount = 0;
  let educationCount = 0;
  let orderCount = 0;
  let analytics = computeOrderAnalytics([]);
  let error: string | null = null;

  try {
    const [coffees, notes, orders] = await Promise.all([
      getAllCoffeesAdmin(),
      getAllEducationNotesAdmin(),
      getAllCustomerOrdersAdmin(),
    ]);
    coffeeCount = coffees.length;
    educationCount = notes.length;
    orderCount = orders.length;
    analytics = computeOrderAnalytics(orders);
  } catch (err) {
    error = err instanceof Error ? err.message : "Error al conectar con Supabase";
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Resumen de ventas, pedidos y acceso rápido al panel.
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

      {!error && <OrderAnalyticsDashboard analytics={analytics} />}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <p className="text-sm text-zinc-500">Cafés en catálogo</p>
          <p className="mt-2 text-3xl font-semibold text-zinc-900">{coffeeCount}</p>
          <Link
            href="/admin/coffees"
            className="mt-3 inline-block text-xs font-medium text-zinc-600 underline hover:text-zinc-900"
          >
            Gestionar cafés
          </Link>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <p className="text-sm text-zinc-500">Pedidos registrados</p>
          <p className="mt-2 text-3xl font-semibold text-zinc-900">{orderCount}</p>
          <Link
            href="/admin/orders"
            className="mt-3 inline-block text-xs font-medium text-zinc-600 underline hover:text-zinc-900"
          >
            Ver pedidos
          </Link>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <p className="text-sm text-zinc-500">Notas de educación</p>
          <p className="mt-2 text-3xl font-semibold text-zinc-900">{educationCount}</p>
          <Link
            href="/admin/education"
            className="mt-3 inline-block text-xs font-medium text-zinc-600 underline hover:text-zinc-900"
          >
            Gestionar educación
          </Link>
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
      </section>
    </div>
  );
}
