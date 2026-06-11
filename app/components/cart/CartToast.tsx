"use client";

import { useCart } from "../landing/CartContext";

/** Global "added to cart" toast. Rendered once near the cart drawer so any
    quick-add (product cards on landing / category / search) can confirm the add
    without popping the cart drawer open. Clicking it opens the drawer. */
export default function CartToast() {
  const { toast, toastVisible, closeToast, openDrawer } = useCart();

  return (
    <div className={`cart-toast${toastVisible ? " show" : ""}`} role="status" aria-live="polite">
      <button className="cart-toast-close" onClick={closeToast} aria-label="Dismiss">
        ×
      </button>
      <div className="cart-toast-thumb">
        {toast?.thumb && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={toast.thumb} alt="" />
        )}
      </div>
      <div className="cart-toast-info">
        <div className="cart-toast-ok">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 13l4 4L19 7" />
          </svg>
          Added to cart
        </div>
        <div className="cart-toast-name">{toast?.name ?? ""}</div>
        <div className="cart-toast-variant">{toast?.variant ?? ""}</div>
        <button
          className="cart-toast-go"
          onClick={() => {
            closeToast();
            openDrawer();
          }}
        >
          View bag →
        </button>
      </div>
    </div>
  );
}
