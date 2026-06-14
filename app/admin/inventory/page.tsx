"use client";

import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import {
  fetchInventory,
  adjustStock,
  ApiError,
  type InventoryResponse,
  type InventoryFilter,
  type InventoryRow,
} from "../../lib/api";
import { InventoryIcon } from "../../components/admin/icons";

const FILTERS: { key: InventoryFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "ok", label: "In stock" },
  { key: "low", label: "Low stock" },
  { key: "out", label: "Out of stock" },
];

function inr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

const num = (n: number) => new Intl.NumberFormat("en-IN").format(n);

const STATUS_LABEL: Record<InventoryRow["status"], string> = {
  out: "Out of stock",
  low: "Low stock",
  ok: "In stock",
};

/* Adjust-stock modal. Offers an absolute "set to" field plus quick +/- nudges;
   the live preview shows the resulting level before the admin commits. */
function AdjustModal({
  row,
  busy,
  error,
  onCancel,
  onSave,
}: {
  row: InventoryRow;
  busy: boolean;
  error: string;
  onCancel: () => void;
  onSave: (next: number) => void;
}) {
  const [value, setValue] = useState<string>(String(row.stockQty));
  const next = Number(value);
  const valid = Number.isInteger(next) && next >= 0;
  const delta = valid ? next - row.stockQty : 0;

  function bump(by: number) {
    setValue((v) => String(Math.max(0, (Number(v) || 0) + by)));
  }

  return (
    <div className="admin-modal-overlay" role="dialog" aria-modal="true">
      <div className="admin-modal">
        <h3 className="admin-modal-title">Adjust stock</h3>
        <p className="admin-modal-body">
          <strong>{row.productName}</strong> — {row.color} · {row.sku}
          <br />
          Current stock: <strong>{num(row.stockQty)}</strong>
        </p>

        <div className="admin-adjust-controls">
          <button type="button" className="admin-btn" onClick={() => bump(-10)} disabled={busy}>
            −10
          </button>
          <button type="button" className="admin-btn" onClick={() => bump(-1)} disabled={busy}>
            −1
          </button>
          <input
            className="admin-input admin-adjust-input"
            type="number"
            min={0}
            inputMode="numeric"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            aria-label="New stock level"
          />
          <button type="button" className="admin-btn" onClick={() => bump(1)} disabled={busy}>
            +1
          </button>
          <button type="button" className="admin-btn" onClick={() => bump(10)} disabled={busy}>
            +10
          </button>
        </div>

        {valid && delta !== 0 && (
          <p className="admin-adjust-preview">
            {delta > 0 ? "Adding" : "Removing"} {num(Math.abs(delta))} unit
            {Math.abs(delta) === 1 ? "" : "s"} → new level <strong>{num(next)}</strong>
          </p>
        )}

        {error && <p className="admin-error">{error}</p>}

        <div className="admin-modal-actions">
          <button className="admin-btn" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button
            className="admin-btn approve"
            onClick={() => onSave(next)}
            disabled={busy || !valid || delta === 0}
          >
            {busy ? "Saving…" : "Save stock"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminInventoryPage() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<InventoryFilter>("all");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<InventoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // adjust modal state
  const [editing, setEditing] = useState<InventoryRow | null>(null);
  const [saveBusy, setSaveBusy] = useState(false);
  const [saveError, setSaveError] = useState("");

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
      setData(await fetchInventory({ q: query, status, page }));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load inventory.");
    } finally {
      setLoading(false);
    }
  }, [query, status, page]);

  useEffect(() => {
    load();
  }, [load]);

  async function saveStock(next: number) {
    if (!editing) return;
    setSaveBusy(true);
    setSaveError("");
    try {
      await adjustStock(editing.variantId, { stockQty: next });
      setEditing(null);
      await load();
    } catch (e) {
      setSaveError(e instanceof ApiError ? e.message : "Could not update stock.");
    } finally {
      setSaveBusy(false);
    }
  }

  const rows = data?.rows ?? [];
  const summary = data?.summary;
  const threshold = data?.lowStockThreshold ?? 10;
  const needsAttention = (summary?.lowStock ?? 0) + (summary?.outOfStock ?? 0);

  const stats = [
    { key: "units", label: "Units in stock", value: summary ? num(summary.totalUnits) : "—", accent: "rani" },
    { key: "variants", label: "Variants tracked", value: summary ? num(summary.totalVariants) : "—", accent: "blue" },
    { key: "low", label: `Low stock (≤ ${threshold})`, value: summary ? num(summary.lowStock) : "—", accent: "amber" },
    { key: "out", label: "Out of stock", value: summary ? num(summary.outOfStock) : "—", accent: "rani" },
  ];

  return (
    <section className="admin-page admin-inventory">
      <header className="admin-page-head">
        <div>
          <h2>Inventory</h2>
          <p>Track stock across every product variant, adjust levels and catch shortfalls early.</p>
        </div>
      </header>

      <div className="admin-stat-grid">
        {stats.map((s) => (
          <div key={s.key} className={`admin-stat-card accent-${s.accent}`}>
            <div className="admin-stat-icon">
              <InventoryIcon className="admin-stat-icon-svg" />
            </div>
            <div className="admin-stat-meta">
              <span className="admin-stat-label">{s.label}</span>
              <span className="admin-stat-value">{s.value}</span>
            </div>
          </div>
        ))}
      </div>

      {!loading && needsAttention > 0 && (
        <div className="admin-inventory-banner" role="status">
          <strong>{num(needsAttention)}</strong>{" "}
          variant{needsAttention === 1 ? "" : "s"} need attention —{" "}
          {num(summary?.outOfStock ?? 0)} out of stock,{" "}
          {num(summary?.lowStock ?? 0)} running low (≤ {threshold} units).
          {status === "all" && (
            <button className="admin-link admin-banner-link" onClick={() => setStatus("low")}>
              Review low stock
            </button>
          )}
        </div>
      )}

      <div className="admin-orders-toolbar">
        <div className="admin-search">
          <Search size={18} strokeWidth={2} aria-hidden="true" />
          <input
            type="search"
            placeholder="Search by product, colour or SKU…"
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
        <table className="admin-table admin-inventory-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Variant</th>
              <th>SKU</th>
              <th className="num">Price</th>
              <th className="num">Stock</th>
              <th>Status</th>
              <th className="actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.variantId}>
                <td data-label="Product">
                  <div className="admin-product-cell">
                    <div className="admin-product-thumb">
                      {r.image ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={r.image} alt="" />
                      ) : (
                        <span className="admin-product-thumb-empty" />
                      )}
                    </div>
                    <div>
                      <a className="admin-cell-strong admin-link" href={`/admin/products/edit/${r.productId}`}>
                        {r.productName}
                      </a>
                      {!r.productActive && <div className="admin-cell-sub">Inactive</div>}
                    </div>
                  </div>
                </td>
                <td data-label="Variant">
                  <span className="admin-variant-cell">
                    <span
                      className="admin-swatch"
                      style={{ background: r.colorHex }}
                      aria-hidden="true"
                    />
                    {r.color}
                  </span>
                </td>
                <td data-label="SKU">
                  <span className="admin-sku">{r.sku}</span>
                </td>
                <td className="num" data-label="Price">
                  {inr(r.price)}
                </td>
                <td className="num" data-label="Stock">
                  <span
                    className={
                      r.status === "out" ? "admin-stock-out" : r.status === "low" ? "admin-stock-low" : ""
                    }
                  >
                    {num(r.stockQty)}
                  </span>
                </td>
                <td data-label="Status">
                  <span className={`admin-stock-badge ${r.status}`}>{STATUS_LABEL[r.status]}</span>
                </td>
                <td className="actions-col" data-label="">
                  <div className="admin-row-actions">
                    <button
                      className="admin-btn"
                      onClick={() => {
                        setSaveError("");
                        setEditing(r);
                      }}
                    >
                      Adjust
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading ? (
          <p className="admin-note">Loading inventory…</p>
        ) : rows.length === 0 ? (
          <p className="admin-note">No variants match this view.</p>
        ) : null}
      </div>

      {data && data.totalPages > 1 && (
        <div className="admin-pagination">
          <button className="admin-btn" disabled={page <= 1 || loading} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            ← Prev
          </button>
          <span className="admin-pagination-info">
            Page {data.page} of {data.totalPages} · {data.total} variant{data.total === 1 ? "" : "s"}
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

      {editing && (
        <AdjustModal
          row={editing}
          busy={saveBusy}
          error={saveError}
          onCancel={() => setEditing(null)}
          onSave={saveStock}
        />
      )}
    </section>
  );
}
