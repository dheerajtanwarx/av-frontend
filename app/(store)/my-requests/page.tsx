"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ClipboardList, User } from "lucide-react";
import Header from "../components/landing/Header";
import {
  cancelRequest,
  fetchMyRequests,
  getSession,
  submitRequestPayment,
  type OrderRequest,
  type OrderRequestStatus,
} from "../lib/api";

/* Customer view of their offline-first order requests. Surfaces the live
   status, payment instructions once approved, and the actions available at
   each step (submit payment reference, cancel). */

const STATUS_CLASS: Record<OrderRequestStatus, string> = {
  PENDING_APPROVAL: "placed",
  APPROVED: "confirmed",
  PAYMENT_SUBMITTED: "processing",
  PAID: "shipped",
  CONFIRMED: "delivered",
  REJECTED: "cancelled",
  CANCELLED: "cancelled",
};

const CANCELLABLE: OrderRequestStatus[] = ["PENDING_APPROVAL", "APPROVED", "PAYMENT_SUBMITTED"];

function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

function RequestCard({
  request,
  onChange,
}: {
  request: OrderRequest;
  onChange: (r: OrderRequest) => void;
}) {
  const [ref, setRef] = useState("");
  const [busy, setBusy] = useState<null | "pay" | "cancel">(null);
  const [err, setErr] = useState<string | null>(null);

  const submitPayment = async () => {
    if (!ref.trim() || busy) return;
    setBusy("pay");
    setErr(null);
    try {
      onChange(await submitRequestPayment(request.id, { paymentRef: ref.trim() }));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not submit. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  const doCancel = async () => {
    if (busy) return;
    if (!window.confirm(`Cancel request ${request.no}?`)) return;
    setBusy("cancel");
    setErr(null);
    try {
      onChange(await cancelRequest(request.id));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not cancel. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="req-card">
      <div className="req-card-top">
        <div>
          <div className="req-card-no">{request.no}</div>
          <div className="req-card-date">{fmtDate(request.createdAt)}</div>
        </div>
        <span className={`status-badge ${STATUS_CLASS[request.status]}`}>{request.statusLabel}</span>
      </div>

      <div className="req-card-items">
        {request.items.map((it, i) => (
          <div className="req-card-item" key={i}>
            <span className="ri-name">
              {it.name} <span className="ri-opt">· {it.color}{it.size ? ` · ${it.size}` : ""}</span>
            </span>
            <span className="ri-qty">×{it.qty}</span>
            <span className="ri-price">{it.price}</span>
          </div>
        ))}
      </div>

      <div className="req-card-total">
        <span>Indicative total</span>
        <b>{request.totalDisplay}</b>
      </div>

      {/* Contextual status panel */}
      {request.status === "PENDING_APPROVAL" && (
        <div className="req-state-note">
          Awaiting our team’s availability check. You’ll get payment instructions here once approved.
        </div>
      )}

      {request.status === "APPROVED" && (
        <div className="req-pay">
          <div className="req-pay-head">Payment instructions</div>
          <div className="req-pay-rows">
            <div>
              <span>UPI ID</span>
              <b>{request.upiId ?? "—"}</b>
            </div>
            <div>
              <span>Amount</span>
              <b>{request.totalDisplay}</b>
            </div>
            <div>
              <span>Reference</span>
              <b>{request.no}</b>
            </div>
          </div>
          <p className="req-pay-fine">
            Pay using any UPI app (PhonePe / Google Pay / Paytm), then enter the transaction ID below.
          </p>
          <div className="req-pay-form">
            <input
              value={ref}
              onChange={(e) => setRef(e.target.value)}
              placeholder="UPI transaction / reference ID"
            />
            <button onClick={submitPayment} disabled={busy === "pay" || !ref.trim()}>
              {busy === "pay" ? "Submitting…" : "I’ve paid — submit"}
            </button>
          </div>
        </div>
      )}

      {request.status === "PAYMENT_SUBMITTED" && (
        <div className="req-state-note">
          Payment submitted{request.paymentRef ? ` (ref ${request.paymentRef})` : ""}. We’re verifying
          it and will confirm your order shortly.
        </div>
      )}

      {request.status === "PAID" && (
        <div className="req-state-note ok">
          Payment verified. Your order is being confirmed.
        </div>
      )}

      {request.status === "CONFIRMED" && (
        <div className="req-state-note ok">
          Confirmed 🎉{" "}
          {request.orderNo ? (
            <>
              Track it as order <b>{request.orderNo}</b> in{" "}
              <Link href="/my-orders">My Orders</Link>.
            </>
          ) : (
            "Your order is confirmed."
          )}
        </div>
      )}

      {request.status === "REJECTED" && (
        <div className="req-state-note bad">
          {request.rejectionReason ?? "This product is out of stock."}
        </div>
      )}

      {request.status === "CANCELLED" && (
        <div className="req-state-note">This request was cancelled.</div>
      )}

      {err && <div className="msg err" style={{ marginTop: 10 }}>{err}</div>}

      {CANCELLABLE.includes(request.status) && (
        <button className="req-cancel" onClick={doCancel} disabled={busy === "cancel"}>
          {busy === "cancel" ? "Cancelling…" : "Cancel request"}
        </button>
      )}
    </div>
  );
}

export default function MyRequestsPage() {
  const [requests, setRequests] = useState<OrderRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;
    getSession().then((user) => {
      if (!alive) return;
      if (!user) {
        setLoggedIn(false);
        setLoading(false);
        return;
      }
      setLoggedIn(true);
      fetchMyRequests()
        .then((data) => alive && setRequests(data))
        .catch(() => {})
        .finally(() => alive && setLoading(false));
    });
    return () => {
      alive = false;
    };
  }, []);

  const update = (r: OrderRequest) =>
    setRequests((list) => list.map((x) => (x.id === r.id ? r : x)));

  if (!loggedIn && loggedIn !== null) {
    return (
      <main className="av orders-page">
        <Header />
        <section className="orders-shell">
          <div className="orders-empty" style={{ marginTop: 0, border: "1px solid var(--line)" }}>
            <User strokeWidth={1.5} />
            <h3>Sign in to view your requests</h3>
            <p>Your order requests and their status appear here once you’re logged in.</p>
            <Link href="/login">Log in</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="av orders-page">
      <Header />
      <section className="orders-shell">
        <header className="orders-hero">
          <p className="orders-kicker">My Account</p>
          <h1>My Requests</h1>
          <p>
            {requests.length === 0
              ? "No order requests yet."
              : `${requests.length} request${requests.length !== 1 ? "s" : ""} · approval & manual payment`}
          </p>
        </header>

        {loading ? (
          <div className="orders-list">
            <div className="req-card" style={{ opacity: 0.5 }}>Loading your requests…</div>
          </div>
        ) : requests.length === 0 ? (
          <div className="orders-list">
            <div className="orders-empty">
              <ClipboardList strokeWidth={1.5} />
              <h3>No requests yet</h3>
              <p>When you request an order on WhatsApp, it will appear here with its status.</p>
              <Link href="/">Start Shopping</Link>
            </div>
          </div>
        ) : (
          <div className="orders-list">
            {requests.map((r) => (
              <RequestCard key={r.id} request={r} onChange={update} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
