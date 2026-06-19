"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * A decorative "running stitch" that sews itself in on load — a nod to the
 * brand line "Culture In Every Stitch". The dashed thread is revealed
 * left→right via an animated clip rect, so the stitches appear one by one,
 * then a small knot/bud pops at the end. Fully shown (no motion) when the
 * user prefers reduced motion.
 */
export function AnimatedStitch({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();
  const W = 220;
  const H = 24;
  const cy = H / 2;
  const knotX = W - 18;
  const duration = 1.1;
  const delay = 0.35;

  return (
    <div className={className} aria-hidden="true">
      <svg
        width="100%"
        height="20"
        viewBox={`0 0 ${W} ${H}`}
        fill="none"
        className="mx-auto max-w-[240px]"
      >
        <defs>
          <clipPath id="stitch-reveal">
            <motion.rect
              x="0"
              y="0"
              height={H}
              initial={{ width: reduce ? W : 0 }}
              animate={{ width: W }}
              transition={{
                duration: reduce ? 0 : duration,
                ease: "easeInOut",
                delay: reduce ? 0 : delay,
              }}
            />
          </clipPath>
        </defs>

        {/* the stitched thread (gentle double wave) */}
        <g clipPath="url(#stitch-reveal)">
          <path
            d={`M8 ${cy} Q ${W * 0.3} 5 ${W * 0.5} ${cy} T ${knotX} ${cy}`}
            stroke="#DD2A6B"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeDasharray="2.5 6"
          />
        </g>

        {/* end knot / bud */}
        <motion.g
          initial={{ opacity: reduce ? 1 : 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.3,
            delay: reduce ? 0 : delay + duration - 0.1,
          }}
        >
          <circle cx={knotX} cy={cy} r="3.4" fill="#DD2A6B" />
          <circle cx={knotX} cy={cy} r="1.3" fill="#D8B96A" />
        </motion.g>
      </svg>
    </div>
  );
}
