/**
 * ─────────────────────────────────────────────────────────────────────
 *  THE ONLY FILE YOU NORMALLY NEED TO EDIT.
 * ─────────────────────────────────────────────────────────────────────
 *  Update business details, social links and store locations here.
 *  Leave a social/contact value as an empty string ("") and its button
 *  automatically renders as a tasteful "Coming Soon" state.
 *
 *  The public URL itself lives in the NEXT_PUBLIC_SITE_URL env var,
 *  NOT here — so the QR code and metadata follow the domain automatically.
 */

export type StoreLocation = {
  /** Display name shown on the store card. */
  name: string;
  /** Short area / city line under the name. */
  area: string;
  /**
   * Google Maps link. Leave "" to auto-generate a Maps search from the
   * store name + area, so the button always works even before you have
   * the exact pin URL.
   */
  mapsUrl: string;
};

export type Business = {
  name: string;
  /** Short brand mark, e.g. for the favicon / tab. */
  shortName: string;
  tagline: string;
  description: string;
  /** Path inside /public. Swap the file or path to change the logo. */
  logo: string;

  // Social & contact. Empty string => "Coming Soon" button.
  instagram: string;
  threads: string;
  facebook: string;
  youtube: string;
  /** Digits only incl. country code, e.g. "919876543210" (no +). */
  whatsapp: string;
  /** Full tel value, e.g. "+919876543210". */
  phone: string;
  email: string;
  /** Your future main website. Empty => "Coming Soon". */
  website: string;

  stores: StoreLocation[];
};

export const business: Business = {
  name: "Jaipuri Odhani",
  shortName: "AV",
  tagline: "Culture In Every Stitch",
  description:
    "Premium handcrafted Jaipuri Odhani — woven with Rajasthani heritage, finished with timeless elegance. Discover our collection across all our platforms and stores.",
  logo: "/av-logo.png",

  // ── Live links ──────────────────────────────────────────────
  instagram: "https://www.instagram.com/jaipuri_odhni/",
  threads: "https://www.threads.com/@jaipuri_odhni",
  facebook: "https://www.facebook.com/people/Jaipuri-odhani/",
  youtube: "https://www.youtube.com/@jaipuri_odhani",

  // ── Add these when ready ("" shows a "Coming Soon" button) ───
  whatsapp: "",
  phone: "",
  email: "",
  website: "",

  // ── Store locations ─────────────────────────────────────────
  stores: [
    { name: "Bassi Store", area: "Bassi, Jaipur, Rajasthan", mapsUrl: "" },
    { name: "Khaniya Store", area: "Khaniya, Jaipur, Rajasthan", mapsUrl: "" },
    { name: "Jamdoli Store", area: "Jamdoli, Jaipur, Rajasthan", mapsUrl: "" },
  ],
};
