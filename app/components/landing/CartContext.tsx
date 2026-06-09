"use client";

import { createContext, useCallback, useContext, useState } from "react";

type CartContextValue = {
  count: number;
  add: (qty?: number) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState(2); // matches the design's initial badge
  const add = useCallback((qty: number = 1) => setCount((c) => c + qty), []);
  return (
    <CartContext.Provider value={{ count, add }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
