"use client";

import { useEffect, useState } from "react";
import Header from "../components/landing/Header";
import { getSession, logout, type SessionUser } from "../lib/api";

function display(value: string | undefined, fallback = "Not added") {
  return value?.trim() ? value : fallback;
}

function initials(user: SessionUser) {
  const source = user.name || user.email || user.phone || "AV";
  return source
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

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

  const joined = user?.createdAt
    ? new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(new Date(user.createdAt))
    : "Not available";

  async function handleLogout() {
    await logout().catch(() => null);
    window.location.href = "/login";
  }

  if (loading) {
    return (
      <main className="av profile-page">
        <Header />
        <section className="profile-shell">
          <div className="profile-loading">Loading your profile...</div>
        </section>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="av profile-page">
        <Header />
        <section className="profile-shell">
          <div className="profile-empty">
            <h1>Sign in to view your profile</h1>
            <p>Your account details, saved contact information and order activity appear here.</p>
            <a href="/login">Log in</a>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="av profile-page">
      <Header />
      <section className="profile-shell">
        <div className="profile-hero">
          <div className="profile-avatar">{initials(user)}</div>
          <div>
            <p className="profile-kicker">My Profile</p>
            <h1>{display(user.name, "AV Creation Customer")}</h1>
            <p>{display(user.email || user.phone, "Account details")}</p>
          </div>
          <button onClick={handleLogout}>Log out</button>
        </div>

        <div className="profile-grid">
          <section className="profile-panel">
            <div className="profile-panel-head">
              <span>Personal details</span>
            </div>
            <dl className="profile-details">
              <div>
                <dt>Full name</dt>
                <dd>{display(user.name)}</dd>
              </div>
              <div>
                <dt>Email ID</dt>
                <dd>{display(user.email)}</dd>
              </div>
              <div>
                <dt>Phone number</dt>
                <dd>{display(user.phone)}</dd>
              </div>
              <div>
                <dt>Customer ID</dt>
                <dd>#{user.id}</dd>
              </div>
            </dl>
          </section>

          <section className="profile-panel">
            <div className="profile-panel-head">
              <span>Account summary</span>
            </div>
            <dl className="profile-details">
              <div>
                <dt>Signed in with</dt>
                <dd>{user.providers?.length ? user.providers.join(", ") : "Phone OTP"}</dd>
              </div>
              <div>
                <dt>Member since</dt>
                <dd>{joined}</dd>
              </div>
              <div>
                <dt>Account type</dt>
                <dd>{display(user.role)}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>Active</dd>
              </div>
            </dl>
          </section>
        </div>
      </section>
    </main>
  );
}
