"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductCard from "../landing/ProductCard";
import { SearchIcon } from "../landing/Icons";
import SearchSuggestions from "./SearchSuggestions";
import { usePriceSort, PriceSortBar } from "../product/PriceSortBar";
import { searchProducts } from "../../lib/api";
import type { Product } from "../../lib/landing-data";

export default function SearchView() {
  const router = useRouter();
  const params = useSearchParams();

  const [q, setQ] = useState(() => params.get("q") ?? "");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [suggestOpen, setSuggestOpen] = useState(false);

  // Sort + price filter applied client-side over the current result set.
  const ps = usePriceSort(results);
  const { filtered, reset } = ps;

  // Keep the URL shareable as the query changes (no history spam).
  const syncUrl = useCallback(() => {
    const term = q.trim();
    router.replace(term ? `/search?q=${encodeURIComponent(term)}` : "/search", {
      scroll: false,
    });
  }, [q, router]);

  // Debounced fetch whenever the query changes; aborts stale requests. The
  // backend `q` matches across a product's name, type/tags and description, so
  // a plain text search covers names, alphabetic terms and tags.
  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const data = await searchProducts({ q }, { signal: ctrl.signal });
        setResults(data);
        setLoading(false);
      } catch {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    }, 280);
    syncUrl();
    return () => {
      ctrl.abort();
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <main className="search-page av-search">
      <div className="search-hero">
        <div className="wrap">
          <nav className="cat-breadcrumb">
            <a href="/">Home</a>
            <span className="sep">/</span>
            <span>Search</span>
          </nav>
          <h1>
            Search the <em>Atelier</em>
          </h1>
          <div className="search-field-wrap">
            <form
              className="search-field"
              onSubmit={(e) => e.preventDefault()}
              role="search"
            >
              <SearchIcon />
              <input
                type="search"
                value={q}
                autoFocus
                placeholder="Search by name or tag — sarees, lehengas, bandhej, gota patti…"
                onChange={(e) => setQ(e.target.value)}
                onFocus={() => setSuggestOpen(true)}
                onBlur={() => setTimeout(() => setSuggestOpen(false), 120)}
                aria-label="Search products"
              />
              {q && (
                <button
                  type="button"
                  className="search-clear"
                  onClick={() => setQ("")}
                >
                  Clear
                </button>
              )}
            </form>
            {suggestOpen && (
              /* Keep the input focused when a suggestion is tapped so the click
                 lands before blur closes the panel. */
              <div onMouseDown={(e) => e.preventDefault()}>
                <SearchSuggestions
                  query={q}
                  onSelect={() => setSuggestOpen(false)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="wrap">
        <section className="search-results">
          <div className="cat-bar">
            <span className="cat-bar-count">
              {loading
                ? "Searching…"
                : `${filtered.length} product${filtered.length !== 1 ? "s" : ""}`}
            </span>
            {!loading && results.length > 0 && (
              <PriceSortBar state={ps} showSort={false} />
            )}
          </div>

          {!loading && filtered.length === 0 ? (
            <div className="cat-empty">
              <p>
                {results.length > 0
                  ? "No pieces in this price range — try widening it."
                  : q.trim()
                  ? "No pieces match your search — try a different name or tag."
                  : "Start typing to search our collections."}
              </p>
              {results.length > 0 && (
                <button type="button" className="btn btn-rani" onClick={reset}>
                  Clear price filter
                </button>
              )}
            </div>
          ) : (
            <div className={`prods cat-grid${loading ? " is-loading" : ""}`}>
              {filtered.map((p, i) => (
                <ProductCard key={p.slug} product={p} index={i} reveal={false} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
