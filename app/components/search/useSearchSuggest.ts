"use client";

import { useEffect, useState } from "react";
import { fetchCategories, searchProducts, type ApiCategory } from "../../lib/api";
import type { Product } from "../../lib/landing-data";

export type Suggestions = {
  categories: ApiCategory[];
  products: Product[];
  loading: boolean;
};

/** Minimum characters before we hit the API — avoids a request per keystroke. */
const MIN_CHARS = 2;

/**
 * Live autocomplete data for a search query. Categories are fetched once and
 * matched client-side; products come from the debounced search endpoint.
 *
 * Results are stored tagged with the query they belong to, so `products` and
 * `loading` can be derived during render — no synchronous setState in effects,
 * and no flash of stale results when the query changes.
 */
export function useSearchSuggest(query: string, max = 6): Suggestions {
  const [allCats, setAllCats] = useState<ApiCategory[]>([]);
  const [res, setRes] = useState<{ q: string; items: Product[] }>({
    q: "",
    items: [],
  });

  // Category list is small and static — load it once and reuse.
  useEffect(() => {
    let alive = true;
    fetchCategories()
      .then((c) => {
        if (alive) setAllCats(c);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const q = query.trim();

  useEffect(() => {
    if (q.length < MIN_CHARS) return;
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      searchProducts({ q }, { signal: ctrl.signal })
        .then((d) => setRes({ q, items: d.slice(0, max) }))
        .catch(() => {
          if (!ctrl.signal.aborted) setRes({ q, items: [] });
        });
    }, 200);
    return () => {
      ctrl.abort();
      clearTimeout(t);
    };
  }, [q, max]);

  const lc = q.toLowerCase();
  const categories =
    q.length < MIN_CHARS
      ? []
      : allCats
          .filter(
            (c) =>
              c.name.toLowerCase().includes(lc) && !c.count.startsWith("0 ")
          )
          .slice(0, 4);

  // Only surface results that belong to the current query; until they arrive we
  // report `loading` so the dropdown shows a spinner rather than "no matches".
  const matchesQuery = res.q === q;
  const products = q.length >= MIN_CHARS && matchesQuery ? res.items : [];
  const loading = q.length >= MIN_CHARS && !matchesQuery;

  return { categories, products, loading };
}
