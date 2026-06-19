"use client";

import { usePathname } from "next/navigation";
import { ADMIN_NAV, activeNavItem } from "./nav";
import { CloseIcon } from "./icons";

/* Sidebar navigation. Active link is derived from the current pathname, so it
   stays correct after refresh, deep-link, or back/forward. On mobile the same
   markup slides in as an off-canvas drawer (controlled by `open`). */
export default function AdminSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const active = activeNavItem(pathname);

  return (
    <aside className={`admin-sidebar${open ? " open" : ""}`}>
      <div className="admin-sidebar-head">
        <a href="/admin/dashboard" className="admin-brand">
          <span className="admin-brand-mark">AV CREATION</span>
          <span className="admin-brand-sub">Admin Panel</span>
        </a>
        <button
          className="admin-sidebar-close"
          aria-label="Close menu"
          onClick={onClose}
        >
          <CloseIcon />
        </button>
      </div>

      <nav className="admin-nav" aria-label="Admin">
        {ADMIN_NAV.map((item) => {
          const Icon = item.icon;
          const isActive = active?.href === item.href;
          return (
            <a
              key={item.href}
              href={item.href}
              className={`admin-nav-link${isActive ? " active" : ""}`}
              aria-current={isActive ? "page" : undefined}
              onClick={onClose}
            >
              <Icon className="admin-nav-icon" />
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
