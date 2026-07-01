"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { SocialReel, SocialPost, Product } from "../../../../lib/landing-data";
import ReelPlayer from "./ReelPlayer";
import ImageViewer from "./ImageViewer";
import type { SocialKind } from "./types";

type Item = SocialReel | SocialPost;

/* The fullscreen, in-site lightbox. Portals to <body> (so it escapes the
   `.av-lp` stacking/overflow context), locks body scroll, traps Esc/←/→, and
   supports horizontal swipe. The active slide sits centred with the previous
   and next slides peeking at the edges; tapping a peek (or an arrow) advances.
   Reels autoplay only while active; posts page through their own galleries. */
export default function SocialLightbox({
  kind,
  items,
  index,
  onIndexChange,
  onClose,
  ctaFor,
}: {
  kind: SocialKind;
  items: Item[];
  index: number;
  onIndexChange: (i: number) => void;
  onClose: () => void;
  ctaFor: (item: Item) => Product | null;
}) {
  // Open with sound — the click that opened the lightbox is a user gesture, so
  // unmuted playback is allowed. Closing unmounts the video, so sound stops; the
  // next open starts unmuted again. (ReelPlayer falls back to muted if a browser
  // still blocks unmuted autoplay.)
  const [muted, setMuted] = useState(false);
  // Direction of the last navigation — drives the slide-in animation on the
  // freshly-active card ("open" on first mount, then "next"/"prev").
  const [dir, setDir] = useState<"next" | "prev" | "open">("open");
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const count = items.length;

  const go = useCallback(
    (n: number) => {
      setDir(n > 0 ? "next" : "prev");
      onIndexChange((index + n + count) % count);
    },
    [index, count, onIndexChange]
  );

  // Keyboard: Esc closes, arrows navigate.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  // Lock body scroll while open; restore on close.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    overlayRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Touch swipe — horizontal drag past a threshold flips the slide.
  const touch = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touch.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touch.current.x;
    const dy = t.clientY - touch.current.y;
    touch.current = null;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
  };

  // This component only ever mounts after a client-side click, so document is
  // always present — but guard anyway so it's never evaluated during SSR.
  if (typeof document === "undefined") return null;

  const prevIdx = (index - 1 + count) % count;
  const nextIdx = (index + 1) % count;

  const renderSlide = (item: Item, pos: "prev" | "active" | "next") => {
    const active = pos === "active";
    const cls = active
      ? `sl-slide sl-slide--active sl-in-${dir}`
      : `sl-slide sl-slide--${pos}`;
    const onPeekClick =
      pos === "prev" ? () => go(-1) : pos === "next" ? () => go(1) : undefined;
    return (
      <div
        key={`${kind}-${"id" in item ? item.id : pos}-${pos}`}
        className={cls}
        onClick={onPeekClick}
        aria-hidden={!active}
      >
        {kind === "reel" ? (
          <ReelPlayer
            reel={item as SocialReel}
            active={active}
            muted={muted}
            onToggleMute={() => setMuted((m) => !m)}
            product={active ? ctaFor(item) : null}
          />
        ) : (
          <ImageViewer
            post={item as SocialPost}
            active={active}
            product={active ? ctaFor(item) : null}
          />
        )}
      </div>
    );
  };

  const overlay = (
    <div
      className="sl-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={kind === "reel" ? "Reels viewer" : "Photo viewer"}
      ref={overlayRef}
      tabIndex={-1}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Click the backdrop (outside the stage) to close. */}
      <button
        type="button"
        className="sl-backdrop"
        aria-label="Close"
        onClick={onClose}
      />

      <button type="button" className="sl-close" onClick={onClose} aria-label="Close">
        <X size={22} />
      </button>

      {count > 1 && (
        <button
          type="button"
          className="sl-nav sl-nav--prev"
          onClick={() => go(-1)}
          aria-label="Previous"
        >
          <ChevronLeft size={26} />
        </button>
      )}

      <div className="sl-stage">
        {count > 1 && renderSlide(items[prevIdx], "prev")}
        {renderSlide(items[index], "active")}
        {count > 1 && nextIdx !== prevIdx && renderSlide(items[nextIdx], "next")}
      </div>

      {count > 1 && (
        <button
          type="button"
          className="sl-nav sl-nav--next"
          onClick={() => go(1)}
          aria-label="Next"
        >
          <ChevronRight size={26} />
        </button>
      )}

      <div className="sl-counter" aria-hidden="true">
        {index + 1} / {count}
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}
