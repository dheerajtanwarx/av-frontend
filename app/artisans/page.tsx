import type { Metadata } from "next";
import Header from "../components/landing/Header";
import Footer from "../components/landing/Footer";
import ScrollReveal from "../components/landing/ScrollReveal";

export const metadata: Metadata = {
  title: "The Artisans — AV Creation",
  description: "Meet the karigar families behind every AV Creation piece — the block-printers of Sanganer, dabu masters of Bagru, and gota embroiderers of Jaipur.",
};

const artisans = [
  {
    region: "Sanganer, Jaipur",
    craft: "Hand Block Printing",
    family: "The Chippa Family",
    since: "Partner since 2018",
    image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=78&auto=format&fit=crop",
    story: "Mohammad Salim Chippa and his two sons run the workshop where every AV Creation floral and geometric block is pressed by hand. Three generations, wooden blocks carved by their grandfather that are now family heirlooms themselves.",
    technique: "Wooden block printing with natural pigments — haldi (turmeric), pomegranate rind, and synthetic-free azo dyes.",
    quote: "A crooked stamp cannot be unprinted.",
  },
  {
    region: "Bagru, Jaipur",
    craft: "Dabu Mud-Resist",
    family: "The Khatri Collective",
    since: "Partner since 2020",
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=78&auto=format&fit=crop",
    story: "Dabu is one of India's oldest resist-printing techniques: clay, wheat chaff and lime paste is stamped onto cloth to block the dye, creating luminous white-on-colour patterns. The Khatri families are the last keepers of this craft at scale.",
    technique: "Dabu mud resist, natural indigo vat dyeing, iron-black (kassis) discharge printing.",
    quote: "The mud remembers where the dye should not go.",
  },
  {
    region: "Old City, Jaipur",
    craft: "Gota Patti & Embroidery",
    family: "Zainab & Her Collective",
    since: "Partner since 2019",
    image: "https://images.unsplash.com/photo-1583846783214-7229a91b20ed?w=800&q=78&auto=format&fit=crop",
    story: "Gota patti — the art of appliquéing fine gold and silver ribbon onto fabric — is the signature embellishment of Rajasthani bridal wear. Zainab Begum leads a collective of fourteen women who embroider by hand in their homes.",
    technique: "Gota patti appliqué, zardozi (gold thread embroidery), mirror work (shisha), and sequin hand-setting.",
    quote: "Every stitch is a signature.",
  },
];

