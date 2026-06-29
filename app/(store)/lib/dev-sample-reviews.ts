import type { FeaturedReview } from "./api";

/* ============================================================
   DEV-ONLY sample testimonials
   ------------------------------------------------------------
   These are NOT real reviews and must NEVER reach customers.
   They exist solely so the testimonials carousel can be previewed
   while the live `reviews` table is empty. `page.tsx` uses them
   ONLY when `process.env.NODE_ENV !== "production"`, so a real
   production build (`next build`/`next start`) shows nothing until
   genuine approved reviews exist. Product slugs map to live catalog
   pieces so the "on <product>" links resolve in dev.
   ============================================================ */
export const devSampleReviews: FeaturedReview[] = [
  {
    id: -1,
    rating: 5,
    author: "Aanya",
    createdAt: "",
    comment:
      "The bandhej work is exquisite — even finer in person than the photos. I've been complimented every time I've worn it.",
    product: { name: "Gulabi Bandhej Odhni", slug: "gulabi-bandhej-odhni" },
  },
  {
    id: -2,
    rating: 5,
    author: "Meera",
    createdAt: "",
    comment:
      "Beautiful drape and the colour is so rich. Packaging felt like a gift. Will absolutely order again.",
    product: { name: "Leheriya Wave Odhni", slug: "leheriya-wave-odhni" },
  },
  {
    id: -3,
    rating: 4,
    author: "Ritu",
    createdAt: "",
    comment:
      "Lovely fabric and true to the listing. Delivery was quick and the fit was perfect.",
    product: { name: "Gota Patti Rani Odhni", slug: "gota-patti-rani-odhni" },
  },
  {
    id: -4,
    rating: 5,
    author: "Sanjana",
    createdAt: "",
    comment:
      "Wore this to my sister's mehendi and everyone asked where it was from. Premium quality, worth every rupee.",
    product: { name: "Sanganeri Block Odhni", slug: "sanganeri-block-odhni" },
  },
  {
    id: -5,
    rating: 5,
    author: "Priya",
    createdAt: "",
    comment:
      "Hand-block detailing is stunning and the cotton is so breathable for summer. Thank you AV Creation!",
    product: { name: "Mothra Bandhani Odhni", slug: "mothra-bandhani-odhni" },
  },
  {
    id: -6,
    rating: 5,
    author: "Kavya",
    createdAt: "",
    comment:
      "Gorgeous leheriya and the tassels are such a pretty touch. The shade is exactly as shown.",
    product: { name: "Kesariya Leheriya Odhni", slug: "kesariya-leheriya-odhni" },
  },
  {
    id: -7,
    rating: 5,
    author: "Ishita",
    createdAt: "",
    comment:
      "My bridal lehenga exceeded every expectation — the zardozi is breathtaking and the fit was spot on.",
    product: { name: "Rani Bagh Bridal Lehenga", slug: "rani-bagh-bridal-lehenga" },
  },
  {
    id: -8,
    rating: 4,
    author: "Nupur",
    createdAt: "",
    comment:
      "Elegant and comfortable. Got so many compliments at the wedding. Slightly long but easy to alter.",
    product: { name: "Sheesh Mahal Lehenga", slug: "sheesh-mahal-lehenga" },
  },
];
