"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Volume2, VolumeX, Heart, Share2 } from "lucide-react";
import { img, type SocialReel, type Product } from "../../../../lib/landing-data";
import SocialCTA from "./SocialCTA";

/* The vertical reel inside the lightbox. A <video> element is only mounted for
   the ACTIVE slide — inactive slides render the poster still, so there is never
   more than one playing reel and nothing to pause off-screen. The active reel
   autoplays muted + looped (unless the user prefers reduced motion), with a tap
   to toggle sound, a scrub-free progress bar, Like/Share rail and a shoppable
   product card — matching the Indian Sandook lightbox. When a reel has no
   `video` yet, the poster stands in with a play affordance. */
export default function ReelPlayer({
  reel,
  active,
  muted,
  onToggleMute,
  product,
}: {
  reel: SocialReel;
  active: boolean;
  muted: boolean;
  onToggleMute: () => void;
  product: Product | null;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [liked, setLiked] = useState(false);
  // Keep the latest mute-toggle in a ref so the play effect can use it on an
  // autoplay-block fallback without re-running on every render.
  const toggleMuteRef = useRef(onToggleMute);
  useEffect(() => {
    toggleMuteRef.current = onToggleMute;
  });

  // Drive play/pause off `active`. Only the active slide ever plays; leaving a
  // slide pauses it and rewinds so it restarts clean next time.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (active && !reduced) {
      v.play().catch(() => {
        // A browser blocked unmuted autoplay → mute (syncing the speaker icon)
        // and retry, so the reel still plays rather than freezing on the poster.
        if (!v.muted) {
          v.muted = true;
          toggleMuteRef.current();
          v.play().catch(() => {});
        }
      });
    } else {
      v.pause();
      if (!active) v.currentTime = 0;
    }
  }, [active]);

  useEffect(() => {
    const v = videoRef.current;
    if (v) v.muted = muted;
  }, [muted]);

  const onShare = async () => {
    const url =
      typeof window !== "undefined"
        ? product
          ? `${window.location.origin}/product/${product.slug}`
          : window.location.href
        : "";
    try {
      if (navigator.share) await navigator.share({ title: reel.caption ?? "AV Creation", url });
      else await navigator.clipboard?.writeText(url);
    } catch {
      /* user dismissed the share sheet — nothing to do */
    }
  };

  const poster = img(reel.poster, 900);

  return (
    <div className="sl-reel">
      <div className="sl-reel-frame">
        {active && reel.video ? (
          <video
            ref={videoRef}
            className="sl-reel-media"
            src={reel.video}
            poster={poster}
            muted={muted}
            loop
            playsInline
            preload="none"
            onTimeUpdate={(e) => {
              const v = e.currentTarget;
              if (v.duration) setProgress((v.currentTime / v.duration) * 100);
            }}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="sl-reel-media" src={poster} alt={reel.caption ?? ""} />
        )}

        {/* Progress bar (fills as the reel plays). */}
        {active && reel.video && (
          <div className="sl-reel-progress" aria-hidden="true">
            <span style={{ width: `${progress}%` }} />
          </div>
        )}

        {/* Play affordance only when there is no live video to autoplay. */}
        {!reel.video && (
          <span className="sl-reel-play" aria-hidden="true">
            <Play size={20} fill="currentColor" stroke="none" />
          </span>
        )}

        {active && reel.video && (
          <button
            type="button"
            className="sl-reel-mute"
            onClick={onToggleMute}
            aria-label={muted ? "Unmute reel" : "Mute reel"}
          >
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        )}

        {/* Like + Share rail. */}
        {active && (
          <div className="sl-reel-rail">
            <button
              type="button"
              className={`sl-reel-action${liked ? " on" : ""}`}
              onClick={() => setLiked((l) => !l)}
              aria-pressed={liked}
              aria-label="Like"
            >
              <Heart size={22} fill={liked ? "currentColor" : "none"} />
              <span>Like</span>
            </button>
            <button
              type="button"
              className="sl-reel-action"
              onClick={onShare}
              aria-label="Share"
            >
              <Share2 size={21} />
              <span>Share</span>
            </button>
          </div>
        )}

        <div className="sl-reel-scrim" />
        <div className="sl-reel-meta">
          {reel.caption && <p className="sl-reel-caption">{reel.caption}</p>}
          {reel.views && (
            <span className="sl-reel-views">
              <Play size={11} fill="currentColor" stroke="none" />
              {reel.views} views
            </span>
          )}
        </div>
      </div>

      {active && product && <SocialCTA product={product} />}
    </div>
  );
}
