"use client";

import { useMemo, useState } from "react";
import type { Product } from "../../lib/landing-data";

export type SortKey = "featured" | "price-asc" | "price-desc";

/** Pull the numeric rupee value out of a display price like "₹3,450". */
export function parsePrice(p: string): number {
  return parseInt(p.replace(/[^\d]/g, ""), 10) || 0;
}

/** Format a number back into an INR display string, e.g. 3450 -> "₹3,450". */
export function fmtPrice(n: number): string {
  return "₹" + n.toLocaleString("en-IN");
}

const SORT_LABELS: Record<SortKey, string> = {
  featured: "Featured",
  "price-asc": "Price ↑",
  "price-desc": "Price ↓",
};

export type PriceSort = {
  /** The products after price filtering + sorting are applied. */
  filtered: Product[];
  sort: SortKey;
  setSort: (s: SortKey) => void;
  bounds: { min: number; max: number };
  /** True only when the products span more than one price point. */
  hasRange: boolean;
  lo: number;
  hi: number;
  setLo: (n: number) => void;
  setHi: (n: number) => void;
  /** True when the user has narrowed the price window. */
  isFiltered: boolean;
  reset: () => void;
};

/**
 * Sort + price-filter state for a set of products. The selected price window
 * resets to the full span whenever the underlying product set changes — this
 * keeps a live-updating list (e.g. search results) sane while leaving a stable
 * list (a category page) untouched after mount.
 */
export function usePriceSort(products: Product[]): PriceSort {
  const [sort, setSort] = useState<SortKey>("featured");

  const bounds = useMemo(() => {
    const values = products.map((p) => parsePrice(p.price));
    if (values.length === 0) return { min: 0, max: 0 };
    return { min: Math.min(...values), max: Math.max(...values) };
  }, [products]);

  const hasRange = bounds.max > bounds.min;

  // Selected price window. When the bounds shift (e.g. a fresh search result
  // set) the window re-seeds to the full span — done during render via a
  // tracked signature rather than an effect, per React's reset-on-prop pattern.
  const [win, setWin] = useState({ lo: bounds.min, hi: bounds.max });
  const [seen, setSeen] = useState({ min: bounds.min, max: bounds.max });
  if (seen.min !== bounds.min || seen.max !== bounds.max) {
    setSeen({ min: bounds.min, max: bounds.max });
    setWin({ lo: bounds.min, hi: bounds.max });
  }
  const { lo, hi } = win;
  const setLo = (n: number) => setWin((w) => ({ ...w, lo: n }));
  const setHi = (n: number) => setWin((w) => ({ ...w, hi: n }));

  const filtered = useMemo(() => {
    const list = hasRange
      ? products.filter((p) => {
          const v = parsePrice(p.price);
          return v >= lo && v <= hi;
        })
      : products;

    const sorted = [...list];
    if (sort === "price-asc") {
      sorted.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
    } else if (sort === "price-desc") {
      sorted.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
    }
    return sorted;
  }, [products, hasRange, lo, hi, sort]);

  const isFiltered = hasRange && (lo > bounds.min || hi < bounds.max);
  const reset = () => setWin({ lo: bounds.min, hi: bounds.max });

  return {
    filtered,
    sort,
    setSort,
    bounds,
    hasRange,
    lo,
    hi,
    setLo,
    setHi,
    isFiltered,
    reset,
  };
}

/** The price slider + sort chips, sharing one `usePriceSort` state object.
    `showSort` hides the sort chips (e.g. the search page keeps only the
    price filter). */
export function PriceSortBar({
  state,
  showSort = true,
}: {
  state: PriceSort;
  showSort?: boolean;
}) {
  const { bounds, hasRange, lo, hi, setLo, setHi, sort, setSort, isFiltered, reset } =
    state;

  // Nothing to render when there's no price spread and the sort is hidden.
  if (!hasRange && !showSort) return null;

  const span = bounds.max - bounds.min || 1;
  const fillLeft = ((lo - bounds.min) / span) * 100;
  const fillRight = 100 - ((hi - bounds.min) / span) * 100;

  return (
    <div className="cat-controls">
      {hasRange && (
        <div className="cat-filter">
          <div className="cat-filter-head">
            <span className="cat-filter-label">Price</span>
            <span className="cat-filter-vals">
              {fmtPrice(lo)} – {fmtPrice(hi)}
            </span>
            {isFiltered && (
              <button type="button" className="cat-filter-reset" onClick={reset}>
                Reset
              </button>
            )}
          </div>
          <div className="cat-range">
            <div className="cat-range-track" />
            <div
              className="cat-range-fill"
              style={{ left: `${fillLeft}%`, right: `${fillRight}%` }}
            />
            <input
              type="range"
              className="cat-range-input"
              aria-label="Minimum price"
              min={bounds.min}
              max={bounds.max}
              value={lo}
              onChange={(e) => setLo(Math.min(Number(e.target.value), hi))}
            />
            <input
              type="range"
              className="cat-range-input"
              aria-label="Maximum price"
              min={bounds.min}
              max={bounds.max}
              value={hi}
              onChange={(e) => setHi(Math.max(Number(e.target.value), lo))}
            />
          </div>
        </div>
      )}

      {showSort && (
        <div className="cat-sort">
          <span className="cat-sort-label">Sort</span>
          {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
            <button
              key={k}
              type="button"
              className={`cat-sort-btn${sort === k ? " active" : ""}`}
              onClick={() => setSort(k)}
            >
              {SORT_LABELS[k]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
