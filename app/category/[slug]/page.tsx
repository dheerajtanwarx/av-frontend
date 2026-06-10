import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchProducts, fetchCategories, ApiError } from "../../lib/api";
import Header from "../../components/landing/Header";
import NewsletterForm from "../../components/landing/NewsletterForm";
import CategoryListing from "../../components/category/CategoryListing";
import ScrollReveal from "../../components/landing/ScrollReveal";
import Footer from "../../components/landing/Footer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const categories = await fetchCategories().catch(() => []);
  const cat = categories.find((c) => c.slug === slug);
  const name = cat?.name ?? slug.replace(/-/g, " ");
  return {
    title: `${name} — AV Creation`,
    description: `Shop the full ${name} collection — handcrafted in Jaipur, Rajasthan.`,
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
      <ScrollReveal />
      <Header />
      <CategoryListing
        categoryName={categoryName}
        products={products ?? []}
      />

      {/* Newsletter */}
      <section className="news">
        <div className="ring a" />
        <div className="ring b" />
        <div className="wrap">
          <div className="eyebrow">Join the Maharani Circle</div>
          <h2>
            A little Jaipur,
            <br />
            in your inbox
          </h2>
          <p>Early access to new drops, styling notes and ₹500 off your first order above ₹3,000.</p>
          <NewsletterForm />
        </div>
      </section>

      <Footer />
    </div>
  );
}
