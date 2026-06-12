"use client";

/* Dependency-light interactive SVG charts for the admin dashboard. Responsive
   via a fixed viewBox + width:100% (preserveAspectRatio). Colours come from
   theme tokens so they track the rest of the admin UI.

   Motion adds the premium touches: line-drawing on the revenue trend, growth on
   the sales bars, staggered fills on the status breakdown, plus hover tooltips
   with a tracking crosshair. All reveals are viewport-triggered and respect
   prefers-reduced-motion. */

import { useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import type { DashboardDailyPoint, DashboardStatusCount } from "../../lib/api";
import { AnimatedNumber } from "./AnimatedNumber";

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

/** Map a pointer event over an SVG to the nearest data index. */
function indexFromPointer(
  e: React.PointerEvent<SVGElement>,
  W: number,
  padX: number,
  stepX: number,
  n: number
): number {
  const rect = e.currentTarget.getBoundingClientRect();
  const relX = ((e.clientX - rect.left) / rect.width) * W;
  if (stepX <= 0) return 0;
  return Math.max(0, Math.min(n - 1, Math.round((relX - padX) / stepX)));
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

  const wrapRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapRef, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();
  const [hover, setHover] = useState<number | null>(null);

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
  const drawn = reduce || inView;

  return (
    <div className="admin-chart-plot" ref={wrapRef}>
      <svg
        className="admin-chart-svg"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Revenue trend"
        onPointerMove={(e) => setHover(indexFromPointer(e, W, padX, stepX, n))}
        onPointerLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--rani)" stopOpacity="0.26" />
            <stop offset="100%" stopColor="var(--rani)" stopOpacity="0" />
          </linearGradient>
          <filter id="revGlow" x="-20%" y="-40%" width="140%" height="180%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
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

        <motion.polygon
          points={areaPts}
          fill="url(#revFill)"
          initial={{ opacity: 0 }}
          animate={drawn ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: reduce ? 0 : 0.9 }}
        />
        <motion.polyline
          points={linePts}
          fill="none"
          stroke="var(--rani)"
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
          filter="url(#revGlow)"
          initial={{ pathLength: 0 }}
          animate={drawn ? { pathLength: 1 } : { pathLength: 0 }}
          transition={{ duration: reduce ? 0 : 1.5, ease: [0.4, 0, 0.2, 1] }}
        />

        {/* Peak marker with a gentle pulse */}
        {max > 0 && (
          <motion.circle
            cx={x(peakIdx)}
            cy={y(values[peakIdx])}
            r={4}
            fill="var(--rani)"
            stroke="#fff"
            strokeWidth={1.5}
            initial={{ scale: 0, opacity: 0 }}
            animate={drawn ? { scale: 1, opacity: 1 } : { scale: 0 }}
            transition={{ delay: reduce ? 0 : 1.4, type: "spring", stiffness: 320, damping: 14 }}
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
          />
        )}

        {/* Hover crosshair + point */}
        {hover != null && (
          <g pointerEvents="none">
            <line
              x1={x(hover)}
              y1={padTop}
              x2={x(hover)}
              y2={padTop + innerH}
              className="admin-chart-crosshair"
            />
            <circle cx={x(hover)} cy={y(values[hover])} r={5} className="admin-chart-hover-dot" />
          </g>
        )}

        {tickIndices(n).map((i) => (
          <text key={i} x={x(i)} y={H - 8} className="admin-chart-axis" textAnchor="middle">
            {shortDate(data[i].date)}
          </text>
        ))}
      </svg>

      {hover != null && (
        <ChartTooltip
          leftPct={(x(hover) / W) * 100}
          topPct={(y(values[hover]) / H) * 100}
          title={shortDate(data[hover].date)}
          rows={[
            { label: "Revenue", value: format(values[hover]) },
            { label: "Orders", value: String(data[hover].orders) },
          ]}
        />
      )}
    </div>
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

  const wrapRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapRef, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();
  const [hover, setHover] = useState<number | null>(null);

  const values = data.map((d) => d.orders);
  const max = Math.max(1, ...values);
  const n = values.length;
  const slot = innerW / n;
  const barW = Math.min(26, slot * 0.6);
  const gridY = [0, 0.5, 1];
  const grow = reduce || inView;

  const cx = (i: number) => padX + slot * i + slot / 2;

  return (
    <div className="admin-chart-plot" ref={wrapRef}>
      <svg
        className="admin-chart-svg"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Sales trend"
        onPointerMove={(e) =>
          setHover(Math.max(0, Math.min(n - 1, Math.floor(
            (((e.clientX - e.currentTarget.getBoundingClientRect().left) /
              e.currentTarget.getBoundingClientRect().width) * W - padX) / slot
          ))))
        }
        onPointerLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id="barFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--rani)" />
            <stop offset="100%" stopColor="var(--rani-deep)" />
          </linearGradient>
        </defs>

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
          const h = (v / max) * innerH;
          return (
            <motion.rect
              key={i}
              x={cx(i) - barW / 2}
              y={padTop + innerH - h}
              width={barW}
              height={h}
              rx={3}
              className="admin-chart-bar"
              fill={hover === i ? "var(--rani-deep)" : "url(#barFill)"}
              initial={{ scaleY: 0, opacity: 0 }}
              animate={grow ? { scaleY: 1, opacity: 1 } : { scaleY: 0 }}
              transition={{
                duration: reduce ? 0 : 0.6,
                delay: reduce ? 0 : 0.15 + i * 0.025,
                ease: [0.34, 1.56, 0.64, 1], // slight overshoot
              }}
              style={{ transformBox: "fill-box", transformOrigin: "bottom" }}
            />
          );
        })}

        {tickIndices(n).map((i) => (
          <text key={i} x={cx(i)} y={H - 8} className="admin-chart-axis" textAnchor="middle">
            {shortDate(data[i].date)}
          </text>
        ))}
      </svg>

      {hover != null && (
        <ChartTooltip
          leftPct={(cx(hover) / W) * 100}
          topPct={((padTop + innerH - (values[hover] / max) * innerH) / H) * 100}
          title={shortDate(data[hover].date)}
          rows={[
            { label: "Orders", value: `${values[hover]}` },
          ]}
        />
      )}
    </div>
  );
}

