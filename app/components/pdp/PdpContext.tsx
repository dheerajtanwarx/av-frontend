"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { useCart } from "../landing/CartContext";

export type ToastPayload = {
  name: string;
  variant?: string;
  thumb: string;
  qty: number;
};

type PdpContextValue = {
  addToCart: (payload: ToastPayload) => void;
  toast: ToastPayload | null;
  closeToast: () => void;
};

const PdpContext = createContext<PdpContextValue | null>(null);

export function PdpProvider({ children }: { children: React.ReactNode }) {
  const { add } = useCart();
  const [toast, setToast] = useState<ToastPayload | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const addToCart = useCallback(
    (payload: ToastPayload) => {
      add(payload.qty);
      setToast(payload);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setToast(null), 4200);
    },
    [add]
  );

  const closeToast = useCallback(() => setToast(null), []);

  return (
    <PdpContext.Provider value={{ addToCart, toast, closeToast }}>
      {children}
    </PdpContext.Provider>
  );
}

export function usePdp() {
  const ctx = useContext(PdpContext);
  if (!ctx) throw new Error("usePdp must be used within a PdpProvider");
  return ctx;
}
