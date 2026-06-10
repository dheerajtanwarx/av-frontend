"use client";

import { useState } from "react";
import { trackOrder, ApiError, type MyOrder } from "../lib/api";

const STATUS_LABEL: Record<string, string> = {
  PLACED: "Order Placed",
  CONFIRMED: "Confirmed",
  PROCESSING: "Being Crafted",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RETURNED: "Returned",
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

export default function TrackOrderForm() {
  const [orderNo, setOrderNo] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<MyOrder | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orderNo.trim() || !email.trim()) {
      setError("Enter both your order ID and email.");
      return;
    }
    setBusy(true);
    setError(null);
    setOrder(null);
    try {
      const result = await trackOrder(orderNo.trim(), email.trim());
      setOrder(result);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Couldn’t reach the server. Please try again."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="eyebrow" style={{ marginBottom: "20px" }}>
        Enter Details
      </div>
      <h2 className="info-sec" style={{ fontSize: "1.8rem", marginBottom: "32px", padding: 0 }}>
        Where is my order?
      </h2>
      <form className="info-form" onSubmit={onSubmit}>
        <label className="info-form-label">
          Order ID
          <input
            type="text"
            placeholder="AVC-000123"
            value={orderNo}
            onChange={(e) => setOrderNo(e.target.value)}
          />
        </label>
        <label className="info-form-label">
          Email Address
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        {error && (
          <div style={{ fontFamily: "var(--font-jost)", fontSize: 13, color: "var(--rani)" }}>
            {error}
          </div>
        )}
        <div style={{ paddingTop: "4px" }}>
          <button type="submit" className="btn btn-ink" disabled={busy}>
            {busy ? "Tracking…" : "Track Order →"}
          </button>
        </div>
      </form>

      {order && (
        <div
          style={{
            marginTop: 28,
            border: "1px solid var(--line)",
            background: "var(--surface)",
            padding: "22px 24px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "var(--font-jost)",
                  fontSize: 12,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                }}
              >
                {order.no}
              </div>
              <div style={{ fontFamily: "var(--font-marcellus)", fontSize: 22, color: "var(--ink)" }}>
                {STATUS_LABEL[order.status] ?? order.status}
              </div>
            </div>
            <a
              href={`/my-orders/${order.id}`}
              style={{ fontSize: 12, color: "var(--rani)", textTransform: "uppercase", letterSpacing: "0.1em" }}
            >
              Full details →
            </a>
          </div>
          <div style={{ fontFamily: "var(--font-jost)", fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.9 }}>
            <div>Placed on {fmtDate(order.placedAt)}</div>
            <div>
              {order.items.length} item{order.items.length !== 1 ? "s" : ""} · {inr(order.total)}
            </div>
            {order.trackingNumber && <div>Tracking No. {order.trackingNumber}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
