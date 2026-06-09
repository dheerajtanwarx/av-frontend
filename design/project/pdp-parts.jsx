/* ============================================================
   AV Creation — Product Page · shared data + components
   Exports everything to window for pdp-app.jsx
   ============================================================ */
const { useState, useRef, useEffect, createContext, useContext } = React;

/* ---------- DATA ---------- */
const IMG = {
  a: 'https://plus.unsplash.com/premium_photo-1682096032284-0b2ab20b65dd?w=1100&q=80&auto=format&fit=crop',
  b: 'https://plus.unsplash.com/premium_photo-1682096065017-ab3d3a162b33?w=1100&q=80&auto=format&fit=crop',
  c: 'https://images.unsplash.com/photo-1645862755924-9f4e7f200b83?w=1100&q=80&auto=format&fit=crop',
  d: 'https://plus.unsplash.com/premium_photo-1682096048114-4b36a3212527?w=1100&q=80&auto=format&fit=crop',
  e: 'https://plus.unsplash.com/premium_photo-1682096060450-6ac06a3a0478?w=1100&q=80&auto=format&fit=crop',
  f: 'https://images.unsplash.com/photo-1769500804057-ca1391bf4617?w=900&q=78&auto=format&fit=crop',
  g: 'https://images.unsplash.com/photo-1574847872646-abff244bbd87?w=900&q=78&auto=format&fit=crop',
  h: 'https://plus.unsplash.com/premium_photo-1682096037844-e43413e887a8?w=900&q=78&auto=format&fit=crop',
  i: 'https://images.unsplash.com/photo-1693336429270-094637e16d38?w=900&q=78&auto=format&fit=crop',
  j: 'https://plus.unsplash.com/premium_photo-1682096034925-468c545d1c12?w=700&q=78&auto=format&fit=crop',
};

const PRODUCT = {
  name: 'Rani Bagh Royal Bridal Lehenga',
  craft: 'Hand Zardozi & Gota Patti · Raw Silk',
  rating: 4.9,
  reviews: 128,
  price: '₹68,500',
  was: '₹82,000',
  off: '16% Off',
  desc: 'A regal three-piece bridal ensemble — months of hand zardozi and gota-patti laid across raw Banarasi silk, finished with a scalloped net dupatta dyed in the colours of the Pink City.',
  images: [IMG.a, IMG.b, IMG.c, IMG.d, IMG.e],
  colors: [
    { name: 'Rani Pink', hex: '#bd3c6e' },
    { name: 'Deep Maroon', hex: '#6e1f2e' },
    { name: 'Emerald', hex: '#1d5042' },
    { name: 'Royal Blue', hex: '#27406e' },
  ],
  sizes: ['XS', 'S', 'M', 'L', 'XL'],
};

const SIZE_CHART = [
  ['XS', '32', '26', '36'],
  ['S', '34', '28', '38'],
  ['M', '36', '30', '40'],
  ['L', '38', '33', '42'],
  ['XL', '40', '35', '44'],
];

const ACCORDION = [
  { q: 'Delivery & Shipping', a: 'This piece is <b>made to order</b> and ships in 3–4 weeks. Complimentary insured shipping across India; express worldwide delivery calculated at checkout. You will receive a tracking link the moment it leaves our Jaipur atelier.' },
  { q: 'Returns & Exchange', a: 'Easy <b>7-day returns</b> on ready sizes. As each bridal piece is custom-stitched to your measures, made-to-measure orders are eligible for <b>one free alteration</b> rather than return. Our stylist will guide you through every step.' },
  { q: 'Fabric & Care', a: 'Raw Banarasi silk with real <b>gota-patti</b> and zardozi handwork. <b>Dry-clean only.</b> Store folded in the muslin pouch provided, away from direct sunlight, to keep the metallic work luminous for generations.' },
];

