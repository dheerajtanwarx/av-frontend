"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ApiError,
  loginWithGoogle,
  sendOtp,
  verifyOtp,
  type AuthMode,
} from "../../lib/api";

const COPY: Record<AuthMode, { title: string; kicker: string; cta: string; alt: { q: string; label: string; href: string } }> = {
  login: {
    title: "Welcome back",
    kicker: "Sign in to your AV Creation account",
    cta: "Log in",
    alt: { q: "New to AV Creation?", label: "Create an account", href: "/signup" },
  },
  signup: {
    title: "Create your account",
    kicker: "Join the Jaipuri atelier",
    cta: "Sign up",
    alt: { q: "Already have an account?", label: "Log in", href: "/login" },
  },
};

const OAUTH_ERRORS: Record<string, string> = {
  oauth_failed: "Google sign-in didn’t complete. Please try again.",
};

export default function AuthView({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const params = useSearchParams();
  const copy = COPY[mode];

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(
    OAUTH_ERRORS[params.get("error") ?? ""] ?? null
  );
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // resend cooldown ticker
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (cooldown <= 0) return;
    timer.current = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [cooldown]);

  const phoneValid = /^[6-9]\d{9}$/.test(phone.replace(/\D/g, ""));

  async function handleSend(e?: React.FormEvent) {
    e?.preventDefault();
    if (mode === "signup" && !name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!phoneValid) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const res = await sendOtp(phone, mode);
      setDevOtp(res.devOtp ?? null);
      setStep("otp");
      setCooldown(30);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn’t send the code. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleVerify(e?: React.FormEvent) {
    e?.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit code.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await verifyOtp(phone, otp, mode, name.trim() || undefined);
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn’t verify the code. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth">
      <div className="auth-card">
        <a href="/" className="auth-logo">
          <span className="mark">AV CREATION</span>
          <span className="sub">Jaipuri Atelier · Rajasthan</span>
        </a>

        <h1 className="auth-title">{copy.title}</h1>
        <p className="auth-kicker">{copy.kicker}</p>

        {error && <div className="auth-error">{error}</div>}

        <button className="auth-google" onClick={loginWithGoogle} disabled={busy}>
          <GoogleMark />
          Continue with Google
        </button>

        <div className="auth-or"><span>or</span></div>

        {step === "phone" ? (
          <form className="auth-form" onSubmit={handleSend}>
            {mode === "signup" && (
              <label className="auth-field">
                <span>Full name</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                />
              </label>
            )}
            <label className="auth-field">
              <span>Mobile number</span>
              <div className="auth-phone">
                <span className="auth-cc">+91</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="98765 43210"
                  autoComplete="tel-national"
                />
              </div>
            </label>
            <button className="auth-submit" type="submit" disabled={busy}>
              {busy ? "Sending…" : "Send OTP"}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleVerify}>
            <p className="auth-sent">
              We sent a code to <strong>+91 {phone}</strong>.{" "}
              <button type="button" className="auth-link" onClick={() => { setStep("phone"); setOtp(""); setDevOtp(null); }}>
                Change
              </button>
            </p>
            {devOtp && (
              <div className="auth-devotp">
                Dev mode — your code is <strong>{devOtp}</strong>
              </div>
            )}
            <label className="auth-field">
              <span>6-digit code</span>
              <input
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="------"
                autoComplete="one-time-code"
                autoFocus
              />
            </label>
            <button className="auth-submit" type="submit" disabled={busy}>
              {busy ? "Verifying…" : copy.cta}
            </button>
            <button
              type="button"
              className="auth-link auth-resend"
              onClick={() => handleSend()}
              disabled={busy || cooldown > 0}
            >
              {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
            </button>
          </form>
        )}

        <p className="auth-alt">
          {copy.alt.q} <a href={copy.alt.href}>{copy.alt.label}</a>
        </p>
      </div>
    </main>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" fill="#34A853" />
      <path d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.05l3.01-2.33z" fill="#FBBC05" />
      <path d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  );
}
