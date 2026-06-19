"use client";

import { motion, useReducedMotion } from "motion/react";
import { MapPin, Navigation } from "lucide-react";
import type { StoreLocation } from "../lib/business";
import { storeMapsUrl } from "../lib/links";
import { trackEvent } from "../lib/analytics";

export function StoreCard({ store }: { store: StoreLocation }) {
  const reduce = useReducedMotion();
  const href = storeMapsUrl(store);

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackEvent("store_click", { label: store.name })}
      whileHover={reduce ? {} : { y: -3 }}
      whileTap={reduce ? {} : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 26 }}
      className="group flex flex-col rounded-2xl border border-white/60 bg-white/70 p-4 shadow-card backdrop-blur-sm transition-colors hover:border-gold/40 hover:bg-white/90 hover:shadow-glow"
      aria-label={`Open ${store.name} in Google Maps`}
    >
      <span className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-coral-light via-coral to-coral-deep text-white">
          <MapPin size={18} aria-hidden="true" />
        </span>
        <span className="min-w-0">
          <span className="block truncate font-medium text-maroon">
            {store.name}
          </span>
          <span className="block truncate text-xs text-maroon/55">
            {store.area}
          </span>
        </span>
      </span>

      <span className="mt-3 inline-flex items-center gap-1.5 self-start rounded-full bg-cream px-3 py-1.5 text-xs font-medium text-coral-deep transition-colors group-hover:bg-gold/10">
        <Navigation size={13} aria-hidden="true" />
        Open in Google Maps
      </span>
    </motion.a>
  );
}
