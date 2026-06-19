"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchAdminOrderRequest,
  fetchAdminManualOrderConfig,
  approveOrderRequest,
  rejectOrderRequest,
  markOrderRequestPaid,
  confirmOrderRequest,
  adminCancelOrderRequest,
  ApiError,
  type AdminOrderRequest,
  type ManualOrderConfig,
} from "../../../lib/api";
import { AdminPageSkeleton } from "../../../components/skeletons";
import { REQUEST_BADGE } from "../page";

function inr(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
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

/** Numeric order id parsed from the linked order number (AVC-000123 → 123). */
function orderIdFromNo(no: string | null): number | null {
  if (!no) return null;
  const n = Number(no.replace(/\D/g, ""));
  return Number.isInteger(n) && n > 0 ? n : null;
}

/** Build the prefilled payment-instructions WhatsApp message + wa.me link. */
function paymentWhatsapp(req: AdminOrderRequest, cfg: ManualOrderConfig | null) {
  const message = [
    `Your order ${req.no} is approved ✅`,
    "",
    "Please pay manually using any UPI app (PhonePe / Google Pay / Paytm):",
    `UPI ID: ${req.upiId ?? cfg?.upiId ?? ""}`,
    `Name: ${cfg?.upiName ?? "AV Creation"}`,
    `Amount: ${req.totalDisplay}`,
    `Reference: ${req.no}`,
    "",
    "After paying, reply here with the transaction ID or a screenshot so we can verify and confirm your order.",
  ].join("\n");
  const digits = (req.customer?.phone ?? "").replace(/\D/g, "");
  const link = digits ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}` : null;
  return { message, link };
}

/* The status-driven action panel — the core of the manual workflow. */
function ActionsPanel({
  request,
  cfg,
  onUpdated,
}: {
  request: AdminOrderRequest;
  cfg: ManualOrderConfig | null;
  onUpdated: (r: AdminOrderRequest) => void;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [reason, setReason] = useState("");
  const [adminNote, setAdminNote] = useState("");
  // After approving, surface the WhatsApp link to message the customer.
  const [approvedWa, setApprovedWa] = useState<{ link: string | null; message: string } | null>(null);

  const run = async (key: string, fn: () => Promise<{ request: AdminOrderRequest }>) => {
    setBusy(key);
    setError("");
    try {
      const res = await fn();
      onUpdated(res.request);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Action failed. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  const approve = async () => {
    setBusy("approve");
    setError("");
    try {
      const res = await approveOrderRequest(request.id, adminNote.trim() || undefined);
      onUpdated(res.request);
      setApprovedWa({ link: res.whatsapp.link, message: res.whatsapp.message });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not approve.");
    } finally {
      setBusy(null);
    }
  };

  const s = request.status;
  const wa = paymentWhatsapp(request, cfg);

  return (
    <div className="admin-side-panel">
      <div className="admin-side-head">Manage request</div>
      <div className="admin-side-body">
        {error && <p className="admin-error" style={{ marginBottom: 12 }}>{error}</p>}

        {/* ---- PENDING_APPROVAL ---- */}
        {s === "PENDING_APPROVAL" && (
          <>
            <p className="admin-cell-sub" style={{ marginBottom: 12 }}>
              Check the stock for these items in the offline store, then approve (sends UPI details)
              or reject (out of stock). Nothing is reserved.
            </p>
            <label className="admin-field" style={{ display: "block", marginBottom: 12 }}>
              <span className="admin-field-label">Internal note (optional)</span>
              <input
                className="admin-input"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Visible to admins only"
                disabled={!!busy}
              />
            </label>
            <button className="admin-btn approve admin-status-cta" onClick={approve} disabled={!!busy}>
              {busy === "approve" ? "Approving…" : "Approve — request payment"}
            </button>
            <div className="req-reject-row">
              <input
                className="admin-input"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason (e.g. out of stock)"
                disabled={!!busy}
              />
              <button
                className="admin-btn"
                onClick={() => run("reject", () => rejectOrderRequest(request.id, reason.trim() || undefined))}
                disabled={!!busy}
              >
                {busy === "reject" ? "…" : "Reject"}
              </button>
            </div>
          </>
        )}

        {/* ---- APPROVED ---- */}
        {s === "APPROVED" && (
          <>
            <div className="req-pay-inline">
              <div className="req-pay-head">Payment instructions sent</div>
              <div className="req-pay-rows">
                <div><span>UPI ID</span><b>{request.upiId ?? cfg?.upiId ?? "—"}</b></div>
                <div><span>Amount</span><b>{request.totalDisplay}</b></div>
                <div><span>Reference</span><b>{request.no}</b></div>
              </div>
            </div>
            {(approvedWa?.link ?? wa.link) && (
              <a
                className="admin-btn approve admin-status-cta req-wa-btn"
                href={approvedWa?.link ?? wa.link ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
              >
                Message customer on WhatsApp
              </a>
            )}
            <button
              className="admin-btn approve admin-status-cta"
              style={{ marginTop: 10 }}
              onClick={() => run("paid", () => markOrderRequestPaid(request.id))}
              disabled={!!busy}
            >
              {busy === "paid" ? "Updating…" : "Mark payment received"}
            </button>
            <div className="req-reject-row">
              <input
                className="admin-input"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reject reason"
                disabled={!!busy}
              />
              <button
                className="admin-btn"
                onClick={() => run("reject", () => rejectOrderRequest(request.id, reason.trim() || undefined))}
                disabled={!!busy}
              >
                {busy === "reject" ? "…" : "Reject"}
              </button>
            </div>
          </>
        )}

        {/* ---- PAYMENT_SUBMITTED ---- */}
        {s === "PAYMENT_SUBMITTED" && (
          <>
            <p className="admin-cell-sub" style={{ marginBottom: 12 }}>
              Customer submitted payment. Verify it in your UPI app, then mark it received.
            </p>
            <div className="req-pay-rows" style={{ marginBottom: 12 }}>
              <div><span>Reference</span><b>{request.paymentRef ?? "—"}</b></div>
              <div><span>Amount</span><b>{request.totalDisplay}</b></div>
            </div>
            {request.paymentProofUrl && (
              <a className="admin-link" href={request.paymentProofUrl} target="_blank" rel="noopener noreferrer">
                View payment screenshot ↗
              </a>
            )}
            <button
              className="admin-btn approve admin-status-cta"
              style={{ marginTop: 12 }}
              onClick={() => run("paid", () => markOrderRequestPaid(request.id))}
              disabled={!!busy}
            >
              {busy === "paid" ? "Updating…" : "Mark payment received"}
            </button>
            <div className="req-reject-row">
              <input
                className="admin-input"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reject reason"
                disabled={!!busy}
              />
              <button
                className="admin-btn"
                onClick={() => run("reject", () => rejectOrderRequest(request.id, reason.trim() || undefined))}
                disabled={!!busy}
              >
                {busy === "reject" ? "…" : "Reject"}
              </button>
            </div>
          </>
        )}

        {/* ---- PAID ---- */}
        {s === "PAID" && (
          <>
            <p className="admin-cell-sub" style={{ marginBottom: 12 }}>
              Payment verified. Confirming will <strong>deduct stock</strong> and create a fulfilment
              order. If the item sold offline, reject instead.
            </p>
            <button
              className="admin-btn approve admin-status-cta"
              onClick={() => run("confirm", () => confirmOrderRequest(request.id))}
              disabled={!!busy}
            >
              {busy === "confirm" ? "Confirming…" : "Confirm order — deduct stock"}
            </button>
            <button
              className="admin-btn"
              style={{ marginTop: 10, width: "100%" }}
              onClick={() => run("cancel", () => adminCancelOrderRequest(request.id))}
              disabled={!!busy}
            >
              {busy === "cancel" ? "…" : "Cancel request"}
            </button>
          </>
        )}

        {/* ---- CONFIRMED ---- */}
        {s === "CONFIRMED" && (
          <div className="req-state-note ok">
            Confirmed. Stock deducted and a fulfilment order was created.
            {orderIdFromNo(request.orderNo) && (
              <>
                {" "}
                <Link href={`/admin/orders/${orderIdFromNo(request.orderNo)}`}>
                  Open order {request.orderNo} →
                </Link>
              </>
            )}
          </div>
        )}

        {/* ---- REJECTED ---- */}
        {s === "REJECTED" && (
          <div className="req-state-note bad">
            Rejected{request.rejectionReason ? `: ${request.rejectionReason}` : "."}
          </div>
        )}

        {/* ---- CANCELLED ---- */}
        {s === "CANCELLED" && <div className="req-state-note">This request was cancelled.</div>}
      </div>
    </div>
  );
}

export default function AdminOrderRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const numId = Number(id);
  const validId = Number.isInteger(numId) && numId > 0;

  const [request, setRequest] = useState<AdminOrderRequest | null>(null);
  const [cfg, setCfg] = useState<ManualOrderConfig | null>(null);
  // Only "loading" when there's a valid id to fetch — an invalid id resolves
  // straight to the not-found view without any in-effect setState.
  const [loading, setLoading] = useState(validId);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!validId) return;
    let alive = true;
    fetchAdminManualOrderConfig()
      .then((c) => alive && setCfg(c))
      .catch(() => {});
    fetchAdminOrderRequest(numId)
      .then((data) => alive && setRequest(data))
      .catch(() => alive && setNotFound(true))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [validId, numId]);

  if (loading) return <AdminPageSkeleton body="panel" />;

  if (notFound || !request) {
    return (
      <section className="admin-page">
        <header className="admin-page-head">
          <h2>Request not found</h2>
          <p>We couldn&apos;t find this order request.</p>
        </header>
        <Link className="admin-link" href="/admin/order-requests">
          ← Back to requests
        </Link>
      </section>
    );
  }

  const a = request.address;
  const c = request.customer;

  return (
    <section className="admin-page admin-order-detail">
      <Link className="admin-link admin-back" href="/admin/order-requests">
        ← Back to requests
      </Link>

      <header className="admin-order-head">
        <div>
          <h2>{request.no}</h2>
          <p className="admin-order-date">Requested on {fmtDate(request.createdAt)}</p>
        </div>
        <span className={`status-badge ${REQUEST_BADGE[request.status]}`}>{request.statusLabel}</span>
      </header>

      <div className="admin-order-grid">
        {/* Left: items + summary + trail */}
        <div className="admin-order-main">
          <div className="admin-side-panel">
            <div className="admin-side-head">Items requested ({request.items.length})</div>
            <div className="admin-side-body admin-order-items">
              {request.items.map((it, i) => (
                <div key={i} className="admin-order-item">
                  <div className="admin-order-item-img">
                    {it.image ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={it.image} alt={it.name} />
                    ) : null}
                  </div>
                  <div className="admin-order-item-info">
                    {it.productId ? (
                      <Link className="admin-link admin-cell-strong" href={`/admin/products/edit/${it.productId}`}>
                        {it.name}
                      </Link>
                    ) : (
                      <div className="admin-cell-strong">{it.name}</div>
                    )}
                    <div className="admin-cell-sub">
                      {it.color}
                      {it.size ? ` · ${it.size}` : ""}
                    </div>
                    <div className="admin-cell-sub">
                      Qty {it.qty} × {inr(it.unitPrice)}
                    </div>
                  </div>
                  <div className="admin-order-item-total">{inr(it.lineTotal)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-side-panel">
            <div className="admin-side-head">Summary</div>
            <div className="admin-side-body">
              <dl className="admin-summary">
                <div className="admin-summary-row total">
                  <dt>Indicative total</dt>
                  <dd>{request.totalDisplay}</dd>
                </div>
              </dl>
              <p className="admin-cell-sub" style={{ marginTop: 6 }}>
                No payment gateway. Customer pays manually over UPI after approval.
              </p>
            </div>
          </div>

          {request.customerNote && (
            <div className="admin-side-panel">
              <div className="admin-side-head">Customer note</div>
              <div className="admin-side-body">
                <p className="admin-cell-sub">{request.customerNote}</p>
              </div>
            </div>
          )}

          {request.adminNote && (
            <div className="admin-side-panel">
              <div className="admin-side-head">Internal note</div>
              <div className="admin-side-body">
                <p className="admin-cell-sub">{request.adminNote}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right: actions + customer + address */}
        <aside className="admin-order-side">
          <ActionsPanel request={request} cfg={cfg} onUpdated={setRequest} />

          <div className="admin-side-panel">
            <div className="admin-side-head">Customer</div>
            <div className="admin-side-body">
              <div className="admin-cell-strong">{c?.name ?? "—"}</div>
              {c?.email && <div className="admin-cell-sub">{c.email}</div>}
              {c?.phone && <div className="admin-cell-sub">{c.phone}</div>}
            </div>
          </div>

          <div className="admin-side-panel">
            <div className="admin-side-head">Delivery address</div>
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
                <p className="admin-cell-sub">To be shared on WhatsApp.</p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
