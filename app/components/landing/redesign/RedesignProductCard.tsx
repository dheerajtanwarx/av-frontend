"use client";

import { useState } from "react";
import Link from "next/link";
import { img, type Product } from "../../../lib/landing-data";
import { parseINR } from "../../../lib/cart-data";
import { useCart } from "../CartContext";
import { useWishlist } from "../WishlistContext";

/* The "quiet add" card from the landing redesign: a clean 3:4 portrait with a
   single heart overlay, a serif name, a faint craft caption, the price with an
   optional struck-through "was", a parenthetical rating, and one 48px outline
   "Add to bag". No flags clutter the resolved grid beyond Sold out. */
export default function RedesignProductCard({ product }: { product: Product }) {
  const { addItem, notifyAdded } = useCart();
  const { isWished, toggle } = useWishlist();
  const [added, setAdded] = useState(false);

  const mainImg = img(product.main, 700);
  const wished = isWished(product.slug);
  const soldOut = product.soldOut === true;

  // Cards carry a glyph rating only — show it as a calm "(4.0)" parenthetical
  // rather than a row of stars, per the design's rule.
  const ratingValue = (product.stars?.match(/★/g) || []).length;

  const colors = product.colors;
  const firstInStock = colors?.find((c) => c.stock > 0) ?? null;
  const addColor = firstInStock
    ? { name: firstInStock.name, hex: firstInStock.hex }
    : { name: "Rani Pink", hex: "#b23a66" };

  const onWish = () =>
    toggle({
      slug: product.slug,
      name: product.name,
      type: product.type,
      price: product.price,
      was: product.was ?? null,
      stars: product.stars,
      img: mainImg,
    });

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
      img: mainImg,
    });
    notifyAdded({ name: product.name, variant: addColor.name, thumb: mainImg });
    setAdded(true);
    setTimeout(() => setAdded(false), 1100);
  };

  return (
    <article className="lp-prod">
      <Link href={`/product/${product.slug}`} className="lp-prod-img" aria-label={product.name}>
        {mainImg ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={mainImg} alt={product.name} loading="lazy" />
        ) : null}
        {soldOut && <span className="lp-flag soldout">Sold out</span>}
        <button
          type="button"
          className={`lp-wish${wished ? " on" : ""}`}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wished}
          onClick={(e) => {
            e.preventDefault();
            onWish();
          }}
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 20s-7-4.4-9.2-8.5C1.3 8.3 2.7 5 6 5c2 0 3.2 1.2 4 2.3C10.8 6.2 12 5 14 5c3.3 0 4.7 3.3 3.2 6.5C19 15.6 12 20 12 20z" />
          </svg>
        </button>
      </Link>
      <div className="lp-prod-body">
        <Link href={`/product/${product.slug}`} className="lp-prod-name">
          {product.name}
        </Link>
        <div className="lp-prod-type">{product.type}</div>
        <div className="lp-prod-meta">
          <span className="lp-price">{product.price}</span>
          {product.was && <span className="lp-was">{product.was}</span>}
          {ratingValue > 0 && (
            <span className="lp-rating" aria-label={`Rated ${ratingValue} out of 5`}>
              ({ratingValue.toFixed(1)})
            </span>
          )}
        </div>
        <button
          type="button"
          className={`lp-add${added ? " added" : ""}`}
          onClick={onAdd}
          disabled={soldOut}
        >
          {soldOut ? "Sold out" : added ? "✓ Added to bag" : "Add to bag"}
        </button>
      </div>
    </article>
  );
}
