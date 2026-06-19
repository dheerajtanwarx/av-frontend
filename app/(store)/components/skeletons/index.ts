/* ============================================================
   AV CREATION — Skeleton system, single import surface.

   import { Skeleton, ProductGridSkeleton, CollectionSkeleton }
     from "@/app/components/skeletons";

   - Skeleton / SkeletonText  → the primitive
   - patterns                 → reusable content blocks (no chrome)
   - pages                    → full-route skeletons (with Header)
   ============================================================ */

export { Skeleton, SkeletonText } from "./Skeleton";
export type { SkeletonProps, SkeletonVariant } from "./Skeleton";

export {
  ProductCardSkeleton,
  ProductGridSkeleton,
  PageHeaderSkeleton,
  NavRowsSkeleton,
  PanelSkeleton,
  OrderCardSkeleton,
  AddressCardSkeleton,
  CartLineSkeleton,
} from "./patterns";

export {
  HomeSkeleton,
  CollectionSkeleton,
  SearchResultsSkeleton,
  SearchPageSkeleton,
  ProductDetailSkeleton,
  WishlistSkeleton,
  CartSkeleton,
  ProfileSkeleton,
  AccountFormSkeleton,
  AddressBookSkeleton,
  OrdersSkeleton,
  OrderDetailSkeleton,
} from "./pages";

export {
  AdminTableRowsSkeleton,
  AdminCardListSkeleton,
  AdminStatGridSkeleton,
  AdminChartsSkeleton,
  AdminPanelSkeleton,
  AdminPageSkeleton,
} from "./admin";
