import { CollectionSkeleton } from "../../components/skeletons";

/* Shown while the category server component awaits its products. */
export default function Loading() {
  return <CollectionSkeleton />;
}
