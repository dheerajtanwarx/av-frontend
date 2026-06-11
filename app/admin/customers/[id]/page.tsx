"use client";

import { use, useEffect, useState } from "react";
import {
  fetchAdminCustomer,
  ApiError,
  type AdminCustomerDetail,
} from "../../../lib/api";

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

function fmtDateTime(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [customer, setCustomer] = useState<AdminCustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const numId = Number(id);
    if (!Number.isInteger(numId) || numId <= 0) {
      setError("not-found");
      setLoading(false);
      return;
    }
    let alive = true;
    fetchAdminCustomer(numId)
      .then((data) => {
        if (alive) setCustomer(data);
      })
      .catch((e) => {
        if (alive) setError(e instanceof ApiError && e.status === 404 ? "not-found" : "error");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [id]);

  if (loading) {
    return (
      <section className="admin-page">
        <p className="admin-note">Loading customer…</p>
      </section>
    );
  }

  if (error || !customer) {
    return (
      <section className="admin-page">
        <header className="admin-page-head">
          <h2>{error === "not-found" ? "Customer not found" : "Something went wrong"}</h2>
          <p>
            {error === "not-found"
              ? "We couldn't find this customer."
              : "We couldn't load this customer. Please try again."}
          </p>
        </header>
        <a className="admin-link" href="/admin/customers">
          ← Back to customers
        </a>
      </section>
    );
  }

  const { stats, orders, addresses } = customer;

  const statCards = [
    { key: "orders", label: "Total orders", value: String(stats.totalOrders), accent: "blue" },
    { key: "spend", label: "Total spending", value: inr(stats.totalSpending), accent: "green" },
    { key: "wishlist", label: "Wishlist items", value: String(stats.wishlistCount), accent: "rani" },
  ];

  return (
    <section className="admin-page admin-customer-detail">
      <a className="admin-link admin-back" href="/admin/customers">
        ← Back to customers
      </a>

      <header className="admin-order-head">
        <div>
          <h2>{customer.name || "Unnamed customer"}</h2>
          <p className="admin-order-date">
            Customer since {fmtDate(customer.registeredAt)}
          </p>
        </div>
        {customer.role === "ADMIN" && (
          <span className="status-badge confirmed">Admin</span>
        )}
      </header>

      <div className="admin-stat-grid">
        {statCards.map((s) => (
          <div key={s.key} className={`admin-stat-card accent-${s.accent}`}>
            <div className="admin-stat-meta">
              <span className="admin-stat-label">{s.label}</span>
              <span className="admin-stat-value">{s.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-order-grid">
        {/* Left: order history */}
        <div className="admin-order-main">
          <div className="admin-side-panel">
            <div className="admin-side-head">Order history ({orders.length})</div>
            <div className="admin-side-body">
              {orders.length === 0 ? (
                <p className="admin-cell-sub">This customer hasn&apos;t placed any orders yet.</p>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table admin-customer-orders-table">
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Date</th>
                        <th className="num">Items</th>
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
                          <td data-label="Order">
                            <a
                              className="admin-link"
                              href={`/admin/orders/${o.id}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {o.no}
                            </a>
                          </td>
                          <td data-label="Date">{fmtDate(o.placedAt)}</td>
                          <td data-label="Items" className="num">{o.itemCount}</td>
                          <td data-label="Total" className="num">{inr(o.total)}</td>
                          <td data-label="Payment">
                            {o.payment ? PAYMENT_LABEL[o.payment] ?? o.payment : "—"}
                          </td>
                          <td data-label="Status">
                            <span className={`status-badge ${o.status.toLowerCase()}`}>
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: account info + addresses */}
        <aside className="admin-order-side">
          <div className="admin-side-panel">
            <div className="admin-side-head">Account information</div>
            <div className="admin-side-body">
              <dl className="admin-summary">
                <div className="admin-summary-row">
                  <dt>Name</dt>
                  <dd>{customer.name || "—"}</dd>
                </div>
                <div className="admin-summary-row">
                  <dt>Email</dt>
                  <dd>{customer.email || "—"}</dd>
                </div>
                <div className="admin-summary-row">
                  <dt>Phone</dt>
                  <dd>{customer.phone || "—"}</dd>
                </div>
                <div className="admin-summary-row">
                  <dt>Registered</dt>
                  <dd>{fmtDateTime(customer.registeredAt)}</dd>
                </div>
                <div className="admin-summary-row">
                  <dt>Customer ID</dt>
                  <dd>#{customer.id}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="admin-side-panel">
            <div className="admin-side-head">
              Saved addresses ({addresses.length})
            </div>
            <div className="admin-side-body">
              {addresses.length === 0 ? (
                <p className="admin-cell-sub">No addresses on file.</p>
              ) : (
                <div className="admin-customer-addresses">
                  {addresses.map((a) => (
                    <div key={a.id} className="admin-customer-address">
                      <div className="admin-cell-strong">
                        {a.fullName}
                        {a.isDefault && (
                          <span className="admin-address-default"> · Default</span>
                        )}
                      </div>
                      <div className="admin-cell-sub">
                        {a.street}
                        <br />
                        {a.city}, {a.state} — {a.pincode}
                        <br />
                        {a.country}
                      </div>
                      <div className="admin-cell-sub">{a.phone}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
