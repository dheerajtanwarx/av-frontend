/* ============================================================
   AV Creation — Cart page · line items, summary, promo, cross-sell
   ============================================================ */
const { useState: useStateC } = React;

/* ---------- ORDER SUMMARY (reused on cart) ---------- */
function PromoBox() {
  const { promo, setPromo, subtotal } = useFlow();
  const [code, setCode] = useStateC('');
  const [msg, setMsg] = useStateC(null);
  const apply = () => {
    const key = code.trim().toUpperCase();
    if (!key) return;
    if (PROMOS[key]) { setPromo({ code: key, ...PROMOS[key] }); setMsg(null); setCode(''); }
    else setMsg({ type: 'err', text: 'That code isn’t valid. Try RANI10.' });
  };
  if (promo) {
    return (
      <div className="promo">
        <div className="applied">
          <span className="code">{Ic.tag} {promo.code} — {promo.label}</span>
          <button className="rm" onClick={() => setPromo(null)}>Remove</button>
        </div>
      </div>
    );
  }
  return (
    <div className="promo">
      <div className="field">
        <input value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && apply()} placeholder="Gift card or promo code" />
        <button className="apply" onClick={apply}>Apply</button>
      </div>
      {msg && <div className={'msg ' + msg.type}>{Ic.info} {msg.text}</div>}
    </div>
  );
}

function OrderSummary() {
  const { subtotal, savings, discount, total, go, count } = useFlow();
  return (
    <div className="summary">
      <h3>Order Summary</h3>
      <div className="gold-rule"></div>
      <div className="sum-rows">
        <div className="r"><span>Subtotal <span className="muted">· {count} {count === 1 ? 'item' : 'items'}</span></span><span className="v">{inr(subtotal)}</span></div>
        {savings > 0 && <div className="r disc"><span>Atelier savings</span><span className="v">−{inr(savings)}</span></div>}
        {discount > 0 && <div className="r disc"><span>Promo discount</span><span className="v">−{inr(discount)}</span></div>}
        <div className="r"><span>Insured shipping</span><span className="free">Free</span></div>
        <div className="r"><span>Estimated delivery</span><span className="muted">3–4 weeks · made to order</span></div>
      </div>
      <PromoBox />
      <div className="sum-total">
        <div className="l">Total <span>Inclusive of all taxes</span></div>
        <div className="amt">{inr(total)}</div>
      </div>
      <button className="checkout-cta" onClick={() => go('checkout')}>{Ic.lock} Proceed to Checkout</button>
      <div className="sum-trust">
        <span className="ti">{Ic.shield} Secure payment</span>
        <span className="ti">{Ic.scissor} Made to measure</span>
      </div>
      <div className="sum-pay"><span>UPI</span><span>Visa</span><span>Mastercard</span><span>COD</span></div>
    </div>
  );
}

/* ---------- LINE ITEM ---------- */
function CartLine({ item }) {
  const { setQty, remove } = useFlow();
  const [leaving, setLeaving] = useStateC(false);
  const doRemove = () => { setLeaving(true); setTimeout(() => remove(item.id), 360); };
  return (
    <div className={'citem' + (leaving ? ' removing' : '')}>
      <div className="pic">
        <img src={item.img} alt={item.name} />
        {item.madeToMeasure && <span className="mtm">Made to Order</span>}
      </div>
      <div className="mid">
        <div className="nm">{item.name}</div>
        <div className="ty">{item.type}</div>
        <div className="opts">
          <span className="opt"><span className="sw" style={{ background: item.color.hex }}></span>{item.color.name}</span>
          {item.madeToMeasure
            ? <span className="opt mtm">{Ic.scissor} Custom — Made to Measure</span>
            : <span className="opt">Size · {item.size}</span>}
        </div>
        {item.note && <div className="stylenote">{Ic.needle} {item.note}</div>}
        <div className="row-actions">
          <button onClick={doRemove}>{Ic.trash} Remove</button>
          <button>{Ic.heart} Move to wishlist</button>
        </div>
      </div>
      <div className="right">
        <div>
          <div className="price">{inr(item.price * item.qty)}</div>
          {item.was && <div className="was">{inr(item.was * item.qty)}</div>}
        </div>
        <div className="qty">
          <button onClick={() => setQty(item.id, item.qty - 1)} disabled={item.qty <= 1}>−</button>
          <span className="n">{item.qty}</span>
          <button onClick={() => setQty(item.id, item.qty + 1)}>+</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- CROSS SELL ---------- */
function CompleteTheLook() {
  const { add, bag } = useFlow();
  const inBag = (id) => bag.some((i) => i.id === id);
  return (
    <section className="ctl">
      <div className="head">
        <h2>Complete the <em>ensemble</em></h2>
        <div className="rule"></div>
      </div>
      <div className="ctl-row">
        {CROSS_SELL.map((p) => (
          <div className="ctl-card" key={p.id}>
            <div className="th"><img src={p.img} alt={p.nm} /></div>
            <div className="info">
              <div className="nm">{p.nm}</div>
              <div className="ty">{p.ty}</div>
              <div className="pr">{inr(p.pr)}</div>
            </div>
            <button className={'add' + (inBag(p.id) ? ' done' : '')} aria-label={'Add ' + p.nm}
              onClick={() => !inBag(p.id) && add({ id: p.id, name: p.nm, type: p.ty, color: p.color, size: p.size, madeToMeasure: false, price: p.pr, was: null, qty: 1, img: p.img })}>
              {inBag(p.id) ? Ic.check : Ic.plus}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- EMPTY ---------- */
function EmptyCart() {
  const { go } = useFlow();
  return (
    <div className="empty">
      <div className="ring">{Ic.bag}</div>
      <h2>Your bag awaits its treasures</h2>
      <p>Nothing here yet. Explore the atelier’s hand-crafted lehengas, sarees and heirloom jewellery.</p>
      <button className="cta" onClick={() => go('cart')}>{Ic.arrowL} Continue Shopping</button>
    </div>
  );
}

/* ---------- CART PAGE ---------- */
function CartPage() {
  const { bag, count, go } = useFlow();
  return (
    <div className="app">
      <Announce />
      <SiteHeader />
      <main className="wrap">
        <div className="page-head">
          <h1>Your <em>Bag</em></h1>
          <div className="meta">{count > 0 ? `${count} ${count === 1 ? 'piece' : 'pieces'} · reserved for you` : 'Empty for now'}</div>
        </div>
        {bag.length === 0 ? <EmptyCart /> : (
          <>
            <div className="cart-grid">
              <div className="cart-list">
                <div className="lh">
                  <span className="t"><b>{count}</b> {count === 1 ? 'item' : 'items'} in your bag</span>
                </div>
                {bag.map((i) => <CartLine key={i.id} item={i} />)}
                <div className="cart-foot">
                  <span className="cont" onClick={() => go('cart')}>{Ic.arrowL} Continue Shopping</span>
                  <span className="assured">{Ic.shield} Insured & gift-boxed from our Jaipur atelier</span>
                </div>
              </div>
              <OrderSummary />
            </div>
            <CompleteTheLook />
          </>
        )}
      </main>
      <SlimFooter />
    </div>
  );
}

Object.assign(window, { CartPage, OrderSummary, PromoBox, CartLine, CompleteTheLook, EmptyCart });
