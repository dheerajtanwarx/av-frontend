/* Admin panel icons — lucide-react (shadcn set), 20px and inheriting
   `currentColor` so they pick up the surrounding link / button colour. */
import {
  LayoutDashboard,
  ClipboardList,
  Package,
  Users,
  Boxes,
  Star,
  BarChart3,
  Settings,
  Menu,
  X,
  ChevronDown,
  Bell,
  LogOut,
  ScanLine,
  type LucideProps,
} from "lucide-react";

type IconProps = { className?: string };

const base: LucideProps = {
  size: 20,
  strokeWidth: 1.6,
  absoluteStrokeWidth: false,
};

export const DashboardIcon = (p: IconProps) => <LayoutDashboard {...base} {...p} />;
export const OrdersIcon = (p: IconProps) => <ClipboardList {...base} {...p} />;
export const ProductsIcon = (p: IconProps) => <Package {...base} {...p} />;
export const CustomersIcon = (p: IconProps) => <Users {...base} {...p} />;
export const InventoryIcon = (p: IconProps) => <Boxes {...base} {...p} />;
export const ReviewsIcon = (p: IconProps) => <Star {...base} {...p} />;
export const ReportsIcon = (p: IconProps) => <BarChart3 {...base} {...p} />;
export const SettingsIcon = (p: IconProps) => <Settings {...base} {...p} />;
export const MenuIcon = (p: IconProps) => <Menu {...base} {...p} />;
export const CloseIcon = (p: IconProps) => <X {...base} {...p} />;
export const ChevronIcon = (p: IconProps) => <ChevronDown {...base} {...p} />;
export const BellIcon = (p: IconProps) => <Bell {...base} {...p} />;
export const LogoutIcon = (p: IconProps) => <LogOut {...base} {...p} />;
export const ScanIcon = (p: IconProps) => <ScanLine {...base} {...p} />;
