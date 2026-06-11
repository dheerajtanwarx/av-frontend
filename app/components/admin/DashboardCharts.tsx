"use client";

/* Dependency-free SVG charts for the admin dashboard. Responsive via a fixed
   viewBox + width:100% (preserveAspectRatio). Colours come from theme tokens so
   they track the rest of the admin UI. */

import type { DashboardDailyPoint, DashboardStatusCount } from "../../lib/api";

const STATUS_COLOR: Record<string, string> = {
  PLACED: "#b45309",
  CONFIRMED: "#1d4ed8",
  PROCESSING: "#c2410c",
  SHIPPED: "#0f766e",
  DELIVERED: "#15803d",
  CANCELLED: "#6b7280",
  RETURNED: "#9a3412",
};

function shortDate(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(
    new Date(iso + "T00:00:00")
  );
}

/** ~5 evenly spaced indices for x-axis ticks. */
function tickIndices(n: number): number[] {
  if (n <= 1) return [0];
  const count = Math.min(5, n);
  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    out.push(Math.round((i * (n - 1)) / (count - 1)));
  }
  return [...new Set(out)];
}

/* ── Line / area chart (Revenue Trend) ───────────────────── */

export function TrendLineChart({
  data,
  format,
}: {
  data: DashboardDailyPoint[];
  format: (n: number) => string;
}) {
  const W = 640;
  const H = 240;
  const padX = 14;
  const padTop = 24;
  const padBottom = 30;
  const innerW = W - padX * 2;
  const innerH = H - padTop - padBottom;

  const values = data.map((d) => d.revenue);
  const max = Math.max(1, ...values);
  const n = values.length;
  const stepX = n > 1 ? innerW / (n - 1) : 0;
  const x = (i: number) => padX + i * stepX;
  const y = (v: number) => padTop + innerH - (v / max) * innerH;

  const linePts = values.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const areaPts = `${padX},${padTop + innerH} ${linePts} ${x(n - 1)},${padTop + innerH}`;
  const peakIdx = values.indexOf(Math.max(...values));
  const gridY = [0, 0.5, 1];

  return (
    <svg className="admin-chart-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Revenue trend">
      <defs>
        <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--rani)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--rani)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {gridY.map((g) => {
        const gy = padTop + innerH - g * innerH;
        return (
          <g key={g}>
            <line x1={padX} y1={gy} x2={W - padX} y2={gy} className="admin-chart-gridline" />
            <text x={padX} y={gy - 4} className="admin-chart-axis">
              {format(max * g)}
            </text>
          </g>
        );
      })}

      <polygon points={areaPts} fill="url(#revFill)" />
      <polyline
        points={linePts}
        fill="none"
        stroke="var(--rani)"
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {values.map((v, i) =>
        i === peakIdx && max > 0 ? (
          <circle key={i} cx={x(i)} cy={y(v)} r={4} fill="var(--rani)" stroke="#fff" strokeWidth={1.5} />
        ) : null
      )}

      {tickIndices(n).map((i) => (
        <text key={i} x={x(i)} y={H - 8} className="admin-chart-axis" textAnchor="middle">
          {shortDate(data[i].date)}
        </text>
      ))}
    </svg>
  );
}

/* ── Bar chart (Sales Trend / orders per day) ────────────── */

export function TrendBarChart({ data }: { data: DashboardDailyPoint[] }) {
  const W = 640;
  const H = 240;
  const padX = 14;
  const padTop = 24;
  const padBottom = 30;
  const innerW = W - padX * 2;
  const innerH = H - padTop - padBottom;

  const values = data.map((d) => d.orders);
  const max = Math.max(1, ...values);
  const n = values.length;
  const slot = innerW / n;
  const barW = Math.min(26, slot * 0.6);
  const gridY = [0, 0.5, 1];

  return (
    <svg className="admin-chart-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Sales trend">
      {gridY.map((g) => {
        const gy = padTop + innerH - g * innerH;
        return (
          <g key={g}>
            <line x1={padX} y1={gy} x2={W - padX} y2={gy} className="admin-chart-gridline" />
            <text x={padX} y={gy - 4} className="admin-chart-axis">
              {Math.round(max * g)}
            </text>
          </g>
        );
      })}

      {values.map((v, i) => {
        const cx = padX + slot * i + slot / 2;
        const h = (v / max) * innerH;
        return (
          <rect
            key={i}
            x={cx - barW / 2}
            y={padTop + innerH - h}
            width={barW}
            height={h}
            rx={3}
            className="admin-chart-bar"
          >
            <title>
              {shortDate(data[i].date)}: {v} order{v === 1 ? "" : "s"}
            </title>
          </rect>
        );
      })}

      {tickIndices(n).map((i) => (
        <text
          key={i}
          x={padX + slot * i + slot / 2}
          y={H - 8}
          className="admin-chart-axis"
          textAnchor="middle"
        >
          {shortDate(data[i].date)}
        </text>
      ))}
    </svg>
  );
}

/* ── Orders by status (horizontal bars) ──────────────────── */

export function StatusBreakdown({ data }: { data: DashboardStatusCount[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <div className="admin-status-bars">
      {data.map((d) => {
        const pct = total > 0 ? Math.round((d.count / total) * 100) : 0;
        return (
          <div key={d.status} className="admin-status-bar-row">
            <span className="admin-status-bar-label">{d.status}</span>
            <div className="admin-status-bar-track">
              <div
                className="admin-status-bar-fill"
                style={{
                  width: `${(d.count / max) * 100}%`,
                  background: STATUS_COLOR[d.status] ?? "var(--rani)",
                }}
              />
            </div>
            <span className="admin-status-bar-count">
              {d.count}
              <span className="admin-status-bar-pct"> · {pct}%</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}
