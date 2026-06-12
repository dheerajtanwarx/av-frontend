"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  fetchAdminNotifications,
  bulkReadNotifications,
  bulkArchiveNotifications,
  bulkUnarchiveNotifications,
  markNotificationRead,
  markNotificationUnread,
  archiveNotification,
  unarchiveNotification,
  ApiError,
  type AdminNotification,
  type AdminNotificationsResponse,
  type NotificationSort,
} from "../../lib/api";
import { useAdminRealtime } from "../../lib/admin-realtime";
import { relativeTime } from "../../components/admin/NotificationDropdown";

/* Notification Center — full history with search, filters, sorting and bulk
   actions. Server-side everything (the bell dropdown is the lightweight
   sibling; this page is built for volume): the API pages at 20 rows and all
   filtering happens in SQL against the recipient/notification indexes. */

const VIEWS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "archived", label: "Archived" },
] as const;
type ViewKey = (typeof VIEWS)[number]["key"];

const TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All types" },
  { value: "NEW_ORDER", label: "New Orders" },
  { value: "ORDER_CANCELLED", label: "Order Cancellations" },
  { value: "PAYMENT_SUCCESS", label: "Payment Success" },
  { value: "REFUND_REQUESTED", label: "Refund Requests" },
  { value: "REFUND_COMPLETED", label: "Refund Completed" },
  { value: "ORDER_STATUS_CHANGE", label: "Order Status Changes" },
  { value: "DELIVERY_UPDATE", label: "Delivery Updates" },
  { value: "SYSTEM_ALERT", label: "System Alerts" },
];

const TYPE_LABEL: Record<string, string> = Object.fromEntries(
  TYPE_OPTIONS.filter((t) => t.value).map((t) => [t.value, t.label])
);

const SORT_OPTIONS: { value: NotificationSort; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "priority", label: "By priority" },
  { value: "unread", label: "Unread first" },
];

const PAGE_SIZE = 20;

