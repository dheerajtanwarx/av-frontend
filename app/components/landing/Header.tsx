"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { announcements, nav } from "../../lib/landing-data";

function BurgerIcon({ open }: { open: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" fill="none">
      {open ? (
        <>
          <path d="M5 5l12 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M17 5L5 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M3 6h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M3 11h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M3 16h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  // Lock body scroll and close on Escape while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <div className={`mobnav${open ? " open" : ""}`} aria-hidden={!open}>
      <div className="mobnav-scrim" onClick={onClose} />
      <nav className="mobnav-panel" aria-label="Main menu">
        <div className="mobnav-head">
          <span className="mark">AV CREATION</span>
          <button aria-label="Close menu" onClick={onClose}>
            <BurgerIcon open />
          </button>
        </div>
        {nav.map((n) => (
          <a
            key={n.label}
            href={n.href}
            className={n.hot ? "hot" : undefined}
            onClick={onClose}
          >
            {n.label}
          </a>
        ))}
      </nav>
    </div>
  );
}
import { AccountIcon, CartIcon, HeartIcon, SearchIcon } from "./Icons";
import { useCart } from "./CartContext";
import { useWishlist } from "./WishlistContext";
import { getSession, logout, type SessionUser } from "../../lib/api";

function firstName(user: SessionUser): string {
  return (user.name || user.email || "Account").trim().split(/\s+/)[0];
}

export function AccountMenu() {
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

  // close the menu on outside click
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

  // Before the session resolves, render a neutral link to avoid a flash.
  if (!loaded || !user) {
    return (
      <a href="/login" aria-label="Log in" className="acct-link">
        <AccountIcon />
      </a>
    );
  }

  return (
    <div className="acct" ref={ref}>
      <button aria-label="Account" onClick={() => setOpen((o) => !o)}>
        <AccountIcon />
        <span className="acct-name">{firstName(user)}</span>
      </button>
      {open && (
        <div className="acct-menu">
          <span className="acct-hello">Hi, {firstName(user)}</span>
          <a className="acct-profile" href="/profile">
            View profile
          </a>
          <a className="acct-profile" href="/my-orders">
            My orders
          </a>
          <a className="acct-profile" href="/wishlist">
            My wishlist
          </a>
          {user.role === "ADMIN" && (
            <a className="acct-profile acct-admin" href="/admin/reviews">
              Moderate reviews
            </a>
          )}
          <button className="acct-logout" onClick={handleLogout}>
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

function Marquee() {
  const run = (
    <span>
      {announcements.map((a, i) => (
        <span key={i} style={{ display: "inline-flex", gap: 54 }}>
          <span>{a}</span>
          <span className="dot">✦</span>
        </span>
      ))}
    </span>
  );
  return (
    <div className="announce">
      <div className="marquee">
        {run}
        {run}
      </div>
    </div>
  );
}

function HeaderSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = term.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
    setOpen(false);
  };

  return (
    <form className={`hsearch${open ? " open" : ""}`} onSubmit={submit} role="search">
      <input
        ref={inputRef}
        type="search"
        value={term}
        placeholder="Search the atelier…"
        onChange={(e) => setTerm(e.target.value)}
        onBlur={() => !term && setOpen(false)}
        aria-label="Search products"
        tabIndex={open ? 0 : -1}
      />
      <button
        type={open ? "submit" : "button"}
        aria-label="Search"
        onClick={() => {
          if (!open) setOpen(true);
        }}
      >
        <SearchIcon />
      </button>
    </form>
  );
}

export default function Header() {
  const { count, openDrawer } = useCart();
  const { count: wishCount } = useWishlist();
  const badgeRef = useRef<HTMLSpanElement>(null);
  const first = useRef(true);
  const [menuOpen, setMenuOpen] = useState(false);

  // bump animation whenever the cart count changes (skip first render)
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const el = badgeRef.current;
    if (el?.animate) {
      el.animate(
        [{ transform: "scale(1)" }, { transform: "scale(1.55)" }, { transform: "scale(1)" }],
        { duration: 360, easing: "ease-out" }
      );
    }
  }, [count]);

  return (
    <>
      <Marquee />
      <header>
        <div className="wrap topnav">
          <div className="navleft">
            <button
              className="navtoggle"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
            >
              <BurgerIcon open={false} />
            </button>
            <nav>
              {nav.map((n) => (
                <a key={n.label} href={n.href} className={n.hot ? "hot" : undefined}>
                  {n.label}
                </a>
              ))}
            </nav>
          </div>
          <a href="#" className="logo">
            <span className="mark">AV CREATION</span>
            <span className="sub">Jaipuri Atelier · Rajasthan</span>
          </a>
          <div className="acts">
            <HeaderSearch />
            <AccountMenu />
            <a className="wishlink" href="/wishlist" aria-label="Wishlist">
              <HeartIcon filled={wishCount > 0} />
              {wishCount > 0 && <span className="badge">{wishCount}</span>}
            </a>
            <button className="cart" aria-label="Cart" onClick={openDrawer}>
              <CartIcon />
              <span className="badge" ref={badgeRef}>
                {count}
              </span>
            </button>
          </div>
        </div>
      </header>
      <MobileNav open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
