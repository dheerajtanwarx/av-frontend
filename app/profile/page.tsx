"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  MapPin,
  Settings,
  Heart,
  LayoutDashboard,
  LogOut,
  Pencil,
  ChevronRight,
} from "lucide-react";
import Header from "../components/landing/Header";
import { ProfileSkeleton } from "../components/skeletons";
import { getSession, logout, type SessionUser } from "../lib/api";

function display(value: string | undefined, fallback = "Not added") {
  return value?.trim() ? value : fallback;
}

/** Up-to-two-letter monogram for the avatar, from name → email → "AV". */
function initials(user: SessionUser): string {
  const source = (user.name || user.email || "AV").trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

type NavItem = {
  href: string;
  label: string;
  hint: string;
  icon: React.ReactNode;
  admin?: boolean;
};

const NAV: NavItem[] = [
  {
    href: "/my-orders",
    label: "My Orders",
    hint: "Track, return or buy again",
    icon: <ShoppingBag size={20} strokeWidth={1.7} aria-hidden="true" />,
  },
  {
    href: "/profile/addresses",
    label: "Addresses",
    hint: "Manage delivery addresses",
    icon: <MapPin size={20} strokeWidth={1.7} aria-hidden="true" />,
  },
  {
    href: "/profile/settings",
    label: "Settings",
    hint: "Account details & preferences",
    icon: <Settings size={20} strokeWidth={1.7} aria-hidden="true" />,
  },
  {
    href: "/wishlist",
    label: "Wishlist",
    hint: "Pieces you’ve saved",
    icon: <Heart size={20} strokeWidth={1.7} aria-hidden="true" />,
  },
  {
    href: "/admin/dashboard",
    label: "Admin Dashboard",
    hint: "Manage the store",
    icon: <LayoutDashboard size={20} strokeWidth={1.7} aria-hidden="true" />,
    admin: true,
  },
];

export default function ProfilePage() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    getSession().then((session) => {
      if (!alive) return;
      setUser(session);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, []);

  async function handleLogout() {
    await logout().catch(() => null);
    window.location.href = "/login";
  }

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!user) {
    return (
      <main className="av profile-page av-profile av-account">
        <Header />
        <section className="profile-shell">
          <div className="profile-empty">
            <h1>Sign in to view your account</h1>
            <p>Your profile, orders, addresses and saved pieces all live here.</p>
            <a href="/login">Log in</a>
          </div>
        </section>
      </main>
    );
  }

  const items = NAV.filter((item) => !item.admin || user.role === "ADMIN");

  return (
    <main className="av profile-page av-profile av-account">
      <Header />
      <section className="profile-shell">
        {/* Identity card — avatar, name, email, edit shortcut */}
        <header className="account-card">
          <div className="account-avatar" aria-hidden="true">
            {initials(user)}
          </div>
          <div className="account-id">
            <h1>{display(user.name, "AV Creation Customer")}</h1>
            <p>{display(user.email || user.phone, "Account details")}</p>
          </div>
          <Link className="account-edit" href="/profile/edit">
            <Pencil size={15} strokeWidth={1.8} aria-hidden="true" />
            <span>Edit Profile</span>
          </Link>
        </header>

        {/* Card-based account navigation */}
        <nav className="account-nav" aria-label="Account">
          {items.map((item) => (
            <Link
              key={item.href}
              className={`account-row${item.admin ? " is-admin" : ""}`}
              href={item.href}
            >
              <span className="account-row-ic">{item.icon}</span>
              <span className="account-row-text">
                <span className="account-row-label">{item.label}</span>
                <span className="account-row-hint">{item.hint}</span>
              </span>
              <ChevronRight size={18} strokeWidth={1.7} aria-hidden="true" className="account-row-chev" />
            </Link>
          ))}
        </nav>

        {/* Logout — standalone, at the bottom */}
        <button type="button" className="account-logout" onClick={handleLogout}>
          <LogOut size={18} strokeWidth={1.8} aria-hidden="true" />
          <span>Log out</span>
        </button>
      </section>
    </main>
  );
}
