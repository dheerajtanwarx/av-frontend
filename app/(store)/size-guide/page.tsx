import type { Metadata } from "next";
import Header from "../components/landing/Header";
import Footer from "../components/landing/Footer";
import ScrollReveal from "../components/landing/ScrollReveal";

export const metadata: Metadata = {
  title: "Size Guide — AV Creation",
  description: "Find your perfect fit with the AV Creation size guide. Measurement charts for Odhni, Lehenga, Saree blouse and Suit Sets.",
};

export default function SizeGuidePage() {
  return (
    <div className="av">
      <ScrollReveal />
      <Header />

      {/* Hero */}
      <div className="info-hero">
        <div
          className="info-hero-bg"
          style={{ backgroundImage: "url(https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1600&q=78&auto=format&fit=crop)" }}
        />
        <div className="wrap" style={{ position: "relative" }}>
          <div className="eyebrow">Help</div>
          <h1>Size Guide</h1>
          <p>Every piece is hand-finished, so fit matters. Use the charts below — or write to us and our stylists will guide you personally.</p>
          <div className="orn" style={{ marginTop: "44px" }}><span className="d">✦</span></div>
        </div>
      </div>

      {/* How to measure */}
      <div className="info-sec alt">
        <div className="wrap">
          <div className="info-narrow">
            <div className="eyebrow" style={{ marginBottom: "12px" }}>Before You Measure</div>
            <h2>How to Take Your Measurements</h2>
            <p>Use a soft measuring tape held snugly — not tight — against the body. Measure over light innerwear, not heavy clothing.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0", marginTop: "36px", border: "1px solid var(--line)" }}>
              {[
                { label: "Bust", desc: "Around the fullest part of your chest, tape parallel to the floor." },
                { label: "Waist", desc: "Around the narrowest part, 2–3 cm above the navel." },
                { label: "Hip", desc: "Around the fullest part, approximately 20 cm below the waist." },
                { label: "Length", desc: "From waist to desired hem while standing straight." },
              ].map((m, i) => (
                <div key={m.label} style={{ padding: "28px 22px", borderRight: i < 3 ? "1px solid var(--line)" : "none" }}>
                  <div style={{ fontFamily: "var(--display)", fontSize: "1.5rem", color: "var(--rani)", marginBottom: "8px" }}>{m.label}</div>
                  <p style={{ fontSize: "13px", color: "var(--ink-soft)", lineHeight: 1.75, margin: 0 }}>{m.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lehenga & Suits */}
      <div className="info-sec">
        <div className="wrap">
          <div className="info-narrow size-category">
            <div className="eyebrow" style={{ marginBottom: "12px" }}>Bottoms &amp; Sets</div>
            <h2>Lehenga &amp; Suit Set</h2>
            <p>Lehenga length is measured from the waist to the hem. Custom lengths are available — note in the order comments at checkout.</p>
            <div className="info-table-wrap">
              <table className="info-table">
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Bust (cm)</th>
                    <th>Waist (cm)</th>
                    <th>Hip (cm)</th>
                    <th>Length (cm)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["XS", "76 – 80", "60 – 64", "84 – 88", "40"],
                    ["S",  "80 – 84", "64 – 68", "88 – 92", "41"],
                    ["M",  "84 – 88", "68 – 72", "92 – 96", "42"],
                    ["L",  "88 – 94", "72 – 78", "96 – 102", "43"],
                    ["XL", "94 – 100", "78 – 84", "102 – 108", "44"],
                    ["2XL","100 – 108","84 – 92", "108 – 116","44"],
                    ["3XL","108 – 116","92 – 100","116 – 124","45"],
                  ].map(([sz, b, w, h, l]) => (
                    <tr key={sz}><td>{sz}</td><td>{b}</td><td>{w}</td><td>{h}</td><td>{l}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Saree blouse */}
      <div className="info-sec alt">
        <div className="wrap">
          <div className="info-narrow size-category">
            <div className="eyebrow" style={{ marginBottom: "12px" }}>Sarees</div>
            <h2>Saree Blouse</h2>
            <p>All sarees are 5.5 metres including a 0.8 m blouse piece. Stitched blouses are available as an add-on at checkout.</p>
            <div className="info-table-wrap">
              <table className="info-table">
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Bust (cm)</th>
                    <th>Waist (cm)</th>
                    <th>Blouse Length (cm)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["XS", "76 – 80", "60 – 64", "40"],
                    ["S",  "80 – 84", "64 – 68", "41"],
                    ["M",  "84 – 88", "68 – 72", "42"],
                    ["L",  "88 – 94", "72 – 78", "43"],
                    ["XL", "94 – 100","78 – 84", "43"],
                    ["2XL","100 – 108","84 – 92", "44"],
                  ].map(([sz, b, w, l]) => (
                    <tr key={sz}><td>{sz}</td><td>{b}</td><td>{w}</td><td>{l}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Odhni & Dupatta */}
      <div className="info-sec">
        <div className="wrap">
          <div className="info-narrow size-category">
            <div className="eyebrow" style={{ marginBottom: "12px" }}>Odhni &amp; Dupatta</div>
            <h2>Jaipuri Odhni &amp; Dupatta</h2>
            <p>Our Odhnis and Dupattas are standard flat dimensions — no stitching involved. All measurements are approximate; handcrafted pieces may vary by ±5 cm.</p>
            <div className="info-table-wrap">
              <table className="info-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Length (cm)</th>
                    <th>Width (cm)</th>
                    <th>Best For</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Jaipuri Odhni (standard)</td><td>220</td><td>100</td><td>All heights, everyday drape</td></tr>
                  <tr><td>Jaipuri Odhni (long)</td><td>260</td><td>100</td><td>Floor-length or bridal drape</td></tr>
                  <tr><td>Dupatta (short)</td><td>200</td><td>75</td><td>Suits &amp; churidar sets</td></tr>
                  <tr><td>Dupatta (full)</td><td>250</td><td>100</td><td>Lehenga &amp; formal occasion</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="info-cta-strip">
        <div className="wrap">
          <h3>Still not sure of your size?</h3>
          <p>Our stylists are on WhatsApp to help you pick the right fit. Share your measurements and we&apos;ll advise you personally.</p>
          <a href="/contact" className="btn btn-rani">Chat with a Stylist →</a>
        </div>
      </div>

      <Footer />
    </div>
  );
}
