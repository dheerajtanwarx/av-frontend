import { Phone, Mail, Globe, MapPin, type LucideProps } from "lucide-react";
import type { IconKey } from "../lib/links";

/**
 * Brand/social glyphs are inlined here as lightweight SVGs rather than pulled
 * from lucide-react. Recent lucide versions (this project is on v1.x) removed
 * the social-brand icons, and the rest of the storefront already keeps brand
 * marks custom by design. The Instagram / Facebook / YouTube paths below are
 * the exact lucide artwork (v0.469) the original AV-Links page used, so they
 * render pixel-identically while carrying no extra dependency. Threads and
 * WhatsApp have always been custom (never in lucide). Functional icons
 * (Phone / Mail / Globe / MapPin) still come from lucide.
 */

/** Shared wrapper matching lucide's default stroke-icon attributes. */
function StrokeGlyph({
  size = 24,
  strokeWidth = 2,
  children,
  ...rest
}: LucideProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

/** Instagram — exact lucide v0.469 artwork. */
function InstagramIcon(props: LucideProps) {
  return (
    <StrokeGlyph {...props}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </StrokeGlyph>
  );
}

/** Facebook — exact lucide v0.469 artwork. */
function FacebookIcon(props: LucideProps) {
  return (
    <StrokeGlyph {...props}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </StrokeGlyph>
  );
}

/** YouTube — exact lucide v0.469 artwork. */
function YoutubeIcon(props: LucideProps) {
  return (
    <StrokeGlyph {...props}>
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </StrokeGlyph>
  );
}

/** Threads — not in lucide, so a lightweight inline brand glyph. */
function ThreadsIcon(props: LucideProps) {
  const { size = 24, strokeWidth = 2, ...rest } = props;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      <path d="M12 21c-4.5 0-8-3.2-8-9s3.4-9 8-9c3.6 0 6.2 1.9 7 5" />
      <path d="M9.5 13.2c.6 1.6 2.2 2.4 3.7 2.1 1.6-.3 2.6-1.6 2.4-3.1-.2-1.5-1.7-2.4-3.6-2.1-2.3.4-3.4 1.8-3 3.5.4 1.9 2.4 2.9 4.6 2.5 2.5-.5 4-2.6 3.7-5.4" />
    </svg>
  );
}

/** WhatsApp — not in lucide, inline brand glyph. */
function WhatsAppIcon(props: LucideProps) {
  const { size = 24, ...rest } = props;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...rest}
    >
      <path d="M12.04 2c-5.46 0-9.9 4.43-9.9 9.9 0 1.74.46 3.45 1.32 4.95L2 22l5.3-1.39a9.9 9.9 0 0 0 4.73 1.2h.01c5.46 0 9.9-4.43 9.9-9.9 0-2.64-1.03-5.13-2.9-7C17.18 3.03 14.69 2 12.04 2Zm0 18.02h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.1.81.83-3.02-.2-.31a8.13 8.13 0 0 1-1.25-4.37c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.23-8.23 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.8-.79.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.42l-.48-.01c-.16 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.16 1.75 2.67 4.23 3.74.59.26 1.05.4 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.14-1.18-.06-.1-.22-.16-.47-.28Z" />
    </svg>
  );
}

const map: Record<IconKey, React.ComponentType<LucideProps>> = {
  instagram: InstagramIcon,
  threads: ThreadsIcon,
  facebook: FacebookIcon,
  youtube: YoutubeIcon,
  whatsapp: WhatsAppIcon,
  phone: Phone,
  email: Mail,
  website: Globe,
  maps: MapPin,
};

export function Icon({ name, ...props }: { name: IconKey } & LucideProps) {
  const Cmp = map[name];
  return <Cmp aria-hidden="true" {...props} />;
}
