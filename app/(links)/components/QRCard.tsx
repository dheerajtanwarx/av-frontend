"use client";

import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Download, QrCode } from "lucide-react";
import { business } from "../lib/business";
import { trackEvent } from "../lib/analytics";

/**
 * The QR value is passed in from the server (derived from
 * NEXT_PUBLIC_SITE_URL) so it always matches the live domain — change
 * the env var and every printed-page QR points to the new URL.
 */
export function QRCard({ url }: { url: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);

  function downloadPng() {
    const canvas = wrapRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${business.name.replace(/\s+/g, "-").toLowerCase()}-qr.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    trackEvent("qr_download");
  }

  return (
    <div className="flex flex-col items-center rounded-3xl border border-white/60 bg-white/70 p-6 text-center shadow-card backdrop-blur-sm">
      <span className="mb-1 inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-gold-deep">
        <QrCode size={14} aria-hidden="true" />
        Scan & Share
      </span>
      <p className="mb-4 text-sm text-maroon/60">
        Point a camera here to open this page
      </p>

      <div
        ref={wrapRef}
        className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-gold/15"
      >
        <QRCodeCanvas
          value={url}
          size={172}
          level="M"
          marginSize={2}
          fgColor="#6E1226"
          bgColor="#FFFFFF"
          aria-label={`QR code linking to ${url}`}
        />
      </div>

      <button
        type="button"
        onClick={downloadPng}
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-coral via-coral-deep to-maroon px-5 py-2.5 text-sm font-medium text-white shadow-soft transition-transform active:scale-95"
      >
        <Download size={16} aria-hidden="true" />
        Download QR
      </button>
    </div>
  );
}
