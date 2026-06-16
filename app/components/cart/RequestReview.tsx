"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../landing/CartContext";
import { CheckoutHeader, SlimFooter } from "./CheckoutChrome";
import { CartIc } from "./icons";
import { inr } from "../../lib/cart-data";
import {
  getSession,
  fetchAddresses,
  fetchManualOrderConfig,
  createOrderRequest,
  type Address,
  type ManualOrderConfig,
} from "../../lib/api";

/* Offline-first request review. Replaces the old instant-pay checkout: there is
   no payment step here. Submitting creates a Pending-Approval request and hands
   the shopper a prefilled WhatsApp message — stock is never reserved. */

const LAST_REQUEST_KEY = "av-last-request";

export default function RequestReview() {
  const router = useRouter();
  const { items, subtotal, clear } = useCart();

  const [cfg, setCfg] = useState<ManualOrderConfig | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  // Selected saved address id, or "later" to confirm the address over WhatsApp.
  const [selected, setSelected] = useState<number | "later">("later");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  // Submitting clears the bag on purpose — don't let the empty-bag guard bounce.
  const [submitted, setSubmitted] = useState(false);

  /* An empty bag has nothing to request — send them back. */
  useEffect(() => {
    if (items.length === 0 && !submitted) router.replace("/cart");
  }, [items.length, submitted, router]);

  /* Load the customer notice/response-window copy + saved addresses. */
  useEffect(() => {
    let alive = true;
    fetchManualOrderConfig()
      .then((c) => alive && setCfg(c))
      .catch(() => {});
    (async () => {
      const user = await getSession();
      if (!alive || !user) return;
      const addrs = await fetchAddresses().catch(() => []);
      if (!alive) return;
      setAddresses(addrs);
      const preferred = addrs.find((a) => a.isDefault) ?? addrs[0];
      if (preferred) setSelected(preferred.id);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const submit = async () => {
    if (submitting || items.length === 0) return;
    setSubmitting(true);
    setErr(null);
    try {
      const res = await createOrderRequest({
        items: items.map((i) => ({
          slug: i.slug ?? i.id,
          color: i.color.name,
          size: i.madeToMeasure ? "Custom" : i.size,
          qty: i.qty,
        })),
        addressId: selected === "later" ? null : selected,
        customerNote: note.trim() || null,
      });
      // Stash for the confirmation page (request no + WhatsApp deep link).
      try {
        sessionStorage.setItem(LAST_REQUEST_KEY, JSON.stringify(res));
      } catch {
        /* ignore */
      }
      setSubmitted(true);
      clear();
      router.push("/checkout/success");
    } catch (e) {
      setSubmitting(false);
      setErr(
        e instanceof Error ? e.message : "We couldn’t submit your request. Please try again."
      );
    }
  };

  if (items.length === 0 && !submitted) return null;

  return (
    <div className="app flow av-flow">
      <CheckoutHeader backHref="/cart" backLabel="Back to Bag" />
      <main className="wrap">
        <div className="page-head">
          <h1>
            Request <em>Order</em>
          </h1>
          <div className="meta">Review &amp; send your request on WhatsApp</div>
        </div>

        <div className="co-grid">
          <div className="co-sections">
            {/* Notice — set expectations before anything else. */}
            <div className="req-callout">
              <div className="req-callout-icon">{CartIc.info}</div>
              <div>
                <p className="req-callout-body">
                  {cfg?.notice ??
                    "This product is not automatically reserved. Our team will first verify availability. You will receive payment instructions only after approval."}
                </p>
                <p className="req-callout-window">
                  <span className="dot" aria-hidden="true" />
                  {cfg?.responseWindow ?? "We respond within 2 hours, Mon–Sat 10am–7pm"}
                </p>
              </div>
            </div>

            {/* Delivery address (optional — can be shared over WhatsApp). */}
            <div className="panel active">
              <div className="ph">
                <span className="pn">1</span>
                <span className="pt">Delivery address</span>
              </div>
              <div className="pbody">
                <div className="delivery">
                  {addresses.map((a) => (
                    <div
                      key={a.id}
                      className={"dopt" + (selected === a.id ? " on" : "")}
                      onClick={() => setSelected(a.id)}
                    >
                      <span className="radio" />
                      <div className="di">
                        <div className="dt">
                          {a.fullName} · {a.phone}
                        </div>
                        <div className="ds">
                          {a.street}, {a.city}, {a.state} — {a.pincode}
                        </div>
                      </div>
                      {a.isDefault && <div className="dp">Default</div>}
                    </div>
                  ))}
                  <div
                    className={"dopt" + (selected === "later" ? " on" : "")}
                    onClick={() => setSelected("later")}
                  >
                    <span className="radio" />
                    <div className="di">
                      <div className="dt">Share my address on WhatsApp</div>
                      <div className="ds">We’ll confirm delivery details with you after approval</div>
                    </div>
                  </div>
                </div>
                {addresses.length === 0 && (
                  <a className="req-addr-link" href="/profile/addresses">
                    + Save an address to your profile
                  </a>
                )}
              </div>
            </div>

            {/* Optional note to the team. */}
            <div className="panel active">
              <div className="ph">
                <span className="pn">2</span>
                <span className="pt">Note for our team (optional)</span>
              </div>
              <div className="pbody">
                <textarea
                  className="req-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Anything we should know — preferred size, colour, gifting, occasion date…"
                  rows={3}
                  maxLength={1000}
                />
              </div>
            </div>

            {err && (
              <div className="msg err">
                {CartIc.info} {err}
              </div>
            )}

            <button className="place-order req-wa" onClick={submit} disabled={submitting}>
              {submitting ? "Submitting your request…" : "Request Order on WhatsApp"}
            </button>
            <div className="placeterms">
              {cfg?.confirmationNotice ??
                "Orders are confirmed only after admin approval and payment verification."}
            </div>
          </div>

          {/* Summary */}
          <div className="co-summary">
            <div className="co-mini">
              <h3>Your request</h3>
              {items.map((i) => (
                <div className="mline" key={i.id}>
                  <div className="mt">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={i.img || undefined} alt={i.name} />
                    <span className="q">{i.qty}</span>
                  </div>
                  <div className="mi">
                    <div className="mn">{i.name}</div>
                    <div className="mv">
                      {i.color.name} · {i.madeToMeasure ? "Made to measure" : i.size}
                    </div>
                  </div>
                  <div className="mp">{inr(i.price * i.qty)}</div>
                </div>
              ))}
              <div className="mtotal">
                <span className="l">Indicative total</span>
                <span className="amt">{inr(subtotal)}</span>
              </div>
              <p className="req-summary-fine">
                Final amount is confirmed by our team. Nothing is charged now.
              </p>
            </div>
          </div>
        </div>
      </main>
      <SlimFooter />
    </div>
  );
}
