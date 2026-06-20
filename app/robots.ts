import type { MetadataRoute } from "next";
import { SITE_URL } from "@/app/(store)/lib/seo";

/**
 * /robots.txt — allow the public storefront, keep private/transactional and
 * admin routes out of the index. Points crawlers at the sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/api/",
        "/cart",
        "/checkout",
        "/profile",
        "/my-orders",
        "/my-requests",
        "/wishlist",
        "/login",
        "/signup",
        "/track-order",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
