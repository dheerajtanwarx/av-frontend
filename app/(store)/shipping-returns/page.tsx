import type { Metadata } from "next";
import Header from "../components/landing/Header";
import Footer from "../components/landing/Footer";
import ScrollReveal from "../components/landing/ScrollReveal";

export const metadata: Metadata = {
  title: "Shipping & Returns — AV Creation",
  description: "Everything you need to know about AV Creation shipping, returns and exchanges. Free shipping above ₹1,999.",
};

export default function ShippingReturnsPage() {
  return (
    <div className="av">
      <ScrollReveal />
      <Header />

      {/* Hero */}
      <div className="info-hero">
        <div
          className="info-hero-bg"
          style={{ backgroundImage: "url(https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1600&q=78&auto=format&fit=crop)" }}
        />
        <div className="wrap" style={{ position: "relative" }}>
          <div className="eyebrow">Help</div>
          <h1>Shipping &amp; Returns</h1>
          <p>We want your Jaipuri heirloom to reach you perfectly. Here&apos;s how we ship — and what to do if something isn&apos;t right.</p>
          <div className="orn" style={{ marginTop: "44px" }}><span className="d">✦</span></div>
        </div>
      </div>

      {/* Stats strip */}
      <div style={{ background: "var(--bg-2)", borderBottom: "1px solid var(--line-2)" }}>
        <div className="wrap">
          <div className="info-stat-grid">
            {[
              { num: "Free", label: "Shipping above ₹1,999", sub: "Pan India standard delivery" },
              { num: "1–2", label: "Days to dispatch", sub: "From our Jaipur atelier" },
              { num: "7", label: "Day return window", sub: "Hassle-free, no questions" },
              { num: "100%", label: "Refund guarantee", sub: "On eligible returns" },
            ].map((s) => (
              <div className="info-stat" key={s.label}>
                <div className="num">{s.num}</div>
                <h4>{s.label}</h4>
                <p>{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Shipping policy */}
      <div className="info-sec">
        <div className="wrap">
          <div className="info-narrow">
            <div className="eyebrow" style={{ marginBottom: "12px" }}>Shipping Policy</div>
            <h2>How We Deliver</h2>
            <p>All orders are carefully packaged in our signature recycled-fabric parcel and dispatched from our Jaipur atelier within 1–2 business days of order placement.</p>
            <div className="info-table-wrap">
              <table className="info-table">
                <thead>
                  <tr>
                    <th>Method</th>
                    <th>Estimated Delivery</th>
                    <th>Charge</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Standard (Pan India)</td>
                    <td>5 – 7 business days</td>
                    <td>Free on orders above ₹1,999; ₹99 below</td>
                  </tr>
                  <tr>
                    <td>Express (Metro cities)</td>
                    <td>2 – 3 business days</td>
                    <td>₹149</td>
                  </tr>
                  <tr>
                    <td>Same-city (Jaipur)</td>
                    <td>Next business day</td>
                    <td>₹79</td>
                  </tr>
                  <tr>
                    <td>International</td>
                    <td>10 – 14 business days</td>
                    <td>₹799 flat</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>Once dispatched, you will receive a tracking SMS and email from our courier partner (Delhivery / BlueDart). Allow up to 24 hours for the tracking link to activate.</p>
          </div>
        </div>
      </div>

      {/* Returns */}
      <div className="info-sec alt">
        <div className="wrap">
          <div className="info-narrow">
            <div className="eyebrow" style={{ marginBottom: "12px" }}>Returns &amp; Exchanges</div>
            <h2>7-Day Return Policy</h2>
            <p>We accept returns and exchanges within <strong>7 days</strong> of delivery, provided the item is unused, unwashed, and in its original packaging with all tags intact.</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "28px", margin: "40px 0" }}>
              <div className="info-card">
                <div className="card-eyebrow">Step by Step</div>
                <h3>How to Return</h3>
                <ul style={{ marginTop: "12px" }}>
                  <li>Email <strong>returns@avcreation.in</strong> with your order ID and reason.</li>
                  <li>We respond within 24 business hours with a return label.</li>
                  <li>Pack securely in the original bag and hand to courier.</li>
                  <li>Refund processed within 5–7 business days of receipt.</li>
                </ul>
              </div>
              <div className="info-card">
                <div className="card-eyebrow">Please Note</div>
                <h3>Non-Returnable Items</h3>
                <ul style={{ marginTop: "12px" }}>
                  <li>Custom embroidery or monogrammed pieces.</li>
                  <li>Sale items marked &ldquo;Final Sale.&rdquo;</li>
                  <li>Returns after 7 days of delivery.</li>
                  <li>Items that have been worn, washed, or altered.</li>
                </ul>
              </div>
            </div>

            <h3>Exchanges</h3>
            <p>Want a different size or colour? We arrange a complimentary exchange on your first request per order. Mention &ldquo;Exchange&rdquo; in your return email and specify the new variant. Exchange shipments are dispatched within 2 business days of receiving your return.</p>
          </div>
        </div>
      </div>

      {/* Damaged items */}
      <div className="info-cta-strip">
        <div className="wrap">
          <h3>Received a damaged or incorrect item?</h3>
          <p>Email us at support@avcreation.in with your order ID and a photo within 48 hours. We will arrange a priority replacement at no cost to you.</p>
          <a href="/contact" className="btn btn-ink">Contact Support →</a>
        </div>
      </div>

      <Footer />
    </div>
  );
}
