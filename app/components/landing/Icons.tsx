/* Shared icon set — backed by lucide-react (the icon library shadcn/ui uses).
   Exports keep their original names/shapes so call sites are unchanged.
   Brand/social marks (Instagram, Facebook, …) stay as inline SVGs because
   lucide no longer ships brand icons. */
import type { ReactElement } from "react";
import {
  Search,
  User,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Heart,
  Play,
  Star,
  Truck,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";

export const SearchIcon = () => <Search strokeWidth={1.5} />;
export const AccountIcon = () => <User strokeWidth={1.5} />;
export const CartIcon = () => <ShoppingBag strokeWidth={1.5} />;
export const ArrowLeft = () => <ChevronLeft strokeWidth={1.6} />;
export const ArrowRight = () => <ChevronRight strokeWidth={1.6} />;
export const CompareIcon = () => <ArrowUpDown strokeWidth={1.6} />;

export const HeartIcon = ({ filled }: { filled?: boolean }) => (
  <Heart strokeWidth={1.6} fill={filled ? "currentColor" : "none"} />
);

export const PlayIcon = () => <Play fill="currentColor" stroke="none" />;

export const trustIcons: Record<string, ReactElement> = {
  star: <Star strokeWidth={1.4} />,
  truck: <Truck strokeWidth={1.4} />,
  return: <RotateCcw strokeWidth={1.4} />,
  shield: <ShieldCheck strokeWidth={1.4} />,
};

/* --- Brand / social marks (no lucide equivalents) --- */
const brand = {
  viewBox: "0 0 24 24",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.5,
};

export const Instagram = () => (
  <svg {...brand}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
  </svg>
);

export const Facebook = () => (
  <svg {...brand}>
    <path d="M15 3h-3a4 4 0 0 0-4 4v3H5v4h3v7h4v-7h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

export const Youtube = () => (
  <svg {...brand}>
    <rect x="3" y="6" width="18" height="12" rx="3" />
    <path d="M10 9.5v5l4.5-2.5z" fill="currentColor" stroke="none" />
  </svg>
);

export const Pinterest = () => (
  <svg {...brand}>
    <path d="M12 2C7.6 2 4 5.6 4 10c0 3 1.8 5.6 4.4 6.6-.1-.6-.2-1.6 0-2.2.2-.6 1.3-4.1 1.3-4.1s-.3-.6-.3-1.6c0-1.5.9-2.6 2-2.6.9 0 1.3.7 1.3 1.6 0 1-.6 2.5-.9 3.9-.3 1.2.6 2.1 1.7 2.1 2.1 0 3.6-2.5 3.6-6 0-2.5-1.7-4.4-4.9-4.4z" />
  </svg>
);

export const WhatsApp = () => (
  <svg {...brand}>
    <path d="M4 20l1.5-4A8 8 0 1 1 9 19l-5 1Z" />
  </svg>
);
