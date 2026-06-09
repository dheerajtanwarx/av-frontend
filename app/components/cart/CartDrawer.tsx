"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCart } from "../landing/CartContext";
import { inr } from "../../lib/cart-data";
import { CartIc } from "./icons";

/** Global slide-out mini-cart. Mounted once in the root layout and
    opened from the storefront header's cart icon. */
export default function CartDrawer() {
  const { drawerOpen, closeDrawer, items, setQty, remove, subtotal } = useCart();
  const router = useRouter();

  /* lock body scroll while the drawer is open */
  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  /* close on Escape */
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeDrawer();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen, closeDrawer]);

  const goto = (href: string) => {
    closeDrawer();
    router.push(href);
  };

  return (
    <div className="flow">
      <div className={"scrim" + (drawerOpen ? " show" : "")} onClick={closeDrawer} />
      <aside className={"drawer" + (drawerOpen ? " show" : "")} aria-hidden={!drawerOpen}>
        <div className="dhead">
          <div className="dt">
            Your Bag <span>{items.length} {items.length === 1 ? "piece" : "pieces"}</span>
          </div>
          <button className="x" onClick={closeDrawer} aria-label="Close">
            ×
          </button>
        </div>

        {items.length === 0 ? (
          <div className="dempty">
            <div className="ring">{CartIc.bag}</div>
            <p>Your bag is empty</p>
          </div>
        ) : (
          <>
            <div className="dbody">
              {items.map((i) => (
                <div className="dline" key={i.id}>
                  <div className="dp">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={i.img} alt={i.name} />
                  </div>
                  <div>
                    <div className="dn">{i.name}</div>
                    <div className="dv">
                      {i.color.name} · {i.madeToMeasure ? "Made to measure" : i.size}
                    </div>
                    <div className="dq">
                      <div className="mini">
                        <button onClick={() => setQty(i.id, i.qty - 1)} aria-label="Decrease">
                          −
                        </button>
                        <span className="n">{i.qty}</span>
                        <button onClick={() => setQty(i.id, i.qty + 1)} aria-label="Increase">
                          +
                        </button>
                      </div>
                      <button className="rm" onClick={() => remove(i.id)}>
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="dpr">{inr(i.price * i.qty)}</div>
                </div>
              ))}
            </div>
            <div className="dfoot">
              <div className="strow">
                <span className="l">Subtotal</span>
                <span className="v">{inr(subtotal)}</span>
              </div>
              <div className="note">
                Shipping & taxes calculated at checkout · Made-to-order pieces ship in 3–4 weeks
              </div>
              <button className="vc" onClick={() => goto("/checkout")}>
                {CartIc.lock} Secure Checkout
              </button>
              <button className="vb" onClick={() => goto("/cart")}>
                View Full Bag
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
