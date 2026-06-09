import type { Metadata } from "next";
import CheckoutView from "../components/cart/CheckoutView";

export const metadata: Metadata = {
  title: "Secure Checkout — AV Creation",
  description: "Contact, delivery and payment — all on one secure page.",
};

export default function CheckoutPage() {
  return <CheckoutView />;
}
