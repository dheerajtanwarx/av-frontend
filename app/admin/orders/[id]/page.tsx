"use client";

import { use, useEffect, useState } from "react";
import {
  fetchAdminOrder,
  updateAdminOrderStatus,
  updateAdminOrderTracking,
  downloadAdminPackingSlip,
  adminProcessRefund,
  ApiError,
  ADMIN_STATUS_FLOW,
  type AdminOrderDetail,
  type OrderStatus,
} from "../../../lib/api";

const PAYMENT_LABEL: Record<string, string> = {
  UPI: "UPI",
  CARD: "Card",
  NETBANKING: "Net Banking",
  COD: "Cash on Delivery",
  WALLET: "Wallet",
};

// Rank used to find the next forward status (mirrors the backend).
const STATUS_RANK: Record<string, number> = {
  PLACED: 0,
  CONFIRMED: 1,
  PROCESSING: 2,
  SHIPPED: 3,
  DELIVERED: 4,
};

const TERMINAL = ["CANCELLED", "RETURNED"];

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
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

/** First status in the fulfilment flow that's ahead of the current one. */
function nextStatus(current: string): OrderStatus | null {
  if (TERMINAL.includes(current)) return null;
  const rank = STATUS_RANK[current] ?? 0;
  return ADMIN_STATUS_FLOW.find((s) => STATUS_RANK[s] > rank) ?? null;
}

