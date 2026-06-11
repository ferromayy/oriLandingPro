"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { OrderStatus } from "@/lib/orders/types";
import { ORDER_STATUS_LABELS } from "@/lib/orders/types";

const STATUS_BADGE_CLASS: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-900",
  completed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-zinc-200 text-zinc-700",
};

export function OrderActions({
  orderId,
  orderCode,
  orderNumber,
  status,
}: {
  orderId: string;
  orderCode: string;
  orderNumber: number;
  status: OrderStatus;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<"completed" | "cancelled" | "delete" | null>(
    null,
  );

  async function updateStatus(nextStatus: "completed" | "cancelled") {
    const label = nextStatus === "completed" ? "finalizar" : "cancelar";
    if (!confirm(`¿Confirmás ${label} el pedido #${orderCode}?`)) {
      return;
    }

    setLoading(nextStatus);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Error al actualizar pedido");
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al actualizar pedido");
    } finally {
      setLoading(null);
    }
  }

  async function handleDelete() {
    if (
      !confirm(
        `¿Eliminar el pedido #${orderCode} (nº ${orderNumber})? Los pedidos posteriores se renumerarán. El código #${orderCode} no se reutilizará.`,
      )
    ) {
      return;
    }

    setLoading("delete");
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Error al eliminar pedido");
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al eliminar pedido");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-2">
      <span
        className={`inline-block rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_BADGE_CLASS[status]}`}
      >
        {ORDER_STATUS_LABELS[status]}
      </span>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => updateStatus("completed")}
          disabled={status === "completed" || loading !== null}
          className="rounded border border-emerald-300 px-2.5 py-1 text-xs font-medium text-emerald-800 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading === "completed" ? "…" : "Finalizar"}
        </button>
        <button
          type="button"
          onClick={() => updateStatus("cancelled")}
          disabled={status === "cancelled" || loading !== null}
          className="rounded border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading === "cancelled" ? "…" : "Cancelar"}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading !== null}
          className="rounded border border-red-200 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading === "delete" ? "…" : "Eliminar"}
        </button>
      </div>
    </div>
  );
}
