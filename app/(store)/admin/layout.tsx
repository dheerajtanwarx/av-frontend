import AdminLayout from "../components/admin/AdminLayout";

// Admin-only CSS, route-scoped here instead of globals.css so the ~3k lines of
// admin styling are not shipped to storefront shoppers. Keep this order
// (shell first, then page styles) to preserve the original cascade.
import "../styles/admin-layout.css";
import "../styles/admin.css";

/* Shared layout for every /admin/* route. Persists across admin navigations,
   so the sidebar and the auth check don't re-run when moving between pages. */
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}
