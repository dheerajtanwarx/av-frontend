import type { Metadata } from "next";
import RequestReview from "../components/cart/RequestReview";

export const metadata: Metadata = {
  title: "Request Order — AV Creation",
  description:
    "Review your selection and request your order on WhatsApp. We verify availability before any payment.",
};

export default function CheckoutPage() {
  return <RequestReview />;
}
