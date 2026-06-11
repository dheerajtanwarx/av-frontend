"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "../landing/Header";
import { useCart } from "../landing/CartContext";
import { ensureAuthenticated } from "../../lib/auth-guard";
import { SlimFooter } from "./CheckoutChrome";
import { CartIc } from "./icons";
import { inr, type CartItem } from "../../lib/cart-data";

/* ---------- promo code box ---------- */
function PromoBox() {
  const { promo, applyPromo, removePromo } = useCart();
  const [code, setCode] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const apply = async () => {
    if (busy) return;
    setBusy(true);
    const res = await applyPromo(code);
    setBusy(false);
    if (res.ok) {
      setErr(null);
      setCode("");
    } else {
      setErr(res.error ?? "Invalid code.");
    }
  };

  if (promo) {
    return (
      <div className="promo">
        <div className="applied">
          <span className="code">
            {CartIc.tag} {promo.code} — {promo.label}
          </span>
          <button className="rm" onClick={removePromo}>
            Remove
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="promo">
      <div className="field">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && apply()}
          placeholder="Gift card or promo code"
        />
        <button className="apply" onClick={apply} disabled={busy}>
          {busy ? "…" : "Apply"}
        </button>
      </div>
      {err && (
        <div className="msg err">
          {CartIc.info} {err}
        </div>
      )}
    </div>
  );
}

/* ---------- order summary ---------- */
function OrderSummary() {
  const { subtotal, savings, discount, total, count, hasUnavailableItems } = useCart();
  const router = useRouter();
  const checkout = async () => {
    if (hasUnavailableItems) return;
    if (await ensureAuthenticated("/checkout")) router.push("/checkout");
  };
  return (
    <div className="summary">
      <h3>Order Summary</h3>
      <div className="gold-rule" />
      <div className="sum-rows">
        <div className="r">
          <span>
            Subtotal <span className="muted">· {count} {count === 1 ? "item" : "items"}</span>
          </span>
          <span className="v">{inr(subtotal)}</span>
        </div>
        {savings > 0 && (
          <div className="r disc">
            <span>Atelier savings</span>
            <span className="v">−{inr(savings)}</span>
          </div>
        )}
        {discount > 0 && (
          <div className="r disc">
            <span>Promo discount</span>
            <span className="v">−{inr(discount)}</span>
          </div>
        )}
        <div className="r">
          <span>Insured shipping</span>
          <span className="free">Free</span>
        </div>
        <div className="r">
          <span>Estimated delivery</span>
          <span className="muted">3–4 weeks · made to order</span>
        </div>
      </div>
      <PromoBox />
      <div className="sum-total">
        <div className="l">
          Total <span>Inclusive of all taxes</span>
        </div>
        <div className="amt">{inr(total)}</div>
      </div>
      {hasUnavailableItems && (
        <div className="msg err" style={{ marginBottom: 10 }}>
          {CartIc.info} Some items are sold out or low on stock. Please remove or
          reduce them to continue.
        </div>
      )}
      <button
        type="button"
        onClick={checkout}
        className="checkout-cta"
        disabled={hasUnavailableItems}
        aria-disabled={hasUnavailableItems}
      >
        {CartIc.lock} Proceed to Checkout
      </button>
      <div className="sum-trust">
        <span className="ti">{CartIc.shield} Secure payment</span>
        <span className="ti">{CartIc.scissor} Made to measure</span>
      </div>
      <div className="sum-pay">
        <span>UPI</span>
        <span>Visa</span>
        <span>Mastercard</span>
        <span>COD</span>
      </div>
    </div>
  );
}

/* ---------- line item ---------- */
function CartLine({ item }: { item: CartItem }) {
  const { setQty, remove } = useCart();
  const [leaving, setLeaving] = useState(false);
  const doRemove = () => {
    setLeaving(true);
    setTimeout(() => remove(item.id), 360);
  };
  const outOfStock = item.stock !== undefined && item.stock <= 0;
  const href = item.slug ? `/product/${item.slug}` : null;
  return (
    <div className={"citem" + (leaving ? " removing" : "") + (outOfStock ? " oos" : "")}>
      {href ? (
        <Link href={href} className="pic">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.img || undefined} alt={item.name} />
          {item.madeToMeasure && <span className="mtm">Made to Order</span>}
          {outOfStock && <span className="oos-tag">Out of stock</span>}
        </Link>
      ) : (
        <div className="pic">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.img || undefined} alt={item.name} />
          {item.madeToMeasure && <span className="mtm">Made to Order</span>}
          {outOfStock && <span className="oos-tag">Out of stock</span>}
        </div>
      )}
      <div className="mid">
        {href ? (
          <Link href={href} className="nm">
            {item.name}
          </Link>
        ) : (
          <div className="nm">{item.name}</div>
        )}
        <div className="ty">{item.type}</div>
        <div className="opts">
          <span className="opt">
            <span className="sw" style={{ background: item.color.hex }} />
            {item.color.name}
          </span>
          {item.madeToMeasure ? (
            <span className="opt mtm">{CartIc.scissor} Custom — Made to Measure</span>
          ) : (
            <span className="opt">Size · {item.size}</span>
          )}
        </div>
        {item.note && (
          <div className="stylenote">
            {CartIc.needle} {item.note}
          </div>
        )}
        <div className="row-actions">
          <button onClick={doRemove}>{CartIc.trash} Remove</button>
          <button>{CartIc.heart} Move to wishlist</button>
        </div>
      </div>
      <div className="right">
        <div>
          <div className="price">{inr(item.price * item.qty)}</div>
          {item.was && <div className="was">{inr(item.was * item.qty)}</div>}
        </div>
        <div className="qty">
          <button onClick={() => setQty(item.id, item.qty - 1)} disabled={item.qty <= 1}>
            −
          </button>
          <span className="n">{item.qty}</span>
          <button
            onClick={() => setQty(item.id, item.qty + 1)}
            disabled={item.stock !== undefined && item.qty >= item.stock}
          >
            +
          </button>
        </div>
        {outOfStock ? (
          <div className="stock-note oos">Out of stock</div>
        ) : item.stock !== undefined && item.qty > item.stock ? (
          <div className="stock-note oos">{`Only ${item.stock} left — reduce qty`}</div>
        ) : (
          item.stock !== undefined &&
          item.stock <= 5 && (
            <div className="stock-note low">{`Only ${item.stock} left`}</div>
          )
        )}
      </div>
    </div>
  );
}