const REVIEWS = [
  { stars: 5, txt: 'Wore this for my reception — the zardozi caught every light in the room. The fit after made-to-measure was flawless.', name: 'Ananya R.', loc: 'Verified · Jaipur' },
  { stars: 5, txt: 'Heirloom quality. The gota-patti border is even more luminous in person than the photos. Worth every rupee.', name: 'Meghna S.', loc: 'Verified · Mumbai' },
  { stars: 4, txt: 'Stunning craftsmanship and the stylist was so patient with my measurements. Took 4 weeks but absolutely worth the wait.', name: 'Priya K.', loc: 'Verified · Delhi' },
];

const LOOK = [
  { nm: 'Kundan Rani Odhni', ty: 'Bandhej · Georgette', pr: '₹6,800', img: IMG.i },
  { nm: 'Polki Jhumka Set', ty: 'Temple · 22k Gold-plate', pr: '₹3,200', img: IMG.j },
  { nm: 'Zari Embroidered Juttis', ty: 'Handcrafted · Velvet', pr: '₹2,400', img: IMG.h },
  { nm: 'Silk Potli Clutch', ty: 'Gota Patti · Raw Silk', pr: '₹1,900', img: IMG.d },
];

const RELATED = [
  { nm: 'Mirror Mahal Lehenga', ty: 'Sheesha · Georgette', pr: '₹16,750', img: IMG.b, flag: 'Trending' },
  { nm: 'Chanderi Gold Saree', ty: 'Zari · Chanderi Silk', pr: '₹7,600', was: '₹9,200', img: IMG.f, flag: 'Off 17%' },
  { nm: 'Darbar Velvet Lehenga', ty: 'Zardozi · Silk Velvet', pr: '₹22,400', img: IMG.c },
  { nm: 'Sanganeri Suit Set', ty: 'Hand-Block · Cotton', pr: '₹4,990', img: IMG.g, flag: 'New' },
];

/* ---------- ICONS ---------- */
const Ic = {
  search: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>,
  user: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg>,
  cart: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 8h12l-1 12H7L6 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>,
  zoom: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5M11 8v6M8 11h6"/></svg>,
  heart: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 20s-7-4.4-7-9.5A3.6 3.6 0 0 1 12 8a3.6 3.6 0 0 1 7 2.5C19 15.6 12 20 12 20Z"/></svg>,
  plus: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M12 5v14M5 12h14"/></svg>,
  check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path className="check" d="M5 12.5l4.2 4.5L19 7"/></svg>,
  verify: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M12 3l2 2 3-.3.6 2.9L20 9l-1.4 2.5L20 14l-2.4 1.4L17 18l-3-.3-2 2-2-2-3 .3-.6-2.6L4 14l1.4-2.5L4 9l2.4-1.4L7 4.7 10 5z"/><path d="M9 12l2 2 4-4"/></svg>,
  ship: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M3 7h13v9H3zM16 10h3l2 3v3h-5z"/><circle cx="7" cy="17" r="1.6"/><circle cx="18" cy="17" r="1.6"/></svg>,
  scissor: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><path d="M8 8l12 8M8 16L20 8"/></svg>,
  shield: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/><path d="M9 12l2 2 4-4"/></svg>,
};

function Stars({ n, c }) {
  const full = Math.floor(n);
  const half = n - full >= 0.5;
  let s = '';
  for (let k = 0; k < 5; k++) s += k < full ? '★' : (k === full && half ? '⯪' : '☆');
  // ⯪ may not render; fall back to filled for the half
  s = '★'.repeat(full) + (half ? '★' : '') + '☆'.repeat(5 - full - (half ? 1 : 0));
  return <span className="stars" style={c ? { color: c } : null}>{s}</span>;
}

/* ---------- CART CONTEXT (per page) ---------- */
const PdpCtx = createContext({ addToCart: () => {} });

function PageShell({ navHot, children }) {
  const [count, setCount] = useState(2);
  const [bump, setBump] = useState(false);
  const [toast, setToast] = useState(null);
  const tRef = useRef();

  const addToCart = (payload) => {
    setCount((c) => c + (payload.qty || 1));
    setBump(false);
    requestAnimationFrame(() => setBump(true));
    setTimeout(() => setBump(false), 600);
    setToast(payload);
    clearTimeout(tRef.current);
    tRef.current = setTimeout(() => setToast(null), 4200);
  };

  return (
    <PdpCtx.Provider value={{ addToCart }}>
      <div className="pdp">
        <MiniHeader count={count} bump={bump} hot={navHot} />
        {children}
        <Toast data={toast} onClose={() => setToast(null)} />
      </div>
    </PdpCtx.Provider>
  );
}

