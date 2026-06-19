"use client";

/* Count-up number: animates 0 → value the first time it scrolls into view,
   then previous → new value on every live data update (so a real-time refetch
   ticks the KPI up from where it was, not from zero). `motion`'s
   frame-accurate `animate()` + an Intersection observer (`useInView`).
   Honours prefers-reduced-motion. */

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
  // Where the last animation landed — live updates count up from here.
  const fromRef = useRef(0);

  useEffect(() => {
    if (!inView) return;
    const from = fromRef.current;
    fromRef.current = value;
    // Reduced motion → duration 0 still snaps to the value via onUpdate,
    // keeping the (async) setState out of the effect body.
    const controls = animate(from, value, {
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
