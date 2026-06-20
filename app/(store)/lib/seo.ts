/**
 * Storefront SEO helpers — canonical URLs + schema.org JSON-LD builders.
 * The public origin and brand details are reused from the existing
 * single-sources-of-truth in app/(links)/lib, so a domain change stays a
 * one-line env edit.
 */
import { SITE_URL, absoluteUrl } from "@/app/(links)/lib/site";
import { business } from "@/app/(links)/lib/business";

export { SITE_URL, absoluteUrl };

/** Fallback category slugs used when the API is unreachable (sitemap / nav). */
export const KNOWN_CATEGORY_SLUGS = [
  "jaipuri-odhni",
  "lehenga",
  "designer-saree",
  "suit-sets",
];

/** Organization schema — rendered once in the storefront layout. */
export function organizationLd(): Record<string, unknown> {
  const sameAs = [
    business.instagram,
    business.facebook,
    business.youtube,
    business.threads,
  ].filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: business.name,
    url: SITE_URL,
    logo: absoluteUrl(business.logo),
    description: business.description,
    ...(sameAs.length ? { sameAs } : {}),
  };
}

/** WebSite schema with a search action (enables a sitelinks search box). */
export function webSiteLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: business.name,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/** BreadcrumbList schema from an ordered list of { name, path }. */
export function breadcrumbLd(
  crumbs: { name: string; path: string }[]
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

/** FAQPage schema from question/answer pairs. */
export function faqLd(
  faqs: { q: string; a: string }[]
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
