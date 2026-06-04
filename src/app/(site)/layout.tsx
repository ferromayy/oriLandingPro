import { CartProvider } from "@/components/site/cart-context";
import { PromoBar } from "@/components/site/promo-bar";
import { SiteHeader } from "@/components/site/site-header";
import { CartDrawer } from "@/components/site/cart-drawer";
import { SiteFooter } from "@/components/site/site-footer";
import { WhatsAppFab } from "@/components/site/whatsapp-fab";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <PromoBar />
      <SiteHeader />
      <div className="flex flex-1 flex-col pt-28">{children}</div>
      <SiteFooter />
      <CartDrawer />
      <WhatsAppFab />
    </CartProvider>
  );
}