export default function ArtisansPage() {
  return (
    <div className="av">
      <ScrollReveal />
      <Header />

      {/* Hero */}
      <div className="info-hero">
        <div
          className="info-hero-bg"
          style={{ backgroundImage: "url(https://images.unsplash.com/photo-1617137968427-85924c800a22?w=1600&q=78&auto=format&fit=crop)" }}
        />
        <div className="wrap" style={{ position: "relative" }}>
          <div className="eyebrow">The House</div>
          <h1>The Artisans</h1>
          <p>Every piece you own has a maker. These are theirs.</p>
          <div className="orn" style={{ marginTop: "44px" }}><span className="d">✦</span></div>
        </div>
      </div>

      {/* Intro */}
      <div className="info-sec alt">
        <div className="wrap">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "72px", alignItems: "center" }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: "14px" }}>The Karigar Circle</div>
              <h2>Craft at the Centre</h2>
              <p style={{ fontSize: "16px", lineHeight: "1.9" }}>
                AV Creation is not a label — it is a circle of people. At its centre are the karigar families across Jaipur, Sanganer and Bagru who carry centuries of craft knowledge in their hands. We do not sub-contract to faceless factories. We sit with our makers, season by season, and design together.
              </p>
              <p>Their skill is our product.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div style={{ textAlign: "center", padding: "32px 20px", background: "var(--surface)", border: "1px solid var(--line)", borderTop: "3px solid var(--gold)" }}>
                <div style={{ fontFamily: "var(--display)", fontSize: "2.8rem", color: "var(--rani)", lineHeight: 1, marginBottom: "8px" }}>40+</div>
                <div style={{ fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)" }}>Karigar families</div>
              </div>
              <div style={{ textAlign: "center", padding: "32px 20px", background: "var(--surface)", border: "1px solid var(--line)", borderTop: "3px solid var(--gold)" }}>
                <div style={{ fontFamily: "var(--display)", fontSize: "2.8rem", color: "var(--rani)", lineHeight: 1, marginBottom: "8px" }}>3</div>
                <div style={{ fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)" }}>Craft regions</div>
              </div>
              <div style={{ textAlign: "center", padding: "32px 20px", background: "var(--surface)", border: "1px solid var(--line)", borderTop: "3px solid var(--gold)" }}>
                <div style={{ fontFamily: "var(--display)", fontSize: "2.8rem", color: "var(--rani)", lineHeight: 1, marginBottom: "8px" }}>8</div>
                <div style={{ fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)" }}>Years together</div>
              </div>
              <div style={{ textAlign: "center", padding: "32px 20px", background: "var(--surface)", border: "1px solid var(--line)", borderTop: "3px solid var(--gold)" }}>
                <div style={{ fontFamily: "var(--display)", fontSize: "2.8rem", color: "var(--rani)", lineHeight: 1, marginBottom: "8px" }}>5</div>
                <div style={{ fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)" }}>Craft techniques</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Artisan profiles */}
      {artisans.map((a, i) => (
        <div className={`info-sec${i % 2 === 1 ? " alt" : ""}`} key={a.family}>
          <div className="wrap">
            <div style={{
              display: "grid",
              gridTemplateColumns: i % 2 === 0 ? "1fr 1.4fr" : "1.4fr 1fr",
              gap: "64px",
              alignItems: "center",
            }}>
              {i % 2 === 0 ? (
                <>
                  <div>
                    <div className="ph" style={{ paddingBottom: "125%" }}>
                      <img src={a.image} alt={a.family} />
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "10px", letterSpacing: "0.34em", textTransform: "uppercase", color: "var(--rani)", marginBottom: "6px" }}>
                      {a.region} · {a.craft}
                    </div>
                    <h2 style={{ marginBottom: "4px" }}>{a.family}</h2>
                    <div style={{ fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "20px" }}>{a.since}</div>
                    <p style={{ fontSize: "15.5px", lineHeight: "1.9" }}>{a.story}</p>
                    <div style={{ margin: "28px 0", padding: "24px 28px", borderLeft: "3px solid var(--rani)", background: "var(--rani-wash)" }}>
                      <p style={{ fontFamily: "var(--serif)", fontSize: "1.15rem", fontStyle: "italic", color: "var(--ink)", margin: 0 }}>
                        &ldquo;{a.quote}&rdquo;
                      </p>
                    </div>
                    <div style={{ padding: "20px 24px", background: "var(--bg-2)", borderTop: "1px solid var(--line-2)" }}>
                      <div style={{ fontSize: "10px", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "6px" }}>Technique</div>
                      <p style={{ fontSize: "13px", color: "var(--ink-soft)", margin: 0 }}>{a.technique}</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <div style={{ fontSize: "10px", letterSpacing: "0.34em", textTransform: "uppercase", color: "var(--rani)", marginBottom: "6px" }}>
                      {a.region} · {a.craft}
                    </div>
                    <h2 style={{ marginBottom: "4px" }}>{a.family}</h2>
                    <div style={{ fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "20px" }}>{a.since}</div>
                    <p style={{ fontSize: "15.5px", lineHeight: "1.9" }}>{a.story}</p>
                    <div style={{ margin: "28px 0", padding: "24px 28px", borderLeft: "3px solid var(--rani)", background: "var(--rani-wash)" }}>
                      <p style={{ fontFamily: "var(--serif)", fontSize: "1.15rem", fontStyle: "italic", color: "var(--ink)", margin: 0 }}>
                        &ldquo;{a.quote}&rdquo;
                      </p>
                    </div>
                    <div style={{ padding: "20px 24px", background: "var(--bg-2)", borderTop: "1px solid var(--line-2)" }}>
                      <div style={{ fontSize: "10px", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "6px" }}>Technique</div>
                      <p style={{ fontSize: "13px", color: "var(--ink-soft)", margin: 0 }}>{a.technique}</p>
                    </div>
                  </div>
                  <div>
                    <div className="ph" style={{ paddingBottom: "125%" }}>
                      <img src={a.image} alt={a.family} />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Commitment */}
      <div className="info-quote-band">
        <div className="wrap">
          <blockquote>
            &ldquo;The block my grandfather carved in 1962 pressed the fabric in your hands today. That is not a supply chain. That is a family.&rdquo;
          </blockquote>
          <cite>Mohammad Salim Chippa, Block Printer — Sanganer</cite>
        </div>
      </div>

      <div className="info-sec">
        <div className="wrap">
          <div className="info-narrow">
            <div className="eyebrow" style={{ marginBottom: "12px" }}>Our Commitment</div>
            <h2>How We Honour Our Makers</h2>
            <ul>
              <li>All artisan partners receive above-minimum-wage compensation, benchmarked annually.</li>
              <li>We purchase in advance — no consignment — so karigar families have financial certainty before production begins.</li>
              <li>We support skills-transfer workshops so younger karigars can learn from masters.</li>
              <li>We credit our makers on every product page where their work appears.</li>
              <li>5% of annual revenue is reinvested directly into artisan welfare initiatives.</li>
            </ul>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
