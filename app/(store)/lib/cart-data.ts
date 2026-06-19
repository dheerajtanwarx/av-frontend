/* ============================================================
   AV Creation — Cart & Checkout · shared types, money, seed data
   ------------------------------------------------------------
   Pure data/helpers (no React) so they can be imported from both
   server and client components. Ported from design/project/
   cart-data.jsx + checkout-flow.jsx.
   ============================================================ */

export type CartColor = { name: string; hex: string };

export type CartItem = {
  id: string; // stable key — slug + color + size
  serverId?: number; // database id, set once the item is persisted server-side
  slug?: string;
  name: string;
  type: string;
  color: CartColor;
  size: string;
  madeToMeasure: boolean;
  price: number;
  was: number | null;
  qty: number;
  stock?: number; // available units for this variant, when known (server carts)
  img: string;
  note?: string;
};

export type Promo = { code: string; pct: number; label: string };

export type OrderAddress = {
  first: string;
  last: string;
  email: string;
  phone: string;
  address: string;
  pin: string;
  city: string;
  state: string;
};

export type Order = {
  no: string;
  items: CartItem[];
  total: number;
  address: OrderAddress;
  payment: string;
  delivery: string;
  eta: string;
};

/* ---------- MONEY ---------- */
export const inr = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");

/** Parse a display price like "₹68,500" into the number 68500. */
export const parseINR = (s: string | number | null | undefined): number => {
  if (s == null) return 0;
  if (typeof s === "number") return s;
  const digits = s.replace(/[^0-9]/g, "");
  return digits ? parseInt(digits, 10) : 0;
};

/* ---------- PROMO CODES ---------- */
export const PROMOS: Record<string, { pct: number; label: string }> = {
  RANI10: { pct: 0.1, label: "10% off your order" },
  BRIDE5: { pct: 0.05, label: "5% welcome offer" },
};

/* ---------- DELIVERY ---------- */
export const DELIVERY_OPTS = [
  {
    id: "standard",
    dt: "Atelier Standard",
    ds: "Made-to-order · ships in 3–4 weeks · insured",
    dp: "Free",
    fee: 0,
  },
  {
    id: "priority",
    dt: "Priority Craft",
    ds: "Jumps the atelier queue · ships in 2–3 weeks",
    dp: "₹1,200",
    fee: 1200,
  },
] as const;

/* ---------- PAYMENT ---------- */
export const PAY_METHODS = [
  { id: "upi", name: "UPI", desc: "Pay instantly with any UPI app", tags: ["GPay", "PhonePe", "Paytm"] },
  { id: "card", name: "Credit / Debit Card", desc: "Visa · Mastercard · RuPay · Amex", tags: ["Visa", "MC"] },
  { id: "netbanking", name: "Net Banking", desc: "All major Indian banks", tags: [] },
  { id: "cod", name: "Cash on Delivery", desc: "Reserve with a small advance", tags: [] },
] as const;

export const PAY_LABEL: Record<string, string> = {
  upi: "UPI",
  card: "Card",
  netbanking: "Net Banking",
  cod: "Cash on Delivery",
};
