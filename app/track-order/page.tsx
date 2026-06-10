import type { Metadata } from "next";
import Header from "../components/landing/Header";
import Footer from "../components/landing/Footer";
import ScrollReveal from "../components/landing/ScrollReveal";
import TrackOrderForm from "./TrackOrderForm";

export const metadata: Metadata = {
  title: "Track Your Order — AV Creation",
  description: "Track your AV Creation order in real time. Enter your order ID and email to get live shipping updates.",
};

export default function TrackOrderPage() {
  return (
    <div className="av">
      <ScrollReveal />
      <Header />

      {/* Hero */}
      <div className="info-hero">
        <div
          className="info-hero-bg"
          style={{ backgroundImage: "url(https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=1600&q=78&auto=format&fit=crop)" }}
        />
        <div className="wrap" style={{ position: "relative" }}>
          <div className="eyebrow">Help</div>
          <h1>Track Your Order</h1>
          <p>Enter your order ID and the email address used at checkout to see your live shipping status.</p>
          <div className="orn" style={{ marginTop: "44px" }}><span className="d">✦</span></div>
        </div>
      </div>

      {/* Form section */}
      <div className="info-sec">
        <div className="wrap">
          <div className="info-narrow">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "start" }}>
              {/* Form */}
              <TrackOrderForm />
              {/* Help box */}
              <div style={{ background: "var(--bg-2)", padding: "36px 32px", borderTop: "3px solid var(--gold)" }}>
                <div className="eyebrow" style={{ marginBottom: "14px" }}>Need Help?</div>
                <p style={{ fontSize: "14px", lineHeight: "1.9", color: "var(--ink-soft)", marginBottom: "20px" }}>
                  Can&apos;t find your order ID? Check your order confirmation email. It starts with <strong>AVC-</strong> followed by the year and a six-digit number.
                </p>
                <p style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "16px" }}>
                  For orders placed via phone or WhatsApp, contact us directly.
                </p>
                <a href="/contact" style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--rani)", borderBottom: "1px solid var(--rani-soft)", paddingBottom: "2px" }}>
                  Contact Support →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shipping timelines */}
      <div className="info-sec alt">
        <div className="wrap">
          <div className="info-narrow">
            <div className="eyebrow" style={{ marginBottom: "12px" }}>Delivery Windows</div>
            <h2>Shipping Timelines</h2>
            <p>All orders are dispatched from our Jaipur atelier within 1–2 business days of placement.</p>
            <div className="info-table-wrap">
              <table className="info-table">
                <thead>
                  <tr>
                    <th>Shipping Method</th>
                    <th>Delivery Time</th>
                    <th>Coverage</th>
                    <th>Cost</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Standard Delivery</td>
                    <td>5 – 7 business days</td>
                    <td>Pan India</td>
                    <td>Free above ₹1,999</td>
                  </tr>
                  <tr>
                    <td>Express Delivery</td>
                    <td>2 – 3 business days</td>
                    <td>Metro cities</td>
                    <td>₹149</td>
                  </tr>
                  <tr>
                    <td>Same-City Delivery</td>
                    <td>Next business day</td>
                    <td>Jaipur only</td>
                    <td>₹79</td>
                  </tr>
                  <tr>
                    <td>International</td>
                    <td>10 – 14 business days</td>
                    <td>USA, UK, UAE, Canada, AU</td>
                    <td>₹799 flat</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Process steps */}
      <div className="info-sec">
        <div className="wrap">
          <div className="info-narrow">
            <div className="eyebrow" style={{ marginBottom: "12px" }}>From Us To You</div>
            <h2>What Happens After You Order</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0", marginTop: "40px" }}>
              {[
                { step: "01", label: "Order Confirmed", note: "Email with order ID arrives within minutes" },
                { step: "02", label: "Handcrafting", note: "Our atelier finishes your piece in 1–2 days" },
                { step: "03", label: "Dispatched", note: "Tracking link sent via SMS and email" },
                { step: "04", label: "Out for Delivery", note: "Courier arrives at your address" },
                { step: "05", label: "Delivered", note: "Confirmation email sent to you" },
              ].map((s, i) => (
                <div key={s.step} style={{ padding: "28px 20px", borderLeft: i > 0 ? "none" : "1px solid var(--line)", borderRight: "1px solid var(--line)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", borderLeftWidth: "1px", borderLeftColor: "var(--line)", borderLeftStyle: i === 0 ? "solid" : "none" }}>
                  <div style={{ fontFamily: "var(--display)", fontSize: "2rem", color: "var(--rani)", lineHeight: 1, marginBottom: "10px" }}>{s.step}</div>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--ink)", marginBottom: "6px", letterSpacing: "0.04em" }}>{s.label}</div>
                  <div style={{ fontSize: "12px", color: "var(--muted)", lineHeight: 1.6 }}>{s.note}</div>
                </div>
              ))}
            </div>
            <p style={{ marginTop: "24px", fontSize: "13px", color: "var(--muted)" }}>
              Orders placed before 2 PM IST on business days are dispatched the same day. Custom embroidery orders require 3–5 additional business days.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
