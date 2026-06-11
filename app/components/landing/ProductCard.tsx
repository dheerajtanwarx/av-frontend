"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { img, type Product } from "../../lib/landing-data";
import { HeartIcon } from "./Icons";
import { useCart } from "./CartContext";
import { useWishlist } from "./WishlistContext";
import { parseINR } from "../../lib/cart-data";

const delay = ["", "d1", "d2", "d3"];

export default function ProductCard({ product, index }: { product: Product; index: number }) {
  const router = useRouter();
  const { addItem, openDrawer } = useCart();
  const { isWished, toggle } = useWishlist();
  const [pop, setPop] = useState(false);
  const [added, setAdded] = useState(false);

  const mainImg = img(product.main, 900);
  const altImg = img(product.alt, 900);
  const wished = isWished(product.slug);
  const soldOut = product.soldOut === true;

  const onWish = () => {
    toggle({
      slug: product.slug,
      name: product.name,
      type: product.type,
      price: product.price,
      was: product.was ?? null,
      stars: product.stars,
      img: mainImg,
    });
    setPop(true);
    setTimeout(() => setPop(false), 320);
  };

  const buildItem = () => ({
    id: product.slug,
    slug: product.slug,
    name: product.name,
    type: product.type,
    color: { name: "Rani Pink", hex: "#bd3c6e" },
    size: "Free Size",
    madeToMeasure: false,
    price: parseINR(product.price),
    was: product.was ? parseINR(product.was) : null,
    qty: 1,
    img: mainImg,
  });

  const onAdd = () => {
    if (soldOut) return;
    addItem(buildItem());
    setAdded(true);
    openDrawer();
    setTimeout(() => setAdded(false), 1100);
  };

  const onBuyNow = () => {
    if (soldOut) return;
    addItem(buildItem());
    router.push("/cart");
  };

  return (
    <article className={`prod reveal ${delay[index % 4]}`}>
      <div className="imgwrap">
        <Link href={`/product/${product.slug}`} className="ph" aria-label={product.name}>
          {mainImg ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img className="main" src={mainImg} alt={product.name} />
          ) : (
            <div className="img-ph" />
          )}
          {altImg ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              className="alt"
              src={altImg}
              alt={`${product.name} alternate view`}
              loading="lazy"
            />
          ) : null}
        </Link>
        {soldOut ? (
          <span className="flag soldout">Sold Out</span>
        ) : (
          product.flag && (
            <span className={`flag${product.flag.sale ? " sale" : ""}`}>{product.flag.label}</span>
          )
        )}
        <button
          className={`wish${wished ? " on" : ""}${pop ? " pop" : ""}`}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wished}
          onClick={onWish}
        >
          <HeartIcon filled={wished} />
        </button>
        <div className="card-btns">
          <button className="addcart" onClick={onAdd} disabled={soldOut}>
            {soldOut ? "Sold Out" : added ? "✓ Added" : "Cart"}
          </button>
          <button className="buynow" onClick={onBuyNow} disabled={soldOut}>
            Buy Now
          </button>
        </div>
      </div>
      <Link href={`/product/${product.slug}`} className="pname">
        {product.name}
      </Link>
      <div className="ptype">{product.type}</div>
      <div className="pmeta">
        <span className="price">{product.price}</span>
        {product.was && <span className="was">{product.was}</span>}
        <span className="stars">{product.stars}</span>
      </div>
    </article>
  );
}
