"use client";

import { useEffect, useState } from "react";
import { CheckoutHeader, SlimFooter } from "./CheckoutChrome";
import { CartIc } from "./icons";
import type { CreateRequestResponse } from "../../lib/api";

const LAST_REQUEST_KEY = "av-last-request";

export default function RequestSubmitted() {
  const [data, setData] = useState<CreateRequestResponse | null>(null);

  useEffect(() => {
    // Read the stashed request after a microtask so this isn't a synchronous
    // setState in the effect body (avoids a cascading re-render on mount).
    let alive = true;
    Promise.resolve().then(() => {
      if (!alive) return;
      try {
        const raw = sessionStorage.getItem(LAST_REQUEST_KEY);
        if (raw) setData(JSON.parse(raw) as CreateRequestResponse);
      } catch {
        /* ignore */
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  const req = data?.request;
  const wa = data?.whatsapp;

  return (
    <div className="app flow av-flow">
      <CheckoutHeader backHref="/" backLabel="Continue shopping" />
      <main className="wrap">
        <div className="req-done">
          <div className="req-done-mark">{CartIc.check}</div>
          <h1>Request submitted</h1>
          {req && <div className="req-done-no">Request {req.no}</div>}
          <p className="req-done-lead">
            Your request is now <b>Pending Admin Approval</b>. We’ll verify availability and reply
            on WhatsApp{wa?.responseWindow ? ` — ${wa.responseWindow.toLowerCase()}` : ""}.
          </p>

          {/* Steps so the customer knows exactly what happens next. */}
          <ol className="req-steps">
            <li>
              <span className="n">1</span> Send us the prefilled WhatsApp message below so we can
              match your request.
            </li>
            <li>
              <span className="n">2</span> Once approved, you’ll get UPI payment instructions
              (PhonePe / Google Pay / Paytm).
            </li>
            <li>
              <span className="n">3</span> Pay manually and share the reference — we verify it and
              confirm your order.
            </li>
          </ol>

          <div className="req-done-actions">
            {wa?.link && (
              <a className="place-order req-wa" href={wa.link} target="_blank" rel="noopener noreferrer">
                Continue on WhatsApp
              </a>
            )}
            <a className="co-back" href="/my-requests">
              View my requests {CartIc.arrowR}
            </a>
          </div>

          <p className="req-done-fine">
            Orders are confirmed only after admin approval and payment verification. Nothing has been
            charged.
          </p>
        </div>
      </main>
      <SlimFooter />
    </div>
  );
}
