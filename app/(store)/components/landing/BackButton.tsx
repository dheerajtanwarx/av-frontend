"use client";

import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

/**
 * Mobile-only "return back" control. Rendered once in the root layout so it
 * appears on every interior page without each page having to wire it up — this
 * matters because several screens (product, cart, checkout, login, signup)
 * render no top Header at all, and the mobile header itself collapses to a
 * centred logo, leaving the top-left corner free.
 *
 * Hidden on the home page (nowhere to go back to) and on the admin area
 * (which owns its own chrome). Desktop never shows it — the full top nav and
 * breadcrumbs already answer "where am I?".
 */
export default function BackButton() {
  const pathname = usePathname();
  const router = useRouter();

  // Home has no parent; admin has its own layout and navigation.
  if (pathname === "/" || pathname.startsWith("/admin")) return null;

  const goBack = () => {
    // Prefer in-app history; fall back to home if this was a fresh/direct load
    // (e.g. a shared product link) so the button is never a dead end.
    if (window.history.length > 1) router.back();
    else router.push("/");
  };

  return (
    <button type="button" className="backfab" aria-label="Go back" onClick={goBack}>
      <ChevronLeft size={22} strokeWidth={1.7} aria-hidden="true" />
    </button>
  );
}
