import type { Metadata } from "next";
import CartView from "../components/cart/CartView";

export const metadata: Metadata = {
  title: "Your Bag — AV Creation",
  description: "Review your hand-crafted pieces and proceed to a secure checkout.",
};

export default function CartPage() {
  return <CartView />;
}
