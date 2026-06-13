"use client";

import ProductCard from "../landing/ProductCard";
import { usePriceSort, PriceSortBar } from "../product/PriceSortBar";
import type { Product } from "../../lib/landing-data";

export default function CategoryListing({
  categoryName,
  products,
}: {
  categoryName: string;
  products: Product[];
}) {
  const ps = usePriceSort(products);
  const { filtered, isFiltered, reset } = ps;

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
            {filtered.length} product{filtered.length !== 1 ? "s" : ""}
          </span>
          <PriceSortBar state={ps} />
        </div>

        {filtered.length === 0 ? (
          <div className="cat-empty">
            <p>
              {isFiltered
                ? "No pieces in this price range — try widening it."
                : "No products in this collection yet — check back soon."}
            </p>
            {isFiltered ? (
              <button type="button" className="btn btn-rani" onClick={reset}>
                Clear price filter
              </button>
            ) : (
              <a href="/" className="btn btn-rani">
                Back to Home
              </a>
            )}
          </div>
        ) : (
          <div className="prods cat-grid">
            {filtered.map((p, i) => (
              <ProductCard key={p.slug} product={p} index={i} reveal={false} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
