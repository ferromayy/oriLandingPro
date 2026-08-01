"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Coffee } from "@/lib/coffees/types";
import {
  formatArsPrice,
  formatSizeLabel,
  type CoffeeSizeGrams,
} from "@/lib/coffees/types";
import {
  getAvailableVariants,
  getPrimaryImage,
  getVariant,
} from "@/lib/coffees/helpers";
import { GRIND_OPTIONS, type GrindOption } from "@/lib/coffees/product-content";
import {
  addItemToOrderTicket,
  computeOrderTotal,
  getOrderTicketLineKey,
  withOrderItemQuantity,
} from "@/lib/orders/helpers";
import { formatOrderProductTitle } from "@/lib/orders/display";
import type { CustomerOrderItem } from "@/lib/orders/types";

type Props = {
  coffees: Coffee[];
};

type TicketLine = CustomerOrderItem & { key: string };

export function TakeOrderPanel({ coffees }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState<TicketLine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successCode, setSuccessCode] = useState<string | null>(null);

  const [activeCoffeeId, setActiveCoffeeId] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<CoffeeSizeGrams | null>(null);
  const [selectedGrind, setSelectedGrind] = useState<GrindOption>("Café en grano");
  const [quantity, setQuantity] = useState(1);

  const orderableCoffees = useMemo(
    () =>
      coffees.filter(
        (coffee) => coffee.is_active && getAvailableVariants(coffee).length > 0,
      ),
    [coffees],
  );

  const activeCoffee = orderableCoffees.find((coffee) => coffee.id === activeCoffeeId);
  const availableSizes = activeCoffee
    ? getAvailableVariants(activeCoffee).map((variant) => variant.size_grams)
    : [];
  const size = selectedSize && availableSizes.includes(selectedSize)
    ? selectedSize
    : (availableSizes[0] ?? null);
  const activeVariant =
    activeCoffee && size ? getVariant(activeCoffee, size) : undefined;

  const total = computeOrderTotal(lines);

  function resetComposer() {
    setActiveCoffeeId(null);
    setSelectedSize(null);
    setSelectedGrind("Café en grano");
    setQuantity(1);
  }

  function openPanel() {
    setLines([]);
    setError(null);
    setSuccessCode(null);
    resetComposer();
    setOpen(true);
  }

  function closePanel() {
    if (loading) return;
    setOpen(false);
    setError(null);
    setSuccessCode(null);
    resetComposer();
  }

  function selectCoffee(coffeeId: string) {
    const coffee = orderableCoffees.find((item) => item.id === coffeeId);
    if (!coffee) return;
    const sizes = getAvailableVariants(coffee).map((variant) => variant.size_grams);
    setActiveCoffeeId(coffeeId);
    setSelectedSize(sizes[0] ?? null);
    setSelectedGrind("Café en grano");
    setQuantity(1);
    setError(null);
  }

  function addToTicket() {
    if (!activeCoffee || !activeVariant?.is_available || !size || activeVariant.price <= 0) {
      setError("Elegí producto, tamaño y molienda válidos");
      return;
    }

    const qty = Math.max(1, Math.floor(quantity));
    const incoming: CustomerOrderItem = {
      coffee_id: activeCoffee.id,
      name: activeCoffee.name,
      codename: activeCoffee.codename,
      size_grams: size,
      grind: selectedGrind,
      quantity: qty,
      unit_price: activeVariant.price,
      line_total: activeVariant.price * qty,
    };

    setLines((current) =>
      addItemToOrderTicket(
        current.map(({ key: _key, ...item }) => item),
        incoming,
      ).map((item) => ({ ...item, key: getOrderTicketLineKey(item) })),
    );

    setError(null);
    resetComposer();
  }

  function updateLineQuantity(key: string, nextQuantity: number) {
    setLines((current) =>
      current
        .map((line) =>
          line.key === key
            ? { ...withOrderItemQuantity(line, nextQuantity), key: line.key }
            : line,
        )
        .filter((line) => line.quantity > 0),
    );
  }

  function removeLine(key: string) {
    setLines((current) => current.filter((line) => line.key !== key));
  }

  async function confirmOrder() {
    if (lines.length === 0) {
      setError("Agregá al menos un producto a la comanda");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const items = lines.map(({ key: _key, ...item }) => item);
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, total, source: "staff" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Error al crear el pedido");

      setSuccessCode(data.order?.order_code ?? null);
      setLines([]);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear el pedido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openPanel}
        className="inline-flex h-11 items-center justify-center rounded-lg bg-zinc-900 px-5 text-sm font-medium text-white transition hover:bg-zinc-800"
      >
        + Nuevo pedido
      </button>

      {open && (
        <div className="fixed inset-0 z-[220] flex bg-zinc-950/50 backdrop-blur-[2px]">
          <div className="flex h-full w-full flex-col bg-zinc-100 md:flex-row">
            {/* Menú */}
            <section className="flex min-h-0 flex-1 flex-col border-b border-zinc-200 md:border-b-0 md:border-r">
              <header className="flex items-center justify-between gap-3 border-b border-zinc-200 bg-white px-4 py-3 sm:px-5">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                    Orí · Servicio
                  </p>
                  <h2 className="text-lg font-semibold text-zinc-900">Tomar pedido</h2>
                </div>
                <button
                  type="button"
                  onClick={closePanel}
                  className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
                >
                  Cerrar
                </button>
              </header>

              <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Carta
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                  {orderableCoffees.map((coffee) => {
                    const imageUrl = getPrimaryImage(coffee);
                    const fromPrice = getAvailableVariants(coffee)
                      .map((variant) => variant.price)
                      .sort((a, b) => a - b)[0];
                    const selected = coffee.id === activeCoffeeId;

                    return (
                      <button
                        key={coffee.id}
                        type="button"
                        onClick={() => selectCoffee(coffee.id)}
                        className={`group overflow-hidden rounded-2xl border bg-white text-left transition ${
                          selected
                            ? "border-zinc-900 ring-2 ring-zinc-900"
                            : "border-zinc-200 hover:-translate-y-0.5 hover:border-zinc-400 hover:shadow-sm"
                        }`}
                      >
                        <div className="relative aspect-[4/3] bg-zinc-100">
                          {imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt={coffee.name}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 50vw, 20vw"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-zinc-400">
                              Sin foto
                            </div>
                          )}
                        </div>
                        <div className="space-y-1 p-3">
                          <p className="line-clamp-2 text-sm font-medium text-zinc-900">
                            {coffee.name}
                          </p>
                          {coffee.codename && (
                            <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                              {coffee.codename}
                            </p>
                          )}
                          <p className="text-xs text-zinc-600">
                            desde {formatArsPrice(fromPrice ?? 0)}
                          </p>
                          <p
                            className={`text-[11px] font-medium ${
                              (coffee.stock_quantity ?? 0) <= 0
                                ? "text-amber-700"
                                : "text-zinc-500"
                            }`}
                          >
                            Stock: {coffee.stock_quantity ?? 0}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {orderableCoffees.length === 0 && (
                  <p className="rounded-xl border border-dashed border-zinc-300 bg-white px-4 py-10 text-center text-sm text-zinc-500">
                    No hay cafés disponibles para vender.
                  </p>
                )}
              </div>

              {activeCoffee && (
                <div className="border-t border-zinc-200 bg-white px-4 py-4 sm:px-5">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        Preparar ítem
                      </p>
                      <p className="mt-1 text-base font-semibold text-zinc-900">
                        {activeCoffee.name}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={resetComposer}
                      className="text-xs text-zinc-500 hover:text-zinc-800"
                    >
                      Cancelar
                    </button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end">
                    <label className="block text-xs text-zinc-600">
                      Tamaño
                      <select
                        value={size ?? ""}
                        onChange={(event) =>
                          setSelectedSize(Number(event.target.value) as CoffeeSizeGrams)
                        }
                        className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
                      >
                        {availableSizes.map((sizeOption) => {
                          const variant = getVariant(activeCoffee, sizeOption);
                          return (
                            <option key={sizeOption} value={sizeOption}>
                              {formatSizeLabel(sizeOption)}
                              {variant ? ` · ${formatArsPrice(variant.price)}` : ""}
                            </option>
                          );
                        })}
                      </select>
                    </label>

                    <label className="block text-xs text-zinc-600">
                      Molienda
                      <select
                        value={selectedGrind}
                        onChange={(event) =>
                          setSelectedGrind(event.target.value as GrindOption)
                        }
                        className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
                      >
                        {GRIND_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block text-xs text-zinc-600">
                      Cant.
                      <input
                        type="number"
                        min={1}
                        value={quantity}
                        onChange={(event) =>
                          setQuantity(Math.max(1, Number(event.target.value) || 1))
                        }
                        className="mt-1 w-20 rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={addToTicket}
                      className="h-10 rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800"
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* Comanda */}
            <aside className="flex h-[42vh] min-h-0 w-full flex-col bg-zinc-900 text-white md:h-full md:w-[380px] lg:w-[420px]">
              <div className="border-b border-white/10 px-5 py-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400">
                  Comanda
                </p>
                <h3 className="mt-1 text-lg font-semibold">Pedido en curso</h3>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                {successCode && (
                  <div className="mb-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                    Pedido #{successCode} creado. Podés seguir cargando otro o cerrar.
                  </div>
                )}

                {lines.length === 0 ? (
                  <div className="flex h-full min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 px-4 text-center">
                    <p className="text-sm text-zinc-300">La comanda está vacía</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      Tocá un café de la carta para empezar
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {lines.map((line) => (
                      <li
                        key={line.key}
                        className="rounded-2xl border border-white/10 bg-white/5 p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium">
                              {formatOrderProductTitle(line)}
                            </p>
                            <p className="mt-1 text-xs text-zinc-400">
                              {formatSizeLabel(line.size_grams)} · {line.grind}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeLine(line.key)}
                            className="text-xs text-zinc-400 hover:text-white"
                          >
                            Quitar
                          </button>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="inline-flex items-center rounded-full border border-white/15">
                            <button
                              type="button"
                              onClick={() =>
                                updateLineQuantity(line.key, line.quantity - 1)
                              }
                              className="px-3 py-1 text-sm hover:bg-white/10"
                              aria-label="Restar"
                            >
                              −
                            </button>
                            <span className="min-w-8 text-center text-sm font-medium">
                              {line.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                updateLineQuantity(line.key, line.quantity + 1)
                              }
                              className="px-3 py-1 text-sm hover:bg-white/10"
                              aria-label="Sumar"
                            >
                              +
                            </button>
                          </div>
                          <p className="text-sm font-semibold">
                            {formatArsPrice(line.line_total)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="space-y-3 border-t border-white/10 px-5 py-4">
                {error && (
                  <p className="rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-200">
                    {error}
                  </p>
                )}
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-zinc-400">Total</p>
                    <p className="text-2xl font-semibold">{formatArsPrice(total)}</p>
                  </div>
                  <p className="text-xs text-zinc-500">
                    {lines.length} {lines.length === 1 ? "ítem" : "ítems"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={confirmOrder}
                  disabled={loading || lines.length === 0}
                  className="flex h-12 w-full items-center justify-center rounded-xl bg-white text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Confirmando…" : "Confirmar pedido"}
                </button>
              </div>
            </aside>
          </div>
        </div>
      )}
    </>
  );
}
