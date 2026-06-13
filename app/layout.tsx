import type { Metadata } from "next";
import { Jost, Inter, EB_Garamond, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { CartProvider } from "./components/landing/CartContext";
import { WishlistProvider } from "./components/landing/WishlistContext";
import CartDrawer from "./components/cart/CartDrawer";
import CartToast from "./components/cart/CartToast";
import WhatsAppButton from "./components/landing/WhatsAppButton";
import BottomNav from "./components/landing/BottomNav";
import BackButton from "./components/landing/BackButton";

// AJIO-referenced type system. AJIO's wordmark and headings use Twentieth
// Century (Tw Cen MT), a geometric sans in the Futura lineage; Jost is its
// open-source Google Fonts equivalent and carries all display type here. Inter
// — a clean, highly legible grotesque — carries body, prices and UI, mirroring
// AJIO's neutral product text.
const displayFont = Jost({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const textFont = Inter({
  variable: "--font-text",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// Phase-1 landing redesign type system (scoped to `.av-lp`). EB Garamond is the
// warm, calm display serif ("Odhni"); Hanken Grotesk carries the interface —
// prices, eyebrows, actions. Two weights only; hierarchy from scale + spacing.
const garamondFont = EB_Garamond({
  variable: "--font-garamond",
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
});

const hankenFont = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "AV Creation — Jaipuri Atelier · Rajasthan",
  description:
    "Heritage Rajasthani craft, reimagined for the modern woman. Hand-blocked lehengas, sarees, suits and the signature Jaipuri Odhni — finished by artisans across Jaipur, Sanganer and Bagru.",
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
        <CartProvider>
          <WishlistProvider>
            {children}
            <CartDrawer />
            <CartToast />
            <WhatsAppButton />
            <BackButton />
            <BottomNav />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
