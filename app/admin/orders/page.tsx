"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  fetchAdminOrders,
  ApiError,
  type AdminOrdersResponse,
  type AdminOrderStatusFilter,
} from "../../lib/api";
import { useAdminRealtime } from "../../lib/admin-realtime";
import OrderCard from "../../components/admin/OrderCard";

const FILTERS: { key: AdminOrderStatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "today", label: "Today" },
  { key: "pending", label: "Pending" },
  { key: "PLACED", label: "Placed" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "PROCESSING", label: "Processing" },
  { key: "SHIPPED", label: "Shipped" },
  { key: "DELIVERED", label: "Delivered" },
  { key: "CANCELLED", label: "Cancelled" },
  { key: "RETURNED", label: "Returned" },
  { key: "refunded", label: "Refunded" },
];

/** Filter keys we accept from the URL — anything else falls back to "all". */
const VALID_FILTERS = new Set<string>(FILTERS.map((f) => f.key));

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
function AdminOrdersView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState("");
  // Seed the active filter from the URL so dashboard cards can deep-link
  // (e.g. /admin/orders?status=pending) and a refresh keeps the view.
  const [status, setStatus] = useState<AdminOrderStatusFilter>(() => {
    const fromUrl = searchParams.get("status");
    return fromUrl && VALID_FILTERS.has(fromUrl)
      ? (fromUrl as AdminOrderStatusFilter)
      : "all";
  });
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

  const load = useCallback(
    async (silent = false) => {
      if (!silent) {
        setLoading(true);
        setError("");
      }
      try {
        setData(await fetchAdminOrders({ q: query, status, page }));
      } catch (e) {
        // A failed silent refresh keeps showing the current (stale) list.
        if (!silent) {
          setError(e instanceof ApiError ? e.message : "Failed to load orders.");
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [query, status, page]
  );

  useEffect(() => {
    load();
  }, [load]);

  // Live refresh: any order/stock event (new order, cancellation, status
  // change) nudges open dashboards — silently refetch so rows and filter-chip
  // counts move (e.g. a cancelled order jumps to the Cancelled tab) without
  // a page refresh or loading flash.
  useAdminRealtime({ onDashboard: () => load(true) });

  /* Switch filter: update state and reflect it in the URL (without a reload) so
     the view is shareable and survives a refresh. */
  const selectStatus = useCallback(
    (next: AdminOrderStatusFilter) => {
      setStatus(next);
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      if (next === "all") params.delete("status");
      else params.set("status", next);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams]
  );

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
            onClick={() => selectStatus(f.key)}
          >
            {f.label}
            {data && (
              <span className="admin-tab-count">{data.counts[f.key] ?? 0}</span>
            )}
          </button>
        ))}
      </div>

      {error && <p className="admin-error">{error}</p>}

      {loading && !data ? (
        /* Initial load — dashboard-style shimmer placeholders. */
        <div className="admin-order-skeletons">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="admin-order-card skeleton" />
          ))}
          <p className="admin-note">Loading orders…</p>
        </div>
      ) : (
        <>
          {/* Desktop: dense table. */}
          <div className="admin-table-wrap admin-table-mobile-hide">
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
          </div>

          {/* Mobile: elegant per-order cards. */}
          {orders.length > 0 && (
            <div className="admin-order-cards">
              {orders.map((o) => (
                <OrderCard key={o.id} order={o} />
              ))}
            </div>
          )}

          {orders.length === 0 && (
            <p className="admin-note">No orders match this view.</p>
          )}
        </>
      )}

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

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<p className="admin-note">Loading orders…</p>}>
      <AdminOrdersView />
    </Suspense>
  );
}
