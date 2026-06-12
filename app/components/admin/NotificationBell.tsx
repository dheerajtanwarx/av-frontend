"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  API_URL,
  ApiError,
  adminAddOrderNote,
  adminProcessRefund,
  downloadFile,
  markNotificationRead,
  updateAdminOrderStatus,
} from "../../lib/api";
import {
  useAdminRealtime,
  LiveNotification,
  StateSyncEvent,
} from "../../lib/admin-realtime";
import { BellIcon } from "./icons";
import NotificationDropdown from "./NotificationDropdown";

/* Topbar bell: live unread badge + toast pop-ups, driven by the SSE feed.
   The badge count always comes from the unread-count endpoint (source of
   truth); stream events just tell us *when* to refetch, so multiple admin
   sessions converge no matter which one acted.

   Two action-toast flavours:
   - New orders: animated toast with View / Process / Print Invoice / Contact
     quick actions; auto-dismisses (orders are frequent) but slower than an
     informational toast.
   - Cancellations: sticky red toast with View / Refund / Contact / Note /
     Mark-reviewed; stays until dismissed. */

interface NotifMeta {
  orderNo?: string;
  customerName?: string;
  customerEmail?: string | null;
  total?: number;
  reason?: string | null;
  itemCount?: number;
  payment?: { method?: string; status?: string };
}

type ToastKind = "order" | "cancel" | "plain";

interface Toast {
  key: number;
  kind: ToastKind;
  notificationId: number;
  title: string;
  body: string;
  priority: LiveNotification["priority"];
  orderId: number | null;
  orderNo: string | null;
  customerEmail: string | null;
  actionMsg: string | null;
}

const PLAIN_TTL_MS = 6_000;
const ORDER_TTL_MS = 12_000;
const MAX_TOASTS = 4;

function inr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function buildToast(n: LiveNotification, key: number): Toast {
  const meta = (n.meta ?? {}) as NotifMeta;
  const orderNo = n.orderNo ?? (n.orderId != null ? `#${n.orderId}` : null);

  if (n.type === "NEW_ORDER") {
    const paid = meta.payment?.status === "SUCCESS" ? "paid" : "pending (COD)";
    return {
      key,
      kind: "order",
      notificationId: n.id,
      title: `New Order Received – Order ${orderNo}`,
      body: [
        meta.customerName,
        meta.total != null ? inr(meta.total) : null,
        meta.itemCount != null
          ? `${meta.itemCount} item${meta.itemCount === 1 ? "" : "s"}`
          : null,
        meta.payment?.method ? `${meta.payment.method} (${paid})` : null,
      ]
        .filter(Boolean)
        .join(" · "),
      priority: n.priority,
      orderId: n.orderId,
      orderNo,
      customerEmail: meta.customerEmail ?? null,
      actionMsg: null,
    };
  }

  if (n.type === "ORDER_CANCELLED") {
    return {
      key,
      kind: "cancel",
      notificationId: n.id,
      title: `Order ${orderNo} has been canceled.`,
      body: [
        meta.customerName,
        meta.total != null ? inr(meta.total) : null,
        meta.reason ? `“${meta.reason}”` : null,
      ]
        .filter(Boolean)
        .join(" · "),
      priority: n.priority,
      orderId: n.orderId,
      orderNo,
      customerEmail: meta.customerEmail ?? null,
      actionMsg: null,
    };
  }

  return {
    key,
    kind: "plain",
    notificationId: n.id,
    title: n.title,
    body: n.body,
    priority: n.priority,
    orderId: n.orderId,
    orderNo,
    customerEmail: null,
    actionMsg: null,
  };
}

