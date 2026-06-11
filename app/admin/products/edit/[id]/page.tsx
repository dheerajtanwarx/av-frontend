"use client";

import { use, useEffect, useState } from "react";
import {
  fetchAdminCategories,
  fetchAdminProduct,
  ApiError,
  type AdminCategory,
  type AdminProductDetail,
} from "../../../../lib/api";
import ProductForm from "../../../../components/admin/ProductForm";

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [categories, setCategories] = useState<AdminCategory[] | null>(null);
  const [product, setProduct] = useState<AdminProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const numId = Number(id);
    if (!Number.isInteger(numId) || numId <= 0) {
      setError("Invalid product.");
      setLoading(false);
      return;
    }
    let alive = true;
    Promise.all([fetchAdminCategories(), fetchAdminProduct(numId)])
      .then(([c, p]) => {
        if (!alive) return;
        setCategories(c);
        setProduct(p);
      })
      .catch((e) => {
        if (alive) setError(e instanceof ApiError ? e.message : "Failed to load product.");
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [id]);

  return (
    <section className="admin-page">
      <a className="admin-link admin-back" href="/admin/products">
        ← Back to products
      </a>
      <header className="admin-page-head">
        <h2>{product ? `Edit · ${product.name}` : "Edit product"}</h2>
        <p>Update details, variants, stock, imagery and visibility.</p>
      </header>

      {loading ? (
        <p className="admin-note">Loading…</p>
      ) : error ? (
        <p className="admin-error">{error}</p>
      ) : categories && product ? (
        <ProductForm mode="edit" categories={categories} initial={product} />
      ) : null}
    </section>
  );
}
