"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchAdminOrders,
  ApiError,
  type AdminOrdersResponse,
  type AdminOrderStatusFilter,
} from "../../lib/api";

const FILTERS: { key: AdminOrderStatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "PLACED", label: "Placed" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "PROCESSING", label: "Processing" },
  { key: "SHIPPED", label: "Shipped" },
  { key: "DELIVERED", label: "Delivered" },
  { key: "CANCELLED", label: "Cancelled" },
  { key: "RETURNED", label: "Returned" },
];

const PAYMENT_LABEL: Record<string, string> = {
  UPI: "UPI",
  CARD: "Card",
  NETBANKING: "Net Banking",
  COD: "Cash on Delivery",
  WALLET: "Wallet",
};

function inr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

function statusClass(status: string): string {
  return status.toLowerCase();
}

/* Admin orders list. AdminGuard (in the layout) has already confirmed an ADMIN
   session, so this can fetch admin data directly. */
export default function AdminOrdersPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<AdminOrderStatusFilter>("all");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<AdminOrdersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Debounced copy of the search box so we don't hit the API on every keystroke.
  const [query, setQuery] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setQuery(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Reset to page 1 whenever the filter or search term changes.
  useEffect(() => {
    setPage(1);
  }, [query, status]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await fetchAdminOrders({ q: query, status, page }));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }, [query, status, page]);

  useEffect(() => {
    load();
  }, [load]);

  const orders = data?.orders ?? [];

  return (
    <section className="admin-page admin-orders">
      <header className="admin-page-head">
        <h2>Orders</h2>
        <p>
          Browse, search and manage customer orders. Click a row to view details
          and update the fulfilment status.
        </p>
      </header>

      <div className="admin-orders-toolbar">
        <div className="admin-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            type="search"
            placeholder="Search by order no, customer name or email…"
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
            {data && (
              <span className="admin-tab-count">{data.counts[f.key] ?? 0}</span>
            )}
          </button>
        ))}
      </div>

      {error && <p className="admin-error">{error}</p>}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th className="num">Total</th>
              <th>Payment</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr
                key={o.id}
                className="admin-row-link"
                onClick={() => {
                  window.location.href = `/admin/orders/${o.id}`;
                }}
              >
                <td>
                  <a className="admin-link" href={`/admin/orders/${o.id}`} onClick={(e) => e.stopPropagation()}>
                    {o.no}
                  </a>
                </td>
                <td>
                  <div className="admin-cell-strong">{o.customer.name}</div>
                  {o.customer.email && (
                    <div className="admin-cell-sub">{o.customer.email}</div>
                  )}
                </td>
                <td>{fmtDate(o.placedAt)}</td>
                <td className="num">{inr(o.total)}</td>
                <td>{o.payment ? PAYMENT_LABEL[o.payment] ?? o.payment : "—"}</td>
                <td>
                  <span className={`status-badge ${statusClass(o.status)}`}>
                    {o.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading ? (
          <p className="admin-note">Loading orders…</p>
        ) : orders.length === 0 ? (
          <p className="admin-note">No orders match this view.</p>
        ) : null}
      </div>

      {data && data.totalPages > 1 && (
        <div className="admin-pagination">
          <button
            className="admin-btn"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ← Prev
          </button>
          <span className="admin-pagination-info">
            Page {data.page} of {data.totalPages} · {data.total} order
            {data.total === 1 ? "" : "s"}
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
    </section>
  );
}
