"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { img, slides } from "../../../lib/landing-data";
import { fetchHeroSettings } from "../../../lib/api";

const DURATION = 5000;

/* The hero: four editorial images that auto-cross-fade behind one steady
   headline. Restraint is kept — the copy never moves, only the imagery breathes
   underneath, with small pips to step through manually. Autoplay pauses for
   reduced-motion users and while the tab is hidden. */
export default function LandingHero() {
  const [active, setActive] = useState(0);
  const [overrides, setOverrides] = useState<(string | null)[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    let alive = true;
    fetchHeroSettings()
      .then((d) => {
        if (alive) setOverrides(d.images);
      })
      .catch(() => {
        /* keep built-in defaults if the settings call fails */
      });
    return () => {
      alive = false;
    };
  }, []);

  const schedule = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    if (reduced.current) return;
    timer.current = setTimeout(() => setActive((i) => (i + 1) % slides.length), DURATION);
  }, []);

  useEffect(() => {
    schedule();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [active, schedule]);

  // pause when the tab isn't visible
  useEffect(() => {
    const onVis = () => {
      if (document.hidden) {
        if (timer.current) clearTimeout(timer.current);
      } else {
        schedule();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [schedule]);

  return (
    <section className="lp-hero" aria-label="The Maharani Collection" aria-roledescription="carousel">
      {slides.map((s, i) => (
        <div className={`lp-hero-slide${i === active ? " on" : ""}`} key={i} aria-hidden={i !== active}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={overrides[i] ?? img(s.image, 1600)} alt="" />
        </div>
      ))}
      <div className="lp-hero-scrim" />
      <div className="lp-hero-copy">
        <div className="lp-hero-tag">The Maharani Collection</div>
        <h1 className="lp-hero-title">
          Tradition, <em>worn lightly.</em>
        </h1>
        <p className="lp-hero-lead">
          Timeless techniques, shaped for the occasions you&apos;ll remember.
        </p>
        <a href="#wardrobe" className="lp-underlink lp-hero-cta">
          Discover the collection
        </a>
        <div className="lp-hero-pips" role="tablist" aria-label="Hero slides">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              className={i === active ? "on" : undefined}
              aria-label={`Show slide ${i + 1}`}
              aria-selected={i === active}
              role="tab"
              onClick={() => setActive(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
