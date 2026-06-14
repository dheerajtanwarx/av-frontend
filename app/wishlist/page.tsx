"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import Header from "../components/landing/Header";
import { useWishlist, type WishItem } from "../components/landing/WishlistContext";
import { useCart } from "../components/landing/CartContext";
import { parseINR } from "../lib/cart-data";

function WishlistCard({ item }: { item: WishItem }) {
  const { remove } = useWishlist();
  const { addItem, openDrawer } = useCart();
  const [moving, setMoving] = useState(false);
  const inStock = item.inStock !== false;

  const moveToCart = () => {
    if (!inStock || moving) return;
    setMoving(true);
    addItem({
      id: item.slug,
      slug: item.slug,
      name: item.name,
      type: item.type,
      color: { name: "Rani Pink", hex: "#bd3c6e" },
      size: "Free Size",
      madeToMeasure: false,
      price: parseINR(item.price),
      was: item.was ? parseINR(item.was) : null,
      qty: 1,
      img: item.img,
    });
    openDrawer();
    // Moving = add to cart then drop from wishlist.
    remove(item.slug);
  };

  return (
    <article className="wl-card">
      <Link href={`/product/${item.slug}`} className="wl-thumb" aria-label={item.name}>
        {item.img ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={item.img} alt={item.name} />
        ) : (
          <div className="wl-thumb-ph" />
        )}
        <span className={`wl-stock${inStock ? " in" : " out"}`}>
          {inStock ? "In stock" : "Out of stock"}
        </span>
      </Link>

      <div className="wl-body">
        <Link href={`/product/${item.slug}`} className="wl-name">
          {item.name}
        </Link>
        {item.type && <div className="wl-type">{item.type}</div>}
        <div className="wl-meta">
          <span className="wl-price">{item.price}</span>
          {item.was && <span className="wl-was">{item.was}</span>}
        </div>

        <div className="wl-actions">
          <button className="wl-move" onClick={moveToCart} disabled={!inStock}>
            {inStock ? "Move to Cart" : "Unavailable"}
          </button>
          <button
            className="wl-remove"
            onClick={() => remove(item.slug)}
            aria-label="Remove from wishlist"
          >
            Remove
          </button>
        </div>
      </div>
    </article>
  );
}

function Skeletons() {
  return (
    <div className="wl-grid">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="wl-card wl-skel">
          <div className="wl-thumb wl-skel-box" />
          <div className="wl-body">
            <div className="wl-skel-line" style={{ width: "70%" }} />
            <div className="wl-skel-line" style={{ width: "45%" }} />
            <div className="wl-skel-line" style={{ width: "30%" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function WishlistPage() {
  const { items, loading, count } = useWishlist();

  return (
    <main className="av wl-page">
      <Header />
      <section className="wl-shell">
        <div className="wl-head">
          <h1>
            My <em>Wishlist</em>
          </h1>
          {count > 0 && (
            <p className="wl-sub">
              {count} saved {count === 1 ? "piece" : "pieces"}
            </p>
          )}
        </div>

        {loading ? (
          <Skeletons />
        ) : items.length === 0 ? (
          <div className="wl-empty">
            <Heart strokeWidth={1.4} aria-hidden="true" />
            <h3>Your wishlist is empty</h3>
            <p>Tap the heart on any piece to save it here for later.</p>
            <Link href="/" className="wl-browse">
              Browse products
            </Link>
          </div>
        ) : (
          <div className="wl-grid">
            {items.map((item) => (
              <WishlistCard key={item.slug} item={item} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
