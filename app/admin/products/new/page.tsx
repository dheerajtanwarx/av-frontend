"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  fetchAdminCategories,
  ApiError,
  type AdminCategory,
} from "../../../lib/api";
import ProductForm from "../../../components/admin/ProductForm";

function NewProductView() {
  const searchParams = useSearchParams();
  const presetName = searchParams.get("category");

  const [categories, setCategories] = useState<AdminCategory[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    fetchAdminCategories()
      .then((c) => alive && setCategories(c))
      .catch((e) =>
        alive && setError(e instanceof ApiError ? e.message : "Failed to load categories.")
      );
    return () => {
      alive = false;
    };
  }, []);

  // Resolve the category name carried in the URL to its id for preselection.
  const initialCategoryId = useMemo(() => {
    if (!presetName || !categories) return undefined;
    return categories.find((c) => c.name.toLowerCase() === presetName.toLowerCase())?.id;
  }, [presetName, categories]);

  return (
    <section className="admin-page">
      <a className="admin-link admin-back" href="/admin/products">
        ← Back to products
      </a>
      <header className="admin-page-head">
        <h2>New product</h2>
        <p>Add a product to the catalogue with its variants, stock and imagery.</p>
      </header>

      {error ? (
        <p className="admin-error">{error}</p>
      ) : categories ? (
        <ProductForm mode="create" categories={categories} initialCategoryId={initialCategoryId} />
      ) : (
        <p className="admin-note">Loading…</p>
      )}
    </section>
  );
}

export default function NewProductPage() {
  return (
    <Suspense fallback={<p className="admin-note">Loading…</p>}>
      <NewProductView />
    </Suspense>
  );
}
