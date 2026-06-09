"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "../landing/CartContext";
import { CheckoutHeader, SlimFooter } from "./CheckoutChrome";
import { CartIc } from "./icons";
import {
  DELIVERY_OPTS,
  PAY_METHODS,
  PAY_LABEL,
  inr,
  type OrderAddress,
} from "../../lib/cart-data";

const STATES = [
  "Rajasthan",
  "Delhi",
  "Maharashtra",
  "Karnataka",
  "Gujarat",
  "West Bengal",
  "Tamil Nadu",
  "Uttar Pradesh",
];

/* ---------- generic single-page panel (always open) ---------- */
function Panel({ n, title, children }: { n: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="panel active">
      <div className="ph">
        <span className="pn">{n}</span>
        <span className="pt">{title}</span>
      </div>
      <div className="pbody">{children}</div>
    </div>
  );
}

function Field({
  label,
  req,
  full,
  children,
}: {
  label: string;
  req?: boolean;
  full?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={"fld" + (full ? " full" : "")}>
      <label>
        {label}
        {req && <span className="req"> *</span>}
      </label>
      {children}
    </div>
  );
}

/* ---------- read-only order summary (sidebar) ---------- */
function CheckoutSummary({ shipFee }: { shipFee: number }) {
  const { items, subtotal, savings, discount, promo } = useCart();
  const grand = Math.max(0, subtotal - discount) + shipFee;
  return (
    <div className="co-summary">
      <div className="co-mini">
        <h3>Order Summary</h3>
        {items.map((i) => (
          <div className="mline" key={i.id}>
            <div className="mt">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={i.img} alt={i.name} />
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
        <div className="mrows">
          <div className="r">
            <span>Subtotal</span>
            <span className="v">{inr(subtotal)}</span>
          </div>
          {savings > 0 && (
            <div className="r disc">
              <span>Atelier savings</span>
              <span className="v">−{inr(savings)}</span>
            </div>
          )}
          {discount > 0 && promo && (
            <div className="r disc">
              <span>Promo · {promo.code}</span>
              <span className="v">−{inr(discount)}</span>
            </div>
          )}
          <div className="r">
            <span>Insured shipping</span>
            <span className="v">{shipFee === 0 ? "Free" : inr(shipFee)}</span>
          </div>
        </div>
        <div className="mtotal">
          <span className="l">Total</span>
          <span className="amt">{inr(grand)}</span>
        </div>
      </div>
      <div className="co-assure">
        <div className="a">
          {CartIc.scissor}
          <div>
            <b>Made to measure.</b> A stylist collects your exact measurements after checkout.
          </div>
        </div>
        <div className="a">
          {CartIc.shield}
          <div>
            <b>Secure &amp; insured.</b> 256-bit encrypted payment, fully insured delivery.
          </div>
        </div>
        <div className="a">
          {CartIc.calendar}
          <div>
            <b>3–4 week craft time.</b> Each piece is embroidered by hand in Jaipur.
          </div>
        </div>
      </div>
    </div>
  );
}

const EMPTY_FORM: OrderAddress = {
  first: "",
  last: "",
  email: "",
  phone: "",
  address: "",
  pin: "",
  city: "",
  state: "",
};

export default function CheckoutView() {
  const router = useRouter();
  const { items, subtotal, discount, placeOrder } = useCart();

  const [form, setForm] = useState<OrderAddress>(EMPTY_FORM);
  const [delivery, setDelivery] = useState<string>("standard");
  const [pay, setPay] = useState<string>("upi");
  const [upiApp, setUpiApp] = useState<string>("GPay");
  const [touched, setTouched] = useState(false);
  // placing the order empties the bag on purpose — don't let the empty-bag
  // guard below hijack the navigation to the confirmation page.
  const placed = useRef(false);

  /* an empty bag has nothing to check out — send them back (unless we just
     placed an order, in which case we're on our way to /checkout/success) */
  useEffect(() => {
    if (items.length === 0 && !placed.current) router.replace("/cart");
  }, [items.length, router]);

  const set = (k: keyof OrderAddress) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const shipFee = DELIVERY_OPTS.find((d) => d.id === delivery)?.fee ?? 0;
  const grand = Math.max(0, subtotal - discount) + shipFee;

  const valid = useMemo(() => {
    const required: (keyof OrderAddress)[] = [
      "first",
      "last",
      "email",
      "phone",
      "address",
      "pin",
      "city",
      "state",
    ];
    return required.every((k) => form[k].trim() !== "");
  }, [form]);

  const onPlaceOrder = () => {
    if (!valid) {
      setTouched(true);
      document.querySelector(".panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    placed.current = true;
    placeOrder({ address: form, payment: PAY_LABEL[pay], delivery, total: grand });
    router.push("/checkout/success");
  };

  const missing = (k: keyof OrderAddress) => touched && form[k].trim() === "";

  if (items.length === 0 && !placed.current) return null;

  return (
    <div className="app flow">
      <CheckoutHeader backHref="/cart" backLabel="Back to Bag" />
      <main className="wrap">
        <div className="page-head">
          <h1>
            Secure <em>Checkout</em>
          </h1>
          <div className="meta">Address · Delivery · Payment — all on one page</div>
        </div>
        <div className="co-grid">
          <div className="co-sections">
            {/* 1 · CONTACT + SHIPPING */}
            <Panel n="1" title="Contact &amp; Shipping">
              <div className="login-row">
                <span>Already have an account?</span>
                <Link href="/login">Log in for saved addresses →</Link>
              </div>
              <div className="field-grid">
                <Field label="First name" req>
                  <input
                    value={form.first}
                    onChange={set("first")}
                    placeholder="Ananya"
                    aria-invalid={missing("first")}
                  />
                </Field>
                <Field label="Last name" req>
                  <input
                    value={form.last}
                    onChange={set("last")}
                    placeholder="Rathore"
                    aria-invalid={missing("last")}
                  />
                </Field>
                <Field label="Email" req full>
                  <input
                    type="email"
                    value={form.email}
                    onChange={set("email")}
                    placeholder="you@email.com"
                    aria-invalid={missing("email")}
                  />
                </Field>
                <Field label="Mobile number" req full>
                  <input
                    value={form.phone}
                    onChange={set("phone")}
                    placeholder="+91 98765 43210"
                    aria-invalid={missing("phone")}
                  />
                </Field>
                <Field label="Address" req full>
                  <input
                    value={form.address}
                    onChange={set("address")}
                    placeholder="House / flat, street, area"
                    aria-invalid={missing("address")}
                  />
                </Field>
                <Field label="PIN code" req>
                  <input
                    value={form.pin}
                    onChange={set("pin")}
                    placeholder="302001"
                    aria-invalid={missing("pin")}
                  />
                </Field>
                <Field label="City" req>
                  <input
                    value={form.city}
                    onChange={set("city")}
                    placeholder="Jaipur"
                    aria-invalid={missing("city")}
                  />
                </Field>
                <Field label="State" req full>
                  <select value={form.state} onChange={set("state")} aria-invalid={missing("state")}>
                    <option value="">Select state</option>
                    {STATES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </Field>
              </div>
            </Panel>

            {/* 2 · DELIVERY */}
            <Panel n="2" title="Delivery Method">
              <div className="delivery">
                {DELIVERY_OPTS.map((d) => (
                  <div
                    key={d.id}
                    className={"dopt" + (delivery === d.id ? " on" : "")}
                    onClick={() => setDelivery(d.id)}
                  >
                    <span className="radio" />
                    <div className="di">
                      <div className="dt">{d.dt}</div>
                      <div className="ds">{d.ds}</div>
                    </div>
                    <div className="dp">{d.dp}</div>
                  </div>
                ))}
              </div>
            </Panel>

            {/* 3 · PAYMENT */}
            <Panel n="3" title="Payment">
              <div className="pay-methods">
                {PAY_METHODS.map((m) => (
                  <div key={m.id} className={"pm" + (pay === m.id ? " on" : "")}>
                    <div className="pm-head" onClick={() => setPay(m.id)}>
                      <span className="radio" />
                      <div>
                        <div className="pm-name">{m.name}</div>
                        <div className="pm-desc">{m.desc}</div>
                      </div>
                      {m.tags.length > 0 && (
                        <div className="pm-tags">
                          {m.tags.map((t) => (
                            <span key={t}>{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="pm-body">
                      <div className="inner">
                        {m.id === "upi" && (
                          <>
                            <div className="upi-apps">
                              {["GPay", "PhonePe", "Paytm"].map((a) => (
                                <div
                                  key={a}
                                  className={"ua" + (upiApp === a ? " on" : "")}
                                  onClick={() => setUpiApp(a)}
                                >
                                  {a}
                                </div>
                              ))}
                            </div>
                            <Field label="UPI ID" full>
                              <input placeholder="yourname@bank" />
                            </Field>
                          </>
                        )}
                        {m.id === "card" && (
                          <div className="field-grid">
                            <Field label="Card number" req full>
                              <input placeholder="1234 5678 9012 3456" />
                            </Field>
                            <Field label="Name on card" req full>
                              <input placeholder="As printed on card" />
                            </Field>
                            <Field label="Expiry" req>
                              <input placeholder="MM / YY" />
                            </Field>
                            <Field label="CVV" req>
                              <input placeholder="•••" />
                            </Field>
                          </div>
                        )}
                        {m.id === "netbanking" && (
                          <Field label="Choose your bank" full>
                            <select>
                              <option>HDFC Bank</option>
                              <option>ICICI Bank</option>
                              <option>State Bank of India</option>
                              <option>Axis Bank</option>
                              <option>Kotak Mahindra</option>
                            </select>
                          </Field>
                        )}
                        {m.id === "cod" && (
                          <div className="cod-note">
                            {CartIc.info}
                            <span>
                              As your bag includes a <b>made-to-order</b> piece, a{" "}
                              <b>20% advance</b> secures your atelier slot — the balance is collected
                              on delivery.
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {touched && !valid && (
                <div className="msg err" style={{ marginTop: 16 }}>
                  {CartIc.info} Please complete your contact &amp; shipping details above.
                </div>
              )}

              <button className="place-order" onClick={onPlaceOrder} style={{ marginTop: 22 }}>
                {CartIc.lock} Place Order · {inr(grand)}
              </button>
              <div className="placeterms">
                By placing your order you agree to AV Creation’s made-to-order terms.
                <br />
                Your payment is encrypted and fully secure.
              </div>
            </Panel>
          </div>

          <CheckoutSummary shipFee={shipFee} />
        </div>
      </main>
      <SlimFooter />
    </div>
  );
}
