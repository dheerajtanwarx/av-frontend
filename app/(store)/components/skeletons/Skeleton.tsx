import type { CSSProperties } from "react";

/* ============================================================
   Skeleton — the one primitive every loading state is built from.

   Pure & presentational (no hooks, no "use client"), so it can be
   rendered from server components (loading.tsx, Suspense fallbacks)
   and client components alike without bloating either bundle.

   <Skeleton variant="line" width="70%" />
   <Skeleton variant="box" style={{ aspectRatio: "3 / 4" }} />
   <Skeleton variant="circle" width={48} height={48} />
   <Skeleton variant="btn" />
   ============================================================ */

export type SkeletonVariant = "line" | "box" | "circle" | "btn" | "pill";

export interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: number | string;
  height?: number | string;
  /** Override border-radius (e.g. a rounded image tile). */
  radius?: number | string;
  className?: string;
  style?: CSSProperties;
}

export function Skeleton({
  variant = "line",
  width,
  height,
  radius,
  className = "",
  style,
}: SkeletonProps) {
  const composedStyle: CSSProperties = {
    width,
    height,
    ...(radius !== undefined ? { borderRadius: radius } : null),
    ...style,
  };

  return (
    <span
      className={`av-skel av-skel--${variant} ${className}`.trim()}
      style={composedStyle}
      aria-hidden="true"
    />
  );
}

/* A stack of text lines — the most common composition. The final
   line is shortened so it reads like a real paragraph tail. */
export function SkeletonText({
  lines = 3,
  gap = 8,
  lastWidth = "60%",
  lineHeight = 12,
  className = "",
  style,
}: {
  lines?: number;
  gap?: number | string;
  lastWidth?: number | string;
  lineHeight?: number | string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      className={`av-skel-text ${className}`.trim()}
      style={{ display: "flex", flexDirection: "column", gap, ...style }}
    >
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="line"
          height={lineHeight}
          width={i === lines - 1 ? lastWidth : "100%"}
        />
      ))}
    </span>
  );
}
