"use client";

import Link from "next/link";
import { img } from "../../lib/landing-data";
import { SearchIcon } from "../landing/Icons";
import { useSearchSuggest } from "./useSearchSuggest";

/**
 * Amazon/Flipkart-style autocomplete dropdown: matching categories, a short
 * list of matching products, and a "search for …" catch-all. The parent owns
 * input state and visibility; this renders the panel and calls `onSelect` when
 * the shopper picks something (so the parent can close/collapse the field).
 */
export default function SearchSuggestions({
  query,
  onSelect,
}: {
  query: string;
  onSelect: () => void;
}) {
  const { categories, products, loading } = useSearchSuggest(query);
  const q = query.trim();

  if (q.length < 2) return null;

  const hasResults = categories.length > 0 || products.length > 0;

  return (
    <div className="srch-sug" role="listbox" aria-label="Search suggestions">
      {categories.length > 0 && (
        <div className="srch-sug-group">
          <div className="srch-sug-head">Categories</div>
          {categories.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="srch-sug-cat"
              role="option"
              onClick={onSelect}
            >
              <span className="srch-sug-cat-name">{c.name}</span>
              <span className="srch-sug-cat-go" aria-hidden="true">
                →
              </span>
            </Link>
          ))}
        </div>
      )}

      {products.length > 0 && (
        <div className="srch-sug-group">
          <div className="srch-sug-head">Products</div>
          {products.map((p) => (
            <Link
              key={p.slug}
              href={`/product/${p.slug}`}
              className="srch-sug-prod"
              role="option"
              onClick={onSelect}
            >
              {p.main ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  className="srch-sug-thumb"
                  src={img(p.main, 120)}
                  alt=""
                  loading="lazy"
                />
              ) : (
                <span className="srch-sug-thumb srch-sug-thumb-ph" />
              )}
              <span className="srch-sug-prod-text">
                <span className="srch-sug-prod-name">{p.name}</span>
                <span className="srch-sug-prod-type">{p.type}</span>
              </span>
              <span className="srch-sug-prod-price">{p.price}</span>
            </Link>
          ))}
        </div>
      )}

      {!hasResults && (
        <div className="srch-sug-empty">
          {loading ? "Searching…" : `No matches for “${q}”`}
        </div>
      )}

      <Link
        href={`/search?q=${encodeURIComponent(q)}`}
        className="srch-sug-all"
        onClick={onSelect}
      >
        <SearchIcon />
        <span>
          Search for “<strong>{q}</strong>”
        </span>
      </Link>
    </div>
  );
}
