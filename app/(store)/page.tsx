import ReactDOM from "react-dom";
import {
  categories as staticCategories,
  odhniEdit as staticOdhniEdit,
  bestsellers as staticBestsellers,
  socialReels,
  socialPosts,
  stores,
  mapDirectionsUrl,
  img,
  heroImageUrl,
} from "./lib/landing-data";
import {
  fetchProducts,
  fetchCategories,
  fetchHeroSettings,
  fetchFeaturedReviews,
  fetchSocialSettings,
  fetchPromoBanner,
} from "./lib/api";
import RedesignHeader from "./components/landing/redesign/RedesignHeader";
import ProductRail from "./components/landing/redesign/ProductRail";
import Testimonials from "./components/landing/redesign/Testimonials";
import SocialSection from "./components/landing/redesign/social/SocialSection";
import PromoBanner from "./components/landing/redesign/PromoBanner";
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
  const [
    odhniEdit,
    bestsellers,
    allProducts,
    categories,
    heroSettings,
    featuredReviews,
    socialSettings,
    signaturePromo,
    bridalPromo,
  ] = await Promise.all([
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
    // Admin-managed #DrapedInAV feeds. Empty → fall back to the static seed.
    fetchSocialSettings({ revalidate: 60 }).catch(() => ({ reels: [], posts: [] })),
    // Admin-managed promo posters (two slots). Empty image → the component's
    // per-slot default stands in.
    fetchPromoBanner("signature", { revalidate: 60 }).catch(
      () => ({ image: null, href: null, alt: null })
    ),
    fetchPromoBanner("bridal", { revalidate: 60 }).catch(
      () => ({ image: null, href: null, alt: null })
    ),
  ]);

  // Rails surface a wider edit than the old 4-up grid; the carousel keeps the
  // page height in check while giving the shopper more to discover.
  const edit = (odhniEdit.length ? odhniEdit : staticOdhniEdit).slice(0, 10);
  const best = (bestsellers.length ? bestsellers : staticBestsellers).slice(0, 10);
  // Accessories is deliberately kept out of the storefront (clothes only), but
  // the hosted DB still carries the row — filter it before the category row.
  // (The static fallback has no slug/accessories, so it passes through.)
  const cats = (categories.length ? categories : staticCategories)
    .filter((c) => (c as { slug?: string }).slug !== "accessories")
    .slice(0, 6);

  // Trending = the rest of the catalog, de-duplicated against the two rails
  // above. Falls back to bestsellers if the catalog fetch came back empty.
  const shownSlugs = new Set([...edit, ...best].map((p) => p.slug));
  const trendingPool = allProducts.length ? allProducts : [...staticOdhniEdit, ...staticBestsellers];
  const trendingFiltered = trendingPool.filter((p) => !shownSlugs.has(p.slug)).slice(0, 10);
  const trending = trendingFiltered.length ? trendingFiltered : best;

  // Admin overrides win when present; otherwise the built-in seed feeds render.
  const reels = socialSettings.reels.length ? socialSettings.reels : socialReels;
  const posts = socialSettings.posts.length ? socialSettings.posts : socialPosts;

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

      {/* TRENDING — rail (sits just under the category row). */}
      <ProductRail
        id="trending"
        eyebrow="Most wanted"
        title="Trending now"
        products={trending}
        viewAllHref="/search"
        align="row"
      />

      {/* SOCIAL — REELS. Cards autoplay muted inline; clicking opens the
          in-site lightbox. */}
      <SocialSection
        kind="reel"
        items={reels}
        products={allProducts}
        eyebrow="As seen on social"
        title="#DrapedInAV"
      />

      {/* PROMO POSTER — signature slot (admin-uploaded, replaces the former
          House Signature editorial). Falls back to the Odhni default. */}
      <PromoBanner
        image={signaturePromo.image}
        href={signaturePromo.href}
        alt={signaturePromo.alt}
        defaultImage="photo-1597983073493-88cd35cf93b0"
        defaultEyebrow="The House Signature"
        defaultTitle="The Jaipuri Odhni"
        defaultHref="/category/jaipuri-odhni"
      />

      {/* THE ODHNI EDIT — rail */}
      <ProductRail
        id="odhni-edit"
        eyebrow="Fresh off the loom"
        title="The Odhni Edit"
        products={edit}
        viewAllHref="/category/jaipuri-odhni"
        align="row"
      />

      {/* PROMO POSTER — bridal slot (admin-uploaded, replaces the former Bridal
          Atelier editorial). Falls back to a default until one is set. */}
      <PromoBanner
        image={bridalPromo.image}
        href={bridalPromo.href}
        alt={bridalPromo.alt}
        defaultImage="photo-1583846783214-7229a91b20ed"
        defaultEyebrow="The Bridal Atelier"
        defaultTitle="Heirlooms in the making"
        defaultHref="/search?q=bridal"
      />

      {/* BESTSELLERS — rail */}
      <ProductRail
        id="bestsellers"
        eyebrow="Most loved"
        title="This season's bestsellers"
        products={best}
        viewAllHref="/search"
        align="center"
      />

      {/* SOCIAL — POSTS. The image grid, kept separate from the reels and
          placed lower down the page. */}
      <SocialSection
        kind="post"
        items={posts}
        products={allProducts}
        eyebrow="From the feed"
        title="Moments from the grid"
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
