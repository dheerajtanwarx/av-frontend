/* Shared types for the in-site social lightbox. */

/** Which feed the lightbox is currently paging through. */
export type SocialKind = "reel" | "post";

/** What a section asks its lightbox to open. */
export type LightboxTarget = { index: number } | null;
