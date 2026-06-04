import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCoffeeBySlug } from "@/lib/coffees/queries";
import { formatArsPrice } from "@/lib/coffees/types";
import { AddToCartButton } from "@/components/site/add-to-cart-button";

type Props = { params: Promise<{ slug: string }> };

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const coffee = await getCoffeeBySlug(slug);

  if (!coffee) notFound();

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-12 sm:px-10">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-1 text-xs uppercase tracking-widest text-gray-600 hover:text-gray-900"
      >
        <span className="material-icons-outlined text-base">arrow_back</span>
        Volver
      </Link>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {coffee.image_url && (
            <Image
              src={coffee.image_url}
              alt={coffee.name}
              fill
              className={`object-cover ${coffee.sold_out ? "opacity-60" : ""}`}
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          )}
          {coffee.sold_out && (
            <span className="absolute left-4 top-4 bg-black px-3 py-1 text-xs uppercase tracking-widest text-white">
              Sold Out
            </span>
          )}
        </div>

        <div>
          {coffee.codename && (
            <p className="font-mono text-xs uppercase tracking-widest text-gray-500">
              {coffee.codename}
            </p>
          )}
          <h1 className="mt-2 text-2xl font-medium uppercase tracking-wide text-gray-900 lg:text-3xl">
            {coffee.name}
          </h1>
          <p className="mt-4 text-lg font-medium">{formatArsPrice(coffee.price_250g)}</p>
          {coffee.price_1000g && (
            <p className="text-sm text-gray-600">
              1 kg: {formatArsPrice(coffee.price_1000g)}
            </p>
          )}

          <div className="mt-6 space-y-4 text-sm text-gray-700">
            <p>
              <strong>Notas:</strong> {coffee.tasting_notes.replace(/^Notas:\s*/i, "")}
            </p>
            {coffee.description && <p>{coffee.description}</p>}
          </div>

          <div className="mt-8">
            <AddToCartButton coffee={coffee} />
          </div>
        </div>
      </div>
    </main>
  );
}
