import { HomeSkeleton } from "./components/skeletons";

/* Route-level loading UI for the landing page. Shown instantly on
   navigation while the server component awaits the live catalog. */
export default function Loading() {
  return <HomeSkeleton />;
}
