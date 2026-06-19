/**
 * Provider-agnostic analytics wrapper.
 *
 * Call `trackEvent("link_click", { label: "Instagram" })` from anywhere.
 * It auto-detects whichever provider is loaded on the page and no-ops
 * safely when none is configured — so the site always works.
 *
 * To enable a provider, set the relevant env var (see .env.example) and,
 * if needed, add its script in app/layout.tsx. No component code changes.
 */

type EventProps = Record<string, string | number | boolean | undefined>;

interface GtagWindow {
  gtag?: (command: string, eventName: string, params?: EventProps) => void;
  plausible?: (eventName: string, options?: { props?: EventProps }) => void;
  umami?: {
    track?: (eventName: string, data?: EventProps) => void;
  };
  va?: (event: "event", props: { name: string } & EventProps) => void;
}

export function trackEvent(name: string, props: EventProps = {}): void {
  if (typeof window === "undefined") return;

  const w = window as unknown as GtagWindow;

  try {
    // Google Analytics 4
    if (typeof w.gtag === "function") {
      w.gtag("event", name, props);
    }
    // Plausible
    if (typeof w.plausible === "function") {
      w.plausible(name, { props });
    }
    // Umami
    if (w.umami?.track) {
      w.umami.track(name, props);
    }
    // Vercel Analytics (custom events)
    if (typeof w.va === "function") {
      w.va("event", { name, ...props });
    }
  } catch {
    // Never let analytics break the UX.
  }
}

/** Convenience helper for outbound link/button clicks. */
export function trackLinkClick(label: string, href?: string): void {
  trackEvent("link_click", { label, href });
}
