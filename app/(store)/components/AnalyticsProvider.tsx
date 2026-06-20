"use client";

import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { onCLS, onINP, onLCP, onFCP, onTTFB, type Metric } from "web-vitals";
import { track, trackPageView } from "../lib/analytics";

/* ============================================================
   Fires a `page_view` on every client navigation (App Router).
   ------------------------------------------------------------
   usePathname + useSearchParams together catch both path changes
   and ?query changes (e.g. search, filters). useSearchParams forces
   a Suspense boundary in Next 16, so the actual tracker lives in a
   child wrapped below. Mount once in the store layout.
   ============================================================ */

function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const last = useRef<string | null>(null);

  useEffect(() => {
    const qs = searchParams.toString();
    const full = qs ? `${pathname}?${qs}` : pathname;
    // Guard against duplicate fires (React strict mode / identical re-renders).
    if (last.current === full) return;
    last.current = full;
    trackPageView(full);
  }, [pathname, searchParams]);

  return null;
}

/* Web Vitals — registered once per page load. Each metric reports when it's
   finalised (LCP/FCP on first paint, INP/CLS on hide/unload). Values: ms for
   timing metrics, unitless for CLS. The server buckets by name + rating. */
function WebVitalsReporter() {
  useEffect(() => {
    const report = (m: Metric) =>
      track("web_vital", {
        name: m.name,
        value: Math.round(m.name === "CLS" ? m.value * 1000 : m.value),
        rating: m.rating,
        path: window.location.pathname,
      });
    onCLS(report);
    onINP(report);
    onLCP(report);
    onFCP(report);
    onTTFB(report);
  }, []);
  return null;
}

export default function AnalyticsProvider() {
  return (
    <>
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
      <WebVitalsReporter />
    </>
  );
}
