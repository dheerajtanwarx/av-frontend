"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check } from "lucide-react";
import { useCart } from "../landing/CartContext";
import { CheckoutHeader, SlimFooter } from "./CheckoutChrome";
import { CartIc } from "./icons";
import { inr } from "../../lib/cart-data";
import { getSession } from "../../lib/api";

export default function ConfirmationView() {
  const router = useRouter();
  // The provider restores `lastOrder` from sessionStorage on mount, so this
  // survives a hard refresh. We give that hydration a brief grace window
  // before deciding there is genuinely no order to show.
  const { lastOrder: order } = useCart();
  const [graceOver, setGraceOver] = useState(false);
  const [sessionUser, setSessionUser] = useState<any | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setGraceOver(true), 1200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let mounted = true;
    getSession().then((u) => {
      if (mounted) setSessionUser(u);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (graceOver && !order) router.replace("/cart");
  }, [graceOver, order, router]);

  if (!order) return null;

  const a = order.address;
  const timeline = [
    {
      tt: "Order confirmed",
      td: "We’ve received your order and sent a confirmation to your email.",
      when: "Just now",
      cur: true,
    },
    {
      tt: "Stylist measurement call",
      td: "Our atelier stylist will reach out to collect your exact measurements.",
      when: "Within 48 hours",
    },
    {
      tt: "Crafted in our Jaipur atelier",
      td: "Hand zardozi & gota-patti embroidered by our master karigars.",
      when: "3–4 weeks",
    },
    {
      tt: "Dispatched & insured delivery",
      td: "Gift-boxed in a muslin pouch and shipped to your door.",
      when: "Est. " + order.eta,
    },
  ];

  return (
    <div className="app flow av-flow">
      <CheckoutHeader backHref="/" backLabel="Back to Shop" />
      <main className="wrap confirm">
        <div className="hero">
          <div className="seal">
            <Check strokeWidth={2.4} aria-hidden="true" />
          </div>
          <h1>
            Thank you, <em>{sessionUser?.name ?? "we’ve got it"}</em>
          </h1>
          <p className="lead">
            Your heirloom is now reserved with our karigars. Each piece is crafted by hand —
            beautiful things take a little time.
          </p>
          <div className="ordno">
            Order <b>{order.no}</b> · Paid via {order.payment}
          </div>
        </div>

        <div className="body">
          <div className="conf-card">
            <h3>What happens next</h3>
            <div className="csub">Your made-to-order journey, step by step</div>
            <div className="tl">
              {timeline.map((s, i) => (
                <div className={"step" + (s.cur ? " cur" : "")} key={i}>
                  <div className="marker">
                    <span className="dot" />
                    <span className="vline" />
                  </div>
                  <div className="ti">
                    <div className="tt">{s.tt}</div>
                    <div className="td">{s.td}</div>
                    <div className="when">{s.when}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="conf-side">
            <div className="conf-card stylist">
              <div className="si">
                {CartIc.scissor}
                <div>
                  <div className="st">A stylist will be in touch</div>
                  <div className="sd">
                    For your custom-stitched lehenga, we’ll collect your measurements over a quick
                    call or video fitting.
                  </div>
                </div>
              </div>
            </div>
            <div className="conf-card ship-to">
              <div className="lbl">Shipping to</div>
              <div className="addr">
                <b>
                  {a.first} {a.last}
                </b>
                <br />
                {a.address}
                <br />
                {a.city}
                {a.city && ","} {a.state} {a.pin}
                <br />
                {a.phone}
              </div>
              <div className="conf-items">
                {order.items.map((i) => (
                  <div className="ci" key={i.id}>
                    <div className="t">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={i.img || undefined} alt={i.name} />
                    </div>
                    <div className="cib">
                      <div className="cirow">
                        <span className="cn">{i.name}</span>
                        <span className="cp">{inr(i.price * i.qty)}</span>
                      </div>
                      <span className="cmeta">
                        {i.color.name} · {i.madeToMeasure ? "Made to measure" : i.size} · Qty {i.qty}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="conf-cta">
          <Link href="/" className="pri">
            Continue Shopping
          </Link>
          <Link
            href={`/track-order?order=${encodeURIComponent(order.no)}&email=${encodeURIComponent(a.email)}`}
            className="sec"
          >
            Track Your Order
          </Link>
        </div>
      </main>
      <SlimFooter />
    </div>
  );
}
