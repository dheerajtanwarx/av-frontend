"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchHeroSettings } from "../../../lib/api";
import { heroImageUrl } from "../../../lib/landing-data";
import { track } from "../../../lib/analytics";

const DURATION = 5000;

/* The hero: the admin-uploaded editorial images auto-cross-fade behind one
   steady headline. Restraint is kept — the copy never moves, only the imagery
   breathes underneath, with small pips to step through manually. Autoplay
   pauses for reduced-motion users and while the tab is hidden.

   Images are fetched on the server and passed in via `images`, so they are
   already in the HTML on first paint — no client round-trip, no flash of stock
   artwork. The client fetch below only runs as a fallback if the server call
   came back empty (e.g. the API was briefly unreachable at render time). */
export default function LandingHero({ images: initial = [] }: { images?: string[] }) {
  const [active, setActive] = useState(0);
  const [images, setImages] = useState<string[]>(initial);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    if (initial.length) return; // server already provided images — nothing to do
    let alive = true;
    fetchHeroSettings()
      .then((d) => {
        if (alive) setImages(d.images.filter((u): u is string => !!u).map((u) => heroImageUrl(u)));
      })
      .catch(() => {
        /* no uploaded images available — leave the hero imagery empty */
      });
    return () => {
      alive = false;
    };
  }, [initial.length]);

  const schedule = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    if (reduced.current || images.length < 2) return;
    timer.current = setTimeout(() => setActive((i) => (i + 1) % images.length), DURATION);
  }, [images.length]);

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
      {images.map((src, i) => (
        <div className={`lp-hero-slide${i === active ? " on" : ""}`} key={i} aria-hidden={i !== active}>
          {/* First slide is above the fold — load it eagerly at high priority;
              the rest can wait until the carousel needs them. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            loading={i === 0 ? "eager" : "lazy"}
            fetchPriority={i === 0 ? "high" : "low"}
            decoding="async"
          />
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
        <a
          href="#wardrobe"
          className="lp-underlink lp-hero-cta"
          onClick={() => track("banner_click", { banner: "hero", cta: "Discover the collection" })}
        >
          Discover the collection
        </a>
        <div className="lp-hero-pips" role="tablist" aria-label="Hero slides">
          {images.length > 1 && images.map((_, i) => (
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
