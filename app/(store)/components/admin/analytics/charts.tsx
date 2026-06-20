"use client";

/* ============================================================
   Analytics dashboard primitives — "OPS" dark console look:
   pure-black canvas, coral accent, big uppercase-labelled KPI
   numbers, ranked bar lists, thick donut rings. Themed via a
   passed `ThemeColors` object so the same components render in
   light and (default) dark mode. All numbers use tabular figures
   to avoid layout shift.
   ============================================================ */

import { ReactNode, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

/* ----------------------------- theme ----------------------------- */

export interface ThemeColors {
  bg: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  muted: string;
  faint: string;
  border: string;
  grid: string;
  primary: string;
  accent: string;
  positive: string;
  negative: string;
  series: string[];
  glow: string;
}

export const THEMES: Record<"light" | "dark", ThemeColors> = {
  /* Dark = the OPS console look. This is the default. */
  dark: {
    bg: "#080808",
    surface: "#0F0F11",
    surfaceAlt: "#161618",
    text: "#F4F4F5",
    muted: "#8A8A90",
    faint: "#56565C",
    border: "#222226",
    grid: "#1A1A1D",
    primary: "#F5603A",
    accent: "#FBBF24",
    positive: "#3FCF8E",
    negative: "#F87171",
    series: ["#F5603A", "#5BA8F5", "#3FCF8E", "#A78BFA", "#FBBF24", "#38BDF8", "#FB7185"],
    glow: "rgba(245,96,58,0.45)",
  },
  light: {
    bg: "#F4F5F7",
    surface: "#FFFFFF",
    surfaceAlt: "#F1F3F6",
    text: "#0F172A",
    muted: "#64748B",
    faint: "#94A3B8",
    border: "#E4E7EC",
    grid: "#EEF1F5",
    primary: "#EA580C",
    accent: "#B45309",
    positive: "#059669",
    negative: "#DC2626",
    series: ["#EA580C", "#2563EB", "#059669", "#7C3AED", "#D97706", "#0EA5E9", "#E11D48"],
    glow: "rgba(234,88,12,0.30)",
  },
};

/* ----------------------------- formatters ----------------------------- */

export const inr = (a: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(a || 0);

export const inrCompact = (a: number) => {
  if (a >= 1e7) return `₹${(a / 1e7).toFixed(1)}Cr`;
  if (a >= 1e5) return `₹${(a / 1e5).toFixed(1)}L`;
  if (a >= 1e3) return `₹${Math.round(a / 1e3)}k`;
  return `₹${Math.round(a || 0)}`;
};

export const num = (a: number) => new Intl.NumberFormat("en-IN").format(a || 0);
export const pct = (a: number) => `${((a || 0) * 100).toFixed(1)}%`;
export const dur = (s: number) => {
  const m = Math.floor((s || 0) / 60);
  const sec = Math.round((s || 0) % 60);
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
};

/* ----------------------------- layout bits ----------------------------- */

export function SectionHeading({
  c,
  title,
  subtitle,
}: {
  c: ThemeColors;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-1 mt-2">
      <h2 className="text-lg font-bold tracking-tight" style={{ color: c.text }}>
        {title}
      </h2>
      {subtitle && (
        <p className="mt-0.5 text-sm" style={{ color: c.muted }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

/* ----------------------------- cards ----------------------------- */

export function Card({
  c,
  title,
  subtitle,
  action,
  children,
  className = "",
}: {
  c: ThemeColors;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border p-5 sm:p-6 ${className}`}
      style={{ background: c.surface, borderColor: c.border }}
    >
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && (
              <h3 className="text-[15px] font-semibold tracking-tight" style={{ color: c.text }}>
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="mt-0.5 text-xs" style={{ color: c.muted }}>
                {subtitle}
              </p>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function KpiCard({
  c,
  label,
  value,
  deltaPct,
  hint,
}: {
  c: ThemeColors;
  label: string;
  value: string;
  deltaPct?: number | null;
  hint?: string;
}) {
  const hasDelta = deltaPct != null && Number.isFinite(deltaPct);
  const up = (deltaPct ?? 0) >= 0;
  return (
    <div
      className="rounded-2xl border p-5"
      style={{ background: c.surface, borderColor: c.border }}
    >
      <div className="flex items-start justify-between gap-2">
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.12em]"
          style={{ color: c.muted }}
        >
          {label}
        </p>
        {hasDelta ? (
          <span
            className="text-xs font-semibold tabular-nums"
            style={{ color: up ? c.positive : c.negative }}
          >
            {up ? "▲" : "▼"} {Math.abs(deltaPct!).toFixed(1)}%
          </span>
        ) : (
          <span className="text-base leading-none" style={{ color: c.faint }}>
            —
          </span>
        )}
      </div>
      <p
        className="mt-3 text-[2rem] font-bold leading-none tabular-nums"
        style={{ color: c.text, fontVariantNumeric: "tabular-nums" }}
      >
        {value}
      </p>
      <p className="mt-2 text-xs" style={{ color: c.muted }}>
        {hint ?? "vs previous period"}
      </p>
    </div>
  );
}

/* ----------------------------- tooltip ----------------------------- */

function tipStyle(c: ThemeColors) {
  return {
    background: c.surface,
    border: `1px solid ${c.border}`,
    borderRadius: 10,
    color: c.text,
    fontSize: 12,
    boxShadow: "0 8px 30px -12px rgba(0,0,0,0.7)",
  };
}

/* ----------------------------- charts ----------------------------- */

interface TrendDatum {
  day: string;
  [k: string]: number | string;
}

export function TrendArea({
  c,
  data,
  dataKey,
  height = 280,
  money = false,
  color,
}: {
  c: ThemeColors;
  data: TrendDatum[];
  dataKey: string;
  height?: number;
  money?: boolean;
  color?: string;
}) {
  const stroke = color ?? c.primary;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity={0.4} />
            <stop offset="100%" stopColor={stroke} stopOpacity={0.01} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={c.grid} vertical={false} />
        <XAxis
          dataKey="day"
          tick={{ fill: c.muted, fontSize: 11 }}
          tickFormatter={(d: string) => d.slice(5)}
          minTickGap={24}
          axisLine={{ stroke: c.border }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: c.muted, fontSize: 11 }}
          tickFormatter={(v: number) => (money ? inrCompact(v) : num(v))}
          axisLine={false}
          tickLine={false}
          width={money ? 56 : 40}
        />
        <Tooltip
          contentStyle={tipStyle(c)}
          formatter={(v) => (money ? inr(Number(v)) : num(Number(v)))}
          labelStyle={{ color: c.muted }}
          cursor={{ stroke: c.border }}
        />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={stroke}
          strokeWidth={2.5}
          fill={`url(#grad-${dataKey})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function TrendMultiLine({
  c,
  data,
  keys,
  height = 280,
}: {
  c: ThemeColors;
  data: TrendDatum[];
  keys: { key: string; label: string }[];
  height?: number;
}) {
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-end gap-4">
        {keys.map((k, i) => (
          <span key={k.key} className="flex items-center gap-1.5 text-xs" style={{ color: c.muted }}>
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: c.series[i % c.series.length] }}
            />
            {k.label}
          </span>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={c.grid} vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fill: c.muted, fontSize: 11 }}
            tickFormatter={(d: string) => d.slice(5)}
            minTickGap={24}
            axisLine={{ stroke: c.border }}
            tickLine={false}
          />
          <YAxis tick={{ fill: c.muted, fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
          <Tooltip contentStyle={tipStyle(c)} labelStyle={{ color: c.muted }} cursor={{ stroke: c.border }} />
          {keys.map((k, i) => (
            <Line
              key={k.key}
              type="monotone"
              dataKey={k.key}
              name={k.label}
              stroke={c.series[i % c.series.length]}
              strokeWidth={2.5}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ---------- ranked bar list (the OPS "Activity by category" look) ---------- */

export function HBar({
  c,
  data,
  color,
  ranked = true,
  max,
}: {
  c: ThemeColors;
  data: { label: string; value: number }[];
  color?: string;
  ranked?: boolean;
  /** override the bar denominator; defaults to the largest value */
  max?: number;
}) {
  if (data.length === 0) return <Empty c={c} />;
  const fill = color ?? c.primary;
  const denom = Math.max(max ?? 0, ...data.map((d) => d.value), 1);
  return (
    <ol className="flex flex-col gap-3.5">
      {data.map((d, i) => (
        <li key={`${d.label}-${i}`}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="flex min-w-0 items-baseline gap-2.5">
              {ranked && (
                <span
                  className="w-4 shrink-0 text-right text-xs tabular-nums"
                  style={{ color: c.faint }}
                >
                  {i + 1}
                </span>
              )}
              <span className="truncate text-sm" style={{ color: c.text }}>
                {d.label}
              </span>
            </span>
            <span className="shrink-0 text-sm tabular-nums" style={{ color: c.text }}>
              {num(d.value)}
            </span>
          </div>
          <div
            className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full"
            style={{ background: c.surfaceAlt, marginLeft: ranked ? "1.625rem" : 0, width: ranked ? "calc(100% - 1.625rem)" : "100%" }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.max((d.value / denom) * 100, d.value > 0 ? 3 : 0)}%`,
                background: fill,
              }}
            />
          </div>
        </li>
      ))}
    </ol>
  );
}

export function Donut({
  c,
  data,
  height = 240,
  centerLabel = "TOTAL",
  money = false,
}: {
  c: ThemeColors;
  data: { label: string; value: number }[];
  height?: number;
  centerLabel?: string;
  money?: boolean;
}) {
  if (data.length === 0) return <Empty c={c} />;
  const total = data.reduce((s, d) => s + d.value, 0);
  const fmt = (v: number) => (money ? inrCompact(v) : num(v));
  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
      <div className="relative shrink-0" style={{ width: height, height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius="68%"
              outerRadius="98%"
              paddingAngle={data.length > 1 ? 2 : 0}
              stroke="none"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={c.series[i % c.series.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tipStyle(c)} formatter={(v) => fmt(Number(v))} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold tabular-nums" style={{ color: c.text }}>
            {fmt(total)}
          </span>
          <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: c.faint }}>
            {centerLabel}
          </span>
        </div>
      </div>
      <ul className="flex w-full flex-col gap-2.5 text-sm">
        {data.map((d, i) => (
          <li key={d.label} className="flex items-center gap-2.5">
            <span
              className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: c.series[i % c.series.length] }}
            />
            <span className="truncate" style={{ color: c.text }}>
              {d.label}
            </span>
            <span className="ml-auto tabular-nums" style={{ color: c.text }}>
              {fmt(d.value)}
            </span>
            <span className="w-10 shrink-0 text-right text-xs tabular-nums" style={{ color: c.faint }}>
              {total > 0 ? `${Math.round((d.value / total) * 100)}%` : "0%"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ----------------------------- funnel ----------------------------- */

export function Funnel({
  c,
  stages,
}: {
  c: ThemeColors;
  stages: { name: string; count: number; pctOfTop: number; pctOfPrev: number }[];
}) {
  if (stages.every((s) => s.count === 0)) return <Empty c={c} />;
  return (
    <ol className="flex flex-col gap-3">
      {stages.map((s, i) => (
        <li key={s.name}>
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span style={{ color: c.text }}>{s.name}</span>
            <span className="tabular-nums" style={{ color: c.muted }}>
              {num(s.count)}
              {i > 0 && (
                <span className="ml-2 font-semibold" style={{ color: s.pctOfPrev < 0.5 ? c.negative : c.positive }}>
                  {(s.pctOfPrev * 100).toFixed(0)}%
                </span>
              )}
            </span>
          </div>
          <div className="h-8 w-full overflow-hidden rounded-lg" style={{ background: c.surfaceAlt }}>
            <div
              className="h-full rounded-lg transition-all duration-500"
              style={{
                width: `${Math.max(s.pctOfTop * 100, s.count > 0 ? 4 : 0)}%`,
                background: c.series[i % c.series.length],
              }}
            />
          </div>
        </li>
      ))}
    </ol>
  );
}

/* ----------------------------- table ----------------------------- */

export interface Column<T> {
  key: keyof T;
  label: string;
  align?: "left" | "right";
  render?: (row: T) => ReactNode;
  sortable?: boolean;
}

export function DataTable<T extends Record<string, unknown>>({
  c,
  columns,
  rows,
  initialSort,
}: {
  c: ThemeColors;
  columns: Column<T>[];
  rows: T[];
  initialSort?: { key: keyof T; dir: "asc" | "desc" };
}) {
  const [sort, setSort] = useState(initialSort);
  const sorted = [...rows];
  if (sort) {
    sorted.sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      if (typeof av === "number" && typeof bv === "number")
        return sort.dir === "asc" ? av - bv : bv - av;
      return sort.dir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }
  if (rows.length === 0) return <Empty c={c} />;

  const toggle = (key: keyof T) =>
    setSort((prev) =>
      prev?.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" }
    );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ color: c.muted }} className="text-left">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={`whitespace-nowrap pb-3 text-[11px] font-semibold uppercase tracking-[0.08em] ${
                  col.align === "right" ? "text-right" : "text-left"
                } ${col.sortable ? "cursor-pointer select-none" : ""}`}
                onClick={col.sortable ? () => toggle(col.key) : undefined}
                aria-sort={
                  sort?.key === col.key ? (sort.dir === "asc" ? "ascending" : "descending") : undefined
                }
              >
                {col.label}
                {sort?.key === col.key && (sort.dir === "asc" ? " ▲" : " ▼")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, ri) => (
            <tr key={ri} style={{ borderTop: `1px solid ${c.border}` }}>
              {columns.map((col) => (
                <td
                  key={String(col.key)}
                  className={`py-2.5 tabular-nums ${col.align === "right" ? "text-right" : "text-left"}`}
                  style={{ color: c.text }}
                >
                  {col.render ? col.render(row) : String(row[col.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ----------------------------- states ----------------------------- */

export function Empty({ c, label = "No data yet" }: { c: ThemeColors; label?: string }) {
  return (
    <div
      className="flex h-40 items-center justify-center rounded-xl text-sm"
      style={{ color: c.muted, background: c.surfaceAlt }}
    >
      {label}
    </div>
  );
}

export function Skeleton({ c, height = 100 }: { c: ThemeColors; height?: number }) {
  return (
    <div
      className="animate-pulse rounded-2xl"
      style={{ height, background: c.surfaceAlt }}
      aria-hidden
    />
  );
}