export default function NotificationBell() {
  const [unread, setUnread] = useState<number | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastKey = useRef(0);

  // Dropdown panel + live events forwarded to it.
  const [open, setOpen] = useState(false);
  const [liveNotification, setLiveNotification] = useState<LiveNotification | null>(null);
  const [liveSync, setLiveSync] = useState<StateSyncEvent | null>(null);
  // Incremented on each live arrival — re-keys the bell wiggle + ping ring.
  const [pulseKey, setPulseKey] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Collapse refetch bursts (e.g. read-all → many sync events) into one call.
  const refetchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const refetchUnread = useCallback(() => {
    if (refetchTimer.current) clearTimeout(refetchTimer.current);
    refetchTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API_URL}/api/admin/notifications/unread-count`, {
          credentials: "include",
          cache: "no-store",
        });
        if (res.ok) setUnread((await res.json()).unread);
      } catch {
        /* stream will trigger another refetch; stale badge is acceptable */
      }
    }, 300);
  }, []);

  useEffect(() => {
    refetchUnread();
    return () => {
      if (refetchTimer.current) clearTimeout(refetchTimer.current);
    };
  }, [refetchUnread]);

  const dismiss = useCallback((key: number) => {
    setToasts((prev) => prev.filter((x) => x.key !== key));
  }, []);

  const setActionMsg = useCallback((key: number, msg: string) => {
    setToasts((prev) =>
      prev.map((x) => (x.key === key ? { ...x, actionMsg: msg } : x))
    );
  }, []);

  const pushToast = useCallback(
    (n: LiveNotification) => {
      const t = buildToast(n, ++toastKey.current);
      setToasts((prev) => [t, ...prev].slice(0, MAX_TOASTS));
      // Cancellations are sticky; everything else auto-dismisses.
      if (t.kind !== "cancel") {
        setTimeout(
          () => dismiss(t.key),
          t.kind === "order" ? ORDER_TTL_MS : PLAIN_TTL_MS
        );
      }
    },
    [dismiss]
  );

  const connected = useAdminRealtime({
    onNotification: (n) => {
      // Replayed events fill a reconnect gap — count them, don't toast them.
      // The hook's monotonic id guard already filters duplicates.
      if (!n.replayed) {
        pushToast(n);
        setPulseKey((k) => k + 1);
      }
      setLiveNotification(n);
      refetchUnread();
    },
    onStateSync: (e) => {
      setLiveSync(e);
      refetchUnread();
    },
    onConnectionChange: (up) => {
      // After any outage, resync the badge in case events were missed.
      if (up) refetchUnread();
    },
  });

  const handleProcess = async (t: Toast) => {
    if (!t.orderId) return;
    try {
      await updateAdminOrderStatus(t.orderId, "PROCESSING");
      setActionMsg(t.key, "Order moved to processing.");
    } catch (e) {
      setActionMsg(
        t.key,
        e instanceof ApiError ? e.message : "Couldn't update the order."
      );
    }
  };

  const handleInvoice = async (t: Toast) => {
    if (!t.orderId) return;
    try {
      await downloadFile(
        `/api/orders/admin/${t.orderId}/invoice`,
        `Invoice-${t.orderNo ?? t.orderId}.pdf`
      );
      setActionMsg(t.key, "Invoice downloaded.");
    } catch {
      setActionMsg(t.key, "Couldn't download the invoice.");
    }
  };

  const handleRefund = async (t: Toast) => {
    if (!t.orderId) return;
    try {
      const r = await adminProcessRefund(t.orderId);
      setActionMsg(t.key, r.message);
    } catch {
      setActionMsg(t.key, "Refund failed — try again from the order page.");
    }
  };

  const handleNote = async (t: Toast) => {
    if (!t.orderId) return;
    const note = window.prompt("Internal note for this order:");
    if (!note?.trim()) return;
    try {
      await adminAddOrderNote(t.orderId, note.trim());
      setActionMsg(t.key, "Note added.");
    } catch {
      setActionMsg(t.key, "Couldn't add the note.");
    }
  };

  const handleReviewed = async (t: Toast) => {
    try {
      await markNotificationRead(t.notificationId);
    } catch {
      /* badge refetch will reconcile */
    }
    dismiss(t.key);
  };

  return (
    <>
      <div className="admin-bell-wrap" ref={wrapRef}>
        <button
          type="button"
          className="admin-bell"
          aria-label={
            unread ? `Notifications — ${unread} unread` : "Notifications"
          }
          aria-expanded={open}
          title={connected ? "Live" : "Reconnecting…"}
          onClick={() => setOpen((v) => !v)}
        >
          {/* Re-keyed on each live arrival → bell wiggle + radiating ring. */}
          <motion.span
            key={pulseKey}
            className="admin-bell-icon"
            initial={false}
            animate={pulseKey > 0 ? { rotate: [0, -14, 11, -7, 4, 0] } : undefined}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            <BellIcon />
          </motion.span>
          {pulseKey > 0 && (
            <span key={`ping-${pulseKey}`} className="admin-bell-ping" aria-hidden />
          )}
          {unread != null && unread > 0 && (
            <motion.span
              key={unread}
              className="admin-bell-badge"
              initial={{ scale: 1.45 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 480, damping: 18 }}
            >
              {unread > 99 ? "99+" : unread}
            </motion.span>
          )}
          <span
            className={`admin-bell-dot ${connected ? "is-live" : "is-down"}`}
            aria-hidden="true"
          />
        </button>

        <NotificationDropdown
          open={open}
          onClose={() => setOpen(false)}
          liveNotification={liveNotification}
          liveSync={liveSync}
        />
      </div>

      {toasts.length > 0 && (
        <div className="admin-toasts" role="status" aria-live="polite">
          {toasts.map((t) => (
            <div
              key={t.key}
              className={`admin-toast prio-${
                t.kind === "cancel" ? "critical" : t.priority.toLowerCase()
              }`}
            >
              <button
                type="button"
                className="admin-toast-close"
                aria-label="Dismiss"
                onClick={() => dismiss(t.key)}
              >
                ×
              </button>
              <strong className="admin-toast-title">{t.title}</strong>
              {t.body && <span className="admin-toast-body">{t.body}</span>}

              {t.kind === "order" && t.orderId && (
                <div className="admin-toast-actions">
                  <a href={`/admin/orders/${t.orderId}`}>View Order</a>
                  <button type="button" onClick={() => handleProcess(t)}>
                    Process Order
                  </button>
                  <button type="button" onClick={() => handleInvoice(t)}>
                    Print Invoice
                  </button>
                  {t.customerEmail && (
                    <a href={`mailto:${t.customerEmail}`}>Contact Customer</a>
                  )}
                </div>
              )}

              {t.kind === "cancel" && t.orderId && (
                <div className="admin-toast-actions">
                  <a href={`/admin/orders/${t.orderId}`}>View Details</a>
                  <button type="button" onClick={() => handleRefund(t)}>
                    Process Refund
                  </button>
                  {t.customerEmail && (
                    <a href={`mailto:${t.customerEmail}`}>Contact Customer</a>
                  )}
                  <button type="button" onClick={() => handleNote(t)}>
                    Add Note
                  </button>
                  <button type="button" onClick={() => handleReviewed(t)}>
                    Mark as Reviewed
                  </button>
                </div>
              )}

              {t.actionMsg && (
                <span className="admin-toast-feedback">{t.actionMsg}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
