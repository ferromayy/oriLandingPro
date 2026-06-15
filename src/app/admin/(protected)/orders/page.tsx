import { OrderActions } from "@/components/admin/order-actions";
import { OrderItemsEditor } from "@/components/admin/order-items-editor";
import { formatArsPrice } from "@/lib/coffees/types";
import { getAllCoffeesAdmin } from "@/lib/coffees/admin";
import { getAllCustomerOrdersAdmin } from "@/lib/orders/admin";
import {
  formatOrderDate,
  formatOrderItemLine,
  getOrderCode,
  getOrderNumber,
} from "@/lib/orders/display";

export default async function AdminOrdersPage() {
  let orders: Awaited<ReturnType<typeof getAllCustomerOrdersAdmin>> = [];
  let coffees: Awaited<ReturnType<typeof getAllCoffeesAdmin>> = [];
  let error: string | null = null;

  try {
    [orders, coffees] = await Promise.all([
      getAllCustomerOrdersAdmin(),
      getAllCoffeesAdmin(),
    ]);
  } catch (err) {
    error = err instanceof Error ? err.message : "Error al cargar pedidos";
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Pedidos</h1>
        <p className="mt-1 text-sm text-zinc-600">
          El nº de orden es posicional (1, 2, 3…) y se ajusta al eliminar pedidos. El
          código (#1600, #1601…) es fijo y no cambia.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <p className="font-medium">No se pudieron cargar los pedidos</p>
          <p className="mt-1">{error}</p>
          <p className="mt-2 text-xs">
            Ejecutá las migraciones de pedidos en Supabase si la tabla o el estado
            aún no existen.
          </p>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3">Nº orden</th>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Detalle</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-zinc-100 align-top last:border-0">
                  <td className="px-4 py-3">
                    <span className="font-mono font-semibold text-zinc-900">
                      {getOrderNumber(order)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-base font-semibold text-zinc-900">
                      #{getOrderCode(order)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-600">
                    {formatOrderDate(order.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <ul className="space-y-2 text-zinc-700">
                      {order.items.map((item, index) => (
                        <li key={`${order.id}-${index}`} className="text-xs leading-relaxed">
                          {formatOrderItemLine(item, index)}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-zinc-900">
                    {formatArsPrice(order.total)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-2">
                      <OrderItemsEditor
                        order={order}
                        orderCode={getOrderCode(order)}
                        coffees={coffees}
                      />
                      <OrderActions
                        orderId={order.id}
                        orderCode={getOrderCode(order)}
                        orderNumber={getOrderNumber(order)}
                        status={order.status}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && !error && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                    Todavía no hay pedidos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
