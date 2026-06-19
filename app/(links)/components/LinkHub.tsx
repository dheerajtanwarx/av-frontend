"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { Header } from "./Header";
import { LinkButton } from "./LinkButton";
import { StoreCard } from "./StoreCard";
import { QRCard } from "./QRCard";
import { business } from "../lib/business";
import { getPrimaryLinks } from "../lib/links";
import { LINKS_URL } from "../lib/site";

export function LinkHub() {
  const reduce = useReducedMotion();
  const links = getPrimaryLinks();

  const container: Variants = {
    hidden: {},
    show: {
      transition: { staggerChildren: reduce ? 0 : 0.05 },
    },
  };

  const item: Variants = reduce
    ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 14 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.3, ease: "easeOut" },
        },
      };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto flex w-full max-w-md flex-col gap-8 px-5 py-10 sm:py-14"
    >
      <motion.div variants={item}>
        <Header />
      </motion.div>

      {/* Primary links */}
      <nav aria-label="Our links" className="flex flex-col gap-3">
        {links.map((link) => (
          <motion.div key={link.key} variants={item}>
            <LinkButton item={link} />
          </motion.div>
        ))}
      </nav>

      {/* Our Stores */}
      <motion.section variants={item} aria-labelledby="stores-heading">
        <h2
          id="stores-heading"
          className="mb-1 text-center font-serif text-xl font-semibold text-maroon"
        >
          Our Stores
        </h2>
        <p className="mb-4 text-center text-sm text-maroon/55">
          Visit us across Jaipur
        </p>
        <div className="flex flex-col gap-3">
          {business.stores.map((store) => (
            <StoreCard key={store.name} store={store} />
          ))}
        </div>
      </motion.section>

      {/* QR code */}
      <motion.div variants={item}>
        <QRCard url={LINKS_URL} />
      </motion.div>

      {/* Footer */}
      <motion.footer
        variants={item}
        className="pt-2 text-center text-xs text-maroon/45"
      >
        <p className="font-script text-base text-coral-deep/80">
          {business.tagline}
        </p>
        <p className="mt-1">
          © {new Date().getFullYear()} {business.name}. All rights reserved.
        </p>
      </motion.footer>
    </motion.div>
  );
}
