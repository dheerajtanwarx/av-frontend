"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { Star, Check, Download, ArrowLeft, ImageOff, Clock, ShieldCheck } from "lucide-react";
import Header from "../../components/landing/Header";
import { fetchOrder, cancelOrder, returnOrder, advanceOrder, submitReview, downloadInvoice, ApiError, type MyOrder, type OrderShippingAddress } from "../../lib/api";
import OrderProgress, { statusLabel } from "../../components/OrderProgress";

const IS_DEV = process.env.NODE_ENV !== "production";
const ADVANCEABLE = ["PLACED", "CONFIRMED", "PROCESSING", "SHIPPED"];

/** DEV-only helper: nudge an order to its next fulfilment status so the
    Return + Review flows (which need DELIVERED) can be exercised locally. */
function DevAdvance({ order, onAdvanced }: { order: MyOrder; onAdvanced: (o: MyOrder) => void }) {
  const [busy, setBusy] = useState(false);
  if (!IS_DEV || !ADVANCEABLE.includes(order.status)) return null;

  async function advance() {
    setBusy(true);
    try {
      onAdvanced(await advanceOrder(order.id));
    } catch {
      /* ignore */
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        border: "1px dashed var(--line)",
        background: "#fff7ed",
        padding: "10px 14px",
        margin: "0 0 18px",
        fontFamily: "var(--font-jost)",
        fontSize: 12,
        color: "var(--muted)",
      }}
    >
      <span>Dev tool — simulate fulfilment so Return/Review become available.</span>
      <button
        onClick={advance}
        disabled={busy}
        style={{
          cursor: "pointer",
          border: "1px solid var(--ink-soft)",
          background: "transparent",
          padding: "6px 12px",
          fontFamily: "var(--font-jost)",
          fontSize: 12,
          color: "var(--ink)",
        }}
      >
        {busy ? "Advancing…" : "Advance status →"}
      </button>
    </div>
  );
}

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

function statusClass(status: string): string {
  const map: Record<string, string> = {
    PLACED: "placed",
    CONFIRMED: "confirmed",
    PROCESSING: "processing",
    SHIPPED: "shipped",
    DELIVERED: "delivered",
    CANCELLED: "cancelled",
    RETURNED: "returned",
  };
  return map[status] ?? "placed";
}

const CANCEL_REASONS = [
  "Changed my mind",
  "Found a better price elsewhere",
  "Ordered by mistake",
  "Delivery time is too long",
  "Item no longer needed",
  "Other",
];

type CancelStep = "idle" | "reason" | "confirm";

