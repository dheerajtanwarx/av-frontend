/* ============================================================
   AV CREATION — Product detail page data
   ------------------------------------------------------------
   Every landing product resolves to a full PDP via shared
   DEFAULTS (sizes, accordion, reviews, craft, look, related)
   merged with the product's own fields. The hero "Rani Bagh"
   bridal piece is fully authored in OVERRIDES as the showcase.
   Ported from design/project/pdp-parts.jsx.
   ============================================================ */

import { bestsellers, odhniEdit, img, type Product } from "./landing-data";

export type PdpColor = { name: string; hex: string; stock?: number; images?: string[] };
export type PdpReview = { stars: number; txt: string; name: string; loc: string };
export type AccordionItem = { q: string; a: string };
export type CraftSpec = { st: string; sv: string };
export type LookItem = { nm: string; ty: string; pr: string; image: string };
export type RelatedItem = {
  slug: string;
  nm: string;
  ty: string;
  pr: string;
  was?: string;
  image: string;
  flag?: string;
};

export type PdpProduct = {
  slug: string;
  name: string;
  navHot: string; // which nav link to highlight
  crumb: string[]; // breadcrumb trail between Home and the product
  eyebrow: string;
  craft: string; // sub-craft line, e.g. "Hand Zardozi · Raw Silk"
  galleryFlag?: string;
  rating: number;
  reviewCount: number;
  price: string;
  was?: string;
  off?: string;
  desc: string;
  images: string[];
  colors: PdpColor[];
  sizes: string[];
  sizeChart: string[][];
  accordion: AccordionItem[];
  reviews: PdpReview[];
  reviewDist: [string, number][];
  craftBand: {
    eyebrow: string;
    title: string; // *asterisk* wrapped phrase renders as the rani emphasis
    lead: string;
    specs: CraftSpec[];
    image: string;
  };
  lookImage: string;
  look: LookItem[];
  related: RelatedItem[];
};

/* Reusable Unsplash ids (mirrors the design's IMG map). */
const ID = {
  a: "premium_photo-1682096032284-0b2ab20b65dd",
  b: "premium_photo-1682096065017-ab3d3a162b33",
  c: "photo-1645862755924-9f4e7f200b83",
  d: "premium_photo-1682096048114-4b36a3212527",
  e: "premium_photo-1682096060450-6ac06a3a0478",
  f: "photo-1769500804057-ca1391bf4617",
  g: "photo-1574847872646-abff244bbd87",
  h: "premium_photo-1682096037844-e43413e887a8",
  i: "photo-1693336429270-094637e16d38",
  j: "premium_photo-1682096034925-468c545d1c12",
};

const GAL = (id: string) => img(id, 1100);

/* ---- Shared defaults applied to every product ---- */
const DEFAULT_COLORS: PdpColor[] = [
  { name: "Rani Pink", hex: "#bd3c6e" },
  { name: "Deep Maroon", hex: "#6e1f2e" },
  { name: "Emerald", hex: "#1d5042" },
  { name: "Royal Blue", hex: "#27406e" },
];

const DEFAULT_SIZES = ["XS", "S", "M", "L", "XL"];

const DEFAULT_SIZE_CHART = [
  ["XS", "32", "26", "36"],
  ["S", "34", "28", "38"],
  ["M", "36", "30", "40"],
  ["L", "38", "33", "42"],
  ["XL", "40", "35", "44"],
];

const DEFAULT_ACCORDION: AccordionItem[] = [
  {
    q: "Delivery & Shipping",
    a: "Complimentary insured shipping across India; express worldwide delivery calculated at checkout. You will receive a tracking link the moment it leaves our Jaipur atelier.",
  },
  {
    q: "Returns & Exchange",
    a: "Easy <b>7-day returns</b> on ready sizes. As each piece is finished by hand, we are happy to arrange <b>one free alteration</b> for the perfect fit. Our stylist will guide you through every step.",
  },
  {
    q: "Fabric & Care",
    a: "Hand-finished with real <b>gota-patti</b> and traditional handwork. <b>Dry-clean only.</b> Store folded in the muslin pouch provided, away from direct sunlight, to keep the work luminous for generations.",
  },
];

const DEFAULT_REVIEWS: PdpReview[] = [
  {
    stars: 5,
    txt: "The handwork is even more luminous in person than in the photos. Drew compliments all evening — worth every rupee.",
    name: "Ananya R.",
    loc: "Verified · Jaipur",
  },
  {
    stars: 5,
    txt: "Heirloom quality and the colour is exactly as shown. The fit after a small alteration was flawless.",
    name: "Meghna S.",
    loc: "Verified · Mumbai",
  },
  {
    stars: 4,
    txt: "Stunning craftsmanship and the stylist was so patient with my measurements. Absolutely worth the short wait.",
    name: "Priya K.",
    loc: "Verified · Delhi",
  },
];

