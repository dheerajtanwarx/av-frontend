/**
 * Single source of truth for the public site URL. Everything that needs
 * an absolute URL (QR code, canonical, Open Graph, sitemap, robots,
 * JSON-LD) derives from here — so migrating domains is a one-line env
 * change with zero code edits.
 */

function normalize(url: string): string {
  return url.replace(/\/+$/, "");
}

/** The public origin, e.g. https://jaipuriodhani.com (no trailing slash). */
export const SITE_URL = normalize(
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
);

/** The canonical path of the link hub. Keep in sync with the route folder. */
export const LINKS_PATH = "/social-links";

/** Absolute URL the QR code encodes and that we treat as canonical. */
export const LINKS_URL = `${SITE_URL}${LINKS_PATH}`;

/** Build an absolute URL for any path. */
export function absoluteUrl(path = ""): string {
  if (!path) return SITE_URL;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
