import Link from "next/link";
import { footerCols } from "../../lib/landing-data";
import { Facebook, Instagram, Youtube, WhatsApp } from "./Icons";

export default function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="foot-top">
          <div className="foot-brand">
            <div className="mark">AV CREATION</div>
            <div className="subm">Jaipuri Atelier · Rajasthan</div>
            <p>
              Heritage Rajasthani craft, reimagined for the modern woman. Hand-finished by
              artisans across Jaipur, Sanganer and Bagru — with the Jaipuri Odhni at the heart of
              our house.
            </p>
            <div className="foot-social">
              <a href="https://www.instagram.com/jaipuri_odhni/" aria-label="Instagram">
                <Instagram />
              </a>
              <a href="https://www.facebook.com/people/Jaipuri-odhana/61561262172120/?ref=NONE_xav_ig_profile_page_web" aria-label="Facebook">
                <Facebook />
              </a>
              <a href="https://www.youtube.com/@jaipuri_odhani" aria-label="Youtube">
                <Youtube />
              </a>
              <a href="#" aria-label="WhatsApp">
                <WhatsApp />
              </a>
            </div>
          </div>
          {footerCols.map((col) => (
            <div className="foot-col" key={col.title}>
              <h4>{col.title}</h4>
              {col.links.map((l) => (
                <Link href={l.href} key={l.label}>
                  {l.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
        <div className="foot-bot">
          <div>© 2026 AV Creation. Crafted with care in Jaipur, Rajasthan.</div>
          <div className="pay">
            <span>UPI</span>
            <span>Visa</span>
            <span>Mastercard</span>
            <span>COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
