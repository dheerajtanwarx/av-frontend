"use client";

/* Count-up number that animates from 0 → value the first time it scrolls into
   view. Drives a premium "numbers come alive" feel on KPIs without pulling in a
   charting lib — just `motion`'s frame-accurate `animate()` + an Intersection
   observer (`useInView`). Honours prefers-reduced-motion. */

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";

export function AnimatedNumber({
  value,
  format = (n) => String(Math.round(n)),
  className,
  duration = 1.3,
  delay = 0,
}: {
  value: number;
  format?: (n: number) => string;
  className?: string;
  duration?: number;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    // Reduced motion → duration 0 still snaps to the value via onUpdate,
    // keeping the (async) setState out of the effect body.
    const controls = animate(0, value, {
      duration: reduce ? 0 : duration,
      delay: reduce ? 0 : delay,
      ease: [0.16, 1, 0.3, 1], // easeOutExpo-ish — fast start, gentle settle
      onUpdate: setDisplay,
    });
    return () => controls.stop();
  }, [inView, value, duration, delay, reduce]);

  return (
    <span ref={ref} className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {format(display)}
    </span>
  );
}
