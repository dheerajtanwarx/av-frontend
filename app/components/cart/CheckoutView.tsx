"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
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
import { getSession, fetchAddresses, type Address } from "../../lib/api";

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

  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<OrderAddress>(EMPTY_FORM);
  const [prefilled, setPrefilled] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  // which saved address is selected, or "new" for manual entry
  const [selectedAddrId, setSelectedAddrId] = useState<number | "new">("new");
  const [delivery, setDelivery] = useState<string>("standard");
  const [pay, setPay] = useState<string>("upi");
  const [upiApp, setUpiApp] = useState<string>("GPay");
  const [touched, setTouched] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [orderErr, setOrderErr] = useState<string | null>(null);
  // placing the order empties the bag on purpose — don't let the empty-bag
  // guard below hijack the navigation to the confirmation page.
  const placed = useRef(false);

  /* an empty bag has nothing to check out — send them back (unless we just
     placed an order, in which case we're on our way to /checkout/success) */
  useEffect(() => {
    if (items.length === 0 && !placed.current) router.replace("/cart");
  }, [items.length, router]);

  /* pre-fill contact + shipping from the logged-in user's profile and their
     default saved address (falling back to the most recent). All fields stay
     editable — this is just a head start. */
  useEffect(() => {
    let alive = true;
    (async () => {
      const user = await getSession();
      if (!alive || !user) return;

      // Saved addresses are auth-gated; ignore failures (treat as none).
      const addresses = await fetchAddresses().catch(() => []);
      const addr = addresses.find((a) => a.isDefault) ?? addresses[0] ?? null;

      // Prefer the user's profile name; fall back to the address's full name.
      const nameSource = (user.name || addr?.fullName || "").trim();
      const parts = nameSource.split(/\s+/);

      if (!alive) return;
      setSavedAddresses(addresses);
      setSelectedAddrId(addr?.id ?? "new");
      setForm((f) => ({
        ...f,
        first: f.first || parts[0] || "",
        last: f.last || parts.slice(1).join(" ") || "",
        email: f.email || user.email || "",
        phone: f.phone || addr?.phone || user.phone || "",
        address: f.address || addr?.street || "",
        pin: f.pin || addr?.pincode || "",
        city: f.city || addr?.city || "",
        state: f.state || addr?.state || "",
      }));
      setPrefilled(true);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const set = (k: keyof OrderAddress) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  // Pick a saved address (fills the shipping fields) or "new" (clears them so
  // the buyer can type a one-off address). Contact name/phone follow the chosen
  // address; email stays as-is (addresses don't carry one).
  const selectAddress = (id: number | "new") => {
    setSelectedAddrId(id);
    if (id === "new") {
      setForm((f) => ({ ...f, address: "", pin: "", city: "", state: "" }));
      return;
    }
    const addr = savedAddresses.find((a) => a.id === id);
    if (!addr) return;
    const parts = addr.fullName.trim().split(/\s+/);
    setForm((f) => ({
      ...f,
      first: parts[0] || "",
      last: parts.slice(1).join(" ") || "",
      phone: addr.phone || f.phone,
      address: addr.street,
      pin: addr.pincode,
      city: addr.city,
      state: addr.state,
    }));
  };

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

  const scrollToTop = () =>
    document.querySelector(".co-steps")?.scrollIntoView({ behavior: "smooth", block: "start" });

  // step 1 → step 2: only advance once contact + address are complete
  const goToPayment = () => {
    if (!valid) {
      setTouched(true);
      document.querySelector(".panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    setStep(2);
    scrollToTop();
  };

  const backToDetails = () => {
    setStep(1);
    scrollToTop();
  };

  const onPlaceOrder = async () => {
    if (!valid) {
      // shouldn't happen (step 1 gates this), but bounce back to fix details
      setTouched(true);
      backToDetails();
      return;
    }
    if (placing) return;
    setPlacing(true);
    setOrderErr(null);
    try {
      await placeOrder({
        address: form,
        paymentId: pay,
        paymentLabel: PAY_LABEL[pay],
        delivery,
      });
      placed.current = true;
      router.push("/checkout/success");
    } catch (err) {
      setPlacing(false);
      setOrderErr(
        err instanceof Error ? err.message : "We couldn’t place your order. Please try again."
      );
    }
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
          <div className="meta">
            {step === 1 ? "Step 1 of 2 · Details & Address" : "Step 2 of 2 · Payment"}
          </div>
        </div>

        {/* two-step progress indicator */}
        <div className="co-steps">
          <button
            className={"cs" + (step === 1 ? " on" : " done")}
            onClick={() => step === 2 && backToDetails()}
            type="button"
          >
            <span className="cn">{step > 1 ? CartIc.check : "1"}</span>
            <span className="cl">Details &amp; Address</span>
          </button>
          <span className={"cbar" + (step === 2 ? " fill" : "")} />
          <div className={"cs" + (step === 2 ? " on" : "")}>
            <span className="cn">2</span>
            <span className="cl">Payment</span>
          </div>
        </div>

        <div className="co-grid">
          <div className="co-sections">
            {step === 1 ? (
              <>
            {/* 1 · CONTACT + SHIPPING */}
            <Panel n="1" title="Contact &amp; Shipping">
              {prefilled && (
                <div className="prefill-note">
                  {CartIc.shield} Pre-filled from your account — edit any field freely.
                </div>
              )}
              {savedAddresses.length > 0 && (
                <div className="addr-picker">
                  <div className="addr-picker-head">Deliver to</div>
                  <div className="delivery">
                    {savedAddresses.map((a) => (
                      <div
                        key={a.id}
                        className={"dopt" + (selectedAddrId === a.id ? " on" : "")}
                        onClick={() => selectAddress(a.id)}
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
                      className={"dopt" + (selectedAddrId === "new" ? " on" : "")}
                      onClick={() => selectAddress("new")}
                    >
                      <span className="radio" />
                      <div className="di">
                        <div className="dt">Use a new address</div>
                        <div className="ds">Enter the shipping details below</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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

            {touched && !valid && (
              <div className="msg err">
                {CartIc.info} Please complete your contact &amp; shipping details to continue.
              </div>
            )}

            <button className="place-order" onClick={goToPayment}>
              Continue to payment {CartIc.arrowR}
            </button>
              </>
            ) : (
              <>
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

              {orderErr && (
                <div className="msg err" style={{ marginTop: 16 }}>
                  {CartIc.info} {orderErr}
                </div>
              )}
              <button
                className="place-order"
                onClick={onPlaceOrder}
                disabled={placing}
                style={{ marginTop: 22 }}
              >
                {placing ? "Placing your order…" : <>{CartIc.lock} Place order · {inr(grand)}</>}
              </button>
              <button className="co-back" onClick={backToDetails} type="button">
                {CartIc.arrowL} Back to details &amp; address
              </button>
              <div className="placeterms">
                By placing your order you agree to AV Creation’s made-to-order terms.
                <br />
                Your payment is encrypted and fully secure.
              </div>
            </Panel>
              </>
            )}
          </div>

          <CheckoutSummary shipFee={shipFee} />
        </div>
      </main>
      <SlimFooter />
    </div>
  );
}
