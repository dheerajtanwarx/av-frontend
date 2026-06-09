"use client";

import { useEffect, useRef } from "react";
import { announcements, nav } from "../../lib/landing-data";
import { AccountIcon, CartIcon, SearchIcon } from "./Icons";
import { useCart } from "./CartContext";

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
            <button aria-label="Account">
              <AccountIcon />
            </button>
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
