import Link from "next/link";
import Image from "next/image";
import { getAllCoffeesAdmin } from "@/lib/coffees/admin";
import { formatArsPrice } from "@/lib/coffees/types";
import {
  getConfiguredPrice,
  getPrimaryImage,
  isCoffeeSoldOut,
} from "@/lib/coffees/helpers";
import { DeleteCoffeeButton } from "@/components/admin/delete-coffee-button";

export default async function AdminCoffeesPage() {
  let coffees: Awaited<ReturnType<typeof getAllCoffeesAdmin>> = [];
  let error: string | null = null;

  try {
    coffees = await getAllCoffeesAdmin();
  } catch (err) {
    error = err instanceof Error ? err.message : "Error al cargar cafés";
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Cafés</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Galería de 3–6 fotos y precios por 150g, 250g, 500g y 1kg.
          </p>
        </div>
        <Link
          href="/admin/coffees/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-black"
        >
          + Nuevo café
        </Link>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3">Fotos</th>
              <th className="px-4 py-3">Desde</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {coffees.map((coffee) => {
              const imageUrl = getPrimaryImage(coffee);
              const price = getConfiguredPrice(coffee);
              const soldOut = isCoffeeSoldOut(coffee);

              return (
                <tr key={coffee.id} className="border-b border-zinc-100 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 overflow-hidden rounded bg-zinc-100">
                        {imageUrl && (
                          <Image
                            src={imageUrl}
                            alt={coffee.name}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-zinc-900">{coffee.name}</p>
                        <p className="text-xs text-zinc-500">/{coffee.slug}</p>
                        {coffee.tasting_notes.trim() && (
                          <p className="mt-1 line-clamp-2 text-xs text-zinc-600">
                            Notas: {coffee.tasting_notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {coffee.coffee_images.length} foto
                    {coffee.coffee_images.length === 1 ? "" : "s"}
                  </td>
                  <td className="px-4 py-3">
                    {price !== null ? formatArsPrice(price) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {soldOut && (
                        <span className="rounded bg-black px-2 py-0.5 text-[10px] uppercase text-white">
                          Sold out
                        </span>
                      )}
                      {!coffee.is_active && (
                        <span className="rounded bg-zinc-200 px-2 py-0.5 text-[10px] uppercase text-zinc-700">
                          Oculto
                        </span>
                      )}
                      {!soldOut && coffee.is_active && (
                        <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] uppercase text-emerald-800">
                          Activo
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/coffees/${coffee.id}/edit`}
                        className="rounded border border-zinc-300 px-3 py-1 text-xs hover:bg-zinc-50"
                      >
                        Editar
                      </Link>
                      <DeleteCoffeeButton coffeeId={coffee.id} coffeeName={coffee.name} />
                    </div>
                  </td>
                </tr>
              );
            })}
            {coffees.length === 0 && !error && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                  No hay cafés. Creá el primero o ejecutá las migraciones SQL.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
