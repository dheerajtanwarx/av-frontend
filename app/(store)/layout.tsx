import type { Metadata } from "next";
import { Jost, Inter, EB_Garamond, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { SITE_URL, organizationLd, webSiteLd } from "./lib/seo";
import JsonLd from "./components/JsonLd";
import { CartProvider } from "./components/landing/CartContext";
import { WishlistProvider } from "./components/landing/WishlistContext";
import DeferredChrome from "./components/DeferredChrome";
import BottomNav from "./components/landing/BottomNav";
import BackButton from "./components/landing/BackButton";
import AnalyticsProvider from "./components/AnalyticsProvider";

// AJIO-referenced type system. AJIO's wordmark and headings use Twentieth
// Century (Tw Cen MT), a geometric sans in the Futura lineage; Jost is its
// open-source Google Fonts equivalent and carries all display type here. Inter
// — a clean, highly legible grotesque — carries body, prices and UI, mirroring
// AJIO's neutral product text.
// Jost + Inter back the legacy `.av` scope and the admin panel. The customer
// LCP pages (home `.av-lp`, PDP `.av-pdp`, category `.av-cat`) render in
// Garamond + Hanken, so these two are NOT preloaded — they still load on the
// pages that need them (swap covers the brief fallback) without competing for
// preload bandwidth on the storefront's critical render path.
const displayFont = Jost({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
});

const textFont = Inter({
  variable: "--font-text",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  preload: false,
});

// Phase-1 landing redesign type system (scoped to `.av-lp`). EB Garamond is the
// warm, calm display serif ("Odhni"); Hanken Grotesk carries the interface —
// prices, eyebrows, actions. Two weights only; hierarchy from scale + spacing.
const garamondFont = EB_Garamond({
  variable: "--font-garamond",
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});

const hankenFont = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const SITE_NAME = "AV Creation";
const DEFAULT_TITLE = "AV Creation — Jaipuri Odhani ";
const DEFAULT_DESC =
  "Heritage Rajasthani craft, reimagined for the modern woman. Hand-blocked lehengas, lugdi, odhani sarees, suits and the signature Jaipuri Odhni — finished by artisans across Jaipur, Sanganer and Bagru.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: DEFAULT_TITLE,
  description: DEFAULT_DESC,
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESC,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESC,
  },
  // Storefront favicon. The bundled `app/(store)/favicon.ico` is NOT detected by
  // Next: the favicon file convention is only honoured at the top level of
  // `app/`, never inside a route group — so the storefront (incl. the homepage
  // Google indexes) previously emitted no icon link and crawlers fell back to a
  // generic glyph. Referencing the brand mark explicitly fixes that on every
  // store route in one place.
 icons: {
  icon: [
    { url: "/favicon.ico", sizes: "any" },
    { url: "/icon.png", type: "image/png" },
  ],
  shortcut: "/favicon.ico",
  apple: "/apple-icon.png",
},
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${textFont.variable} ${garamondFont.variable} ${hankenFont.variable} h-full`}
    >
      <body className="min-h-full">
        <JsonLd data={[organizationLd(), webSiteLd()]} />
        <CartProvider>
          <WishlistProvider>
            <AnalyticsProvider />
            {children}
            <DeferredChrome />
            <BackButton />
            <BottomNav />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
