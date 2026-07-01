"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Heart, Share2 } from "lucide-react";
import { img, type SocialPost, type Product } from "../../../../lib/landing-data";
import SocialCTA from "./SocialCTA";

/* The post viewer inside the lightbox — a single post's image gallery. Its own
   internal index pages through the post's images (dots + edge taps), while the
   parent lightbox handles moving between posts. Resets to the first image when
   the post changes (the parent remounts it per post), and only the active post
   preloads its next frame. Mirrors the reel lightbox: Like/Share rail + a
   shoppable product card. */
export default function ImageViewer({
  post,
  active,
  product,
}: {
  post: SocialPost;
  active: boolean;
  product: Product | null;
}) {
  // The parent remounts this viewer per post (slide key includes the post id),
  // so internal state — including this index — always starts fresh on frame 0.
  const [i, setI] = useState(0);
  const [liked, setLiked] = useState(false);
  const count = post.images.length;

  const go = (n: number) => setI((prev) => (prev + n + count) % count);

  const onShare = async () => {
    const url =
      typeof window !== "undefined"
        ? product
          ? `${window.location.origin}/product/${product.slug}`
          : window.location.href
        : "";
    try {
      if (navigator.share) await navigator.share({ title: post.caption ?? "AV Creation", url });
      else await navigator.clipboard?.writeText(url);
    } catch {
      /* dismissed */
    }
  };

  const current = img(post.images[i], 1100);
  // Preload only the immediate next frame of the active post.
  const next = count > 1 ? img(post.images[(i + 1) % count], 1100) : null;

  return (
    <div className="sl-post">
      <div className="sl-post-frame">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="sl-post-media" src={current} alt={post.caption ?? ""} />

        {active && next && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={next} alt="" aria-hidden="true" className="sl-preload" />
        )}

        {count > 1 && (
          <>
            <button
              type="button"
              className="sl-post-edge sl-post-edge--prev"
              onClick={() => go(-1)}
              aria-label="Previous image"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              className="sl-post-edge sl-post-edge--next"
              onClick={() => go(1)}
              aria-label="Next image"
            >
              <ChevronRight size={22} />
            </button>
            <div className="sl-post-dots" aria-hidden="true">
              {post.images.map((_, d) => (
                <span
                  key={d}
                  className={d === i ? "sl-post-dot sl-post-dot--on" : "sl-post-dot"}
                />
              ))}
            </div>
          </>
        )}

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
            <button type="button" className="sl-reel-action" onClick={onShare} aria-label="Share">
              <Share2 size={21} />
              <span>Share</span>
            </button>
          </div>
        )}

        <div className="sl-post-scrim" />
        {post.caption && <p className="sl-post-caption">{post.caption}</p>}
      </div>

      {active && product && <SocialCTA product={product} />}
    </div>
  );
}
