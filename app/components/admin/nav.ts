import type { ComponentType } from "react";
import {
  DashboardIcon,
  OrdersIcon,
  ProductsIcon,
  CustomersIcon,
  InventoryIcon,
  ReviewsIcon,
  ReportsIcon,
  SettingsIcon,
  BellIcon,
  ScanIcon,
} from "./icons";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
};

/* Single source of truth for the admin sidebar + topbar page title. */
export const ADMIN_NAV: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: DashboardIcon },
  { label: "Orders", href: "/admin/orders", icon: OrdersIcon },
  { label: "Scan", href: "/admin/scan", icon: ScanIcon },
  { label: "Products", href: "/admin/products", icon: ProductsIcon },
  { label: "Customers", href: "/admin/customers", icon: CustomersIcon },
  { label: "Inventory", href: "/admin/inventory", icon: InventoryIcon },
  { label: "Reviews", href: "/admin/reviews", icon: ReviewsIcon },
  { label: "Notifications", href: "/admin/notifications", icon: BellIcon },
  { label: "Reports", href: "/admin/reports", icon: ReportsIcon },
  { label: "Settings", href: "/admin/settings", icon: SettingsIcon },
];

/** Best-matching nav item for a pathname (handles nested routes via prefix). */
export function activeNavItem(pathname: string): AdminNavItem | undefined {
  return ADMIN_NAV.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );
}