function MiniHeader({ count, bump, hot }) {
  const links = ['Lehenga', 'Jaipuri Odhni', 'Saree', 'Suits', 'Dupatta'];
  return (
    <header className="ph-head">
      <nav>
        {links.map((l) => <a key={l} href="#" className={l === (hot || 'Lehenga') ? 'hot' : ''}>{l}</a>)}
      </nav>
      <a href="#" className="ph-logo">
        <span className="mark">AV CREATION</span>
        <span className="sub">Jaipuri Atelier · Rajasthan</span>
      </a>
      <div className="ph-acts">
        <button aria-label="Search">{Ic.search}</button>
        <button aria-label="Account">{Ic.user}</button>
        <button className="ph-cart" aria-label="Cart">{Ic.cart}<span className={'badge' + (bump ? ' bump' : '')}>{count}</span></button>
      </div>
    </header>
  );
}

function Crumb() {
  return (
    <div className="crumb">
      <a href="#">Home</a><span className="sep">/</span>
      <a href="#">Lehenga</a><span className="sep">/</span>
      <a href="#">Bridal Atelier</a><span className="sep">/</span>
      <span className="cur">Rani Bagh</span>
    </div>
  );
}

function Toast({ data, onClose }) {
  return (
    <div className={'toast' + (data ? ' show' : '')}>
      <button className="tclose" onClick={onClose}>×</button>
      <div className="tthumb"><img src={(data && data.thumb) || PRODUCT.images[0]} alt="" /></div>
      <div className="tinfo">
        <div className="ok">{Ic.check} Added to bag</div>
        <div className="tn">{(data && data.name) || PRODUCT.name}</div>
        <div className="tv">{(data && data.variant) || ''}</div>
        <span className="tgo">View bag →</span>
      </div>
    </div>
  );
}

/* ---------- GALLERY ---------- */
function ZoomStage({ images, idx, flag, arch }) {
  const [zoom, setZoom] = useState(false);
  const ref = useRef();
  const onMove = (e) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - r.top) / r.height) * 100));
    const img = el.querySelector('.gimg.show');
    if (img) img.style.transformOrigin = x + '% ' + y + '%';
  };
  return (
    <div className={'g-stage' + (arch ? ' arch' : '') + (zoom ? ' zooming' : '')}>
      <div className={'g-frame' + (zoom ? ' zoom' : '')} ref={ref}
        onMouseEnter={() => setZoom(true)} onMouseLeave={() => setZoom(false)} onMouseMove={onMove}>
        {images.map((src, k) => <img key={k} className={'gimg' + (k === idx ? ' show' : '')} src={src} alt="" />)}
      </div>
      <div className="gold-inset"></div>
      {flag && <span className="g-flag">{flag}</span>}
      <span className="g-zoomhint">{Ic.zoom} Hover to zoom</span>
    </div>
  );
}

function GalleryClassic({ images, flag, arch }) {
  const [idx, setIdx] = useState(0);
  return (
    <div className="gal-classic">
      <div className="g-rail">
        {images.map((src, k) => (
          <div key={k} className={'g-thumb' + (k === idx ? ' on' : '')} onClick={() => setIdx(k)}>
            <img src={src} alt={'View ' + (k + 1)} />
          </div>
        ))}
      </div>
      <ZoomStage images={images} idx={idx} flag={flag} arch={arch} />
    </div>
  );
}

function GalleryEditorial({ images, flag }) {
  const [idx, setIdx] = useState(0);
  return (
    <div className="gal-ed">
      <ZoomStage images={images} idx={idx} flag={flag} />
      <div className="g-row">
        {images.map((src, k) => (
          <div key={k} className={'g-thumb' + (k === idx ? ' on' : '')} onClick={() => setIdx(k)}>
            <img src={src} alt={'View ' + (k + 1)} />
          </div>
        ))}
      </div>
    </div>
  );
}

