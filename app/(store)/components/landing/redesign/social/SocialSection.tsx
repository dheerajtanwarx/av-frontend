"use client";

import { useMemo, useState } from "react";
import {
  socialHandle,
  type SocialReel,
  type SocialPost,
  type Product,
} from "../../../../lib/landing-data";
import { track } from "../../../../lib/analytics";
import SocialCarousel from "./SocialCarousel";
import SocialLightbox from "./SocialLightbox";
import type { SocialKind } from "./types";

/* One homepage social feed — reels OR posts — rendered as its own section so
   the two can sit at different points on the page (reels up near the hero,
   posts lower). Owns its own fullscreen lightbox; nothing ever leaves for a new
   tab. The optional "shop this look" product on each item is resolved from the
   live catalogue handed down by the server page (no client re-fetch). */
export default function SocialSection({
  kind,
  items,
  products,
  eyebrow,
  title,
}: {
  kind: SocialKind;
  items: (SocialReel | SocialPost)[];
  products: Product[];
  eyebrow: string;
  title: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const bySlug = useMemo(() => {
    const map = new Map<string, Product>();
    for (const p of products) if (p?.slug) map.set(p.slug, p);
    return map;
  }, [products]);

  const ctaFor = (item: SocialReel | SocialPost): Product | null =>
    item.productSlug ? bySlug.get(item.productSlug) ?? null : null;

  const open = (index: number) => {
    track("social_open", { kind, id: items[index]?.id });
    setOpenIndex(index);
  };

  if (!items.length) return null;

  return (
    <section className={`lp-social lp-social--${kind}`} id={`social-${kind}`} aria-label={title}>
      <div className="lp-head-center">
        <div className="lp-eyebrow">{eyebrow}</div>
        <div className="lp-title">{title}</div>
      </div>

      <SocialCarousel
        kind={kind}
        items={items}
        paused={openIndex !== null}
        onOpen={open}
      />

      <a
        className="lp-social-handle"
        href={`https://www.instagram.com/${socialHandle}/`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Follow @{socialHandle}
      </a>

      {openIndex !== null && (
        <SocialLightbox
          kind={kind}
          items={items}
          index={openIndex}
          onIndexChange={setOpenIndex}
          onClose={() => setOpenIndex(null)}
          ctaFor={ctaFor}
        />
      )}
    </section>
  );
}
