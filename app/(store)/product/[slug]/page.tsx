import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { getProduct, type PdpProduct } from "../../lib/pdp-data";
import { fetchProduct, ApiError } from "../../lib/api";
import ProductDetail from "../../components/pdp/ProductDetail";

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
  return {
    title: `${product.name} — AV Creation`,
    description: product.desc,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await load(slug);
  if (!product) notFound();
  return <ProductDetail product={product} />;
}
