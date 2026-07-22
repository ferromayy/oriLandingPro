"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { useCart } from "@/components/site/cart-context";
import {
  EDUCATION_PUBLIC_ENABLED,
  SUBSCRIPTIONS_JOIN_URL,
} from "@/lib/site/features";

const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/cafe", label: "Café" },
  ...(EDUCATION_PUBLIC_ENABLED
    ? [{ href: "/educacion", label: "Educación" as const }]
    : []),
  { href: SUBSCRIPTIONS_JOIN_URL, label: "Suscripciones" },
  { href: "/mayoristas", label: "Mayoristas y asesoramiento" },
  { href: "/nosotros", label: "Nosotros" },
];

function AnimatedNavLabel({ label }: { label: string }) {
  const chars = Array.from(label.toLocaleUpperCase("es-AR"));

  return (
    <span className="ori-nav-letters" aria-hidden="true">
      {chars.map((char, index) => {
        if (char === " ") {
          return (
            <span key={`space-${index}`} className="ori-nav-letter-space">
              {"\u00A0"}
            </span>
          );
        }

        const style = {
          ["--ori-d" as string]: `${index * 18}ms`,
        } as CSSProperties;

        return (
          <span key={`${char}-${index}`} className="ori-nav-letter" style={style}>
            {char}
          </span>
        );
      })}
    </span>
  );
}

function NavItem({
  href,
  label,
  onClick,
}: {
  href: string;
  label: string;
  onClick?: () => void;
}) {
  const isExternal = href.startsWith("http");
  const className = "ori-nav-item text-xs font-medium tracking-widest";

  if (isExternal) {
    return (
      <a
        href={href}
        onClick={onClick}
        className={className}
        aria-label={label}
        rel="noopener noreferrer"
      >
        <span className="sr-only">{label}</span>
        <AnimatedNavLabel label={label} />
      </a>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className={className}
      aria-label={label}
    >
      <span className="sr-only">{label}</span>
      <AnimatedNavLabel label={label} />
    </Link>
  );
}

const NAV_LETTER_STYLES = `
.ori-nav-item { display: inline-flex; color: #111827; }
.ori-nav-letters { display: inline-flex; }
.ori-nav-letter {
  display: inline-block;
  color: #111827;
  transform: translateY(0);
  transition: transform 0.15s ease;
  transition-delay: 0ms;
}
.ori-nav-letter-space { display: inline-block; width: 0.35em; }
.ori-nav-item:hover .ori-nav-letter,
.ori-nav-item:focus-visible .ori-nav-letter {
  transform: translateY(-5px);
  transition-delay: var(--ori-d, 0ms);
}
@media (prefers-reduced-motion: reduce) {
  .ori-nav-item:hover .ori-nav-letter,
  .ori-nav-item:focus-visible .ori-nav-letter { transform: none; }
}
`;

export function SiteHeader() {
  const { count, toggleCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: NAV_LETTER_STYLES }} />
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
              <NavItem key={link.href} href={link.href} label={link.label} />
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
            <nav className="flex flex-col items-start gap-5">
              {navLinks.map((link) => (
                <NavItem
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  onClick={() => setMenuOpen(false)}
                />
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
