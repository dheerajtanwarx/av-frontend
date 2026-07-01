"use client";

import { useEffect, useRef } from "react";
import { Play, Images, VolumeX } from "lucide-react";
import { img, type SocialReel, type SocialPost } from "../../../../lib/landing-data";
import type { SocialKind } from "./types";

/* One card in the rail. Reels with a video autoplay inline — muted, looped —
   but only while the card is in the viewport (an IntersectionObserver plays the
   visible cards and pauses the rest), matching the Indian Sandook strip while
   keeping bandwidth in check. Reels without a video, and all posts, render a
   lazy poster image. Clicking any card opens the fullscreen lightbox. */
function SocialCard({
  kind,
  item,
  index,
  paused,
  onOpen,
}: {
  kind: SocialKind;
  item: SocialReel | SocialPost;
  index: number;
  /** When true (the section's lightbox is open) the rail video stays paused, so
      the lightbox reel is the only video — and only possible sound — playing. */
  paused: boolean;
  onOpen: (index: number) => void;
}) {
  const isReel = kind === "reel";
  const reel = item as SocialReel;
  const post = item as SocialPost;
  const thumbId = isReel ? reel.poster : post.images[0];
  const caption = isReel ? reel.caption : post.caption;
  const multi = !isReel && post.images.length > 1;
  const hasVideo = isReel && !!reel.video;

  const cardRef = useRef<HTMLButtonElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const pausedRef = useRef(paused);

  useEffect(() => {
    if (!hasVideo) return;
    const card = cardRef.current;
    const v = videoRef.current;
    if (!card || !v) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          // Never resume a rail video while the lightbox is open.
          if (e.isIntersecting && e.intersectionRatio >= 0.55 && !pausedRef.current) {
            v.play().catch(() => {});
          } else {
            v.pause();
          }
        }
      },
      { threshold: [0, 0.55, 1] }
    );
    io.observe(card);
    return () => io.disconnect();
  }, [hasVideo]);

  // React to the lightbox opening/closing: pause immediately when it opens, and
  // resume on close if the card is still in view.
  useEffect(() => {
    pausedRef.current = paused;
    const v = videoRef.current;
    if (!hasVideo || !v) return;
    if (paused) {
      v.pause();
    } else {
      const r = cardRef.current?.getBoundingClientRect();
      const inView = r && r.top < window.innerHeight * 0.9 && r.bottom > window.innerHeight * 0.1;
      if (inView && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        v.play().catch(() => {});
      }
    }
  }, [paused, hasVideo]);

  return (
    <button
      type="button"
      ref={cardRef}
      role="listitem"
      className={`lp-social-card lp-social-card--${kind}`}
      onClick={() => onOpen(index)}
      aria-label={
        isReel
          ? `Play reel${caption ? ` — ${caption}` : ""}`
          : `View post${caption ? ` — ${caption}` : ""}`
      }
    >
      {hasVideo ? (
        <video
          ref={videoRef}
          className="lp-social-media"
          src={reel.video}
          poster={img(reel.poster, 600)}
          muted
          loop
          playsInline
          preload="metadata"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="lp-social-media"
          src={img(thumbId, 600)}
          alt=""
          loading="lazy"
          decoding="async"
        />
      )}
      <span className="lp-social-scrim" />

      {/* Reels show a muted-speaker badge — these autoplay silently; posts with
          more than one image show a stack icon. */}
      <span className="lp-social-badge" aria-hidden="true">
        {isReel ? (
          hasVideo ? (
            <VolumeX size={13} />
          ) : (
            <Play size={13} fill="currentColor" stroke="none" />
          )
        ) : multi ? (
          <Images size={14} />
        ) : null}
      </span>

      {isReel && reel.views && (
        <span className="lp-social-views" aria-hidden="true">
          <Play size={10} fill="currentColor" stroke="none" />
          {reel.views}
        </span>
      )}
    </button>
  );
}

/* The horizontal, scroll-snap rail of social cards. */
export default function SocialCarousel({
  kind,
  items,
  paused,
  onOpen,
}: {
  kind: SocialKind;
  items: (SocialReel | SocialPost)[];
  /** True while the section's lightbox is open — pauses every rail video. */
  paused: boolean;
  onOpen: (index: number) => void;
}) {
  return (
    <div className="lp-social-track" role="list">
      {items.map((item, i) => (
        <SocialCard
          key={"id" in item ? item.id : i}
          kind={kind}
          item={item}
          index={i}
          paused={paused}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
}
