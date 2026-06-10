"use client";

import { useEffect, useState } from "react";
import Header from "../components/landing/Header";
import {
  getSession,
  logout,
  updateProfile,
  fetchAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  ApiError,
  type SessionUser,
  type Address,
  type AddressInput,
} from "../lib/api";

const STATES = [
  "Rajasthan",
  "Delhi",
  "Maharashtra",
  "Karnataka",
  "Gujarat",
  "West Bengal",
  "Tamil Nadu",
  "Uttar Pradesh",
];

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

/** Strip a stored +91XXXXXXXXXX down to the 10 local digits for editing. */
function localPhone(phone: string | undefined): string {
  if (!phone) return "";
  return phone.replace(/\D/g, "").replace(/^91/, "").slice(-10);
}

/* ───────────────────────── Personal details ───────────────────────── */

function PersonalDetails({
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

/* ───────────────────────── Address book ───────────────────────── */

const EMPTY_ADDRESS: AddressInput = {
  fullName: "",
  phone: "",
  street: "",
  city: "",
  state: "",
  pincode: "",
  isDefault: false,
};

function AddressForm({
  initial,
  onSubmit,
  onCancel,
  busy,
  error,
}: {
  initial: AddressInput;
  onSubmit: (data: AddressInput) => void;
  onCancel: () => void;
  busy: boolean;
  error: string | null;
}) {
  const [form, setForm] = useState<AddressInput>(initial);
  const set =
    (k: keyof AddressInput) => (e: { target: { value: string } }) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <form className="address-form" onSubmit={submit}>
      <div className="address-form-grid">
        <label className="profile-field">
          <span>Full name</span>
          <input value={form.fullName} onChange={set("fullName")} placeholder="Ananya Rathore" required />
        </label>
        <label className="profile-field">
          <span>Phone</span>
          <input value={form.phone} onChange={set("phone")} placeholder="98765 43210" required />
        </label>
        <label className="profile-field address-full">
          <span>Street address</span>
          <input value={form.street} onChange={set("street")} placeholder="House / flat, street, area" required />
        </label>
        <label className="profile-field">
          <span>City</span>
          <input value={form.city} onChange={set("city")} placeholder="Jaipur" required />
        </label>
        <label className="profile-field">
          <span>PIN code</span>
          <input value={form.pincode} onChange={set("pincode")} placeholder="302001" required />
        </label>
        <label className="profile-field address-full">
          <span>State</span>
          <select value={form.state} onChange={set("state")} required>
            <option value="">Select state</option>
            {STATES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="address-default-check">
        <input
          type="checkbox"
          checked={!!form.isDefault}
          onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
        />
        <span>Set as default address</span>
      </label>
      {error && <div className="profile-form-error">{error}</div>}
      <div className="profile-form-actions">
        <button type="submit" className="profile-save" disabled={busy}>
          {busy ? "Saving…" : "Save address"}
        </button>
        <button type="button" className="profile-cancel" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function AddressBook() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"idle" | "add" | number>("idle"); // number = editing that id
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetchAddresses()
      .then((data) => alive && setAddresses(data))
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  async function refresh() {
    const data = await fetchAddresses().catch(() => null);
    if (data) setAddresses(data);
  }

  async function handleCreate(data: AddressInput) {
    setBusy(true);
    setError(null);
    try {
      await createAddress(data);
      await refresh();
      setMode("idle");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn’t save the address.");
    } finally {
      setBusy(false);
    }
  }

  async function handleUpdate(id: number, data: AddressInput) {
    setBusy(true);
    setError(null);
    try {
      await updateAddress(id, data);
      await refresh();
      setMode("idle");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn’t update the address.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Remove this address?")) return;
    try {
      await deleteAddress(id);
      await refresh();
    } catch {
      /* ignore */
    }
  }

  async function makeDefault(addr: Address) {
    try {
      await updateAddress(addr.id, { isDefault: true });
      await refresh();
    } catch {
      /* ignore */
    }
  }

  return (
    <section className="profile-panel address-book">
      <div className="profile-panel-head">
        <span>Address book</span>
        {mode === "idle" && (
          <button
            className="profile-edit-btn"
            onClick={() => {
              setError(null);
              setMode("add");
            }}
          >
            + Add address
          </button>
        )}
      </div>

      {mode === "add" && (
        <AddressForm
          initial={EMPTY_ADDRESS}
          onSubmit={handleCreate}
          onCancel={() => setMode("idle")}
          busy={busy}
          error={error}
        />
      )}

      {loading ? (
        <p className="address-empty">Loading your saved addresses…</p>
      ) : addresses.length === 0 && mode !== "add" ? (
        <p className="address-empty">No saved addresses yet. Add one for faster checkout.</p>
      ) : (
        <div className="address-grid">
          {addresses.map((addr) =>
            mode === addr.id ? (
              <AddressForm
                key={addr.id}
                initial={{
                  fullName: addr.fullName,
                  phone: addr.phone,
                  street: addr.street,
                  city: addr.city,
                  state: addr.state,
                  pincode: addr.pincode,
                  country: addr.country,
                  isDefault: addr.isDefault,
                }}
                onSubmit={(data) => handleUpdate(addr.id, data)}
                onCancel={() => setMode("idle")}
                busy={busy}
                error={error}
              />
            ) : (
              <div className={`address-card${addr.isDefault ? " is-default" : ""}`} key={addr.id}>
                {addr.isDefault && <span className="address-default-badge">Default</span>}
                <div className="address-card-name">{addr.fullName}</div>
                <div className="address-card-lines">
                  {addr.street}
                  <br />
                  {addr.city}, {addr.state} — {addr.pincode}
                </div>
                <div className="address-card-phone">{addr.phone}</div>
                <div className="address-actions">
                  <button
                    onClick={() => {
                      setError(null);
                      setMode(addr.id);
                    }}
                  >
                    Edit
                  </button>
                  {!addr.isDefault && <button onClick={() => makeDefault(addr)}>Set default</button>}
                  <button className="address-delete" onClick={() => handleDelete(addr.id)}>
                    Remove
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </section>
  );
}

/* ───────────────────────── Page ───────────────────────── */

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
          <PersonalDetails user={user} onSaved={setUser} />

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

        <AddressBook />
      </section>
    </main>
  );
}
