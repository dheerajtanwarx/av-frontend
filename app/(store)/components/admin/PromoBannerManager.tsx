"use client";

import { useEffect, useState } from "react";
import { fetchPromoBanner, updatePromoBanner, type PromoSlot, ApiError } from "../../lib/api";
import ImageUploader from "./ImageUploader";
import { AdminPanelSkeleton } from "../skeletons";

/* Admin manager for one homepage promo poster slot — upload a designed banner
   (text baked in), set where it links, and save. Empty image → the storefront
   shows its default stand-in. Mirrors HeroImageManager. */
export default function PromoBannerManager({
  slot,
  title,
}: {
  slot: PromoSlot;
  title: string;
}) {
  const [open, setOpen] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [href, setHref] = useState("");
  const [alt, setAlt] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let alive = true;
    fetchPromoBanner(slot)
      .then((p) => {
        if (!alive) return;
        setImage(p.image);
        setHref(p.href ?? "");
        setAlt(p.alt ?? "");
      })
      .catch(() => {
        /* leave defaults */
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [slot]);

  const dirty = () => setSaved(false);

  async function save() {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const result = await updatePromoBanner(slot, {
        image: image || null,
        href: href.trim() || null,
        alt: alt.trim() || null,
      });
      setImage(result.image);
      setHref(result.href ?? "");
      setAlt(result.alt ?? "");
      setSaved(true);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not save the promo banner.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-hero-panel">
      <button
        type="button"
        className="admin-hero-toggle"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span>
          <strong>{title}</strong>
          <span className="admin-hero-sub">
            {image ? "Custom poster set" : "Using the default lifestyle banner"}
          </span>
        </span>
        <span className="admin-hero-chevron">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="admin-hero-body">
          {loading ? (
            <AdminPanelSkeleton rows={3} withTitle={false} />
          ) : (
            <>
              <p className="admin-cell-sub admin-hero-note">
                Upload a wide, pre-designed poster (text baked into the image) — it renders
                full-width at its own proportions. Leave it empty to show the built-in lifestyle
                banner with an overlaid “Shop now”. Set the link to control where a click goes.
              </p>

              <div className="admin-social-fields" style={{ maxWidth: 520 }}>
                <div className="admin-social-field">
                  <span className="admin-social-field-label">Poster image</span>
                  <ImageUploader
                    value={image}
                    onChange={(url) => {
                      setImage(url);
                      dirty();
                    }}
                    onBusyChange={setUploading}
                    label="Upload poster"
                    aspect="24 / 9"
                  />
                </div>
                <label className="admin-social-field">
                  <span className="admin-social-field-label">Links to</span>
                  <input
                    className="admin-social-input"
                    value={href}
                    onChange={(e) => {
                      setHref(e.target.value);
                      dirty();
                    }}
                    placeholder="/search?q=summer  ·  /category/lehenga"
                  />
                </label>
                <label className="admin-social-field">
                  <span className="admin-social-field-label">Alt text</span>
                  <input
                    className="admin-social-input"
                    value={alt}
                    onChange={(e) => {
                      setAlt(e.target.value);
                      dirty();
                    }}
                    placeholder="Breezy Summer Arrivals"
                  />
                </label>
              </div>

              {error && <p className="admin-error">{error}</p>}

              <div className="admin-hero-foot">
                {uploading && <span className="admin-uploader-status">Uploading…</span>}
                {saved && !uploading && <span className="admin-hero-saved">✓ Saved</span>}
                <button
                  type="button"
                  className="admin-btn approve"
                  onClick={save}
                  disabled={saving || uploading}
                >
                  {saving ? "Saving…" : "Save promo banner"}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
