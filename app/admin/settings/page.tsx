"use client";

import { useEffect, useState } from "react";
import {
  fetchAdminManualOrderConfig,
  updateManualOrderConfig,
  ApiError,
  type ManualOrderConfig,
} from "../../lib/api";
import { AdminPageSkeleton } from "../../components/skeletons";

type Field = {
  key: keyof ManualOrderConfig;
  label: string;
  hint: string;
  multiline?: boolean;
  placeholder?: string;
};

const FIELDS: Field[] = [
  {
    key: "whatsappNumber",
    label: "WhatsApp Business number",
    hint: "Country code + number, digits only (e.g. 916350695920). Used to build the customer’s wa.me link.",
    placeholder: "916350695920",
  },
  {
    key: "upiId",
    label: "UPI ID",
    hint: "Where customers pay after approval (PhonePe / Google Pay / Paytm).",
    placeholder: "avcreation@ybl",
  },
  {
    key: "upiName",
    label: "UPI display name",
    hint: "Shown next to the UPI ID in payment instructions.",
    placeholder: "AV Creation",
  },
  {
    key: "responseWindow",
    label: "Response window",
    hint: "The visible promise on the product page.",
    placeholder: "We respond within 2 hours, Mon–Sat 10am–7pm",
  },
  {
    key: "notice",
    label: "Product-page notice",
    hint: "The “not automatically reserved” message shown under the request button.",
    multiline: true,
  },
  {
    key: "confirmationNotice",
    label: "Confirmation notice",
    hint: "Short reassurance shown site-wide near request CTAs.",
    multiline: true,
  },
];

export default function AdminSettingsPage() {
  const [cfg, setCfg] = useState<ManualOrderConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let alive = true;
    fetchAdminManualOrderConfig()
      .then((c) => alive && setCfg(c))
      .catch((e) => alive && setError(e instanceof ApiError ? e.message : "Failed to load settings."))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const set = (key: keyof ManualOrderConfig, value: string) => {
    setSaved(false);
    setCfg((c) => (c ? { ...c, [key]: value } : c));
  };

  const save = async () => {
    if (!cfg) return;
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      setCfg(await updateManualOrderConfig(cfg));
      setSaved(true);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AdminPageSkeleton body="panel" />;

  return (
    <section className="admin-page">
      <header className="admin-page-head">
        <h2>Settings</h2>
        <p>
          Offline-first order flow — WhatsApp number, UPI details and the customer-facing notices.
          Changes apply immediately across the storefront.
        </p>
      </header>

      <div className="admin-side-panel" style={{ maxWidth: 640 }}>
        <div className="admin-side-head">Manual order &amp; payment</div>
        <div className="admin-side-body">
          {cfg &&
            FIELDS.map((f) => (
              <label key={f.key} className="admin-field" style={{ display: "block", marginBottom: 16 }}>
                <span className="admin-field-label">{f.label}</span>
                {f.multiline ? (
                  <textarea
                    className="admin-input"
                    rows={3}
                    value={cfg[f.key]}
                    onChange={(e) => set(f.key, e.target.value)}
                    disabled={saving}
                    style={{ resize: "vertical" }}
                  />
                ) : (
                  <input
                    className="admin-input"
                    value={cfg[f.key]}
                    placeholder={f.placeholder}
                    onChange={(e) => set(f.key, e.target.value)}
                    disabled={saving}
                  />
                )}
                <span className="admin-cell-sub" style={{ display: "block", marginTop: 4 }}>
                  {f.hint}
                </span>
              </label>
            ))}

          {error && <p className="admin-error" style={{ marginBottom: 12 }}>{error}</p>}

          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button className="admin-btn approve" onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save settings"}
            </button>
            {saved && <span style={{ color: "#2e7d52", fontWeight: 600 }}>✓ Saved</span>}
          </div>
        </div>
      </div>
    </section>
  );
}
