import type { Metadata } from "next";
import Header from "../components/landing/Header";
import Footer from "../components/landing/Footer";
import ScrollReveal from "../components/landing/ScrollReveal";

export const metadata: Metadata = {
  title: "Stores — AV Creation",
  description: "Visit an AV Creation atelier. Our Jaipur flagship in Sanganer is open six days a week — watch the craft, meet the karigars, and take home a piece made for you.",
};

const stores = [
  {
    badge: "Flagship Atelier",
    name: "Sanganer, Jaipur",
    sub: "The heart of the house",
    image: "/shop-images/bassi-shop.jpeg",
    address: ["Plot 14, Sanganer Main Road", "Near Jaipuri Bazaar, Sanganer", "Jaipur, Rajasthan — 302 029"],
    hours: [
      ["Monday – Saturday", "10:00 AM – 7:00 PM"],
      ["Sunday", "11:00 AM – 5:00 PM"],
    ],
    phone: "+91 98765 43210",
    email: "jaipur@avcreation.in",
    note: "Our atelier is part boutique, part workshop. On most mornings you can watch our karigars block-printing live. Personal styling sessions available on appointment.",
    accentColor: "var(--gold)",
  },
  {
    badge: "Pop-Up Studio",
    name: "Shahpur Jat, New Delhi",
    sub: "The Delhi edit",
    image: "/shop-images/khaniya-shop.jpeg",
    address: ["Shop 7, Second Floor, Shabnam Complex", "Shahpur Jat, New Delhi — 110 049"],
    hours: [
      ["Wednesday – Sunday", "11:00 AM – 8:00 PM"],
      ["Monday – Tuesday", "Closed"],
    ],
    phone: "+91 98765 12340",
    email: "delhi@avcreation.in",
    note: "Our Delhi studio carries a curated selection of bestsellers and current collection. New stock arrives every two weeks directly from the Jaipur atelier.",
    accentColor: "var(--rani)",
  },
];

export default function StoresPage() {
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
          <div className="eyebrow">The House</div>
          <h1>Our Stores</h1>
          <p>Come and see the craft in person. Our doors are open — and so are our workbenches.</p>
          <div className="orn" style={{ marginTop: "44px" }}><span className="d">✦</span></div>
        </div>
      </div>

      {/* Store cards — horizontal scroll on mobile, grid on desktop */}
      <div className="info-sec">
        <div className="wrap">
          <div className="store-track">
            {stores.map((store) => (
              <article className="store-card" key={store.name}>
                <div className="store-card-img">
                  <img src={store.image} alt={store.name} />
                  <span className="store-card-badge">{store.badge}</span>
                </div>
                <StoreInfo store={store} />
              </article>
            ))}
          </div>
        </div>
      </div>

      {/* Styling session */}
      <div className="info-sec alt">
        <div className="wrap">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "64px", alignItems: "center" }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: "14px" }}>Personalised Service</div>
              <h2>Book a Styling Session</h2>
              <p>
                Visit our Jaipur atelier for a personal styling session with one of our in-house stylists. We will help you find the right pieces for a wedding, festive occasion, or everyday wardrobe — and where relevant, advise on custom embroidery and fit alterations.
              </p>
              <p>Sessions are complimentary and last approximately 45 minutes. Book by WhatsApp or email at least 48 hours in advance.</p>
              <div style={{ marginTop: "28px", display: "flex", gap: "16px" }}>
                <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="btn btn-rani">
                  WhatsApp Us →
                </a>
                <a href="/contact" className="btn btn-line">
                  Email Us
                </a>
              </div>
            </div>
            <div style={{ background: "var(--bg-2)", padding: "40px 36px", borderTop: "3px solid var(--rani)" }}>
              <div className="eyebrow" style={{ marginBottom: "16px" }}>Session Details</div>
              <ul>
                <li>45-minute personal styling session.</li>
                <li>Completely complimentary — no obligation to purchase.</li>
                <li>Helps with wedding, festive, or everyday wardrobe curation.</li>
                <li>Custom embroidery and fit alteration advice available.</li>
                <li>Book minimum 48 hours in advance.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Stockists */}
      <div className="info-cta-strip">
        <div className="wrap">
          <h3>Looking for AV Creation near you?</h3>
          <p>We work with a select number of boutiques across India. Write to us for the current stockist list.</p>
          <a href="mailto:trade@avcreation.in" className="btn btn-ink">trade@avcreation.in →</a>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function StoreInfo({ store }: { store: typeof stores[0] }) {
  return (
    <div className="store-card-body" style={{ borderTopColor: store.accentColor }}>
      <h2 style={{ marginBottom: "4px" }}>{store.name}</h2>
      <div style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "28px", letterSpacing: "0.04em" }}>{store.sub}</div>

      <div style={{ marginBottom: "24px" }}>
        <div style={{ fontSize: "10px", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "8px" }}>Address</div>
        {store.address.map((line) => (
          <div key={line} style={{ fontSize: "14px", color: "var(--ink-soft)", lineHeight: 1.75 }}>{line}</div>
        ))}
      </div>

      <div style={{ marginBottom: "24px" }}>
        <div style={{ fontSize: "10px", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "8px" }}>Hours</div>
        {store.hours.map(([days, time]) => (
          <div className="hours-row" key={days}>
            <span>{days}</span>
            <span>{time}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <a href={`tel:${store.phone.replace(/\s/g, "")}`} style={{ fontSize: "13.5px", color: "var(--rani)" }}>{store.phone}</a>
        <a href={`mailto:${store.email}`} style={{ fontSize: "13.5px", color: "var(--rani)" }}>{store.email}</a>
      </div>

      <p style={{ marginTop: "24px", fontSize: "13px", fontStyle: "italic", color: "var(--muted)", lineHeight: 1.75 }}>
        {store.note}
      </p>
    </div>
  );
}
