"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/site/cart-context";
import { EDUCATION_PUBLIC_ENABLED } from "@/lib/site/features";

const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/cafe", label: "Café" },
  ...(EDUCATION_PUBLIC_ENABLED
    ? [{ href: "/educacion", label: "Educación" as const }]
    : []),
  { href: "/suscripciones", label: "Suscripciones" },
  { href: "/mayoristas", label: "Mayoristas y asesoramiento" },
  { href: "/nosotros", label: "Nosotros" },
];

const navLinkClass =
  "text-xs font-medium uppercase tracking-widest text-gray-900 transition-colors hover:text-gray-600";

export function SiteHeader() {
  const { count, toggleCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-8 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-20 max-w-[1920px] items-center justify-between px-4 sm:px-10">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/brand/logo.png"
              alt="Orí Cafe"
              width={120}
              height={48}
              className="h-10 w-auto object-contain"
              priority
            />
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={navLinkClass}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleCart}
              className="relative flex items-center gap-1 px-2 py-1 text-gray-900"
              aria-label="Abrir carrito"
            >
              <span className="material-icons-outlined text-[22px]">
                shopping_cart
              </span>
              {count > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[10px] font-mono text-white">
                  {count}
                </span>
              )}
            </button>

            <button
              type="button"
              className="p-2 lg:hidden"
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menú"
            >
              <span className="material-icons-outlined">menu</span>
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
            aria-label="Cerrar menú"
          />
          <div className="absolute right-0 top-0 flex h-full w-64 flex-col bg-white p-6 shadow-xl">
            <div className="mb-8 flex items-center justify-between">
              <span className="text-sm font-semibold uppercase tracking-widest">
                Menú
              </span>
              <button type="button" onClick={() => setMenuOpen(false)}>
                <span className="material-icons-outlined">close</span>
              </button>
            </div>
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={navLinkClass}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
