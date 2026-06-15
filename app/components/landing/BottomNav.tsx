"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { House } from "lucide-react";
import { SearchIcon, AccountIcon, CartIcon } from "./Icons";
import { useCart } from "./CartContext";
import { getSession } from "../../lib/api";

/**
 * Profile tab. Goes straight to the dedicated account page when signed in, or
 * to login otherwise. No dropdown — tapping Profile always lands on a real
 * page, matching the Amazon / Nykaa / Ajio mobile pattern.
 */
function AccountTab({ active }: { active: boolean }) {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let alive = true;
    getSession().then((u) => {
      if (alive) setSignedIn(!!u);
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <Link
      className={`botnav-it${active ? " on" : ""}`}
      href={signedIn ? "/profile" : "/login"}
      aria-current={active ? "page" : undefined}
    >
      <AccountIcon />
      <span>Profile</span>
    </Link>
  );
}

/**
 * Mobile-only bottom navigation. Lives in the thumb zone and replaces the
 * top hamburger drawer on phones. Purely presentational — it reuses the
 * existing cart context (read-only) and the cart drawer opener.
 */
export default function BottomNav() {
  const pathname = usePathname();
  const { count, openDrawer } = useCart();

  // Hide the bar on the cart/checkout flow — those screens own their own
  // bottom CTA, and stacking two fixed bars would crowd the thumb zone.
  if (pathname.startsWith("/cart") || pathname.startsWith("/checkout")) return null;

  const isHome = pathname === "/";
  const onSearch = pathname.startsWith("/search");
  const onAcct =
    pathname.startsWith("/profile") ||
    pathname.startsWith("/my-orders") ||
    pathname.startsWith("/login");

  return (
    <nav className="botnav" aria-label="Primary">
      <Link className={`botnav-it${isHome ? " on" : ""}`} href="/" aria-current={isHome ? "page" : undefined}>
        <House />
        <span>Home</span>
      </Link>
      <Link className={`botnav-it${onSearch ? " on" : ""}`} href="/search" aria-current={onSearch ? "page" : undefined}>
        <SearchIcon />
        <span>Search</span>
      </Link>
      <button className="botnav-it" type="button" onClick={openDrawer} aria-label="Open cart">
        <span className="botnav-ic">
          <CartIcon />
          {count > 0 && <span className="botnav-badge">{count}</span>}
        </span>
        <span>Cart</span>
      </button>
      <AccountTab active={onAcct} />
    </nav>
  );
}
