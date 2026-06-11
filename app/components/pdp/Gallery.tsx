"use client";

import { useRef, useState } from "react";
import { Ic } from "./icons";

/* Editorial Stack gallery — large zoom stage on top, thumb row below.
   Hover the stage to zoom; the zoom origin tracks the cursor. */
export default function Gallery({ images: rawImages, flag }: { images: string[]; flag?: string }) {
  const images = rawImages.filter(Boolean);
  const [idx, setIdx] = useState(0);
  const [zoom, setZoom] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);

  // When the image set changes (e.g. the shopper picks another colour) snap
  // back to the first frame and drop any open zoom, so no stale shot lingers
  // and the active thumbnail resets. Keyed on the URLs, not array identity, so
  // an unchanged set doesn't reset the shopper's chosen thumbnail. Adjusting
  // state during render is React's recommended alternative to an effect here.
  const imgKey = images.join("|");
  const [shownKey, setShownKey] = useState(imgKey);
  if (imgKey !== shownKey) {
    setShownKey(imgKey);
    setIdx(0);
    setZoom(false);
  }

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = frameRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - r.top) / r.height) * 100));
    const shown = el.querySelector<HTMLImageElement>(".gimg.show");
    if (shown) shown.style.transformOrigin = `${x}% ${y}%`;
  };

  return (
    <div className="gal-ed">
      <div className={`g-stage${zoom ? " zooming" : ""}`}>
        <div
          className={`g-frame${zoom ? " zoom" : ""}`}
          ref={frameRef}
          onMouseEnter={() => setZoom(true)}
          onMouseLeave={() => setZoom(false)}
          onMouseMove={onMove}
        >
          {images.map((src, k) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={k} className={`gimg${k === idx ? " show" : ""}`} src={src} alt="" />
          ))}
        </div>
        <div className="gold-inset" />
        {flag && <span className="g-flag">{flag}</span>}
        <span className="g-zoomhint">{Ic.zoom} Hover to zoom</span>
      </div>
      <div className="g-row">
        {images.map((src, k) => (
          <button
            key={k}
            className={`g-thumb${k === idx ? " on" : ""}`}
            onClick={() => setIdx(k)}
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
