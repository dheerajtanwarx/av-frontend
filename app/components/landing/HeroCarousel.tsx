"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { img, slideEmphasis, slides } from "../../lib/landing-data";
import { fetchHeroSettings } from "../../lib/api";
import { ArrowLeft, ArrowRight } from "./Icons";

const DURATION = 6000;

/* Render a title with `\n` line breaks and the emphasis phrase in <em>. */
function Title({ text, emphasis }: { text: string; emphasis?: string }) {
  return (
    <>
      {text.split("\n").map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {emphasis && line.includes(emphasis)
            ? line.split(emphasis).map((part, j, arr) => (
                <Fragment key={j}>
                  {part}
                  {j < arr.length - 1 && <em>{emphasis}</em>}
                </Fragment>
              ))
            : line}
        </Fragment>
      ))}
    </>
  );
}

export default function HeroCarousel() {
  const [active, setActive] = useState(0);
  // Admin-managed background overrides (per slide index); null = use default.
  const [overrides, setOverrides] = useState<(string | null)[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const paused = useRef(false);

  useEffect(() => {
    let alive = true;
    fetchHeroSettings()
      .then((d) => alive && setOverrides(d.images))
      .catch(() => {
        /* keep built-in defaults if the settings call fails */
      });
    return () => {
      alive = false;
    };
  }, []);

  const schedule = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    if (paused.current) return;
    // Don't auto-advance on phones or for reduced-motion users: a static
    // editorial hero reads (and converts) better on mobile, and an auto-
    // playing carousel is the generic move. Manual nav (dots / arrows /
    // keyboard) still works everywhere; desktop keeps the hover-pausable
    // autoplay.
    if (typeof window !== "undefined") {
      const noAutoplay = window.matchMedia(
        "(max-width: 860px), (hover: none), (prefers-reduced-motion: reduce)"
      ).matches;
      if (noAutoplay) return;
    }
    timer.current = setTimeout(
      () => setActive((i) => (i + 1) % slides.length),
      DURATION
    );
  }, []);

  // (re)start the autoplay timer whenever the active slide changes
  useEffect(() => {
    schedule();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [active, schedule]);

  const go = useCallback((n: number) => {
    setActive(((n % slides.length) + slides.length) % slides.length);
  }, []);

  // keyboard arrows
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setActive((i) => (i + 1) % slides.length);
      if (e.key === "ArrowLeft")
        setActive((i) => (i - 1 + slides.length) % slides.length);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const pad = (n: number) => (n < 10 ? "0" : "") + n;

  return (
    <section
      className="hero"
      aria-label="Featured collections"
      style={{ "--dur": `${DURATION / 1000}s` } as React.CSSProperties}
      onMouseEnter={() => {
        paused.current = true;
        if (timer.current) clearTimeout(timer.current);
      }}
      onMouseLeave={() => {
        paused.current = false;
        schedule();
      }}
    >
      {slides.map((s, i) => (
        <div key={i} className={`slide${i === active ? " active" : ""}`}>
          <div className="bg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={overrides[i] ?? img(s.image, 2000)} alt="" aria-hidden="true" />
          </div>
          <div className={`scrim${s.align === "right" ? " right" : ""}`} />
          <div className={`content${s.align === "right" ? " r" : ""}`}>
            <div className="inner">
              <span className="tag">{s.tag}</span>
              <h2>
                <Title text={s.title} emphasis={slideEmphasis[i]} />
              </h2>
              <p>{s.copy}</p>
              <div className="cta">
                <a href={s.cta.href} className="btn btn-ghost">
                  {s.cta.label}
                </a>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="hero-arrows">
        <button className="prev" aria-label="Previous" onClick={() => go(active - 1)}>
          <ArrowLeft />
        </button>
        <button className="next" aria-label="Next" onClick={() => go(active + 1)}>
          <ArrowRight />
        </button>
      </div>

      <div className="hero-dots">
        {slides.map((_, i) => (
          <button
            key={i}
            className={i === active ? "active" : undefined}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => go(i)}
          >
            {/* keyed so the fill animation restarts each activation */}
            {i === active ? <span className="fill" key={active} /> : <span className="fill" />}
          </button>
        ))}
      </div>

      <div className="hero-count">
        <b>{pad(active + 1)}</b> / {pad(slides.length)}
      </div>
    </section>
  );
}
