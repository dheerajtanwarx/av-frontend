import type { Metadata } from "next";
import RequestSubmitted from "../../components/cart/RequestSubmitted";

export const metadata: Metadata = {
  title: "Request Submitted — AV Creation",
  description: "Your order request is pending approval. We’ll reply on WhatsApp shortly.",
};

export default function CheckoutSuccessPage() {
  return <RequestSubmitted />;
}
