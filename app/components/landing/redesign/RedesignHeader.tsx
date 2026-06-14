"use client";

import Link from "next/link";
import { Search, Heart, ShoppingBag } from "lucide-react";
import { useCart } from "../CartContext";
import { useWishlist } from "../WishlistContext";
import { AccountMenu } from "../Header";

/* Top-nav links for desktop. Mirrors the storefront nav but uses the short,
   editorial labels from the redesign ("Odhni", not "Jaipuri Odhni"). */
const links = [
  { label: "Odhni", href: "/category/jaipuri-odhni", hot: true },
  { label: "Lehenga", href: "/category/lehenga" },
  { label: "Saree", href: "/category/designer-saree" },
  { label: "Suits", href: "/category/suit-sets" },
  { label: "Dupatta", href: "/category/dupatta" },
];

/* shadcn/lucide line icons — 20px, 1.8 stroke. */
const SearchGlyph = () => <Search size={20} strokeWidth={1.8} />;
const HeartGlyph = () => <Heart size={20} strokeWidth={1.8} />;
const BagGlyph = () => <ShoppingBag size={20} strokeWidth={1.8} />;

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
          <AccountMenu />
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
