/**
 * Server component that emits a JSON-LD <script> for structured data
 * (schema.org). Render it anywhere in a server tree — Organization on the
 * layout, Product/BreadcrumbList on the PDP, etc. Accepts a single object or
 * an array of objects (emitted as one script each).
 *
 * Mirrors the existing pattern in app/(links)/social-links/page.tsx.
 */
export default function JsonLd({
  data,
}: {
  data: Record<string, unknown> | Record<string, unknown>[];
}) {
  const items = Array.isArray(data) ? data : [data];
  return (
    <>
      {items.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
}
