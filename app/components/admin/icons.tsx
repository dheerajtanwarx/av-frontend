/* Admin panel icons — 20px stroke SVGs that inherit `currentColor`,
   so they pick up the nav link / button text colour automatically. */

type IconProps = { className?: string };

const base = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const DashboardIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="3" y="3" width="7" height="9" rx="1" />
    <rect x="14" y="3" width="7" height="5" rx="1" />
    <rect x="14" y="12" width="7" height="9" rx="1" />
    <rect x="3" y="16" width="7" height="5" rx="1" />
  </svg>
);

export const OrdersIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M6 2h9l3 3v17l-3-2-2 2-2-2-2 2-2-2-2 2V2z" />
    <path d="M9 7h6M9 11h6M9 15h4" />
  </svg>
);

export const ProductsIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M3 7l9-4 9 4-9 4-9-4z" />
    <path d="M3 7v10l9 4 9-4V7" />
    <path d="M12 11v10" />
  </svg>
);

export const CustomersIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" />
    <path d="M16 4.5a3.2 3.2 0 0 1 0 6.3M18 20c0-2.6-1-4.3-2.5-5.2" />
  </svg>
);

export const InventoryIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="3" y="4" width="18" height="5" rx="1" />
    <path d="M5 9v10h14V9" />
    <path d="M9 13h6" />
  </svg>
);

export const ReviewsIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 3.5l2.5 5 5.5.8-4 3.9.95 5.5L12 16.1 7.05 18.7 8 13.2 4 9.3l5.5-.8L12 3.5z" />
  </svg>
);

export const ReportsIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 20V4M4 20h16" />
    <path d="M8 17v-5M12 17V8M16 17v-7" />
  </svg>
);

export const SettingsIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
  </svg>
);

export const MenuIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

export const CloseIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const ChevronIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);

export const LogoutIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M15 4h3a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3" />
    <path d="M10 8l-4 4 4 4M6 12h11" />
  </svg>
);
