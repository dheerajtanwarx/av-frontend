import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter, Dancing_Script } from "next/font/google";
import { business } from "./lib/business";
import { SITE_URL } from "./lib/site";
import "./links.css";

/**
 * Root layout for the QR landing page.
 *
 * This is a *separate root layout* from the storefront (app/(store)/layout.tsx).
 * The two route groups share no parent layout, so /links loads none of the
 * storefront's providers, chrome, fonts or global CSS — only the three fonts
 * and the small stylesheet this page actually needs. That keeps the bundle
 * tiny and the page near-instant for shoppers scanning a packaging QR code.
 */
const serif = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-pd",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const script = Dancing_Script({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-ds",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${business.name} — ${business.tagline}`,
    template: `%s — ${business.name}`,
  },
  description: business.description,
  applicationName: business.name,
  keywords: [
    "Jaipuri Odhani",
    "Rajasthani Odhani",
    "Jaipur dupatta",
    "handcrafted odhani",
    business.name,
  ],
  openGraph: {
    type: "website",
    siteName: business.name,
    title: `${business.name} — ${business.tagline}`,
    description: business.description,
  },
  twitter: {
    card: "summary",
    title: `${business.name} — ${business.tagline}`,
    description: business.description,
  },
  icons: {
    icon: business.logo,
    apple: business.logo,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#FBF6EE",
  width: "device-width",
  initialScale: 1,
};

export default function LinksRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${serif.variable} ${sans.variable} ${script.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
