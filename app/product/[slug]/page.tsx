import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllSlugs, getProduct } from "../../lib/pdp-data";
import ProductDetail from "../../components/pdp/ProductDetail";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
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
  const product = getProduct(slug);
  if (!product) notFound();
  return <ProductDetail product={product} />;
}
