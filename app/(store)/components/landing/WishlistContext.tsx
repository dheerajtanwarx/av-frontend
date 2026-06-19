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
  getSession,
  fetchWishlist,
  addWishlistItem,
  removeWishlistItem,
  mergeWishlist,
  type ServerWishlistItem,
} from "../../lib/api";

const LS_KEY = "av-wishlist-v1";

/** A saved product. `serverId`/`productId` are present once persisted to the
    DB; guests hold the same shape in localStorage without them. */
export type WishItem = {
  slug: string;
  name: string;
  type: string;
  price: string; // formatted INR string, e.g. "₹4,999"
  was?: string | null;
  stars?: string;
  img: string;
  inStock?: boolean; // unknown for guest-added items → treated as available
  serverId?: number;
  productId?: number;
};

type WishlistContextValue = {
  items: WishItem[];
  wished: Set<string>;
  count: number;
  loading: boolean;
  isWished: (slug: string) => boolean;
  add: (item: WishItem) => void;
  remove: (slug: string) => void;
  toggle: (item: WishItem) => void;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

function fromServer(s: ServerWishlistItem): WishItem {
  return {
    slug: s.slug,
    name: s.name,
    type: s.type,
    price: s.price,
    was: s.was,
    stars: s.stars,
    img: s.img,
    inStock: s.inStock,
    serverId: s.id,
    productId: s.productId,
  };
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishItem[]>([]);
  const [loading, setLoading] = useState(true);
  const hydrated = useRef(false);
  const itemsRef = useRef<WishItem[]>([]);
  // The signed-in user's id, once known — gates server-sync calls.
  const userIdRef = useRef<string | null>(null);
  // Slugs with an add/remove request in flight, to dedupe rapid clicks.
  const inFlight = useRef<Set<string>>(new Set());

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  /* hydrate from localStorage, then reconcile with the server if signed in */
  useEffect(() => {
    let localItems: WishItem[] = [];
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as WishItem[];
        if (Array.isArray(saved)) {
          localItems = saved;
          setItems(saved);
        }
      }
    } catch {
      /* ignore corrupt storage */
    }
    hydrated.current = true;

    (async () => {
      try {
        const user = await getSession();
        if (!user) return;
        userIdRef.current = user.id;

        // Push any guest-saved slugs to the server, then adopt the server
        // wishlist as authoritative (deduped, with product availability).
        const slugs = localItems.map((i) => i.slug).filter(Boolean);
        const server =
          slugs.length > 0 ? await mergeWishlist(slugs) : await fetchWishlist();
        const mapped = server.map(fromServer);
        setItems(mapped);
        try {
          localStorage.setItem(LS_KEY, JSON.stringify(mapped));
        } catch {
          /* ignore */
        }
      } catch {
        /* offline / unauthenticated — keep local state */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* persist whenever the wishlist changes (after first hydration) */
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(items));
    } catch {
      /* storage full / unavailable */
    }
  }, [items]);

  const add = useCallback((item: WishItem) => {
    if (itemsRef.current.some((i) => i.slug === item.slug)) return; // already saved
    if (inFlight.current.has(item.slug)) return; // dedupe concurrent clicks

    // Optimistic insert at the top.
    setItems((b) => [item, ...b]);

    if (!userIdRef.current) return; // guest — localStorage only
    inFlight.current.add(item.slug);
    addWishlistItem(item.slug)
      .then((saved) => {
        // Backfill server ids + authoritative availability.
        setItems((b) =>
          b.map((i) =>
            i.slug === item.slug
              ? { ...i, serverId: saved.id, productId: saved.productId, inStock: saved.inStock }
              : i
          )
        );
      })
      .catch(() => {
        // Roll back the optimistic insert on failure.
        setItems((b) => b.filter((i) => i.slug !== item.slug));
      })
      .finally(() => inFlight.current.delete(item.slug));
  }, []);

  const remove = useCallback((slug: string) => {
    const backup = itemsRef.current.find((i) => i.slug === slug);
    if (!backup) return;
    if (inFlight.current.has(slug)) return;

    // Optimistic removal.
    setItems((b) => b.filter((i) => i.slug !== slug));

    if (!userIdRef.current) return; // guest — localStorage only
    inFlight.current.add(slug);
    removeWishlistItem(slug)
      .catch(() => {
        // Restore on failure (keep original position best-effort: prepend).
        setItems((b) => (b.some((i) => i.slug === slug) ? b : [backup, ...b]));
      })
      .finally(() => inFlight.current.delete(slug));
  }, []);

  const toggle = useCallback(
    (item: WishItem) => {
      if (itemsRef.current.some((i) => i.slug === item.slug)) remove(item.slug);
      else add(item);
    },
    [add, remove]
  );

  const wished = useMemo(() => new Set(items.map((i) => i.slug)), [items]);
  const isWished = useCallback((slug: string) => wished.has(slug), [wished]);

  const value: WishlistContextValue = {
    items,
    wished,
    count: items.length,
    loading,
    isWished,
    add,
    remove,
    toggle,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within a WishlistProvider");
  return ctx;
}
