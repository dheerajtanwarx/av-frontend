"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import type { FeaturedReview } from "../../../lib/api";

/* ============================================================
   TESTIMONIALS — a swipeable carousel of REAL, approved reviews
   ------------------------------------------------------------
   Powered entirely by /api/reviews/featured (4–5★ approved reviews
   that carry a written comment). No placeholder copy: if the feed
   is empty the parent renders nothing at all.

   Reuses the product-rail interaction + classes (`.lp-rail`,
   `.lp-rail-track`, `.lp-rail-arrow`) so the scroll/arrow behaviour
   matches the rest of the page; only the card (`.lp-tml-card`) is new.
   Cards fade up on first view via an IntersectionObserver tuned to
   the house motion tokens (respecting prefers-reduced-motion).
   ============================================================ */

export default function Testimonials({ reviews }: { reviews: FeaturedReview[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  // Arrow enable/disable — identical pattern to ProductRail.
  const sync = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 2);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    sync();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      el.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [sync]);

  // Staggered fade-up as each card enters view — same easing tokens the
  // rest of the landing uses. Reduced-motion users get them shown instantly.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const cards = Array.from(el.querySelectorAll<HTMLElement>(".lp-tml-card"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      cards.forEach((c) => c.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, [reviews]);

  const page = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  if (!reviews.length) return null;

  return (
    <section className="lp-section lp-tml-section" id="testimonials">
      <div className="lp-wrap">
        <div className="lp-head-center">
          <div className="lp-eyebrow">In their words</div>
          <div className="lp-title">What our customers say</div>
        </div>

        <div className="lp-rail lp-tml">
          <button
            type="button"
            className="lp-rail-arrow prev"
            aria-label="Previous review"
            onClick={() => page(-1)}
            disabled={atStart}
          >
            <ChevronLeft size={20} strokeWidth={1.5} />
          </button>

          <div className="lp-rail-track" ref={trackRef}>
            {reviews.map((r, i) => (
              <figure
                key={r.id}
                className="lp-tml-card"
                style={{ transitionDelay: `${Math.min(i, 5) * 60}ms` }}
              >
                <div
                  className="lp-tml-stars"
                  aria-label={`Rated ${r.rating} out of 5`}
                >
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star
                      key={s}
                      size={15}
                      strokeWidth={1.5}
                      fill={s < r.rating ? "currentColor" : "none"}
                      className={s < r.rating ? "on" : "off"}
                    />
                  ))}
                </div>

                <blockquote className="lp-tml-quote">{r.comment}</blockquote>

                <figcaption className="lp-tml-by">
                  <span className="lp-tml-name">{r.author}</span>
                  <a
                    className="lp-tml-prod"
                    href={`/product/${r.product.slug}`}
                  >
                    on {r.product.name}
                  </a>
                </figcaption>

                <span className="lp-tml-verified">Verified purchase</span>
              </figure>
            ))}
          </div>

          <button
            type="button"
            className="lp-rail-arrow next"
            aria-label="Next review"
            onClick={() => page(1)}
            disabled={atEnd}
          >
            <ChevronRight size={20} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </section>
  );
}
