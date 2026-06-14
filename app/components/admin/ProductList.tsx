"use client";

import { memo } from "react";
import type { AdminProductListItem } from "../../lib/api";

function inr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/* The product catalogue table. Pure presentation — the page owns loading,
   filtering and the delete modal; this just renders the current page of rows
   and bubbles a delete request up. */
function ProductList({
  products,
  loading,
  emptyLabel,
  onRequestDelete,
}: {
  products: AdminProductListItem[];
  loading: boolean;
  emptyLabel?: string;
  onRequestDelete: (product: AdminProductListItem) => void;
}) {
  return (
    <div className="admin-table-wrap">
      <table className="admin-table admin-products-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Category</th>
            <th className="num">Price</th>
            <th className="num">Stock</th>
            <th>Status</th>
            <th className="actions-col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>
                <div className="admin-product-cell">
                  <div className="admin-product-thumb">
                    {p.image ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={p.image} alt="" />
                    ) : (
                      <span className="admin-product-thumb-empty" />
                    )}
                  </div>
                  <div>
                    <a className="admin-cell-strong admin-link" href={`/admin/products/edit/${p.id}`}>
                      {p.name}
                    </a>
                    {p.type && <div className="admin-cell-sub">{p.type}</div>}
                  </div>
                </div>
              </td>
              <td>{p.category?.name ?? "—"}</td>
              <td className="num">
                {inr(p.price)}
                {p.comparePrice ? (
                  <span className="admin-price-was"> {inr(p.comparePrice)}</span>
                ) : null}
              </td>
              <td className="num">
                <span className={p.stock <= 0 ? "admin-stock-out" : p.stock < 10 ? "admin-stock-low" : ""}>
                  {p.stock}
                </span>
              </td>
              <td>
                <span className={`status-badge ${p.isActive ? "delivered" : "cancelled"}`}>
                  {p.isActive ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="actions-col">
                <div className="admin-row-actions">
                  <a className="admin-btn" href={`/admin/products/edit/${p.id}`}>
                    Edit
                  </a>
                  <button className="admin-btn reject" onClick={() => onRequestDelete(p)}>
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {loading ? (
        <p className="admin-note">Loading products…</p>
      ) : products.length === 0 ? (
        <p className="admin-note">{emptyLabel ?? "No products match this view."}</p>
      ) : null}
    </div>
  );
}

export default memo(ProductList);