function StatusWorkflow({
  order,
  onUpdated,
}: {
  order: AdminOrderDetail;
  onUpdated: (o: AdminOrderDetail) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [tracking, setTracking] = useState("");

  const next = nextStatus(order.status);
  const currentRank = STATUS_RANK[order.status] ?? -1;
  const isTerminal = TERMINAL.includes(order.status);
  // The move to SHIPPED is the dispatch step — offer to attach the courier
  // tracking number in the same action (optional; it can be added later).
  const isShipStep = next === "SHIPPED";

  async function advance() {
    if (!next) return;
    setBusy(true);
    setError("");
    try {
      const tn = isShipStep && tracking.trim() ? tracking.trim() : undefined;
      onUpdated(await updateAdminOrderStatus(order.id, next, tn));
      setTracking("");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not update status.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-side-panel">
      <div className="admin-side-head">Fulfilment status</div>
      <div className="admin-side-body">
        {isTerminal ? (
          <p className="admin-note" style={{ padding: "8px 0", textAlign: "left" }}>
            This order is <strong>{order.status.toLowerCase()}</strong> and can no
            longer be advanced.
          </p>
        ) : (
          <ol className="admin-status-steps">
            {ADMIN_STATUS_FLOW.map((s) => {
              const rank = STATUS_RANK[s];
              const state =
                rank < currentRank ? "done" : rank === currentRank ? "current" : "upcoming";
              // CONFIRMED isn't a flow step but ranks between PLACED & PROCESSING;
              // treat steps below the current rank as done.
              const reached = rank <= currentRank;
              return (
                <li key={s} className={`admin-status-step ${reached ? "done" : ""} ${state}`}>
                  <span className="admin-status-dot" />
                  <span className="admin-status-name">{s}</span>
                </li>
              );
            })}
          </ol>
        )}

        {error && <p className="admin-error" style={{ marginTop: 12 }}>{error}</p>}

        {isShipStep && (
          <label className="admin-field" style={{ marginTop: 14, display: "block" }}>
            <span className="admin-field-label">Courier tracking no. (optional)</span>
            <input
              className="admin-input"
              type="text"
              placeholder="Add now or later"
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
              disabled={busy}
            />
          </label>
        )}

        {next && (
          <button
            className="admin-btn approve admin-status-cta"
            disabled={busy}
            onClick={advance}
          >
            {busy ? "Updating…" : `Mark as ${next}`}
          </button>
        )}
      </div>
    </div>
  );
}

/* Refund control for cancelled / returned orders. Only shown when the order
   actually had a captured payment (order.refund is null for COD / unpaid).
   PENDING → the customer has been promised a refund; the admin clicks to
   complete it, which flips the payment to REFUNDED so the customer's view
   updates to "Completed". */
function RefundPanel({
  order,
  onUpdated,
}: {
  order: AdminOrderDetail;
  onUpdated: (o: AdminOrderDetail) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const refund = order.refund;
  if (!refund) return null;
  const pending = refund.status === "PENDING";

  async function complete() {
    setBusy(true);
    setError("");
    try {
      const res = await adminProcessRefund(order.id);
      if (res.order) onUpdated(res.order);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not process the refund.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-side-panel">
      <div className="admin-side-head">Refund</div>
      <div className="admin-side-body">
        <div className="admin-summary-row" style={{ marginBottom: 10 }}>
          <dt>Amount</dt>
          <dd>{inr(refund.amount)}</dd>
        </div>
        <span className={`refund-badge ${pending ? "pending" : "done"}`}>
          {pending ? "Refund pending" : "Refund completed"}
        </span>
        {pending ? (
          <>
            <p className="admin-cell-sub" style={{ marginTop: 10 }}>
              The customer paid via {refund.method ?? "—"} and has been told their refund is on the
              way. Issue the refund, then mark it completed — the customer&apos;s order page will
              show it as refunded.
            </p>
            {error && <p className="admin-error" style={{ marginTop: 8 }}>{error}</p>}
            <button
              className="admin-btn approve admin-status-cta"
              disabled={busy}
              onClick={complete}
              style={{ marginTop: 12 }}
            >
              {busy ? "Processing…" : "Mark refund completed"}
            </button>
          </>
        ) : (
          <p className="admin-cell-sub" style={{ marginTop: 10, color: "#2e7d52" }}>
            Refund completed — the customer now sees this order as refunded.
          </p>
        )}
      </div>
    </div>
  );
}

/* Pack/dispatch QR + printable packing slip. The QR encodes only the order
   number (AVC-xxxxxx) — scan it back in on the /admin/scan page to open this
   order. It carries no token, so it grants no access on its own. */
function QrPanel({ order }: { order: AdminOrderDetail }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function download() {
    setBusy(true);
    setError("");
    try {
      await downloadAdminPackingSlip(order.id, order.no);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not download the slip.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-side-panel">
      <div className="admin-side-head">Pack / dispatch QR</div>
      <div className="admin-side-body" style={{ textAlign: "center" }}>
        {order.qr ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={order.qr}
            alt={`QR for ${order.no}`}
            width={160}
            height={160}
            style={{ width: 160, height: 160, margin: "0 auto", display: "block" }}
          />
        ) : (
          <p className="admin-cell-sub">QR unavailable.</p>
        )}
        <p className="admin-cell-sub" style={{ marginTop: 8 }}>
          Encodes <strong>{order.no}</strong> · scan on the Scan page to open this order.
        </p>
        {error && <p className="admin-error" style={{ marginTop: 8 }}>{error}</p>}
        <button
          className="admin-btn admin-status-cta"
          disabled={busy}
          onClick={download}
          style={{ marginTop: 12 }}
        >
          {busy ? "Preparing…" : "Print packing slip (PDF)"}
        </button>
      </div>
    </div>
  );
}

/* Standalone courier tracking editor — set / update / clear the tracking number
   any time after dispatch (when the courier hands it over). */
function TrackingPanel({
  order,
  onUpdated,
}: {
  order: AdminOrderDetail;
  onUpdated: (o: AdminOrderDetail) => void;
}) {
  const [value, setValue] = useState(order.trackingNumber ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const dirty = value.trim() !== (order.trackingNumber ?? "");

  async function save() {
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      onUpdated(await updateAdminOrderTracking(order.id, value.trim()));
      setSaved(true);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not save tracking number.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-side-panel">
      <div className="admin-side-head">Courier tracking</div>
      <div className="admin-side-body">
        <label className="admin-field" style={{ display: "block" }}>
          <span className="admin-field-label">Tracking number</span>
          <input
            className="admin-input"
            type="text"
            placeholder="Add when the courier provides it"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setSaved(false);
            }}
            disabled={busy}
          />
        </label>
        {error && <p className="admin-error" style={{ marginTop: 8 }}>{error}</p>}
        {saved && !dirty && (
          <p className="admin-cell-sub" style={{ marginTop: 8, color: "#2e7d52" }}>
            Saved — the customer can now see it on their order.
          </p>
        )}
        <button
          className="admin-btn approve admin-status-cta"
          disabled={busy || !dirty}
          onClick={save}
          style={{ marginTop: 12 }}
        >
          {busy ? "Saving…" : order.trackingNumber ? "Update tracking" : "Save tracking"}
        </button>
      </div>
    </div>
  );
}

export default function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const numId = Number(id);
    if (!Number.isInteger(numId) || numId <= 0) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    let alive = true;
    fetchAdminOrder(numId)
      .then((data) => {
        if (alive) setOrder(data);
      })
      .catch(() => {
        if (alive) setNotFound(true);
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
        <p className="admin-note">Loading order…</p>
      </section>
    );
  }

  if (notFound || !order) {
    return (
      <section className="admin-page">
        <header className="admin-page-head">
          <h2>Order not found</h2>
          <p>We couldn&apos;t find this order.</p>
        </header>
        <a className="admin-link" href="/admin/orders">
          ← Back to orders
        </a>
      </section>
    );
  }

  const a = order.address;
  const c = order.customer;
  const shippingLabel =
    order.shippingMethod === "priority" ? "Priority Shipping" : "Standard Shipping";

  return (
    <section className="admin-page admin-order-detail">
      <a className="admin-link admin-back" href="/admin/orders">
        ← Back to orders
      </a>

      <header className="admin-order-head">
        <div>
          <h2>{order.no}</h2>
          <p className="admin-order-date">Placed on {fmtDate(order.placedAt)}</p>
        </div>
        <span className={`status-badge ${order.status.toLowerCase()}`}>
          {order.status}
        </span>
      </header>

      <div className="admin-order-grid">
        {/* Left: items + summary */}
        <div className="admin-order-main">
          <div className="admin-side-panel">
            <div className="admin-side-head">
              Items ordered ({order.items.length})
            </div>
            <div className="admin-side-body admin-order-items">
              {order.items.map((it, i) => (
                <div key={i} className="admin-order-item">
                  <div className="admin-order-item-img">
                    {it.image ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={it.image} alt={it.name} />
                    ) : null}
                  </div>
                  <div className="admin-order-item-info">
                    <div className="admin-cell-strong">{it.name}</div>
                    <div className="admin-cell-sub">
                      {it.color}
                      {it.size ? ` · ${it.size}` : ""}
                    </div>
                    <div className="admin-cell-sub">
                      Qty {it.qty} × {inr(it.unitPrice)}
                    </div>
                  </div>
                  <div className="admin-order-item-total">
                    {inr(it.unitPrice * it.qty)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-side-panel">
            <div className="admin-side-head">Order summary</div>
            <div className="admin-side-body">
              <dl className="admin-summary">
                <div className="admin-summary-row">
                  <dt>Subtotal</dt>
                  <dd>{inr(order.subtotal)}</dd>
                </div>
                {order.discount > 0 && (
                  <div className="admin-summary-row">
                    <dt>Discount</dt>
                    <dd>− {inr(order.discount)}</dd>
                  </div>
                )}
                <div className="admin-summary-row">
                  <dt>{shippingLabel}</dt>
                  <dd>{order.shippingFee === 0 ? "Free" : inr(order.shippingFee)}</dd>
                </div>
                <div className="admin-summary-row total">
                  <dt>Total</dt>
                  <dd>{inr(order.total)}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Right: status + customer + address + payment */}
        <aside className="admin-order-side">
          <StatusWorkflow order={order} onUpdated={setOrder} />

          <RefundPanel order={order} onUpdated={setOrder} />

          <QrPanel order={order} />

          <TrackingPanel order={order} onUpdated={setOrder} />

          <div className="admin-side-panel">
            <div className="admin-side-head">Customer</div>
            <div className="admin-side-body">
              <div className="admin-cell-strong">{c.name ?? "—"}</div>
              {c.email && <div className="admin-cell-sub">{c.email}</div>}
              {c.phone && <div className="admin-cell-sub">{c.phone}</div>}
            </div>
          </div>

          <div className="admin-side-panel">
            <div className="admin-side-head">Shipping address</div>
            <div className="admin-side-body">
              {a ? (
                <>
                  <div className="admin-cell-strong">{a.fullName}</div>
                  <div className="admin-cell-sub">
                    {a.street}
                    <br />
                    {a.city}, {a.state} — {a.pincode}
                  </div>
                  <div className="admin-cell-sub">{a.phone}</div>
                </>
              ) : (
                <p className="admin-cell-sub">No address on file.</p>
              )}
            </div>
          </div>

          <div className="admin-side-panel">
            <div className="admin-side-head">Payment</div>
            <div className="admin-side-body">
              <div className="admin-cell-strong">
                {order.payment
                  ? PAYMENT_LABEL[order.payment] ?? order.payment
                  : "—"}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
