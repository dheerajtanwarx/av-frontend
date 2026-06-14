"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { House } from "lucide-react";
import { SearchIcon, AccountIcon, CartIcon, HeartIcon } from "./Icons";
import { useCart } from "./CartContext";
import { useWishlist } from "./WishlistContext";
import { getSession, logout, type SessionUser } from "../../lib/api";

function firstName(user: SessionUser): string {
  return (user.name || user.email || "Account").trim().split(/\s+/)[0];
}

/**
 * Profile tab. When signed in it opens the account menu upward (the same set
 * of links the header dropdown shows); when signed out it links straight to
 * login. Replaces the old plain link that only went to /profile.
 */
function AccountTab({ active }: { active: boolean }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    getSession().then((u) => {
      if (alive) {
        setUser(u);
        setLoaded(true);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  // close on outside tap
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  async function handleLogout() {
    try {
      await logout();
    } finally {
      setUser(null);
      setOpen(false);
    }
  }

  // Signed out (or still resolving) — go straight to login.
  if (!loaded || !user) {
    return (
      <Link
        className={`botnav-it${active ? " on" : ""}`}
        href="/login"
        aria-current={active ? "page" : undefined}
      >
        <AccountIcon />
        <span>Profile</span>
      </Link>
    );
  }

  return (
    <div className="botnav-acct" ref={ref}>
      {open && (
        <div className="botnav-acct-menu" role="menu">
          <span className="botnav-acct-hello">Hi, {firstName(user)}</span>
          <Link className="botnav-acct-item" href="/profile" onClick={() => setOpen(false)}>
            View profile
          </Link>
          <Link className="botnav-acct-item" href="/my-orders" onClick={() => setOpen(false)}>
            My orders
          </Link>
          <Link className="botnav-acct-item" href="/wishlist" onClick={() => setOpen(false)}>
            My wishlist
          </Link>
          {user.role === "ADMIN" && (
            <Link
              className="botnav-acct-item botnav-acct-admin"
              href="/admin/dashboard"
              onClick={() => setOpen(false)}
            >
              Admin Dashboard
            </Link>
          )}
          <button className="botnav-acct-item botnav-acct-logout" onClick={handleLogout}>
            Log out
          </button>
        </div>
      )}
      <button
        type="button"
        className={`botnav-it${open || active ? " on" : ""}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <AccountIcon />
        <span>Profile</span>
      </button>
    </div>
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
        <House />
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
      <AccountTab active={onAcct} />
    </nav>
  );
}
