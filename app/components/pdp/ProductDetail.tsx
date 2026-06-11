"use client";

"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { colorImages, type PdpColor, type PdpProduct } from "../../lib/pdp-data";
import { PdpProvider } from "./PdpContext";
import MiniHeader from "./MiniHeader";
import Gallery from "./Gallery";
import BuyBox from "./BuyBox";
import { CraftBand, ReviewsSection, ShopTheLook, Related, SlimFooter } from "./Sections";
import Toast from "./Toast";

function Breadcrumb({ product }: { product: PdpProduct }) {
  return (
    <div className="crumb">
      <Link href="/">Home</Link>
      {product.crumb.map((c) => (
        <Fragment key={c}>
          <span className="sep">/</span>
          <Link href="/">{c}</Link>
        </Fragment>
      ))}
      <span className="sep">/</span>
      <span className="cur">{product.name}</span>
    </div>
  );
}

/** Units available for a colour; colours without stock data stay purchasable. */
function stockOf(c: PdpColor): number {
  return c.stock === undefined ? Infinity : c.stock;
}

export default function ProductDetail({ product }: { product: PdpProduct }) {
  // The selected colour lives here (not in BuyBox) so the gallery and the buy
  // box stay in sync — picking a colour swaps the gallery with no API call.
  // Default to the first in-stock colour, falling back to the first listed.
  const [color, setColor] = useState<PdpColor>(
    () => product.colors.find((c) => stockOf(c) > 0) ?? product.colors[0]
  );

  const galleryImages = useMemo(() => colorImages(product, color), [product, color]);

  // Warm the browser cache with every colour's images on mount so a later
  // switch is instant and flicker-free. Best-effort; skipped during SSR.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = new Set<string>();
    for (const c of product.colors) {
      for (const src of c.images ?? []) {
        if (src && !seen.has(src)) {
          seen.add(src);
          const im = new Image();
          im.src = src;
        }
      }
    }
  }, [product]);

  return (
    <PdpProvider>
      <div className="pdp">
        <MiniHeader hot={product.navHot} />
        <Breadcrumb product={product} />
        <div className="ptop editorial">
          <Gallery images={galleryImages} flag={product.galleryFlag} />
          <BuyBox product={product} color={color} onSelectColor={setColor} />
        </div>
        <CraftBand product={product} />
        <ReviewsSection product={product} />
        <ShopTheLook product={product} />
        <Related product={product} />
        <SlimFooter />
        <Toast />
      </div>
    </PdpProvider>
  );
}