function GalleryBoutique({ images, flag }) {
  return (
    <div className="gal-bt">
      <div className="m tall">
        <img src={images[0]} alt="Front" />
        {flag && <span className="mflag">{flag}</span>}
      </div>
      <div className="m sq"><img src={images[1]} alt="Detail" /><span className="mtag">Zardozi border</span></div>
      <div className="m sq"><img src={images[3]} alt="Drape" /><span className="mtag">Net dupatta</span></div>
    </div>
  );
}

/* ---------- BUY BOX ---------- */
function AddToCartButton({ product, color, size, qty }) {
  const { addToCart } = useContext(PdpCtx);
  const [st, setSt] = useState('idle');
  const click = () => {
    if (st !== 'idle') return;
    setSt('adding');
    setTimeout(() => {
      setSt('added');
      addToCart({ name: product.name, variant: color.name + ' · Size ' + size, thumb: product.images[0], qty });
      setTimeout(() => setSt('idle'), 1900);
    }, 700);
  };
  return (
    <button className="addbtn" data-state={st} onClick={click}>
      <span className="lab l-add">{Ic.cart} Add to Bag · {product.price}</span>
      <span className="lab l-adding"><span className="spin"></span> Adding…</span>
      <span className="lab l-added">{Ic.check} Added to Bag</span>
    </button>
  );
}

function BuyBox({ variant, panel, showAccordion }) {
  const p = PRODUCT;
  const [color, setColor] = useState(p.colors[0]);
  const [size, setSize] = useState('M');
  const [qty, setQty] = useState(1);
  const [wish, setWish] = useState(false);
  const [guide, setGuide] = useState(false);

  return (
    <div className={'bb ' + variant + (panel ? ' panel' : '')}>
      <span className="eyebrow bb-eye">Bridal Atelier · Made to Measure</span>
      <h1>{p.name}</h1>
      <div className="sub-craft">{p.craft}</div>

      <div className="rate">
        <Stars n={p.rating} />
        <span className="rn"><b>{p.rating}</b> / 5</span>
        <a href="#reviews">{p.reviews} reviews</a>
      </div>

      <div className="priceline">
        <span className="price">{p.price}</span>
        <span className="was">{p.was}</span>
        <span className="off">{p.off}</span>
      </div>
      <div className="tax">Inclusive of all taxes · Custom-stitched to your measures</div>

      <p className="desc">{p.desc}</p>

      <div className="grp">
        <div className="grp-head"><span className="lab">Colour <b>{color.name}</b></span></div>
        <div className="swatches">
          {p.colors.map((c) => (
            <span key={c.name} className={'sw' + (c.name === color.name ? ' on' : '')} style={{ background: c.hex }} title={c.name} onClick={() => setColor(c)}></span>
          ))}
        </div>
      </div>

      <div className="grp">
        <div className="grp-head">
          <span className="lab">Select Size</span>
          <span className="gd" onClick={() => setGuide((g) => !g)}>{guide ? 'Hide size guide' : 'Size guide'}</span>
        </div>
        <div className="sizes">
          {p.sizes.map((s) => (
            <button key={s} className={'size' + (s === size ? ' on' : '')} onClick={() => setSize(s)}>{s}</button>
          ))}
          <button className={'size custom' + (size === 'Custom' ? ' on' : '')} onClick={() => setSize('Custom')}>Custom</button>
        </div>
        {guide && <SizeGuide />}
      </div>

      <div className="buy-row">
        <div className="qty">
          <button onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
          <span className="n">{qty}</span>
          <button onClick={() => setQty((q) => q + 1)}>+</button>
        </div>
        <AddToCartButton product={p} color={color} size={size} qty={qty} />
        <button className={'wishbtn' + (wish ? ' on' : '')} onClick={() => setWish((w) => !w)} aria-label="Wishlist">{Ic.heart}</button>
      </div>
      <button className="buynow">Buy It Now</button>

      <div className="bb-trust">
        <div className="t">{Ic.ship}<div className="tt">Free Shipping</div><div className="ts">Insured · Pan-India</div></div>
        <div className="t">{Ic.scissor}<div className="tt">Made to Measure</div><div className="ts">Stitched to fit</div></div>
        <div className="t">{Ic.shield}<div className="tt">Secure Checkout</div><div className="ts">UPI · Cards · COD</div></div>
      </div>

      {showAccordion && <Accordion items={ACCORDION} />}
    </div>
  );
}

