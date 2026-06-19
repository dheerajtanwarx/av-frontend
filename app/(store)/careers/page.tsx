import type { Metadata } from "next";
import Header from "../components/landing/Header";
import Footer from "../components/landing/Footer";
import ScrollReveal from "../components/landing/ScrollReveal";

export const metadata: Metadata = {
  title: "Careers — AV Creation",
  description: "Join AV Creation. We are building a team that cares as deeply about craft as we do — open roles in design, customer experience, and artisan coordination.",
};

const roles = [
  {
    title: "Senior Design Lead",
    dept: "Design & Product",
    type: "Full-time",
    location: "Jaipur (on-site)",
    description: "Lead our two-collection-a-year design process from concept to production — working directly with our karigar partners in Sanganer and Bagru. You understand the hand that will execute your idea.",
    requirements: [
      "5+ years in Indian ethnic wear or artisan-textile design",
      "Hands-on experience with block printing, natural dyes, or embroidery",
      "Ability to communicate directly with karigar artisans",
      "Portfolio demonstrating garment design from concept to production",
    ],
  },
  {
    title: "Customer Experience Lead",
    dept: "Customer & Community",
    type: "Full-time",
    location: "Jaipur or Remote (India)",
    description: "Own the customer experience end-to-end — from pre-purchase queries to post-delivery care. You are warm, fast, and proud of the product you represent.",
    requirements: [
      "2+ years in customer experience, ideally in fashion or lifestyle",
      "Excellent written English and Hindi — warm, confident, clear",
      "Comfort with WhatsApp Business, email, and basic CRM tools",
      "A genuine interest in Indian handcraft and sustainable fashion",
    ],
  },
  {
    title: "Artisan Relations Coordinator",
    dept: "Production & Craft",
    type: "Full-time",
    location: "Jaipur (on-site, with travel to Sanganer & Bagru)",
    description: "Bridge AV Creation and our karigar network. Coordinate production schedules, monitor quality at source, support artisan welfare initiatives, and document the stories of the makers.",
    requirements: [
      "Experience working with craft clusters, NGOs, or artisan-facing organisations",
      "Fluent in Hindi; Rajasthani dialect knowledge is an advantage",
      "Organised, reliable, and comfortable in workshop environments",
      "A human-first approach to work",
    ],
  },
];

export default function CareersPage() {
  return (
    <div className="av">
      <ScrollReveal />
      <Header />

      {/* Hero */}
      <div className="info-hero">
        <div
          className="info-hero-bg"
          style={{ backgroundImage: "url(https://images.unsplash.com/photo-1574847872646-abff244bbd87?w=1600&q=78&auto=format&fit=crop)" }}
        />
        <div className="wrap" style={{ position: "relative" }}>
          <div className="eyebrow">The House</div>
          <h1>Careers</h1>
          <p>We are a small team that does meaningful work. If that sounds like you, read on.</p>
          <div className="orn" style={{ marginTop: "44px" }}><span className="d">✦</span></div>
        </div>
      </div>

      {/* Culture section */}
      <div className="info-sec">
        <div className="wrap">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "72px", alignItems: "center" }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: "14px" }}>Life at AV Creation</div>
              <h2>Why Work With Us</h2>
              <p style={{ fontSize: "15.5px", lineHeight: "1.9" }}>
                We are not a corporate fashion brand. We are a team of around twenty people — designers, coordinators, writers, and community builders — who believe that how something is made matters as much as how it looks.
              </p>
              <p>If you join us, you will work closely with the founders, with karigar artisans, and with customers who genuinely love what we make.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {[
                { icon: "🏺", title: "Big Ownership", text: "Small team. You will see your work in the world immediately." },
                { icon: "👗", title: "Wear What We Make", text: "Generous clothing allowance each season." },
                { icon: "🧵", title: "Workshop Access", text: "Spend time with karigar artisans and understand craft at source." },
                { icon: "⚖️", title: "Fair Pay", text: "Above-market salaries benchmarked annually, with performance bonuses." },
              ].map((b) => (
                <div key={b.title} style={{ padding: "24px 20px", background: "var(--bg-2)", borderTop: "3px solid var(--gold)" }}>
                  <div style={{ fontSize: "24px", marginBottom: "10px" }}>{b.icon}</div>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--ink)", marginBottom: "6px", letterSpacing: "0.03em" }}>{b.title}</div>
                  <div style={{ fontSize: "12.5px", color: "var(--muted)", lineHeight: 1.65 }}>{b.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Open roles */}
      <div className="info-sec alt">
        <div className="wrap">
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <div className="eyebrow" style={{ marginBottom: "12px" }}>Current Openings</div>
            <h2>Open Roles</h2>
          </div>
          <div className="info-narrow">
            {roles.map((role) => (
              <div className="role-card" key={role.title}>
                <div className="role-card-body">
                  <h3>{role.title}</h3>
                  <div className="role-meta">
                    <span>📂 {role.dept}</span>
                    <span>⏱ {role.type}</span>
                    <span>📍 {role.location}</span>
                  </div>
                  <p>{role.description}</p>
                  <ul>
                    {role.requirements.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                </div>
                <div className="role-cta">
                  <a
                    href={`mailto:careers@avcreation.in?subject=Application — ${encodeURIComponent(role.title)}`}
                    className="btn btn-ink"
                  >
                    Apply Now
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quote */}
      <div className="info-quote-band">
        <div className="wrap">
          <blockquote>
            &ldquo;We look for people who are curious about craft, kind to makers, and proud of what they help create.&rdquo;
          </blockquote>
          <cite>Asha Verma, Founder — AV Creation</cite>
        </div>
      </div>

      {/* Open application */}
      <div className="info-cta-strip">
        <div className="wrap">
          <h3>Don&apos;t see your role?</h3>
          <p>Send us a short note — who you are, what you do, and why you want to be here.</p>
          <a href="mailto:careers@avcreation.in" className="btn btn-rani">
            careers@avcreation.in →
          </a>
        </div>
      </div>

      <Footer />
    </div>
  );
}
