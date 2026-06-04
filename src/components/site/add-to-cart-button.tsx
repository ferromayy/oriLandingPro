"use client";

import type { Coffee } from "@/lib/coffees/types";
import { useCart } from "@/components/site/cart-context";

export function AddToCartButton({ coffee }: { coffee: Coffee }) {
  const { addItem } = useCart();

  if (coffee.sold_out) {
    return (
      <button
        type="button"
        disabled
        className="w-full rounded-full bg-gray-300 py-3 text-sm font-medium uppercase tracking-wide text-white"
      >
        Agotado
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => addItem(coffee)}
      className="w-full rounded-full bg-gray-900 py-3 text-sm font-medium uppercase tracking-wide text-white shadow-md transition hover:bg-black"
    >
      Agregar al carrito
    </button>
  );
}
