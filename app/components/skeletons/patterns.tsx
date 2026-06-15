import { Skeleton, SkeletonText } from "./Skeleton";

/* ============================================================
   PATTERNS — small, reusable, content-only skeletons.

   These never render page chrome (Header/Footer). They reuse the
   real layout container classes wherever possible (e.g. the grids
   `.lp-products`, `.prods.cat-grid`, `.wl-grid`) so the skeletons
   inherit the exact spacing/columns of the resolved content and
   there is no layout shift on swap.
   ============================================================ */

/* ---- Product card — matches the storefront RedesignProductCard ---- */
export function ProductCardSkeleton() {
  return (
    <div className="av-skel-card">
      <Skeleton variant="box" className="av-skel-card__img" />
      <div className="av-skel-card__lines">
        <Skeleton variant="line" height={13} width="80%" />
        <Skeleton variant="line" height={11} width="50%" />
        <Skeleton variant="line" height={13} width="40%" />
      </div>
      <Skeleton variant="btn" className="av-skel-card__btn" height={44} />
    </div>
  );
}

/* ---- Product grid — N cards inside any real grid container ----
   Pass the same className the route uses for its product grid so
   the column count + gaps are identical (default = landing grid). */
export function ProductGridSkeleton({
  count = 8,
  className = "lp-products",
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={className} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/* ---- Section / page header — kicker + title + subtitle ---- */
export function PageHeaderSkeleton({
  center = false,
  titleWidth = 280,
  subtitle = true,
}: {
  center?: boolean;
  titleWidth?: number | string;
  subtitle?: boolean;
}) {
  return (
    <div className={`av-skel-head${center ? " av-skel-head--center" : ""}`}>
      <Skeleton variant="line" height={11} width={120} />
      <Skeleton variant="line" height={30} width={titleWidth} radius={4} />
      {subtitle && <Skeleton variant="line" height={13} width={180} />}
    </div>
  );
}

/* ---- Stacked nav rows — account menu, settings lists ---- */
export function NavRowsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="av-skel-rows" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div className="av-skel-row" key={i}>
          <Skeleton variant="circle" width={40} height={40} />
          <div className="av-skel-row__text">
            <Skeleton variant="line" height={13} width="40%" />
            <Skeleton variant="line" height={11} width="65%" />
          </div>
          <Skeleton variant="line" height={16} width={16} />
        </div>
      ))}
    </div>
  );
}

/* ---- Generic panel — form / details card ---- */
export function PanelSkeleton({
  rows = 4,
  withHeader = true,
}: {
  rows?: number;
  withHeader?: boolean;
}) {
  return (
    <div className="av-skel-panel" aria-hidden="true">
      {withHeader && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Skeleton variant="line" height={14} width={140} />
          <Skeleton variant="pill" width={92} />
        </div>
      )}
      {Array.from({ length: rows }).map((_, i) => (
        <div className="av-skel-field" key={i}>
          <Skeleton variant="line" height={11} width={110} />
          <Skeleton variant="line" height={16} width={`${50 + ((i * 17) % 40)}%`} />
        </div>
      ))}
    </div>
  );
}

/* ---- Order card — matches `.order-card` in My Orders ---- */
export function OrderCardSkeleton() {
  return (
    <div className="av-skel-order" aria-hidden="true">
      <Skeleton variant="box" className="av-skel-order__thumb" />
      <div className="av-skel-order__body">
        <div className="av-skel-order__row">
          <Skeleton variant="line" height={13} width={120} />
          <Skeleton variant="pill" width={84} />
        </div>
        <div className="av-skel-order__row">
          <Skeleton variant="line" height={12} width="55%" />
          <Skeleton variant="line" height={14} width={70} />
        </div>
      </div>
    </div>
  );
}

/* ---- Address card — rendered inside the real `.address-card` ---- */
export function AddressCardSkeleton() {
  return (
    <div className="address-card" aria-hidden="true">
      <Skeleton variant="line" height={15} width="55%" />
      <div style={{ marginTop: 12 }}>
        <SkeletonText lines={2} lastWidth="70%" lineHeight={12} />
      </div>
      <div style={{ marginTop: 12 }}>
        <Skeleton variant="line" height={12} width="40%" />
      </div>
    </div>
  );
}

/* ---- Cart line — matches a `.citem` row ---- */
export function CartLineSkeleton() {
  return (
    <div className="av-skel-cart-line" aria-hidden="true">
      <Skeleton variant="box" className="av-skel-cart-line__pic" />
      <div className="av-skel-cart-line__mid">
        <Skeleton variant="line" height={15} width="70%" />
        <Skeleton variant="line" height={12} width="40%" />
        <Skeleton variant="line" height={12} width="55%" />
        <div style={{ display: "flex", gap: 14, marginTop: 6 }}>
          <Skeleton variant="line" height={12} width={64} />
          <Skeleton variant="line" height={12} width={96} />
        </div>
      </div>
      <div
        className="av-skel-cart-line__right"
        style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 14 }}
      >
        <Skeleton variant="line" height={15} width={70} />
        <Skeleton variant="pill" width={96} height={36} />
      </div>
    </div>
  );
}
