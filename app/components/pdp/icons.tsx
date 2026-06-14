/* ============================================================
   AV Creation — Product page icons (lucide-react / shadcn set)
   ============================================================ */
import type { ReactElement } from "react";
import {
  Search,
  User,
  ShoppingBag,
  ZoomIn,
  Heart,
  Plus,
  Check,
  BadgeCheck,
  Truck,
  Scissors,
  ShieldCheck,
} from "lucide-react";

export const Ic: Record<string, ReactElement> = {
  search: <Search strokeWidth={1.5} />,
  user: <User strokeWidth={1.5} />,
  cart: <ShoppingBag strokeWidth={1.5} />,
  zoom: <ZoomIn strokeWidth={1.6} />,
  heart: <Heart strokeWidth={1.6} />,
  plus: <Plus strokeWidth={1.7} />,
  /* `check` class drives the stroke-draw animation (inherited to the path). */
  check: <Check className="check" strokeWidth={2.2} />,
  verify: <BadgeCheck strokeWidth={1.7} />,
  ship: <Truck strokeWidth={1.4} />,
  scissor: <Scissors strokeWidth={1.4} />,
  shield: <ShieldCheck strokeWidth={1.4} />,
};

export function Stars({ n, className = "stars" }: { n: number; className?: string }) {
  const full = Math.floor(n);
  const half = n - full >= 0.5;
  const s = "★".repeat(full) + (half ? "★" : "") + "☆".repeat(5 - full - (half ? 1 : 0));
  return <span className={className}>{s}</span>;
}