/* ---------- empty state ---------- */
function EmptyCart() {
  return (
    <div className="empty">
      <div className="sadbag" aria-hidden="true">
        <span className="shadow" />
        <svg className="bag" viewBox="0 0 120 120" fill="none">
          {/* bag body */}
          <path
            className="body"
            d="M26 40h68l-6 64a8 8 0 0 1-8 7H40a8 8 0 0 1-8-7L26 40Z"
            stroke="currentColor"
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
          {/* handle */}
          <path
            d="M44 40v-6a16 16 0 0 1 32 0v6"
            stroke="currentColor"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          {/* sad eyes */}
          <circle className="eye" cx="49" cy="64" r="3.4" fill="currentColor" />
          <circle className="eye" cx="71" cy="64" r="3.4" fill="currentColor" />
          {/* frown */}
          <path
            d="M50 84c3-5 17-5 20 0"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
        <span className="tear" />
      </div>
      <h2>Your bag is empty</h2>
      <p>
        Not a single treasure yet. Explore the atelier’s hand-crafted lehengas, sarees and heirloom
        jewellery — your bag is waiting to be filled.
      </p>
      <Link href="/" className="cta">
        {CartIc.arrowL} Continue Shopping
      </Link>
    </div>
  );
}

/* ---------- page ---------- */
export default function CartView() {
  const { items, count, refreshStock } = useCart();

  /* Revalidate live stock when the cart page loads so sold-out / reduced-stock
     items are flagged before the shopper reaches checkout. */
  useEffect(() => {
    refreshStock();
  }, [refreshStock]);

  /* If CSS failed to load (Turbopack race or network hiccup), reload once. */
  useEffect(() => {
    // Check both the announce bar (landing.css) and cart body (cart.css)
    // to detect a partial or full CSS load failure.
    const announce = document.querySelector(".announce") as HTMLElement | null;
    const cartBody = document.querySelector(".flow.cartbody") as HTMLElement | null;
    const announceBg = announce ? getComputedStyle(announce).backgroundColor : "";
    const cartBg = cartBody ? getComputedStyle(cartBody).backgroundColor : "";
    // .announce gets a dark background; .flow.cartbody gets the soft slate.
    // Transparent on either means that stylesheet didn't load.
    const transparent = (v: string) =>
      !v || v === "rgba(0, 0, 0, 0)" || v === "transparent";
    if (transparent(announceBg) || transparent(cartBg)) {
      if (!sessionStorage.getItem("cart-css-reload")) {
        sessionStorage.setItem("cart-css-reload", "1");
        window.location.reload();
      }
    } else {
      sessionStorage.removeItem("cart-css-reload");
    }
  }, []);

  return (
    <div className="app av">
      <Header />
      <div className="flow cartbody">
      <main className="wrap">
        <div className="page-head">
          <h1>
            Your <em>Bag</em>
          </h1>
          <div className="meta">
            {count > 0
              ? `${count} ${count === 1 ? "piece" : "pieces"} · reserved for you`
              : "Empty for now"}
          </div>
        </div>
        {items.length === 0 ? (
          <EmptyCart />
        ) : (
          <>
            <div className="cart-grid">
              <div className="cart-list">
                <div className="lh">
                  <span className="t">
                    <b>{count}</b> {count === 1 ? "item" : "items"} in your bag
                  </span>
                </div>
                {items.map((i) => (
                  <CartLine key={i.id} item={i} />
                ))}
                <div className="cart-foot">
                  <Link href="/" className="cont">
                    {CartIc.arrowL} Continue Shopping
                  </Link>
                  <span className="assured">
                    {CartIc.shield} Insured & gift-boxed from our Jaipur atelier
                  </span>
                </div>
              </div>
              <OrderSummary />
            </div>
          </>
        )}
      </main>
      <SlimFooter />
      </div>
    </div>
  );
}
