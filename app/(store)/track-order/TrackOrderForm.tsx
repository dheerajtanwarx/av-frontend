"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { trackOrder, ApiError, type MyOrder } from "../lib/api";
import OrderProgress, { statusLabel } from "../components/OrderProgress";

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

export default function TrackOrderForm({
  initialOrderNo = "",
  initialEmail = "",
}: {
  initialOrderNo?: string;
  initialEmail?: string;
}) {
  const [orderNo, setOrderNo] = useState(initialOrderNo);
  const [email, setEmail] = useState(initialEmail);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<MyOrder | null>(null);

  const runTrack = useCallback(async (no: string, mail: string) => {
    if (!no.trim() || !mail.trim()) {
      setError("Enter both your order ID and email.");
      return;
    }
    setBusy(true);
    setError(null);
    setOrder(null);
    try {
      const result = await trackOrder(no.trim(), mail.trim());
      setOrder(result);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Couldn’t reach the server. Please try again."
      );
    } finally {
      setBusy(false);
    }
  }, []);

  // Auto-track once when arriving with both values prefilled (e.g. from the
  // order confirmation page's "Track Your Order" button).
  const autoRan = useRef(false);
  useEffect(() => {
    if (autoRan.current) return;
    if (initialOrderNo.trim() && initialEmail.trim()) {
      autoRan.current = true;
      runTrack(initialOrderNo, initialEmail);
    }
  }, [initialOrderNo, initialEmail, runTrack]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    runTrack(orderNo, email);
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
                {statusLabel(order.status)}
              </div>
            </div>
            <a
              href={`/my-orders/${order.id}`}
              style={{ fontSize: 12, color: "var(--rani)", textTransform: "uppercase", letterSpacing: "0.1em" }}
            >
              Full details →
            </a>
          </div>

          {/* Live, status-driven tracker driven by the real order status. */}
          <div style={{ margin: "8px 0 18px" }}>
            <OrderProgress status={order.status} />
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
