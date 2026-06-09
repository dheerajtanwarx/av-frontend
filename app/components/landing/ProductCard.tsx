"use client";

import { useState } from "react";
import Link from "next/link";
import { img, type Product } from "../../lib/landing-data";
import { CompareIcon, HeartIcon } from "./Icons";
import { useCart } from "./CartContext";

const delay = ["", "d1", "d2", "d3"];

export default function ProductCard({ product, index }: { product: Product; index: number }) {
  const { add } = useCart();
  const [wished, setWished] = useState(false);
  const [compared, setCompared] = useState(false);
  const [added, setAdded] = useState(false);

  const onAdd = () => {
    add();
    setAdded(true);
    setTimeout(() => setAdded(false), 1100);
  };

  return (
    <article className={`prod reveal ${delay[index % 4]}`}>
      <div className="imgwrap">
        <Link href={`/product/${product.slug}`} className="ph" aria-label={product.name}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="main" src={img(product.main, 900)} alt={product.name} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="alt"
            src={img(product.alt, 900)}
            alt={`${product.name} alternate view`}
            loading="lazy"
          />
        </Link>
        {product.flag && (
          <span className={`flag${product.flag.sale ? " sale" : ""}`}>{product.flag.label}</span>
        )}
        <div className="actions">
          <button
            className={`compare${compared ? " on" : ""}`}
            aria-label="Compare"
            aria-pressed={compared}
            onClick={() => setCompared((v) => !v)}
          >
            <CompareIcon />
          </button>
          <button
            className={`wish${wished ? " on" : ""}`}
            aria-label="Add to wishlist"
            aria-pressed={wished}
            onClick={() => setWished((v) => !v)}
          >
            <HeartIcon filled={wished} />
          </button>
        </div>
        <button className="addcart" onClick={onAdd}>
          {added ? "Added ✓" : "Add to Cart"}
        </button>
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
