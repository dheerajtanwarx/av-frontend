"use client";

import { useEffect, useState } from "react";
import {
  fetchHeroSettings,
  updateHeroSettings,
  ApiError,
} from "../../lib/api";
import ImageUploader from "./ImageUploader";

/* The storefront hero slides, in order. Labels mirror app/lib/landing-data.ts
   so an admin can tell which slide they're replacing the background for. */
const HERO_SLIDES = [
  { title: "Tradition, Woven with Grace", tag: "The Maharani Collection" },
  { title: "The Jaipuri Odhni", tag: "The House Signature" },
  { title: "For the Once-in-a-Lifetime", tag: "Bridal Atelier" },
  { title: "New Festive Arrivals", tag: "Fresh off the Loom" },
];

export default function HeroImageManager() {
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState<(string | null)[]>(
    () => HERO_SLIDES.map(() => null)
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let alive = true;
    fetchHeroSettings()
      .then((d) => {
        if (!alive) return;
        // Pad/trim stored overrides to the slide count.
        setImages(HERO_SLIDES.map((_, i) => d.images[i] ?? null));
      })
      .catch(() => {
        /* fall back to defaults (all null) */
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  function setSlide(i: number, url: string | null) {
    setImages((prev) => prev.map((u, idx) => (idx === i ? url : u)));
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      await updateHeroSettings(images);
      setSaved(true);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not save hero images.");
    } finally {
      setSaving(false);
    }
  }

  const overrideCount = images.filter(Boolean).length;

  return (
    <div className="admin-hero-panel">
      <button
        type="button"
        className="admin-hero-toggle"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span>
          <strong>Homepage hero images</strong>
          <span className="admin-hero-sub">
            {overrideCount > 0
              ? `${overrideCount} of ${HERO_SLIDES.length} slides using a custom image`
              : "Using built-in default backgrounds"}
          </span>
        </span>
        <span className="admin-hero-chevron">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="admin-hero-body">
          {loading ? (
            <p className="admin-note">Loading hero settings…</p>
          ) : (
            <>
              <p className="admin-cell-sub admin-hero-note">
                Replace the background image for any hero slide. Leave blank to keep the
                built-in default. Images are stored on Cloudinary.
              </p>
              <div className="admin-hero-grid">
                {HERO_SLIDES.map((s, i) => (
                  <div key={i} className="admin-hero-slide">
                    <div className="admin-hero-slide-meta">
                      <span className="admin-hero-slide-tag">{s.tag}</span>
                      <span className="admin-hero-slide-title">{s.title}</span>
                    </div>
                    <ImageUploader
                      value={images[i]}
                      onChange={(url) => setSlide(i, url)}
                      label="Upload background"
                      aspect="16 / 9"
                    />
                  </div>
                ))}
              </div>

              {error && <p className="admin-error">{error}</p>}

              <div className="admin-hero-foot">
                {saved && <span className="admin-hero-saved">✓ Saved</span>}
                <button
                  type="button"
                  className="admin-btn approve"
                  onClick={save}
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Save hero images"}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
