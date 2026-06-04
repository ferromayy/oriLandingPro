import Link from "next/link";
import Image from "next/image";
import type { Coffee } from "@/lib/coffees/types";
import { formatArsPrice } from "@/lib/coffees/types";

export function ProductCard({ coffee }: { coffee: Coffee }) {
  return (
    <Link
      href={`/producto/${coffee.slug}`}
      className="group flex flex-col bg-white"
    >
      <div className="relative mb-4 aspect-square overflow-hidden">
        {coffee.sold_out && (
          <span className="absolute left-3 top-3 z-10 bg-black px-2 py-1 text-[10px] font-medium uppercase tracking-widest text-white">
            Sold Out
          </span>
        )}
        {coffee.image_url ? (
          <Image
            src={coffee.image_url}
            alt={coffee.name}
            fill
            className={`object-cover transition-transform duration-500 group-hover:scale-110 ${
              coffee.sold_out ? "opacity-60" : ""
            }`}
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gray-100 text-sm text-gray-400">
            Sin imagen
          </div>
        )}
      </div>

      <div className="flex items-start justify-between gap-4">
        <h3 className="text-sm font-medium uppercase tracking-widest text-gray-900">
          {coffee.name}
        </h3>
        <p className="shrink-0 text-sm font-medium text-gray-900">
          {formatArsPrice(coffee.price_250g)}
        </p>
      </div>

      <p className="mt-2 text-xs text-gray-600">
        {coffee.tasting_notes.startsWith("Notas:")
          ? coffee.tasting_notes
          : `Notas: ${coffee.tasting_notes}`}
      </p>

      <span className="mt-3 text-xs font-medium uppercase tracking-wide text-gray-900 underline underline-offset-4">
        Ver detalles
      </span>
    </Link>
  );
}
