import { ProductDetailSkeleton } from "../../components/skeletons";

/* Shown while the product server component awaits the PDP data. */
export default function Loading() {
  return <ProductDetailSkeleton />;
}
