"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { img, type Product } from "../../../../lib/landing-data";
import { parseINR } from "../../../../lib/cart-data";
import { useCart } from "../../CartContext";

/* The "shop this look" card pinned to the bottom of a reel/post in the
   lightbox — thumbnail + name + price + an ADD TO CART button, matching the
   Indian Sandook shoppable-reel pattern. Adds the first in-stock colour (like
   the product card) and pops the cart toast; the thumbnail/name still deep-link
   to the PDP for the full choice of colour and size. */
export default function SocialCTA({ product }: { product: Product }) {
  const { addItem, notifyAdded } = useCart();
  const [added, setAdded] = useState(false);

  const thumb = img(product.main, 200);
  const soldOut = product.soldOut === true;
  const firstInStock = product.colors?.find((c) => c.stock > 0) ?? null;
  const addColor = firstInStock
    ? { name: firstInStock.name, hex: firstInStock.hex }
    : { name: "Rani Pink", hex: "#b23a66" };

  const onAdd = () => {
    if (soldOut) return;
    addItem({
      id: product.slug,
      slug: product.slug,
      name: product.name,
      type: product.type,
      color: addColor,
      size: "Free Size",
      madeToMeasure: false,
      price: parseINR(product.price),
      was: product.was ? parseINR(product.was) : null,
      qty: 1,
      img: thumb,
    });
    notifyAdded({ name: product.name, variant: addColor.name, thumb });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="sl-cta">
      <Link href={`/product/${product.slug}`} className="sl-cta-top" prefetch={false}>
        <span className="sl-cta-thumb">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumb} alt="" loading="lazy" />
        </span>
        <span className="sl-cta-body">
          <span className="sl-cta-name">{product.name}</span>
          <span className="sl-cta-price">
            {product.price}
            {product.was && <s className="sl-cta-was">{product.was}</s>}
          </span>
        </span>
      </Link>
      <button
        type="button"
        className="sl-cta-add"
        onClick={onAdd}
        disabled={soldOut}
      >
        {soldOut ? (
          "Sold out"
        ) : added ? (
          <>
            <Check size={16} /> Added
          </>
        ) : (
          "Add to cart"
        )}
      </button>
    </div>
  );
}
