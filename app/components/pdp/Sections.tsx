"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { PdpProduct, PdpReview } from "../../lib/pdp-data";
import { recommendedFor } from "../../lib/pdp-data";
import { Ic, Stars } from "./icons";
import { usePdp } from "./PdpContext";
import { useWishlist } from "../landing/WishlistContext";
import { HeartIcon } from "../landing/Icons";
import { parseINR } from "../../lib/cart-data";
import { fetchReviews } from "../../lib/api";

const LOOK_COLOR = { name: "Rani Pink", hex: "#bd3c6e" };

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
          <img src={c.image || undefined} alt={`${product.name} handwork detail`} />
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
  // Live review data from the backend — the authoritative count, list and
  // rating distribution for this product. Starts null and is filled on mount;
  // until then we render nothing review-specific to avoid flashing seed data.
  const [live, setLive] = useState<{
    reviews: PdpReview[];
    reviewDist: [string, number][];
    count: number;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchReviews(product.slug)
      .then((res) => {
        if (!cancelled) setLive(res);
      })
      .catch(() => {
        // Backend unreachable — fall back to whatever shipped with the product.
        if (!cancelled)
          setLive({
            reviews: product.reviews,
            reviewDist: product.reviewDist,
            count: product.reviewCount,
          });
      });
    return () => {
      cancelled = true;
    };
  }, [product.slug, product.reviews, product.reviewDist, product.reviewCount]);

  const count = live?.count ?? 0;
  const reviews = live?.reviews ?? [];
  const reviewDist = live?.reviewDist ?? [];
  // Average from the real reviews; fall back to the stored aggregate.
  const avg =
    reviews.length > 0
      ? Math.round((reviews.reduce((s, r) => s + r.stars, 0) / reviews.length) * 10) / 10
      : product.rating;

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
      {live === null ? (
        <div className="rv-loading">Loading reviews…</div>
      ) : count === 0 ? (
        <div className="rv-empty">
          {Ic.verify} No reviews yet — be the first to review this piece.
        </div>
      ) : (
        <>
          <div className="rv-top">
            <div className="rv-score">
              <div className="big">{avg}</div>
              <div className="rv-outof">out of 5</div>
              <div className="cnt">
                Based on {count} {count === 1 ? "review" : "reviews"}
              </div>
            </div>
            <div className="rv-bars">
              {reviewDist.map(([label, pc]) => (
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
            {reviews.map((r, i) => (
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
        </>
      )}
    </section>
  );
}

export function ShopTheLook({ product }: { product: PdpProduct }) {
  const { addToCart } = usePdp();
  const total = product.look.length;
  const addLookItem = (item: Parameters<typeof addToCart>[0]) => {
    void addToCart(item);
  };
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
            <img src={product.lookImage || undefined} alt={`${product.name} styled look`} />
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
                  <img src={l.image || undefined} alt={l.nm} />
                </div>
                <div className="info">
                  <div className="nm">{l.nm}</div>
                  <div className="ty">{l.ty}</div>
                  <div className="pr">{l.pr}</div>
                </div>
                <button
                  className="add"
                  aria-label={`Add ${l.nm}`}
                  onClick={() =>
                    addLookItem({
                      id: `look-${l.nm}`,
                      name: l.nm,
                      type: l.ty,
                      color: LOOK_COLOR,
                      size: "One Size",
                      madeToMeasure: false,
                      price: parseINR(l.pr),
                      was: null,
                      qty: 1,
                      img: l.image,
                    })
                  }
                >
                  {Ic.plus}
                </button>
              </div>
            ))}
          </div>
          <button
            className="set-all"
            onClick={() =>
              addLookItem({
                id: `look-set-${product.slug}`,
                name: `The ${product.name} Look — ${total} pieces`,
                type: "Complete ensemble",
                color: LOOK_COLOR,
                size: "One Size",
                madeToMeasure: false,
                price: product.look.reduce((s, l) => s + parseINR(l.pr), 0),
                was: null,
                qty: 1,
                img: product.lookImage,
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
  // Categorised recommendations pulled from the live storefront pools, so the
  // shopper sees genuinely different pieces — not just more of this category.
  const items = useMemo(() => recommendedFor(product.slug), [product.slug]);
  const cats = useMemo(
    () => ["All", ...Array.from(new Set(items.map((i) => i.cat)))],
    [items]
  );
  const [cat, setCat] = useState("All");
  const shown = cat === "All" ? items : items.filter((i) => i.cat === cat);

  const { addToCart } = usePdp();
  const { isWished, toggle } = useWishlist();
  // Brief "✓ Added" confirmation on the card just acted on.
  const [added, setAdded] = useState<string | null>(null);

  const onWish = (p: (typeof items)[number]) =>
    toggle({
      slug: p.slug,
      name: p.nm,
      type: p.ty,
      price: p.pr,
      was: p.was ?? null,
      img: p.image,
    });

  const onAdd = async (p: (typeof items)[number]) => {
    const ok = await addToCart({
      id: p.slug,
      name: p.nm,
      type: p.ty,
      color: LOOK_COLOR,
      size: "Free Size",
      madeToMeasure: false,
      price: parseINR(p.pr),
      was: p.was ? parseINR(p.was) : null,
      qty: 1,
      img: p.image,
    });
    if (!ok) return;
    setAdded(p.slug);
    setTimeout(() => setAdded((s) => (s === p.slug ? null : s)), 1100);
  };

  return (
    <section className="sec reco">
      <div className="sec-title">
        <span className="eyebrow">More from the Atelier</span>
        <h2>
          You may also <em>like</em>
        </h2>
        <div className="orn">
          <span className="d">✦</span>
        </div>
      </div>
      {/* Category chips — horizontally scrollable on mobile alongside the rail. */}
      <div className="reco-cats" role="tablist" aria-label="Filter recommendations">
        {cats.map((c) => (
          <button
            key={c}
            role="tab"
            aria-selected={c === cat}
            className={`reco-cat${c === cat ? " on" : ""}`}
            onClick={() => setCat(c)}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="prods reco-rail">
        {shown.map((p) => (
          <article className="prod" key={p.slug}>
            <div className="imgwrap">
              <Link href={`/product/${p.slug}`} className="ph" aria-label={p.nm}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image || undefined} alt={p.nm} />
              </Link>
              {p.flag && <span className="flag">{p.flag}</span>}
              <button
                type="button"
                className={`wish${isWished(p.slug) ? " on" : ""}`}
                aria-label={isWished(p.slug) ? "Remove from wishlist" : "Add to wishlist"}
                aria-pressed={isWished(p.slug)}
                onClick={() => onWish(p)}
              >
                <HeartIcon filled={isWished(p.slug)} />
              </button>
              <button type="button" className="qa" onClick={() => onAdd(p)}>
                {added === p.slug ? "✓ Added" : "Add to Bag"}
              </button>
            </div>
            <Link href={`/product/${p.slug}`} className="pname">
              {p.nm}
            </Link>
            <div className="ptype">{p.ty}</div>
            <div className="pmeta">
              <span className="price">{p.pr}</span>
              {p.was && <span className="was">{p.was}</span>}
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
