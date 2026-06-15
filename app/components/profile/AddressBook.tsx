"use client";

import { useEffect, useState } from "react";
import {
  fetchAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  ApiError,
  type Address,
  type AddressInput,
} from "../../lib/api";
import { AddressBookSkeleton } from "../skeletons";

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

/**
 * Saved-address manager (list / add / edit / delete / set-default). Lifted out
 * of the old monolithic profile page so the dedicated /profile/addresses screen
 * can own it. Behaviour is unchanged.
 */
export default function AddressBook() {
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
        <AddressBookSkeleton />
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
