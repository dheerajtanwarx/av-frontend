"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";
import AccountSubShell from "../../components/profile/AccountSubShell";
import { type SessionUser } from "../../lib/api";

function display(value: string | undefined, fallback = "Not available") {
  return value?.trim() ? value : fallback;
}

function memberSince(user: SessionUser): string {
  if (!user.createdAt) return "Not available";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(user.createdAt));
}

export default function SettingsPage() {
  return (
    <AccountSubShell title="Settings" subtitle="Your account details and sign-in info">
      {(user) => (
        <>
          <section className="profile-panel">
            <div className="profile-panel-head">
              <span>Account summary</span>
              <Link className="profile-edit-btn" href="/profile/edit">
                <Pencil size={13} strokeWidth={1.8} aria-hidden="true" /> Edit profile
              </Link>
            </div>
            <dl className="profile-details">
              <div>
                <dt>Signed in with</dt>
                <dd>{user.providers?.length ? user.providers.join(", ") : "Phone OTP"}</dd>
              </div>
              <div>
                <dt>Member since</dt>
                <dd>{memberSince(user)}</dd>
              </div>
              <div>
                <dt>Account type</dt>
                <dd>{display(user.role, "Customer")}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>Active</dd>
              </div>
            </dl>
          </section>
        </>
      )}
    </AccountSubShell>
  );
}
