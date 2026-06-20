import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { getProduct, type PdpProduct } from "../../lib/pdp-data";
import { fetchProduct, ApiError } from "../../lib/api";
import ProductDetail from "../../components/pdp/ProductDetail";
import JsonLd from "../../components/JsonLd";
import { absoluteUrl, breadcrumbLd } from "../../lib/seo";

// Load from the API; on 404 return null, on any other failure (e.g. the
// backend being down) fall back to the bundled static product so the page
// still renders. Wrapped in cache() to dedupe the metadata + page calls.
const load = cache(async (slug: string): Promise<PdpProduct | null> => {
  try {
    return await fetchProduct(slug);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    return getProduct(slug);
  }
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await load(slug);
  if (!product) return { title: "Product not found — AV Creation" };
  const path = `/product/${slug}`;
  const ogImage = product.images?.[0];
  return {
    title: `${product.name} — AV Creation`,
    description: product.desc,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      title: `${product.name} — AV Creation`,
      description: product.desc,
      url: path,
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} — AV Creation`,
      description: product.desc,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

/** Parse a "₹6,800" price string into a plain number for schema.org offers. */
function priceNumber(price: string): string {
  const n = Number(String(price).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) && n > 0 ? String(n) : "0";
}

function productLd(product: PdpProduct, slug: string): Record<string, unknown> {
  const inStock = product.colors.some((c) => c.stock == null || c.stock > 0);
  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.desc,
    sku: slug,
    ...(product.images?.length ? { image: product.images } : {}),
    brand: { "@type": "Brand", name: "AV Creation" },
    offers: {
      "@type": "Offer",
      price: priceNumber(product.price),
      priceCurrency: "INR",
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: absoluteUrl(`/product/${slug}`),
    },
  };
  if (product.reviewCount > 0) {
    ld.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    };
  }
  return ld;
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await load(slug);
  if (!product) notFound();
  const breadcrumb = breadcrumbLd([
    { name: "Home", path: "/" },
    { name: product.name, path: `/product/${slug}` },
  ]);
  return (
    <>
      <JsonLd data={[productLd(product, slug), breadcrumb]} />
      <ProductDetail product={product} />
    </>
  );
}
