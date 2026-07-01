"use client";

import { useRef, useState } from "react";
import { uploadVideo, ApiError } from "../../lib/api";

/* Single-video uploader: pick a file → upload to the server (Cloudinary) →
   report the hosted URL. Mirrors ImageUploader but for short vertical reels —
   no fit editor, just a muted preview with Replace/Remove. */
export default function VideoUploader({
  value,
  onChange,
  onBusyChange,
  label = "Upload video",
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  /** Notifies the parent while an upload is in flight (to disable Save / Add). */
  onBusyChange?: (busy: boolean) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file
    if (!file) return;
    setBusy(true);
    setError("");
    setOk(false);
    onBusyChange?.(true);
    try {
      const { url } = await uploadVideo(file);
      onChange(url);
      setOk(true);
      setTimeout(() => setOk(false), 2500);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
      onBusyChange?.(false);
    }
  }

  return (
    <div className="admin-uploader">
      <div className="admin-uploader-frame" style={{ aspectRatio: "9 / 16" }}>
        {value ? (
          <video
            src={value}
            className="admin-uploader-img"
            muted
            loop
            playsInline
            controls
          />
        ) : (
          <span className="admin-uploader-empty">No video</span>
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

      {ok && <p className="admin-uploader-ok">✓ Uploaded</p>}
      {error && <p className="admin-uploader-error">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        hidden
        onChange={onPick}
      />
    </div>
  );
}
