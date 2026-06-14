"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { lookupAdminOrder, ApiError } from "../../lib/api";

/* ============================================================
   Admin · Scan Order
   ------------------------------------------------------------
   Internal pack/dispatch tool. Point the camera at a packing-slip
   QR (which encodes only the order number) to jump straight to
   that order. Camera access needs HTTPS or localhost; on plain
   http over a LAN the browser blocks it, so a manual order-number
   fallback is always available.
   ============================================================ */

const READER_ID = "av-qr-reader";

type Phase = "starting" | "scanning" | "resolving" | "denied" | "error";

export default function AdminScanPage() {
  const router = useRouter();
  const scannerRef = useRef<{ stop: () => Promise<void>; clear: () => void } | null>(null);
  // Locks out repeat decodes while we resolve + navigate on the first hit.
  const handlingRef = useRef(false);

  const [phase, setPhase] = useState<Phase>("starting");
  const [message, setMessage] = useState("");
  const [manual, setManual] = useState("");
  const [manualBusy, setManualBusy] = useState(false);

  /** Resolve a scanned/typed code to an order and navigate to it. */
  const resolveAndGo = useCallback(
    async (code: string): Promise<boolean> => {
      const { id, no } = await lookupAdminOrder(code);
      setPhase("resolving");
      setMessage(`Found ${no} — opening…`);
      router.push(`/admin/orders/${id}`);
      return true;
    },
    [router]
  );

  // Start the camera scanner on mount; tear it down on unmount.
  useEffect(() => {
    let cancelled = false;
    let instance: import("html5-qrcode").Html5Qrcode | null = null;

    (async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (cancelled) return;
        instance = new Html5Qrcode(READER_ID, { verbose: false });
        scannerRef.current = {
          stop: () => instance!.stop(),
          clear: () => instance!.clear(),
        };

        await instance.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          async (decoded: string) => {
            if (handlingRef.current) return;
            handlingRef.current = true;
            setPhase("resolving");
            setMessage("Looking up order…");
            try {
              await instance!.stop();
            } catch {
              /* already stopping */
            }
            try {
              await resolveAndGo(decoded.trim());
            } catch (e) {
              handlingRef.current = false;
              setPhase("error");
              setMessage(
                e instanceof ApiError
                  ? e.message
                  : "That code didn’t match any order."
              );
            }
          },
          () => {
            /* per-frame decode misses are normal; ignore */
          }
        );
        if (!cancelled) setPhase("scanning");
      } catch (e) {
        if (cancelled) return;
        // Permission denied / no camera / insecure (http) context all land here.
        setPhase("denied");
        setMessage(
          e instanceof Error && /permission|denied|NotAllowed/i.test(e.message)
            ? "Camera permission was denied. Allow it in your browser, or type the order number below."
            : "Couldn’t start the camera (it needs HTTPS or localhost). Type the order number below instead."
        );
      }
    })();

    return () => {
      cancelled = true;
      const s = scannerRef.current;
      if (s) {
        s.stop()
          .then(() => s.clear())
          .catch(() => {
            /* nothing to stop */
          });
      }
    };
  }, [resolveAndGo]);

  async function submitManual(e: React.FormEvent) {
    e.preventDefault();
    const code = manual.trim();
    if (!code || manualBusy) return;
    setManualBusy(true);
    setMessage("");
    try {
      await resolveAndGo(code);
    } catch (err) {
      setManualBusy(false);
      setMessage(
        err instanceof ApiError ? err.message : "That code didn’t match any order."
      );
    }
  }

  const scanning = phase === "scanning" || phase === "starting" || phase === "resolving";

  return (
    <section className="admin-page">
      <header className="admin-page-head">
        <h2>Scan Order</h2>
        <p>
          Scan a packing-slip QR to open the order, then mark it dispatched. The
          QR holds only the order number — no customer data, no login.
        </p>
      </header>

      <div className="admin-scan-grid">
        <div className="admin-side-panel">
          <div className="admin-side-head">Camera</div>
          <div className="admin-side-body">
            {/* html5-qrcode injects the video + canvas into this element. */}
            <div
              id={READER_ID}
              style={{
                width: "100%",
                maxWidth: 360,
                margin: "0 auto",
                borderRadius: 8,
                overflow: "hidden",
                background: "#000",
                minHeight: scanning ? 240 : 0,
              }}
            />
            {phase === "starting" && (
              <p className="admin-cell-sub" style={{ marginTop: 12, textAlign: "center" }}>
                Starting camera…
              </p>
            )}
            {phase === "scanning" && (
              <p className="admin-cell-sub" style={{ marginTop: 12, textAlign: "center" }}>
                Point the camera at the QR on the packing slip.
              </p>
            )}
            {message && (
              <p
                className={phase === "error" || phase === "denied" ? "admin-error" : "admin-cell-sub"}
                style={{ marginTop: 12, textAlign: "center" }}
              >
                {message}
              </p>
            )}
          </div>
        </div>

        <div className="admin-side-panel">
          <div className="admin-side-head">Enter order number</div>
          <div className="admin-side-body">
            <p className="admin-cell-sub" style={{ marginBottom: 12 }}>
              No camera? Type the order number from the slip.
            </p>
            <form onSubmit={submitManual}>
              <label className="admin-field" style={{ display: "block" }}>
                <span className="admin-field-label">Order number</span>
                <input
                  className="admin-input"
                  type="text"
                  placeholder="e.g. AVC-000024"
                  value={manual}
                  onChange={(e) => setManual(e.target.value)}
                  disabled={manualBusy}
                />
              </label>
              <button
                type="submit"
                className="admin-btn approve admin-status-cta"
                style={{ marginTop: 12 }}
                disabled={manualBusy || !manual.trim()}
              >
                {manualBusy ? "Opening…" : "Open order"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
