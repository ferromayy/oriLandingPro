"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Coffee } from "@/lib/coffees/types";
import { formatArsPrice } from "@/lib/coffees/types";

export type CartItem = {
  coffeeId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
};

type CartContextValue = {
  items: CartItem[];
  isOpen: boolean;
  total: number;
  count: number;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (coffee: Coffee) => void;
  removeItem: (coffeeId: string) => void;
  clearCart: () => void;
  whatsappCheckoutUrl: string;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "ori-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        // Hidratación del carrito desde localStorage (solo cliente)
        // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional hydration
        setItems(JSON.parse(raw) as CartItem[]);
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = useCallback((coffee: Coffee) => {
    if (coffee.sold_out) return;
    setItems((prev) => {
      const existing = prev.find((i) => i.coffeeId === coffee.id);
      if (existing) {
        return prev.map((i) =>
          i.coffeeId === coffee.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [
        ...prev,
        {
          coffeeId: coffee.id,
          name: coffee.name,
          price: coffee.price_250g,
          quantity: 1,
          imageUrl: coffee.image_url,
        },
      ];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((coffeeId: string) => {
    setItems((prev) => prev.filter((i) => i.coffeeId !== coffeeId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const total = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items],
  );

  const count = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  );

  const whatsappCheckoutUrl = useMemo(() => {
    const lines = items.map(
      (i) => `• ${i.name} x${i.quantity} — ${formatArsPrice(i.price * i.quantity)}`,
    );
    const text = encodeURIComponent(
      `Hola Orí! Quiero consultar por mi pedido:\n\n${lines.join("\n")}\n\nTotal: ${formatArsPrice(total)}`,
    );
    return `https://wa.me/543513053755?text=${text}`;
  }, [items, total]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      isOpen,
      total,
      count,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      toggleCart: () => setIsOpen((v) => !v),
      addItem,
      removeItem,
      clearCart,
      whatsappCheckoutUrl,
    }),
    [items, isOpen, total, count, addItem, removeItem, clearCart, whatsappCheckoutUrl],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
  return ctx;
}
