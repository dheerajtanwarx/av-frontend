import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Funnel the whole site to the social links page.
 *
 * While the storefront is held back, every route — landing page, auth,
 * product pages, cart, admin, everything — is redirected to /social-links.
 * Flip this off later by deleting this file (or narrowing the matcher).
 *
 * In Next.js 16 the old `middleware` convention was renamed to `proxy`
 * (see node_modules/next/dist/docs/.../file-conventions/proxy.md). The file
 * lives at the project root, alongside `app/`.
 *
 * GATE TOGGLE: the storefront is currently OPEN. Flip STOREFRONT_GATED back to
 * true to re-funnel the whole site to /social-links (e.g. for another holding
 * period). Nothing else needs to change.
 */
const STOREFRONT_GATED = true;
const TARGET = "/social-links";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Storefront is live — let every request through untouched.
  if (!STOREFRONT_GATED) {
    return NextResponse.next();
  }

  // Don't redirect the destination itself (or its sub-paths / RSC requests),
  // otherwise we'd loop forever.
  if (pathname === TARGET || pathname.startsWith(`${TARGET}/`)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = TARGET;
  url.search = "";
  // 307 (temporary) on purpose — the storefront comes back later, so browsers
  // must not cache this redirect permanently.
  return NextResponse.redirect(url);
}

export const config = {
  /*
   * Run on every path EXCEPT:
   *  - api            → API routes (none here today, but future-proof)
   *  - _next/static   → build assets
   *  - _next/image    → the image optimizer (serves the QR-page logo)
   *  - anything with a dot (e.g. /av-logo.png, /pattern.svg, /favicon.ico)
   *    so the social links page's own static assets keep loading.
   */
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
