"use client";

import { useState } from "react";
import ProductCard from "../landing/ProductCard";
import type { Product } from "../../lib/landing-data";

type SortKey = "featured" | "price-asc" | "price-desc";

function parsePrice(p: string): number {
  return parseInt(p.replace(/[^\d]/g, ""), 10) || 0;
}

const SORT_LABELS: Record<SortKey, string> = {
  featured: "Featured",
  "price-asc": "Price ↑",
  "price-desc": "Price ↓",
};

export default function CategoryListing({
  categoryName,
  products,
}: {
  categoryName: string;
  products: Product[];
}) {
  const [sort, setSort] = useState<SortKey>("featured");

  const sorted = [...products].sort((a, b) => {
    if (sort === "price-asc") return parsePrice(a.price) - parsePrice(b.price);
    if (sort === "price-desc") return parsePrice(b.price) - parsePrice(a.price);
    return 0;
  });

  return (
    <main className="cat-page">
      <div className="cat-hero">
        <div className="wrap">
          <nav className="cat-breadcrumb">
            <a href="/">Home</a>
            <span className="sep">/</span>
            <span>{categoryName}</span>
          </nav>
          <h1>
            {categoryName.includes(" ") ? (
              <>
                {categoryName.split(" ").slice(0, -1).join(" ")}{" "}
                <em>{categoryName.split(" ").slice(-1)}</em>
              </>
            ) : (
              <em>{categoryName}</em>
            )}
          </h1>
          <p className="cat-subtitle">{products.length} styles available</p>
        </div>
      </div>

      <div className="wrap">
        <div className="cat-bar">
          <span className="cat-bar-count">
            {sorted.length} product{sorted.length !== 1 ? "s" : ""}
          </span>
          <div className="cat-sort">
            <span className="cat-sort-label">Sort</span>
            {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
              <button
                key={k}
                className={`cat-sort-btn${sort === k ? " active" : ""}`}
                onClick={() => setSort(k)}
              >
                {SORT_LABELS[k]}
              </button>
            ))}
          </div>
        </div>

        {sorted.length === 0 ? (
          <div className="cat-empty">
            <p>No products in this collection yet — check back soon.</p>
            <a href="/" className="btn btn-rani">
              Back to Home
            </a>
          </div>
        ) : (
          <div className="prods cat-grid">
            {sorted.map((p, i) => (
              <ProductCard key={p.slug} product={p} index={i} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
