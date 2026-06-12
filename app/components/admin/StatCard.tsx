"use client";

/* Animated KPI card shared by the admin dashboard and reports. Staggered
   spring entrance, count-up value, hover lift, and — when a daily series is
   supplied — a viewport-drawn sparkline plus a period-over-period trend badge.
   All reveals honour prefers-reduced-motion via the inner primitives. */

import { motion, useReducedMotion } from "motion/react";
import { AnimatedNumber } from "./AnimatedNumber";

/** Period-over-period change: second half of the series vs the first half. */
export function trendPct(series: number[]): number | null {
  if (series.length < 4) return null;
  const mid = Math.floor(series.length / 2);
  const first = series.slice(0, mid).reduce((a, b) => a + b, 0);
  const second = series.slice(mid).reduce((a, b) => a + b, 0);
  if (first === 0) return second > 0 ? 100 : null;
  return ((second - first) / first) * 100;
}

/** Tiny viewport-drawn sparkline for cards that have a daily series. */
function Sparkline({ series, accent }: { series: number[]; accent: string }) {
  const reduce = useReducedMotion();
  const W = 96;
  const H = 28;
  const max = Math.max(1, ...series);
  const n = series.length;
  const step = n > 1 ? W / (n - 1) : 0;
  const pts = series
    .map((v, i) => `${i * step},${H - (v / max) * (H - 2) - 1}`)
    .join(" ");
  return (
    <svg className="admin-spark" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden>
      <motion.polyline
        points={pts}
        fill="none"
        stroke={`var(--spark-${accent})`}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: reduce ? 0 : 1.1, delay: reduce ? 0 : 0.5, ease: "easeInOut" }}
      />
    </svg>
  );
}

function TrendBadge({ pct }: { pct: number }) {
  const up = pct >= 0;
  return (
    <motion.span
      className={`admin-stat-trend ${up ? "up" : "down"}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.7, type: "spring", stiffness: 320, damping: 18 }}
    >
      <svg viewBox="0 0 12 12" className="admin-stat-trend-arrow" aria-hidden>
        <path d={up ? "M6 2l4 5H2z" : "M6 10L2 5h8z"} fill="currentColor" />
      </svg>
      {Math.abs(pct).toFixed(1)}%
    </motion.span>
  );
}

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

export function StatCard({
  index,
  label,
  value,
  format,
  accent,
  icon: Icon,
  series,
}: {
  index: number;
  label: string;
  value: number;
  format: (n: number) => string;
  accent: string;
  icon?: (p: { className?: string }) => React.ReactElement;
  series?: number[];
}) {
  const pct = series ? trendPct(series) : null;
  return (
    <motion.div
      className={`admin-stat-card accent-${accent}`}
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="show"
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      {Icon && (
        <div className="admin-stat-icon">
          <Icon className="admin-stat-icon-svg" />
        </div>
      )}
      <div className="admin-stat-meta">
        <span className="admin-stat-label">{label}</span>
        <AnimatedNumber
          className="admin-stat-value"
          value={value}
          format={format}
          delay={index * 0.08}
        />
        {pct != null && (
          <span className="admin-stat-foot">
            <TrendBadge pct={pct} />
            <span className="admin-stat-foot-note">vs prev. period</span>
          </span>
        )}
      </div>
      {series && series.length > 1 && <Sparkline series={series} accent={accent} />}
    </motion.div>
  );
}
