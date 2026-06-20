"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Download,
  Wallet,
  Moon,
  Sun,
  Eye,
  ShoppingCart,
  Heart,
  CreditCard,
  CheckCircle2,
  ClipboardList,
  Search as SearchIcon,
  Share2,
  LogIn,
  UserPlus,
  Circle,
  Sparkles,
  TrendingUp,
  Target,
  Users,
  Package,
  RotateCcw,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Info,
  Lightbulb,
  FileText,
  FileSpreadsheet,
  FileType,
  ChevronDown,
  Check,
  LayoutGrid,
  type LucideIcon,
} from "lucide-react";
import { useAdminRealtime } from "../../lib/admin-realtime";
import {
  analyticsApi,
  exportUrl,
  triggerDownload,
  type ExportManifest,
  type ExportFormat,
  type RangeKey,
  type OverviewResponse,
  type TrafficResponse,
  type SessionCompositionResponse,
  type AttributionResponse,
  type AdSpendResponse,
  type SourcesResponse,
  type CampaignsResponse,
  type ReferrersResponse,
  type CitiesResponse,
  type FunnelResponse,
  type ProductsResponse,
  type SearchResponse,
  type CustomersResponse,
  type CustomerRow,
  type PerformanceResponse,
  type RealtimeResponse,
  type LiveEvent,
  type InsightsResponse,
  type Insight,
  type InsightSeverity,
  type ActiveUsersResponse,
} from "../../lib/analytics-api";
import {
  THEMES,
  type ThemeColors,
  Card,
  KpiCard,
  SectionHeading,
  TrendArea,
  TrendMultiLine,
  HBar,
  Donut,
  Funnel,
  DataTable,
  Empty,
  Skeleton,
  inr,
  inrCompact,
  num,
  pct,
  dur,
} from "../../components/admin/analytics/charts";

type Tab =
  | "overview"
  | "insights"
  | "traffic"
  | "composition"
  | "activity"
  | "attribution"
  | "sources"
  | "funnel"
  | "products"
  | "customers"
  | "search"
  | "performance"
  | "realtime";
const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "insights", label: "Insights" },
  { id: "traffic", label: "Traffic" },
  { id: "composition", label: "Sessions" },
  { id: "activity", label: "Active Users" },
  { id: "attribution", label: "Marketing" },
  { id: "sources", label: "Sources" },
  { id: "funnel", label: "Funnel" },
  { id: "products", label: "Products" },
  { id: "customers", label: "Customers" },
  { id: "search", label: "Search" },
  { id: "performance", label: "Performance" },
  { id: "realtime", label: "Live" },
];
const RANGES: { id: RangeKey; label: string }[] = [
  { id: "7", label: "7 days" },
  { id: "30", label: "30 days" },
  { id: "90", label: "90 days" },
  { id: "365", label: "1 year" },
];

const delta = (today: number, yest: number): number | null =>
  yest > 0 ? ((today - yest) / yest) * 100 : today > 0 ? 100 : null;

