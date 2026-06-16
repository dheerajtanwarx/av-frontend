"use client";

import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import {
  fetchAdminOrderRequests,
  ApiError,
  type AdminOrderRequestsResponse,
  type OrderRequestStatus,
} from "../../lib/api";
import { useAdminRealtime } from "../../lib/admin-realtime";
import { AdminCardListSkeleton } from "../../components/skeletons";

/* Status badge mapping (reuses the existing fulfilment badge palette). */
export const REQUEST_BADGE: Record<OrderRequestStatus, string> = {
  PENDING_APPROVAL: "placed",
  APPROVED: "confirmed",
  PAYMENT_SUBMITTED: "processing",
  PAID: "shipped",
  CONFIRMED: "delivered",
  REJECTED: "cancelled",
  CANCELLED: "cancelled",
};

const FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "All" },
  { key: "PENDING_APPROVAL", label: "Pending" },
  { key: "APPROVED", label: "Approved" },
  { key: "PAYMENT_SUBMITTED", label: "Payment Submitted" },
  { key: "PAID", label: "Paid" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "REJECTED", label: "Rejected" },
  { key: "CANCELLED", label: "Cancelled" },
];

function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export default function AdminOrderRequestsPage() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [data, setData] = useState<AdminOrderRequestsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setQuery(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Initial + filter/search load. All state updates happen inside the promise
  // callbacks (after the async boundary), never synchronously in the effect.
  useEffect(() => {
    let alive = true;
    fetchAdminOrderRequests({ q: query, status })
      .then((res) => {
        if (!alive) return;
        setData(res);
        setError("");
      })
      .catch((e) => {
        if (alive) setError(e instanceof ApiError ? e.message : "Failed to load requests.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [query, status]);

  // New requests / status changes nudge the dashboard channel — silently refresh
  // the list (no loading flash, errors swallowed).
  const refresh = useCallback(() => {
    fetchAdminOrderRequests({ q: query, status })
      .then(setData)
      .catch(() => {});
  }, [query, status]);
  useAdminRealtime({ onDashboard: refresh });

  const requests = data?.requests ?? [];

  return (
    <section className="admin-page admin-orders">
      <header className="admin-page-head">
        <h2>Order Requests</h2>
        <p>
          Offline-first approvals. Verify availability, send UPI instructions, confirm payment, then
          confirm the order — stock is only deducted on confirm.
        </p>
      </header>

      <div className="admin-orders-toolbar">
        <div className="admin-search">
          <Search size={18} strokeWidth={2} aria-hidden="true" />
          <input
            type="search"
            placeholder="Search by request no, customer name, email or phone…"
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
            {data && <span className="admin-tab-count">{f.key === "all" ? requests.length : data.counts[f.key] ?? 0}</span>}
          </button>
        ))}
      </div>

      {error && <p className="admin-error">{error}</p>}

      {loading && !data ? (
        <AdminCardListSkeleton count={6} />
      ) : requests.length === 0 ? (
        <p className="admin-note">No requests match this view.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Request</th>
                <th>Customer</th>
                <th>Date</th>
                <th className="num">Total</th>
                <th>Items</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr
                  key={r.id}
                  className="admin-row-link"
                  onClick={() => {
                    window.location.href = `/admin/order-requests/${r.id}`;
                  }}
                >
                  <td>
                    <a
                      className="admin-link"
                      href={`/admin/order-requests/${r.id}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {r.no}
                    </a>
                  </td>
                  <td>
                    <div className="admin-cell-strong">{r.customer?.name ?? "—"}</div>
                    {r.customer?.phone && <div className="admin-cell-sub">{r.customer.phone}</div>}
                  </td>
                  <td>{fmtDate(r.createdAt)}</td>
                  <td className="num">{r.totalDisplay}</td>
                  <td>{r.items.reduce((s, it) => s + it.qty, 0)}</td>
                  <td>
                    <span className={`status-badge ${REQUEST_BADGE[r.status]}`}>{r.statusLabel}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
