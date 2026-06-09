"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useCart } from "../landing/CartContext";
import { Ic } from "./icons";

const LINKS = ["Lehenga", "Jaipuri Odhni", "Saree", "Suits", "Dupatta"];

export default function MiniHeader({ hot }: { hot: string }) {
  const { count } = useCart();
  const badgeRef = useRef<HTMLSpanElement>(null);
  const first = useRef(true);

  // bump the badge whenever the cart count changes (skip first render)
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const el = badgeRef.current;
    el?.animate?.(
      [{ transform: "scale(1)" }, { transform: "scale(1.55)" }, { transform: "scale(1)" }],
      { duration: 500, easing: "cubic-bezier(.2,.8,.2,1)" }
    );
  }, [count]);

  return (
    <header className="ph-head">
      <nav>
        {LINKS.map((l) => (
          <Link key={l} href="/" className={l === hot ? "hot" : undefined}>
            {l}
          </Link>
        ))}
      </nav>
      <Link href="/" className="ph-logo">
        <span className="mark">AV CREATION</span>
        <span className="sub">Jaipuri Atelier · Rajasthan</span>
      </Link>
      <div className="ph-acts">
        <button aria-label="Search">{Ic.search}</button>
        <button aria-label="Account">{Ic.user}</button>
        <button className="ph-cart" aria-label="Cart">
          {Ic.cart}
          <span className="badge" ref={badgeRef}>
            {count}
          </span>
        </button>
      </div>
    </header>
  );
}