const DEFAULT_DIST: [string, number][] = [
  ["5★", 86],
  ["4★", 9],
  ["3★", 3],
  ["2★", 1],
  ["1★", 1],
];

const DEFAULT_LOOK: LookItem[] = [
  { nm: "Kundan Rani Odhni", ty: "Bandhej · Georgette", pr: "₹6,800", image: GAL(ID.i) },
  { nm: "Polki Jhumka Set", ty: "Temple · 22k Gold-plate", pr: "₹3,200", image: GAL(ID.j) },
  { nm: "Zari Embroidered Juttis", ty: "Handcrafted · Velvet", pr: "₹2,400", image: GAL(ID.h) },
  { nm: "Silk Potli Clutch", ty: "Gota Patti · Raw Silk", pr: "₹1,900", image: GAL(ID.d) },
];

const DEFAULT_RELATED: RelatedItem[] = [
  {
    slug: "mirror-mahal-lehenga",
    nm: "Mirror Mahal Lehenga",
    ty: "Sheesha · Georgette",
    pr: "₹16,750",
    image: GAL(ID.b),
    flag: "Trending",
  },
  {
    slug: "chanderi-gold-tissue-saree",
    nm: "Chanderi Gold Saree",
    ty: "Zari · Chanderi Silk",
    pr: "₹7,600",
    was: "₹9,200",
    image: GAL(ID.f),
    flag: "Off 17%",
  },
  {
    slug: "rani-bagh-bridal-lehenga",
    nm: "Rani Bagh Bridal Lehenga",
    ty: "Zardozi · Raw Silk",
    pr: "₹68,500",
    image: GAL(ID.c),
  },
  {
    slug: "sanganeri-cotton-suit-set",
    nm: "Sanganeri Suit Set",
    ty: "Hand-Block · Cotton",
    pr: "₹4,990",
    image: GAL(ID.g),
    flag: "New",
  },
];

/* Map a product to the nav link it belongs under. */
function navHotFor(name: string, type: string): string {
  const hay = `${name} ${type}`.toLowerCase();
  if (hay.includes("odhni") || hay.includes("dupatta")) return "Jaipuri Odhni";
  if (hay.includes("saree")) return "Saree";
  if (hay.includes("suit")) return "Suits";
  return "Lehenga";
}

/* Per-product overrides keyed by slug; deep-merged over the base entry. */
const OVERRIDES: Record<string, Partial<PdpProduct>> = {
  "rani-bagh-bridal-lehenga": {
    name: "Rani Bagh Royal Bridal Lehenga",
    navHot: "Lehenga",
    crumb: ["Lehenga", "Bridal Atelier"],
    eyebrow: "Bridal Atelier · Made to Measure",
    craft: "Hand Zardozi & Gota Patti · Raw Silk",
    galleryFlag: "Bridal · Made to Order",
    rating: 4.9,
    reviewCount: 128,
    price: "₹68,500",
    was: "₹82,000",
    off: "16% Off",
    desc: "A regal three-piece bridal ensemble — months of hand zardozi and gota-patti laid across raw Banarasi silk, finished with a scalloped net dupatta dyed in the colours of the Pink City.",
    images: [GAL(ID.a), GAL(ID.b), GAL(ID.c), GAL(ID.d), GAL(ID.e)],
    accordion: [
      {
        q: "Delivery & Shipping",
        a: "This piece is <b>made to order</b> and ships in 3–4 weeks. Complimentary insured shipping across India; express worldwide delivery calculated at checkout. You will receive a tracking link the moment it leaves our Jaipur atelier.",
      },
      {
        q: "Returns & Exchange",
        a: "Easy <b>7-day returns</b> on ready sizes. As each bridal piece is custom-stitched to your measures, made-to-measure orders are eligible for <b>one free alteration</b> rather than return. Our stylist will guide you through every step.",
      },
      {
        q: "Fabric & Care",
        a: "Raw Banarasi silk with real <b>gota-patti</b> and zardozi handwork. <b>Dry-clean only.</b> Store folded in the muslin pouch provided, away from direct sunlight, to keep the metallic work luminous for generations.",
      },
    ],
    reviews: [
      {
        stars: 5,
        txt: "Wore this for my reception — the zardozi caught every light in the room. The fit after made-to-measure was flawless.",
        name: "Ananya R.",
        loc: "Verified · Jaipur",
      },
      {
        stars: 5,
        txt: "Heirloom quality. The gota-patti border is even more luminous in person than the photos. Worth every rupee.",
        name: "Meghna S.",
        loc: "Verified · Mumbai",
      },
      {
        stars: 4,
        txt: "Stunning craftsmanship and the stylist was so patient with my measurements. Took 4 weeks but absolutely worth the wait.",
        name: "Priya K.",
        loc: "Verified · Delhi",
      },
    ],
    craftBand: {
      eyebrow: "The House Craft",
      title: "Woven by hand, *over months*",
      lead: "Every Rani Bagh lehenga begins as a bare length of raw silk. Our karigars in Jaipur trace, couch and embroider each motif by hand — no two pieces are ever quite alike.",
      specs: [
        { st: "Technique", sv: "Zardozi & Gota Patti" },
        { st: "Base Fabric", sv: "Raw Banarasi Silk" },
        { st: "Crafting Time", sv: "Approx. 90 days" },
        { st: "Includes", sv: "Lehenga · Blouse · Dupatta" },
      ],
      image: GAL(ID.e),
    },
  },
};

