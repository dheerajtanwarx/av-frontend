"use client";

import { Fragment } from "react";
import Link from "next/link";
import type { PdpProduct } from "../../lib/pdp-data";
import { Ic, Stars } from "./icons";
import { usePdp } from "./PdpContext";

/* Render *asterisk* wrapped phrases as the rani-pink italic emphasis. */
function emphasize(text: string) {
  return text.split(/\*(.+?)\*/g).map((part, i) =>
    i % 2 === 1 ? <em key={i}>{part}</em> : <Fragment key={i}>{part}</Fragment>
  );
}

export function CraftBand({ product }: { product: PdpProduct }) {
  const c = product.craftBand;
  return (
    <section className="craft">
      <div className="cart-img">
        <div className="gold-inset" />
        <div className="ph">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={c.image} alt={`${product.name} handwork detail`} />
        </div>
      </div>
      <div>
        <span className="eyebrow">{c.eyebrow}</span>
        <h2>{emphasize(c.title)}</h2>
        <p className="lead">{c.lead}</p>
        <div className="specs">
          {c.specs.map((s) => (
            <div className="s" key={s.st}>
              <div className="st">{s.st}</div>
              <div className="sv">{s.sv}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ReviewsSection({ product }: { product: PdpProduct }) {
  return (
    <section className="sec" id="reviews">
      <div className="sec-title">
        <span className="eyebrow">Loved by Many</span>
        <h2>
          What our <em>customers</em> say
        </h2>
        <div className="orn">
          <span className="d">✦</span>
        </div>
      </div>
      <div className="rv-top">
        <div className="rv-score">
          <div className="big">{product.rating}</div>
          <Stars n={product.rating} />
          <div className="cnt">Based on {product.reviewCount} reviews</div>
        </div>
        <div className="rv-bars">
          {product.reviewDist.map(([label, pc]) => (
            <div className="bar" key={label}>
              <span className="lab">{label}</span>
              <span className="track">
                <span className="fill" style={{ width: `${pc}%` }} />
              </span>
              <span className="pc">{pc}%</span>
            </div>
          ))}
        </div>
      </div>
      <div className="rv-grid">
        {product.reviews.map((r, i) => (
          <div className="rv-card" key={i}>
            <Stars n={r.stars} />
            <div className="txt">&ldquo;{r.txt}&rdquo;</div>
            <div className="who">
              <div className="av">{r.name[0]}</div>
              <div>
                <div className="nm">{r.name}</div>
                <div className="vf">
                  {Ic.verify} {r.loc}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ShopTheLook({ product }: { product: PdpProduct }) {
  const { addToCart } = usePdp();
  const total = product.look.length;
  return (
    <section className="sec tint">
      <div className="sec-title">
        <span className="eyebrow">Complete the Ensemble</span>
        <h2>
          Shop the <em>Look</em>
        </h2>
        <div className="orn">
          <span className="d">✦</span>
        </div>
      </div>
      <div className="stl">
        <div className="stl-art">
          <div className="ph">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.lookImage} alt={`${product.name} styled look`} />
          </div>
          <div className="dot" style={{ top: "20%", left: "42%" }} />
          <div className="dot" style={{ top: "50%", left: "58%" }} />
          <div className="dot" style={{ top: "74%", left: "38%" }} />
        </div>
        <div>
          <div className="stl-list">
            {product.look.map((l) => (
              <div className="li" key={l.nm}>
                <div className="th">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={l.image} alt={l.nm} />
                </div>
                <div className="info">
                  <div className="nm">{l.nm}</div>
                  <div className="ty">{l.ty}</div>
                  <div className="pr">{l.pr}</div>
                </div>
                <button
                  className="add"
                  aria-label={`Add ${l.nm}`}
                  onClick={() => addToCart({ name: l.nm, variant: l.ty, thumb: l.image, qty: 1 })}
                >
                  {Ic.plus}
                </button>
              </div>
            ))}
          </div>
          <button
            className="set-all"
            onClick={() =>
              addToCart({
                name: `The ${product.name} Look — ${total} pieces`,
                variant: "Complete ensemble",
                thumb: product.lookImage,
                qty: total,
              })
            }
          >
            Add Full Look to Bag →
          </button>
        </div>
      </div>
    </section>
  );
}

export function Related({ product }: { product: PdpProduct }) {
  return (
    <section className="sec">
      <div className="sec-title">
        <span className="eyebrow">More from the Atelier</span>
        <h2>
          You may also <em>love</em>
        </h2>
        <div className="orn">
          <span className="d">✦</span>
        </div>
      </div>
      <div className="prods">
        {product.related.map((p) => (
          <article className="prod" key={p.slug}>
            <div className="imgwrap">
              <Link href={`/product/${p.slug}`} className="ph" aria-label={p.nm}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image} alt={p.nm} />
              </Link>
              {p.flag && <span className="flag">{p.flag}</span>}
              <Link href={`/product/${p.slug}`} className="qa">
                View Product
              </Link>
            </div>
            <Link href={`/product/${p.slug}`} className="pname">
              {p.nm}
            </Link>
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

export function SlimFooter() {
  return (
    <footer className="pfoot">
      <span className="mark">AV CREATION</span>
      <span>© 2026 · Hand-blocked in Jaipur, the Pink City</span>
      <div className="pay">
        <span>UPI</span>
        <span>Visa</span>
        <span>Mastercard</span>
        <span>COD</span>
      </div>
    </footer>
  );
}
