/* ============================================================
   AV Creation — Cart & Checkout · shared data, icons, chrome
   Exports to window for cart-page.jsx + checkout-flow.jsx
   ============================================================ */
const { useState, useRef, useEffect, createContext, useContext } = React;

/* ---------- IMAGERY (shared with PDP) ---------- */
const IMG = {
  a: 'https://plus.unsplash.com/premium_photo-1682096032284-0b2ab20b65dd?w=1100&q=80&auto=format&fit=crop',
  b: 'https://plus.unsplash.com/premium_photo-1682096065017-ab3d3a162b33?w=1100&q=80&auto=format&fit=crop',
  c: 'https://images.unsplash.com/photo-1645862755924-9f4e7f200b83?w=1100&q=80&auto=format&fit=crop',
  d: 'https://plus.unsplash.com/premium_photo-1682096048114-4b36a3212527?w=1100&q=80&auto=format&fit=crop',
  e: 'https://plus.unsplash.com/premium_photo-1682096060450-6ac06a3a0478?w=1100&q=80&auto=format&fit=crop',
  h: 'https://plus.unsplash.com/premium_photo-1682096037844-e43413e887a8?w=900&q=78&auto=format&fit=crop',
  i: 'https://images.unsplash.com/photo-1693336429270-094637e16d38?w=900&q=78&auto=format&fit=crop',
  j: 'https://plus.unsplash.com/premium_photo-1682096034925-468c545d1c12?w=700&q=78&auto=format&fit=crop',
};

/* ---------- ICONS ---------- */
const Ic = {
  search: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>,
  user: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg>,
  cart: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 8h12l-1 12H7L6 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>,
  bag: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M5 8h14l-1 12H6L5 8Z"/><path d="M8.5 8V6.5a3.5 3.5 0 0 1 7 0V8"/></svg>,
  plus: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M12 5v14M5 12h14"/></svg>,
  check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.2 4.5L19 7"/></svg>,
  arrowR: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>,
  arrowL: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>,
  trash: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13"/></svg>,
  heart: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 20s-7-4.4-7-9.5A3.6 3.6 0 0 1 12 8a3.6 3.6 0 0 1 7 2.5C19 15.6 12 20 12 20Z"/></svg>,
  ship: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M3 7h13v9H3zM16 10h3l2 3v3h-5z"/><circle cx="7" cy="17" r="1.6"/><circle cx="18" cy="17" r="1.6"/></svg>,
  scissor: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><path d="M8 8l12 8M8 16L20 8"/></svg>,
  shield: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/><path d="M9 12l2 2 4-4"/></svg>,
  lock: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="5" y="11" width="14" height="9" rx="1.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>,
  tag: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h7l9 9-7 7-9-9V4Z"/><circle cx="8.5" cy="8.5" r="1.4"/></svg>,
  spark: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 3l1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6z"/></svg>,
  info: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>,
  calendar: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 9h16M8 3v4M16 3v4"/></svg>,
  needle: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 21L14 10M14 10l3.5-3.5a2.5 2.5 0 1 1 0 5L14 10"/><circle cx="18" cy="6" r="1.2"/></svg>,
};

/* ---------- MONEY ---------- */
const inr = (n) => '₹' + Math.round(n).toLocaleString('en-IN');

/* ---------- INITIAL BAG ---------- */
const INITIAL_BAG = [
  {
    id: 'lehenga', name: 'Rani Bagh Royal Bridal Lehenga',
    type: 'Hand Zardozi & Gota Patti · Raw Silk',
    color: { name: 'Rani Pink', hex: '#bd3c6e' },
    size: 'Custom', madeToMeasure: true,
    price: 68500, was: 82000, qty: 1, img: IMG.a,
    note: 'A stylist will collect your exact measurements after checkout.',
  },
  {
    id: 'odhni', name: 'Kundan Rani Odhni',
    type: 'Bandhej · Pure Georgette',
    color: { name: 'Rani Pink', hex: '#bd3c6e' },
    size: 'Free Size', madeToMeasure: false,
    price: 6800, was: null, qty: 1, img: IMG.i,
  },
];

const CROSS_SELL = [
  { id: 'jhumka', nm: 'Polki Jhumka Set', ty: 'Temple · 22k Gold-plate', pr: 3200, img: IMG.j, color: { name: 'Gold', hex: '#bd8f3c' }, size: 'One Size' },
  { id: 'juttis', nm: 'Zari Embroidered Juttis', ty: 'Handcrafted · Velvet', pr: 2400, img: IMG.h, color: { name: 'Maroon', hex: '#6e1f2e' }, size: 'UK 5' },
  { id: 'potli', nm: 'Silk Potli Clutch', ty: 'Gota Patti · Raw Silk', pr: 1900, img: IMG.d, color: { name: 'Rani Pink', hex: '#bd3c6e' }, size: 'One Size' },
];

const PROMOS = { RANI10: { pct: 0.10, label: '10% off your order' }, BRIDE5: { pct: 0.05, label: '5% welcome offer' } };

/* ---------- FLOW CONTEXT ---------- */
const FlowCtx = createContext(null);

