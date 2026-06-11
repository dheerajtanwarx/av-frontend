/* ============================================================
   AV CREATION — Landing page content
   ------------------------------------------------------------
   All copy / imagery for the landing page lives here so the
   components stay presentational. Images are public Unsplash
   mocks for now — swap the URLs (or point at /public assets)
   when real photography is ready.
   ============================================================ */

/* Some IDs in this file point at Unsplash+ "premium_photo-*" assets that 404
   for the public CDN — they never render. Remap each to a free, public
   Unsplash photo so every section shows a (mock) image. Swap for real
   photography when it's ready. */
export const IMG_REMAP: Record<string, string> = {
  "premium_photo-1682096032284-0b2ab20b65dd": "photo-1610030469983-98e550d6193c",
  "premium_photo-1682096034925-468c545d1c12": "photo-1597983073493-88cd35cf93b0",
  "premium_photo-1682096037844-e43413e887a8": "photo-1611042553365-9b101441c135",
  "premium_photo-1682096048114-4b36a3212527": "photo-1612722432474-b971cdcea546",
  "premium_photo-1682096055581-7cb5a5fd3d80": "photo-1594633312681-425c7b97ccd1",
  "premium_photo-1682096060450-6ac06a3a0478": "photo-1595777457583-95e059d581b8",
  "premium_photo-1682096065017-ab3d3a162b33": "photo-1583846783214-7229a91b20ed",
  "premium_photo-1682096067532-3e89ab323ebf": "photo-1617137968427-85924c800a22",
};

const img = (id: string, w: number) => {
  if (!id) return "";
  if (id.startsWith("http")) return id;
  const safe = IMG_REMAP[id] ?? id;
  return `https://images.unsplash.com/${safe}?w=${w}&q=78&auto=format&fit=crop`;
};

export type NavLink = { label: string; href: string; hot?: boolean };

export const nav: NavLink[] = [
  { label: "Jaipuri Odhni", href: "/category/jaipuri-odhni", hot: true },
  { label: "Lehenga", href: "/category/lehenga" },
  { label: "Saree", href: "/category/designer-saree" },
  { label: "Suits", href: "/category/suit-sets" },
  { label: "Dupatta", href: "/category/dupatta" },
];

export const announcements = [
  "Hand-blocked in Jaipur, the Pink City",
  "Free shipping across India over ₹2,999",
  "The Jaipuri Odhni Edit — now live",
  "7-day easy returns",
];

export type Slide = {
  tag: string;
  title: string;
  copy: string;
  cta: { label: string; href: string };
  image: string;
  align: "left" | "right";
};

export const slides: Slide[] = [
  {
    tag: "The Maharani Collection · 2026",
    title: "Tradition,\nWoven with Grace",
    copy: "Timeless techniques shaped for refined occasions.",
    cta: { label: "Shop Now", href: "#shop" },
    image: "photo-1645862755924-9f4e7f200b83",
    align: "left",
  },
  {
    tag: "The House Signature",
    title: "The Jaipuri\nOdhni",
    copy: "Bandhej, leheriya & hand-block — dyed in the colours of the Pink City.",
    cta: { label: "Explore the Edit", href: "#odhni" },
    image: "photo-1693336429270-094637e16d38",
    align: "right",
  },
  {
    tag: "Bridal Atelier",
    title: "For the Once-\nin-a-Lifetime",
    copy: "Heirloom lehengas, hand-finished over months of craft.",
    cta: { label: "Shop Bridal", href: "#shop" },
    image: "premium_photo-1682096032284-0b2ab20b65dd",
    align: "left",
  },
  {
    tag: "Fresh off the Loom",
    title: "New Festive\nArrivals",
    copy: "Sarees, suits & dupattas straight from the Jaipur looms.",
    cta: { label: "See What's New", href: "#new" },
    image: "photo-1769500804057-ca1391bf4617",
    align: "right",
  },
];

/* Words wrapped in *asterisks* render as the gold/rani emphasis. */
export const slideEmphasis: Record<number, string> = {
  0: "Woven with Grace",
  1: "Jaipuri",
  2: "Lifetime",
  3: "Arrivals",
};

export const trust = [
  { icon: "star", t: "Hand-Blocked", s: "By Jaipur artisans" },
  { icon: "truck", t: "Free Shipping", s: "Across India over ₹2,999" },
  { icon: "return", t: "Easy Returns", s: "7-day no-fuss policy" },
  { icon: "shield", t: "Secure Checkout", s: "UPI · Cards · COD" },
] as const;

export type Category = {
  name: string;
  count: string;
  href: string;
  main: string;
  alt: string;
  featured?: boolean;
};