/* Index every landing product by slug for the base entry. */
const LANDING_BY_SLUG: Record<string, Product> = Object.fromEntries(
  [...odhniEdit, ...bestsellers].map((p) => [p.slug, p])
);

/** Rotate `arr` left by `n` so each colour leads with a different image —
    gives the static fallback a visible gallery change when switching colours. */
function rotate<T>(arr: T[], n: number): T[] {
  if (arr.length === 0) return arr;
  const k = ((n % arr.length) + arr.length) % arr.length;
  return [...arr.slice(k), ...arr.slice(0, k)];
}

function baseFrom(p: Product): PdpProduct {
  const navHot = navHotFor(p.name, p.type);
  const galleryImgs = [GAL(p.main), GAL(p.alt), GAL(ID.d), GAL(ID.b), GAL(ID.e)];
  return {
    slug: p.slug,
    name: p.name,
    navHot,
    crumb: [navHot],
    eyebrow: navHot === "Lehenga" ? "The Atelier" : `${navHot} · The Atelier`,
    craft: p.type,
    galleryFlag: p.flag?.label,
    rating: 4.8,
    reviewCount: 96,
    price: p.price,
    was: p.was,
    off: p.flag?.sale ? p.flag.label : undefined,
    desc: "Hand-finished by our karigars across Jaipur, Sanganer and Bagru — a piece made to be worn, kept and remembered. Each one carries the small, beautiful irregularities of true handwork.",
    images: galleryImgs,
    colors: DEFAULT_COLORS.map((c, i) => ({ ...c, images: rotate(galleryImgs, i) })),
    sizes: DEFAULT_SIZES,
    sizeChart: DEFAULT_SIZE_CHART,
    accordion: DEFAULT_ACCORDION,
    reviews: DEFAULT_REVIEWS,
    reviewDist: DEFAULT_DIST,
    craftBand: {
      eyebrow: "The House Craft",
      title: "Woven by hand, *over weeks*",
      lead: "Each piece begins as bare cloth on a Jaipur worktable. Our karigars block, dye and embroider every motif by hand — so no two are ever quite alike.",
      specs: [
        { st: "Technique", sv: p.type.split(" · ")[0] ?? "Handwork" },
        { st: "Base Fabric", sv: p.type.split(" · ")[1] ?? "Pure Silk" },
        { st: "Crafting Time", sv: "Approx. 3 weeks" },
        { st: "Finish", sv: "Hand-finished in Jaipur" },
      ],
      image: GAL(p.main),
    },
    lookImage: GAL(p.alt),
    look: DEFAULT_LOOK,
    related: DEFAULT_RELATED.filter((r) => r.slug !== p.slug).slice(0, 4),
  };
}

export function getAllSlugs(): string[] {
  return Object.keys(LANDING_BY_SLUG);
}

export function getProduct(slug: string): PdpProduct | null {
  const landing = LANDING_BY_SLUG[slug];
  if (!landing) return null;
  return { ...baseFrom(landing), ...OVERRIDES[slug] };
}

/** Gallery images for the selected colour: the colour's own images when it has
    them, otherwise the product-level images. Falsy/missing URLs are dropped so
    the gallery never renders a broken image. */
export function colorImages(product: PdpProduct, color?: PdpColor): string[] {
  const own = (color?.images ?? []).filter(Boolean);
  if (own.length) return own;
  return product.images.filter(Boolean);
}
