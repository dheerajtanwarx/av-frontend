"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  uploadImage,
  createProduct,
  updateProduct,
  ApiError,
  type AdminCategory,
  type AdminProductDetail,
  type AdminProductVariant,
  type ProductInput,
} from "../../lib/api";

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

type VariantRow = AdminProductVariant;

/** A gallery image plus the colour it's tied to (empty string = all colours).
    The colour name links the shot to a variant so the PDP swaps the gallery
    when a shopper picks that swatch. */
type GalleryImage = { imageUrl: string; variantColor: string };

type FormState = {
  name: string;
  slug: string;
  categoryId: string;
  type: string;
  badge: string;
  basePrice: string;
  comparePrice: string;
  description: string;
  sizes: string;
  isActive: boolean;
  isBestseller: boolean;
  images: GalleryImage[];
  variants: VariantRow[];
};

function initialState(p?: AdminProductDetail | null): FormState {
  if (!p) {
    return {
      name: "",
      slug: "",
      categoryId: "",
      type: "",
      badge: "",
      basePrice: "",
      comparePrice: "",
      description: "",
      sizes: "",
      isActive: true,
      isBestseller: false,
      images: [],
      variants: [],
    };
  }
  return {
    name: p.name,
    slug: p.slug,
    categoryId: String(p.categoryId),
    type: p.type ?? "",
    badge: p.badge ?? "",
    basePrice: String(p.basePrice),
    comparePrice: p.comparePrice == null ? "" : String(p.comparePrice),
    description: p.description ?? "",
    sizes: (p.sizes ?? []).join(", "),
    isActive: p.isActive,
    isBestseller: p.isBestseller,
    images: p.images.map((im) => ({
      imageUrl: im.imageUrl,
      // Resolve the stored variantId back to its colour name so the per-image
      // selector pre-fills; null/unknown → "" (all colours).
      variantColor:
        im.variantId != null
          ? p.variants.find((v) => v.id === im.variantId)?.color ?? ""
          : "",
    })),
    variants: p.variants.map((v) => ({
      id: v.id,
      color: v.color,
      colorHex: v.colorHex,
      price: v.price,
      stockQty: v.stockQty,
      sku: v.sku,
    })),
  };
}

