"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import Header from "../landing/Header";
import { AccountFormSkeleton } from "../skeletons";
import { getSession, type SessionUser } from "../../lib/api";

/**
 * Shared chrome for the dedicated account sub-screens (Edit profile, Addresses,
 * Settings). Handles the session fetch + loading / signed-out states once, then
 * hands the resolved user to its children so each screen only describes its own
 * content. Keeps the editorial profile scope (`av-profile`) so the redesign
 * tokens apply.
 */
export default function AccountSubShell({
  title,
  subtitle,
  children,
  skeleton,
}: {
  title: string;
  subtitle?: string;
  children: (user: SessionUser, setUser: (u: SessionUser) => void) => React.ReactNode;
  /** Body skeleton shown while the session resolves. Defaults to a form panel. */
  skeleton?: React.ReactNode;
}) {
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

  return (
    <main className="av profile-page av-profile av-account">
      <Header />
      <section className="profile-shell">
        {!loading && !user ? (
          <div className="profile-empty">
            <h1>Sign in to continue</h1>
            <p>This section is only available when you’re signed in.</p>
            <a href="/login">Log in</a>
          </div>
        ) : (
          <>
            {/* The heading is static, so it renders immediately — only the
                data-driven body falls back to a skeleton while loading. */}
            <div className="account-subhead">
              <Link className="account-back" href="/profile" aria-label="Back to account">
                <ChevronLeft size={20} strokeWidth={1.8} aria-hidden="true" />
              </Link>
              <div>
                <h1>{title}</h1>
                {subtitle && <p>{subtitle}</p>}
              </div>
            </div>
            {loading || !user
              ? skeleton ?? <AccountFormSkeleton />
              : children(user, setUser)}
          </>
        )}
      </section>
    </main>
  );
}
