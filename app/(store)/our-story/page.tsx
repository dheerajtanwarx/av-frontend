import type { Metadata } from "next";
import Header from "../components/landing/Header";
import Footer from "../components/landing/Footer";
import ScrollReveal from "../components/landing/ScrollReveal";

export const metadata: Metadata = {
  title: "Our Story — AV Creation",
  description: "The story of AV Creation — a Jaipuri atelier born from a love of Rajasthani craft and the belief that heritage should live in everyday elegance.",
};

export default function OurStoryPage() {
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
          <h1>Our Story</h1>
          <p>From a single workshop in the lanes of Sanganer to wardrobes across the world.</p>
          <div className="orn" style={{ marginTop: "44px" }}><span className="d">✦</span></div>
        </div>
      </div>

      {/* Origin story */}
      <div className="info-sec">
        <div className="wrap">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "72px", alignItems: "center" }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: "14px" }}>How It Began</div>
              <h2>Born in Sanganer</h2>
              <p>
                AV Creation was born in a single room in Sanganer — the block-printing village that has coloured Jaipur&apos;s soul for five centuries. Our founder, Asha Verma, grew up watching her grandmother wrap herself in an odhni the colour of pomegranate seeds, block-stamped with a kairi motif that no machine has ever replicated.
              </p>
              <p>
                When Asha returned to Rajasthan after a decade in the garment trade, she came back with one conviction: the craft that raised her deserved a stage worthy of it. That conviction became AV Creation in 2018 — a small atelier, a handful of karigars, and the Jaipuri Odhni as its founding garment.
              </p>
              <p>
                We believed then, as we believe now, that heritage clothing is not museum-worthy relic. It is meant to be worn, loved, and passed down.
              </p>
            </div>
            <div>
              <div className="ph" style={{ paddingBottom: "120%" }}>
                <img src="https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?w=800&q=78&auto=format&fit=crop" alt="Sanganer workshop" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quote */}
      <div className="info-quote-band">
        <div className="wrap">
          <blockquote>
            &ldquo;We do not make clothes. We make heirlooms for women who are still alive to wear them.&rdquo;
          </blockquote>
          <cite>Asha Verma, Founder — AV Creation</cite>
        </div>
      </div>

      {/* Timeline */}
      <div className="info-sec alt">
        <div className="wrap">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "72px", alignItems: "start" }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: "14px" }}>Journey</div>
              <h2>Milestones</h2>
              <p>Eight years of craft, community, and colour.</p>
              <div style={{ marginTop: "16px" }}>
                <div className="ph" style={{ paddingBottom: "80%" }}>
                  <img src="https://images.unsplash.com/photo-1611042553365-9b101441c135?w=800&q=78&auto=format&fit=crop" alt="Artisan at work" />
                </div>
              </div>
            </div>
            <div>
              <div className="info-timeline">
                {[
                  { year: "2018", title: "Founded in Sanganer", text: "Six karigars. One room. The Jaipuri Odhni as our first piece — hand block-printed, naturally dyed, finished entirely by hand." },
                  { year: "2019", title: "First wholesale collection", text: "Sixty pieces. Twenty odhnis, twenty lehengas, twenty dupattas. Every piece sells in three weeks." },
                  { year: "2020", title: "Artisan collective expands to Bagru", text: "Three Bagru printing families join. Dabu mud-resist technique and natural indigo enter the colour palette." },
                  { year: "2021", title: "First international order", text: "A customer in London finds us on Instagram. Within three months we are shipping to twelve countries." },
                  { year: "2023", title: "Jaipur flagship store opens", text: "Our atelier-store opens in Sanganer. Customers can watch the printing and meet the karigars." },
                  { year: "2024", title: "avcreation.in launches", text: "Heritage craft, directly to your door — from our hands to yours." },
                  { year: "2026", title: "Today", text: "Forty karigars. Two collections a year. The Jaipuri Odhni, still at the heart of our house." },
                ].map((m) => (
                  <div className="info-timeline-item" key={m.year}>
                    <div className="year">{m.year}</div>
                    <h3>{m.title}</h3>
                    <p>{m.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="info-sec">
        <div className="wrap">
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <div className="eyebrow" style={{ marginBottom: "12px" }}>What Guides Us</div>
            <h2>Our Beliefs</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "28px" }}>
            {[
              { num: "01", title: "Craft First", text: "Every design begins with a conversation with our karigars. Their skill is the product — we are its curators." },
              { num: "02", title: "Roots, Not Trends", text: "We are not a brand that borrows Indian motifs for a season. We are rooted — in craft, in place, in people." },
              { num: "03", title: "Heirloom Standard", text: "We build every piece to survive three decades and a hundred washes. If it can&apos;t, we don&apos;t make it." },
            ].map((v) => (
              <div key={v.num} style={{ padding: "36px 28px", borderTop: "3px solid var(--gold)", background: "var(--bg-2)" }}>
                <div style={{ fontFamily: "var(--display)", fontSize: "2.5rem", color: "var(--rani)", lineHeight: 1, marginBottom: "16px" }}>{v.num}</div>
                <h3 style={{ fontFamily: "var(--display)", fontSize: "1.2rem", color: "var(--ink)", marginBottom: "10px" }}>{v.title}</h3>
                <p style={{ fontSize: "14px", color: "var(--ink-soft)", lineHeight: 1.8, margin: 0 }} dangerouslySetInnerHTML={{ __html: v.text }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