function CancelSection({ order, onCancelled }: { order: MyOrder; onCancelled: (updated: MyOrder) => void }) {
  const [step, setStep] = useState<CancelStep>("idle");
  const [selectedReason, setSelectedReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancellable = ["PLACED", "CONFIRMED"].includes(order.status);
  if (!cancellable) return null;

  const finalReason = selectedReason === "Other" ? otherReason.trim() : selectedReason;
  const canProceed = selectedReason !== "" && (selectedReason !== "Other" || otherReason.trim() !== "");

  function handleBack() {
    setError(null);
    setStep("reason");
  }

  async function handleConfirm() {
    setBusy(true);
    setError(null);
    try {
      const updated = await cancelOrder(order.id, finalReason || undefined);
      onCancelled(updated);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div className="order-cancel-panel">
      <div className="order-side-head">Cancel Order</div>
      <div className="order-cancel-body">
        {step === "idle" && (
          <>
            <p className="order-cancel-hint">
              Orders can be cancelled before they enter crafting. Once our karigars begin your piece,
              it cannot be cancelled.
            </p>
            <button className="order-cancel-btn" onClick={() => setStep("reason")}>
              Request Cancellation
            </button>
          </>
        )}

        {step === "reason" && (
          <div className="order-cancel-reason">
            <div className="order-cancel-confirm-msg" style={{ marginBottom: 14 }}>
              Why are you cancelling this order?
            </div>
            <div className="order-cancel-reasons-list">
              {CANCEL_REASONS.map((r) => (
                <label key={r} className={`order-cancel-reason-option${selectedReason === r ? " selected" : ""}`}>
                  <input
                    type="radio"
                    name="cancel-reason"
                    value={r}
                    checked={selectedReason === r}
                    onChange={() => setSelectedReason(r)}
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>
            {selectedReason === "Other" && (
              <textarea
                className="order-cancel-other-input"
                placeholder="Tell us more…"
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
                rows={3}
              />
            )}
            <div className="order-cancel-confirm-actions" style={{ marginTop: 16 }}>
              <button
                className="order-cancel-confirm-yes"
                onClick={() => setStep("confirm")}
                disabled={!canProceed}
              >
                Continue
              </button>
              <button
                className="order-cancel-confirm-no"
                onClick={() => { setStep("idle"); setSelectedReason(""); setOtherReason(""); }}
              >
                Keep Order
              </button>
            </div>
          </div>
        )}

        {step === "confirm" && (
          <div className="order-cancel-confirm">
            <div className="order-cancel-confirm-msg">
              Are you sure you want to cancel <strong>{order.no}</strong>? This cannot be undone.
            </div>
            <div className="order-cancel-reason-summary">
              <span className="order-cancel-reason-label">Reason:</span>
              <span>{finalReason}</span>
            </div>
            {error && (
              <div style={{ fontFamily: "var(--font-jost)", fontSize: 13, color: "var(--rani)" }}>
                {error}
              </div>
            )}
            <div className="order-cancel-confirm-actions">
              <button
                className="order-cancel-confirm-yes"
                onClick={handleConfirm}
                disabled={busy}
              >
                {busy ? "Cancelling…" : "Yes, Cancel"}
              </button>
              <button
                className="order-cancel-confirm-no"
                onClick={handleBack}
                disabled={busy}
              >
                Go Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Refund Status ───────────────────────────────────────── */

/** Where the customer's money goes back to, phrased per payment method. */
const REFUND_DESTINATION: Record<string, string> = {
  UPI: "your UPI account",
  CARD: "your card",
  NETBANKING: "your bank account",
  WALLET: "your wallet",
  COD: "your account",
};

/* Reassurance panel shown on cancelled / returned orders that had a payment.
   PENDING tells the customer their money is on its way; once an admin marks the
   refund completed, the same panel flips to COMPLETED automatically. */
function RefundStatus({ order }: { order: MyOrder }) {
  const refund = order.refund;
  if (!refund) return null;

  const pending = refund.status === "PENDING";
  const destination = REFUND_DESTINATION[refund.method ?? ""] ?? "your original payment method";
  const amount = inr(refund.amount);

  return (
    <div className={`order-refund-panel ${pending ? "pending" : "done"}`}>
      <span className="order-refund-icon" aria-hidden="true">
        {pending ? <Clock strokeWidth={2} /> : <ShieldCheck strokeWidth={2} />}
      </span>
      <div className="order-refund-content">
        <div className="order-refund-top">
          <span className="order-refund-title">
            {pending ? "Refund in progress" : "Refund completed"}
          </span>
          <span className={`refund-badge ${pending ? "pending" : "done"}`}>
            {pending ? "Pending" : "Completed"}
          </span>
        </div>
        <div className="order-refund-amount">{amount}</div>
        <p className="order-refund-note">
          {pending ? (
            <>
              Don&apos;t worry — your payment of <strong>{amount}</strong>
              {refund.method ? <> made via {refund.method}</> : null} will be refunded to{" "}
              <strong>{destination}</strong> within 5–7 business days. You&apos;ll see this update
              to <strong>Completed</strong> here as soon as it&apos;s processed.
            </>
          ) : (
            <>
              Your refund of <strong>{amount}</strong> has been processed and credited back to{" "}
              <strong>{destination}</strong>. Depending on your bank it may take a few business days
              to reflect in your statement.
            </>
          )}
        </p>
      </div>
    </div>
  );
}

/* ── Star Picker ─────────────────────────────────────────── */


function StarPicker({ value, onChange, disabled }: { value: number; onChange: (n: number) => void; disabled?: boolean }) {
  const [hover, setHover] = useState(0);
  const active = hover || value;
  return (
    <div className="order-review-stars" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={disabled}
          className={`order-review-star${active >= n ? " filled" : ""}`}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
        >
          <Star size={26} fill="currentColor" stroke="none" aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}

const STAR_LABELS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

/* ── Review Section ──────────────────────────────────────── */

type ReviewItemState = { rating: number; comment: string; status: "idle" | "submitting" | "done" | "error"; error: string };

function ReviewSection({ order }: { order: MyOrder }) {
  const uniqueItems = order.items.filter(
    (item, i, arr) => arr.findIndex((x) => x.productId === item.productId) === i
  );

  const initial: Record<number, ReviewItemState> = {};
  for (const item of uniqueItems) {
    initial[item.productId] = { rating: 0, comment: "", status: "idle", error: "" };
  }

  const [states, setStates] = useState(initial);

  function update(productId: number, patch: Partial<ReviewItemState>) {
    setStates((prev) => ({ ...prev, [productId]: { ...prev[productId], ...patch } }));
  }

  async function handleSubmit(productId: number) {
    const s = states[productId];
    if (s.rating === 0) return;
    update(productId, { status: "submitting", error: "" });
    try {
      await submitReview(productId, s.rating, s.comment || undefined);
      update(productId, { status: "done" });
    } catch (e) {
      const msg = e instanceof ApiError
        ? e.status === 409 ? "You've already reviewed this item." : e.message
        : "Something went wrong.";
      update(productId, { status: "error", error: msg });
    }
  }

  const allDone = uniqueItems.every((i) => states[i.productId]?.status === "done");

  return (
    <section className="order-review-section">
      <div className="order-review-heading">
        <span className="order-review-heading-badge">
          <Star size={18} fill="currentColor" stroke="none" aria-hidden="true" />
        </span>
        <div className="order-review-heading-text">
          <div className="order-review-title">Rate Your Purchase</div>
          <div className="order-review-subtitle">
            {allDone
              ? `Thank you — your review${uniqueItems.length > 1 ? "s are" : " is"} pending approval.`
              : "Share your experience to help other shoppers"}
          </div>
        </div>
      </div>

      <div className="order-review-items">
        {uniqueItems.map((item) => {
          const s = states[item.productId];
          if (!s) return null;
          const done = s.status === "done";
          return (
            <div key={item.productId} className={`order-review-card${done ? " done" : ""}`}>
              {item.image ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={item.image} alt={item.name} className="order-review-card-img" />
              ) : (
                <div className="order-review-card-img-ph" />
              )}
              <div className="order-review-card-body">
                <div className="order-review-card-name">{item.name}</div>
                <div className="order-review-card-meta">{item.color}{item.size ? ` · ${item.size}` : ""}</div>
                {done ? (
                  <div className="order-review-submitted">
                    <Check size={15} strokeWidth={2.5} />
                    Review submitted — pending approval
                  </div>
                ) : (
                  <>
                    <div className="order-review-stars-row">
                      <StarPicker value={s.rating} onChange={(n) => update(item.productId, { rating: n })} disabled={s.status === "submitting"} />
                      <span className="order-review-star-label">{s.rating > 0 ? STAR_LABELS[s.rating] : "Tap to rate"}</span>
                    </div>
                    {s.rating > 0 && (
                      <textarea
                        className="order-review-comment"
                        placeholder="Tell us more (optional)…"
                        rows={2}
                        value={s.comment}
                        onChange={(e) => update(item.productId, { comment: e.target.value })}
                        disabled={s.status === "submitting"}
                      />
                    )}
                    {s.error && <div className="order-review-error">{s.error}</div>}
                    <button
                      className="order-review-submit"
                      onClick={() => handleSubmit(item.productId)}
                      disabled={s.rating === 0 || s.status === "submitting"}
                    >
                      {s.status === "submitting" ? "Submitting…" : "Submit Review"}
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ── Return Section ──────────────────────────────────────── */

const RETURN_REASONS = [
  "Item received damaged",
  "Wrong item delivered",
  "Not as described",
  "Quality not as expected",
  "Changed my mind",
  "Other",
];

type ReturnStep = "idle" | "reason" | "confirm";

function ReturnSection({ order, onReturned }: { order: MyOrder; onReturned: (updated: MyOrder) => void }) {
  const [step, setStep] = useState<ReturnStep>("idle");
  const [selectedReason, setSelectedReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (order.status !== "DELIVERED") return null;

  const eligibleUntil = order.returnEligibleUntil ? new Date(order.returnEligibleUntil) : null;
  const withinWindow = eligibleUntil && eligibleUntil > new Date();
  const finalReason = selectedReason === "Other" ? otherReason.trim() : selectedReason;
  const canProceed = selectedReason !== "" && (selectedReason !== "Other" || otherReason.trim() !== "");

  async function handleConfirm() {
    setBusy(true);
    setError(null);
    try {
      const updated = await returnOrder(order.id, finalReason || undefined);
      onReturned(updated);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div className="order-cancel-panel">
      <div className="order-side-head">Return Order</div>
      <div className="order-cancel-body">
        {!withinWindow ? (
          <p className="order-cancel-hint" style={{ marginBottom: 0 }}>
            The 7-day return window for this order has closed. Returns must be requested within 7 days of delivery.
          </p>
        ) : step === "idle" ? (
          <>
            <p className="order-cancel-hint">
              Not satisfied? You can return this order within 7 days of delivery.{" "}
              <span style={{ color: "var(--ink)" }}>
                Window closes {eligibleUntil!.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}.
              </span>
            </p>
            <button className="order-cancel-btn" style={{ borderColor: "var(--ink-soft)", color: "var(--ink-soft)" }} onClick={() => setStep("reason")}>
              Request Return
            </button>
          </>
        ) : step === "reason" ? (
          <div className="order-cancel-reason">
            <div className="order-cancel-confirm-msg" style={{ marginBottom: 14 }}>
              Why are you returning this order?
            </div>
            <div className="order-cancel-reasons-list">
              {RETURN_REASONS.map((r) => (
                <label key={r} className={`order-cancel-reason-option${selectedReason === r ? " selected" : ""}`}>
                  <input type="radio" name="return-reason" value={r} checked={selectedReason === r} onChange={() => setSelectedReason(r)} />
                  <span>{r}</span>
                </label>
              ))}
            </div>
            {selectedReason === "Other" && (
              <textarea className="order-cancel-other-input" placeholder="Tell us more…" value={otherReason} onChange={(e) => setOtherReason(e.target.value)} rows={3} />
            )}
            <div className="order-cancel-confirm-actions" style={{ marginTop: 16 }}>
              <button className="order-cancel-confirm-yes" onClick={() => setStep("confirm")} disabled={!canProceed} style={{ background: "var(--ink-soft)" }}>
                Continue
              </button>
              <button className="order-cancel-confirm-no" onClick={() => { setStep("idle"); setSelectedReason(""); setOtherReason(""); }}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="order-cancel-confirm">
            <div className="order-cancel-confirm-msg">
              Confirm return for <strong>{order.no}</strong>? Our team will contact you with pickup details.
            </div>
            <div className="order-cancel-reason-summary">
              <span className="order-cancel-reason-label">Reason:</span>
              <span>{finalReason}</span>
            </div>
            {error && <div style={{ fontFamily: "var(--font-jost)", fontSize: 13, color: "var(--rani)" }}>{error}</div>}
            <div className="order-cancel-confirm-actions">
              <button className="order-cancel-confirm-yes" onClick={handleConfirm} disabled={busy} style={{ background: "var(--ink-soft)" }}>
                {busy ? "Submitting…" : "Confirm Return"}
              </button>
              <button className="order-cancel-confirm-no" onClick={() => { setStep("reason"); setError(null); }} disabled={busy}>
                Go Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Invoice Section ─────────────────────────────────────── */

/* Download button for the order's PDF invoice. Only rendered for delivered
   orders, for which the backend issues an invoice. */
function InvoiceSection({ order }: { order: MyOrder }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (order.status !== "DELIVERED") return null;

  async function handleDownload() {
    setBusy(true);
    setError(null);
    try {
      await downloadInvoice(order.id, order.no);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not download the invoice. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="order-side-panel">
      <div className="order-side-head">Invoice</div>
      <div className="order-side-body">
        <button className="order-invoice-btn" onClick={handleDownload} disabled={busy}>
          <Download strokeWidth={2} />
          {busy ? "Preparing…" : "Download Invoice (PDF)"}
        </button>
        {error ? (
          <p className="order-invoice-error">{error}</p>
        ) : (
          <p className="order-invoice-hint">Tax invoice for {order.no}</p>
        )}
      </div>
    </div>
  );
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<MyOrder | null>(null);
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
    fetchOrder(numId)
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
      <main className="av order-detail-page">
        <Header />
        <section className="order-detail-shell">
          <div className="order-loading">Loading order details…</div>
        </section>
      </main>
    );
  }

  if (notFound || !order) {
    return (
      <main className="av order-detail-page">
        <Header />
        <section className="order-detail-shell">
          <div className="order-error">
            <h2>Order not found</h2>
            <p>We couldn&apos;t find this order in your account.</p>
            <a href="/my-orders" style={{ fontFamily: "var(--font-jost)", fontSize: 13, color: "var(--rani)" }}>
              ← Back to My Orders
            </a>
          </div>
        </section>
      </main>
    );
  }

  const a = order.address;
  const shippingLabel = order.shippingMethod === "priority" ? "Priority Shipping" : "Standard Shipping";
  const freeShipping = order.shippingFee === 0;

  return (
    <main className="av order-detail-page">
      <Header />
      <section className="order-detail-shell">
        {/* breadcrumb */}
        <a href="/my-orders" className="order-back">
          <ArrowLeft strokeWidth={2} />
          My Orders
        </a>

        {/* banner */}
        <div className="order-banner">
          <div>
            <div className="order-banner-no">{order.no}</div>
            <h1>{statusLabel(order.status)}</h1>
            <div className="order-banner-date">Placed on {fmtDate(order.placedAt)}</div>
          </div>
          <span className={`status-badge ${statusClass(order.status)}`}>
            {statusLabel(order.status)}
          </span>
        </div>

        {/* dev-only fulfilment simulator */}
        <DevAdvance order={order} onAdvanced={setOrder} />

        {/* progress tracker */}
        <OrderProgress status={order.status} />

        {/* refund reassurance — cancelled/returned paid orders */}
        <RefundStatus order={order} />

        {/* body */}
        <div className="order-detail-body">
          {/* left: items */}
          <div className="order-items-panel">
            <div className="order-panel-head">
              Items Ordered ({order.items.length})
            </div>
            {order.items.map((item, i) => (
              <div key={i} className="order-item-row">
                <a href={`/product/${item.slug}`} className="order-item-img" style={{ textDecoration: "none" }}>
                  {item.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={item.image} alt={item.name} />
                  ) : (
                    <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "var(--muted)" }}>
                      <ImageOff strokeWidth={1.5} style={{ width: 28, opacity: 0.35 }} />
                    </div>
                  )}
                </a>
                <div className="order-item-info">
                  <a href={`/product/${item.slug}`} className="order-item-name" style={{ textDecoration: "none" }}>
                    {item.name}
                  </a>
                  <div className="order-item-meta">
                    {item.color}{item.size ? ` · ${item.size}` : ""}
                  </div>
                  <div className="order-item-price-row">
                    <span className="order-item-qty">Qty {item.qty} × {inr(item.unitPrice)}</span>
                    <span className="order-item-total">{inr(item.unitPrice * item.qty)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* sidebar col 1: summary + delivery */}
          <div className="order-sidebar-col">
            {/* order summary */}
            <div className="order-side-panel">
              <div className="order-side-head">Order Summary</div>
              <div className="order-side-body">
                <dl style={{ margin: 0 }}>
                  <div className="order-summary-row">
                    <dt>Subtotal</dt>
                    <dd>{inr(order.subtotal)}</dd>
                  </div>
                  {order.discount > 0 && (
                    <div className="order-summary-row">
                      <dt>Discount</dt>
                      <dd style={{ color: "var(--green)" }}>− {inr(order.discount)}</dd>
                    </div>
                  )}
                  <div className="order-summary-row">
                    <dt>{shippingLabel}</dt>
                    <dd>{freeShipping ? <span style={{ color: "var(--green)" }}>Free</span> : inr(order.shippingFee)}</dd>
                  </div>
                  <div className="order-summary-row total">
                    <dt>Total</dt>
                    <dd>{inr(order.total)}</dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* delivery address */}
            {a && (
              <div className="order-side-panel">
                <div className="order-side-head">Delivery Address</div>
                <div className="order-side-body">
                  <div className="order-addr-name">{a.fullName}</div>
                  <div className="order-addr-lines">
                    {a.street}<br />
                    {a.city}, {a.state} — {a.pincode}
                  </div>
                  <div className="order-addr-phone">{a.phone}</div>
                </div>
              </div>
            )}
          </div>

          {/* sidebar col 2: payment + cancel */}
          <div className="order-sidebar-col">
            {/* payment & tracking */}
            <div className="order-side-panel">
              <div className="order-side-head">Payment & Shipping</div>
              <div className="order-side-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {order.payment && (
                  <div className="order-payment-row">
                    <div className="order-payment-icon">{order.payment}</div>
                    <div className="order-payment-label">
                      {order.payment === "COD" ? "Cash on Delivery" : order.payment}
                    </div>
                  </div>
                )}
                {order.trackingNumber ? (
                  <dl style={{ margin: 0 }}>
                    <div className="order-tracking-row">
                      <dt>Tracking No.</dt>
                      <dd>{order.trackingNumber}</dd>
                    </div>
                  </dl>
                ) : ["PLACED", "CONFIRMED", "PROCESSING"].includes(order.status) ? (
                  <p style={{ margin: 0, fontFamily: "var(--font-jost)", fontSize: 12, color: "var(--muted)" }}>
                    You&apos;ll get a tracking number here once your order ships.
                  </p>
                ) : order.status === "SHIPPED" ? (
                  <p style={{ margin: 0, fontFamily: "var(--font-jost)", fontSize: 12, color: "var(--muted)" }}>
                    Your order is on its way — the tracking number will appear here shortly.
                  </p>
                ) : null}
                <dl style={{ margin: 0 }}>
                  <div className="order-tracking-row">
                    <dt>Shipping</dt>
                    <dd>{shippingLabel}</dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* invoice (delivered orders) */}
            <InvoiceSection order={order} />

            {/* cancel or return section */}
            <CancelSection order={order} onCancelled={setOrder} />
            <ReturnSection order={order} onReturned={setOrder} />
          </div>
        </div>

        {/* review section — shown below body for delivered orders */}
        {order.status === "DELIVERED" && <ReviewSection order={order} />}
      </section>
    </main>
  );
}
