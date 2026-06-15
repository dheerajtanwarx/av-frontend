import { Skeleton } from "./Skeleton";

/* ============================================================
   ADMIN — skeletons for the dashboard/admin surface.

   The admin panel uses the same theme tokens as the storefront,
   so these compose the shared `Skeleton` primitive (no separate
   shimmer system). They mirror the admin layouts — tables,
   stacked cards, the stat-card grid, chart cards and forms — so
   loading states never fall back to "Loading…" text.
   ============================================================ */

/* Skeleton rows for an admin <table>. Returns a fragment of <tr>s so
   it drops directly into an existing <tbody> and inherits the real
   column widths. The first column is widest (the entity name), the
   last is a short actions/number cell. */
export function AdminTableRowsSkeleton({
  rows = 6,
  cols = 5,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} className="av-skel-trow" aria-hidden="true">
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c}>
              <Skeleton
                variant="line"
                height={13}
                width={c === 0 ? "75%" : c === cols - 1 ? 56 : "50%"}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/* Stacked card list — orders, reviews, any vertical admin list. */
export function AdminCardListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="av-skel-admin-cards" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div className="av-skel-admin-card" key={i}>
          <div className="av-skel-admin-card__main">
            <Skeleton variant="line" height={14} width="38%" />
            <Skeleton variant="line" height={12} width="62%" />
            <Skeleton variant="line" height={12} width="28%" />
          </div>
          <Skeleton variant="pill" width={90} height={30} />
        </div>
      ))}
    </div>
  );
}

/* Stat-card grid — dashboard KPI cards. Reuses the real
   `.admin-stat-grid` container for identical columns. */
export function AdminStatGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="admin-stat-grid" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div className="av-skel-admin-stat" key={i}>
          <Skeleton variant="line" height={11} width="55%" />
          <Skeleton variant="line" height={26} width="70%" radius={4} />
          <Skeleton variant="line" height={10} width="40%" />
        </div>
      ))}
    </div>
  );
}

/* Chart card placeholders — dashboard charts row. */
export function AdminChartsSkeleton() {
  return (
    <div className="av-skel-admin-charts" aria-hidden="true">
      {[false, false, true].map((wide, i) => (
        <div
          className={`av-skel-admin-chart${wide ? " av-skel-admin-chart--wide" : ""}`}
          key={i}
        >
          <Skeleton variant="line" height={13} width={160} />
          <Skeleton variant="box" height={wide ? 180 : 140} radius={8} />
        </div>
      ))}
    </div>
  );
}

/* Generic admin panel — detail screens, forms, settings. */
export function AdminPanelSkeleton({
  rows = 5,
  withTitle = true,
}: {
  rows?: number;
  withTitle?: boolean;
}) {
  return (
    <div className="av-skel-admin-panel" aria-hidden="true">
      {withTitle && <Skeleton variant="line" height={16} width={180} />}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Skeleton variant="line" height={11} width={120} />
          <Skeleton variant="line" height={16} width={`${55 + ((i * 13) % 35)}%`} />
        </div>
      ))}
    </div>
  );
}

/* Full admin-page fallback (Suspense fallbacks / detail routes):
   a heading stub plus the chosen body skeleton. */
export function AdminPageSkeleton({
  body = "cards",
}: {
  body?: "cards" | "table" | "panel" | "form";
}) {
  return (
    <section className="admin-page" aria-busy="true">
      <header className="admin-page-head">
        <Skeleton variant="line" height={22} width={220} radius={4} />
        <div style={{ height: 8 }} />
        <Skeleton variant="line" height={13} width={320} />
      </header>
      {body === "cards" && <AdminCardListSkeleton />}
      {body === "panel" && <AdminPanelSkeleton />}
      {body === "form" && <AdminPanelSkeleton rows={6} />}
      {body === "table" && (
        <div className="av-skel-admin-cards">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="box" height={44} radius={6} />
          ))}
        </div>
      )}
    </section>
  );
}