function SizeGuide() {
  return (
    <div style={{ marginTop: 14, border: '1px solid var(--line-2)', borderRadius: 10, overflow: 'hidden', background: '#fff' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
        <thead>
          <tr style={{ background: 'var(--bg-2)' }}>
            {['Size', 'Bust (in)', 'Waist (in)', 'Hip (in)'].map((h) => (
              <th key={h} style={{ textAlign: 'left', padding: '11px 14px', fontWeight: 500, letterSpacing: '.06em', color: 'var(--ink-soft)', fontFamily: 'var(--sans)' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SIZE_CHART.map((row) => (
            <tr key={row[0]} style={{ borderTop: '1px solid var(--line-2)' }}>
              {row.map((cell, i) => (
                <td key={i} style={{ padding: '10px 14px', color: i === 0 ? 'var(--ink)' : 'var(--ink-soft)', fontWeight: i === 0 ? 600 : 400, fontFamily: i === 0 ? 'var(--serif)' : 'var(--sans)', fontSize: i === 0 ? 15 : 12.5 }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ padding: '11px 14px', fontSize: 11.5, color: 'var(--muted)', borderTop: '1px solid var(--line-2)' }}>
        Prefer a perfect fit? Choose <b style={{ color: 'var(--rani)' }}>Custom</b> and our stylist will collect your exact measurements after checkout.
      </div>
    </div>
  );
}

function Accordion({ items }) {
  const [open, setOpen] = useState(-1);
  return (
    <div className="acc">
      {items.map((it, i) => (
        <div key={i} className={'item' + (open === i ? ' open' : '')}>
          <button className="q" onClick={() => setOpen(open === i ? -1 : i)}>
            {it.q}<span className="ic"></span>
          </button>
          <div className="a" style={{ maxHeight: open === i ? 200 : 0 }}>
            <div className="inner" dangerouslySetInnerHTML={{ __html: it.a }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- FULL-PAGE SECTIONS ---------- */
function CraftBand() {
  return (
    <section className="craft">
      <div className="cart-img">
        <div className="gold-inset"></div>
        <div className="ph"><img src={IMG.e} alt="Zardozi handwork detail" /></div>
      </div>
      <div>
        <span className="eyebrow">The House Craft</span>
        <h2>Woven by hand, <em>over months</em></h2>
        <p className="lead">Every Rani Bagh lehenga begins as a bare length of raw silk. Our karigars in Jaipur trace, couch and embroider each motif by hand — no two pieces are ever quite alike.</p>
        <div className="specs">
          <div className="s"><div className="st">Technique</div><div className="sv">Zardozi & Gota Patti</div></div>
          <div className="s"><div className="st">Base Fabric</div><div className="sv">Raw Banarasi Silk</div></div>
          <div className="s"><div className="st">Crafting Time</div><div className="sv">Approx. 90 days</div></div>
          <div className="s"><div className="st">Includes</div><div className="sv">Lehenga · Blouse · Dupatta</div></div>
        </div>
      </div>
    </section>
  );
}

function ReviewsSection() {
  const dist = [['5★', 86], ['4★', 9], ['3★', 3], ['2★', 1], ['1★', 1]];
  return (
    <section className="sec" id="reviews">
      <div className="sec-title">
        <span className="eyebrow">Loved by Brides</span>
        <h2>What our <em>customers</em> say</h2>
        <div className="orn"><span className="d">✦</span></div>
      </div>
      <div className="rv-top">
        <div className="rv-score">
          <div className="big">4.9</div>
          <Stars n={4.9} />
          <div className="cnt">Based on 128 reviews</div>
        </div>
        <div className="rv-bars">
          {dist.map(([l, pc]) => (
            <div className="bar" key={l}>
              <span className="lab">{l}</span>
              <span className="track"><span className="fill" style={{ width: pc + '%' }}></span></span>
              <span className="pc">{pc}%</span>
            </div>
          ))}
        </div>
      </div>
      <div className="rv-grid">
        {REVIEWS.map((r, i) => (
          <div className="rv-card" key={i}>
            <Stars n={r.stars} />
            <div className="txt">“{r.txt}”</div>
            <div className="who">
              <div className="av">{r.name[0]}</div>
              <div>
                <div className="nm">{r.name}</div>
                <div className="vf">{Ic.verify} {r.loc}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ShopTheLook() {
  const { addToCart } = useContext(PdpCtx);
  return (
    <section className="sec tint">
      <div className="sec-title">
        <span className="eyebrow">Complete the Ensemble</span>
        <h2>Shop the <em>Look</em></h2>
        <div className="orn"><span className="d">✦</span></div>
      </div>
      <div className="stl">
        <div className="stl-art">
          <div className="ph"><img src={IMG.b} alt="Styled bridal look" /></div>
          <div className="dot" style={{ top: '20%', left: '42%' }}></div>
          <div className="dot" style={{ top: '50%', left: '58%' }}></div>
          <div className="dot" style={{ top: '74%', left: '38%' }}></div>
        </div>
        <div>
          <div className="stl-list">
            {LOOK.map((l) => (
              <div className="li" key={l.nm}>
                <div className="th"><img src={l.img} alt={l.nm} /></div>
                <div className="info">
                  <div className="nm">{l.nm}</div>
                  <div className="ty">{l.ty}</div>
                  <div className="pr">{l.pr}</div>
                </div>
                <button className="add" aria-label={'Add ' + l.nm} onClick={() => addToCart({ name: l.nm, variant: l.ty, thumb: l.img, qty: 1 })}>{Ic.plus}</button>
              </div>
            ))}
          </div>
          <button className="set-all" onClick={() => addToCart({ name: 'The Rani Bagh Look — 4 pieces', variant: 'Complete ensemble', thumb: IMG.b, qty: 4 })}>Add Full Look to Bag →</button>
        </div>
      </div>
    </section>
  );
}

function Related() {
  return (
    <section className="sec">
      <div className="sec-title">
        <span className="eyebrow">More from the Atelier</span>
        <h2>You may also <em>love</em></h2>
        <div className="orn"><span className="d">✦</span></div>
      </div>
      <div className="prods">
        {RELATED.map((p) => (
          <article className="prod" key={p.nm}>
            <div className="imgwrap">
              <div className="ph"><img src={p.img} alt={p.nm} /></div>
              {p.flag && <span className="flag">{p.flag}</span>}
              <button className="qa">Quick View</button>
            </div>
            <div className="pname">{p.nm}</div>
            <div className="ptype">{p.ty}</div>
            <div className="pmeta">
              <span className="price">{p.pr}</span>
              {p.was && <span className="was">{p.was}</span>}
              <span className="stars">★★★★★</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function SlimFooter() {
  return (
    <footer className="pfoot">
      <span className="mark">AV CREATION</span>
      <span>© 2026 · Hand-blocked in Jaipur, the Pink City</span>
      <div className="pay"><span>UPI</span><span>Visa</span><span>Mastercard</span><span>COD</span></div>
    </footer>
  );
}

Object.assign(window, {
  PRODUCT, IMG, Ic, Stars, PdpCtx, PageShell, MiniHeader, Crumb, Toast,
  GalleryClassic, GalleryEditorial, GalleryBoutique, ZoomStage,
  BuyBox, Accordion, ACCORDION, SizeGuide,
  CraftBand, ReviewsSection, ShopTheLook, Related, SlimFooter,
});
