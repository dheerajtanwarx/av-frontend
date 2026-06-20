import type { MetadataRoute } from "next";
import { SITE_URL, KNOWN_CATEGORY_SLUGS } from "@/app/(store)/lib/seo";
import { fetchProducts, fetchCategories } from "@/app/(store)/lib/api";
import { odhniEdit, bestsellers } from "@/app/(store)/lib/landing-data";

// Re-generated hourly; resilient to the API being briefly unreachable.
export const revalidate = 3600;

/** Static, publicly-indexable storefront routes. */
const STATIC_PATHS: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "", priority: 1.0, freq: "daily" },
  { path: "/search", priority: 0.8, freq: "daily" },
  { path: "/our-story", priority: 0.5, freq: "yearly" },
  { path: "/artisans", priority: 0.5, freq: "yearly" },
  { path: "/stores", priority: 0.6, freq: "monthly" },
  { path: "/sustainability", priority: 0.4, freq: "yearly" },
  { path: "/fabric-care", priority: 0.4, freq: "yearly" },
  { path: "/size-guide", priority: 0.4, freq: "yearly" },
  { path: "/shipping-returns", priority: 0.4, freq: "yearly" },
  { path: "/contact", priority: 0.5, freq: "yearly" },
  { path: "/careers", priority: 0.3, freq: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Categories — live from the API, with a known-slug fallback.
  let categorySlugs: string[] = [];
  try {
    categorySlugs = (await fetchCategories({ revalidate })).map((c) => c.slug);
  } catch {
    /* API unreachable — fall back below */
  }
  if (!categorySlugs.length) categorySlugs = KNOWN_CATEGORY_SLUGS;

  // Products — live from the API, with the bundled static catalog as fallback.
  let productSlugs: string[] = [];
  try {
    productSlugs = (await fetchProducts({}, { revalidate })).map((p) => p.slug);
  } catch {
    /* API unreachable — fall back below */
  }
  if (!productSlugs.length) {
    productSlugs = [...odhniEdit, ...bestsellers].map((p) => p.slug);
  }
  productSlugs = Array.from(new Set(productSlugs));

  return [
    ...STATIC_PATHS.map((s) => ({
      url: `${SITE_URL}${s.path}`,
      lastModified: now,
      changeFrequency: s.freq,
      priority: s.priority,
    })),
    ...categorySlugs.map((slug) => ({
      url: `${SITE_URL}/category/${slug}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...productSlugs.map((slug) => ({
      url: `${SITE_URL}/product/${slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
