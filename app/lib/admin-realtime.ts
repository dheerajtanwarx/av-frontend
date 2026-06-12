"use client";

/* ============================================================
   Admin real-time client — SSE subscription to the backend's
   /api/admin/realtime/stream feed.
   ------------------------------------------------------------
   Reliability model: the stream is a delivery hint, the REST API
   is the source of truth. EventSource auto-reconnects transient
   drops and resends Last-Event-ID so the server replays missed
   notifications; when the browser gives up entirely (auth blip,
   proxy 5xx closes the stream) we recreate it with exponential
   backoff, passing ?lastEventId so the replay still happens.
   Duplicates (replay overlap) are filtered by notification id.
   ============================================================ */

import { useEffect, useRef, useState } from "react";
import { API_URL } from "./api";

export interface LiveNotification {
  id: number;
  type: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "INFO";
  title: string;
  body: string;
  orderId: number | null;
  orderNo: string | null;
  meta: unknown;
  createdAt: string;
  read: boolean;
  archived: boolean;
  /** true when delivered via reconnect replay rather than live */
  replayed?: boolean;
}

export type StateSyncEvent =
  | { event: "notification:read" | "notification:unread" | "notification:archived" | "notification:unarchived"; data: { id: number } }
  | { event: "notification:read_all"; data: { count: number; ids: number[] } }
  | { event: "notification:read_bulk" | "notification:archived_bulk" | "notification:unarchived_bulk"; data: { ids: number[] } };

const SYNC_EVENT_NAMES = [
  "notification:read",
  "notification:unread",
  "notification:archived",
  "notification:unarchived",
  "notification:read_all",
  "notification:read_bulk",
  "notification:archived_bulk",
  "notification:unarchived_bulk",
] as const;

export interface RealtimeHandlers {
  onNotification?: (n: LiveNotification) => void;
  onStateSync?: (e: StateSyncEvent) => void;
  onActivity?: (row: unknown) => void;
  onDashboard?: (d: { reason: string }) => void;
  onConnectionChange?: (connected: boolean) => void;
}

const INITIAL_RETRY_MS = 2_000;
const MAX_RETRY_MS = 30_000;

/** Subscribe to the admin event stream for the lifetime of the component.
    Returns the current connection state. Handlers are kept in a ref, so
    callers may pass fresh closures every render without resubscribing. */
export function useAdminRealtime(handlers: RealtimeHandlers): boolean {
  const h = useRef(handlers);
  h.current = handlers;
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let es: EventSource | null = null;
    let disposed = false;
    let retryMs = INITIAL_RETRY_MS;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    // Newest notification id seen — duplicate filter and the replay cursor
    // for manually recreated connections.
    let lastId = 0;

    const setConn = (v: boolean) => {
      setConnected(v);
      h.current.onConnectionChange?.(v);
    };

    const connect = () => {
      if (disposed) return;
      const qs = lastId > 0 ? `?lastEventId=${lastId}` : "";
      es = new EventSource(`${API_URL}/api/admin/realtime/stream${qs}`, {
        withCredentials: true,
      });

      es.onopen = () => {
        retryMs = INITIAL_RETRY_MS;
        setConn(true);
      };

      es.addEventListener("notification:new", (ev) => {
        const n = JSON.parse((ev as MessageEvent).data) as LiveNotification;
        if (n.id <= lastId) return; // already delivered on a previous connection
        lastId = n.id;
        h.current.onNotification?.(n);
      });

      for (const name of SYNC_EVENT_NAMES) {
        es.addEventListener(name, (ev) => {
          h.current.onStateSync?.({
            event: name,
            data: JSON.parse((ev as MessageEvent).data),
          } as StateSyncEvent);
        });
      }

      es.addEventListener("activity:new", (ev) => {
        h.current.onActivity?.(JSON.parse((ev as MessageEvent).data));
      });

      es.addEventListener("dashboard:update", (ev) => {
        h.current.onDashboard?.(JSON.parse((ev as MessageEvent).data));
      });

      es.onerror = () => {
        setConn(false);
        // CONNECTING means the browser is already retrying on its own (and
        // will resend Last-Event-ID). CLOSED means it gave up — recreate the
        // stream ourselves with capped exponential backoff.
        if (es && es.readyState === EventSource.CLOSED) {
          es.close();
          retryTimer = setTimeout(connect, retryMs);
          retryMs = Math.min(retryMs * 2, MAX_RETRY_MS);
        }
      };
    };

    connect();
    return () => {
      disposed = true;
      if (retryTimer) clearTimeout(retryTimer);
      es?.close();
    };
  }, []);

  return connected;
}
