import Link from "next/link";
import { formatArsPrice, formatSizeLabel } from "@/lib/coffees/types";
import type { OrderAnalytics } from "@/lib/orders/analytics";
import { ORDER_STATUS_LABELS } from "@/lib/orders/types";

type Props = {
  analytics: OrderAnalytics;
};

function StatCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "success" | "warning" | "muted";
}) {
  const toneClass = {
    default: "text-zinc-900",
    success: "text-emerald-700",
    warning: "text-amber-700",
    muted: "text-zinc-500",
  }[tone];

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${toneClass}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}

function StatusBar({
  label,
  count,
  total,
  tone,
}: {
  label: string;
  count: number;
  total: number;
  tone: "emerald" | "amber" | "zinc";
}) {
  const percent = total > 0 ? Math.round((count / total) * 100) : 0;
  const barClass = {
    emerald: "bg-emerald-500",
    amber: "bg-amber-400",
    zinc: "bg-zinc-400",
  }[tone];

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium text-zinc-800">{label}</span>
        <span className="text-zinc-600">
          {count} ({percent}%)
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
        <div className={`h-full rounded-full ${barClass}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export function OrderAnalyticsDashboard({ analytics }: Props) {
  const { orderCounts, revenueByStatus, totalOrders } = analytics;
  const successfulCount = orderCounts.completed;
  const unsuccessfulCount = orderCounts.cancelled;
  const inProgressCount = orderCounts.pending;

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">Ingresos por pedidos</h2>
            <p className="text-sm text-zinc-600">
              Los ingresos confirmados suman solo pedidos <strong>finalizados</strong>.
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="text-sm font-medium text-zinc-700 underline hover:text-zinc-900"
          >
            Ver todos los pedidos →
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Ingresos confirmados"
            value={formatArsPrice(revenueByStatus.completed)}
            hint={`${successfulCount} pedido${successfulCount === 1 ? "" : "s"} finalizado${successfulCount === 1 ? "" : "s"}`}
            tone="success"
          />
          <StatCard
            label="Ticket promedio"
            value={
              successfulCount > 0
                ? formatArsPrice(analytics.averageCompletedOrder)
                : "—"
            }
            hint="Por pedido finalizado"
          />
          <StatCard
            label="En espera"
            value={formatArsPrice(revenueByStatus.pending)}
            hint={`${inProgressCount} pendiente${inProgressCount === 1 ? "" : "s"}`}
            tone="warning"
          />
          <StatCard
            label="No concretados"
            value={formatArsPrice(revenueByStatus.cancelled)}
            hint={`${unsuccessfulCount} cancelado${unsuccessfulCount === 1 ? "" : "s"}`}
            tone="muted"
          />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-zinc-900">Estado de pedidos</h2>
          <p className="mt-1 text-sm text-zinc-600">
            {totalOrders} pedido{totalOrders === 1 ? "" : "s"} en total
          </p>

          <div className="mt-6 space-y-4">
            <StatusBar
              label={ORDER_STATUS_LABELS.completed}
              count={orderCounts.completed}
              total={totalOrders}
              tone="emerald"
            />
            <StatusBar
              label={ORDER_STATUS_LABELS.pending}
              count={orderCounts.pending}
              total={totalOrders}
              tone="amber"
            />
            <StatusBar
              label={ORDER_STATUS_LABELS.cancelled}
              count={orderCounts.cancelled}
              total={totalOrders}
              tone="zinc"
            />
          </div>

          <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-zinc-100 pt-4 text-center">
            <div>
              <dt className="text-xs uppercase tracking-wide text-zinc-500">Exitosos</dt>
              <dd className="mt-1 text-xl font-semibold text-emerald-700">{successfulCount}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-zinc-500">Pendientes</dt>
              <dd className="mt-1 text-xl font-semibold text-amber-700">{inProgressCount}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-zinc-500">Cancelados</dt>
              <dd className="mt-1 text-xl font-semibold text-zinc-600">{unsuccessfulCount}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-zinc-900">Unidades por tamaño</h2>
          <p className="mt-1 text-sm text-zinc-600">Solo pedidos finalizados</p>

          {analytics.sizeSales.length === 0 ? (
            <p className="mt-6 text-sm text-zinc-500">Todavía no hay ventas finalizadas.</p>
          ) : (
            <ul className="mt-6 space-y-4">
              {analytics.sizeSales.map((row) => {
                const maxUnits = Math.max(...analytics.sizeSales.map((entry) => entry.unitsSold));
                const width = maxUnits > 0 ? Math.round((row.unitsSold / maxUnits) * 100) : 0;

                return (
                  <li key={row.size_grams}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium text-zinc-800">
                        {formatSizeLabel(row.size_grams)}
                      </span>
                      <span className="text-zinc-600">
                        {row.unitsSold} u. · {formatArsPrice(row.revenue)}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
                      <div
                        className="h-full rounded-full bg-zinc-800"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-zinc-900">Ventas por café y tamaño</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Pedidos finalizados desglosados por producto y presentación (250g, 500g, 1kg, etc.).
          </p>
        </div>

        {analytics.coffeeSizeSales.length === 0 ? (
          <p className="px-6 py-8 text-sm text-zinc-500">
            Cuando finalices pedidos, acá vas a ver el desglose por café y tamaño.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-6 py-3">Café</th>
                  <th className="px-6 py-3">Tamaño</th>
                  <th className="px-6 py-3 text-right">Pedidos</th>
                  <th className="px-6 py-3 text-right">Unidades</th>
                  <th className="px-6 py-3 text-right">Ingresos</th>
                </tr>
              </thead>
              <tbody>
                {analytics.coffeeSizeSales.map((row) => (
                  <tr
                    key={`${row.coffee_id}-${row.size_grams}`}
                    className="border-b border-zinc-100 last:border-0"
                  >
                    <td className="px-6 py-3 font-medium text-zinc-900">{row.label}</td>
                    <td className="px-6 py-3 text-zinc-700">{formatSizeLabel(row.size_grams)}</td>
                    <td className="px-6 py-3 text-right text-zinc-700">{row.orderCount}</td>
                    <td className="px-6 py-3 text-right text-zinc-700">{row.unitsSold}</td>
                    <td className="px-6 py-3 text-right font-medium text-zinc-900">
                      {formatArsPrice(row.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-zinc-900">Totales por café</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Suma de todos los tamaños vendidos de cada producto.
          </p>
        </div>

        {analytics.coffeeSales.length === 0 ? (
          <p className="px-6 py-8 text-sm text-zinc-500">
            Cuando finalices pedidos, acá vas a ver el resumen por producto.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-6 py-3">Café</th>
                  <th className="px-6 py-3 text-right">Pedidos</th>
                  <th className="px-6 py-3 text-right">Unidades</th>
                  <th className="px-6 py-3 text-right">Ingresos</th>
                </tr>
              </thead>
              <tbody>
                {analytics.coffeeSales.map((row) => (
                  <tr key={row.coffee_id} className="border-b border-zinc-100 last:border-0">
                    <td className="px-6 py-3 font-medium text-zinc-900">{row.label}</td>
                    <td className="px-6 py-3 text-right text-zinc-700">{row.orderCount}</td>
                    <td className="px-6 py-3 text-right text-zinc-700">{row.unitsSold}</td>
                    <td className="px-6 py-3 text-right font-medium text-zinc-900">
                      {formatArsPrice(row.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