function FlowProvider({ children }) {
  const [screen, setScreen] = useState('cart');     // cart | checkout | confirm
  const [bag, setBag] = useState(INITIAL_BAG);
  const [promo, setPromo] = useState(null);          // {code,pct,label}
  const [drawer, setDrawer] = useState(false);
  const [bump, setBump] = useState(false);
  const [order, setOrder] = useState(null);

  const count = bag.reduce((s, i) => s + i.qty, 0);
  const subtotal = bag.reduce((s, i) => s + i.price * i.qty, 0);
  const savings = bag.reduce((s, i) => s + (i.was ? (i.was - i.price) * i.qty : 0), 0);
  const discount = promo ? Math.round(subtotal * promo.pct) : 0;
  const total = Math.max(0, subtotal - discount);

  const pop = () => { setBump(false); requestAnimationFrame(() => setBump(true)); setTimeout(() => setBump(false), 600); };

  const setQty = (id, q) => setBag((b) => b.map((i) => i.id === id ? { ...i, qty: Math.max(1, q) } : i));
  const remove = (id) => setBag((b) => b.filter((i) => i.id !== id));
  const add = (item) => {
    setBag((b) => {
      const ex = b.find((i) => i.id === item.id);
      if (ex) return b.map((i) => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      return [...b, item];
    });
    pop();
  };

  const go = (s) => { setScreen(s); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const value = {
    screen, go, bag, setQty, remove, add, count, subtotal, savings, discount, total,
    promo, setPromo, drawer, setDrawer, bump, pop, order, setOrder,
  };
  return <FlowCtx.Provider value={value}>{children}</FlowCtx.Provider>;
}
const useFlow = () => useContext(FlowCtx);

/* ---------- CHROME ---------- */
function Announce() {
  return (
    <div className="announce">
      <span>Complimentary insured shipping across India on orders above <b>₹2,999</b></span>
      <span className="dot">·</span>
      <span>Handcrafted in the heart of Jaipur</span>
    </div>
  );
}

function SiteHeader() {
  const { count, bump, setDrawer, go } = useFlow();
  const links = ['Lehenga', 'Jaipuri Odhni', 'Designer Saree', 'Suit Sets', 'Dupatta'];
  return (
    <header className="site-head">
      <div className="wrap bar">
        <nav>{links.map((l) => <a key={l} href="#">{l}</a>)}</nav>
        <div className="logo" onClick={() => go('cart')}>
          <span className="mark">AV CREATION</span>
          <span className="sub">Jaipuri Atelier · Rajasthan</span>
        </div>
        <div className="acts">
          <button aria-label="Search">{Ic.search}</button>
          <button aria-label="Account">{Ic.user}</button>
          <button className="cart-btn" aria-label="Cart" onClick={() => setDrawer(true)}>
            {Ic.cart}<span className={'badge' + (bump ? ' bump' : '')}>{count}</span>
          </button>
        </div>
      </div>
    </header>
  );
}

function CheckoutHeader({ onBack, backLabel }) {
  return (
    <header className="co-head">
      <div className="wrap bar">
        <div className="back" onClick={onBack}>{Ic.arrowL} {backLabel}</div>
        <div className="logo"><span className="mark">AV CREATION</span><span className="sub">Jaipuri Atelier · Rajasthan</span></div>
        <div className="secure">{Ic.lock} Secure Checkout</div>
      </div>
    </header>
  );
}

function SlimFooter() {
  return (
    <footer className="pfoot">
      <div className="wrap inner">
        <span className="mark">AV CREATION</span>
        <span>© 2026 · Hand-blocked in Jaipur, the Pink City</span>
        <div className="pay"><span>UPI</span><span>Visa</span><span>Mastercard</span><span>Net Banking</span><span>COD</span></div>
      </div>
    </footer>
  );
}

/* ---------- DRAWER ---------- */
function CartDrawer() {
  const { drawer, setDrawer, bag, setQty, remove, subtotal, go } = useFlow();
  const goto = (s) => { setDrawer(false); go(s); };
  return (
    <>
      <div className={'scrim' + (drawer ? ' show' : '')} onClick={() => setDrawer(false)}></div>
      <aside className={'drawer' + (drawer ? ' show' : '')} aria-hidden={!drawer}>
        <div className="dhead">
          <div className="dt">Your Bag <span>{bag.length} {bag.length === 1 ? 'piece' : 'pieces'}</span></div>
          <button className="x" onClick={() => setDrawer(false)} aria-label="Close">×</button>
        </div>
        {bag.length === 0 ? (
          <div className="dempty">
            <div className="ring">{Ic.bag}</div>
            <p>Your bag is empty</p>
          </div>
        ) : (
          <>
            <div className="dbody">
              {bag.map((i) => (
                <div className="dline" key={i.id}>
                  <div className="dp"><img src={i.img} alt={i.name} /></div>
                  <div>
                    <div className="dn">{i.name}</div>
                    <div className="dv">{i.color.name} · {i.madeToMeasure ? 'Made to measure' : i.size}</div>
                    <div className="dq">
                      <div className="mini">
                        <button onClick={() => setQty(i.id, i.qty - 1)}>−</button>
                        <span className="n">{i.qty}</span>
                        <button onClick={() => setQty(i.id, i.qty + 1)}>+</button>
                      </div>
                      <button className="rm" onClick={() => remove(i.id)}>Remove</button>
                    </div>
                  </div>
                  <div className="dpr">{inr(i.price * i.qty)}</div>
                </div>
              ))}
            </div>
            <div className="dfoot">
              <div className="strow"><span className="l">Subtotal</span><span className="v">{inr(subtotal)}</span></div>
              <div className="note">Shipping & taxes calculated at checkout · Made-to-order pieces ship in 3–4 weeks</div>
              <button className="vc" onClick={() => goto('checkout')}>{Ic.lock} Secure Checkout</button>
              <button className="vb" onClick={() => goto('cart')}>View Full Bag</button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

Object.assign(window, {
  IMG, Ic, inr, INITIAL_BAG, CROSS_SELL, PROMOS,
  FlowCtx, FlowProvider, useFlow,
  Announce, SiteHeader, CheckoutHeader, SlimFooter, CartDrawer,
});
