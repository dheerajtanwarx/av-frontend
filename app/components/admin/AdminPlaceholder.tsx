/* Shared placeholder body for admin sections that aren't built yet.
   Pure UI — no data, no API calls. */
export default function AdminPlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="admin-page">
      <header className="admin-page-head">
        <h2>{title}</h2>
        <p>{description}</p>
      </header>

      <div className="admin-placeholder">
        <span className="admin-placeholder-badge">Coming soon</span>
        <p>
          This section is part of the admin panel shell. The interface and data
          for it haven&apos;t been wired up yet.
        </p>
      </div>
    </section>
  );
}
