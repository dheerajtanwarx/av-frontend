"use client";

import { useEffect, useRef, useState } from "react";
import { announcements, nav } from "../../lib/landing-data";
import { AccountIcon, CartIcon, SearchIcon } from "./Icons";
import { useCart } from "./CartContext";
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

export default function Header() {
  const { count, openDrawer } = useCart();
  const badgeRef = useRef<HTMLSpanElement>(null);
  const first = useRef(true);

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
          <nav>
            {nav.map((n) => (
              <a key={n.label} href={n.href} className={n.hot ? "hot" : undefined}>
                {n.label}
              </a>
            ))}
          </nav>
          <a href="#" className="logo">
            <span className="mark">AV CREATION</span>
            <span className="sub">Jaipuri Atelier · Rajasthan</span>
          </a>
          <div className="acts">
            <button aria-label="Search">
              <SearchIcon />
            </button>
            <AccountMenu />
            <button className="cart" aria-label="Cart" onClick={openDrawer}>
              <CartIcon />
              <span className="badge" ref={badgeRef}>
                {count}
              </span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