export default function AnalyticsPage() {
  const [mode, setMode] = useState<"light" | "dark">("dark");
  const [range, setRange] = useState<RangeKey>("30");
  const [tab, setTab] = useState<Tab>("overview");
  const c: ThemeColors = THEMES[mode];

  // Persist theme choice — defaults to the OPS dark console.
  useEffect(() => {
    const saved = localStorage.getItem("av-analytics-theme");
    if (saved === "dark" || saved === "light") setMode(saved);
  }, []);
  const toggleMode = () =>
    setMode((m) => {
      const next = m === "light" ? "dark" : "light";
      localStorage.setItem("av-analytics-theme", next);
      return next;
    });

  return (
    <div
      className="relative min-h-screen -m-4 overflow-hidden p-4 sm:-m-6 sm:p-8"
      style={{ background: c.bg, color: c.text }}
    >
      {/* ambient top glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[680px] -translate-x-1/2 rounded-full blur-3xl"
        style={{ background: c.glow, opacity: mode === "dark" ? 0.12 : 0.18 }}
      />

      {/* Header */}
      <div className="relative mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: c.text }}>
            Analytics
          </h1>
          <p className="mt-1.5 text-sm" style={{ color: c.muted }}>
            Revenue, product engagement, and the full store-activity stream.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <div
            className="flex items-center gap-1 rounded-xl border p-1"
            style={{ borderColor: c.border, background: c.surface }}
          >
            {RANGES.map((r) => {
              const on = range === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setRange(r.id)}
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
                  style={{
                    background: on ? "rgba(245,96,58,0.14)" : "transparent",
                    color: on ? c.primary : c.muted,
                    boxShadow: on ? `inset 0 0 0 1px ${c.primary}55` : "none",
                  }}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
          <ExportMenu c={c} range={range} tab={tab} />
          <button
            onClick={toggleMode}
            aria-label={mode === "light" ? "Switch to dark mode" : "Switch to light mode"}
            className="flex h-9 w-9 items-center justify-center rounded-xl border transition-colors"
            style={{ borderColor: c.border, background: c.surface, color: c.text }}
          >
            {mode === "light" ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="relative mb-6 inline-flex max-w-full flex-wrap gap-1 overflow-x-auto rounded-2xl border p-1.5"
        style={{ borderColor: c.border, background: c.surface }}
      >
        {TABS.map((t) => {
          const on = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="whitespace-nowrap rounded-xl px-3.5 py-1.5 text-sm font-medium transition-all"
              style={{
                background: on ? "rgba(245,96,58,0.12)" : "transparent",
                color: on ? c.primary : c.muted,
                boxShadow: on ? `inset 0 0 0 1px ${c.primary}66` : "none",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "overview" && <OverviewTab c={c} range={range} />}
      {tab === "insights" && <InsightsTab c={c} range={range} />}
      {tab === "traffic" && <TrafficTab c={c} range={range} />}
      {tab === "composition" && <CompositionTab c={c} range={range} />}
      {tab === "activity" && <ActiveUsersTab c={c} range={range} />}
      {tab === "attribution" && <AttributionTab c={c} range={range} />}
      {tab === "sources" && <SourcesTab c={c} range={range} />}
      {tab === "funnel" && <FunnelTab c={c} range={range} />}
      {tab === "products" && <ProductsTab c={c} range={range} />}
      {tab === "customers" && <CustomersTab c={c} range={range} />}
      {tab === "search" && <SearchTab c={c} range={range} />}
      {tab === "performance" && <PerformanceTab c={c} range={range} />}
      {tab === "realtime" && <LiveTab c={c} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* generic fetch hook                                                  */
/* ------------------------------------------------------------------ */
function useData<T>(fetcher: (signal: AbortSignal) => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const run = useCallback(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setError(false);
    fetcher(ctrl.signal)
      .then((d) => setData(d))
      .catch((e) => {
        if (!ctrl.signal.aborted) setError(true);
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false);
      });
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useEffect(run, [run]);
  return { data, error, loading };
}

function ErrorState({ c }: { c: ThemeColors }) {
  return <Empty c={c} label="Couldn't load analytics — try again." />;
}

/* ------------------------------------------------------------------ */
/* Overview                                                            */
/* ------------------------------------------------------------------ */
function OverviewTab({ c, range }: { c: ThemeColors; range: RangeKey }) {
  const { data, error, loading } = useData<OverviewResponse>(
    (s) => analyticsApi.overview(range, s),
    [range]
  );
  if (loading) return <GridSkeleton c={c} />;
  if (error || !data) return <ErrorState c={c} />;
  const k = data.kpis;
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          c={c}
          label="Revenue (today)"
          value={inr(k.revenue.today)}
          deltaPct={delta(k.revenue.today, k.revenue.yesterday)}
          hint="vs yesterday"
        />
        <KpiCard
          c={c}
          label="Orders (today)"
          value={num(k.orders.today)}
          deltaPct={delta(k.orders.today, k.orders.yesterday)}
          hint="vs yesterday"
        />
        <KpiCard
          c={c}
          label="Visitors (today)"
          value={num(k.visitors.today)}
          deltaPct={delta(k.visitors.today, k.visitors.yesterday)}
          hint="vs yesterday"
        />
        <KpiCard c={c} label="Conversion" value={pct(k.conversionRate)} hint={`AOV ${inr(k.aov)}`} />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card c={c} title="Revenue trend" className="lg:col-span-2">
          <TrendArea c={c} data={data.trend} dataKey="revenue" money />
        </Card>
        <Card c={c} title={`Range totals (${range}D)`}>
          <ul className="flex flex-col gap-3 text-sm">
            <Row c={c} label="Revenue" value={inr(k.revenue.range)} />
            <Row c={c} label="Orders" value={num(k.orders.range)} />
            <Row c={c} label="Visitors" value={num(k.visitors.range)} />
            <Row c={c} label="Sessions" value={num(k.sessions.range)} />
            <Row c={c} label="Avg order value" value={inr(k.aov)} />
          </ul>
        </Card>
      </div>
      <Card c={c} title="Visitors & orders">
        <TrendMultiLine
          c={c}
          data={data.trend}
          keys={[
            { key: "visitors", label: "Visitors" },
            { key: "sessions", label: "Sessions" },
            { key: "orders", label: "Orders" },
          ]}
        />
      </Card>
    </div>
  );
}

function Row({ c, label, value }: { c: ThemeColors; label: string; value: string }) {
  return (
    <li className="flex items-center justify-between">
      <span style={{ color: c.muted }}>{label}</span>
      <span className="font-semibold tabular-nums" style={{ color: c.text }}>
        {value}
      </span>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* Insights — automated "what changed" cards                          */
/* ------------------------------------------------------------------ */

/** Severity → status glyph (member-access maps keep the linter happy: a
    component must not be *created* during render, only referenced). */
const SEV_STATUS: Record<InsightSeverity, LucideIcon> = {
  critical: AlertTriangle,
  warning: AlertTriangle,
  positive: ArrowUpRight,
  info: Info,
};
/** Severity → accent colour. */
function severityTone(c: ThemeColors, s: InsightSeverity): string {
  if (s === "critical") return c.negative;
  if (s === "warning") return c.accent;
  if (s === "positive") return c.positive;
  return c.series[1];
}
/** Category → badge icon. */
const CATEGORY_ICON: Record<string, LucideIcon> = {
  Revenue: TrendingUp,
  Orders: ClipboardList,
  Conversion: Target,
  Checkout: ShoppingCart,
  Audience: Users,
  Customers: UserPlus,
  Products: Package,
  Inventory: Package,
  Refunds: RotateCcw,
  Traffic: Activity,
  Search: SearchIcon,
};

function formatMetric(m: NonNullable<Insight["metric"]>): string {
  if (m.format === "money") return inrCompact(m.value);
  if (m.format === "percent") return pct(m.value);
  return num(m.value);
}

function InsightCard({ c, insight }: { c: ThemeColors; insight: Insight }) {
  const tone = severityTone(c, insight.severity);
  const Status = SEV_STATUS[insight.severity];
  const Icon = CATEGORY_ICON[insight.category] ?? Lightbulb;
  const d = insight.deltaPct;
  const hasDelta = d != null && Number.isFinite(d);
  const up = (d ?? 0) >= 0;

  return (
    <div
      className="relative overflow-hidden rounded-2xl border p-5"
      style={{ background: c.surface, borderColor: c.border }}
    >
      {/* severity-tinted corner glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-2xl"
        style={{ background: tone, opacity: 0.13 }}
      />
      {/* severity rail */}
      <div
        aria-hidden
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{ background: tone, opacity: 0.85 }}
      />
      <div className="relative flex items-start gap-3.5">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ background: tone + "1F", color: tone, boxShadow: `inset 0 0 0 1px ${tone}33` }}
        >
          <Icon size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span
              className="text-[10px] font-bold uppercase tracking-[0.14em]"
              style={{ color: c.faint }}
            >
              {insight.category}
            </span>
            <Status size={12} style={{ color: tone }} />
          </div>
          <h3 className="mt-1 text-[15px] font-semibold leading-snug" style={{ color: c.text }}>
            {insight.title}
          </h3>
          <p className="mt-1 text-[13px] leading-relaxed" style={{ color: c.muted }}>
            {insight.detail}
          </p>
          {(insight.metric || hasDelta) && (
            <div className="mt-3 flex items-center gap-2.5">
              {insight.metric && (
                <span className="text-lg font-bold tabular-nums" style={{ color: c.text }}>
                  {formatMetric(insight.metric)}
                </span>
              )}
              {hasDelta && (
                <span
                  className="flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums"
                  style={{ background: tone + "1F", color: tone }}
                >
                  {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {Math.abs(Math.round(d!))}%
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InsightsTab({ c, range }: { c: ThemeColors; range: RangeKey }) {
  const { data, error, loading } = useData<InsightsResponse>(
    (s) => analyticsApi.insights(range, s),
    [range]
  );
  if (loading) return <GridSkeleton c={c} />;
  if (error || !data) return <ErrorState c={c} />;

  const insights = data.insights;
  const counts = insights.reduce(
    (acc, i) => {
      acc[i.severity] = (acc[i.severity] ?? 0) + 1;
      return acc;
    },
    {} as Record<InsightSeverity, number>
  );
  const actionable = (counts.critical ?? 0) + (counts.warning ?? 0);

  return (
    <div className="flex flex-col gap-4">
      <Card c={c}>
        <div className="flex items-start gap-3.5">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
            style={{ background: c.primary + "1F", color: c.primary, boxShadow: `inset 0 0 0 1px ${c.primary}33` }}
          >
            <Sparkles size={20} />
          </span>
          <div className="min-w-0">
            <h2 className="text-[17px] font-bold tracking-tight" style={{ color: c.text }}>
              Alerts &amp; Insights
            </h2>
            <p className="mt-0.5 text-[13px]" style={{ color: c.muted }}>
              {insights.length > 0
                ? `${insights.length} signal${insights.length > 1 ? "s" : ""} from the last ${range} days vs the previous ${range}` +
                  (actionable > 0 ? ` · ${actionable} need attention.` : ` · all clear.`)
                : `Comparing the last ${range} days with the previous ${range}.`}
            </p>
          </div>
        </div>
      </Card>

      {insights.length === 0 ? (
        <Card c={c}>
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <CheckCircle2 size={28} style={{ color: c.positive }} />
            <p className="text-sm font-semibold" style={{ color: c.text }}>
              Nothing unusual to report
            </p>
            <p className="max-w-sm text-xs" style={{ color: c.muted }}>
              No notable movements in revenue, traffic, conversion, inventory or refunds for this
              period. We&apos;ll flag anything that changes.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {insights.map((i) => (
            <InsightCard key={i.id} c={c} insight={i} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Traffic                                                             */
/* ------------------------------------------------------------------ */
function TrafficTab({ c, range }: { c: ThemeColors; range: RangeKey }) {
  const { data, error, loading } = useData<TrafficResponse>(
    (s) => analyticsApi.traffic(range, s),
    [range]
  );
  const cities = useData<CitiesResponse>((s) => analyticsApi.cities(range, s), [range]);
  if (loading) return <GridSkeleton c={c} />;
  if (error || !data) return <ErrorState c={c} />;
  const t = data.totals;
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard c={c} label="Sessions" value={num(t.sessions)} />
        <KpiCard c={c} label="Bounce rate" value={pct(t.bounceRate)} />
        <KpiCard c={c} label="Avg session" value={dur(t.avgDurationSec)} />
        <KpiCard c={c} label="Pages / session" value={t.pagesPerSession.toFixed(1)} />
      </div>
      <SectionHeading c={c} title="Audience" subtitle="Per-session device, location and platform breakdown" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card c={c} title="By device">
          <Donut c={c} data={data.byDevice.map((d) => ({ label: d.label, value: d.sessions }))} />
        </Card>
        <Card c={c} title="By country">
          <HBar c={c} data={data.byCountry.slice(0, 8).map((d) => ({ label: d.label, value: d.sessions }))} />
        </Card>
        <Card c={c} title="By browser">
          <HBar c={c} color={c.series[1]} data={data.byBrowser.slice(0, 8).map((d) => ({ label: d.label, value: d.sessions }))} />
        </Card>
        <Card c={c} title="Operating system">
          <Donut c={c} data={data.byOs.map((d) => ({ label: d.label, value: d.sessions }))} />
        </Card>
        <Card c={c} title="Top pages">
          <DataTable
            c={c}
            rows={data.topPages}
            columns={[
              { key: "path", label: "Path" },
              { key: "views", label: "Views", align: "right", sortable: true, render: (r) => num(r.views) },
            ]}
            initialSort={{ key: "views", dir: "desc" }}
          />
        </Card>
        <Card c={c} title="Exit pages">
          <DataTable
            c={c}
            rows={data.exitPages}
            columns={[
              { key: "path", label: "Path" },
              { key: "count", label: "Exits", align: "right", sortable: true, render: (r) => num(r.count) },
            ]}
            initialSort={{ key: "count", dir: "desc" }}
          />
        </Card>
        <Card c={c} title="By city">
          {cities.loading ? (
            <Skeleton c={c} height={120} />
          ) : cities.data && cities.data.cities.length > 0 ? (
            <DataTable
              c={c}
              rows={cities.data.cities}
              initialSort={{ key: "sessions", dir: "desc" }}
              columns={[
                { key: "city", label: "City" },
                { key: "country", label: "Country" },
                { key: "sessions", label: "Sessions", align: "right", sortable: true, render: (r) => num(r.sessions) },
                { key: "visitors", label: "Visitors", align: "right", sortable: true, render: (r) => num(r.visitors) },
              ]}
            />
          ) : (
            <Empty c={c} label="No city-level data in this range." />
          )}
        </Card>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Session composition                                                 */
/* ------------------------------------------------------------------ */
function CompositionTab({ c, range }: { c: ThemeColors; range: RangeKey }) {
  const { data, error, loading } = useData<SessionCompositionResponse>(
    (s) => analyticsApi.sessionComposition(range, s),
    [range]
  );
  if (loading) return <GridSkeleton c={c} />;
  if (error || !data) return <ErrorState c={c} />;

  const total = data.totalSessions;
  const share = (slices: { label: string; value: number }[], label: string) => {
    const hit = slices.find((s) => s.label === label)?.value ?? 0;
    return total > 0 ? pct(hit / total) : "—";
  };
  const mobile = data.byDevice.find((d) => d.label === "Mobile")?.value ?? 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard c={c} label="Sessions" value={num(total)} hint={`${range}-day range`} />
        <KpiCard c={c} label="New sessions" value={share(data.newVsReturning, "New")} hint="first-time visitors" />
        <KpiCard c={c} label="Logged in" value={share(data.guestVsLoggedIn, "Logged in")} hint="signed-in share" />
        <KpiCard c={c} label="Mobile" value={total > 0 ? pct(mobile / total) : "—"} hint="of all sessions" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card c={c} title="New vs returning" subtitle="Sessions in range, by first-time vs repeat visitor">
          <Donut c={c} data={data.newVsReturning} centerLabel="SESSIONS" />
        </Card>
        <Card c={c} title="Guest vs logged in" subtitle="Authentication state at session start">
          <Donut c={c} data={data.guestVsLoggedIn} centerLabel="SESSIONS" />
        </Card>
        <Card c={c} title="Device type" subtitle="Mobile vs desktop vs tablet">
          <Donut c={c} data={data.byDevice} centerLabel="SESSIONS" />
        </Card>
        <Card c={c} title="Acquisition channel" subtitle="Organic vs direct vs social vs referral">
          <Donut c={c} data={data.byChannel} centerLabel="SESSIONS" />
        </Card>
      </div>

      <SectionHeading c={c} title="Landing & exit" subtitle="Where sessions start and where they end" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card c={c} title="Entry pages" subtitle="First page of the session">
          {data.entryPages.length > 0 ? (
            <HBar c={c} color={c.series[2]} data={data.entryPages.map((p) => ({ label: p.path || "/", value: p.count }))} />
          ) : (
            <Empty c={c} label="No landing-page data in this range." />
          )}
        </Card>
        <Card c={c} title="Exit pages" subtitle="Last page before leaving">
          {data.exitPages.length > 0 ? (
            <HBar c={c} color={c.series[6]} data={data.exitPages.map((p) => ({ label: p.path || "/", value: p.count }))} />
          ) : (
            <Empty c={c} label="No exit-page data in this range." />
          )}
        </Card>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Active users (DAU / WAU / MAU)                                      */
/* ------------------------------------------------------------------ */
function ActiveUsersTab({ c, range }: { c: ThemeColors; range: RangeKey }) {
  const { data, error, loading } = useData<ActiveUsersResponse>(
    (s) => analyticsApi.activeUsers(range, s),
    [range]
  );
  if (loading) return <GridSkeleton c={c} />;
  if (error || !data) return <ErrorState c={c} />;
  const k = data.kpis;
  // DAU is a per-day average, so keep a decimal when it's small (avoids "0").
  const dau = k.dau >= 10 ? num(Math.round(k.dau)) : k.dau > 0 ? k.dau.toFixed(1) : "0";

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard c={c} label="Daily active users" value={dau} hint="avg actives / day" />
        <KpiCard c={c} label="Weekly active users" value={num(k.wau)} hint="last 7 days" />
        <KpiCard c={c} label="Monthly active users" value={num(k.mau)} hint="last 30 days" />
        <KpiCard c={c} label="Stickiness" value={pct(k.stickiness)} hint="DAU / MAU" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard c={c} label="Avg session duration" value={dur(k.avgSessionDuration)} hint="per session" />
        <KpiCard c={c} label="Sessions / user" value={k.sessionsPerUser.toFixed(2)} hint="in range" />
        <KpiCard c={c} label="Bounce rate" value={pct(k.bounceRate)} hint="single-page sessions" />
        <KpiCard c={c} label="Returning user rate" value={pct(k.returningUserRate)} hint="seen before this range" />
      </div>

      <Card c={c} title="Active users trend" subtitle="Distinct visitors active each day">
        <TrendArea c={c} data={data.trend} dataKey="activeUsers" />
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card c={c} title="New vs returning users" subtitle="First-time vs repeat visitors per day">
          <TrendMultiLine
            c={c}
            data={data.trend}
            keys={[
              { key: "newUsers", label: "New" },
              { key: "returningUsers", label: "Returning" },
            ]}
          />
        </Card>
        <Card c={c} title="Logged in vs guest users" subtitle="Authentication state of daily actives">
          <TrendMultiLine
            c={c}
            data={data.trend}
            keys={[
              { key: "loggedIn", label: "Logged in" },
              { key: "guest", label: "Guest" },
            ]}
          />
        </Card>
      </div>

      <Card c={c} title="Session growth" subtitle="Cumulative sessions over the range">
        <TrendArea c={c} data={data.trend} dataKey="cumulativeSessions" color={c.series[2]} />
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Marketing attribution                                               */
/* ------------------------------------------------------------------ */
function AttributionTab({ c, range }: { c: ThemeColors; range: RangeKey }) {
  const [editing, setEditing] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const { data, error, loading } = useData<AttributionResponse>(
    (s) => analyticsApi.attribution(range, s),
    [range, reloadKey]
  );
  if (loading) return <GridSkeleton c={c} />;
  if (error || !data) return <ErrorState c={c} />;
  if (data.channels.length === 0)
    return <Empty c={c} label="No acquisition data in this range yet." />;

  const t = data.totals;
  const roas = (v: number | null) => (v == null ? "—" : `${v.toFixed(2)}×`);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard c={c} label="Sessions" value={num(t.sessions)} hint={`${num(t.users)} users`} />
        <KpiCard c={c} label="Attributed revenue" value={inr(t.revenue)} hint="first-touch" />
        <KpiCard c={c} label="Conversion" value={pct(t.conversionRate)} hint={`${num(t.orders)} orders`} />
        <KpiCard
          c={c}
          label={data.hasSpend ? "Blended ROAS" : "Avg order value"}
          value={data.hasSpend ? roas(t.roas) : inr(t.aov)}
          hint={data.hasSpend ? `spend ${inr(t.spend)}` : "per order"}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card c={c} title="Revenue by channel" subtitle="First-touch attributed">
          <Donut
            c={c}
            money
            centerLabel="REVENUE"
            data={data.channels
              .filter((ch) => ch.revenue > 0)
              .map((ch) => ({ label: ch.channel, value: ch.revenue }))}
          />
        </Card>
        <Card c={c} title="Sessions by channel" subtitle="Where acquisition comes from">
          <HBar
            c={c}
            color={c.series[2]}
            data={data.channels
              .filter((ch) => ch.sessions > 0)
              .map((ch) => ({ label: ch.channel, value: ch.sessions }))}
          />
        </Card>
      </div>

      {editing && (
        <AdSpendEditor
          c={c}
          onClose={() => setEditing(false)}
          onChanged={() => setReloadKey((k) => k + 1)}
        />
      )}

      <Card
        c={c}
        title="Channel performance"
        subtitle={
          data.hasSpend
            ? "Acquisition, revenue and return on ad spend by channel"
            : "Acquisition and revenue by channel · set ad spend to compute ROAS"
        }
        action={
          <button
            onClick={() => setEditing((e) => !e)}
            className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors"
            style={{ borderColor: c.border, color: c.text, background: c.surfaceAlt }}
          >
            <Wallet size={13} /> {editing ? "Close" : "Ad spend"}
          </button>
        }
      >
        <DataTable
          c={c}
          rows={data.channels as unknown as Record<string, unknown>[]}
          initialSort={{ key: "revenue", dir: "desc" }}
          columns={[
            { key: "channel", label: "Channel" },
            { key: "users", label: "Users", align: "right", sortable: true, render: (r) => num(Number(r.users)) },
            { key: "sessions", label: "Sessions", align: "right", sortable: true, render: (r) => num(Number(r.sessions)) },
            { key: "revenue", label: "Revenue", align: "right", sortable: true, render: (r) => inrCompact(Number(r.revenue)) },
            { key: "conversionRate", label: "Conv %", align: "right", sortable: true, render: (r) => pct(Number(r.conversionRate)) },
            { key: "aov", label: "AOV", align: "right", sortable: true, render: (r) => inr(Number(r.aov)) },
            { key: "roas", label: "ROAS", align: "right", sortable: true, render: (r) => roas(r.roas as number | null) },
          ]}
        />
      </Card>
    </div>
  );
}

/* Inline editor for date-bound (monthly) ad spend — persisted to SiteSetting.
   ROAS in /attribution prorates each month's budget across the range days. */
function thisMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function AdSpendEditor({
  c,
  onClose,
  onChanged,
}: {
  c: ThemeColors;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [channels, setChannels] = useState<string[]>([]);
  const [months, setMonths] = useState<Record<string, Record<string, number>>>({});
  const [month, setMonth] = useState<string>(thisMonth);
  const [spend, setSpend] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [failed, setFailed] = useState(false);

  // Initial load of the whole monthly map.
  useEffect(() => {
    let alive = true;
    analyticsApi
      .adSpend()
      .then((r: AdSpendResponse) => {
        if (!alive) return;
        setChannels(r.channels);
        setMonths(r.months);
        setLoading(false);
      })
      .catch(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  // Re-seed the inputs whenever the selected month (or loaded data) changes.
  useEffect(() => {
    const m = months[month] ?? {};
    const init: Record<string, string> = {};
    channels.forEach((ch) => (init[ch] = m[ch] ? String(m[ch]) : ""));
    setSpend(init);
    setSaved(false);
  }, [month, months, channels]);

  const monthTotal = Object.values(spend).reduce((s, v) => {
    const num = Number(v);
    return s + (Number.isFinite(num) && num > 0 ? num : 0);
  }, 0);

  const save = async () => {
    setSaving(true);
    setFailed(false);
    const payload: Record<string, number> = {};
    for (const [k, v] of Object.entries(spend)) {
      const num = Number(v);
      if (Number.isFinite(num) && num > 0) payload[k] = num;
    }
    try {
      const res = await analyticsApi.saveAdSpend(month, payload);
      setMonths(res.months);
      setSaved(true);
      onChanged();
    } catch {
      setFailed(true);
    } finally {
      setSaving(false);
    }
  };

  const isDark = c === THEMES.dark;

  return (
    <Card
      c={c}
      title="Ad spend"
      subtitle="Monthly budget per channel · ROAS prorates it across the days in your selected range."
    >
      {loading ? (
        <Skeleton c={c} height={200} />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            <label className="flex items-center gap-2 text-xs" style={{ color: c.muted }}>
              Month
              <input
                type="month"
                value={month}
                onChange={(e) => e.target.value && setMonth(e.target.value)}
                className="rounded-lg border bg-transparent px-2.5 py-1.5 text-sm outline-none"
                style={{ borderColor: c.border, color: c.text, colorScheme: isDark ? "dark" : "light" }}
              />
            </label>
            <span className="text-xs" style={{ color: c.muted }}>
              Month total{" "}
              <span className="tabular-nums font-semibold" style={{ color: c.text }}>
                {inr(monthTotal)}
              </span>
            </span>
            {Object.keys(months).length > 0 && (
              <span className="ml-auto truncate text-xs" style={{ color: c.faint }}>
                Saved: {Object.keys(months).sort().join(", ")}
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {channels.map((ch) => (
              <label key={ch} className="flex flex-col gap-1.5">
                <span className="text-xs font-medium" style={{ color: c.muted }}>
                  {ch}
                </span>
                <div
                  className="flex items-center overflow-hidden rounded-lg border"
                  style={{ borderColor: c.border, background: c.surfaceAlt }}
                >
                  <span className="pl-3 pr-1 text-sm" style={{ color: c.faint }}>
                    ₹
                  </span>
                  <input
                    type="number"
                    min={0}
                    inputMode="numeric"
                    placeholder="0"
                    value={spend[ch] ?? ""}
                    onChange={(e) => setSpend((s) => ({ ...s, [ch]: e.target.value }))}
                    className="w-full bg-transparent px-1 py-2 text-sm tabular-nums outline-none"
                    style={{ color: c.text }}
                  />
                </div>
              </label>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-end gap-2">
            {failed && (
              <span className="mr-auto text-xs" style={{ color: c.negative }}>
                Couldn’t save — try again.
              </span>
            )}
            {saved && !failed && (
              <span className="mr-auto text-xs font-semibold" style={{ color: c.positive }}>
                Saved ✓
              </span>
            )}
            <button
              onClick={onClose}
              className="rounded-lg border px-3.5 py-1.5 text-xs font-semibold transition-colors"
              style={{ borderColor: c.border, color: c.muted, background: "transparent" }}
            >
              Done
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors disabled:opacity-60"
              style={{ background: c.primary, color: "#fff" }}
            >
              {saving ? "Saving…" : "Save month"}
            </button>
          </div>
        </>
      )}
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Sources                                                             */
/* ------------------------------------------------------------------ */
function SourcesTab({ c, range }: { c: ThemeColors; range: RangeKey }) {
  const { data, error, loading } = useData<SourcesResponse>(
    (s) => analyticsApi.sources(range, s),
    [range]
  );
  const campaigns = useData<CampaignsResponse>((s) => analyticsApi.campaigns(range, s), [range]);
  const referrers = useData<ReferrersResponse>((s) => analyticsApi.referrers(range, s), [range]);
  if (loading) return <GridSkeleton c={c} />;
  if (error || !data) return <ErrorState c={c} />;
  return (
    <div className="flex flex-col gap-4">
      <Card c={c} title="Visitors by source" subtitle="Where your traffic comes from">
        {data.sources.length > 0 ? (
          <HBar c={c} color={c.series[2]} data={data.sources.slice(0, 10).map((s) => ({ label: s.source, value: s.visitors }))} />
        ) : (
          <Empty c={c} label="No traffic in this range yet." />
        )}
      </Card>
      <Card
        c={c}
        title="Source performance"
        action={<ExportButton c={c} widget="sources:performance" range={range} />}
      >
        <DataTable
          c={c}
          rows={data.sources}
          initialSort={{ key: "visitors", dir: "desc" }}
          columns={[
            { key: "source", label: "Source" },
            { key: "visitors", label: "Visitors", align: "right", sortable: true, render: (r) => num(r.visitors) },
            { key: "productViews", label: "Views", align: "right", sortable: true, render: (r) => num(r.productViews) },
            { key: "addToCart", label: "Carts", align: "right", sortable: true, render: (r) => num(r.addToCart) },
            { key: "requests", label: "Requests", align: "right", sortable: true, render: (r) => num(r.requests) },
            { key: "revenue", label: "Revenue", align: "right", sortable: true, render: (r) => inrCompact(r.revenue) },
            { key: "conversionRate", label: "Req %", align: "right", sortable: true, render: (r) => pct(r.conversionRate) },
          ]}
        />
      </Card>
      <Card c={c} title="UTM campaigns">
        {campaigns.loading ? (
          <Skeleton c={c} height={120} />
        ) : campaigns.data && campaigns.data.campaigns.length > 0 ? (
          <DataTable
            c={c}
            rows={campaigns.data.campaigns}
            initialSort={{ key: "sessions", dir: "desc" }}
            columns={[
              { key: "campaign", label: "Campaign" },
              { key: "source", label: "Source" },
              { key: "sessions", label: "Sessions", align: "right", sortable: true, render: (r) => num(r.sessions) },
              { key: "visitors", label: "Visitors", align: "right", sortable: true, render: (r) => num(r.visitors) },
              { key: "orders", label: "Orders", align: "right", sortable: true, render: (r) => num(r.orders) },
              { key: "revenue", label: "Revenue", align: "right", sortable: true, render: (r) => inrCompact(r.revenue) },
              { key: "conversionRate", label: "Conv %", align: "right", sortable: true, render: (r) => pct(r.conversionRate) },
            ]}
          />
        ) : (
          <Empty c={c} label="No tagged campaigns yet — add utm_campaign to your links." />
        )}
      </Card>
      <Card c={c} title="Top referrers">
        {referrers.loading ? (
          <Skeleton c={c} height={120} />
        ) : referrers.data && referrers.data.referrers.length > 0 ? (
          <DataTable
            c={c}
            rows={referrers.data.referrers}
            initialSort={{ key: "sessions", dir: "desc" }}
            columns={[
              { key: "referrer", label: "Referrer" },
              { key: "sessions", label: "Sessions", align: "right", sortable: true, render: (r) => num(r.sessions) },
              { key: "visitors", label: "Visitors", align: "right", sortable: true, render: (r) => num(r.visitors) },
            ]}
          />
        ) : (
          <Empty c={c} label="No referring sites recorded in this range." />
        )}
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Funnel                                                              */
/* ------------------------------------------------------------------ */
function FunnelTab({ c, range }: { c: ThemeColors; range: RangeKey }) {
  const { data, error, loading } = useData<FunnelResponse>(
    (s) => analyticsApi.funnel(range, s),
    [range]
  );
  if (loading) return <GridSkeleton c={c} />;
  if (error || !data) return <ErrorState c={c} />;
  return (
    <Card c={c} title={`Conversion funnel (${range}D)`}>
      <p className="mb-3 text-xs" style={{ color: c.muted }}>
        Each step counts distinct {data.denominator ?? "sessions"} that performed it;
        “Orders Confirmed” is realized sales from confirmed orders. Drop-off is relative
        to the previous step.
      </p>
      <Funnel c={c} stages={data.stages} />
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Products                                                            */
/* ------------------------------------------------------------------ */
function ProductsTab({ c, range }: { c: ThemeColors; range: RangeKey }) {
  const { data, error, loading } = useData<ProductsResponse>(
    (s) => analyticsApi.products(range, s),
    [range]
  );
  if (loading) return <GridSkeleton c={c} />;
  if (error || !data) return <ErrorState c={c} />;
  return (
    <Card
      c={c}
      title="Product performance"
      action={<ExportButton c={c} widget="products:performance" range={range} />}
    >
      <DataTable
        c={c}
        rows={data.products}
        initialSort={{ key: "revenue", dir: "desc" }}
        columns={[
          { key: "name", label: "Product" },
          { key: "views", label: "Views", align: "right", sortable: true, render: (r) => num(r.views) },
          { key: "addToCart", label: "Carts", align: "right", sortable: true, render: (r) => num(r.addToCart) },
          { key: "purchases", label: "Sold", align: "right", sortable: true, render: (r) => num(r.purchases) },
          { key: "conversionRate", label: "Conv %", align: "right", sortable: true, render: (r) => pct(r.conversionRate) },
          { key: "revenue", label: "Revenue", align: "right", sortable: true, render: (r) => inrCompact(r.revenue) },
        ]}
      />
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Customers                                                           */
/* ------------------------------------------------------------------ */
function CustomersTab({ c, range }: { c: ThemeColors; range: RangeKey }) {
  const { data, error, loading } = useData<CustomersResponse>(
    (s) => analyticsApi.customers(range, s),
    [range]
  );
  if (loading) return <GridSkeleton c={c} />;
  if (error || !data) return <ErrorState c={c} />;
  const k = data.kpis;
  const monthly = data.monthly.map((m) => ({
    day: m.month,
    newCustomers: m.newCustomers,
    returningCustomers: m.returningCustomers,
  }));
  const date = (s: string) => new Date(s).toLocaleDateString("en-IN");
  const custCols = [
    { key: "name" as const, label: "Customer" },
    { key: "orders" as const, label: "Orders", align: "right" as const, sortable: true, render: (r: CustomerRow) => num(r.orders) },
    { key: "ltv" as const, label: "LTV", align: "right" as const, sortable: true, render: (r: CustomerRow) => inr(r.ltv) },
    { key: "lastOrder" as const, label: "Last order", align: "right" as const, sortable: true, render: (r: CustomerRow) => date(r.lastOrder) },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard c={c} label="Customers" value={num(k.totalCustomers)} hint="all-time, paid" />
        <KpiCard c={c} label="Avg lifetime value" value={inr(k.avgLtv)} hint={`${pct(k.repeatRate)} repeat`} />
        <KpiCard c={c} label="Avg order value" value={inr(k.aov)} hint="per order" />
        <KpiCard c={c} label="Purchase frequency" value={k.avgOrders.toFixed(2)} hint="orders / customer" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard c={c} label="VIP" value={num(k.vipCustomers)} hint="5+ orders" />
        <KpiCard c={c} label="Recently active" value={num(k.recentlyActive)} hint="ordered ≤30d" />
        <KpiCard c={c} label="Dormant" value={num(k.dormantCustomers)} hint="no order >180d" />
        <KpiCard c={c} label={`New (${range}D)`} value={num(k.newInRange)} hint="first order in range" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card c={c} title="Lifecycle segmentation" subtitle="Customers by recency of last order">
          <Donut c={c} data={data.segments.lifecycle} centerLabel="CUSTOMERS" />
        </Card>
        <Card c={c} title="Purchase frequency" subtitle="Customers by number of paid orders">
          <Donut c={c} data={data.segments.frequency} centerLabel="CUSTOMERS" />
        </Card>
      </div>

      <Card c={c} title="New vs returning customers" subtitle="First-time vs repeat buyers per month">
        <TrendMultiLine
          c={c}
          data={monthly}
          keys={[
            { key: "newCustomers", label: "New" },
            { key: "returningCustomers", label: "Returning" },
          ]}
        />
      </Card>

      <Card c={c} title="Top customers (VIP)" subtitle="Highest lifetime value — your most valuable buyers">
        <DataTable c={c} rows={data.topCustomers} initialSort={{ key: "ltv", dir: "desc" }} columns={custCols} />
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card c={c} title="Recently active" subtitle="Ordered in the last 30 days">
          {data.recentCustomers.length > 0 ? (
            <DataTable c={c} rows={data.recentCustomers} initialSort={{ key: "lastOrder", dir: "desc" }} columns={custCols} />
          ) : (
            <Empty c={c} label="No orders in the last 30 days." />
          )}
        </Card>
        <Card c={c} title="Dormant — win them back" subtitle="No order in 180+ days · most valuable first">
          {data.dormantCustomers.length > 0 ? (
            <DataTable c={c} rows={data.dormantCustomers} initialSort={{ key: "ltv", dir: "desc" }} columns={custCols} />
          ) : (
            <Empty c={c} label="No dormant customers 🎉" />
          )}
        </Card>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Performance (Web Vitals)                                            */
/* ------------------------------------------------------------------ */
function PerformanceTab({ c, range }: { c: ThemeColors; range: RangeKey }) {
  const { data, error, loading } = useData<PerformanceResponse>(
    (s) => analyticsApi.performance(range, s),
    [range]
  );
  if (loading) return <GridSkeleton c={c} />;
  if (error || !data) return <ErrorState c={c} />;
  if (data.metrics.length === 0)
    return <Empty c={c} label="No Web Vitals collected yet — they arrive as visitors browse." />;

  const fmtVal = (metric: string, avg: number) =>
    metric === "CLS" ? (avg / 1000).toFixed(3) : `${Math.round(avg)} ms`;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {data.metrics.map((m) => (
          <KpiCard
            key={m.metric}
            c={c}
            label={m.metric}
            value={fmtVal(m.metric, m.avg)}
            hint={`${pct(m.goodRate)} good · ${num(m.samples)} samples`}
          />
        ))}
      </div>
      <Card c={c} title="“Good” rate by metric" subtitle="% of samples meeting the Web Vitals target">
        <HBar c={c} color={c.positive} max={100} data={data.metrics.map((m) => ({ label: m.metric, value: Math.round(m.goodRate * 100) }))} />
      </Card>
      <Card c={c} title="Rating breakdown">
        <DataTable
          c={c}
          rows={data.metrics as unknown as Record<string, unknown>[]}
          columns={[
            { key: "metric", label: "Metric" },
            { key: "avg", label: "Avg", align: "right", render: (r) => fmtVal(String(r.metric), Number(r.avg)) },
            { key: "good", label: "Good", align: "right", sortable: true, render: (r) => num(Number(r.good)) },
            {
              key: "needsImprovement",
              label: "Needs work",
              align: "right",
              render: (r) => num(Number(r.needsImprovement)),
            },
            { key: "poor", label: "Poor", align: "right", sortable: true, render: (r) => num(Number(r.poor)) },
          ]}
        />
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Search                                                              */
/* ------------------------------------------------------------------ */
function SearchTab({ c, range }: { c: ThemeColors; range: RangeKey }) {
  const { data, error, loading } = useData<SearchResponse>(
    (s) => analyticsApi.search(range, s),
    [range]
  );
  if (loading) return <GridSkeleton c={c} />;
  if (error || !data) return <ErrorState c={c} />;
  const k = data.kpis;
  const growth = (g: number | null) => (g == null ? "New" : `+${Math.round(g * 100)}%`);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard c={c} label="Total searches" value={num(k.totalSearches)} hint={`${num(k.uniqueTerms)} unique terms`} />
        <KpiCard c={c} label="Search → purchase" value={pct(k.searchToPurchaseRate)} hint={`${num(k.searchSessions)} search sessions`} />
        <KpiCard c={c} label="Abandonment" value={pct(k.abandonmentRate)} hint="no engagement after search" />
        <KpiCard c={c} label="No-result rate" value={pct(k.zeroResultRate)} hint="searches returning nothing" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card c={c} title="Most searched keywords" subtitle="Top terms in range">
          {data.top.length > 0 ? (
            <HBar c={c} data={data.top.slice(0, 10).map((t) => ({ label: t.term, value: t.searches }))} />
          ) : (
            <Empty c={c} label="No searches recorded in this range." />
          )}
        </Card>
        <Card c={c} title="Trending searches" subtitle="Biggest risers vs the previous period">
          {data.trending.length > 0 ? (
            <DataTable
              c={c}
              rows={data.trending as unknown as Record<string, unknown>[]}
              initialSort={{ key: "delta", dir: "desc" }}
              columns={[
                { key: "term", label: "Term" },
                { key: "current", label: "Now", align: "right", sortable: true, render: (r) => num(Number(r.current)) },
                { key: "previous", label: "Prev", align: "right", sortable: true, render: (r) => num(Number(r.previous)) },
                {
                  key: "growth",
                  label: "Change",
                  align: "right",
                  sortable: true,
                  render: (r) => (
                    <span style={{ color: c.positive }}>{growth(r.growth as number | null)}</span>
                  ),
                },
              ]}
            />
          ) : (
            <Empty c={c} label="No rising terms yet — need a previous period to compare." />
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card c={c} title="All searched terms" subtitle="Full keyword demand">
          <DataTable
            c={c}
            rows={data.top}
            columns={[
              { key: "term", label: "Term" },
              { key: "searches", label: "Searches", align: "right", sortable: true, render: (r) => num(r.searches) },
            ]}
            initialSort={{ key: "searches", dir: "desc" }}
          />
        </Card>
        <Card c={c} title="Searches with no results" subtitle="Demand you’re not meeting — catalogue gaps">
          {data.zeroResult.length > 0 ? (
            <DataTable
              c={c}
              rows={data.zeroResult}
              columns={[
                { key: "term", label: "Term" },
                { key: "searches", label: "Count", align: "right", sortable: true, render: (r) => num(r.searches) },
              ]}
              initialSort={{ key: "searches", dir: "desc" }}
            />
          ) : (
            <Empty c={c} label="Every search returned results 🎉" />
          )}
        </Card>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Live (SSE — no polling)                                             */
/* ------------------------------------------------------------------ */
interface FeedItem {
  id: string;
  Icon: LucideIcon;
  tone: string;
  text: string;
  at: string;
}

function ago(iso: string): string {
  const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  return `${Math.floor(s / 3600)}h`;
}

function who(e: LiveEvent): string {
  const role = e.loggedIn ? "Customer" : "Visitor";
  const place =
    e.city || e.country || (e.source && e.source !== "direct" ? e.source : null);
  return place ? `${role} from ${place}` : role;
}

function normalizeLiveEvent(c: ThemeColors, e: LiveEvent): FeedItem | null {
  const base = { id: e.id, at: e.at };
  const w = who(e);
  const name = e.productName ?? "a product";
  switch (e.name) {
    case "product_view":
      return { ...base, Icon: Eye, tone: c.muted, text: `${w} viewed ${name}` };
    case "add_to_cart":
      return { ...base, Icon: ShoppingCart, tone: c.primary, text: `${w} added ${name} to cart` };
    case "wishlist_add":
      return { ...base, Icon: Heart, tone: c.accent, text: `${w} wishlisted ${name}` };
    case "checkout_started":
      return { ...base, Icon: CreditCard, tone: c.accent, text: `${w} started checkout` };
    case "request_submitted":
    case "order_placed": // legacy alias of request_submitted
      return {
        ...base,
        Icon: ClipboardList,
        tone: c.accent,
        text: `${w} submitted a request${e.value ? ` worth ${inr(e.value)}` : ""}`,
      };
    case "order_confirmed":
      return {
        ...base,
        Icon: CheckCircle2,
        tone: c.positive,
        text: `Order confirmed${e.value ? ` — ${inr(e.value)}` : ""}`,
      };
    case "search":
      return { ...base, Icon: SearchIcon, tone: c.muted, text: `${w} searched “${e.productName ?? ""}”` };
    case "social_click":
      return { ...base, Icon: Share2, tone: c.primary, text: `${w} clicked a social link` };
    default:
      return null;
  }
}

function normalizeActivity(c: ThemeColors, row: unknown): FeedItem | null {
  const r = row as { id?: number; action?: string; createdAt?: string; meta?: Record<string, unknown> };
  if (!r.action) return null;
  const base = { id: `act-${r.id ?? Math.random()}`, at: r.createdAt ?? new Date().toISOString() };
  switch (r.action) {
    case "order.placed":
      return { ...base, Icon: CheckCircle2, tone: c.positive, text: "New order placed" };
    case "auth.login":
      return { ...base, Icon: LogIn, tone: c.muted, text: "Customer logged in" };
    case "auth.signup":
      return { ...base, Icon: UserPlus, tone: c.primary, text: "New user registered" };
    case "stock.out":
      return { ...base, Icon: Circle, tone: c.negative, text: "A product just sold out" };
    default:
      return null;
  }
}

function LiveTab({ c }: { c: ThemeColors }) {
  const [snap, setSnap] = useState<RealtimeResponse | null>(null);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [connected, setConnected] = useState(false);
  const cRef = useRef(c);
  cRef.current = c;

  // First paint via REST; SSE keeps it live thereafter.
  useEffect(() => {
    let alive = true;
    analyticsApi
      .realtime()
      .then((d) => alive && setSnap(d))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const push = useCallback((item: FeedItem | null) => {
    if (!item) return;
    setFeed((f) => [item, ...f].slice(0, 60));
  }, []);

  useAdminRealtime({
    onConnectionChange: setConnected,
    onAnalyticsMetrics: (m) => setSnap(m as RealtimeResponse),
    onAnalyticsEvent: (e) => push(normalizeLiveEvent(cRef.current, e as LiveEvent)),
    onActivity: (row) => push(normalizeActivity(cRef.current, row)),
  });

  const dot = (
    <span
      className="inline-block h-2 w-2 rounded-full"
      style={{ background: connected ? c.positive : c.muted }}
    />
  );

  return (
    <div className="flex flex-col gap-4">
      {/* live counters */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card c={c}>
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide" style={{ color: c.muted }}>
            {dot} Active now
          </p>
          <p className="mt-1 text-3xl font-bold tabular-nums" style={{ color: c.text }}>
            {snap ? num(snap.activeUsers) : "—"}
          </p>
          <p className="mt-1 text-xs" style={{ color: c.muted }}>
            {snap ? `${num(snap.loggedIn)} users · ${num(snap.guests)} guests` : "live"}
          </p>
        </Card>
        <KpiCard c={c} label="Active sessions" value={snap ? num(snap.sessions) : "—"} hint="last 5 min" />
        <KpiCard c={c} label="Revenue today" value={snap ? inr(snap.today.revenue) : "—"} hint={snap ? `${num(snap.today.orders)} orders` : ""} />
        <KpiCard
          c={c}
          label="Live cart / checkout"
          value={snap ? `${num(snap.window.addToCart)} / ${num(snap.window.checkout)}` : "—"}
          hint="last 5 min"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* event feed */}
        <Card c={c} title="Live activity" className="lg:col-span-2">
          {feed.length === 0 ? (
            <Empty c={c} label="Waiting for live activity…" />
          ) : (
            <ul className="flex max-h-[460px] flex-col gap-1 overflow-y-auto">
              {feed.map((it) => {
                const Icon = it.Icon;
                return (
                  <li
                    key={it.id}
                    className="flex items-center gap-3 rounded-lg px-2 py-2"
                    style={{ background: c.surfaceAlt }}
                  >
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                      style={{ background: c.surface, color: it.tone }}
                    >
                      <Icon size={15} />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm" style={{ color: c.text }}>
                      {it.text}
                    </span>
                    <span className="shrink-0 text-xs tabular-nums" style={{ color: c.muted }}>
                      {ago(it.at)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        {/* breakdowns */}
        <div className="flex flex-col gap-4">
          <Card c={c} title="By source">
            <MiniList c={c} rows={snap?.bySource ?? []} />
          </Card>
          <Card c={c} title="By device">
            <MiniList c={c} rows={snap?.byDevice ?? []} />
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card c={c} title="Active by city">
          <MiniList c={c} rows={snap?.byCity ?? []} />
        </Card>
        <Card c={c} title="Pages being viewed">
          {snap && snap.topPaths.length > 0 ? (
            <HBar c={c} data={snap.topPaths.map((p) => ({ label: p.path, value: p.count }))} />
          ) : (
            <Empty c={c} label="No active page views" />
          )}
        </Card>
      </div>
    </div>
  );
}

function MiniList({ c, rows }: { c: ThemeColors; rows: { label: string; count: number }[] }) {
  if (rows.length === 0) return <Empty c={c} label="—" />;
  return (
    <ul className="flex flex-col gap-1.5 text-sm">
      {rows.map((r) => (
        <li key={r.label} className="flex items-center justify-between">
          <span className="truncate" style={{ color: c.muted }}>
            {r.label}
          </span>
          <span className="tabular-nums" style={{ color: c.text }}>
            {num(r.count)}
          </span>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* shared bits                                                         */
/* ------------------------------------------------------------------ */
/* ------------------------------------------------------------------ */
/* Export menu — CSV / Excel / PDF for a widget, section or dashboard  */
/* ------------------------------------------------------------------ */

/** Dashboard tabs that map onto an exportable section (drives the default). */
const TAB_TO_SECTION: Partial<Record<Tab, string>> = {
  overview: "overview",
  traffic: "traffic",
  sources: "sources",
  products: "products",
  customers: "customers",
  funnel: "funnel",
  search: "search",
};

const EXPORT_FORMATS: { id: ExportFormat; label: string; Icon: LucideIcon }[] = [
  { id: "csv", label: "CSV", Icon: FileText },
  { id: "xlsx", label: "Excel", Icon: FileSpreadsheet },
  { id: "pdf", label: "PDF", Icon: FileType },
];

interface ExportTarget {
  key: string;
  scope: "dashboard" | "section" | "widget";
  section?: string;
  widget?: string;
  label: string;
  indent?: boolean;
}

function ExportMenu({ c, range, tab }: { c: ThemeColors; range: RangeKey; tab: Tab }) {
  const [open, setOpen] = useState(false);
  const [manifest, setManifest] = useState<ExportManifest | null>(null);
  const [selKey, setSelKey] = useState("dashboard");
  const wrapRef = useRef<HTMLDivElement>(null);

  // Load the export catalogue once (async setState — allowed in effects).
  useEffect(() => {
    let alive = true;
    analyticsApi
      .exportManifest()
      .then((m) => alive && setManifest(m))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  // Close on outside click while open.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const targets = useMemo<ExportTarget[]>(() => {
    const list: ExportTarget[] = [
      { key: "dashboard", scope: "dashboard", label: "Entire dashboard" },
    ];
    for (const s of manifest?.sections ?? []) {
      list.push({ key: `section:${s.id}`, scope: "section", section: s.id, label: s.title });
      for (const w of s.widgets)
        list.push({ key: `widget:${w.id}`, scope: "widget", widget: w.id, label: w.title, indent: true });
    }
    return list;
  }, [manifest]);

  const openMenu = () => {
    const sec = TAB_TO_SECTION[tab];
    setSelKey(sec ? `section:${sec}` : "dashboard");
    setOpen(true);
  };

  const doExport = (format: ExportFormat) => {
    const t = targets.find((x) => x.key === selKey) ?? targets[0];
    triggerDownload(
      exportUrl({ format, scope: t.scope, section: t.section, widget: t.widget, range })
    );
    setOpen(false);
  };

  return (
    <div className="relative" ref={wrapRef}>
      <button
        onClick={() => (open ? setOpen(false) : openMenu())}
        className="flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition-colors"
        style={{ borderColor: c.border, background: c.surface, color: c.text }}
      >
        <Download size={14} /> Export
        <ChevronDown size={13} style={{ color: c.muted }} />
      </button>
      {open && (
        <div
          className="absolute right-0 z-30 mt-2 w-72 rounded-2xl border p-2 shadow-xl"
          style={{ background: c.surface, borderColor: c.border }}
        >
          <p
            className="px-2 pb-1 pt-1.5 text-[10px] font-bold uppercase tracking-[0.14em]"
            style={{ color: c.faint }}
          >
            What to export
          </p>
          <div className="max-h-60 overflow-y-auto">
            {targets.map((t) => {
              const on = t.key === selKey;
              const Icon =
                t.scope === "dashboard" ? LayoutGrid : t.scope === "section" ? ClipboardList : Circle;
              return (
                <button
                  key={t.key}
                  onClick={() => setSelKey(t.key)}
                  className="flex w-full items-center gap-2 rounded-lg py-1.5 pr-2 text-left text-[13px] transition-colors"
                  style={{
                    background: on ? c.primary + "14" : "transparent",
                    color: on ? c.primary : c.text,
                    paddingLeft: t.indent ? 26 : 8,
                  }}
                >
                  {!t.indent && <Icon size={14} style={{ color: on ? c.primary : c.muted }} />}
                  <span
                    className="min-w-0 flex-1 truncate"
                    style={{ fontWeight: t.scope === "widget" ? 400 : 600 }}
                  >
                    {t.label}
                  </span>
                  {on && <Check size={14} />}
                </button>
              );
            })}
          </div>
          <p
            className="px-2 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.14em]"
            style={{ color: c.faint }}
          >
            Format
          </p>
          <div className="flex gap-1.5 px-1 pb-1">
            {EXPORT_FORMATS.map((f) => {
              const Icon = f.Icon;
              return (
                <button
                  key={f.id}
                  onClick={() => doExport(f.id)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-semibold transition-colors"
                  style={{ borderColor: c.border, color: c.text, background: c.surfaceAlt }}
                >
                  <Icon size={14} /> {f.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function ExportButton({ c, widget, range }: { c: ThemeColors; widget: string; range: RangeKey }) {
  return (
    <a
      href={exportUrl({ format: "csv", scope: "widget", widget, range })}
      className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold"
      style={{ borderColor: c.border, color: c.text, background: c.surfaceAlt }}
    >
      <Download size={13} /> CSV
    </a>
  );
}

function GridSkeleton({ c }: { c: ThemeColors }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} c={c} height={92} />
        ))}
      </div>
      <Skeleton c={c} height={280} />
    </div>
  );
}
