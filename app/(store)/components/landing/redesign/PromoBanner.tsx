import { img } from "../../../lib/landing-data";

/* Full-width promo poster on the homepage. The admin uploads a designed banner
   (text baked in) via /admin, so an uploaded image renders on its own at its
   natural aspect. Until then a lifestyle photo stands in with an overlaid CTA
   (per-slot copy) so the slot never looks empty. */
export default function PromoBanner({
  image,
  href,
  alt,
  defaultImage,
  defaultEyebrow,
  defaultTitle,
  defaultHref,
}: {
  image: string | null;
  href: string | null;
  alt: string | null;
  /** Unsplash id or URL shown when no poster has been uploaded. */
  defaultImage: string;
  defaultEyebrow: string;
  defaultTitle: string;
  defaultHref: string;
}) {
  const isDefault = !image;
  const src = image || img(defaultImage, 1800);
  const label = alt || defaultTitle;
  const link = href || defaultHref;

  return (
    <a
      href={link}
      className={`lp-promo${isDefault ? " lp-promo--default" : ""}`}
      aria-label={label}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={label} loading="lazy" />
      {isDefault && (
        <span className="lp-promo-overlay">
          <span className="lp-promo-eyebrow">{defaultEyebrow}</span>
          <span className="lp-promo-title">{defaultTitle}</span>
          <span className="lp-promo-cta">Shop now →</span>
        </span>
      )}
    </a>
  );
}
