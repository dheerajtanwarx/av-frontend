import AdminLayout from "../components/admin/AdminLayout";

/* Shared layout for every /admin/* route. Persists across admin navigations,
   so the sidebar and the auth check don't re-run when moving between pages. */
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}
