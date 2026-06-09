"use client";

import { Fragment } from "react";
import Link from "next/link";
import type { PdpProduct } from "../../lib/pdp-data";
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

export default function ProductDetail({ product }: { product: PdpProduct }) {
  return (
    <PdpProvider>
      <div className="pdp">
        <MiniHeader hot={product.navHot} />
        <Breadcrumb product={product} />
        <div className="ptop editorial">
          <Gallery images={product.images} flag={product.galleryFlag} />
          <BuyBox product={product} />
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
