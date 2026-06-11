"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductCard from "../landing/ProductCard";
import { SearchIcon } from "../landing/Icons";
import {
  searchProducts,
  fetchProductFacets,
  type ProductFacets,
  type ProductSort,
} from "../../lib/api";
import type { Product } from "../../lib/landing-data";

const SORT_LABELS: Record<ProductSort, string> = {
  featured: "Featured",
  newest: "Newest",
  "price-asc": "Price ↑",
  "price-desc": "Price ↓",
  rating: "Top rated",
};

/** Toggle a value in a string[] (used for the checkbox/chip facets). */
function toggle(list: string[], value: string): string[] {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

export default function SearchView() {
  const router = useRouter();
  const params = useSearchParams();

  const [q, setQ] = useState(() => params.get("q") ?? "");
  const [categories, setCategories] = useState<string[]>(() =>
    (params.get("category") ?? "").split(",").filter(Boolean)
  );
  const [tags, setTags] = useState<string[]>(() =>
    (params.get("tag") ?? "").split(",").filter(Boolean)
  );
  const [minPrice, setMinPrice] = useState<string>(() => params.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState<string>(() => params.get("maxPrice") ?? "");
  const [sale, setSale] = useState(params.get("sale") === "true");
  const [bestseller, setBestseller] = useState(params.get("bestseller") === "true");
  const [inStock, setInStock] = useState(params.get("inStock") === "true");
  const [sort, setSort] = useState<ProductSort>(
    (params.get("sort") as ProductSort) || "featured"
  );

  const [facets, setFacets] = useState<ProductFacets | null>(null);
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Load filter options once.
  useEffect(() => {
    let alive = true;
    fetchProductFacets()
      .then((f) => {
        if (alive) setFacets(f);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  // Keep the URL shareable as filters change (no history spam).
  const syncUrl = useCallback(() => {
    const sp = new URLSearchParams();
    if (q.trim()) sp.set("q", q.trim());
    if (categories.length) sp.set("category", categories.join(","));
    if (tags.length) sp.set("tag", tags.join(","));
    if (minPrice) sp.set("minPrice", minPrice);
    if (maxPrice) sp.set("maxPrice", maxPrice);
    if (sale) sp.set("sale", "true");
    if (bestseller) sp.set("bestseller", "true");
    if (inStock) sp.set("inStock", "true");
    if (sort !== "featured") sp.set("sort", sort);
    const qs = sp.toString();
    router.replace(qs ? `/search?${qs}` : "/search", { scroll: false });
  }, [q, categories, tags, minPrice, maxPrice, sale, bestseller, inStock, sort, router]);

  // Debounced fetch whenever any filter changes; aborts stale requests.
  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const data = await searchProducts(
          {
            q,
            category: categories,
            tag: tags,
            sale,
            bestseller,
            minPrice: minPrice ? Number(minPrice) : undefined,
            maxPrice: maxPrice ? Number(maxPrice) : undefined,
            sort,
          },
          { signal: ctrl.signal }
        );
        // In-stock is enforced client-side from the computed `soldOut` flag.
        setResults(inStock ? data.filter((p) => !p.soldOut) : data);
        setLoading(false);
      } catch (err) {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    }, 280);
    syncUrl();
    return () => {
      ctrl.abort();
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, categories, tags, minPrice, maxPrice, sale, bestseller, inStock, sort]);

  const activeCount = useMemo(
    () =>
      categories.length +
      tags.length +
      (minPrice ? 1 : 0) +
      (maxPrice ? 1 : 0) +
      (sale ? 1 : 0) +
      (bestseller ? 1 : 0) +
      (inStock ? 1 : 0),
    [categories, tags, minPrice, maxPrice, sale, bestseller, inStock]
  );

  const clearAll = () => {
    setCategories([]);
    setTags([]);
    setMinPrice("");
    setMaxPrice("");
    setSale(false);
    setBestseller(false);
    setInStock(false);
  };

  const ph = facets?.priceRange;

  return (
    <main className="search-page">
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
              placeholder="Search sarees, lehengas, bandhej, gota patti…"
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search products"
            />
            {q && (
              <button type="button" className="search-clear" onClick={() => setQ("")}>
                Clear
              </button>
            )}
          </form>
        </div>
      </div>

      <div className="wrap search-layout">
        <button
          className="search-filter-toggle"
          onClick={() => setShowFilters((s) => !s)}
        >
          {showFilters ? "Hide filters" : "Show filters"}
          {activeCount > 0 && <span className="search-active-dot">{activeCount}</span>}
        </button>

        <aside className={`search-filters${showFilters ? " open" : ""}`}>
          <div className="search-filters-head">
            <h2>Filters</h2>
            {activeCount > 0 && (
              <button className="search-clear-all" onClick={clearAll}>
                Clear all ({activeCount})
              </button>
            )}
          </div>

          {facets && facets.categories.length > 0 && (
            <div className="search-group">
              <h3>Category</h3>
              <ul className="search-checks">
                {facets.categories.map((c) => (
                  <li key={c.slug}>
                    <label>
                      <input
                        type="checkbox"
                        checked={categories.includes(c.slug)}
                        onChange={() => setCategories((l) => toggle(l, c.slug))}
                      />
                      <span>{c.name}</span>
                      <span className="search-count">{c.count}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {facets && facets.tags.length > 0 && (
            <div className="search-group">
              <h3>Tags</h3>
              <div className="search-tags">
                {facets.tags.map((t) => (
                  <button
                    key={t}
                    className={`search-tag${tags.includes(t) ? " active" : ""}`}
                    onClick={() => setTags((l) => toggle(l, t))}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="search-group">
            <h3>Price</h3>
            <div className="search-price">
              <input
                type="number"
                inputMode="numeric"
                min={0}
                placeholder={ph ? `₹${ph.min}` : "Min"}
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                aria-label="Minimum price"
              />
              <span>–</span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                placeholder={ph ? `₹${ph.max}` : "Max"}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                aria-label="Maximum price"
              />
            </div>
          </div>

          <div className="search-group">
            <h3>Show only</h3>
            <ul className="search-checks">
              <li>
                <label>
                  <input
                    type="checkbox"
                    checked={sale}
                    onChange={(e) => setSale(e.target.checked)}
                  />
                  <span>On sale</span>
                </label>
              </li>
              <li>
                <label>
                  <input
                    type="checkbox"
                    checked={bestseller}
                    onChange={(e) => setBestseller(e.target.checked)}
                  />
                  <span>Bestsellers</span>
                </label>
              </li>
              <li>
                <label>
                  <input
                    type="checkbox"
                    checked={inStock}
                    onChange={(e) => setInStock(e.target.checked)}
                  />
                  <span>In stock</span>
                </label>
              </li>
            </ul>
          </div>
        </aside>

        <section className="search-results">
          <div className="cat-bar">
            <span className="cat-bar-count">
              {loading
                ? "Searching…"
                : `${results.length} product${results.length !== 1 ? "s" : ""}`}
            </span>
            <div className="cat-sort">
              <span className="cat-sort-label">Sort</span>
              {(Object.keys(SORT_LABELS) as ProductSort[]).map((k) => (
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

          {!loading && results.length === 0 ? (
            <div className="cat-empty">
              <p>
                {q || activeCount > 0
                  ? "No pieces match your search — try fewer filters."
                  : "Start typing to search our collections."}
              </p>
              {(q || activeCount > 0) && (
                <button className="btn btn-rani" onClick={clearAll}>
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className={`prods cat-grid${loading ? " is-loading" : ""}`}>
              {results.map((p, i) => (
                <ProductCard key={p.slug} product={p} index={i} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
