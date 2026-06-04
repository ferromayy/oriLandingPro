"use client";

export function PromoBar() {
  const message =
    "🎉 Envío gratuito en Córdoba capital por lanzamiento · 📦 Compra ahora y recibe en las próximas 24hs · Envío gratuito en Córdoba Capital";

  return (
    <div className="fixed top-0 z-[60] h-8 w-full overflow-hidden bg-blue-600 text-white">
      <div className="animate-scroll flex whitespace-nowrap text-xs font-medium tracking-wide">
        <span className="px-8 py-2">{message}</span>
        <span className="px-8 py-2" aria-hidden>
          {message}
        </span>
      </div>
    </div>
  );
}
