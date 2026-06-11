"use client";

import { useRef, useState } from "react";
import { uploadImage, ApiError } from "../../lib/api";

/* Single-image uploader: pick a file → upload to the server (Cloudinary) →
   report the hosted URL. Shows the current image with a Replace/Remove control. */
export default function ImageUploader({
  value,
  onChange,
  label = "Upload image",
  aspect = "4 / 5",
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  aspect?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const { url } = await uploadImage(file);
      onChange(url);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-uploader">
      <div className="admin-uploader-frame" style={{ aspectRatio: aspect }}>
        {value ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={value} alt="" className="admin-uploader-img" />
        ) : (
          <span className="admin-uploader-empty">No image</span>
        )}
        {busy && <span className="admin-uploader-spinner">Uploading…</span>}
      </div>

      <div className="admin-uploader-actions">
        <button
          type="button"
          className="admin-btn"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {value ? "Replace" : label}
        </button>
        {value && (
          <button
            type="button"
            className="admin-btn reject"
            disabled={busy}
            onClick={() => onChange(null)}
          >
            Remove
          </button>
        )}
      </div>

      {error && <p className="admin-uploader-error">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={onPick}
      />
    </div>
  );
}
