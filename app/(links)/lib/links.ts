import { business, type StoreLocation } from "./business";

/** Icon identifiers resolved to components in components/Icon.tsx. */
export type IconKey =
  | "instagram"
  | "threads"
  | "facebook"
  | "youtube"
  | "whatsapp"
  | "phone"
  | "email"
  | "website"
  | "maps";

export type LinkItem = {
  key: string;
  label: string;
  /** Small secondary line shown under the label. */
  sublabel: string;
  /** Destination. `null` renders a disabled "Coming Soon" button. */
  href: string | null;
  /** Whether to open in a new tab (rel=noopener). */
  external: boolean;
  iconKey: IconKey;
  /** Tailwind gradient classes for the icon chip. */
  gradient: string;
};

/** Strip everything but digits — for building wa.me links safely. */
function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/** A non-empty string, or null. */
function orNull(value: string): string | null {
  return value.trim() ? value.trim() : null;
}

/**
 * The primary action buttons, derived entirely from config/business.ts.
 * Empty config values automatically become "Coming Soon".
 */
export function getPrimaryLinks(): LinkItem[] {
  const wa = digitsOnly(business.whatsapp);

  return [
    {
      key: "instagram",
      label: "Instagram",
      sublabel: "Latest collections & reels",
      href: orNull(business.instagram),
      external: true,
      iconKey: "instagram",
      gradient: "from-[#F58529] via-[#DD2A7B] to-[#8134AF]",
    },
    {
      key: "threads",
      label: "Threads",
      sublabel: "Join the conversation",
      href: orNull(business.threads),
      external: true,
      iconKey: "threads",
      gradient: "from-maroon-deep via-maroon to-maroon-soft",
    },
    {
      key: "facebook",
      label: "Facebook",
      sublabel: "Follow our page",
      href: orNull(business.facebook),
      external: true,
      iconKey: "facebook",
      gradient: "from-[#1877F2] via-[#2A6FD6] to-[#0B5FCC]",
    },
    {
      key: "youtube",
      label: "YouTube",
      sublabel: "Watch our story",
      href: orNull(business.youtube),
      external: true,
      iconKey: "youtube",
      gradient: "from-[#FF4E45] via-[#E0241B] to-[#B0150E]",
    },
    {
      key: "whatsapp",
      label: "WhatsApp",
      sublabel: "Chat & order directly",
      href: wa ? `https://wa.me/${wa}` : null,
      external: true,
      iconKey: "whatsapp",
      gradient: "from-[#25D366] via-[#1FB855] to-[#128C7E]",
    },
    {
      key: "call",
      label: "Call Now",
      sublabel: "Speak with our team",
      href: business.phone.trim() ? `tel:${business.phone.trim()}` : null,
      external: false,
      iconKey: "phone",
      gradient: "from-coral-light via-coral to-coral-deep",
    },
    {
      key: "email",
      label: "Email",
      sublabel: "Wholesale & enquiries",
      href: business.email.trim() ? `mailto:${business.email.trim()}` : null,
      external: false,
      iconKey: "email",
      gradient: "from-gold-soft via-gold to-gold-deep",
    },
    {
      key: "website",
      label: "Visit Website",
      sublabel: "Shop the full collection",
      href: orNull(business.website),
      external: true,
      iconKey: "website",
      gradient: "from-terracotta via-coral-deep to-maroon",
    },
  ];
}

/**
 * A Maps link for a store: the explicit URL if set, otherwise a Google
 * Maps search built from the name + area so the button always works.
 */
export function storeMapsUrl(store: StoreLocation): string {
  if (store.mapsUrl.trim()) return store.mapsUrl.trim();
  const query = encodeURIComponent(`${store.name} ${store.area}`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}
