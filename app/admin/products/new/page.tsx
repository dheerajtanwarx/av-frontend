"use client";

import { useEffect, useState } from "react";
import {
  fetchAdminCategories,
  ApiError,
  type AdminCategory,
} from "../../../lib/api";
import ProductForm from "../../../components/admin/ProductForm";

export default function NewProductPage() {
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
        <ProductForm mode="create" categories={categories} />
      ) : (
        <p className="admin-note">Loading…</p>
      )}
    </section>
  );
}
