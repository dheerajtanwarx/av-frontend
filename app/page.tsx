import {
  categories as staticCategories,
  editorial,
  img,
  lookbook,
  mapEmbedUrl,
  mapLinkUrl,
  odhniFeatures,
  reels,
  stores,
  trust,
} from "./lib/landing-data";
import { fetchProducts, fetchCategories } from "./lib/api";
import Header from "./components/landing/Header";
import HeroCarousel from "./components/landing/HeroCarousel";
import ScrollReveal from "./components/landing/ScrollReveal";
import ProductCard from "./components/landing/ProductCard";
import Footer from "./components/landing/Footer";
import {
  PlayIcon,
  trustIcons,
} from "./components/landing/Icons";

function MultilineTitle({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, i) => (
        <span key={i}>
          {i > 0 && <br />}
          {line}
        </span>
      ))}
    </>
  );
}

export default async function Home() {
  // Pull the live catalog from the API; fall back to the bundled static
  // content if the backend is unreachable so the page always renders.
  const [odhniEdit, bestsellers, categories] = await Promise.all([
    fetchProducts({ category: "jaipuri-odhni" }).catch(() => []),
    fetchProducts({ bestseller: true }).catch(() => []),
    fetchCategories().catch(() => staticCategories),
  ]);

  return (
    <div className="av">
      <ScrollReveal />
      <Header />
      <HeroCarousel />

      {/* TRUST */}
      <div className="trust">
        <div className="wrap">
          {trust.map((t) => (
            <div className="it" key={t.t}>
              {trustIcons[t.icon]}
              <div className="t">{t.t}</div>
              <div className="s">{t.s}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CATEGORIES */}
      <section className="sec" id="shop">
        <div className="wrap">
          <div className="sec-title reveal">
            <span className="eyebrow">The Wardrobe</span>
            <h2>
              Shop by <em>Category</em>
            </h2>
            <div className="orn">
              <span className="d">✦</span>
            </div>
          </div>
          <div className="cats">
            {categories.map((c, i) => (
              <a
                className={`cat reveal ${["", "d1", "d2", "d3", "d4"][i] ?? ""}${
                  c.featured ? " feat" : ""
                }`}
                href={c.href}
                key={c.name}
              >
                <div className="imgw">
                  {c.featured && <span className="badge-feat">Signature</span>}
                  <div className="ph">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="main" src={img(c.main, 900) || undefined} alt={c.name} />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      className="alt"
                      src={img(c.alt, 900) || undefined}
                      alt={`${c.name} styled`}
                      loading="lazy"
                    />
                  </div>
                  <div className="label">
                    <div className="n">{c.name}</div>
                    <div className="c">{c.count}</div>
                    <div className="shop">
                      Explore <span>&rarr;</span>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* JAIPURI ODHNI SPOTLIGHT */}
      <section className="odhni" id="odhni">
        <div className="wrap">
          <div className="odhni-grid">
            <div className="odhni-art reveal">
              <div className="main">
                <div className="gold-line" />
                <div className="ph">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img("photo-1693336429270-094637e16d38", 1200)} alt="Jaipuri Odhni detail" />
                </div>
              </div>
              <div className="stamp">
                <div className="txt">
                  HAND
                  <br />
                  BLOCKED
                  <br />· JAIPUR ·
                </div>
              </div>
              <div className="float f1">
                <div className="ph">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img("premium_photo-1682096034925-468c545d1c12", 600)}
                    alt="Bandhej detail"
                  />
                </div>
                <div className="cap">Bandhej, up close</div>
              </div>
            </div>
            <div className="odhni-copy reveal d1">
              <span className="eyebrow">The House Signature</span>
              <h2>
                The Jaipuri <em>Odhni</em>
              </h2>
              <p className="lead">
                Our most-loved drape — tied, dyed and block-printed by hand in the lanes of Jaipur.
                No two are ever quite alike.
              </p>
              <div className="odhni-feats">
                {odhniFeatures.map((f) => (
                  <div className="f" key={f.ft}>
                    <div className="ft">{f.ft}</div>
                    <div className="fs">{f.fs}</div>
                  </div>
                ))}
              </div>
              <div className="odhni-cta">
                <a href="#new" className="btn btn-rani">
                  Shop the Odhni Edit
                </a>
                <a href="#look" className="btn btn-line">
                  How it&apos;s made
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ODHNI EDIT PRODUCTS */}
      <section className="sec" id="new" style={{ paddingTop: 24 }}>
        <div className="wrap">
          <div className="sec-head reveal">
            <div>
              <span className="eyebrow">Fresh off the Loom</span>
              <h2>
                The Odhni <em>Edit</em>
              </h2>
            </div>
            <a href="/category/jaipuri-odhni" className="seeall">
              Explore All →
            </a>
          </div>
          <div className="prods-row">
            {odhniEdit.map((p, i) => (
              <ProductCard key={p.name} product={p} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* EDITORIAL SPLIT */}
      <section className="split reveal">
        {editorial.map((e) => (
          <div className="panel" key={e.eyebrow}>
            <div className="ph">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img(e.image, 1200)} alt={e.eyebrow} />
            </div>
            <div className="scrim2" />
            <div className="pc">
              <span className="eyebrow">{e.eyebrow}</span>
              <h3>
                <MultilineTitle text={e.title} />
              </h3>
              <p>{e.copy}</p>
              <a href="#shop" className="btn btn-ghost">
                {e.cta}
              </a>
            </div>
          </div>
        ))}
      </section>

      {/* BESTSELLERS */}
      <section className="sec" id="best">
        <div className="wrap">
          <div className="sec-title reveal">
            <span className="eyebrow">Loved by Thousands</span>
            <h2>
              This Season&apos;s <em>Bestsellers</em>
            </h2>
            <div className="orn">
              <span className="d">✦</span>
            </div>
          </div>
          <div className="prods">
            {bestsellers.map((p, i) => (
              <ProductCard key={p.name} product={p} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* LOOKBOOK */}
      <section className="look" id="look">
        <div className="wrap">
          <div className="look-grid">
            <div className="look-art reveal">
              <div className="frame">
                <div className="ph">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img(lookbook.image, 1100)} alt="Darbar twilight look" />
                </div>
              </div>
              {lookbook.hotspots.map((h) => (
                <div className="hotspot" style={{ top: h.top, left: h.left }} key={h.name}>
                  <div className="tip">
                    <div className="nm">{h.name}</div>
                    <div className="pr">{h.price}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="look-copy reveal d1">
              <span className="eyebrow">The Lookbook</span>
              <h2>
                Shop the Look —<br />
                Darbar Twilight
              </h2>
              <p>
                One regal silhouette, completed head to toe — from the velvet lehenga to the polki
                jhumkas. Tap a marker to add each piece.
              </p>
              <div className="look-list">
                {lookbook.items.map((it) => (
                  <div className="it" key={it.name}>
                    <span className="nm">{it.name}</span>
                    <span className="pr">{it.price}</span>
                  </div>
                ))}
              </div>
              <a href="#" className="btn btn-rani">
                Add Full Look — {lookbook.total}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* REELS */}
      <section className="sec reels" id="reels">
        <div className="wrap">
          <div className="sec-title reveal">
            <span className="eyebrow">As Seen on Reels</span>
            <h2>#DrapedInAV</h2>
            <div className="orn">
              <span className="d">Follow @avcreation</span>
            </div>
          </div>
          <div className="reels-grid">
            {reels.map((r, i) => (
              <a className={`reel reveal ${["", "d1", "d2", "d3", "d4"][i] ?? ""}`} href="#" key={i}>
                <div className="ph">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img(r.image, 700)} alt="Reel" />
                </div>
                <div className="play">
                  <span>
                    <PlayIcon />
                  </span>
                </div>
                <div className="views">▶ {r.views}</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* OFFLINE STORES */}
      <section className="sec stores" id="stores">
        <div className="wrap">
          <div className="sec-title reveal">
            <span className="eyebrow">Come Say Namaste</span>
            <h2>
              Our Offline <em>Stores</em>
            </h2>
            <div className="orn">
              <span className="d">✦</span>
            </div>
          </div>
          <div className="stores-grid">
            {stores.map((s, i) => (
              <div className={`store-card reveal ${["", "d1", "d2"][i] ?? ""}`} key={s.name}>
                <div className="store-photo">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img(s.image, 800)} alt={`AV Creation ${s.name} store`} loading="lazy" />
                  <span className="store-badge">{s.badge}</span>
                </div>
                <div className="store-map">
                  <iframe
                    title={`Map — AV Creation ${s.name}`}
                    src={mapEmbedUrl(s.mapQuery)}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
                <div className="store-body">
                  <h3>{s.name}</h3>
                  <div className="store-city">{s.city}</div>
                  <address className="store-addr">
                    {s.address.map((line) => (
                      <span key={line}>{line}</span>
                    ))}
                  </address>
                  <div className="store-meta">
                    <span>{s.hours}</span>
                    <a href={`tel:${s.phone.replace(/\s/g, "")}`}>{s.phone}</a>
                  </div>
                  <a
                    className="btn btn-line store-dir"
                    href={mapLinkUrl(s.mapQuery)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Get Directions →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
