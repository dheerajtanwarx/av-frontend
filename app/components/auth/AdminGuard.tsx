"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, type SessionUser } from "../../lib/api";

/* ============================================================
   AdminGuard — client-side gate for the /admin area.
   ------------------------------------------------------------
   Wrap any admin page's content in <AdminGuard>. On every mount
   it re-checks the session against the backend (GET /api/auth/me
   reads the httpOnly av_token cookie), so the gate re-runs after
   a page refresh, browser reload, or logout/login — there is no
   client-cached "I'm an admin" flag to go stale.

   Redirect policy (matches the rest of the app):
     • Not signed in  → /login?next=<current path>  (full redirect
       so the cross-origin Google OAuth flow can honour `next`).
     • Signed in, not ADMIN → /  (router.replace, no history entry,
       so Back doesn't bounce them straight back here).
     • ADMIN          → render children.

   The authenticated admin user is passed to a render-prop child so
   pages can show "signed in as …" without re-fetching the session.
   ============================================================ */

type AdminGuardProps = {
  children: React.ReactNode | ((user: SessionUser) => React.ReactNode);
};

type GuardState =
  | { status: "checking" }
  | { status: "authorized"; user: SessionUser };

export default function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const [state, setState] = useState<GuardState>({ status: "checking" });

  useEffect(() => {
    let active = true;

    getSession().then((user) => {
      if (!active) return;

      if (!user) {
        const next = `${window.location.pathname}${window.location.search}${window.location.hash}`;
        window.location.href = `/login?next=${encodeURIComponent(next)}`;
        return;
      }

      if (user.role !== "ADMIN") {
        router.replace("/");
        return;
      }

      setState({ status: "authorized", user });
    });

    return () => {
      active = false;
    };
  }, [router]);

  if (state.status === "checking") {
    return (
      <main className="admin" aria-busy="true">
        <div className="admin-wrap">
          <p className="admin-note">Checking access…</p>
        </div>
      </main>
    );
  }

  return (
    <>{typeof children === "function" ? children(state.user) : children}</>
  );
}
