"use client";

import { useState } from "react";
import { RectangleVertical, Columns2, Columns3 } from "lucide-react";
import ProductCard from "../landing/ProductCard";
import { usePriceSort, PriceSortBar } from "../product/PriceSortBar";
import type { Product } from "../../lib/landing-data";

/* The handoff's signature control: retile the grid one tap apart — editorial
   one-up, the balanced two-up house standard, or a dense three-up scan. The
   density only drives `data-density` on the grid; the cards adapt purely in
   CSS, so the shared ProductCard stays untouched. */
type Density = 1 | 2 | 3;
const VIEWS: { d: Density; label: string; icon: React.ReactElement }[] = [
  { d: 1, label: "One per row", icon: <RectangleVertical size={18} strokeWidth={1.6} /> },
  { d: 2, label: "Two per row", icon: <Columns2 size={18} strokeWidth={1.6} /> },
  { d: 3, label: "Three per row", icon: <Columns3 size={18} strokeWidth={1.6} /> },
];

function ViewControl({
  density,
  onChange,
}: {
  density: Density;
  onChange: (d: Density) => void;
}) {
  return (
    <div className="cat-view" role="group" aria-label="Grid density">
      {VIEWS.map((v) => (
        <button
          key={v.d}
          type="button"
          className={"cat-view-seg" + (density === v.d ? " on" : "")}
          aria-pressed={density === v.d}
          aria-label={v.label}
          title={v.label}
          onClick={() => onChange(v.d)}
        >
          {v.icon}
        </button>
      ))}
    </div>
  );
}

export default function CategoryListing({
  categoryName,
  products,
}: {
  categoryName: string;
  products: Product[];
}) {
  const ps = usePriceSort(products);
  const { filtered, isFiltered, reset } = ps;
  const [density, setDensity] = useState<Density>(2);

  return (
    <main className="cat-page av-cat">
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
          <div className="cat-bar-controls">
            <PriceSortBar state={ps} />
            <ViewControl density={density} onChange={setDensity} />
          </div>
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
          <>
            <div className="prods cat-grid" data-density={density}>
              {filtered.map((p, i) => (
                <ProductCard key={p.slug} product={p} index={i} reveal={false} />
              ))}
            </div>
            <p className="cat-endnote">You&rsquo;ve reached the end of the edit.</p>
          </>
        )}
      </div>
    </main>
  );
}
