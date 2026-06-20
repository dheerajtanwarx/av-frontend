import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchProducts, fetchCategories, ApiError } from "../../lib/api";
import Header from "../../components/landing/Header";
import CategoryListing from "../../components/category/CategoryListing";
import ScrollReveal from "../../components/landing/ScrollReveal";
import Footer from "../../components/landing/Footer";
import JsonLd from "../../components/JsonLd";
import { breadcrumbLd } from "../../lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const categories = await fetchCategories().catch(() => []);
  const cat = categories.find((c) => c.slug === slug);
  const name = cat?.name ?? slug.replace(/-/g, " ");
  const title = `${name} — AV Creation`;
  const description = `Shop the full ${name} collection — handcrafted in Jaipur, Rajasthan.`;
  const path = `/category/${slug}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", title, description, url: path },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [products, categories] = await Promise.all([
    fetchProducts({ category: slug }).catch((err) => {
      if (err instanceof ApiError && err.status === 404) return null;
      return [];
    }),
    fetchCategories().catch(() => []),
  ]);

  // null means the backend gave a 404 for this category
  if (products === null) notFound();

  const category = categories.find((c) => c.slug === slug);
  const categoryName =
    category?.name ?? slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="av">
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: categoryName, path: `/category/${slug}` },
        ])}
      />
      <ScrollReveal />
      <Header />
      <CategoryListing
        categoryName={categoryName}
        products={products ?? []}
      />

      <Footer />
    </div>
  );
}
