"use client";

/* Stripe/Shopify-style notification inbox, anchored under the topbar bell.
   Owns its own data (paged REST fetches + infinite scroll); the bell feeds it
   live stream events via props so open panels update in place. The REST API
   stays the source of truth — stream events only patch what's on screen. */

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bell, Archive } from "lucide-react";
import {
  fetchAdminNotifications,
  fetchAdminNotificationsAfter,
  markNotificationRead,
  archiveNotification,
  readAllNotifications,
  type AdminNotification,
  type NotificationPriority,
} from "../../lib/api";
import type { LiveNotification, StateSyncEvent } from "../../lib/admin-realtime";

const PAGE_SIZE = 15;

/** Cap on rows a stream of live prepends can accumulate — a tab left open
    through a busy day must not grow the panel's DOM without bound. Trimmed
    rows are still one scroll-fetch away (and in the full-page center). */
const MAX_ITEMS = 200;

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
  // Items + hasMore change together (a prepend that trims the tail must also
  // re-enable loading more), so they live in one state object.
  const [list, setList] = useState<{ items: AdminNotification[]; hasMore: boolean }>({
    items: [],
    hasMore: false,
  });
  const items = list.items;
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadedOnce = useRef(false);
  const listRef = useRef<HTMLDivElement>(null);

  const setItems = (fn: (prev: AdminNotification[]) => AdminNotification[]) =>
    setList((prev) => ({ ...prev, items: fn(prev.items) }));

  // First open (and every reopen) refreshes page 1.
  useEffect(() => {
    if (!open) return;
    let stale = false;
    setLoading(!loadedOnce.current);
    (async () => {
      try {
        const r = await fetchAdminNotifications({ page: 1, pageSize: PAGE_SIZE });
        if (stale) return;
        setList({ items: r.notifications, hasMore: r.totalPages > 1 });
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
    setList((prev) => {
      if (prev.items.some((x) => x.id === n.id)) return prev;
      const next = [
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
        ...prev.items,
      ];
      return next.length > MAX_ITEMS
        ? { items: next.slice(0, MAX_ITEMS), hasMore: true }
        : { ...prev, items: next };
    });
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

  // Keyset pagination: fetch rows older than the oldest on screen. Stable
  // under live prepends (no page offsets to shift) and cheap at any depth.
  const loadMore = useCallback(async () => {
    if (loadingMore || !list.hasMore || list.items.length === 0) return;
    setLoadingMore(true);
    try {
      const cursor = Math.min(...list.items.map((x) => x.id));
      const r = await fetchAdminNotificationsAfter({ cursor, pageSize: PAGE_SIZE });
      setList((prev) => {
        const seen = new Set(prev.items.map((x) => x.id));
        return {
          items: [...prev.items, ...r.notifications.filter((x) => !seen.has(x.id))],
          hasMore: r.nextCursor != null,
        };
      });
    } catch {
      /* scroll again to retry */
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, list]);

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
                <Bell strokeWidth={1.4} aria-hidden />
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
                        <Archive size={18} strokeWidth={1.8} aria-hidden />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {loadingMore && <div className="admin-notif-more">Loading…</div>}
                {!list.hasMore && items.length > PAGE_SIZE && (
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
