import type { Metadata } from "next";
import Header from "../components/landing/Header";
import Footer from "../components/landing/Footer";
import ScrollReveal from "../components/landing/ScrollReveal";

export const metadata: Metadata = {
  title: "Contact Us — AV Creation",
  description: "Get in touch with the AV Creation team. A real person reads every message. We reply within one business day.",
};

export default function ContactPage() {
  return (
    <div className="av">
      <ScrollReveal />
      <Header />

      {/* Hero */}
      <div className="info-hero">
        <div
          className="info-hero-bg"
          style={{ backgroundImage: "url(https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?w=1600&q=78&auto=format&fit=crop)" }}
        />
        <div className="wrap" style={{ position: "relative" }}>
          <div className="eyebrow">Help</div>
          <h1>Contact Us</h1>
          <p>A real person reads every message. We reply within one business day.</p>
          <div className="orn" style={{ marginTop: "44px" }}><span className="d">✦</span></div>
        </div>
      </div>

      {/* Main contact section */}
      <div className="info-sec">
        <div className="wrap">
          <div className="info-split">
            {/* Form */}
            <div>
              <div className="eyebrow" style={{ marginBottom: "16px" }}>Send a Message</div>
              <h2 style={{ marginBottom: "32px" }}>How can we help?</h2>
              <form className="info-form" action="#">
                <div className="form-row">
                  <label className="info-form-label">
                    First Name
                    <input type="text" placeholder="Priya" />
                  </label>
                  <label className="info-form-label">
                    Last Name
                    <input type="text" placeholder="Sharma" />
                  </label>
                </div>
                <label className="info-form-label">
                  Email Address
                  <input type="email" placeholder="you@example.com" />
                </label>
                <label className="info-form-label">
                  Topic
                  <select>
                    <option value="">Select a topic…</option>
                    <option>Order enquiry</option>
                    <option>Return / Exchange</option>
                    <option>Product question</option>
                    <option>Custom order / Styling</option>
                    <option>Press &amp; Collaboration</option>
                    <option>Other</option>
                  </select>
                </label>
                <label className="info-form-label">
                  Your Message
                  <textarea placeholder="Tell us how we can help…" />
                </label>
                <div>
                  <button type="submit" className="btn btn-rani">
                    Send Message →
                  </button>
                </div>
              </form>
            </div>

            {/* Aside */}
            <div className="info-aside">
              <div style={{ background: "var(--bg-2)", padding: "40px 36px", borderTop: "3px solid var(--gold)" }}>
                <div className="eyebrow" style={{ marginBottom: "20px", color: "var(--gold)" }}>Find Us</div>

                <h3>Jaipur Atelier</h3>
                <p>Plot 14, Sanganer Main Road<br />Near Jaipuri Bazaar, Sanganer<br />Jaipur, Rajasthan — 302 029</p>
                <p style={{ fontSize: "12.5px", color: "var(--muted)" }}>Mon – Sat: 10 AM – 7 PM IST</p>

                <hr className="info-divider" />

                <h3>Email</h3>
                <a href="mailto:hello@avcreation.in">hello@avcreation.in</a>
                <a href="mailto:support@avcreation.in" style={{ marginTop: "4px" }}>support@avcreation.in</a>

                <hr className="info-divider" />

                <h3>WhatsApp</h3>
                <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" style={{ color: "var(--rani)", fontWeight: 500 }}>
                  +91 98765 43210
                </a>
                <p style={{ marginTop: "6px", fontSize: "12.5px", color: "var(--muted)" }}>
                  Mon – Sat, 10 AM – 6 PM IST.<br />Typically replies within 2 hours.
                </p>

                <hr className="info-divider" />

                <h3>Press &amp; Collaborations</h3>
                <a href="mailto:press@avcreation.in">press@avcreation.in</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="info-sec alt">
        <div className="wrap">
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <div className="eyebrow" style={{ marginBottom: "12px" }}>Quick Answers</div>
            <h2>Common Questions</h2>
          </div>
          <div className="info-card-grid">
            {[
              { icon: "📦", title: "Track Your Order", desc: "Get live shipping status for any AV Creation order.", href: "/track-order" },
              { icon: "↩️", title: "Returns & Exchanges", desc: "7-day return window, complimentary first exchange.", href: "/shipping-returns" },
              { icon: "📏", title: "Size Guide", desc: "Measurement charts for every garment category.", href: "/size-guide" },
            ].map((q) => (
              <a href={q.href} key={q.title} className="info-card" style={{ display: "block", textDecoration: "none" }}>
                <div style={{ fontSize: "28px", marginBottom: "12px" }}>{q.icon}</div>
                <h3>{q.title}</h3>
                <p>{q.desc}</p>
              </a>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
