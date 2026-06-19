import type { Metadata } from "next";
import Header from "../components/landing/Header";
import Footer from "../components/landing/Footer";
import ScrollReveal from "../components/landing/ScrollReveal";

export const metadata: Metadata = {
  title: "Sustainability — AV Creation",
  description: "How AV Creation builds sustainable fashion — natural dyes, fair wages, plastic-free packaging, and craft that outlasts trends.",
};

export default function SustainabilityPage() {
  return (
    <div className="av">
      <ScrollReveal />
      <Header />

      {/* Hero */}
      <div className="info-hero">
        <div
          className="info-hero-bg"
          style={{ backgroundImage: "url(https://images.unsplash.com/photo-1611042553365-9b101441c135?w=1600&q=78&auto=format&fit=crop)" }}
        />
        <div className="wrap" style={{ position: "relative" }}>
          <div className="eyebrow">The House</div>
          <h1>Sustainability</h1>
          <p>We believe the most sustainable garment is the one you never throw away. Everything we do is built to last.</p>
          <div className="orn" style={{ marginTop: "44px" }}><span className="d">✦</span></div>
        </div>
      </div>

      {/* Pledge stats */}
      <div style={{ borderBottom: "1px solid var(--line-2)" }}>
        <div className="wrap">
          <div className="info-stat-grid">
            {[
              { num: "68%", label: "Natural Dye Coverage", sub: "Committed to 100% by 2028" },
              { num: "0", label: "Plastic in Packaging", sub: "Recycled cotton bags — always" },
              { num: "40+", label: "Artisan Livelihoods", sub: "Above-minimum-wage, every year" },
              { num: "2×", label: "Collections a Year", sub: "No fast drops, no overproduction" },
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

      {/* Philosophy */}
      <div className="info-sec">
        <div className="wrap">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "72px", alignItems: "center" }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: "14px" }}>Our Philosophy</div>
              <h2>Sustainability by Design</h2>
              <p style={{ fontSize: "16px", lineHeight: "1.9" }}>
                For us, sustainability is not a marketing pillar — it is a consequence of making things properly. Traditional handcraft, by its nature, is low-impact: it uses human skill instead of machines, natural materials instead of synthetics, and it produces garments built for decades not seasons.
              </p>
              <p>Our job is to protect that tradition — and push it further.</p>
            </div>
            <div>
              <div className="ph" style={{ paddingBottom: "110%" }}>
                <img src="https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=78&auto=format&fit=crop" alt="Natural dye process" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pledges */}
      <div className="info-sec alt">
        <div className="wrap">
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <div className="eyebrow" style={{ marginBottom: "12px" }}>Our Commitments</div>
            <h2>Four Pledges</h2>
          </div>
          <div className="pledge-grid">
            {[
              { num: "100%", title: "Natural Dyes — Our Target", text: "Transitioning our entire colour palette to plant and mineral sources. Currently 68% natural; committed to 100% by 2028." },
              { num: "Zero", title: "Plastic in Packaging", text: "Every order arrives in a recycled cotton-fabric bag, secured with jute cord. No bubble wrap, no plastic mailers — ever." },
              { num: "5%", title: "Revenue to Artisan Welfare", text: "We reinvest 5% of annual revenue directly into karigar welfare programmes and craft skills training." },
              { num: "Zero", title: "Overproduction", text: "We produce in small batches, season by season. When a design sells out, it is gone. We do not stockpile, discount, or destroy inventory." },
            ].map((p) => (
              <div className="pledge-card" key={p.title}>
                <div className="pledge-num">{p.num}</div>
                <h4>{p.title}</h4>
                <p>{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Natural dyes deep dive */}
      <div className="info-sec">
        <div className="wrap">
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "64px", alignItems: "center" }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: "14px" }}>The Colour Story</div>
              <h2>Natural Dyes</h2>
              <p>Rajasthan has the oldest natural-dye tradition in India. Long before synthetic aniline dyes arrived in the 19th century, craftspeople were colouring fabric with pomegranate rind (yellow), madder root (red), indigo leaves (blue), iron water (black), and haldi (golden-yellow).</p>
              <p>We source our dye materials from cooperative farms within Rajasthan. Our Bagru partners use traditional indigo vats that have been in continuous use for generations.</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px", marginTop: "32px" }}>
                {[
                  { color: "#3d5c8f", name: "Indigo" },
                  { color: "#bd3c6e", name: "Madder" },
                  { color: "#bd8f3c", name: "Haldi" },
                  { color: "#163f34", name: "Iron-Black" },
                  { color: "#8e4a2f", name: "Pomegranate" },
                ].map((d) => (
                  <div key={d.name} style={{ textAlign: "center" }}>
                    <div style={{ height: "52px", background: d.color, marginBottom: "8px" }} />
                    <div style={{ fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)" }}>{d.name}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="ph" style={{ paddingBottom: "130%" }}>
                <img src="https://images.unsplash.com/photo-1583846783214-7229a91b20ed?w=700&q=78&auto=format&fit=crop" alt="Natural dyes" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quote */}
      <div className="info-quote-band">
        <div className="wrap">
          <blockquote>
            &ldquo;The best thing you can do for the planet is buy one beautiful thing and keep it for thirty years.&rdquo;
          </blockquote>
          <cite>AV Creation — House Philosophy</cite>
        </div>
      </div>

      {/* Packaging + water */}
      <div className="info-sec alt">
        <div className="wrap">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px" }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: "12px" }}>Packaging</div>
              <h3 style={{ fontFamily: "var(--display)", fontSize: "1.4rem", marginBottom: "14px" }}>Nothing Unnecessary</h3>
              <ul>
                <li>Parcels wrapped in recycled cotton-fabric bags hand-sewn in Jaipur.</li>
                <li>Inner tissue is acid-free, natural-fibre paper.</li>
                <li>Tags printed on recycled card with soy-based inks.</li>
                <li>No single-use plastic anywhere in the box.</li>
                <li>The fabric bag can be reused as a garment storage pouch.</li>
              </ul>
            </div>
            <div>
              <div className="eyebrow" style={{ marginBottom: "12px" }}>Water</div>
              <h3 style={{ fontFamily: "var(--display)", fontSize: "1.4rem", marginBottom: "14px" }}>Responsible Use</h3>
              <ul>
                <li>Our Sanganer partners treat effluent through a community treatment plant — no dye-water enters local groundwater.</li>
                <li>We audit this process annually and share results openly with artisan partners.</li>
                <li>Piloting a rainwater-harvesting system at our Sanganer workshop for 2026.</li>
                <li>Target: 30% reduction in fresh-water use per metre of fabric by 2028.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
