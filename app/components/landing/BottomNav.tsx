"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { SearchIcon, AccountIcon, CartIcon, HeartIcon } from "./Icons";
import { useCart } from "./CartContext";
import { useWishlist } from "./WishlistContext";

/* Home icon — kept local; the shared set has no house glyph. */
function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M4 11.5 12 5l8 6.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 10.5V19h12v-8.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Mobile-only bottom navigation. Lives in the thumb zone and replaces the
 * top hamburger drawer on phones. Purely presentational — it reuses the
 * existing cart/wishlist context (read-only) and the cart drawer opener.
 */
export default function BottomNav() {
  const pathname = usePathname();
  const { count, openDrawer } = useCart();
  const { count: wishCount } = useWishlist();

  // Hide the bar on the cart/checkout flow — those screens own their own
  // bottom CTA, and stacking two fixed bars would crowd the thumb zone.
  if (pathname.startsWith("/cart") || pathname.startsWith("/checkout")) return null;

  const isHome = pathname === "/";
  const onSearch = pathname.startsWith("/search");
  const onWish = pathname.startsWith("/wishlist");
  const onAcct =
    pathname.startsWith("/profile") ||
    pathname.startsWith("/my-orders") ||
    pathname.startsWith("/login");

  return (
    <nav className="botnav" aria-label="Primary">
      <Link className={`botnav-it${isHome ? " on" : ""}`} href="/" aria-current={isHome ? "page" : undefined}>
        <HomeIcon />
        <span>Home</span>
      </Link>
      <Link className={`botnav-it${onSearch ? " on" : ""}`} href="/search" aria-current={onSearch ? "page" : undefined}>
        <SearchIcon />
        <span>Search</span>
      </Link>
      <Link className={`botnav-it${onWish ? " on" : ""}`} href="/wishlist" aria-current={onWish ? "page" : undefined}>
        <span className="botnav-ic">
          <HeartIcon filled={wishCount > 0} />
          {wishCount > 0 && <span className="botnav-badge">{wishCount}</span>}
        </span>
        <span>Wishlist</span>
      </Link>
      <button className="botnav-it" type="button" onClick={openDrawer} aria-label="Open cart">
        <span className="botnav-ic">
          <CartIcon />
          {count > 0 && <span className="botnav-badge">{count}</span>}
        </span>
        <span>Cart</span>
      </button>
      <Link className={`botnav-it${onAcct ? " on" : ""}`} href="/profile" aria-current={onAcct ? "page" : undefined}>
        <AccountIcon />
        <span>Profile</span>
      </Link>
    </nav>
  );
}
