import type { Metadata } from "next";
import ConfirmationView from "../../components/cart/ConfirmationView";

export const metadata: Metadata = {
  title: "Order Confirmed — AV Creation",
  description: "Thank you. Your made-to-order heirloom is reserved with our karigars.",
};

export default function CheckoutSuccessPage() {
  return <ConfirmationView />;
}
