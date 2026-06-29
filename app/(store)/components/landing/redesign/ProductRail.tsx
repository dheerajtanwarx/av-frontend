"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import RedesignProductCard from "./RedesignProductCard";
import type { Product } from "../../../lib/landing-data";

/* ============================================================
   PRODUCT RAIL — a swipeable horizontal carousel of "quiet add"
   cards. Replaces the static 4-up grid so a single section can
   surface 8–10 pieces without growing the page. Touch users
   swipe (the next card peeks to invite it); on desktop the rail
   shows ‹ › controls that fade in and disable at the ends.

   Scoped entirely to `.av-lp` — reuses RedesignProductCard and
   the existing `.lp-head-row` / `.lp-viewall` header so it reads
   as the same house, just merchandised wider.
   ============================================================ */

type Props = {
  eyebrow: string;
  title: string;
  products: Product[];
  viewAllHref: string;
  /** Center the heading (no inline View-all) — matches `.lp-head-center`. */
  align?: "row" | "center";
  id?: string;
};

export default function ProductRail({
  eyebrow,
  title,
  products,
  viewAllHref,
  align = "row",
  id,
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  // Reflect scroll position onto the arrow enabled/disabled state. A 2px slack
  // absorbs sub-pixel rounding so the end arrow reliably disables.
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

  // Page by ~85% of the visible width so a partial card always stays anchored
  // as a visual hint that there is more to either side.
  const page = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  if (!products.length) return null;

  return (
    <section className="lp-section lp-rail-section" id={id}>
      <div className="lp-wrap">
        <div className={align === "center" ? "lp-head-center" : "lp-head-row"}>
          <div>
            <div className="lp-eyebrow">{eyebrow}</div>
            <div className="lp-title">{title}</div>
          </div>
          {align === "row" && (
            <a href={viewAllHref} className="lp-viewall">
              View all
            </a>
          )}
        </div>

        <div className="lp-rail">
          <button
            type="button"
            className="lp-rail-arrow prev"
            aria-label="Scroll back"
            onClick={() => page(-1)}
            disabled={atStart}
          >
            <ChevronLeft size={20} strokeWidth={1.5} />
          </button>

          <div className="lp-rail-track" ref={trackRef}>
            {products.map((p) => (
              <RedesignProductCard key={p.slug} product={p} />
            ))}
          </div>

          <button
            type="button"
            className="lp-rail-arrow next"
            aria-label="Scroll forward"
            onClick={() => page(1)}
            disabled={atEnd}
          >
            <ChevronRight size={20} strokeWidth={1.5} />
          </button>
        </div>

        {align === "center" && (
          <div className="lp-section-foot">
            <a href={viewAllHref} className="lp-underlink">
              View all
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
