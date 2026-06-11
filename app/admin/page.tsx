import { redirect } from "next/navigation";

/* /admin has no page of its own — send it to the dashboard. The admin layout
   (and its auth guard) still wraps this, so non-admins are redirected first. */
export default function AdminIndexPage() {
  redirect("/admin/dashboard");
}
