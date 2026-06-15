"use client";

import { useState } from "react";
import { updateProfile, ApiError, type SessionUser } from "../../lib/api";

function display(value: string | undefined, fallback = "Not added") {
  return value?.trim() ? value : fallback;
}

/** Strip a stored +91XXXXXXXXXX down to the 10 local digits for editing. */
function localPhone(phone: string | undefined): string {
  if (!phone) return "";
  return phone.replace(/\D/g, "").replace(/^91/, "").slice(-10);
}

/**
 * Editable personal-details panel (name + phone; email is read-only). Lifted
 * out of the old monolithic profile page so the dedicated /profile/edit screen
 * can own it. Behaviour is unchanged.
 */
export default function PersonalDetails({
  user,
  onSaved,
}: {
  user: SessionUser;
  onSaved: (u: SessionUser) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name ?? "");
  const [phone, setPhone] = useState(localPhone(user.phone));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startEdit() {
    setName(user.name ?? "");
    setPhone(localPhone(user.phone));
    setError(null);
    setEditing(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (phone && !/^[6-9]\d{9}$/.test(phone)) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const updated = await updateProfile({
        name: name.trim(),
        phone: phone || undefined,
      });
      onSaved(updated);
      setEditing(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn’t save your changes.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="profile-panel">
      <div className="profile-panel-head">
        <span>Personal details</span>
        {!editing && (
          <button className="profile-edit-btn" onClick={startEdit}>
            Edit
          </button>
        )}
      </div>

      {editing ? (
        <form className="profile-form" onSubmit={save}>
          <label className="profile-field">
            <span>Full name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
            />
          </label>
          <label className="profile-field">
            <span>Email ID</span>
            <input value={user.email || "—"} disabled title="Email is linked to your sign-in and can’t be changed here" />
          </label>
          <label className="profile-field">
            <span>Phone number</span>
            <div className="profile-phone">
              <span className="profile-cc">+91</span>
              <input
                inputMode="numeric"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="98765 43210"
                autoComplete="tel-national"
              />
            </div>
          </label>
          {error && <div className="profile-form-error">{error}</div>}
          <div className="profile-form-actions">
            <button type="submit" className="profile-save" disabled={busy}>
              {busy ? "Saving…" : "Save changes"}
            </button>
            <button
              type="button"
              className="profile-cancel"
              onClick={() => setEditing(false)}
              disabled={busy}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
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
      )}
    </section>
  );
}
