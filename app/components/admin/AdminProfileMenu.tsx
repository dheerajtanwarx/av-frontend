"use client";

import { useEffect, useRef, useState } from "react";
import { logout, type SessionUser } from "../../lib/api";
import { ChevronIcon, LogoutIcon } from "./icons";

function initials(user: SessionUser): string {
  const source = user.name || user.email || user.phone || "AV";
  return source
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function displayName(user: SessionUser): string {
  return (user.name || user.email || user.phone || "Admin").trim();
}

/* Admin profile dropdown: avatar + name button, opens a menu with the signed-in
   identity, a link back to the storefront, and a logout button. Closes on
   outside-click (same pattern as the storefront AccountMenu). */
export default function AdminProfileMenu({ user }: { user: SessionUser }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  async function handleLogout() {
    try {
      await logout();
    } finally {
      // Full reload so AdminGuard re-checks and redirects to /login.
      window.location.href = "/login";
    }
  }

  return (
    <div className="admin-profile" ref={ref}>
      <button
        className="admin-profile-btn"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="admin-avatar">{initials(user)}</span>
        <span className="admin-profile-name">{displayName(user)}</span>
        <ChevronIcon className="admin-profile-chevron" />
      </button>

      {open && (
        <div className="admin-profile-menu" role="menu">
          <div className="admin-profile-id">
            <span className="admin-profile-id-name">{displayName(user)}</span>
            {user.email && (
              <span className="admin-profile-id-email">{user.email}</span>
            )}
            <span className="admin-role-badge">Administrator</span>
          </div>
          <a className="admin-profile-item" href="/" role="menuitem">
            View storefront
          </a>
          <button
            className="admin-profile-item admin-logout"
            onClick={handleLogout}
            role="menuitem"
          >
            <LogoutIcon className="admin-nav-icon" />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
