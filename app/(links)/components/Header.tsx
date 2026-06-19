import Image from "next/image";
import { business } from "../lib/business";
import { AnimatedStitch } from "./AnimatedStitch";

export function Header() {
  return (
    <header className="flex flex-col items-center text-center">
      {/* Accessible/SEO heading — the logo carries the visible branding,
          so the name + tagline live here for screen readers and search. */}
      <h1 className="sr-only">
        {business.name} — {business.tagline}
      </h1>

      {/* Logo — transparent PNG, shown directly on the background.
          (Intrinsic aspect ~2.58:1.) */}
      <div className="relative mb-6 inline-block">
        <Image
          src={business.logo}
          alt={`${business.name} logo`}
          width={640}
          height={248}
          priority
          sizes="(max-width: 640px) 280px, 320px"
          className="h-auto w-[280px] sm:w-[320px]"
        />
        <span
          aria-hidden="true"
          className="absolute -right-3 top-0 text-[10px] font-medium text-maroon/60 sm:-right-4 sm:text-xs"
        >
          TM
        </span>
      </div>

      <AnimatedStitch className="mb-5 w-full" />

      {/* Description */}
      <p className="max-w-md text-pretty text-[15px] leading-relaxed text-maroon/70">
        {business.description}
      </p>
    </header>
  );
}
