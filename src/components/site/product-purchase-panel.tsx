"use client";

import { useMemo, useState } from "react";
import type { Coffee } from "@/lib/coffees/types";
import {
  COFFEE_SIZES_GRAMS,
  formatArsPrice,
  formatSizeLabel,
  type CoffeeSizeGrams,
} from "@/lib/coffees/types";
import { GRIND_OPTIONS, type GrindOption } from "@/lib/coffees/product-content";
import { getPrimaryImage, getVariant, isCoffeeSoldOut } from "@/lib/coffees/helpers";
import { useCart } from "@/components/site/cart-context";

export function ProductPurchasePanel({ coffee }: { coffee: Coffee }) {
  const { addItem } = useCart();
  const soldOut = isCoffeeSoldOut(coffee);

  const availableSizes = useMemo(
    () =>
      COFFEE_SIZES_GRAMS.filter((size) => {
        const v = getVariant(coffee, size);
        return v?.is_available && v.price > 0;
      }),
    [coffee],
  );

  const [selectedSize, setSelectedSize] = useState<CoffeeSizeGrams>(
    availableSizes[0] ?? COFFEE_SIZES_GRAMS[0],
  );
  const [grind, setGrind] = useState<GrindOption>("Café en grano");
  const [quantity, setQuantity] = useState(1);

  const activeSize = availableSizes.includes(selectedSize)
    ? selectedSize
    : (availableSizes[0] ?? COFFEE_SIZES_GRAMS[0]);

  const selectedVariant = getVariant(coffee, activeSize);
  const unitPrice = selectedVariant?.price ?? 0;
  const lineTotal = unitPrice * quantity;

  function handleAdd() {
    if (!selectedVariant?.is_available || selectedVariant.price <= 0) return;
    addItem({
      coffee,
      sizeGrams: selectedVariant.size_grams,
      imageUrl: getPrimaryImage(coffee),
      quantity,
      grind,
    });
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col justify-center px-6 py-12 lg:mx-0 lg:px-16 lg:py-20">
      <div className="mb-10">
        <h1 className="mb-8 font-sans text-2xl font-medium uppercase leading-snug lg:text-3xl">
          {coffee.name}
          {!soldOut && (
            <>
              <br />
              <span>{formatArsPrice(lineTotal)}</span>
            </>
          )}
        </h1>

        {coffee.codename && (
          <div className="mb-8 font-mono text-sm tracking-tight text-gray-600">
            <p className="uppercase">{coffee.codename}</p>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 font-mono text-sm">
        <div className="flex flex-col gap-2 border-b border-gray-200 py-4">
          <label
            htmlFor="grind-select"
            className="text-xs uppercase tracking-widest text-gray-600"
          >
            Molienda
          </label>
          <select
            id="grind-select"
            value={grind}
            onChange={(e) => setGrind(e.target.value as GrindOption)}
            className={selectClass}
          >
            {GRIND_OPTIONS.map((option) => (
              <option key={option} value={option} className="bg-white text-gray-900">
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2 border-b border-gray-200 py-4">
          <label
            htmlFor="size-select"
            className="text-xs uppercase tracking-widest text-gray-600"
          >
            Cantidad
          </label>
          <select
            id="size-select"
            value={activeSize}
            onChange={(e) => setSelectedSize(Number(e.target.value) as CoffeeSizeGrams)}
            disabled={availableSizes.length === 0}
            className={selectClass}
          >
            {availableSizes.length === 0 ? (
              <option value="">Sin stock</option>
            ) : (
              availableSizes.map((size) => (
                <option key={size} value={size} className="bg-white text-gray-900">
                  {formatSizeLabel(size)}
                </option>
              ))
            )}
          </select>
        </div>

        {!soldOut && (
          <div className="flex items-center justify-between border-b border-gray-200 py-4">
            <span className="text-gray-600">TOTAL:</span>
            <span className="text-right text-lg font-bold">{formatArsPrice(lineTotal)}</span>
          </div>
        )}

        <div className="mt-10 grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between rounded-full border border-gray-200 px-4 py-3 transition-colors hover:bg-gray-100">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="flex h-8 w-8 items-center justify-center text-xl font-light text-gray-900 hover:text-gray-600 focus:outline-none"
              aria-label="Menos"
            >
              −
            </button>
            <input
              readOnly
              value={quantity}
              className="w-12 border-none bg-transparent p-0 text-center font-mono focus:ring-0"
              aria-label="Cantidad de unidades"
            />
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="flex h-8 w-8 items-center justify-center text-xl font-light text-gray-900 hover:text-gray-600 focus:outline-none"
              aria-label="Más"
            >
              +
            </button>
          </div>

          {soldOut ? (
            <button
              type="button"
              disabled
              className="flex w-full items-center justify-center rounded-full bg-gray-300 py-3 text-sm font-medium uppercase tracking-wide text-white"
            >
              Agotado
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAdd}
              disabled={!selectedVariant?.is_available || !selectedVariant?.price}
              className="flex w-full items-center justify-center rounded-full bg-gray-900 py-3 text-sm font-medium uppercase tracking-wide text-white shadow-md transition-colors hover:bg-black hover:shadow-lg disabled:opacity-50"
            >
              Agregar al carrito
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const selectClass =
  "rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900";
