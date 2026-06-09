"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { useCart, type CartItem } from "../landing/CartContext";

export type ToastPayload = {
  name: string;
  variant?: string;
  thumb: string;
  qty: number;
};

type PdpContextValue = {
  addToCart: (item: CartItem) => void;
  toast: ToastPayload | null;
  toastVisible: boolean;
  closeToast: () => void;
};

const PdpContext = createContext<PdpContextValue | null>(null);

export function PdpProvider({ children }: { children: React.ReactNode }) {
  const { addItem } = useCart();
  // toast holds the content (stays mounted during slide-out); toastVisible
  // drives the .show class so the text doesn't flicker empty on dismiss.
  const [toast, setToast] = useState<ToastPayload | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const addToCart = useCallback(
    (item: CartItem) => {
      addItem(item);
      setToast({
        name: item.name,
        variant: `${item.color.name} · ${item.madeToMeasure ? "Made to measure" : "Size " + item.size}`,
        thumb: item.img,
        qty: item.qty,
      });
      setToastVisible(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setToastVisible(false), 4200);
    },
    [addItem]
  );

  const closeToast = useCallback(() => setToastVisible(false), []);

  return (
    <PdpContext.Provider value={{ addToCart, toast, toastVisible, closeToast }}>
      {children}
    </PdpContext.Provider>
  );
}

export function usePdp() {
  const ctx = useContext(PdpContext);
  if (!ctx) throw new Error("usePdp must be used within a PdpProvider");
  return ctx;
}
