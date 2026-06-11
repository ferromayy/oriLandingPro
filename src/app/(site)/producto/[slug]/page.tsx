import { notFound } from "next/navigation";
import { getCoffeeBySlug } from "@/lib/coffees/queries";
import { ProductGallery } from "@/components/site/product-gallery";
import { ProductPurchasePanel } from "@/components/site/product-purchase-panel";
import { ProductDetailContent } from "@/components/site/product-detail-content";
import { ProductBadges } from "@/components/site/product-badges";
import { isCoffeeLaunchDay, isCoffeeSoldOut } from "@/lib/coffees/helpers";

type Props = { params: Promise<{ slug: string }> };

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const coffee = await getCoffeeBySlug(slug);

  if (!coffee) notFound();

  const soldOut = isCoffeeSoldOut(coffee);
  const isLaunch = isCoffeeLaunchDay(coffee);

  return (
    <main className="flex-1 bg-white">
      <div className="grid min-h-[calc(100vh-80px)] grid-cols-1 lg:grid-cols-2">
        <div className="relative">
          <ProductBadges soldOut={soldOut} isLaunch={isLaunch} size="detail" />
          <ProductGallery coffee={coffee} />
        </div>

        <ProductPurchasePanel coffee={coffee} />
      </div>

      <ProductDetailContent coffee={coffee} />
    </main>
  );
}
