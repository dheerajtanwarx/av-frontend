/* Icon set for the cart & checkout flow — lucide-react (shadcn set).
   `needle` has no lucide equivalent, so it stays an inline SVG. */
import type { ReactElement } from "react";
import {
  Search,
  User,
  ShoppingBag,
  Plus,
  Check,
  ArrowRight,
  ArrowLeft,
  Trash2,
  Heart,
  Truck,
  Scissors,
  ShieldCheck,
  Lock,
  Tag,
  Info,
  Calendar,
} from "lucide-react";

export const CartIc: Record<string, ReactElement> = {
  search: <Search strokeWidth={1.5} />,
  user: <User strokeWidth={1.5} />,
  cart: <ShoppingBag strokeWidth={1.5} />,
  bag: <ShoppingBag strokeWidth={1.4} />,
  plus: <Plus strokeWidth={1.7} />,
  check: <Check strokeWidth={2.2} />,
  arrowR: <ArrowRight strokeWidth={1.6} />,
  arrowL: <ArrowLeft strokeWidth={1.6} />,
  trash: <Trash2 strokeWidth={1.5} />,
  heart: <Heart strokeWidth={1.6} />,
  ship: <Truck strokeWidth={1.4} />,
  scissor: <Scissors strokeWidth={1.4} />,
  shield: <ShieldCheck strokeWidth={1.4} />,
  lock: <Lock strokeWidth={1.5} />,
  tag: <Tag strokeWidth={1.5} />,
  info: <Info strokeWidth={1.5} />,
  calendar: <Calendar strokeWidth={1.4} />,
  needle: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M3 21L14 10M14 10l3.5-3.5a2.5 2.5 0 1 1 0 5L14 10" />
      <circle cx="18" cy="6" r="1.2" />
    </svg>
  ),
};
