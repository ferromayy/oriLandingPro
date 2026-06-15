"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Coffee } from "@/lib/coffees/types";
import {
  COFFEE_SIZES_GRAMS,
  formatArsPrice,
  formatSizeLabel,
  type CoffeeSizeGrams,
} from "@/lib/coffees/types";
import { getAvailableVariants, getVariant } from "@/lib/coffees/helpers";
import { GRIND_OPTIONS, type GrindOption } from "@/lib/coffees/product-content";
import { computeOrderTotal, withOrderItemQuantity } from "@/lib/orders/helpers";
import {
  formatOrderItemDetails,
  formatOrderProductTitle,
} from "@/lib/orders/display";
import type { CustomerOrder, CustomerOrderItem } from "@/lib/orders/types";

type Props = {
  order: CustomerOrder;
  orderCode: string;
  coffees: Coffee[];
};

function createDraftItems(items: CustomerOrderItem[]): CustomerOrderItem[] {
  return items.map((item) => ({ ...item }));
}

export function OrderItemsEditor({ order, orderCode, coffees }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<CustomerOrderItem[]>(() =>
    createDraftItems(order.items),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedCoffeeId, setSelectedCoffeeId] = useState("");
  const [selectedSize, setSelectedSize] = useState<CoffeeSizeGrams>(250);
  const [selectedGrind, setSelectedGrind] = useState<GrindOption>("Café en grano");
  const [addQuantity, setAddQuantity] = useState(1);

  const orderableCoffees = useMemo(
    () =>
      coffees.filter(
        (coffee) => coffee.is_active && getAvailableVariants(coffee).length > 0,
      ),
    [coffees],
  );

  const selectedCoffee = orderableCoffees.find((coffee) => coffee.id === selectedCoffeeId);

  const availableSizes = useMemo(() => {
    if (!selectedCoffee) return [] as CoffeeSizeGrams[];
    return getAvailableVariants(selectedCoffee).map((variant) => variant.size_grams);
  }, [selectedCoffee]);

  const activeSize = availableSizes.includes(selectedSize)
    ? selectedSize
    : (availableSizes[0] ?? COFFEE_SIZES_GRAMS[0]);

  const selectedVariant = selectedCoffee
    ? getVariant(selectedCoffee, activeSize)
    : undefined;

  const total = computeOrderTotal(items);

  function openEditor() {
    setItems(createDraftItems(order.items));
    setError(null);
    setSelectedCoffeeId(orderableCoffees[0]?.id ?? "");
    setSelectedSize(250);
    setSelectedGrind("Café en grano");
    setAddQuantity(1);
    setOpen(true);
  }

  function closeEditor() {
    if (loading) return;
    setOpen(false);
    setError(null);
  }

  function updateQuantity(index: number, quantity: number) {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? withOrderItemQuantity(item, quantity) : item,
      ),
    );
  }

  function removeItem(index: number) {
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  function handleAddProduct() {
    if (!selectedCoffee || !selectedVariant?.is_available || selectedVariant.price <= 0) {
      setError("Elegí un producto y tamaño válidos");
      return;
    }

    const quantity = Math.max(1, Math.floor(addQuantity));
    const newItem: CustomerOrderItem = {
      coffee_id: selectedCoffee.id,
      name: selectedCoffee.name,
      codename: selectedCoffee.codename,
      size_grams: selectedVariant.size_grams,
      grind: selectedGrind,
      quantity,
      unit_price: selectedVariant.price,
      line_total: selectedVariant.price * quantity,
    };

    setItems((current) => [...current, newItem]);
    setError(null);
    setAddQuantity(1);
  }

  async function handleSave() {
    if (items.length === 0) {
      setError("El pedido debe tener al menos un producto");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, total }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Error al guardar pedido");

      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar pedido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openEditor}
        className="rounded border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
      >
        Editar productos
      </button>

      {open && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center p-4 sm:items-center">
          <button
            type="button"
            aria-label="Cerrar"
            className="absolute inset-0 bg-black/40"
            onClick={closeEditor}
          />

          <div className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl">
            <div className="border-b border-zinc-200 px-5 py-4">
              <h2 className="text-lg font-semibold text-zinc-900">
                Editar pedido #{orderCode}
              </h2>
              <p className="mt-1 text-sm text-zinc-600">
                Modificá productos y cantidades. El total y el mensaje de WhatsApp se
                actualizan al guardar.
              </p>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto px-5 py-4">
              <section className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Productos del pedido
                </h3>

                {items.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-zinc-300 px-4 py-6 text-center text-sm text-zinc-500">
                    No hay productos. Agregá al menos uno para guardar.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {items.map((item, index) => (
                      <li
                        key={`${item.coffee_id}-${item.size_grams}-${item.grind}-${index}`}
                        className="rounded-lg border border-zinc-200 p-3"
                      >
                        <p className="text-sm font-medium text-zinc-900">
                          {formatOrderProductTitle(item)}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                          {formatOrderItemDetails(item)}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-3">
                          <label className="flex items-center gap-2 text-xs text-zinc-600">
                            Cantidad
                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(event) =>
                                updateQuantity(index, Number(event.target.value))
                              }
                              className="w-16 rounded border border-zinc-300 px-2 py-1 text-sm text-zinc-900"
                            />
                          </label>

                          <span className="text-xs font-medium text-zinc-700">
                            Subtotal: {formatArsPrice(item.line_total)}
                          </span>

                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="ml-auto text-xs font-medium text-red-700 hover:text-red-800"
                          >
                            Quitar
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="space-y-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Agregar producto
                </h3>

                {orderableCoffees.length === 0 ? (
                  <p className="text-sm text-zinc-600">
                    No hay cafés activos con stock para agregar.
                  </p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block text-xs text-zinc-600 sm:col-span-2">
                      Producto
                      <select
                        value={selectedCoffeeId}
                        onChange={(event) => {
                          setSelectedCoffeeId(event.target.value);
                          const coffee = orderableCoffees.find(
                            (entry) => entry.id === event.target.value,
                          );
                          const firstSize = coffee
                            ? getAvailableVariants(coffee)[0]?.size_grams
                            : undefined;
                          if (firstSize) setSelectedSize(firstSize);
                        }}
                        className="mt-1 w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
                      >
                        {orderableCoffees.map((coffee) => (
                          <option key={coffee.id} value={coffee.id}>
                            {coffee.codename
                              ? `${coffee.codename} — ${coffee.name}`
                              : coffee.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block text-xs text-zinc-600">
                      Tamaño
                      <select
                        value={activeSize}
                        onChange={(event) =>
                          setSelectedSize(Number(event.target.value) as CoffeeSizeGrams)
                        }
                        disabled={availableSizes.length === 0}
                        className="mt-1 w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 disabled:opacity-50"
                      >
                        {availableSizes.map((size) => (
                          <option key={size} value={size}>
                            {formatSizeLabel(size)}
                            {selectedCoffee &&
                              ` — ${formatArsPrice(getVariant(selectedCoffee, size)?.price ?? 0)}`}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block text-xs text-zinc-600">
                      Molienda
                      <select
                        value={selectedGrind}
                        onChange={(event) =>
                          setSelectedGrind(event.target.value as GrindOption)
                        }
                        className="mt-1 w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
                      >
                        {GRIND_OPTIONS.map((grind) => (
                          <option key={grind} value={grind}>
                            {grind}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block text-xs text-zinc-600">
                      Cantidad
                      <input
                        type="number"
                        min={1}
                        value={addQuantity}
                        onChange={(event) =>
                          setAddQuantity(Math.max(1, Number(event.target.value)))
                        }
                        className="mt-1 w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
                      />
                    </label>

                    <div className="flex items-end sm:col-span-2">
                      <button
                        type="button"
                        onClick={handleAddProduct}
                        disabled={!selectedCoffee || !selectedVariant}
                        className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Agregar al pedido
                      </button>
                    </div>
                  </div>
                )}
              </section>

              {error && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                  {error}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 px-5 py-4">
              <p className="text-sm font-semibold text-zinc-900">
                Total: {formatArsPrice(total)}
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={closeEditor}
                  disabled={loading}
                  className="rounded border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={loading || items.length === 0}
                  className="rounded bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Guardando…" : "Guardar cambios"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
