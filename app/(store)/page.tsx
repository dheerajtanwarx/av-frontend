import ReactDOM from "react-dom";
import {
  categories as staticCategories,
  odhniEdit as staticOdhniEdit,
  bestsellers as staticBestsellers,
  reels,
  stores,
  mapDirectionsUrl,
  img,
  heroImageUrl,
} from "./lib/landing-data";
import { Play } from "lucide-react";
import {
  fetchProducts,
  fetchCategories,
  fetchHeroSettings,
  fetchFeaturedReviews,
} from "./lib/api";
import RedesignHeader from "./components/landing/redesign/RedesignHeader";
import ProductRail from "./components/landing/redesign/ProductRail";
import Testimonials from "./components/landing/redesign/Testimonials";
import { devSampleReviews } from "./lib/dev-sample-reviews";
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
  const [odhniEdit, bestsellers, allProducts, categories, heroSettings, featuredReviews] =
    await Promise.all([
      fetchProducts({ category: "jaipuri-odhni" }).catch(() => staticOdhniEdit),
      fetchProducts({ bestseller: true }).catch(() => staticBestsellers),
      // Whole catalog — the Trending rail draws from here, minus whatever the
      // Odhni/Bestseller rails already show, so the page never repeats a piece.
      fetchProducts({}).catch(() => [...staticOdhniEdit, ...staticBestsellers]),
      fetchCategories().catch(() => staticCategories),
      // Cached server-side: the URLs land in the HTML so the browser starts the
      // image download immediately, with no client round-trip to the API.
      fetchHeroSettings({ revalidate: 60 }).catch(() => ({ images: [] as (string | null)[] })),
      // Real approved reviews for the testimonials carousel. NEVER faked — if
      // the feed is empty (or the API is down) the section renders nothing.
      fetchFeaturedReviews(12, { revalidate: 120 }).catch(() => ({ reviews: [] })),
    ]);

  // Rails surface a wider edit than the old 4-up grid; the carousel keeps the
  // page height in check while giving the shopper more to discover.
  const edit = (odhniEdit.length ? odhniEdit : staticOdhniEdit).slice(0, 10);
  const best = (bestsellers.length ? bestsellers : staticBestsellers).slice(0, 10);
  const cats = (categories.length ? categories : staticCategories).slice(0, 5);

  // Trending = the rest of the catalog, de-duplicated against the two rails
  // above. Falls back to bestsellers if the catalog fetch came back empty.
  const shownSlugs = new Set([...edit, ...best].map((p) => p.slug));
  const trendingPool = allProducts.length ? allProducts : [...staticOdhniEdit, ...staticBestsellers];
  const trendingFiltered = trendingPool.filter((p) => !shownSlugs.has(p.slug)).slice(0, 10);
  const trending = trendingFiltered.length ? trendingFiltered : best;

  const heroImages = heroSettings.images
    .filter((u): u is string => !!u)
    .map((u) => heroImageUrl(u));

  // Preload the first (above-the-fold) hero image at high priority so the
  // browser fetches it right away instead of treating it as a late discovery.
  if (heroImages[0]) {
    ReactDOM.preload(heroImages[0], { as: "image", fetchPriority: "high" });
  }

  return (
    <div className="av-lp">
      <RedesignHeader />

      {/* HERO — auto-sliding image carousel under one steady headline */}
      <LandingHero images={heroImages} />

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

      {/* THE ODHNI EDIT — rail */}
      <ProductRail
        id="odhni-edit"
        eyebrow="Fresh off the loom"
        title="The Odhni Edit"
        products={edit}
        viewAllHref="/category/jaipuri-odhni"
        align="row"
      />

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

      {/* BESTSELLERS — rail */}
      <ProductRail
        id="bestsellers"
        eyebrow="Most loved"
        title="This season's bestsellers"
        products={best}
        viewAllHref="/search"
        align="center"
      />

      {/* TRENDING — rail */}
      <ProductRail
        id="trending"
        eyebrow="Most wanted"
        title="Trending now"
        products={trending}
        viewAllHref="/search"
        align="row"
      />

      {/* TESTIMONIALS — real approved reviews only. In production this renders
          nothing until genuine reviews exist; in dev we fall back to clearly
          labelled sample data so the section can be previewed. */}
      <Testimonials
        reviews={
          featuredReviews.reviews.length
            ? featuredReviews.reviews
            : process.env.NODE_ENV !== "production"
            ? devSampleReviews
            : []
        }
      />

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
