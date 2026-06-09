/* ============================================================
   AV Creation — Checkout + Confirmation + App mount
   ============================================================ */
const { useState: useS, useEffect: useE } = React;

const DELIVERY_OPTS = [
  { id: 'standard', dt: 'Atelier Standard', ds: 'Made-to-order · ships in 3–4 weeks · insured', dp: 'Free' },
  { id: 'priority', dt: 'Priority Craft', ds: 'Jumps the atelier queue · ships in 2–3 weeks', dp: '₹1,200' },
];

const PAY_METHODS = [
  { id: 'upi', name: 'UPI', desc: 'Pay instantly with any UPI app', tags: ['GPay', 'PhonePe', 'Paytm'] },
  { id: 'card', name: 'Credit / Debit Card', desc: 'Visa · Mastercard · RuPay · Amex', tags: ['Visa', 'MC'] },
  { id: 'netbanking', name: 'Net Banking', desc: 'All major Indian banks', tags: [] },
  { id: 'cod', name: 'Cash on Delivery', desc: 'Reserve with a small advance', tags: [] },
];
const PAY_LABEL = { upi: 'UPI', card: 'Card', netbanking: 'Net Banking', cod: 'Cash on Delivery' };

/* ---------- read-only checkout summary ---------- */
function CheckoutSummary() {
  const { bag, subtotal, savings, discount, total, promo } = useFlow();
  return (
    <div className="co-summary">
      <div className="co-mini">
        <h3>Order Summary</h3>
        {bag.map((i) => (
          <div className="mline" key={i.id}>
            <div className="mt"><img src={i.img} alt={i.name} /><span className="q">{i.qty}</span></div>
            <div className="mi">
              <div className="mn">{i.name}</div>
              <div className="mv">{i.color.name} · {i.madeToMeasure ? 'Made to measure' : i.size}</div>
            </div>
            <div className="mp">{inr(i.price * i.qty)}</div>
          </div>
        ))}
        <div className="mrows">
          <div className="r"><span>Subtotal</span><span className="v">{inr(subtotal)}</span></div>
          {savings > 0 && <div className="r disc"><span>Atelier savings</span><span className="v">−{inr(savings)}</span></div>}
          {discount > 0 && <div className="r disc"><span>Promo · {promo.code}</span><span className="v">−{inr(discount)}</span></div>}
          <div className="r"><span>Insured shipping</span><span className="v">Free</span></div>
        </div>
        <div className="mtotal"><span className="l">Total</span><span className="amt">{inr(total)}</span></div>
      </div>
      <div className="co-assure">
        <div className="a">{Ic.scissor}<div><b>Made to measure.</b> A stylist collects your exact measurements after checkout.</div></div>
        <div className="a">{Ic.shield}<div><b>Secure & insured.</b> 256-bit encrypted payment, fully insured delivery.</div></div>
        <div className="a">{Ic.calendar}<div><b>3–4 week craft time.</b> Each piece is embroidered by hand in Jaipur.</div></div>
      </div>
    </div>
  );
}

/* ---------- generic panel ---------- */
function Panel({ n, title, status, summary, onEdit, children }) {
  const open = status === 'active';
  return (
    <div className={'panel ' + status}>
      <div className="ph">
        <span className="pn">{status === 'complete' ? Ic.check : n}</span>
        <span className="pt">{title}</span>
        {status === 'complete' && <span className="edit" onClick={onEdit}>Edit</span>}
      </div>
      {open && <div className="pbody">{children}</div>}
      {status === 'complete' && summary && (
        <div className="pbody" style={{ paddingTop: 0 }}>
          <div style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.6 }}>{summary}</div>
        </div>
      )}
    </div>
  );
}

function Field({ label, req, span, children }) {
  return (
    <div className={'fld' + (span ? ' full' : '')}>
      <label>{label}{req && <span className="req"> *</span>}</label>
      {children}
    </div>
  );
}