/* ── Orders by status (horizontal bars) ──────────────────── */

export function StatusBreakdown({ data }: { data: DashboardStatusCount[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapRef, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const max = Math.max(1, ...data.map((d) => d.count));
  const total = data.reduce((s, d) => s + d.count, 0);
  const grow = reduce || inView;

  return (
    <div className="admin-status-bars" ref={wrapRef}>
      {data.map((d, i) => {
        const pct = total > 0 ? Math.round((d.count / total) * 100) : 0;
        const color = STATUS_COLOR[d.status] ?? "var(--rani)";
        return (
          <motion.div
            key={d.status}
            className="admin-status-bar-row"
            initial={{ opacity: 0, x: -12 }}
            animate={grow ? { opacity: 1, x: 0 } : { opacity: 0 }}
            transition={{ duration: 0.45, delay: reduce ? 0 : i * 0.06 }}
          >
            <span className="admin-status-bar-label">{d.status}</span>
            <div className="admin-status-bar-track">
              <motion.div
                className="admin-status-bar-fill"
                style={{ background: color }}
                initial={{ width: 0 }}
                animate={grow ? { width: `${(d.count / max) * 100}%` } : { width: 0 }}
                transition={{
                  duration: reduce ? 0 : 0.9,
                  delay: reduce ? 0 : 0.1 + i * 0.06,
                  ease: [0.16, 1, 0.3, 1],
                }}
              />
            </div>
            <span className="admin-status-bar-count">
              <AnimatedNumber value={d.count} delay={0.1 + i * 0.06} duration={1} />
              <span className="admin-status-bar-pct"> · {pct}%</span>
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ── Shared hover tooltip ────────────────────────────────── */

function ChartTooltip({
  leftPct,
  topPct,
  title,
  rows,
}: {
  leftPct: number;
  topPct: number;
  title: string;
  rows: { label: string; value: string }[];
}) {
  return (
    <motion.div
      className="admin-chart-tooltip"
      style={{ left: `${leftPct}%`, top: `${topPct}%` }}
      initial={{ opacity: 0, y: 6, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
    >
      <span className="admin-chart-tooltip-title">{title}</span>
      {rows.map((r) => (
        <span key={r.label} className="admin-chart-tooltip-row">
          <span className="admin-chart-tooltip-key">{r.label}</span>
          <span className="admin-chart-tooltip-val">{r.value}</span>
        </span>
      ))}
    </motion.div>
  );
}