export default function ProductForm({
  initial,
  categories,
  mode,
  initialCategoryId,
}: {
  initial?: AdminProductDetail | null;
  categories: AdminCategory[];
  mode: "create" | "edit";
  /** Preselected category for a new product (e.g. opened from a filtered list).
      Still freely changeable in the form. */
  initialCategoryId?: number;
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => {
    const base = initialState(initial);
    if (mode === "create" && initialCategoryId && !base.categoryId) {
      return { ...base, categoryId: String(initialCategoryId) };
    }
    return base;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [galleryBusy, setGalleryBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  /* ---- variants ---- */
  function addVariant() {
    set("variants", [
      ...form.variants,
      { color: "", colorHex: "#bd3c6e", price: Number(form.basePrice) || 0, stockQty: 0, sku: "" },
    ]);
  }
  function updateVariant(i: number, patch: Partial<VariantRow>) {
    set(
      "variants",
      form.variants.map((v, idx) => (idx === i ? { ...v, ...patch } : v))
    );
  }
  function removeVariant(i: number) {
    set("variants", form.variants.filter((_, idx) => idx !== i));
  }

  /* ---- gallery ---- */
  async function onPickImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    setGalleryBusy(true);
    setFormError("");
    try {
      const added: GalleryImage[] = [];
      for (const file of files) {
        const { url } = await uploadImage(file);
        added.push({ imageUrl: url, variantColor: "" });
      }
      set("images", [...form.images, ...added]);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Image upload failed.");
    } finally {
      setGalleryBusy(false);
    }
  }
  function removeImage(i: number) {
    set("images", form.images.filter((_, idx) => idx !== i));
  }
  function makePrimary(i: number) {
    if (i === 0) return;
    const next = [...form.images];
    const [moved] = next.splice(i, 1);
    next.unshift(moved);
    set("images", next);
  }
  function setImageColor(i: number, variantColor: string) {
    set("images", form.images.map((im, idx) => (idx === i ? { ...im, variantColor } : im)));
  }

  /* ---- validation (mirrors the backend) ---- */
  function validate(): Record<string, string> {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required.";
    if (!form.categoryId) e.categoryId = "Choose a category.";
    const base = Number(form.basePrice);
    if (!Number.isFinite(base) || base <= 0) e.basePrice = "Enter a price greater than 0.";
    if (form.comparePrice.trim() !== "") {
      const cp = Number(form.comparePrice);
      if (!Number.isFinite(cp) || cp < 0) e.comparePrice = "Must be 0 or more.";
      else if (cp > 0 && Number.isFinite(base) && cp <= base)
        e.comparePrice = "Should be higher than the price.";
    }
    const seen = new Set<string>();
    form.variants.forEach((v, i) => {
      if (!v.color.trim()) e[`variant.${i}.color`] = "Required.";
      if (!HEX_RE.test(v.colorHex)) e[`variant.${i}.colorHex`] = "#RRGGBB.";
      if (!Number.isFinite(Number(v.price)) || Number(v.price) <= 0) e[`variant.${i}.price`] = "> 0.";
      if (!Number.isInteger(Number(v.stockQty)) || Number(v.stockQty) < 0) e[`variant.${i}.stockQty`] = "≥ 0.";
      const sku = v.sku.trim();
      if (!sku) e[`variant.${i}.sku`] = "Required.";
      else if (seen.has(sku.toLowerCase())) e[`variant.${i}.sku`] = "Duplicate SKU.";
      seen.add(sku.toLowerCase());
    });
    return e;
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setFormError("");
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      setFormError("Please fix the highlighted fields.");
      return;
    }

    const payload: ProductInput = {
      name: form.name.trim(),
      slug: form.slug.trim() || undefined,
      categoryId: Number(form.categoryId),
      type: form.type.trim() || null,
      description: form.description.trim() || null,
      basePrice: Number(form.basePrice),
      comparePrice: form.comparePrice.trim() === "" ? null : Number(form.comparePrice),
      badge: form.badge.trim() || null,
      isBestseller: form.isBestseller,
      isActive: form.isActive,
      sizes: form.sizes
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      variants: form.variants.map((v) => ({
        id: v.id,
        color: v.color.trim(),
        colorHex: v.colorHex,
        price: Number(v.price),
        stockQty: Number(v.stockQty),
        sku: v.sku.trim(),
      })),
      images: form.images.map((im) => ({
        imageUrl: im.imageUrl,
        variantColor: im.variantColor.trim() || null,
      })),
    };

    setSaving(true);
    try {
      const saved =
        mode === "edit" && initial
          ? await updateProduct(initial.id, payload)
          : await createProduct(payload);
      router.push(`/admin/products?saved=${saved.id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message);
        if (err.fields) setErrors(err.fields);
      } else {
        setFormError("Something went wrong. Please try again.");
      }
      setSaving(false);
    }
  }

  return (
    <form className="admin-form" onSubmit={onSubmit}>
      {formError && <p className="admin-error">{formError}</p>}

      <div className="admin-form-grid">
        {/* ---- Left column: details ---- */}
        <div className="admin-form-col">
          <div className="admin-side-panel">
            <div className="admin-side-head">Details</div>
            <div className="admin-side-body admin-form-fields">
              <Field label="Name" error={errors.name}>
                <input
                  className="admin-input"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="e.g. Bandhani Silk Dupatta"
                />
              </Field>

              <div className="admin-form-row">
                <Field label="Category" error={errors.categoryId}>
                  <select
                    className="admin-input"
                    value={form.categoryId}
                    onChange={(e) => set("categoryId", e.target.value)}
                  >
                    <option value="">Select…</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Type (optional)">
                  <input
                    className="admin-input"
                    value={form.type}
                    onChange={(e) => set("type", e.target.value)}
                    placeholder="e.g. Dupatta"
                  />
                </Field>
              </div>

              <div className="admin-form-row">
                <Field label="Price (₹)" error={errors.basePrice}>
                  <input
                    className="admin-input"
                    type="number"
                    min="0"
                    value={form.basePrice}
                    onChange={(e) => set("basePrice", e.target.value)}
                  />
                </Field>
                <Field label="Compare-at (₹, optional)" error={errors.comparePrice}>
                  <input
                    className="admin-input"
                    type="number"
                    min="0"
                    value={form.comparePrice}
                    onChange={(e) => set("comparePrice", e.target.value)}
                  />
                </Field>
              </div>

              <div className="admin-form-row">
                <Field label="Badge (optional)">
                  <input
                    className="admin-input"
                    value={form.badge}
                    onChange={(e) => set("badge", e.target.value)}
                    placeholder="e.g. New, Bestseller"
                  />
                </Field>
                <Field label="Sizes (comma separated)">
                  <input
                    className="admin-input"
                    value={form.sizes}
                    onChange={(e) => set("sizes", e.target.value)}
                    placeholder="e.g. S, M, L"
                  />
                </Field>
              </div>

              <Field label="Description (optional)">
                <textarea
                  className="admin-input"
                  rows={4}
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                />
              </Field>

              {mode === "edit" && (
                <Field label="Slug">
                  <input
                    className="admin-input"
                    value={form.slug}
                    onChange={(e) => set("slug", e.target.value)}
                  />
                </Field>
              )}
            </div>
          </div>

          {/* ---- Variants ---- */}
          <div className="admin-side-panel">
            <div className="admin-side-head admin-form-head-row">
              <span>Variants &amp; stock</span>
              <button type="button" className="admin-btn" onClick={addVariant}>
                + Add variant
              </button>
            </div>
            <div className="admin-side-body">
              {form.variants.length === 0 ? (
                <p className="admin-cell-sub">
                  No variants yet. Add at least one colour with its stock and SKU so the
                  product is purchasable.
                </p>
              ) : (
                <div className="admin-variant-list">
                  {form.variants.map((v, i) => (
                    <div key={i} className="admin-variant-row">
                      <input
                        type="color"
                        className="admin-color-swatch"
                        value={HEX_RE.test(v.colorHex) ? v.colorHex : "#bd3c6e"}
                        onChange={(e) => updateVariant(i, { colorHex: e.target.value })}
                        title="Colour"
                      />
                      <FieldInline error={errors[`variant.${i}.color`]}>
                        <input
                          className="admin-input"
                          placeholder="Colour"
                          value={v.color}
                          onChange={(e) => updateVariant(i, { color: e.target.value })}
                        />
                      </FieldInline>
                      <FieldInline error={errors[`variant.${i}.sku`]}>
                        <input
                          className="admin-input"
                          placeholder="SKU"
                          value={v.sku}
                          onChange={(e) => updateVariant(i, { sku: e.target.value })}
                        />
                      </FieldInline>
                      <FieldInline error={errors[`variant.${i}.price`]} width={92}>
                        <input
                          className="admin-input"
                          type="number"
                          min="0"
                          placeholder="Price"
                          value={v.price}
                          onChange={(e) => updateVariant(i, { price: Number(e.target.value) })}
                        />
                      </FieldInline>
                      <FieldInline error={errors[`variant.${i}.stockQty`]} width={80}>
                        <input
                          className="admin-input"
                          type="number"
                          min="0"
                          placeholder="Stock"
                          value={v.stockQty}
                          onChange={(e) => updateVariant(i, { stockQty: Number(e.target.value) })}
                        />
                      </FieldInline>
                      <button
                        type="button"
                        className="admin-icon-btn"
                        onClick={() => removeVariant(i)}
                        aria-label="Remove variant"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ---- Right column: media + status ---- */}
        <div className="admin-form-col">
          <div className="admin-side-panel">
            <div className="admin-side-head admin-form-head-row">
              <span>Images</span>
              <button
                type="button"
                className="admin-btn"
                disabled={galleryBusy}
                onClick={() => fileRef.current?.click()}
              >
                {galleryBusy ? "Uploading…" : "+ Add images"}
              </button>
            </div>
            <div className="admin-side-body">
              {form.images.length === 0 ? (
                <p className="admin-cell-sub">No images yet. The first image becomes the primary.</p>
              ) : (
                <>
                  <div className="admin-gallery">
                    {form.images.map((im, i) => {
                      const colourOptions = form.variants
                        .map((v) => v.color.trim())
                        .filter(Boolean);
                      return (
                        <div
                          key={im.imageUrl + i}
                          className={`admin-gallery-item${i === 0 ? " primary" : ""}`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={im.imageUrl} alt="" />
                          {i === 0 && <span className="admin-gallery-badge">Primary</span>}
                          <div className="admin-gallery-actions">
                            {i !== 0 && (
                              <button type="button" onClick={() => makePrimary(i)} title="Make primary">
                                ★
                              </button>
                            )}
                            <button type="button" onClick={() => removeImage(i)} title="Remove">
                              ✕
                            </button>
                          </div>
                          {colourOptions.length > 0 && (
                            <select
                              className="admin-gallery-colour"
                              value={im.variantColor}
                              onChange={(e) => setImageColor(i, e.target.value)}
                              title="Show this image for which colour?"
                            >
                              <option value="">All colours</option>
                              {colourOptions.map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <p className="admin-cell-sub admin-gallery-hint">
                    Assign a colour to an image so it shows when that swatch is
                    picked on the product page. Leave as <b>All colours</b> for
                    shared shots.
                  </p>
                </>
              )}
              <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={onPickImages} />
            </div>
          </div>

          <div className="admin-side-panel">
            <div className="admin-side-head">Status</div>
            <div className="admin-side-body admin-form-fields">
              <label className="admin-check">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => set("isActive", e.target.checked)}
                />
                <span>Active (visible in store)</span>
              </label>
              <label className="admin-check">
                <input
                  type="checkbox"
                  checked={form.isBestseller}
                  onChange={(e) => set("isBestseller", e.target.checked)}
                />
                <span>Mark as bestseller</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-form-foot">
        <button type="button" className="admin-btn" onClick={() => router.push("/admin/products")}>
          Cancel
        </button>
        <button type="submit" className="admin-btn approve" disabled={saving || galleryBusy}>
          {saving ? "Saving…" : mode === "edit" ? "Save changes" : "Create product"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="admin-field">
      <span className="admin-field-label">{label}</span>
      {children}
      {error && <span className="admin-field-error">{error}</span>}
    </label>
  );
}

function FieldInline({
  error,
  width,
  children,
}: {
  error?: string;
  width?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="admin-field-inline" style={width ? { width } : undefined}>
      {children}
      {error && <span className="admin-field-error">{error}</span>}
    </div>
  );
}
