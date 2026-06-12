"use client";

/* Stripe/Shopify-style notification inbox, anchored under the topbar bell.
   Owns its own data (paged REST fetches + infinite scroll); the bell feeds it
   live stream events via props so open panels update in place. The REST API
   stays the source of truth — stream events only patch what's on screen. */

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  fetchAdminNotifications,
  markNotificationRead,
  archiveNotification,
  readAllNotifications,
  type AdminNotification,
  type NotificationPriority,
} from "../../lib/api";
import type { LiveNotification, StateSyncEvent } from "../../lib/admin-realtime";

const PAGE_SIZE = 15;

const PRIORITY_LABEL: Record<NotificationPriority, string> = {
  CRITICAL: "Critical",
  HIGH: "High",
  MEDIUM: "Medium",
  INFO: "Info",
};

/** "just now", "4m ago", "3h ago", "2d ago", then a short date. */
export function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const s = Math.floor(ms / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(
    new Date(iso)
  );
}

export default function NotificationDropdown({
  open,
  onClose,
  liveNotification,
  liveSync,
}: {
  open: boolean;
  onClose: () => void;
  /** Latest notification:new from the stream (bell forwards it). */
  liveNotification: LiveNotification | null;
  /** Latest state-sync event from the stream (other sessions acting). */
  liveSync: StateSyncEvent | null;
}) {
  const [items, setItems] = useState<AdminNotification[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadedOnce = useRef(false);
  const listRef = useRef<HTMLDivElement>(null);

  // First open (and every reopen) refreshes page 1.
  useEffect(() => {
    if (!open) return;
    let stale = false;
    setLoading(!loadedOnce.current);
    (async () => {
      try {
        const r = await fetchAdminNotifications({ page: 1, pageSize: PAGE_SIZE });
        if (stale) return;
        setItems(r.notifications);
        setPage(1);
        setTotalPages(r.totalPages);
        loadedOnce.current = true;
      } catch {
        /* leave whatever is shown */
      } finally {
        if (!stale) setLoading(false);
      }
    })();
    return () => {
      stale = true;
    };
  }, [open]);

  // Live prepend — the stream payload matches the REST row shape.
  useEffect(() => {
    if (!liveNotification) return;
    const n = liveNotification;
    setItems((prev) =>
      prev.some((x) => x.id === n.id)
        ? prev
        : [
            {
              id: n.id,
              type: n.type,
              priority: n.priority,
              title: n.title,
              body: n.body,
              orderId: n.orderId,
              orderNo: n.orderNo,
              meta: n.meta,
              createdAt: n.createdAt,
              read: n.read,
              readAt: null,
              archived: false,
              archivedAt: null,
            },
            ...prev,
          ]
    );
  }, [liveNotification]);

  // Another session of this admin acted — mirror it on screen.
  useEffect(() => {
    if (!liveSync) return;
    const e = liveSync;
    setItems((prev) => {
      switch (e.event) {
        case "notification:read":
          return prev.map((x) => (x.id === e.data.id ? { ...x, read: true } : x));
        case "notification:unread":
          return prev.map((x) => (x.id === e.data.id ? { ...x, read: false } : x));
        case "notification:archived":
          return prev.filter((x) => x.id !== e.data.id);
        case "notification:unarchived":
          return prev; // reopening the panel refetches; rare path
        case "notification:read_all":
          return prev.map((x) => ({ ...x, read: true }));
        case "notification:read_bulk":
          return prev.map((x) =>
            e.data.ids.includes(x.id) ? { ...x, read: true } : x
          );
        case "notification:archived_bulk":
          return prev.filter((x) => !e.data.ids.includes(x.id));
        case "notification:unarchived_bulk":
          return prev; // reopening the panel refetches; rare path
        default:
          return prev;
      }
    });
  }, [liveSync]);

  const loadMore = useCallback(async () => {
    if (loadingMore || page >= totalPages) return;
    setLoadingMore(true);
    try {
      const next = page + 1;
      const r = await fetchAdminNotifications({ page: next, pageSize: PAGE_SIZE });
      setItems((prev) => {
        const seen = new Set(prev.map((x) => x.id));
        return [...prev, ...r.notifications.filter((x) => !seen.has(x.id))];
      });
      setPage(next);
      setTotalPages(r.totalPages);
    } catch {
      /* scroll again to retry */
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, page, totalPages]);

  const onScroll = () => {
    const el = listRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 80) loadMore();
  };

  const handleRowClick = (n: AdminNotification) => {
    if (!n.read) {
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      markNotificationRead(n.id).catch(() => {
        setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: false } : x)));
      });
    }
    if (n.orderId) window.location.href = `/admin/orders/${n.orderId}`;
  };

  const handleArchive = (n: AdminNotification) => {
    setItems((prev) => prev.filter((x) => x.id !== n.id));
    archiveNotification(n.id).catch(() => {
      setItems((prev) => (prev.some((x) => x.id === n.id) ? prev : [n, ...prev]));
    });
  };

  const handleReadAll = () => {
    setItems((prev) => prev.map((x) => ({ ...x, read: true })));
    readAllNotifications().catch(() => {
      /* badge refetch reconciles on the next sync event */
    });
  };

  const hasUnread = items.some((x) => !x.read);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="admin-notif-panel"
          role="dialog"
          aria-label="Notifications"
          initial={{ opacity: 0, y: -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.98 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="admin-notif-head">
            <span className="admin-notif-title">Notifications</span>
            <div className="admin-notif-head-actions">
              {hasUnread && (
                <button type="button" onClick={handleReadAll}>
                  Mark all read
                </button>
              )}
              <button type="button" onClick={onClose} aria-label="Close">
                ×
              </button>
            </div>
          </div>

          <div className="admin-notif-list" ref={listRef} onScroll={onScroll}>
            {loading ? (
              <div className="admin-notif-skeletons" aria-hidden>
                {[0, 1, 2].map((i) => (
                  <div key={i} className="admin-notif-skeleton">
                    <span className="admin-notif-skeleton-dot" />
                    <span className="admin-notif-skeleton-lines">
                      <span />
                      <span />
                    </span>
                  </div>
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="admin-notif-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.7 21a2 2 0 0 1-3.4 0" />
                </svg>
                <strong>You’re all caught up</strong>
                <span>New order activity will show up here.</span>
              </div>
            ) : (
              <>
                <AnimatePresence initial={false}>
                  {items.map((n) => (
                    <motion.div
                      key={n.id}
                      layout
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 24 }}
                      transition={{ duration: 0.2 }}
                      className={`admin-notif-row${n.read ? "" : " unread"}`}
                      onClick={() => handleRowClick(n)}
                    >
                      <span
                        className={`admin-notif-dot prio-${n.priority.toLowerCase()}`}
                        title={PRIORITY_LABEL[n.priority]}
                      />
                      <div className="admin-notif-row-main">
                        <span className="admin-notif-row-title">{n.title}</span>
                        <span className="admin-notif-row-body">{n.body}</span>
                        <span className="admin-notif-row-time">
                          {relativeTime(n.createdAt)}
                          {!n.read && <i className="admin-notif-unread-pip" aria-label="Unread" />}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="admin-notif-archive"
                        title="Archive"
                        aria-label="Archive notification"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleArchive(n);
                        }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <rect x="3" y="4" width="18" height="5" rx="1" />
                          <path d="M5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9M10 13h4" />
                        </svg>
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {loadingMore && <div className="admin-notif-more">Loading…</div>}
                {page >= totalPages && items.length > PAGE_SIZE && (
                  <div className="admin-notif-more">That’s everything</div>
                )}
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
