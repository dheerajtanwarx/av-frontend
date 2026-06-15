import Header from "../landing/Header";
import RedesignHeader from "../landing/redesign/RedesignHeader";
import MiniHeader from "../pdp/MiniHeader";
import { Skeleton, SkeletonText } from "./Skeleton";
import {
  ProductGridSkeleton,
  PageHeaderSkeleton,
  NavRowsSkeleton,
  PanelSkeleton,
  OrderCardSkeleton,
  AddressCardSkeleton,
  CartLineSkeleton,
} from "./patterns";

/* ============================================================
   PAGES — full-route loading skeletons.

   These compose the patterns + real page chrome (Header) so they
   can be dropped straight into a route's `loading.tsx`, a Suspense
   fallback, or a client component's loading branch. They reuse the
   exact scope/layout classes of each screen (`.av-lp`, `.cat-page`,
   `.pdp`, `.orders-page`, `.profile-page`…) so the resolved content
   slots into the same frame without shifting.
   ============================================================ */

/* ---- Home / landing ---- */
export function HomeSkeleton() {
  return (
    <div className="av-lp" aria-busy="true">
      <RedesignHeader />
      <Skeleton variant="box" className="av-skel-hero" radius={0} />
      <div className="lp-trustline">
        <Skeleton variant="line" height={12} width={280} style={{ margin: "0 auto" }} />
      </div>
      <section className="lp-section">
        <div className="lp-wrap">
          <PageHeaderSkeleton center titleWidth={240} />
          <ProductGridSkeleton count={8} className="lp-products" />
        </div>
      </section>
      <section className="lp-section tight">
        <div className="lp-wrap">
          <PageHeaderSkeleton center titleWidth={300} />
          <ProductGridSkeleton count={4} className="lp-products" />
        </div>
      </section>
    </div>
  );
}

/* ---- Collection / category ---- */
export function CollectionSkeleton({ count = 9 }: { count?: number }) {
  return (
    <main className="cat-page av-cat" aria-busy="true">
      <Header />
      <div className="cat-hero">
        <div className="wrap">
          <Skeleton variant="line" height={11} width={160} />
          <div style={{ height: 14 }} />
          <Skeleton variant="line" height={34} width={300} radius={4} />
          <div style={{ height: 10 }} />
          <Skeleton variant="line" height={13} width={150} />
        </div>
      </div>
      <div className="wrap">
        <div className="cat-bar">
          <Skeleton variant="line" height={13} width={90} />
          <Skeleton variant="pill" width={140} height={34} />
        </div>
        <ProductGridSkeleton count={count} className="prods cat-grid" />
      </div>
    </main>
  );
}

/* ---- Search results ---- */
export function SearchResultsSkeleton({ count = 8 }: { count?: number }) {
  return (
    <section className="search-results" aria-busy="true">
      <div className="cat-bar">
        <Skeleton variant="line" height={13} width={110} />
      </div>
      <ProductGridSkeleton count={count} className="prods cat-grid" />
    </section>
  );
}

/* Full search page (hero search bar + results) — for the route-level
   Suspense fallback before SearchView mounts. `withHeader` defaults to
   true; the /search route passes false because it renders Header itself
   outside the Suspense boundary. */
export function SearchPageSkeleton({ withHeader = true }: { withHeader?: boolean }) {
  return (
    <main className="search-page av-search" aria-busy="true">
      {withHeader && <Header />}
      <div className="search-hero">
        <div className="wrap">
          <Skeleton variant="line" height={11} width={140} />
          <div style={{ height: 16 }} />
          <Skeleton variant="box" height={54} radius={6} />
        </div>
      </div>
      <div className="wrap">
        <SearchResultsSkeleton />
      </div>
    </main>
  );
}

/* ---- Product detail (PDP) ---- */
export function ProductDetailSkeleton() {
  return (
    <div className="pdp av-pdp" aria-busy="true">
      <MiniHeader hot="" />
      <div className="crumb">
        <Skeleton variant="line" height={11} width={260} />
      </div>
      <div className="av-skel-pdp">
        <Skeleton variant="box" className="av-skel-pdp__gallery" radius={0} />
        <div className="av-skel-pdp__buy">
          <Skeleton variant="line" height={11} width={90} />
          <Skeleton variant="line" height={28} width="80%" radius={4} />
          <Skeleton variant="line" height={20} width={140} />
          <div style={{ height: 8 }} />
          <Skeleton variant="line" height={12} width={70} />
          <div className="av-skel-pdp__swatches">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="circle" width={34} height={34} />
            ))}
          </div>
          <Skeleton variant="line" height={12} width={70} />
          <div className="av-skel-pdp__sizes">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} variant="box" width={52} height={44} radius={4} />
            ))}
          </div>
          <div style={{ height: 8 }} />
          <Skeleton variant="btn" />
          <Skeleton variant="btn" />
          <SkeletonText lines={3} lastWidth="50%" />
        </div>
      </div>
    </div>
  );
}

