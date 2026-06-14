"use client";

import { useEffect, useRef, useState } from "react";
import { Ic } from "./icons";

/* Editorial gallery — a native horizontal scroll-snap stage on top, thumb row
   below. On touch the finger drags the slides directly (one slide per snap);
   on desktop the thumbs drive it and hovering a slide zooms toward the cursor. */
export default function Gallery({ images: rawImages, flag }: { images: string[]; flag?: string }) {
  const images = rawImages.filter(Boolean);
  const [idx, setIdx] = useState(0);
  const [zoom, setZoom] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  // When the image set changes (e.g. the shopper picks another colour) snap
  // back to the first frame. Keyed on the URLs, not array identity, so an
  // unchanged set doesn't reset the shopper's chosen frame. Adjusting state
  // during render is React's recommended alternative to an effect here.
  const imgKey = images.join("|");
  const [shownKey, setShownKey] = useState(imgKey);
  if (imgKey !== shownKey) {
    setShownKey(imgKey);
    setIdx(0);
    setZoom(false);
  }

  // Jump the scroller back to the first frame whenever the set changes.
  useEffect(() => {
    const el = trackRef.current;
    if (el) el.scrollTo({ left: 0 });
  }, [shownKey]);

  // The native scroll position is the source of truth for the active frame, so
  // the counter and the active thumbnail track the finger as it swipes.
  const raf = useRef(0);
  const onScroll = () => {
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      const el = trackRef.current;
      if (!el || !el.clientWidth) return;
      const i = Math.round(el.scrollLeft / el.clientWidth);
      setIdx((prev) => (prev === i ? prev : i));
    });
  };

  // Tapping a thumb smoothly scrolls the stage to that frame.
  const goto = (k: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: k * el.clientWidth, behavior: "smooth" });
    setIdx(k);
  };

  // Desktop zoom origin tracks the cursor over the hovered slide.
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - r.top) / r.height) * 100));
    const img = el.querySelector<HTMLImageElement>(".gimg");
    if (img) img.style.transformOrigin = `${x}% ${y}%`;
  };

  return (
    <div className="gal-ed">
      <div className={`g-stage${zoom ? " zooming" : ""}`}>
        <div className="g-track" ref={trackRef} onScroll={onScroll}>
          {images.map((src, k) => (
            <div
              key={k}
              className={`g-slide${zoom ? " zoom" : ""}`}
              onMouseEnter={() => setZoom(true)}
              onMouseLeave={() => setZoom(false)}
              onMouseMove={onMove}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="gimg" src={src} alt="" draggable={false} />
            </div>
          ))}
        </div>
        <div className="gold-inset" />
        {flag && <span className="g-flag">{flag}</span>}
        <span className="g-zoomhint">{Ic.zoom} Hover to zoom</span>
        {images.length > 1 && (
          <span className="g-count" aria-hidden="true">
            {idx + 1} / {images.length}
          </span>
        )}
      </div>
      <div className="g-row">
        {images.map((src, k) => (
          <button
            key={k}
            className={`g-thumb${k === idx ? " on" : ""}`}
            onClick={() => goto(k)}
            aria-label={`View ${k + 1}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`View ${k + 1}`} />
          </button>
        ))}
      </div>
    </div>
  );
}
