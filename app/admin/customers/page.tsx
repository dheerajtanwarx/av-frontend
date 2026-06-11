"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchAdminCustomers,
  ApiError,
  type AdminCustomersResponse,
} from "../../lib/api";

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

/* Admin customers list. AdminGuard (in the layout) has already confirmed an
   ADMIN session, so this can fetch admin data directly. */
export default function AdminCustomersPage() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<AdminCustomersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Debounced copy of the search box so we don't hit the API on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => setQuery(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Reset to page 1 whenever the search term changes.
  useEffect(() => {
    setPage(1);
  }, [query]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await fetchAdminCustomers({ q: query, page }));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load customers.");
    } finally {
      setLoading(false);
    }
  }, [query, page]);

  useEffect(() => {
    load();
  }, [load]);

  const customers = data?.customers ?? [];

  return (
    <section className="admin-page admin-customers">
      <header className="admin-page-head">
        <div>
          <h2>Customers</h2>
          <p>
            Browse registered customers, search by name, email or phone, and open
            a profile for their full order history.
          </p>
        </div>
      </header>

      <div className="admin-orders-toolbar">
        <div className="admin-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            type="search"
            placeholder="Search by name, email or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error && <p className="admin-error">{error}</p>}

      <div className="admin-table-wrap">
        <table className="admin-table admin-customers-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Phone</th>
              <th>Registered</th>
              <th className="num">Orders</th>
              <th className="num">Spending</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr
                key={c.id}
                className="admin-row-link"
                onClick={() => {
                  window.location.href = `/admin/customers/${c.id}`;
                }}
              >
                <td data-label="Customer">
                  <a
                    className="admin-cell-strong admin-link"
                    href={`/admin/customers/${c.id}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {c.name || "Unnamed customer"}
                  </a>
                  {c.email && <div className="admin-cell-sub">{c.email}</div>}
                </td>
                <td data-label="Phone">{c.phone || "—"}</td>
                <td data-label="Registered">{fmtDate(c.registeredAt)}</td>
                <td data-label="Orders" className="num">{c.totalOrders}</td>
                <td data-label="Spending" className="num">{inr(c.totalSpending)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading ? (
          <p className="admin-note">Loading customers…</p>
        ) : customers.length === 0 ? (
          <p className="admin-note">No customers match this view.</p>
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
            Page {data.page} of {data.totalPages} · {data.total} customer
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
