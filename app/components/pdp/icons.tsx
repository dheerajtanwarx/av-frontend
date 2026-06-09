/* ============================================================
   AV Creation — Product page icons (ported from pdp-parts.jsx)
   ============================================================ */
import type { ReactElement } from "react";

export const Ic: Record<string, ReactElement> = {
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  ),
  user: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  ),
  cart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 8h12l-1 12H7L6 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  ),
  zoom: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5M11 8v6M8 11h6" />
    </svg>
  ),
  heart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 20s-7-4.4-7-9.5A3.6 3.6 0 0 1 12 8a3.6 3.6 0 0 1 7 2.5C19 15.6 12 20 12 20Z" />
    </svg>
  ),
  plus: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  check: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path className="check" d="M5 12.5l4.2 4.5L19 7" />
    </svg>
  ),
  verify: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M12 3l2 2 3-.3.6 2.9L20 9l-1.4 2.5L20 14l-2.4 1.4L17 18l-3-.3-2 2-2-2-3 .3-.6-2.6L4 14l1.4-2.5L4 9l2.4-1.4L7 4.7 10 5z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  ship: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M3 7h13v9H3zM16 10h3l2 3v3h-5z" />
      <circle cx="7" cy="17" r="1.6" />
      <circle cx="18" cy="17" r="1.6" />
    </svg>
  ),
  scissor: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="6" cy="18" r="2.5" />
      <path d="M8 8l12 8M8 16L20 8" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
};

export function Stars({ n, className = "stars" }: { n: number; className?: string }) {
  const full = Math.floor(n);
  const half = n - full >= 0.5;
  const s = "★".repeat(full) + (half ? "★" : "") + "☆".repeat(5 - full - (half ? 1 : 0));
  return <span className={className}>{s}</span>;
}
