"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import AdminGuard from "../auth/AdminGuard";
import AdminSidebar from "./AdminSidebar";
import AdminProfileMenu from "./AdminProfileMenu";
import { MenuIcon } from "./icons";
import { activeNavItem } from "./nav";

/* The admin shell: sidebar + topbar + scrollable content. Used by
   app/admin/layout.tsx so every /admin/* page shares it. AdminGuard wraps the
   whole thing, so the chrome only renders for a signed-in ADMIN; everyone else
   is redirected (login / home) before any of this paints. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const title = activeNavItem(pathname)?.label ?? "Admin";

  return (
    <AdminGuard>
      {(user) => (
        <div className="admin-shell">
          <AdminSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

          {mobileOpen && (
            <div
              className="admin-overlay"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
          )}

          <div className="admin-body">
            <header className="admin-topbar">
              <button
                className="admin-menu-btn"
                aria-label="Open menu"
                onClick={() => setMobileOpen(true)}
              >
                <MenuIcon />
              </button>
              <h1 className="admin-topbar-title">{title}</h1>
              <div className="admin-topbar-spacer" />
              <AdminProfileMenu user={user} />
            </header>

            <main className="admin-main">{children}</main>
          </div>
        </div>
      )}
    </AdminGuard>
  );
}
