"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";

/**
 * Non-critical global chrome, kept out of the initial first-load JS.
 *
 * These are mounted once in the root layout but none of them is needed for the
 * first paint:
 *  - CartDrawer / CartToast are hidden overlays (no visible layout until the
 *    shopper opens the cart or adds an item),
 *  - WhatsAppButton is a position:fixed CTA (loads in without shifting content).
 *
 * `ssr: false` drops them from the server HTML and the initial bundle; the
 * chunks fetch right after hydration so they're already warm by the time the
 * shopper interacts. The idle preload below is belt-and-braces: it guarantees
 * the CartDrawer module is fetched as soon as the browser is idle so the very
 * first cart-icon click opens instantly, even on a slow connection.
 */
const CartDrawer = dynamic(() => import("./cart/CartDrawer"), { ssr: false });
const CartToast = dynamic(() => import("./cart/CartToast"), { ssr: false });
const WhatsAppButton = dynamic(() => import("./landing/WhatsAppButton"), {
  ssr: false,
});

export default function DeferredChrome() {
  useEffect(() => {
    const preload = () => {
      // Warm the cart chunks ahead of the first interaction.
      void import("./cart/CartDrawer");
      void import("./cart/CartToast");
    };
    const ric = (
      window as unknown as {
        requestIdleCallback?: (cb: () => void) => number;
      }
    ).requestIdleCallback;
    if (typeof ric === "function") {
      ric(preload);
    } else {
      const t = setTimeout(preload, 1500);
      return () => clearTimeout(t);
    }
  }, []);

  return (
    <>
      <CartDrawer />
      <CartToast />
      <WhatsAppButton />
    </>
  );
}
