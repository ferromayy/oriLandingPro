import { notFound } from "next/navigation";
import { getCoffeeBySlug } from "@/lib/coffees/queries";
import { ProductGallery } from "@/components/site/product-gallery";
import { ProductPurchasePanel } from "@/components/site/product-purchase-panel";
import { ProductDetailContent } from "@/components/site/product-detail-content";
import { isCoffeeSoldOut } from "@/lib/coffees/helpers";

type Props = { params: Promise<{ slug: string }> };

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const coffee = await getCoffeeBySlug(slug);

  if (!coffee) notFound();

  const soldOut = isCoffeeSoldOut(coffee);

  return (
    <main className="flex-1 bg-white">
      <div className="grid min-h-[calc(100vh-80px)] grid-cols-1 lg:grid-cols-2">
        <div className="relative">
          {soldOut && (
            <span className="absolute left-6 top-6 z-10 bg-black px-3 py-1 text-xs uppercase tracking-widest text-white lg:left-8 lg:top-8">
              Sold Out
            </span>
          )}
          <ProductGallery coffee={coffee} />
        </div>

        <ProductPurchasePanel coffee={coffee} />
      </div>

      <ProductDetailContent coffee={coffee} />
    </main>
  );
}
