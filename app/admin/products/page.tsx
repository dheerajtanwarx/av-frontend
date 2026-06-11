"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchAdminProducts,
  deleteProduct,
  ApiError,
  type AdminProductsResponse,
  type AdminProductsFilter,
  type AdminProductListItem,
} from "../../lib/api";
import HeroImageManager from "../../components/admin/HeroImageManager";

const FILTERS: { key: AdminProductsFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "inactive", label: "Inactive" },
];

function inr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

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

export default function AdminProductsPage() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<AdminProductsFilter>("all");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<AdminProductsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // delete modal state
  const [toDelete, setToDelete] = useState<AdminProductListItem | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setQuery(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [query, status]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await fetchAdminProducts({ q: query, status, page }));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load products.");
    } finally {
      setLoading(false);
    }
  }, [query, status, page]);

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

  return (
    <section className="admin-page admin-products">
      <header className="admin-page-head admin-products-head">
        <div>
          <h2>Products</h2>
          <p>Create, edit and organise the catalogue — products, variants and imagery.</p>
        </div>
        <a className="admin-btn approve" href="/admin/products/new">
          + New product
        </a>
      </header>

      <HeroImageManager />

      <div className="admin-orders-toolbar">
        <div className="admin-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            type="search"
            placeholder="Search products by name or type…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

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

      <div className="admin-table-wrap">
        <table className="admin-table admin-products-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th className="num">Price</th>
              <th className="num">Stock</th>
              <th>Status</th>
              <th className="actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="admin-product-cell">
                    <div className="admin-product-thumb">
                      {p.image ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={p.image} alt="" />
                      ) : (
                        <span className="admin-product-thumb-empty" />
                      )}
                    </div>
                    <div>
                      <a className="admin-cell-strong admin-link" href={`/admin/products/edit/${p.id}`}>
                        {p.name}
                      </a>
                      {p.type && <div className="admin-cell-sub">{p.type}</div>}
                    </div>
                  </div>
                </td>
                <td>{p.category?.name ?? "—"}</td>
                <td className="num">
                  {inr(p.price)}
                  {p.comparePrice ? (
                    <span className="admin-price-was"> {inr(p.comparePrice)}</span>
                  ) : null}
                </td>
                <td className="num">
                  <span className={p.stock <= 0 ? "admin-stock-out" : p.stock < 10 ? "admin-stock-low" : ""}>
                    {p.stock}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${p.isActive ? "delivered" : "cancelled"}`}>
                    {p.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="actions-col">
                  <div className="admin-row-actions">
                    <a className="admin-btn" href={`/admin/products/edit/${p.id}`}>
                      Edit
                    </a>
                    <button className="admin-btn reject" onClick={() => { setDeleteError(""); setToDelete(p); }}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading ? (
          <p className="admin-note">Loading products…</p>
        ) : products.length === 0 ? (
          <p className="admin-note">No products match this view.</p>
        ) : null}
      </div>

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
