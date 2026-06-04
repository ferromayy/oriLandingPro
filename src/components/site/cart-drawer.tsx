"use client";

import Image from "next/image";
import { useCart } from "@/components/site/cart-context";
import { formatArsPrice } from "@/lib/coffees/types";

export function CartDrawer() {
  const {
    isOpen,
    closeCart,
    items,
    total,
    removeItem,
    whatsappCheckoutUrl,
  } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeCart}
        aria-label="Cerrar carrito"
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold">Carrito</h2>
          <button type="button" onClick={closeCart}>
            <span className="material-icons-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <p className="text-sm text-gray-500">Tu carrito está vacío</p>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.coffeeId} className="flex gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden bg-gray-100">
                    {item.imageUrl && (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-gray-500">x{item.quantity}</p>
                    <p className="text-sm">{formatArsPrice(item.price * item.quantity)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.coffeeId)}
                    className="text-gray-400 hover:text-gray-700"
                  >
                    <span className="material-icons-outlined text-lg">delete</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="sticky bottom-0 border-t border-gray-200 bg-white px-6 py-4">
          <p className="mb-4 text-right font-mono text-sm">
            Total: <strong>{formatArsPrice(total)}</strong>
          </p>
          <a
            href={whatsappCheckoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`block w-full rounded-full py-3 text-center text-sm font-medium uppercase tracking-wide text-white shadow-md transition ${
              items.length === 0
                ? "pointer-events-none bg-gray-300"
                : "bg-gray-900 hover:bg-black"
            }`}
          >
            Finalizar compra por WhatsApp
          </a>
        </div>
      </aside>
    </div>
  );
}
