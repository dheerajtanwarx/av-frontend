import {
  categories as staticCategories,
  odhniEdit as staticOdhniEdit,
  bestsellers as staticBestsellers,
  reels,
  stores,
  mapDirectionsUrl,
  img,
} from "./lib/landing-data";
import { Play } from "lucide-react";
import { fetchProducts, fetchCategories } from "./lib/api";
import RedesignHeader from "./components/landing/redesign/RedesignHeader";
import RedesignProductCard from "./components/landing/redesign/RedesignProductCard";
import LandingHero from "./components/landing/redesign/LandingHero";

/* ============================================================
   AV CREATION — Landing (Phase-1 redesign)
   A restrained, editorial reskin scoped to `.av-lp`. Live catalog
   with a static fallback so the page always renders. The earlier
   maximalist sections (auto-carousel, reels, lookbook, stores) are
   retired in favour of the resolved design: one still hero, a calm
   2-up wardrobe, the Odhni signature, two product edits and a quiet
   footer.
   ============================================================ */

const footerCols = [
  {
    title: "Shop",
    links: [
      { label: "Odhni", href: "/category/jaipuri-odhni" },
      { label: "Lehenga", href: "/category/lehenga" },
      { label: "Saree", href: "/category/designer-saree" },
      { label: "Suits", href: "/category/suit-sets" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Track order", href: "/track-order" },
      { label: "Returns", href: "/shipping-returns" },
      { label: "Size guide", href: "/size-guide" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "House",
    links: [
      { label: "Our story", href: "/our-story" },
      { label: "Artisans", href: "/artisans" },
      { label: "Stores", href: "/stores" },
      { label: "Careers", href: "/careers" },
    ],
  },
];

function catHref(c: { slug?: string; href?: string }): string {
  if (c.slug) return `/category/${c.slug}`;
  return c.href ?? "/search";
}

export default async function Home() {
  const [odhniEdit, bestsellers, categories] = await Promise.all([
    fetchProducts({ category: "jaipuri-odhni" }).catch(() => staticOdhniEdit),
    fetchProducts({ bestseller: true }).catch(() => staticBestsellers),
    fetchCategories().catch(() => staticCategories),
  ]);

  const edit = (odhniEdit.length ? odhniEdit : staticOdhniEdit).slice(0, 4);
  const best = (bestsellers.length ? bestsellers : staticBestsellers).slice(0, 4);
  const cats = (categories.length ? categories : staticCategories).slice(0, 5);

  return (
    <div className="av-lp">
      <RedesignHeader />

      {/* HERO — auto-sliding 4-image carousel under one steady headline */}
      <LandingHero />

      {/* QUIET TRUST LINE */}
      <div className="lp-trustline">
        Hand-blocked · 7-day returns · Free shipping over ₹2,999
      </div>

      {/* WARDROBE — shop by category */}
      <section className="lp-section" id="wardrobe">
        <div className="lp-wrap">
          <div className="lp-head-center">
            <div className="lp-eyebrow">The Wardrobe</div>
            <div className="lp-title">Shop by category</div>
          </div>
          <div className="lp-cats">
            {cats.map((c) => (
              <a key={c.name} href={catHref(c)} className="lp-cat">
                <div className="lp-cat-img">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img(c.main, 600) || undefined} alt={c.name} loading="lazy" />
                </div>
                <div className="lp-cat-label">
                  <div className="lp-cat-name">{c.name}</div>
                  <div className="lp-cat-count">{c.count}</div>
                </div>
              </a>
            ))}
          </div>
          <div className="lp-section-foot">
            <a href="/search" className="lp-underlink">
              All categories
            </a>
          </div>
        </div>
      </section>

      {/* THE HOUSE SIGNATURE — Jaipuri Odhni */}
      <section className="lp-bleed lp-signature">
        <div className="lp-bleed-img">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img("photo-1597983073493-88cd35cf93b0", 1100)} alt="The Jaipuri Odhni" loading="lazy" />
        </div>
        <div className="lp-signature-copy">
          <div className="lp-eyebrow">The House Signature</div>
          <div className="lp-title">The Jaipuri Odhni</div>
          <p>
            Tied, dyed and block-printed by hand in the lanes of the Pink City. No two drapes are
            ever quite alike.
          </p>
          <a href="/category/jaipuri-odhni" className="lp-underlink">
            Explore the Odhni edit
          </a>
        </div>
      </section>

      {/* THE ODHNI EDIT */}
      <section className="lp-section tight" id="odhni-edit">
        <div className="lp-wrap">
          <div className="lp-head-row">
            <div>
              <div className="lp-eyebrow">Fresh off the loom</div>
              <div className="lp-title">The Odhni Edit</div>
            </div>
            <a href="/category/jaipuri-odhni" className="lp-viewall">
              View all
            </a>
          </div>
          <div className="lp-products">
            {edit.map((p) => (
              <RedesignProductCard key={p.slug} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* REELS — horizontally-scrolling social strip */}
      <section className="lp-reels" id="reels" aria-label="As seen on reels">
        <div className="lp-head-center">
          <div className="lp-eyebrow">As seen on reels</div>
          <div className="lp-title">#DrapedInAV</div>
        </div>
        <div className="lp-reels-track">
          {reels.map((r, i) => (
            <a
              key={i}
              href="https://www.instagram.com/jaipuri_odhni/"
              target="_blank"
              rel="noopener noreferrer"
              className="lp-reel"
              aria-label={`Reel — ${r.views} views`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img(r.image, 500)} alt="" loading="lazy" />
              <div className="lp-reel-scrim" />
              <span className="lp-reel-play" aria-hidden="true">
                <Play size={13} fill="currentColor" stroke="none" />
              </span>
              <span className="lp-reel-views" aria-hidden="true">
                <Play size={11} fill="currentColor" stroke="none" />
                {r.views}
              </span>
            </a>
          ))}
        </div>
        <div className="lp-reels-handle">Follow @jaipuri_odhni</div>
      </section>

      {/* THE BRIDAL ATELIER — overlay editorial */}
      <section className="lp-editorial" aria-label="The Bridal Atelier">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img("photo-1583846783214-7229a91b20ed", 1600)} alt="" loading="lazy" />
        <div className="lp-editorial-scrim" />
        <div className="lp-editorial-copy">
          <div className="lp-eyebrow">The Bridal Atelier</div>
          <div className="lp-editorial-title">
            Heirlooms in <em>the making</em>
          </div>
          <p>Months of zardozi and kundan — for the day you&apos;ll remember forever.</p>
          <a href="/search?q=bridal" className="lp-underlink lp-hero-cta">
            Discover bridal
          </a>
        </div>
      </section>

      {/* BESTSELLERS */}
      <section className="lp-section" id="bestsellers">
        <div className="lp-wrap">
          <div className="lp-head-center">
            <div className="lp-eyebrow">Most loved</div>
            <div className="lp-title">This season&apos;s bestsellers</div>
          </div>
          <div className="lp-products">
            {best.map((p) => (
              <RedesignProductCard key={p.slug} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* OFFLINE STORES — come say namaste */}
      <section className="lp-section" id="stores">
        <div className="lp-wrap">
          <div className="lp-head-center">
            <div className="lp-eyebrow">Come say namaste</div>
            <div className="lp-title">Our offline stores</div>
          </div>
          <div className="lp-stores-grid">
            {stores.map((s) => (
              <div className="lp-store" key={s.name}>
                <div className="lp-store-img">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img(s.image, 800)} alt={`${s.name} store`} loading="lazy" />
                </div>
                <div className="lp-store-body">
                  <address className="lp-store-addr">{s.address}</address>
                  <a
                    className="lp-btn-rani"
                    href={mapDirectionsUrl(s.lat, s.lng)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Get directions →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div>
            <div className="lp-footer-brand">
              <div className="lp-footer-mark">AV CREATION</div>
              <div className="lp-footer-sub">Jaipuri Atelier</div>
            </div>
            <div className="lp-news">
              <div className="lp-news-label">Join the house</div>
              <form className="lp-news-field" action="/search">
                <input
                  type="email"
                  name="newsletter"
                  placeholder="Email address"
                  aria-label="Email address"
                />
                <button type="submit" aria-label="Subscribe">
                  &rarr;
                </button>
              </form>
            </div>
          </div>
          <div className="lp-footer-cols">
            {footerCols.map((col) => (
              <div key={col.title}>
                <h4>{col.title}</h4>
                {col.links.map((l) => (
                  <a key={l.label} href={l.href}>
                    {l.label}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="lp-footer-bot">
          <span>© 2026 AV Creation</span>
          <span>UPI · Cards · COD</span>
        </div>
      </footer>
    </div>
  );
}
