/* ============================================================
   AV Creation — first-party analytics SDK (client only).
   ------------------------------------------------------------
   • visitorId: persistent (localStorage), one per browser.
   • sessionId: 30-min sliding inactivity window.
   • attribution: utm_* + referrer captured at SESSION START
     (first-touch within the session) and sent with every batch;
     the server resolves the final source.
   • transport: events are queued and flushed via sendBeacon so a
     page can unload without losing or blocking on the request.

   No PII is collected client-side. The server adds device/geo from
   the request (UA + IP), never trusted from here.
   ============================================================ */

import { API_URL } from "./api";

const VID_KEY = "av_an_vid";
const SID_KEY = "av_an_sid";
const SEEN_KEY = "av_an_seen";
const ATTR_KEY = "av_an_attr";
const SESSION_IDLE_MS = 30 * 60_000;
const FLUSH_INTERVAL_MS = 5_000;
const MAX_QUEUE = 30;

type Props = Record<string, unknown>;
interface QueuedEvent {
  name: string;
  path?: string | null;
  productId?: number | null;
  categoryId?: number | null;
  props?: Props | null;
  ts: number;
}
interface Attr {
  source?: string | null;
  medium?: string | null;
  campaign?: string | null;
  content?: string | null;
  referrer?: string | null;
}

const isBrowser = typeof window !== "undefined";

function uuid(): string {
  if (isBrowser && "randomUUID" in crypto) return crypto.randomUUID();
  // RFC4122-ish fallback.
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

let queue: QueuedEvent[] = [];
let newVisitorPending = false;
let newSessionPending = false;
let timer: ReturnType<typeof setInterval> | null = null;

function getVisitorId(): string {
  let id = localStorage.getItem(VID_KEY);
  if (!id) {
    id = uuid();
    localStorage.setItem(VID_KEY, id);
    newVisitorPending = true;
  }
  return id;
}

/** Return the live session id, rotating it if the idle window elapsed. */
function getSessionId(): string {
  const now = Date.now();
  const lastSeen = Number(localStorage.getItem(SEEN_KEY) || 0);
  let sid = localStorage.getItem(SID_KEY);
  if (!sid || now - lastSeen > SESSION_IDLE_MS) {
    sid = uuid();
    localStorage.setItem(SID_KEY, sid);
    newSessionPending = true;
    captureAttribution(); // first-touch of the new session
  }
  localStorage.setItem(SEEN_KEY, String(now));
  return sid;
}

/** Read utm_* + referrer once per session and stash for every batch. */
function captureAttribution(): void {
  const params = new URLSearchParams(window.location.search);
  const attr: Attr = {
    source: params.get("utm_source"),
    medium: params.get("utm_medium"),
    campaign: params.get("utm_campaign"),
    content: params.get("utm_content"),
    referrer: document.referrer || null,
  };
  sessionStorage.setItem(ATTR_KEY, JSON.stringify(attr));
}

function currentAttribution(): Attr {
  try {
    return JSON.parse(sessionStorage.getItem(ATTR_KEY) || "{}") as Attr;
  } catch {
    return {};
  }
}

function flush(): void {
  if (!isBrowser || queue.length === 0) return;
  const attr = currentAttribution();
  // Identity is resolved server-side from the auth cookie (sent via credentials
  // below), never from this payload — so events can't be forged onto a user.
  const payload = {
    visitorId: getVisitorId(),
    sessionId: getSessionId(),
    isNewVisitor: newVisitorPending,
    isNewSession: newSessionPending,
    utm: {
      source: attr.source,
      medium: attr.medium,
      campaign: attr.campaign,
      content: attr.content,
    },
    referrer: attr.referrer ?? null,
    events: queue,
  };
  queue = [];
  newVisitorPending = false;
  newSessionPending = false;

  const url = `${API_URL}/api/track`;
  const body = JSON.stringify(payload);
  try {
    const blob = new Blob([body], { type: "application/json" });
    if (navigator.sendBeacon && navigator.sendBeacon(url, blob)) return;
  } catch {
    /* fall through to fetch */
  }
  // Fallback: keepalive fetch survives page unload in modern browsers.
  // credentials:"include" sends the auth cookie cross-site so the server can
  // attribute the batch to the signed-in user (sendBeacon includes it already).
  fetch(url, {
    method: "POST",
    body,
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    credentials: "include",
  }).catch(() => {});
}

function ensureTimer(): void {
  if (timer || !isBrowser) return;
  timer = setInterval(flush, FLUSH_INTERVAL_MS);
  // Flush on tab hide / unload so nothing is lost.
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush();
  });
  window.addEventListener("pagehide", flush);
}

/* ----------------------------- public API ----------------------------- */

export function track(
  name: string,
  props?: Props,
  ctx?: { path?: string | null; productId?: number | null; categoryId?: number | null }
): void {
  if (!isBrowser) return;
  ensureTimer();
  // Touch session/visitor so ids stay warm even for non-pageview events.
  getVisitorId();
  getSessionId();
  queue.push({
    name,
    path: ctx?.path ?? window.location.pathname,
    productId: ctx?.productId ?? null,
    categoryId: ctx?.categoryId ?? null,
    props: props ?? null,
    ts: Date.now(),
  });
  if (queue.length >= MAX_QUEUE) flush();
}

export function trackPageView(path: string): void {
  track("page_view", undefined, { path });
}

/* Identity is resolved server-side from the auth cookie on every batch (see
   the collector + ingest), so there is no client-side identify()/resetIdentity()
   to call: the first event after sign-in is already attributed to the user, and
   logout clears the cookie so subsequent events fall back to anonymous. */