/* ---- Wishlist ---- */
export function WishlistSkeleton({ count = 6 }: { count?: number }) {
  return (
    <main className="av wl-page" aria-busy="true">
      <Header />
      <section className="wl-shell">
        <div className="wl-head">
          <Skeleton variant="line" height={28} width={200} radius={4} />
          <div style={{ height: 8 }} />
          <Skeleton variant="line" height={13} width={150} />
        </div>
        <ProductGridSkeleton count={count} className="wl-grid" />
      </section>
    </main>
  );
}

/* ---- Cart ---- */
export function CartSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="app av" aria-busy="true">
      <Header />
      <div className="flow cartbody av-flow">
        <main className="wrap">
          <div className="page-head">
            <Skeleton variant="line" height={32} width={220} radius={4} />
            <div style={{ height: 8 }} />
            <Skeleton variant="line" height={13} width={170} />
          </div>
          <div className="cart-grid">
            <div className="cart-list">
              {Array.from({ length: lines }).map((_, i) => (
                <CartLineSkeleton key={i} />
              ))}
            </div>
            <div className="summary">
              <Skeleton variant="line" height={18} width={150} />
              <div style={{ height: 18 }} />
              <SkeletonText lines={4} gap={14} lastWidth="70%" />
              <div style={{ height: 18 }} />
              <Skeleton variant="btn" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ---- Profile (account home) ---- */
export function ProfileSkeleton() {
  return (
    <main className="av profile-page av-profile av-account" aria-busy="true">
      <Header />
      <section className="profile-shell">
        <header className="account-card">
          <Skeleton variant="circle" width={64} height={64} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
            <Skeleton variant="line" height={18} width="50%" />
            <Skeleton variant="line" height={13} width="65%" />
          </div>
          <Skeleton variant="pill" width={120} height={36} />
        </header>
        <NavRowsSkeleton count={4} />
        <div style={{ height: 8 }} />
        <Skeleton variant="btn" width={140} />
      </section>
    </main>
  );
}

/* ---- Account sub-screen (Edit / Settings) — chrome owned by
   AccountSubShell; this is just the body. ---- */
export function AccountFormSkeleton({ rows = 5 }: { rows?: number }) {
  return <PanelSkeleton rows={rows} withHeader />;
}

/* ---- Addresses (AddressBook body) ---- */
export function AddressBookSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="address-grid" aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <AddressCardSkeleton key={i} />
      ))}
    </div>
  );
}

/* ---- My Orders (list) ---- */
export function OrdersSkeleton({ count = 4 }: { count?: number }) {
  return (
    <main className="av orders-page" aria-busy="true">
      <Header />
      <section className="orders-shell">
        <header className="orders-hero">
          <Skeleton variant="line" height={11} width={90} />
          <div style={{ height: 10 }} />
          <Skeleton variant="line" height={30} width={220} radius={4} />
          <div style={{ height: 10 }} />
          <Skeleton variant="line" height={13} width={200} />
        </header>
        <div className="orders-tabs">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="pill" width={110} height={36} />
          ))}
        </div>
        <div className="orders-list">
          {Array.from({ length: count }).map((_, i) => (
            <OrderCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </main>
  );
}

/* ---- Order detail ---- */
export function OrderDetailSkeleton() {
  return (
    <main className="av order-detail-page" aria-busy="true">
      <Header />
      <section className="order-detail-shell">
        <header className="orders-hero">
          <Skeleton variant="line" height={11} width={120} />
          <div style={{ height: 10 }} />
          <Skeleton variant="line" height={28} width={260} radius={4} />
        </header>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {Array.from({ length: 2 }).map((_, i) => (
            <CartLineSkeleton key={i} />
          ))}
        </div>
        <div style={{ height: 20 }} />
        <PanelSkeleton rows={4} withHeader={false} />
      </section>
    </main>
  );
}
