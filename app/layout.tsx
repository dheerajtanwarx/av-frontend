import type { Metadata } from "next";
import { Cormorant_Garamond, Marcellus, Jost } from "next/font/google";
import "./globals.css";
import { CartProvider } from "./components/landing/CartContext";
import CartDrawer from "./components/cart/CartDrawer";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const marcellus = Marcellus({
  variable: "--font-marcellus",
  subsets: ["latin"],
  weight: "400",
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
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
      className={`${cormorant.variable} ${marcellus.variable} ${jost.variable} h-full`}
    >
      <body className="min-h-full">
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