export default function AdminNotificationsPage() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<ViewKey>("all");
  const [type, setType] = useState("");
  const [sort, setSort] = useState<NotificationSort>("newest");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<AdminNotificationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState(false);

  // Debounce the search box (also matches order ids and customer names —
  // both live in the notification title/body text).
  useEffect(() => {
    const t = setTimeout(() => setQuery(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Any filter change resets to page 1 and drops the selection.
  useEffect(() => {
    setPage(1);
    setSelected(new Set());
  }, [query, view, type, sort]);

  const load = useCallback(
    async (silent = false) => {
      if (!silent) {
        setLoading(true);
        setError("");
      }
      try {
        setData(
          await fetchAdminNotifications({
            page,
            pageSize: PAGE_SIZE,
            q: query || undefined,
            type: type || undefined,
            unread: view === "unread",
            archived: view === "archived",
            sort,
          })
        );
      } catch (e) {
        if (!silent) {
          setError(e instanceof ApiError ? e.message : "Failed to load notifications.");
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [page, query, type, view, sort]
  );

  useEffect(() => {
    load();
  }, [load]);

  // Live: new notifications and state changes from any session re-sync the
  // visible page without a loading flash. Debounced — a reconnect can replay
  // up to a hundred missed events in one burst, which must cost one refetch,
  // not one per event.
  const liveReload = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const scheduleLiveReload = useCallback(() => {
    if (liveReload.current) clearTimeout(liveReload.current);
    liveReload.current = setTimeout(() => load(true), 400);
  }, [load]);
  useEffect(() => {
    return () => {
      if (liveReload.current) clearTimeout(liveReload.current);
    };
  }, []);
  useAdminRealtime({
    onNotification: scheduleLiveReload,
    onStateSync: scheduleLiveReload,
  });

  const rows = useMemo(() => data?.notifications ?? [], [data]);
  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(rows.map((r) => r.id)));
  };
  const toggleOne = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const runBulk = async (fn: (ids: number[]) => Promise<unknown>) => {
    if (selected.size === 0 || busy) return;
    setBusy(true);
    try {
      await fn([...selected]);
      setSelected(new Set());
      await load(true);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Bulk action failed.");
    } finally {
      setBusy(false);
    }
  };

  const toggleRead = async (n: AdminNotification) => {
    try {
      if (n.read) await markNotificationUnread(n.id);
      else await markNotificationRead(n.id);
      await load(true);
    } catch {
      /* next sync event reconciles */
    }
  };

  const toggleArchive = async (n: AdminNotification) => {
    try {
      if (n.archived) await unarchiveNotification(n.id);
      else await archiveNotification(n.id);
      await load(true);
    } catch {
      /* next sync event reconciles */
    }
  };

  return (
    <section className="admin-page admin-notifpage">
      <header className="admin-page-head">
        <h2>Notification Center</h2>
        <p>
          Full history of order and system notifications. Search by order ID,
          customer name or content; filter, sort and act in bulk.
        </p>
      </header>

      <div className="admin-orders-toolbar">
        <div className="admin-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            type="search"
            placeholder="Search by order ID, customer name or content…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="admin-input admin-notifpage-select"
          value={type}
          onChange={(e) => setType(e.target.value)}
          aria-label="Filter by type"
        >
          {TYPE_OPTIONS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <select
          className="admin-input admin-notifpage-select"
          value={sort}
          onChange={(e) => setSort(e.target.value as NotificationSort)}
          aria-label="Sort"
        >
          {SORT_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="admin-tabs admin-orders-filters">
        {VIEWS.map((v) => (
          <button
            key={v.key}
            className={`admin-tab${view === v.key ? " active" : ""}`}
            onClick={() => setView(v.key)}
          >
            {v.label}
            {v.key === "unread" && data != null && data.unread > 0 && (
              <span className="admin-tab-count">{data.unread}</span>
            )}
          </button>
        ))}
      </div>

      {selected.size > 0 && (
        <div className="admin-notifpage-bulkbar">
          <span>{selected.size} selected</span>
          <button
            type="button"
            disabled={busy}
            onClick={() => runBulk(bulkReadNotifications)}
          >
            Mark read
          </button>
          {view === "archived" ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => runBulk(bulkUnarchiveNotifications)}
            >
              Restore
            </button>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={() => runBulk(bulkArchiveNotifications)}
            >
              Archive
            </button>
          )}
          <button type="button" disabled={busy} onClick={() => setSelected(new Set())}>
            Clear
          </button>
        </div>
      )}

      {error && <p className="admin-error">{error}</p>}

      <div className="admin-table-wrap">
        <table className="admin-table admin-notifpage-table">
          <thead>
            <tr>
              <th className="admin-notifpage-check">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  aria-label="Select all on page"
                />
              </th>
              <th>Type</th>
              <th>Notification</th>
              <th>When</th>
              <th>Status</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="admin-notifpage-state">
                  Loading notifications…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="admin-notifpage-state">
                  {query || type
                    ? "No notifications match the current filters."
                    : view === "archived"
                      ? "Nothing archived yet."
                      : "You're all caught up."}
                </td>
              </tr>
            ) : (
              rows.map((n) => (
                <tr key={n.id} className={n.read ? "" : "admin-notifpage-unread"}>
                  <td className="admin-notifpage-check">
                    <input
                      type="checkbox"
                      checked={selected.has(n.id)}
                      onChange={() => toggleOne(n.id)}
                      aria-label={`Select notification ${n.id}`}
                    />
                  </td>
                  <td>
                    <span className="admin-notifpage-type">
                      <span
                        className={`admin-notif-dot prio-${n.priority.toLowerCase()}`}
                        title={n.priority}
                      />
                      {TYPE_LABEL[n.type] ?? n.type}
                    </span>
                  </td>
                  <td className="admin-notifpage-main">
                    {n.orderId ? (
                      <a href={`/admin/orders/${n.orderId}`} className="admin-notifpage-title">
                        {n.title}
                      </a>
                    ) : (
                      <span className="admin-notifpage-title">{n.title}</span>
                    )}
                    <span className="admin-notifpage-body">{n.body}</span>
                  </td>
                  <td className="admin-notifpage-time" title={new Date(n.createdAt).toLocaleString("en-IN")}>
                    {relativeTime(n.createdAt)}
                  </td>
                  <td>
                    <span className={`admin-notifpage-status${n.read ? " read" : ""}`}>
                      {n.read ? "Read" : "Unread"}
                    </span>
                  </td>
                  <td className="admin-notifpage-actions">
                    <button type="button" onClick={() => toggleRead(n)}>
                      {n.read ? "Mark unread" : "Mark read"}
                    </button>
                    <button type="button" onClick={() => toggleArchive(n)}>
                      {n.archived ? "Restore" : "Archive"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="admin-pagination">
          <button
            className="admin-btn"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Prev
          </button>
          <span className="admin-pagination-info">
            Page {data.page} of {data.totalPages} · {data.total} notifications
          </span>
          <button
            className="admin-btn"
            disabled={page >= data.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </section>
  );
}
