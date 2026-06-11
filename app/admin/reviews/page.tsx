"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchAdminReviews,
  moderateReview,
  ApiError,
  type AdminReview,
  type AdminReviewFilter,
  type AdminReviewsResponse,
} from "../../lib/api";

const TABS: { key: AdminReviewFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "visible", label: "Visible" },
  { key: "hidden", label: "Hidden" },
];

function Stars({ rating }: { rating: number }) {
  return (
    <span className="admin-stars" aria-label={`${rating} out of 5`}>
      {"★★★★★".slice(0, rating)}
      <span className="admin-stars-empty">{"★★★★★".slice(rating)}</span>
    </span>
  );
}

function ReviewRow({
  review,
  busy,
  onModerate,
}: {
  review: AdminReview;
  busy: boolean;
  onModerate: (id: number, action: "approve" | "reject") => void;
}) {
  return (
    <div className={`admin-review${review.isApproved ? "" : " hidden"}`}>
      <div className="admin-review-main">
        <div className="admin-review-top">
          <Stars rating={review.rating} />
          <span
            className={`admin-pill ${review.isApproved ? "live" : "down"}`}
          >
            {review.isApproved ? "Visible" : "Hidden"}
          </span>
        </div>
        <div className="admin-review-meta">
          <strong>{review.author}</strong> on{" "}
          <a href={`/product/${review.product.slug}`} className="admin-link">
            {review.product.name}
          </a>{" "}
          · {new Date(review.createdAt).toLocaleDateString()}
        </div>
        {review.comment ? (
          <p className="admin-review-comment">{review.comment}</p>
        ) : (
          <p className="admin-review-comment empty">No written comment.</p>
        )}
      </div>
      <div className="admin-review-actions">
        {review.isApproved ? (
          <button
            className="admin-btn reject"
            disabled={busy}
            onClick={() => onModerate(review.id, "reject")}
          >
            Hide
          </button>
        ) : (
          <button
            className="admin-btn approve"
            disabled={busy}
            onClick={() => onModerate(review.id, "approve")}
          >
            Restore
          </button>
        )}
      </div>
    </div>
  );
}

/* Review moderation UI. The admin layout's AdminGuard has already confirmed an
   ADMIN session by the time this mounts, so it can fetch admin data directly. */
export default function AdminReviewsPage() {
  const [tab, setTab] = useState<AdminReviewFilter>("all");
  const [data, setData] = useState<AdminReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async (filter: AdminReviewFilter) => {
    setLoading(true);
    setError("");
    try {
      setData(await fetchAdminReviews(filter));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(tab);
  }, [tab, load]);

  async function onModerate(id: number, action: "approve" | "reject") {
    setBusyId(id);
    try {
      await moderateReview(id, action);
      await load(tab);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Action failed.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="admin-page">
      <header className="admin-page-head">
        <h2>Review moderation</h2>
        <p>
          Reviews go live automatically. Hide anything inappropriate — it
          disappears from the storefront instantly and can be restored later.
        </p>
      </header>

      <div className="admin-tabs">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`admin-tab${tab === t.key ? " active" : ""}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
              {data && (
                <span className="admin-tab-count">{data.counts[t.key]}</span>
              )}
            </button>
          ))}
        </div>

        {error && <p className="admin-error">{error}</p>}

        {loading ? (
          <p className="admin-note">Loading reviews…</p>
        ) : data && data.reviews.length > 0 ? (
          <div className="admin-review-list">
            {data.reviews.map((r) => (
              <ReviewRow
                key={r.id}
                review={r}
                busy={busyId === r.id}
                onModerate={onModerate}
              />
            ))}
          </div>
        ) : (
          <p className="admin-note">No reviews in this view.</p>
        )}
    </section>
  );
}
