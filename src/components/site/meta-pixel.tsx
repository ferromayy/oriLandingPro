"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/** PageView extra en navegaciones del sitio (Next no recarga la página). */
export function MetaPixelPageViews() {
  const pathname = usePathname();
  const skipInitialView = useRef(true);

  useEffect(() => {
    if (skipInitialView.current) {
      skipInitialView.current = false;
      return;
    }
    window.fbq?.("track", "PageView");
  }, [pathname]);

  return null;
}
