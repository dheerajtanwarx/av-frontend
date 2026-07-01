"use client";

import { useEffect, useState } from "react";
import {
  fetchSocialSettings,
  updateSocialSettings,
  fetchProducts,
  ApiError,
} from "../../lib/api";
import type { SocialReel, SocialPost } from "../../lib/landing-data";
import ImageUploader from "./ImageUploader";
import VideoUploader from "./VideoUploader";
import { AdminPanelSkeleton } from "../skeletons";

/* Editable drafts — nulls are allowed mid-edit (an empty uploader slot) and are
   compacted away on save. */
type ReelDraft = {
  id: string;
  poster: string | null;
  video: string | null;
  caption: string;
  views: string;
  productSlug: string;
  /** True when the poster was auto-derived from the video (so we may replace it
      when the video changes). Cleared the moment the admin sets a poster by hand. */
  posterAuto: boolean;
};
type PostDraft = {
  id: string;
  images: (string | null)[];
  caption: string;
  productSlug: string;
};

type ProductOpt = { slug: string; name: string };

let seq = 0;
const newId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${(seq++).toString(36)}`;

/* Derive a representative still frame from a Cloudinary video URL — used as the
   auto cover when the admin uploads a reel without picking a poster. Returns
   null for non-Cloudinary URLs (then the admin just uploads a cover manually). */
function videoPosterUrl(videoUrl: string): string | null {
  const m = videoUrl.match(/^(https:\/\/res\.cloudinary\.com\/[^/]+)\/video\/upload\/(.+)$/);
  if (!m) return null;
  const [, base, rest] = m;
  const jpg = rest.replace(/\.(mp4|mov|webm|m4v|ogv)$/i, ".jpg");
  // so_auto = Cloudinary picks a representative frame (not a black first frame).
  return `${base}/video/upload/so_auto,q_auto/${jpg}`;
}

function reelToDraft(r: SocialReel): ReelDraft {
  return {
    id: r.id || newId("reel"),
    poster: r.poster || null,
    video: r.video || null,
    caption: r.caption || "",
    views: r.views || "",
    productSlug: r.productSlug || "",
    // Loaded posters are treated as manual, so a later video swap won't clobber them.
    posterAuto: false,
  };
}
function postToDraft(p: SocialPost): PostDraft {
  return {
    id: p.id || newId("post"),
    images: p.images.length ? [...p.images] : [null],
    caption: p.caption || "",
    productSlug: p.productSlug || "",
  };
}

/* "Shop this look" product picker. Module-level so it isn't recreated on every
   render (which would reset its state and trip react-hooks/static-components). */
function ProductSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: ProductOpt[];
  onChange: (slug: string) => void;
}) {
  return (
    <label className="admin-social-field">
      <span className="admin-social-field-label">Shop this look</span>
      <select
        className="admin-social-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">No product</option>
        {/* Keep a stale slug selectable even if it's no longer in the catalogue. */}
        {value && !options.some((p) => p.slug === value) && (
          <option value={value}>{value} (not found)</option>
        )}
        {options.map((p) => (
          <option key={p.slug} value={p.slug}>
            {p.name}
          </option>
        ))}
      </select>
    </label>
  );
}

/* Admin manager for the homepage #DrapedInAV feeds — reels (poster + optional
   video) and posts (image galleries), each with an optional "Shop this look"
   product. Mirrors HeroImageManager: a collapsible panel that loads the current
   settings, lets the admin edit, and saves back to the SiteSetting row. */
export default function SocialManager() {
  const [open, setOpen] = useState(false);
  const [reels, setReels] = useState<ReelDraft[]>([]);
  const [posts, setPosts] = useState<PostDraft[]>([]);
  const [products, setProducts] = useState<ProductOpt[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  // How many uploads are in flight right now (across all reel/post uploaders).
  const [uploads, setUploads] = useState(0);
  const onBusyChange = (busy: boolean) => setUploads((n) => Math.max(0, n + (busy ? 1 : -1)));
  const uploading = uploads > 0;

  useEffect(() => {
    let alive = true;
    Promise.all([
      fetchSocialSettings().catch(() => ({ reels: [], posts: [] })),
      fetchProducts({}).catch(() => []),
    ])
      .then(([s, prods]) => {
        if (!alive) return;
        setReels(s.reels.map(reelToDraft));
        setPosts(s.posts.map(postToDraft));
        setProducts(prods.map((p) => ({ slug: p.slug, name: p.name })));
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const dirty = () => setSaved(false);

  /* ---- reel mutations ---- */
  const patchReel = (id: string, patch: Partial<ReelDraft>) => {
    setReels((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    dirty();
  };
  // The admin uploaded/removed a video. Auto-fill the cover from the video when
  // there is no manual poster yet (or the current one was itself auto-derived).
  const onReelVideo = (id: string, url: string | null) => {
    setReels((rs) =>
      rs.map((r) => {
        if (r.id !== id) return r;
        if (!url) return { ...r, video: null };
        const derived = videoPosterUrl(url);
        if (derived && (!r.poster || r.posterAuto)) {
          return { ...r, video: url, poster: derived, posterAuto: true };
        }
        return { ...r, video: url };
      })
    );
    dirty();
  };
  // A poster the admin sets by hand is theirs to keep — never auto-overwrite it.
  const onReelPoster = (id: string, url: string | null) =>
    patchReel(id, { poster: url, posterAuto: false });
  const addReel = () => {
    setReels((rs) => [
      ...rs,
      {
        id: newId("reel"),
        poster: null,
        video: null,
        caption: "",
        views: "",
        productSlug: "",
        posterAuto: false,
      },
    ]);
    dirty();
  };
  const removeReel = (id: string) => {
    setReels((rs) => rs.filter((r) => r.id !== id));
    dirty();
  };

  /* ---- post mutations ---- */
  const patchPost = (id: string, patch: Partial<PostDraft>) => {
    setPosts((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    dirty();
  };
  const setPostImage = (id: string, idx: number, url: string | null) => {
    setPosts((ps) =>
      ps.map((p) =>
        p.id === id ? { ...p, images: p.images.map((u, i) => (i === idx ? url : u)) } : p
      )
    );
    dirty();
  };
  const addPostImage = (id: string) => {
    setPosts((ps) => ps.map((p) => (p.id === id ? { ...p, images: [...p.images, null] } : p)));
    dirty();
  };
  const removePostImage = (id: string, idx: number) => {
    setPosts((ps) =>
      ps.map((p) =>
        p.id === id ? { ...p, images: p.images.filter((_, i) => i !== idx) } : p
      )
    );
    dirty();
  };
  const addPost = () => {
    setPosts((ps) => [...ps, { id: newId("post"), images: [null], caption: "", productSlug: "" }]);
    dirty();
  };
  const removePost = (id: string) => {
    setPosts((ps) => ps.filter((p) => p.id !== id));
    dirty();
  };

  async function save() {
    setSaving(true);
    setError("");
    setSaved(false);
    // Compact drafts into the API shape; the backend drops anything half-filled
    // too, but we mirror that here so the admin sees what will actually persist.
    const payload = {
      reels: reels
        .filter((r) => r.poster)
        .map<SocialReel>((r) => ({
          id: r.id,
          poster: r.poster as string,
          video: r.video || undefined,
          caption: r.caption.trim() || undefined,
          views: r.views.trim() || undefined,
          productSlug: r.productSlug || undefined,
        })),
      posts: posts
        .map((p) => ({ ...p, images: p.images.filter((u): u is string => !!u) }))
        .filter((p) => p.images.length > 0)
        .map<SocialPost>((p) => ({
          id: p.id,
          images: p.images,
          caption: p.caption.trim() || undefined,
          productSlug: p.productSlug || undefined,
        })),
    };
    try {
      const result = await updateSocialSettings(payload);
      setReels(result.reels.map(reelToDraft));
      setPosts(result.posts.map(postToDraft));
      setSaved(true);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not save social feeds.");
    } finally {
      setSaving(false);
    }
  }

  // Don't let the admin stack up empty rows: "Add reel" waits until the last
  // reel has media (cover or video), "Add post" until the last post has an image.
  const reelIncomplete = reels.some((r) => !r.poster && !r.video);
  const postIncomplete = posts.some((p) => !p.images.some(Boolean));
  const canSave = !saving && !uploading;

  return (
    <div className="admin-hero-panel">
      <button
        type="button"
        className="admin-hero-toggle"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span>
          <strong>Homepage social feeds — #DrapedInAV</strong>
          <span className="admin-hero-sub">
            {reels.length} reel{reels.length === 1 ? "" : "s"} · {posts.length} post
            {posts.length === 1 ? "" : "s"}
          </span>
        </span>
        <span className="admin-hero-chevron">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="admin-hero-body">
          {loading ? (
            <AdminPanelSkeleton rows={4} withTitle={false} />
          ) : (
            <>
              <p className="admin-cell-sub admin-hero-note">
                These reels and posts open in the on-site lightbox (never a new tab). Upload a
                reel video and its cover is set automatically from a frame — or upload your own
                cover to override it. A reel with no video just shows its cover with a play
                affordance. Posts need at least one image. Leave both feeds empty to use the
                built-in defaults. Media is stored on Cloudinary.
              </p>

              {/* ---- REELS ---- */}
              <div className="admin-social-section">
                <div className="admin-social-section-head">
                  <h4>Reels</h4>
                  <button
                    type="button"
                    className="admin-btn"
                    onClick={addReel}
                    disabled={uploading || reelIncomplete}
                    title={
                      reelIncomplete
                        ? "Add a cover or video to the current reel first"
                        : undefined
                    }
                  >
                    + Add reel
                  </button>
                </div>
                {reels.length === 0 && (
                  <p className="admin-social-empty">No reels — the default seed will show.</p>
                )}
                <div className="admin-social-rows">
                  {reels.map((r, i) => (
                    <div key={r.id} className="admin-social-row">
                      <div className="admin-social-media">
                        <div>
                          <span className="admin-social-field-label">
                            Cover{r.posterAuto ? " · auto from video" : ""}
                          </span>
                          <ImageUploader
                            value={r.poster}
                            onChange={(url) => onReelPoster(r.id, url)}
                            onBusyChange={onBusyChange}
                            label="Upload cover"
                            aspect="9 / 16"
                          />
                          <span className="admin-uploader-hint">
                            Auto-filled from the video — upload here to use your own cover.
                          </span>
                        </div>
                        <div>
                          <span className="admin-social-field-label">Video (optional)</span>
                          <VideoUploader
                            value={r.video}
                            onChange={(url) => onReelVideo(r.id, url)}
                            onBusyChange={onBusyChange}
                          />
                        </div>
                      </div>
                      <div className="admin-social-fields">
                        <label className="admin-social-field">
                          <span className="admin-social-field-label">Caption</span>
                          <input
                            className="admin-social-input"
                            value={r.caption}
                            onChange={(e) => patchReel(r.id, { caption: e.target.value })}
                            placeholder="Tying the bandhej, dot by dot"
                          />
                        </label>
                        <label className="admin-social-field">
                          <span className="admin-social-field-label">Views label</span>
                          <input
                            className="admin-social-input"
                            value={r.views}
                            onChange={(e) => patchReel(r.id, { views: e.target.value })}
                            placeholder="1.2M"
                          />
                        </label>
                        <ProductSelect options={products}
                          value={r.productSlug}
                          onChange={(slug) => patchReel(r.id, { productSlug: slug })}
                        />
                        <button
                          type="button"
                          className="admin-btn reject admin-social-remove"
                          onClick={() => removeReel(r.id)}
                        >
                          Remove reel {i + 1}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ---- POSTS ---- */}
              <div className="admin-social-section">
                <div className="admin-social-section-head">
                  <h4>Posts</h4>
                  <button
                    type="button"
                    className="admin-btn"
                    onClick={addPost}
                    disabled={uploading || postIncomplete}
                    title={
                      postIncomplete ? "Add an image to the current post first" : undefined
                    }
                  >
                    + Add post
                  </button>
                </div>
                {posts.length === 0 && (
                  <p className="admin-social-empty">No posts — the default seed will show.</p>
                )}
                <div className="admin-social-rows">
                  {posts.map((p, i) => (
                    <div key={p.id} className="admin-social-row">
                      <div className="admin-social-gallery">
                        {p.images.map((url, idx) => (
                          <div key={idx} className="admin-social-gallery-item">
                            <ImageUploader
                              value={url}
                              onChange={(u) => setPostImage(p.id, idx, u)}
                              onBusyChange={onBusyChange}
                              label="Upload image"
                              aspect="4 / 5"
                            />
                            {p.images.length > 1 && (
                              <button
                                type="button"
                                className="admin-btn reject admin-social-img-remove"
                                onClick={() => removePostImage(p.id, idx)}
                              >
                                Remove image
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          className="admin-btn admin-social-add-img"
                          onClick={() => addPostImage(p.id)}
                        >
                          + Add image
                        </button>
                      </div>
                      <div className="admin-social-fields">
                        <label className="admin-social-field">
                          <span className="admin-social-field-label">Caption</span>
                          <input
                            className="admin-social-input"
                            value={p.caption}
                            onChange={(e) => patchPost(p.id, { caption: e.target.value })}
                            placeholder="The Rani edit — gota patti on hand-dyed silk"
                          />
                        </label>
                        <ProductSelect options={products}
                          value={p.productSlug}
                          onChange={(slug) => patchPost(p.id, { productSlug: slug })}
                        />
                        <button
                          type="button"
                          className="admin-btn reject admin-social-remove"
                          onClick={() => removePost(p.id)}
                        >
                          Remove post {i + 1}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {error && <p className="admin-error">{error}</p>}

              <div className="admin-hero-foot">
                {uploading && (
                  <span className="admin-uploader-status">Uploading media…</span>
                )}
                {saved && !uploading && <span className="admin-hero-saved">✓ Saved</span>}
                <button
                  type="button"
                  className="admin-btn approve"
                  onClick={save}
                  disabled={!canSave}
                  title={uploading ? "Wait for the upload to finish" : undefined}
                >
                  {saving ? "Saving…" : "Save social feeds"}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
