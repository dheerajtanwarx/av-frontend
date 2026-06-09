import Link from "next/link";
import { CartIc } from "./icons";

/** Slim, focused header for the checkout & confirmation screens. */
export function CheckoutHeader({
  backHref,
  backLabel,
}: {
  backHref: string;
  backLabel: string;
}) {
  return (
    <header className="co-head">
      <div className="wrap bar">
        <Link href={backHref} className="back">
          {CartIc.arrowL} {backLabel}
        </Link>
        <Link href="/" className="logo">
          <span className="mark">AV CREATION</span>
          <span className="sub">Jaipuri Atelier · Rajasthan</span>
        </Link>
        <div className="secure">{CartIc.lock} Secure Checkout</div>
      </div>
    </header>
  );
}

export function SlimFooter() {
  return (
    <footer className="pfoot">
      <div className="wrap inner">
        <span className="mark">AV CREATION</span>
        <span>© 2026 · Hand-blocked in Jaipur, the Pink City</span>
        <div className="pay">
          <span>UPI</span>
          <span>Visa</span>
          <span>Mastercard</span>
          <span>Net Banking</span>
          <span>COD</span>
        </div>
      </div>
    </footer>
  );
}
