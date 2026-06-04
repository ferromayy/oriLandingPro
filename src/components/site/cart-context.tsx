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
import { formatArsPrice, formatSizeLabel } from "@/lib/coffees/types";
import type { CoffeeSizeGrams } from "@/types/database";
import type { GrindOption } from "@/lib/coffees/product-content";
import { getVariant } from "@/lib/coffees/helpers";

export type CartItem = {
  coffeeId: string;
  sizeGrams: CoffeeSizeGrams;
  grind: GrindOption;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
};

type AddItemParams = {
  coffee: Coffee;
  sizeGrams: CoffeeSizeGrams;
  imageUrl: string | null;
  quantity: number;
  grind: GrindOption;
};

type CartContextValue = {
  items: CartItem[];
  isOpen: boolean;
  total: number;
  count: number;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (params: AddItemParams) => void;
  removeItem: (coffeeId: string, sizeGrams: CoffeeSizeGrams, grind: GrindOption) => void;
  clearCart: () => void;
  whatsappCheckoutUrl: string;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "ori-cart-v3";

function itemKey(coffeeId: string, sizeGrams: number, grind: string) {
  return `${coffeeId}:${sizeGrams}:${grind}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration from localStorage
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

  const addItem = useCallback(
    ({ coffee, sizeGrams, imageUrl, quantity, grind }: AddItemParams) => {
      const variant = getVariant(coffee, sizeGrams);
      if (!variant?.is_available || variant.price <= 0) return;

      setItems((prev) => {
        const key = itemKey(coffee.id, sizeGrams, grind);
        const existing = prev.find(
          (i) => itemKey(i.coffeeId, i.sizeGrams, i.grind) === key,
        );
        if (existing) {
          return prev.map((i) =>
            itemKey(i.coffeeId, i.sizeGrams, i.grind) === key
              ? { ...i, quantity: i.quantity + quantity }
              : i,
          );
        }
        return [
          ...prev,
          {
            coffeeId: coffee.id,
            sizeGrams,
            grind,
            name: coffee.name,
            price: variant.price,
            quantity,
            imageUrl,
          },
        ];
      });
      setIsOpen(true);
    },
    [],
  );

  const removeItem = useCallback(
    (coffeeId: string, sizeGrams: CoffeeSizeGrams, grind: GrindOption) => {
      setItems((prev) =>
        prev.filter(
          (i) =>
            !(
              i.coffeeId === coffeeId &&
              i.sizeGrams === sizeGrams &&
              i.grind === grind
            ),
        ),
      );
    },
    [],
  );

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
      (i) =>
        `• ${i.name} (${formatSizeLabel(i.sizeGrams)}, ${i.grind}) x${i.quantity} — ${formatArsPrice(i.price * i.quantity)}`,
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
