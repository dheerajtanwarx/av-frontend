"use client";

import Link from "next/link";
import { useCart } from "../CartContext";
import { useWishlist } from "../WishlistContext";

/* Top-nav links for desktop. Mirrors the storefront nav but uses the short,
   editorial labels from the redesign ("Odhni", not "Jaipuri Odhni"). */
const links = [
  { label: "Odhni", href: "/category/jaipuri-odhni", hot: true },
  { label: "Lehenga", href: "/category/lehenga" },
  { label: "Saree", href: "/category/designer-saree" },
  { label: "Suits", href: "/category/suit-sets" },
  { label: "Dupatta", href: "/category/dupatta" },
];

/* shadcn/lucide-style line icons — 24px grid, 1.8 stroke, round caps/joins. */
const ICON = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};
function SearchGlyph() {
  return (
    <svg {...ICON}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
function AccountGlyph() {
  return (
    <svg {...ICON}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function HeartGlyph() {
  return (
    <svg {...ICON}>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}
function BagGlyph() {
  return (
    <svg {...ICON}>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

export default function RedesignHeader() {
  const { count, openDrawer } = useCart();
  const { count: wishCount } = useWishlist();

  return (
    <header className="lp-header">
      <div className="lp-announce">
        Hand-blocked in Jaipur · Shipping complimentary over ₹2,999
      </div>

      {/* Mobile: brand only — navigation lives in the thumb-zone bottom nav. */}
      <div className="lp-brandbar">
        <Link href="/" className="lp-wordmark">
          AV CREATION
        </Link>
        <div className="lp-sub">Jaipur Atelier · Est 1998</div>
      </div>

      {/* Desktop: full top nav. */}
      <nav className="lp-topnav" aria-label="Primary">
        <div className="lp-topnav-links">
          {links.map((l) => (
            <Link key={l.label} href={l.href} className={l.hot ? "hot" : undefined}>
              {l.label}
            </Link>
          ))}
        </div>
        <Link href="/" className="lp-wordmark">
          AV CREATION
        </Link>
        <div className="lp-topnav-acts">
          <Link href="/search" className="lp-icon-btn" aria-label="Search">
            <SearchGlyph />
          </Link>
          <Link href="/profile" className="lp-icon-btn" aria-label="Account">
            <AccountGlyph />
          </Link>
          <Link href="/wishlist" className="lp-icon-btn" aria-label="Wishlist">
            <HeartGlyph />
            {wishCount > 0 && <span className="lp-badge">{wishCount}</span>}
          </Link>
          <button type="button" className="lp-icon-btn" aria-label="Cart" onClick={openDrawer}>
            <BagGlyph />
            {count > 0 && <span className="lp-badge">{count}</span>}
          </button>
        </div>
      </nav>
    </header>
  );
}