export const categories: Category[] = [
  {
    name: "Jaipuri Odhni",
    count: "64 styles",
    href: "#odhni",
    main: "photo-1693336429270-094637e16d38",
    alt: "premium_photo-1682096060450-6ac06a3a0478",
    featured: true,
  },
  {
    name: "Lehenga",
    count: "86 styles",
    href: "#shop",
    main: "premium_photo-1682096048114-4b36a3212527",
    alt: "premium_photo-1682096065017-ab3d3a162b33",
  },
  {
    name: "Designer Saree",
    count: "112 styles",
    href: "#shop",
    main: "photo-1769500804057-ca1391bf4617",
    alt: "premium_photo-1682096032284-0b2ab20b65dd",
  },
  {
    name: "Suit Sets",
    count: "78 styles",
    href: "#shop",
    main: "photo-1574847872646-abff244bbd87",
    alt: "premium_photo-1682096037844-e43413e887a8",
  },
  {
    name: "Dupatta",
    count: "53 styles",
    href: "#shop",
    main: "premium_photo-1682096034925-468c545d1c12",
    alt: "photo-1693336429270-094637e16d38",
  },
];

export const odhniFeatures = [
  { ft: "Bandhej", fs: "Thousands of tiny knots, tied & dyed by hand." },
  { ft: "Leheriya", fs: "The rippling wave-dye born in Rajasthan." },
  { ft: "Hand-Block", fs: "Carved teak blocks, pressed in natural dyes." },
  { ft: "Gota Patti", fs: "Gleaming gold-edge appliqué borders." },
];

export type Product = {
  slug: string;
  name: string;
  type: string;
  price: string;
  was?: string;
  stars: string;
  flag?: { label: string; sale?: boolean };
  main: string;
  alt: string;
  soldOut?: boolean;
  /** Total units in stock across variants (when known). Drives the
      "Only N left" low-stock cue on the product card. */
  stock?: number;
  /** Per-colour stock (when known). Lets the card flag a partial sell-out and
      quick-add an in-stock colour instead of a hardcoded one. */
  colors?: { name: string; hex: string; stock: number }[];
};

/** At or below this many units (but more than zero) the storefront nudges the
    shopper with an "Only N left" cue. Matches the PDP / cart thresholds. */
export const LOW_STOCK_CUE = 5;

export const odhniEdit: Product[] = [
  {
    slug: "gulabi-bandhani-odhni",
    name: "Gulabi Bandhani Odhni",
    type: "Bandhej · Pure Georgette",
    price: "₹3,450",
    stars: "★★★★★",
    flag: { label: "New" },
    main: "photo-1574847872646-abff244bbd87",
    alt: "premium_photo-1682096060450-6ac06a3a0478",
  },
  {
    slug: "leheriya-wave-odhni",
    name: "Leheriya Wave Odhni",
    type: "Leheriya · Chiffon",
    price: "₹2,890",
    was: "₹3,600",
    stars: "★★★★★",
    flag: { label: "Off 20%", sale: true },
    main: "premium_photo-1682096060450-6ac06a3a0478",
    alt: "photo-1693336429270-094637e16d38",
  },
  {
    slug: "gota-patti-rani-odhni",
    name: "Gota Patti Rani Odhni",
    type: "Gota Patti · Silk Blend",
    price: "₹4,750",
    stars: "★★★★★",
    flag: { label: "Signature" },
    main: "premium_photo-1682096037844-e43413e887a8",
    alt: "premium_photo-1682096048114-4b36a3212527",
  },
  {
    slug: "sanganeri-block-odhni",
    name: "Sanganeri Block Odhni",
    type: "Hand-Block · Cotton Mul",
    price: "₹2,150",
    stars: "★★★★☆",
    main: "premium_photo-1682096048114-4b36a3212527",
    alt: "premium_photo-1682096034925-468c545d1c12",
  },
];

export const bestsellers: Product[] = [
  {
    slug: "rani-bagh-bridal-lehenga",
    name: "Rani Bagh Bridal Lehenga",
    type: "Zardozi · Raw Silk",
    price: "₹14,800",
    was: "₹18,000",
    stars: "★★★★★",
    flag: { label: "Off 18%", sale: true },
    main: "photo-1645862755924-9f4e7f200b83",
    alt: "premium_photo-1682096065017-ab3d3a162b33",
  },
  {
    slug: "chanderi-gold-tissue-saree",
    name: "Chanderi Gold Tissue Saree",
    type: "Zari · Chanderi Silk",
    price: "₹7,600",
    was: "₹9,200",
    stars: "★★★★★",
    flag: { label: "Off 17%", sale: true },
    main: "photo-1769500804057-ca1391bf4617",
    alt: "premium_photo-1682096032284-0b2ab20b65dd",
  },
  {
    slug: "mirror-mahal-lehenga",
    name: "Mirror Mahal Lehenga",
    type: "Sheesha · Georgette",
    price: "₹16,750",
    stars: "★★★★☆",
    flag: { label: "Trending" },
    main: "premium_photo-1682096065017-ab3d3a162b33",
    alt: "photo-1645862755924-9f4e7f200b83",
  },
  {
    slug: "sanganeri-cotton-suit-set",
    name: "Sanganeri Cotton Suit Set",
    type: "Hand-Block · Cotton",
    price: "₹4,990",
    stars: "★★★★★",
    main: "photo-1574847872646-abff244bbd87",
    alt: "premium_photo-1682096037844-e43413e887a8",
  },
];

