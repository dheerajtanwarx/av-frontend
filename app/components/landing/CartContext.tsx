"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  parseINR,
  type CartItem,
  type Order,
  type OrderAddress,
  type Promo,
} from "../../lib/cart-data";
import {
  validatePromo,
  placeOrder as apiPlaceOrder,
  getSession,
  mergeServerCart,
  fetchServerCart,
  addServerCartItem,
  updateServerCartQty,
  removeServerCartItem,
} from "../../lib/api";

const LS_KEY = "av-cart-v1";
const ORDER_KEY = "av-last-order";

type ApplyResult = { ok: boolean; error?: string };

type CartContextValue = {
  /* state */
  items: CartItem[];
  promo: Promo | null;
  drawerOpen: boolean;
  lastOrder: Order | null;
  /* derived */
  count: number;
  subtotal: number;
  savings: number;
  discount: number;
  total: number;
  /* actions */
  addItem: (item: CartItem) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  applyPromo: (code: string) => Promise<ApplyResult>;
  removePromo: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  placeOrder: (details: {
    address: OrderAddress;
    paymentId: string;
    paymentLabel: string;
    delivery: string;
  }) => Promise<Order>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [promo, setPromo] = useState<Promo | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const hydrated = useRef(false);
  // Mirrors `items` so callbacks can read current values without stale closures.
  const itemsRef = useRef<CartItem[]>([]);
  // Set to the logged-in user's id once known; used to gate server cart calls.
  const userIdRef = useRef<string | null>(null);

  /* keep itemsRef in sync so callbacks can read current items without stale closures */
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  /* hydrate from storage once on mount */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { items?: CartItem[]; promo?: Promo | null };
        if (Array.isArray(saved.items)) setItems(saved.items);
        if (saved.promo) setPromo(saved.promo);
      }
      const ord = sessionStorage.getItem(ORDER_KEY);
      if (ord) setLastOrder(JSON.parse(ord) as Order);
    } catch {
      /* ignore corrupt storage */
    }
    hydrated.current = true;

    // If the user is signed in, merge any local guest cart into the server
    // cart and replace local state with the authoritative server cart.
    (async () => {
      try {
        const user = await getSession();
        if (!user) return;
        userIdRef.current = user.id;

        // Read the current local items we just hydrated (if any).
        const raw = localStorage.getItem(LS_KEY);
        const saved = raw ? (JSON.parse(raw) as { items?: CartItem[] }) : null;
        const localItems: CartItem[] = Array.isArray(saved?.items) ? saved!.items! : [];

        // Send merge request only for items that have no serverId — those are
        // genuinely guest-added items not yet on the server. Items with a
        // serverId were fetched from the server in a previous session and are
        // already present; sending them would double-increment their qty.
        const payload = localItems
          .filter((i) => !i.serverId)
          .map((i) => ({ slug: i.slug ?? "", color: i.color.name, qty: i.qty }))
          .filter((it) => it.slug && it.slug.trim() !== "");
        if (payload.length > 0) {
          await mergeServerCart(payload as { slug: string; color?: string; qty: number }[]);
        }

        // Fetch the merged server cart and convert into local CartItem shape.
        // Store serverId so subsequent mutations can call PATCH/DELETE by row id.
        const server = await fetchServerCart();
        const mapped: CartItem[] = server.map((s) => ({
          id: `${s.slug}-${s.variantId}`,
          serverId: s.id,
          slug: s.slug,
          name: s.name,
          type: s.type ?? "",
          color: s.color,
          size: "",
          madeToMeasure: false,
          price: s.unitPrice,
          was: null,
          qty: s.qty,
          img: s.img,
        }));
        if (mapped.length > 0) {
          setItems(mapped);
          try {
            localStorage.setItem(LS_KEY, JSON.stringify({ items: mapped, promo: null }));
          } catch {
            /* ignore */
          }
        }
      } catch {
        /* ignore merge errors */
      }
    })();
  }, []);

  /* persist whenever cart changes (after first hydration) */
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ items, promo }));
    } catch {
      /* storage full / unavailable */
    }
  }, [items, promo]);

  const addItem = useCallback((item: CartItem) => {
    const existing = itemsRef.current.find((i) => i.id === item.id);
    const newQty = existing ? existing.qty + item.qty : item.qty;

    setItems((b) => {
      const ex = b.find((i) => i.id === item.id);
      if (ex) return b.map((i) => (i.id === item.id ? { ...i, qty: i.qty + item.qty } : i));
      return [...b, item];
    });

    if (userIdRef.current && item.slug) {
      if (existing?.serverId) {
        // Item already has a DB row — set its absolute qty.
        updateServerCartQty(existing.serverId, newQty).catch(() => {});
      } else {
        // New item (or not yet persisted) — upsert on server and capture the row id.
        addServerCartItem(item.slug, item.color.name, item.qty)
          .then((serverItem) => {
            setItems((b) =>
              b.map((i) => (i.id === item.id ? { ...i, serverId: serverItem.id } : i))
            );
          })
          .catch(() => {});
      }
    }
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    const item = itemsRef.current.find((i) => i.id === id);
    if (item?.serverId && userIdRef.current) {
      updateServerCartQty(item.serverId, qty).catch(() => {});
    }
    setItems((b) => b.map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i)));
  }, []);

  const remove = useCallback((id: string) => {
    const item = itemsRef.current.find((i) => i.id === id);
    if (item?.serverId && userIdRef.current) {
      removeServerCartItem(item.serverId).catch(() => {});
    }
    setItems((b) => b.filter((i) => i.id !== id));
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    setPromo(null);
  }, []);

  const applyPromo = useCallback(
    async (code: string): Promise<ApplyResult> => {
      const key = code.trim().toUpperCase();
      if (!key) return { ok: false, error: "Enter a code first." };
      const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
      try {
        const res = await validatePromo(key, subtotal);
        if (res.ok) {
          setPromo({ code: key, pct: res.pct, label: res.label });
          return { ok: true };
        }
        return { ok: false, error: res.error ?? "That code isn’t valid." };
      } catch {
        return { ok: false, error: "Couldn’t reach the server. Please try again." };
      }
    },
    [items]
  );

  const removePromo = useCallback(() => setPromo(null), []);

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  /* derived totals */
  const { count, subtotal, savings, discount, total } = useMemo(() => {
    const count = items.reduce((s, i) => s + i.qty, 0);
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const savings = items.reduce((s, i) => s + (i.was ? (i.was - i.price) * i.qty : 0), 0);
    const discount = promo ? Math.round(subtotal * promo.pct) : 0;
    const total = Math.max(0, subtotal - discount);
    return { count, subtotal, savings, discount, total };
  }, [items, promo]);

  const placeOrder = useCallback<CartContextValue["placeOrder"]>(
    async (details) => {
      // The server is authoritative for pricing, the order number and ETA.
      const res = await apiPlaceOrder({
        items: items.map((i) => ({
          slug: i.slug ?? i.id,
          color: i.color.name,
          size: i.madeToMeasure ? "Custom" : i.size,
          qty: i.qty,
        })),
        address: details.address,
        payment: details.paymentId,
        delivery: details.delivery,
        promoCode: promo?.code ?? null,
      });

      const order: Order = {
        no: res.no,
        items,
        total: res.total,
        address: details.address,
        payment: details.paymentLabel,
        delivery: details.delivery,
        eta: res.eta,
      };
      setLastOrder(order);
      try {
        sessionStorage.setItem(ORDER_KEY, JSON.stringify(order));
      } catch {
        /* ignore */
      }
      clear();
      return order;
    },
    [items, promo, clear]
  );

  const value: CartContextValue = {
    items,
    promo,
    drawerOpen,
    lastOrder,
    count,
    subtotal,
    savings,
    discount,
    total,
    addItem,
    setQty,
    remove,
    clear,
    applyPromo,
    removePromo,
    openDrawer,
    closeDrawer,
    placeOrder,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}

/* Re-exported helper used by callers building a CartItem from PDP data. */
export { parseINR };
export type { CartItem, OrderAddress };
