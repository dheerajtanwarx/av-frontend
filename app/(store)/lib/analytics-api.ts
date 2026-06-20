/* ============================================================
   Admin analytics read-API client.
   ------------------------------------------------------------
   Typed fetchers for /api/admin/analytics/*. Cookie-authenticated
   (credentials: "include") like the rest of the admin API. Kept
   separate from the tracking SDK (lib/analytics.ts) on purpose.
   ============================================================ */

import { API_URL } from "./api";

export type RangeKey = "7" | "30" | "90" | "365";

async function get<T>(path: string, range: RangeKey, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${API_URL}/api/admin/analytics/${path}?range=${range}`, {
    credentials: "include",
    cache: "no-store",
    signal,
  });
  if (!res.ok) throw new Error(`analytics ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

/* ---- response shapes (mirror routes/analytics.ts) ---- */

export interface OverviewResponse {
  range: string;
  kpis: {
    revenue: { today: number; yesterday: number; range: number };
    orders: { today: number; yesterday: number; range: number };
    visitors: { today: number; yesterday: number; range: number };
    sessions: { range: number };
    aov: number;
    conversionRate: number;
  };
  trend: { day: string; revenue: number; orders: number; visitors: number; sessions: number }[];
}

export interface KV {
  label: string;
  sessions: number;
  visitors: number;
}
export interface TrafficResponse {
  range: string;
  totals: {
    sessions: number;
    visitors: number;
    pageviews: number;
    bounceRate: number;
    avgDurationSec: number;
    pagesPerSession: number;
  };
  byDevice: KV[];
  byBrowser: KV[];
  byOs: KV[];
  byCountry: KV[];
  topPages: { path: string; views: number }[];
  exitPages: { path: string; count: number }[];
}

export interface Slice {
  label: string;
  value: number;
}
export interface SessionCompositionResponse {
  range: string;
  totalSessions: number;
  newVsReturning: Slice[];
  guestVsLoggedIn: Slice[];
  byDevice: Slice[];
  byChannel: Slice[];
  entryPages: { path: string; count: number }[];
  exitPages: { path: string; count: number }[];
}

export interface AttributionChannel {
  channel: string;
  users: number;
  sessions: number;
  orders: number;
  revenue: number;
  conversionRate: number;
  aov: number;
  spend: number | null;
  roas: number | null;
}
export interface AttributionResponse {
  range: string;
  hasSpend: boolean;
  channels: AttributionChannel[];
  totals: {
    users: number;
    sessions: number;
    orders: number;
    revenue: number;
    spend: number;
    conversionRate: number;
    aov: number;
    roas: number | null;
  };
}

export interface AdSpendResponse {
  channels: string[];
  /** Date-bound budgets: { "YYYY-MM": { channel: amount } }. */
  months: Record<string, Record<string, number>>;
}

export interface SourcesResponse {
  range: string;
  sources: {
    source: string;
    visitors: number;
    productViews: number;
    addToCart: number;
    requests: number;
    revenue: number;
    conversionRate: number;
  }[];
}

export interface CampaignsResponse {
  range: string;
  campaigns: {
    campaign: string;
    source: string;
    sessions: number;
    visitors: number;
    orders: number;
    revenue: number;
    conversionRate: number;
  }[];
}

export interface ReferrersResponse {
  range: string;
  referrers: { referrer: string; sessions: number; visitors: number }[];
}

export interface CitiesResponse {
  range: string;
  cities: { city: string; country: string; sessions: number; visitors: number }[];
}

export type CustomerRow = {
  id: number;
  name: string;
  orders: number;
  ltv: number;
  lastOrder: string;
};
export interface CustomersResponse {
  range: string;
  kpis: {
    totalCustomers: number;
    repeatCustomers: number;
    repeatRate: number;
    avgLtv: number;
    newInRange: number;
    aov: number;
    avgOrders: number;
    vipCustomers: number;
    activeCustomers: number;
    recentlyActive: number;
    dormantCustomers: number;
  };
  segments: {
    lifecycle: { label: string; value: number }[];
    frequency: { label: string; value: number }[];
  };
  topCustomers: CustomerRow[];
  dormantCustomers: CustomerRow[];
  recentCustomers: CustomerRow[];
  monthly: { month: string; newCustomers: number; returningCustomers: number }[];
}

export interface PerformanceResponse {
  range: string;
  metrics: {
    metric: string;
    samples: number;
    avg: number;
    good: number;
    needsImprovement: number;
    poor: number;
    goodRate: number;
  }[];
}

export interface FunnelResponse {
  range: string;
  /** The denominator every stage is measured against (e.g. "sessions"). */
  denominator?: string;
  stages: { name: string; count: number; pctOfTop: number; pctOfPrev: number }[];
}

export interface ProductsResponse {
  range: string;
  products: {
    productId: number;
    name: string;
    views: number;
    addToCart: number;
    purchases: number;
    qtySold: number;
    revenue: number;
    conversionRate: number;
  }[];
}

export interface SearchResponse {
  range: string;
  kpis: {
    totalSearches: number;
    uniqueTerms: number;
    zeroResultRate: number;
    searchSessions: number;
    searchToPurchaseRate: number;
    abandonmentRate: number;
  };
  top: { term: string; searches: number }[];
  zeroResult: { term: string; searches: number }[];
  trending: { term: string; current: number; previous: number; delta: number; growth: number | null }[];
}

export interface ActiveUsersResponse {
  range: string;
  kpis: {
    dau: number;
    wau: number;
    mau: number;
    stickiness: number;
    avgSessionDuration: number;
    sessionsPerUser: number;
    bounceRate: number;
    returningUserRate: number;
  };
  trend: {
    day: string;
    activeUsers: number;
    newUsers: number;
    returningUsers: number;
    loggedIn: number;
    guest: number;
    sessions: number;
    cumulativeSessions: number;
  }[];
}

export type InsightSeverity = "critical" | "warning" | "positive" | "info";
export interface Insight {
  id: string;
  category: string;
  severity: InsightSeverity;
  title: string;
  detail: string;
  metric: { value: number; format: "money" | "number" | "percent" } | null;
  deltaPct: number | null;
}
export interface InsightsResponse {
  range: string;
  /** The preceding equal-length window each trend is measured against. */
  comparedTo: { startDay: string; endDay: string };
  insights: Insight[];
}

export type ExportFormat = "csv" | "xlsx" | "pdf";
export type ExportScope = "dashboard" | "section" | "widget";
export interface ExportManifest {
  sections: { id: string; title: string; widgets: { id: string; title: string }[] }[];
}

export interface LiveBreakdown {
  label: string;
  count: number;
}
/** Full live snapshot — served by /realtime (first paint) and pushed over SSE
    as "analytics:metrics" thereafter. */
export interface RealtimeResponse {
  at: string;
  activeUsers: number;
  loggedIn: number;
  guests: number;
  sessions: number;
  byCountry: LiveBreakdown[];
  byCity: LiveBreakdown[];
  bySource: LiveBreakdown[];
  byDevice: LiveBreakdown[];
  topPaths: { path: string; count: number }[];
  window: { addToCart: number; checkout: number };
  today: { orders: number; revenue: number };
}

/** Compact live-feed row pushed over SSE as "analytics:event". */
export interface LiveEvent {
  id: string;
  name: string;
  productName: string | null;
  source: string;
  country: string | null;
  city: string | null;
  device: string | null;
  loggedIn: boolean;
  value: number | null;
  at: string;
}

export const analyticsApi = {
  overview: (range: RangeKey, signal?: AbortSignal) =>
    get<OverviewResponse>("overview", range, signal),
  insights: (range: RangeKey, signal?: AbortSignal) =>
    get<InsightsResponse>("insights", range, signal),
  activeUsers: (range: RangeKey, signal?: AbortSignal) =>
    get<ActiveUsersResponse>("active-users", range, signal),
  exportManifest: (signal?: AbortSignal) => get<ExportManifest>("export/manifest", "30", signal),
  traffic: (range: RangeKey, signal?: AbortSignal) => get<TrafficResponse>("traffic", range, signal),
  sessionComposition: (range: RangeKey, signal?: AbortSignal) =>
    get<SessionCompositionResponse>("session-composition", range, signal),
  attribution: (range: RangeKey, signal?: AbortSignal) =>
    get<AttributionResponse>("attribution", range, signal),
  adSpend: (signal?: AbortSignal) => get<AdSpendResponse>("ad-spend", "30", signal),
  saveAdSpend: async (month: string, spend: Record<string, number>): Promise<AdSpendResponse> => {
    const res = await fetch(`${API_URL}/api/admin/analytics/ad-spend`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month, spend }),
    });
    if (!res.ok) throw new Error(`save ad-spend failed: ${res.status}`);
    return res.json() as Promise<AdSpendResponse>;
  },
  sources: (range: RangeKey, signal?: AbortSignal) => get<SourcesResponse>("sources", range, signal),
  campaigns: (range: RangeKey, signal?: AbortSignal) =>
    get<CampaignsResponse>("campaigns", range, signal),
  referrers: (range: RangeKey, signal?: AbortSignal) =>
    get<ReferrersResponse>("referrers", range, signal),
  cities: (range: RangeKey, signal?: AbortSignal) => get<CitiesResponse>("cities", range, signal),
  funnel: (range: RangeKey, signal?: AbortSignal) => get<FunnelResponse>("funnel", range, signal),
  products: (range: RangeKey, signal?: AbortSignal) =>
    get<ProductsResponse>("products", range, signal),
  search: (range: RangeKey, signal?: AbortSignal) => get<SearchResponse>("search", range, signal),
  customers: (range: RangeKey, signal?: AbortSignal) =>
    get<CustomersResponse>("customers", range, signal),
  performance: (range: RangeKey, signal?: AbortSignal) =>
    get<PerformanceResponse>("performance", range, signal),
  realtime: (signal?: AbortSignal) => get<RealtimeResponse>("realtime", "30", signal),
};

/** Build an export URL (opened directly so the browser downloads it, sending
    the admin cookie as a same-origin navigation). */
export function exportUrl(opts: {
  format: ExportFormat;
  scope: ExportScope;
  range: RangeKey;
  section?: string;
  widget?: string;
}): string {
  const p = new URLSearchParams({ format: opts.format, scope: opts.scope, range: opts.range });
  if (opts.section) p.set("section", opts.section);
  if (opts.widget) p.set("widget", opts.widget);
  return `${API_URL}/api/admin/analytics/export?${p.toString()}`;
}

/** Trigger a browser download for an export URL without navigating away. */
export function triggerDownload(url: string): void {
  const a = document.createElement("a");
  a.href = url;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}
