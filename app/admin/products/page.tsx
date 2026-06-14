"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  fetchAdminProducts,
  deleteProduct,
  ApiError,
  type AdminProductsResponse,
  type AdminProductsFilter,
  type AdminProductListItem,
} from "../../lib/api";
import HeroImageManager from "../../components/admin/HeroImageManager";
import CategoryFilterBar, { type CategoryChip } from "../../components/admin/CategoryFilterBar";
import CategorySummaryCards from "../../components/admin/CategorySummaryCards";
import ProductList from "../../components/admin/ProductList";

const FILTERS: { key: AdminProductsFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "inactive", label: "Inactive" },
];

const ALL = "All";

/* Delete confirmation modal. */
function ConfirmDelete({
  product,
  busy,
  error,
  onCancel,
  onConfirm,
}: {
  product: AdminProductListItem;
  busy: boolean;
  error: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="admin-modal-overlay" role="dialog" aria-modal="true">
      <div className="admin-modal">
        <h3 className="admin-modal-title">Delete product?</h3>
        <p className="admin-modal-body">
          Are you sure you want to delete <strong>{product.name}</strong>? This cannot be
          undone. Products that appear in past orders can&apos;t be deleted — deactivate
          them instead.
        </p>
        {error && <p className="admin-error">{error}</p>}
        <div className="admin-modal-actions">
          <button className="admin-btn" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button className="admin-btn reject" onClick={onConfirm} disabled={busy}>
            {busy ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminProductsView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<AdminProductsFilter>("all");
  // Category filter is the catalogue name (or "All"); seeded from the URL so a
  // refresh keeps the current view.
  const [category, setCategory] = useState<string>(() => searchParams.get("category") ?? ALL);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<AdminProductsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // delete modal state
  const [toDelete, setToDelete] = useState<AdminProductListItem | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const isAllCategory = category.toLowerCase() === ALL.toLowerCase();

  useEffect(() => {
    const t = setTimeout(() => setQuery(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Any change to the active filters returns to the first page.
  useEffect(() => {
    setPage(1);
  }, [query, status, category]);

  /* Switch category: update state and reflect it in the URL (without a reload)
     so the view survives a refresh and shows in the browser history. */
  const selectCategory = useCallback(
    (name: string) => {
      setCategory(name);
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      if (name.toLowerCase() === ALL.toLowerCase()) params.delete("category");
      else params.set("category", name);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await fetchAdminProducts({ q: query, status, category, page }));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load products.");
    } finally {
      setLoading(false);
    }
  }, [query, status, category, page]);

  useEffect(() => {
    load();
  }, [load]);

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleteBusy(true);
    setDeleteError("");
    try {
      await deleteProduct(toDelete.id);
      setToDelete(null);
      await load();
    } catch (e) {
      setDeleteError(e instanceof ApiError ? e.message : "Could not delete product.");
    } finally {
      setDeleteBusy(false);
    }
  }

  const products = data?.products ?? [];

  // "All" + every category with matches; keep the selected category visible even
  // if the current search filtered it down to zero.
  const chips = useMemo<CategoryChip[]>(() => {
    const stats = data?.categories ?? [];
    const allCount = stats.reduce((sum, c) => sum + c.count, 0);
    const list: CategoryChip[] = [
      { name: ALL, count: allCount },
      ...stats.map((c) => ({ name: c.name, count: c.count })),
    ];
    if (!isAllCategory && !list.some((c) => c.name.toLowerCase() === category.toLowerCase())) {
      list.push({ name: category, count: 0 });
    }
    return list;
  }, [data?.categories, category, isAllCategory]);

  // The "New product" link carries the active category so the form preselects it.
  const newHref = isAllCategory
    ? "/admin/products/new"
    : `/admin/products/new?category=${encodeURIComponent(category)}`;
  const newLabel = isAllCategory ? "+ New product" : `+ Add ${category} Product`;

  return (
    <section className="admin-page admin-products">
      <header className="admin-page-head admin-products-head">
        <div>
          <h2>Products</h2>
          <p>Create, edit and organise the catalogue — products, variants and imagery.</p>
        </div>
        <a className="admin-btn approve" href={newHref}>
          {newLabel}
        </a>
      </header>

      <HeroImageManager />

      <CategorySummaryCards categories={chips} active={category} onSelect={selectCategory} />

      <div className="admin-orders-toolbar">
        <div className="admin-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            type="search"
            placeholder={
              isAllCategory
                ? "Search products by name or type…"
                : `Search within ${category}…`
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <CategoryFilterBar categories={chips} active={category} onSelect={selectCategory} />

      <div className="admin-tabs admin-orders-filters">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`admin-tab${status === f.key ? " active" : ""}`}
            onClick={() => setStatus(f.key)}
          >
            {f.label}
            {data && <span className="admin-tab-count">{data.counts[f.key] ?? 0}</span>}
          </button>
        ))}
      </div>

      {error && <p className="admin-error">{error}</p>}

      <ProductList
        products={products}
        loading={loading}
        emptyLabel={
          isAllCategory
            ? "No products match this view."
            : `No products in ${category} match this view.`
        }
        onRequestDelete={(p) => {
          setDeleteError("");
          setToDelete(p);
        }}
      />

      {data && data.totalPages > 1 && (
        <div className="admin-pagination">
          <button className="admin-btn" disabled={page <= 1 || loading} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            ← Prev
          </button>
          <span className="admin-pagination-info">
            Page {data.page} of {data.totalPages} · {data.total} product{data.total === 1 ? "" : "s"}
          </span>
          <button
            className="admin-btn"
            disabled={page >= data.totalPages || loading}
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
          >
            Next →
          </button>
        </div>
      )}

      {toDelete && (
        <ConfirmDelete
          product={toDelete}
          busy={deleteBusy}
          error={deleteError}
          onCancel={() => setToDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </section>
  );
}

export default function AdminProductsPage() {
  return (
    <Suspense fallback={<p className="admin-note">Loading products…</p>}>
      <AdminProductsView />
    </Suspense>
  );
}
