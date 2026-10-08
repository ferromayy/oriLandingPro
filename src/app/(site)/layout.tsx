import { CartProvider } from "@/components/site/cart-context";
import { PromoBar } from "@/components/site/promo-bar";
import { SiteHeader } from "@/components/site/site-header";
import { CartDrawer } from "@/components/site/cart-drawer";
import { SiteFooter } from "@/components/site/site-footer";
import { WhatsAppFab } from "@/components/site/whatsapp-fab";
import { MetaPixelPageViews } from "@/components/site/meta-pixel";
import {
  META_PIXEL_BOOTSTRAP,
  META_PIXEL_ID,
} from "@/components/site/meta-pixel-snippet";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <script
        dangerouslySetInnerHTML={{ __html: META_PIXEL_BOOTSTRAP }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          alt=""
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
        />
      </noscript>
      <MetaPixelPageViews />
      <PromoBar />
      <SiteHeader />
      <div className="flex flex-1 flex-col pt-28">{children}</div>
      <SiteFooter />
      <CartDrawer />
      <WhatsAppFab />
    </CartProvider>
  );
}
