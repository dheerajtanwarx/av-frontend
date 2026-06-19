import type { Metadata } from "next";
import { LinkHub } from "../components/LinkHub";
import { business } from "../lib/business";
import { getPrimaryLinks } from "../lib/links";
import { LINKS_URL, LINKS_PATH } from "../lib/site";

export const metadata: Metadata = {
  title: business.tagline,
  description: business.description,
  alternates: { canonical: LINKS_PATH },
  openGraph: {
    title: `${business.name} — ${business.tagline}`,
    description: business.description,
    url: LINKS_URL,
    type: "website",
  },
};

function StructuredData() {
  const sameAs = getPrimaryLinks()
    .filter((l) => l.external && l.href)
    .map((l) => l.href as string);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    name: business.name,
    slogan: business.tagline,
    description: business.description,
    url: LINKS_URL,
    image: `${LINKS_URL.replace(LINKS_PATH, "")}${business.logo}`,
    sameAs,
    ...(business.email ? { email: business.email } : {}),
    ...(business.phone ? { telephone: business.phone } : {}),
    location: business.stores.map((store) => ({
      "@type": "Place",
      name: store.name,
      address: store.area,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function LinksPage() {
  return (
    <main className="relative min-h-[100dvh]">
      <StructuredData />
      <LinkHub />
    </main>
  );
}