/* ---------- checkout page ---------- */
function CheckoutPage({ stepped }) {
  const { go, bag, total, setOrder, promo, discount } = useFlow();
  const [step, setStep] = useS(0);
  const [form, setForm] = useS({ first: '', last: '', email: '', phone: '', address: '', pin: '', city: '', state: '' });
  const [delivery, setDelivery] = useS('standard');
  const [pay, setPay] = useS('upi');
  const [upiApp, setUpiApp] = useS('GPay');
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const status = (i) => !stepped ? 'active' : (i < step ? 'complete' : i === step ? 'active' : 'upcoming');

  const addrSummary = form.first ? `${form.first} ${form.last}, ${form.address || '—'}, ${form.city || ''} ${form.pin || ''}` : 'Shipping details';
  const delSummary = DELIVERY_OPTS.find((d) => d.id === delivery).dt + ' · ' + DELIVERY_OPTS.find((d) => d.id === delivery).dp;

  const placeOrder = () => {
    const no = 'AVC-' + Math.floor(100000 + Math.random() * 899999);
    const eta = new Date(Date.now() + 26 * 864e5).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    setOrder({ no, items: bag, total, address: { ...form }, payment: PAY_LABEL[pay], delivery, eta });
    go('confirm');
  };

  return (
    <div className="app">
      <CheckoutHeader onBack={() => go('cart')} backLabel="Back to Bag" />
      <main className="wrap">
        {stepped && (
          <div className="co-steps">
            {['Address', 'Payment', 'Review'].map((s, i) => (
              <React.Fragment key={s}>
                {i > 0 && <span className="link"></span>}
                <span className={'st' + (i === step ? ' on' : '') + (i < step ? ' done' : '')}>
                  <span className="num">{i < step ? Ic.check : i + 1}</span>{s}
                </span>
              </React.Fragment>
            ))}
          </div>
        )}
        <div className="page-head"><h1>Secure <em>Checkout</em></h1></div>
        <div className="co-grid">
          <div className="co-sections">

            {/* 1 · CONTACT + ADDRESS */}
            <Panel n="1" title="Contact & Shipping" status={status(0)} summary={addrSummary} onEdit={() => setStep(0)}>
              <div className="login-row">
                <span>Already have an account?</span>
                <a>Log in for saved addresses →</a>
              </div>
              <div className="field-grid">
                <Field label="First name" req><input value={form.first} onChange={set('first')} placeholder="Ananya" /></Field>
                <Field label="Last name" req><input value={form.last} onChange={set('last')} placeholder="Rathore" /></Field>
                <Field label="Email" req span><input value={form.email} onChange={set('email')} placeholder="you@email.com" type="email" /></Field>
                <Field label="Mobile number" req span><input value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" /></Field>
                <Field label="Address" req span><input value={form.address} onChange={set('address')} placeholder="House / flat, street, area" /></Field>
                <Field label="PIN code" req><input value={form.pin} onChange={set('pin')} placeholder="302001" /></Field>
                <Field label="City" req><input value={form.city} onChange={set('city')} placeholder="Jaipur" /></Field>
                <Field label="State" req span>
                  <select value={form.state} onChange={set('state')}>
                    <option value="">Select state</option>
                    {['Rajasthan', 'Delhi', 'Maharashtra', 'Karnataka', 'Gujarat', 'West Bengal', 'Tamil Nadu', 'Uttar Pradesh'].map((s) => <option key={s}>{s}</option>)}
                  </select>
                </Field>
              </div>
              {stepped && <button className="continue" onClick={() => setStep(1)}>Continue to Payment {Ic.arrowR}</button>}
            </Panel>

            {/* 2 · DELIVERY (folded into address step on single; own panel otherwise) */}
            {!stepped && (
              <Panel n="2" title="Delivery Method" status="active">
                <div className="delivery">
                  {DELIVERY_OPTS.map((d) => (
                    <div key={d.id} className={'dopt' + (delivery === d.id ? ' on' : '')} onClick={() => setDelivery(d.id)}>
                      <span className="radio"></span>
                      <div className="di"><div className="dt">{d.dt}</div><div className="ds">{d.ds}</div></div>
                      <div className="dp">{d.dp}</div>
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            {/* PAYMENT */}
            <Panel n={stepped ? '2' : '3'} title="Payment" status={status(1)} summary={PAY_LABEL[pay]} onEdit={() => setStep(1)}>
              {stepped && (
                <div className="delivery" style={{ marginBottom: 20 }}>
                  {DELIVERY_OPTS.map((d) => (
                    <div key={d.id} className={'dopt' + (delivery === d.id ? ' on' : '')} onClick={() => setDelivery(d.id)}>
                      <span className="radio"></span>
                      <div className="di"><div className="dt">{d.dt}</div><div className="ds">{d.ds}</div></div>
                      <div className="dp">{d.dp}</div>
                    </div>
                  ))}
                </div>
              )}
              <div className="pay-methods">
                {PAY_METHODS.map((m) => (
                  <div key={m.id} className={'pm' + (pay === m.id ? ' on' : '')}>
                    <div className="pm-head" onClick={() => setPay(m.id)}>
                      <span className="radio"></span>
                      <div><div className="pm-name">{m.name}</div><div className="pm-desc">{m.desc}</div></div>
                      {m.tags.length > 0 && <div className="pm-tags">{m.tags.map((t) => <span key={t}>{t}</span>)}</div>}
                    </div>
                    <div className="pm-body">
                      <div className="inner">
                        {m.id === 'upi' && (
                          <>
                            <div className="upi-apps">
                              {['GPay', 'PhonePe', 'Paytm'].map((a) => (
                                <div key={a} className={'ua' + (upiApp === a ? ' on' : '')} onClick={() => setUpiApp(a)}>{a}</div>
                              ))}
                            </div>
                            <Field label="UPI ID" span><input placeholder="yourname@bank" /></Field>
                          </>
                        )}
                        {m.id === 'card' && (
                          <div className="field-grid">
                            <Field label="Card number" req span><input placeholder="1234 5678 9012 3456" /></Field>
                            <Field label="Name on card" req span><input placeholder="As printed on card" /></Field>
                            <Field label="Expiry" req><input placeholder="MM / YY" /></Field>
                            <Field label="CVV" req><input placeholder="•••" /></Field>
                          </div>
                        )}
                        {m.id === 'netbanking' && (
                          <Field label="Choose your bank" span>
                            <select><option>HDFC Bank</option><option>ICICI Bank</option><option>State Bank of India</option><option>Axis Bank</option><option>Kotak Mahindra</option></select>
                          </Field>
                        )}
                        {m.id === 'cod' && (
                          <div className="cod-note">{Ic.info}
                            <span>As your bag includes a <b>made-to-order</b> piece, a <b>20% advance</b> secures your atelier slot — the balance is collected on delivery.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="place-order" onClick={placeOrder} style={{ marginTop: 22 }}>
                {Ic.lock} Place Order · {inr(total)}
              </button>
              <div style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--muted)', marginTop: 14, lineHeight: 1.5 }}>
                By placing your order you agree to AV Creation’s made-to-order terms.<br />Your payment is encrypted and fully secure.
              </div>
            </Panel>
          </div>
          <CheckoutSummary />
        </div>
      </main>
      <SlimFooter />
    </div>
  );
}

/* ---------- confirmation ---------- */
function ConfirmationPage() {
  const { order, go, setBag, setPromo } = useFlow();
  const o = order || { no: 'AVC-000000', items: INITIAL_BAG, total: 75300, address: {}, payment: 'UPI', eta: '—' };
  const a = o.address || {};
  const TL = [
    { tt: 'Order confirmed', td: 'We’ve received your order and sent a confirmation to your email.', when: 'Just now', cur: true },
    { tt: 'Stylist measurement call', td: 'Our atelier stylist will reach out to collect your exact measurements.', when: 'Within 48 hours' },
    { tt: 'Crafted in our Jaipur atelier', td: 'Hand zardozi & gota-patti embroidered by our master karigars.', when: '3–4 weeks' },
    { tt: 'Dispatched & insured delivery', td: 'Gift-boxed in a muslin pouch and shipped to your door.', when: 'Est. ' + o.eta },
  ];
  const newOrder = () => { setBag(INITIAL_BAG); setPromo(null); go('cart'); };
  return (
    <div className="app">
      <CheckoutHeader onBack={newOrder} backLabel="Back to Shop" />
      <main className="wrap confirm">
        <div className="hero">
          <div className="seal"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.2 4.5L19 7" /></svg></div>
          <h1>Thank you, <em>{a.first || 'we’ve got it'}</em></h1>
          <p className="lead">Your heirloom is now reserved with our karigars. Each piece is crafted by hand — beautiful things take a little time.</p>
          <div className="ordno">Order <b>{o.no}</b> · Paid via {o.payment}</div>
        </div>
        <div className="body">
          <div className="conf-card">
            <h3>What happens next</h3>
            <div className="csub">Your made-to-order journey, step by step</div>
            <div className="tl">
              {TL.map((s, i) => (
                <div className={'step' + (s.cur ? ' cur' : '')} key={i}>
                  <div className="marker"><span className="dot"></span><span className="vline"></span></div>
                  <div className="ti"><div className="tt">{s.tt}</div><div className="td">{s.td}</div><div className="when">{s.when}</div></div>
                </div>
              ))}
            </div>
          </div>
          <div className="conf-side">
            <div className="conf-card stylist">
              <div className="si">{Ic.scissor}<div><div className="st">A stylist will be in touch</div><div className="sd">For your custom-stitched lehenga, we’ll collect your measurements over a quick call or video fitting.</div></div></div>
            </div>
            <div className="conf-card ship-to">
              <div className="lbl">Shipping to</div>
              <div className="addr">
                <b>{a.first} {a.last}</b><br />
                {a.address}<br />
                {a.city}{a.city && ','} {a.state} {a.pin}<br />
                {a.phone}
              </div>
              <div className="conf-items">
                {o.items.map((i) => (
                  <div className="ci" key={i.id}>
                    <div className="t"><img src={i.img} alt={i.name} /></div>
                    <div className="cib">
                      <div className="cirow">
                        <span className="cn">{i.name}</span>
                        <span className="cp">{inr(i.price * i.qty)}</span>
                      </div>
                      <span className="cmeta">{i.color.name} · {i.madeToMeasure ? 'Made to measure' : i.size} · Qty {i.qty}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="conf-cta">
          <button className="pri" onClick={newOrder}>Continue Shopping</button>
          <button className="sec">Track Your Order</button>
        </div>
      </main>
      <SlimFooter />
    </div>
  );
}

/* ---------- ACCENTS ---------- */
const ACCENTS = {
  '#bd3c6e': { deep: '#8e2b52', soft: '#e29bb6', wash: '#f7e7ec' },
  '#8c2f3a': { deep: '#6e1f2e', soft: '#c98f97', wash: '#f3e6e8' },
  '#1d5042': { deep: '#163f34', soft: '#8fb3a8', wash: '#e4ede9' },
  '#27406e': { deep: '#1c3052', soft: '#97a7c2', wash: '#e6eaf1' },
};

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#bd3c6e",
  "checkout": "One page",
  "promoBar": true
}/*EDITMODE-END*/;

function Root() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  useE(() => {
    const r = document.documentElement;
    const a = ACCENTS[t.accent] || ACCENTS['#bd3c6e'];
    r.style.setProperty('--rani', t.accent);
    r.style.setProperty('--rani-deep', a.deep);
    r.style.setProperty('--rani-soft', a.soft);
    r.style.setProperty('--rani-wash', a.wash);
  }, [t.accent]);

  return (
    <FlowProvider>
      <Screens stepped={t.checkout === 'Stepped'} promoBar={t.promoBar} />
      <CartDrawer />
      <TweaksPanel>
        <TweakSection label="Brand accent" />
        <TweakColor label="Accent colour" value={t.accent}
          options={['#bd3c6e', '#8c2f3a', '#1d5042', '#27406e']}
          onChange={(v) => setTweak('accent', v)} />
        <TweakSection label="Checkout" />
        <TweakRadio label="Layout" value={t.checkout} options={['One page', 'Stepped']}
          onChange={(v) => setTweak('checkout', v)} />
        <TweakToggle label="Promo bar" value={t.promoBar} onChange={(v) => setTweak('promoBar', v)} />
      </TweaksPanel>
    </FlowProvider>
  );
}

function Screens({ stepped, promoBar }) {
  const { screen } = useFlow();
  if (screen === 'checkout') return <CheckoutPage stepped={stepped} />;
  if (screen === 'confirm') return <ConfirmationPage />;
  return <CartWithPromo promoBar={promoBar} />;
}

function CartWithPromo({ promoBar }) {
  // promoBar toggles the announcement strip on the cart page only
  useE(() => {
    document.documentElement.style.setProperty('--show-announce', promoBar ? 'flex' : 'none');
  }, [promoBar]);
  return <CartPage />;
}

ReactDOM.createRoot(document.getElementById('root')).render(<Root />);

Object.assign(window, { CheckoutPage, ConfirmationPage, CheckoutSummary });