export const editorial = [
  {
    eyebrow: "The Bridal Atelier",
    title: "Heirlooms in\nthe making",
    copy: "Months of zardozi, kundan and gota — for the day you'll remember forever.",
    cta: "Discover Bridal",
    image: "premium_photo-1682096032284-0b2ab20b65dd",
  },
  {
    eyebrow: "Everyday Luxe",
    title: "Soft, light &\nendlessly worn",
    copy: "Sanganeri cotton suits and mul dupattas made for real, joyful days.",
    cta: "Shop Everyday",
    image: "photo-1574847872646-abff244bbd87",
  },
];

export const lookbook = {
  image: "premium_photo-1682096065017-ab3d3a162b33",
  hotspots: [
    { top: "24%", left: "34%", name: "Kundan Odhni", price: "₹6,800" },
    { top: "52%", left: "58%", name: "Darbar Velvet Lehenga", price: "₹22,400" },
    { top: "74%", left: "40%", name: "Polki Jhumkas", price: "₹3,200" },
  ],
  items: [
    { name: "Darbar Velvet Lehenga", price: "₹22,400" },
    { name: "Kundan Embroidered Odhni", price: "₹6,800" },
    { name: "Polki Statement Jhumkas", price: "₹3,200" },
  ],
  total: "₹32,400",
};

export const reels = [
  { image: "premium_photo-1682096067532-3e89ab323ebf", views: "1.2M" },
  { image: "premium_photo-1682096055581-7cb5a5fd3d80", views: "880K" },
  { image: "photo-1574847872646-abff244bbd87", views: "2.4M" },
  { image: "photo-1693336429270-094637e16d38", views: "640K" },
  { image: "premium_photo-1682096037844-e43413e887a8", views: "1.7M" },
];

export type Store = {
  name: string;
  image: string;
  /** Single-line address shown on the card. */
  address: string;
  /** Real store coordinates — drive the "Get Directions" deep link. */
  lat: number;
  lng: number;
};

export const stores: Store[] = [
  {
    name: "AV Creation — Khaniya",
    image: "premium_photo-1682096032284-0b2ab20b65dd",
    address: "Khaniya, Jaipur, Rajasthan",
    lat: 26.8926118,
    lng: 75.8661174,
  },
  {
    name: "AV Creation — Bassi",
    image: "premium_photo-1682096034925-468c545d1c12",
    address: "Bassi, Jaipur, Rajasthan",
    lat: 26.8335104,
    lng: 76.0502381,
  },
  {
    name: "AV Creation — Jaipur",
    image: "premium_photo-1682096037844-e43413e887a8",
    address: "Jaipur, Rajasthan",
    lat: 26.9051441,
    lng: 75.8998953,
  },
];

/** Google Maps directions deep link (opens the Maps app on mobile). */
export const mapDirectionsUrl = (lat: number, lng: number) =>
  `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

export const footerCols = [
  {
    title: "Shop",
    links: [
      { label: "Jaipuri Odhni",   href: "/category/jaipuri-odhni" },
      { label: "Lehenga",         href: "/category/lehenga" },
      { label: "Designer Saree",  href: "/category/designer-saree" },
      { label: "Suit Sets",       href: "/category/suit-sets" },
      { label: "Dupatta",         href: "/category/dupatta" },
      { label: "New Arrivals",    href: "/category/new-arrivals" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Track Your Order",    href: "/track-order" },
      { label: "Shipping & Returns",  href: "/shipping-returns" },
      { label: "Size Guide",          href: "/size-guide" },
      { label: "Fabric Care",         href: "/fabric-care" },
      { label: "Contact Us",          href: "/contact" },
    ],
  },
  {
    title: "The House",
    links: [
      { label: "Our Story",      href: "/our-story" },
      { label: "The Artisans",   href: "/artisans" },
      { label: "Sustainability", href: "/sustainability" },
      { label: "Stores",         href: "/stores" },
      { label: "Careers",        href: "/careers" },
    ],
  },
];

export { img };
