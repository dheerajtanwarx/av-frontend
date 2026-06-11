"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCart } from "../landing/CartContext";
import { ensureAuthenticated } from "../../lib/auth-guard";
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

  const checkout = async () => {
    closeDrawer();
    if (await ensureAuthenticated("/checkout")) router.push("/checkout");
  };

  return (
    <div className="flow">
      <div
        className={"scrim" + (drawerOpen ? " show" : "")}
        onClick={closeDrawer}
        style={drawerOpen ? undefined : { display: "none" }}
      />
      <aside
        className={"drawer" + (drawerOpen ? " show" : "")}
        aria-hidden={!drawerOpen}
        style={drawerOpen ? undefined : { transform: "translateX(100%)", visibility: "hidden" }}
      >
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
            <div className="sadbag mini" aria-hidden="true">
              <svg className="bag" viewBox="0 0 120 120" fill="none">
                <path
                  className="body"
                  d="M26 40h68l-6 64a8 8 0 0 1-8 7H40a8 8 0 0 1-8-7L26 40Z"
                  stroke="currentColor"
                  strokeWidth="3.2"
                  strokeLinejoin="round"
                />
                <path
                  d="M44 40v-6a16 16 0 0 1 32 0v6"
                  stroke="currentColor"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />
                <circle className="eye" cx="49" cy="64" r="3.4" fill="currentColor" />
                <circle className="eye" cx="71" cy="64" r="3.4" fill="currentColor" />
                <path
                  d="M50 84c3-5 17-5 20 0"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <p>Your bag is empty</p>
            <span className="sub">Add a piece you love and it’ll appear here.</span>
            <button className="shop" onClick={() => goto("/")}>
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="dbody">
              {items.map((i) => (
                <div className="dline" key={i.id}>
                  <div className="dp">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={i.img || undefined} alt={i.name} />
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
                        <button
                          onClick={() => setQty(i.id, i.qty + 1)}
                          disabled={i.stock !== undefined && i.qty >= i.stock}
                          aria-label="Increase"
                        >
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
              <button className="vc" onClick={checkout}>
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
