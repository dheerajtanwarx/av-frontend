"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <>
      <form
        className="news-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (email.trim()) setDone(true);
        }}
      >
        <input
          type="email"
          required
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label="Email address"
        />
        <button type="submit">{done ? "Welcome ✓" : "Subscribe"}</button>
      </form>
      <div className="fineprint">No spam, only beautiful things. Unsubscribe anytime.</div>
    </>
  );
}
