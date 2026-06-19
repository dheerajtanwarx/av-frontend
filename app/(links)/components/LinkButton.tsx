"use client";

import { motion, useReducedMotion } from "motion/react";
import { ChevronRight, Clock } from "lucide-react";
import { Icon } from "./Icon";
import type { LinkItem } from "../lib/links";
import { trackLinkClick } from "../lib/analytics";

export function LinkButton({ item }: { item: LinkItem }) {
  const reduce = useReducedMotion();
  const isComingSoon = item.href === null;

  const tap = reduce ? {} : { scale: 0.98 };
  const hover = reduce ? {} : { y: -2 };

  const chip = (
    <span
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} text-white shadow-sm`}
    >
      <Icon name={item.iconKey} size={22} strokeWidth={2} />
    </span>
  );

  const content = (
    <>
      {chip}
      <span className="flex min-w-0 flex-col text-left">
        <span className="truncate font-medium text-maroon">{item.label}</span>
        <span className="truncate text-xs text-maroon/55">
          {isComingSoon ? "Coming soon" : item.sublabel}
        </span>
      </span>
      <span className="ml-auto text-maroon/35">
        {isComingSoon ? (
          <Clock size={18} aria-hidden="true" />
        ) : (
          <ChevronRight size={20} aria-hidden="true" />
        )}
      </span>
    </>
  );

  const baseClass =
    "group flex w-full items-center gap-3.5 rounded-2xl border border-white/60 bg-white/70 px-4 py-3.5 shadow-card backdrop-blur-sm transition-colors";

  if (isComingSoon) {
    return (
      <div
        className={`${baseClass} cursor-not-allowed opacity-65`}
        aria-disabled="true"
        title={`${item.label} — coming soon`}
      >
        {content}
      </div>
    );
  }

  return (
    <motion.a
      href={item.href ?? undefined}
      target={item.external ? "_blank" : undefined}
      rel={item.external ? "noopener noreferrer" : undefined}
      onClick={() => trackLinkClick(item.label, item.href ?? undefined)}
      whileHover={hover}
      whileTap={tap}
      transition={{ type: "spring", stiffness: 400, damping: 26 }}
      className={`${baseClass} hover:border-gold/40 hover:bg-white/90 hover:shadow-glow`}
      aria-label={`${item.label} — ${item.sublabel}`}
    >
      {content}
    </motion.a>
  );
}
