import type { Metadata } from "next";
import Header from "../components/landing/Header";
import Footer from "../components/landing/Footer";
import ScrollReveal from "../components/landing/ScrollReveal";

export const metadata: Metadata = {
  title: "Fabric Care — AV Creation",
  description: "Care instructions for your AV Creation handcrafted pieces — Chanderi, Georgette, Silk and Cotton block-print.",
};

const fabrics = [
  {
    name: "Chanderi",
    origin: "Chanderi, Madhya Pradesh",
    tag: "Delicate Weave",
    image: "https://images.unsplash.com/photo-1611042553365-9b101441c135?w=600&q=78&auto=format&fit=crop",
    about: "A whisper-light weave of silk and cotton with a natural lustre. Chanderi is delicate — treat it gently to preserve its gossamer drape.",
    icons: [["🫧","Hand Wash"],["🌡️","Cold Water"],["🚫","No Tumble Dry"],["🌬️","Shade Dry"],["🧲","Low Iron"]],
    tips: [
      "Hand wash separately in cold water with mild or reetha (soapnut) detergent.",
      "Never wring — gently squeeze and roll in a clean towel to remove moisture.",
      "Dry flat in shade; direct sunlight fades natural dyes.",
      "Iron on the reverse side at low heat while slightly damp.",
      "Store in a muslin bag away from humidity.",
    ],
  },
  {
    name: "Georgette",
    origin: "Woven in Varanasi",
    tag: "Block-Printed",
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&q=78&auto=format&fit=crop",
    about: "A flowing crepe-weave with a slightly textured surface. Our georgette is often hand block-printed with natural pigments — preserve the print with careful handling.",
    icons: [["🫧","Hand Wash"],["🌡️","Cool Water"],["🚫","No Bleach"],["🌬️","Hang Dry"],["🧲","Med Iron"]],
    tips: [
      "Hand wash in cool water (under 30 °C) with a colour-safe detergent.",
      "Do not soak for more than 10 minutes.",
      "Hang to dry on a padded hanger in the shade.",
      "Iron inside-out at medium heat — avoid steam on printed areas.",
      "Dry-clean recommended for embroidered georgette pieces.",
    ],
  },
  {
    name: "Pure Silk",
    origin: "Mysore &amp; Kanchipuram",
    tag: "Heritage Weave",
    image: "https://images.unsplash.com/photo-1583846783214-7229a91b20ed?w=600&q=78&auto=format&fit=crop",
    about: "The queen of fabrics. Our silks are often printed with Dabu mud-resist or Shibori tie-dye. Handle with the care an heirloom deserves.",
    icons: [["✋","Dry-Clean"],["🌡️","Cold Water"],["🚫","No Spin"],["🌬️","Shade Dry"],["🧲","Silk Setting"]],
    tips: [
      "Dry-clean is strongly recommended for all pure silk pieces.",
      "If hand washing, use cold water and a silk-specific detergent — never rub.",
      "Do not wring. Roll in a towel to blot moisture, then hang in shade.",
      "Iron on the silk/low setting on the reverse; never on prints or embroidery.",
      "Store in breathable muslin — never plastic. Re-fold along different lines every few months.",
    ],
  },
  {
    name: "Cotton",
    origin: "Sanganer &amp; Bagru, Rajasthan",
    tag: "Natural Dye",
    image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=78&auto=format&fit=crop",
    about: "Block-printed with vegetable dyes — indigo, alizarin, pomegranate rind, and haldi. The first few washes may release a little dye; this is natural and stops quickly.",
    icons: [["🫧","Gentle Wash"],["🌡️","Cold Water"],["✅","Mild Detergent"],["🌬️","Shade Dry"],["🧲","Med Iron"]],
    tips: [
      "Wash separately for the first two washes — natural dyes can run slightly.",
      "Machine wash on gentle/delicate in cold water, or hand wash.",
      "Use a mild or plant-based detergent; avoid bleach.",
      "Dry in the shade — prolonged sun fades natural dyes over time.",
      "Iron at medium heat while slightly damp for a crisp finish.",
    ],
  },
];

export default function FabricCarePage() {
  return (
    <div className="av">
      <ScrollReveal />
      <Header />

      {/* Hero */}
      <div className="info-hero">
        <div
          className="info-hero-bg"
          style={{ backgroundImage: "url(https://images.unsplash.com/photo-1583846783214-7229a91b20ed?w=1600&q=78&auto=format&fit=crop)" }}
        />
        <div className="wrap" style={{ position: "relative" }}>
          <div className="eyebrow">Help</div>
          <h1>Fabric Care</h1>
          <p>Every piece leaving our atelier is made to last generations. Find your fabric below and care for it accordingly.</p>
          <div className="orn" style={{ marginTop: "44px" }}><span className="d">✦</span></div>
        </div>
      </div>

      {/* Fabric cards */}
      {fabrics.map((fabric, i) => (
        <div className={`info-sec${i % 2 === 1 ? " alt" : ""}`} key={fabric.name}>
          <div className="wrap">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: "64px", alignItems: "start" }}>
              {/* Image */}
              <div>
                <div className="ph" style={{ paddingBottom: "130%", borderRadius: 0 }}>
                  <img src={fabric.image} alt={fabric.name} />
                </div>
              </div>
              {/* Content */}
              <div>
                <div style={{ fontSize: "10px", letterSpacing: "0.34em", textTransform: "uppercase", color: "var(--rani)", marginBottom: "6px" }}>
                  {fabric.origin} · {fabric.tag}
                </div>
                <h2 style={{ marginBottom: "14px" }}>{fabric.name}</h2>
                <p dangerouslySetInnerHTML={{ __html: fabric.about }} />

                {/* Icons */}
                <div className="fabric-icons">
                  {fabric.icons.map(([emoji, label]) => (
                    <div className="fabric-icon" key={label}>
                      <div className="fabric-icon-circle">{emoji}</div>
                      <span>{label}</span>
                    </div>
                  ))}
                </div>

                {/* Tips */}
                <div style={{ marginTop: "28px" }}>
                  <div style={{ fontSize: "10px", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "12px" }}>Care Instructions</div>
                  <ul>
                    {fabric.tips.map((tip) => (
                      <li key={tip}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* General rules */}
      <div className="info-quote-band">
        <div className="wrap">
          <blockquote>
            &ldquo;A garment cared for with love outlives every trend that ever existed.&rdquo;
          </blockquote>
          <cite>AV Creation — House Philosophy</cite>
        </div>
      </div>

      <div className="info-sec">
        <div className="wrap">
          <div className="info-narrow">
            <div className="eyebrow" style={{ marginBottom: "12px" }}>Universal Care</div>
            <h2>Rules for Every AV Creation Piece</h2>
            <ul>
              <li>Always store in a breathable bag or wrapped in muslin — never plastic.</li>
              <li>Apply perfume and deodorant before dressing; direct contact can stain delicate fabrics.</li>
              <li>Handle zari, gota, or sequin-embellished sections with care during washing.</li>
              <li>For long-term storage, add a neem or lavender sachet to deter insects naturally.</li>
              <li>When in doubt, dry-clean — it is always the safest option.</li>
            </ul>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
