/* Inline SVG icon set — shared across the landing page. */
import type { ReactElement, SVGProps } from "react";

const base: SVGProps<SVGSVGElement> = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
};

export const SearchIcon = () => (
  <svg {...base}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export const AccountIcon = () => (
  <svg {...base}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
  </svg>
);

export const CartIcon = () => (
  <svg {...base}>
    <path d="M6 8h12l-1 12H7L6 8Z" />
    <path d="M9 8V6a3 3 0 0 1 6 0v2" />
  </svg>
);

export const ArrowLeft = () => (
  <svg {...base} strokeWidth={1.6}>
    <path d="M15 5l-7 7 7 7" />
  </svg>
);

export const ArrowRight = () => (
  <svg {...base} strokeWidth={1.6}>
    <path d="M9 5l7 7-7 7" />
  </svg>
);

export const CompareIcon = () => (
  <svg {...base} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 20V5" />
    <path d="M5 8l3-3 3 3" />
    <path d="M16 4v15" />
    <path d="M19 16l-3 3-3-3" />
  </svg>
);

export const HeartIcon = ({ filled }: { filled?: boolean }) => (
  <svg {...base} strokeWidth={1.6} fill={filled ? "currentColor" : "none"}>
    <path d="M12 20s-7-4.4-7-9.5A3.6 3.6 0 0 1 12 8a3.6 3.6 0 0 1 7 2.5C19 15.6 12 20 12 20Z" />
  </svg>
);

export const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

export const trustIcons: Record<string, ReactElement> = {
  star: (
    <svg {...base} strokeWidth={1.4}>
      <path d="M12 3l2.4 5 5.6.6-4 4 1 5.4L12 20l-5 2 1-5.4-4-4 5.6-.6z" />
    </svg>
  ),
  truck: (
    <svg {...base} strokeWidth={1.4}>
      <path d="M3 7h13v9H3zM16 10h3l2 3v3h-5z" />
      <circle cx="7" cy="17" r="1.6" />
      <circle cx="18" cy="17" r="1.6" />
    </svg>
  ),
  return: (
    <svg {...base} strokeWidth={1.4}>
      <path d="M3 12a9 9 0 1 0 3-6.7M3 4v4h4" />
    </svg>
  ),
  shield: (
    <svg {...base} strokeWidth={1.4}>
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
};

export const Instagram = () => (
  <svg {...base}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
  </svg>
);

export const Facebook = () => (
  <svg {...base}>
    <path d="M15 3h-3a4 4 0 0 0-4 4v3H5v4h3v7h4v-7h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

export const Pinterest = () => (
  <svg {...base}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8c-2 0-3 1.4-3 3 0 1 .5 1.8 1.2 2M11 17l1.4-6" />
  </svg>
);

export const WhatsApp = () => (
  <svg {...base}>
    <path d="M4 20l1.5-4A8 8 0 1 1 9 19l-5 1Z" />
  </svg>
);
