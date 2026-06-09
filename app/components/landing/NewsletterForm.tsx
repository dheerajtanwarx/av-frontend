"use client";

import { useState } from "react";
import { subscribeNewsletter } from "../../lib/api";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || state === "loading") return;
    setState("loading");
    setErr(null);
    try {
      const res = await subscribeNewsletter(email.trim());
      if (res.ok) {
        setState("done");
        setEmail("");
      } else {
        setState("idle");
        setErr(res.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setState("idle");
      setErr("Couldn’t reach the server. Please try again.");
    }
  };

  return (
    <>
      <form className="news-form" onSubmit={onSubmit}>
        <input
          type="email"
          required
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label="Email address"
          disabled={state === "done"}
        />
        <button type="submit" disabled={state === "loading" || state === "done"}>
          {state === "done" ? "Welcome ✓" : state === "loading" ? "Subscribing…" : "Subscribe"}
        </button>
      </form>
      {err ? (
        <div className="fineprint" role="alert" style={{ color: "#b23b4e" }}>
          {err}
        </div>
      ) : (
        <div className="fineprint">No spam, only beautiful things. Unsubscribe anytime.</div>
      )}
    </>
  );
}
