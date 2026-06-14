"use client";

import { memo } from "react";

/* Reusable, elegant order card — the mobile face of the admin order tables.
   Desktop keeps the dense table; below the table breakpoint these cards render
   instead so each order reads as its own tidy panel (styled like the dashboard
   stat cards) rather than a wide stack of unlabelled rows.

   The shape is a superset: `customer` is shown on the orders list (one row per
   order) and omitted on a single customer's history; `payment` / `itemCount`
   render only when supplied. */
export type OrderCardOrder = {
  id: number;
  no: string;
  status: string;
  placedAt: string;
  total: number;
  payment?: string | null;
  itemCount?: number;
  customer?: { name: string; email?: string | null };
};

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

function OrderCard({ order }: { order: OrderCardOrder }) {
  return (
    <a className="admin-order-card" href={`/admin/orders/${order.id}`}>
      <div className="admin-order-card-top">
        <span className="admin-order-card-no">{order.no}</span>
        <span className={`status-badge ${order.status.toLowerCase()}`}>{order.status}</span>
      </div>

      {order.customer && (
        <div className="admin-order-card-cust">
          <span className="admin-order-card-name">{order.customer.name}</span>
          {order.customer.email && (
            <span className="admin-order-card-email">{order.customer.email}</span>
          )}
        </div>
      )}

      <div className="admin-order-card-meta">
        <div className="admin-order-card-field">
          <span className="admin-order-card-label">Date</span>
          <span className="admin-order-card-value">{fmtDate(order.placedAt)}</span>
        </div>
        <div className="admin-order-card-field">
          <span className="admin-order-card-label">Total</span>
          <span className="admin-order-card-value">{inr(order.total)}</span>
        </div>
        {order.payment !== undefined && (
          <div className="admin-order-card-field">
            <span className="admin-order-card-label">Payment</span>
            <span className="admin-order-card-value">
              {order.payment ? PAYMENT_LABEL[order.payment] ?? order.payment : "—"}
            </span>
          </div>
        )}
        {order.itemCount !== undefined && (
          <div className="admin-order-card-field">
            <span className="admin-order-card-label">Items</span>
            <span className="admin-order-card-value">{order.itemCount}</span>
          </div>
        )}
      </div>
    </a>
  );
}

export default memo(OrderCard);
