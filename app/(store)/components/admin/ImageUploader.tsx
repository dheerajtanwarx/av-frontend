"use client";

import { useRef, useState } from "react";
import { uploadImage, ApiError } from "../../lib/api";

/* How the image should sit inside the target frame.
   - fill:     crop to fill the frame (good for landscape photos)
   - fit:      pad to the frame so nothing is cropped (good for portrait)
   - original: store the raw image untouched */
type FitMode = "fill" | "fit" | "original";

/* Cloudinary URLs look like
   https://res.cloudinary.com/<cloud>/image/upload/[<transform>/][v123/]<public-id>
   We rewrite the optional <transform> segment to re-fit the image. */
const CLOUDINARY_RE = /(\/upload\/)(.+)$/;
const isCloudinary = (url: string) => /res\.cloudinary\.com\/.+\/upload\//.test(url);

/* A leading path segment that is one of OUR managed transforms (not a version
   like `v123` or the public id). */
const isManagedTransform = (seg: string) =>
  /(^|,)(c_(fill|pad|fit)|ar_|g_|b_|w_\d|q_auto|f_auto)/.test(seg);

/** "16 / 9" → "16:9" (Cloudinary aspect-ratio syntax). */
function aspectToRatio(aspect: string): string {
  const m = aspect.match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/);
  return m ? `${m[1]}:${m[2]}` : "16:9";
}

/** Strip any transform segment we previously added, returning the raw image URL. */
function baseUrl(url: string): string {
  return url.replace(CLOUDINARY_RE, (_full, up: string, rest: string) => {
    const parts = rest.split("/");
    if (parts.length > 1 && isManagedTransform(parts[0])) parts.shift();
    return up + parts.join("/");
  });
}

/** Which fit mode the current URL encodes. */
function detectFit(url: string): FitMode {
  const m = url.match(CLOUDINARY_RE);
  const first = m?.[2].split("/")[0] ?? "";
  if (/c_fill/.test(first)) return "fill";
  if (/c_pad/.test(first)) return "fit";
  return "original";
}

/** Apply a fit mode by rewriting the Cloudinary transform segment. */
function applyFit(url: string, mode: FitMode, ratio: string): string {
  if (!isCloudinary(url)) return url;
  const base = baseUrl(url);
  if (mode === "original") return base;
  const transform =
    mode === "fill"
      ? `c_fill,g_auto,ar_${ratio},w_2000,q_auto,f_auto`
      : `c_pad,b_blurred:400:25,ar_${ratio},w_2000,q_auto,f_auto`;
  return base.replace(CLOUDINARY_RE, (_full, up: string, rest: string) => `${up}${transform}/${rest}`);
}

/* Single-image uploader: pick a file → upload to the server (Cloudinary) →
   report the hosted URL. Shows the current image with a Replace/Remove control,
   plus a "fit to frame" editor so portrait photos can be padded instead of cropped. */
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

  const canFit = !!value && isCloudinary(value);
  const ratio = aspectToRatio(aspect);
  const currentFit = canFit ? detectFit(value!) : "original";

  const fitOptions: { mode: FitMode; label: string }[] = [
    { mode: "fill", label: "Fill" },
    { mode: "fit", label: "Fit" },
    { mode: "original", label: "Original" },
  ];

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

      {canFit && (
        <div className="admin-uploader-fit">
          <span className="admin-uploader-fit-label">Fit to frame</span>
          <div className="admin-uploader-fit-opts" role="group" aria-label="Image fit">
            {fitOptions.map((o) => (
              <button
                key={o.mode}
                type="button"
                disabled={busy}
                aria-pressed={currentFit === o.mode}
                className={`admin-uploader-fit-btn${currentFit === o.mode ? " active" : ""}`}
                onClick={() => onChange(applyFit(value!, o.mode, ratio))}
              >
                {o.label}
              </button>
            ))}
          </div>
          <span className="admin-uploader-fit-hint">
            Portrait photo getting cropped? Choose <strong>Fit</strong> to pad it into the frame.
          </span>
        </div>
      )}

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
