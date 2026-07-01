"use client";

import { useSite } from "../app/context/SiteContext"; // adjust path if needed

const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://www.instagram.com/grandpools_aus/", src: "/ig.svg" },
  { label: "Facebook",  href: "https://facebook.com",  src: "/Facebook.svg" },
  { label: "LinkedIn",  href: "https://linkedin.com",  src: "/linkedin.svg" },
  { label: "YouTube",   href: "https://youtube.com",  src: "/yt.svg" },
];

export default function Footer() {
  const { smootherRef } = useSite();

  const scrollToTop = () => {
    if (smootherRef?.current) {
      smootherRef.current.scrollTo(0, true); // true = smooth
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer
      style={{
        position: "relative",
        width: "100%",
        zIndex: 20,
        boxSizing: "border-box",
      }}
    >
      {/* Background / Container */}
      <div
        style={{
          width: "100%",
          overflow: "hidden",
          padding: "56px 56px 32px",
        }}
        className="px-6 md:px-14"
      >
        {/* ══════════════════════════════════════
            ROW 1: Big Logo Wordmark Centered
        ══════════════════════════════════════ */}
        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            marginBottom: 48,
          }}
        >
          <img
            src="/Footer.svg"
            alt="Grand Pools"
            style={{
              width: "100%",
              maxWidth: "1920px",
              height: "auto",
              display: "block",
              pointerEvents: "none",
              userSelect: "none",
            }}
          />
        </div>

        {/* ══════════════════════════════════════
            ROW 2: Link Column Grid
        ══════════════════════════════════════ */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "start",
            gap: "20%", /* Adjusts the space between Column 1 and Column 2 */
            marginBottom: 48,
          }}
        >
          {/* Col 1 — Main Nav links */}
          <nav style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 12 }}>
            {[
              { item: "Home", href: "/" },
              { item: "Services", href: "/services" },
              { item: "Projects", href: "/projects" },
              { item: "Contact", href: "/contact" },
              { item: "About", href: "/about" }
            ].map(({ item, href }) => (
              <a
                key={item}
                href={href}
                style={{
                  color: "#F4EBE4",
                  fontSize: 15,
                  textDecoration: "none",
                  fontFamily: "var(--font-body)",
                  transition: "opacity 0.2s ease",
                  width: "fit-content",
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = "0.7"; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
              >
                {item}
              </a>
            ))}
          </nav>

          {/* Col 2 — Service Capabilities list (Perfectly Left Aligned alongside Col 1) */}
          <nav style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 12 }}>
            {[
              { item: "New Pool Construction", href: "/services/new-pool-construction" },
              { item: "Concrete Pool Renovations", href: "/services/concrete-pool-renovations" },
              { item: "Pool Equipment & Installation", href: "/services/pool-equipment-and-installation" },
              { item: "Commercial Pool Construction", href: "/services/commercial-pool-construction" },
            ].map(({ item, href }) => (
              <a
                key={item}
                href={href}
                style={{
                  color: "#F4EBE4",
                  fontSize: 16,
                  textDecoration: "none",
                  fontFamily: "var(--font-body)",
                  transition: "opacity 0.2s ease",
                  width: "fit-content",
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = "0.7"; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
              >
                {item}
              </a>
            ))}
          </nav>

          {/* Col 3 — Contact Info & Social Icons (Pushed entirely to the Right edge) */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", marginLeft: "auto", gap: 8 }}>
            <a
              href="tel:0422630394"
              style={{
                color: "#F4EBE4",
                fontSize: 16,
                textDecoration: "none",
                fontFamily: "var(--font-body)",
                textAlign: "right",
                transition: "opacity 0.2s ease",
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = "0.7"; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
            >
              0422 630 394
            </a>
            <a
              href="mailto:admin@grandpools.com.au"
              style={{
                color: "#F4EBE4",
                fontSize: 16,
                textDecoration: "none",
                fontFamily: "var(--font-body)",
                textAlign: "right",
                transition: "opacity 0.2s ease",
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = "0.7"; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
            >
              admin@grandpools.com.au
            </a>

            {/* Social icons row */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 12 }}>
              {SOCIAL_LINKS.map(({ label, href, src }) => (
                <SocialLink key={label} href={href} label={label} src={src} />
              ))}
            </div>
          </div>
        </div>

        {/* Divider Line */}
        <div
          style={{ height: "1px", background: "#F4EBE4", marginBottom: 20 }}
          className="w-full"
        />

        {/* ══════════════════════════════════════
            ROW 3: Legal Terms & Author Attribution
        ══════════════════════════════════════ */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
          }}
          className="text-xs md:text-sm"
        >
          <span style={{ color: "#F4EBE4",  fontFamily: "var(--font-body)" }}>
            © 2026 Grand Pools. All rights reserved.
          </span>

          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            <BottomLink href="/terms-of-use">Terms of Use</BottomLink>
            <BottomLink href="/privacy-policy">Privacy Policy</BottomLink>
          </div>

          <span
            style={{
              color: "#F4EBE4",
              fontFamily: "var(--font-body)",
            }}
          >
            Design &amp; Development by{" "}
            <a
              href="#"
              style={{ color: "#F4EBE4", textDecoration: "none", fontWeight: 500, opacity: 1, transition: "opacity 0.2s ease" }}
              onMouseEnter={e => { e.currentTarget.style.opacity = "0.7"; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
            >
              Tactik
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}

/* ── Helper components ── */

function ScrollTopButton({ onClick, size = 44 }: { onClick: () => void; size?: number }) {
  return (
    <button
      onClick={onClick}
      aria-label="Scroll to top"
      style={{
        width: size,
        height: size,
        background: "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        padding: 0,
        border: "none"
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '24px' }}>
        <span style={{ display: 'block', height: '2px', width: '100%', background: '#F4EBE4' }}></span>
        <span style={{ display: 'block', height: '2px', width: '100%', background: '#F4EBE4' }}></span>
      </div>
    </button>
  );
}

function SocialLink({ href, label, src, size = 20 }: { href: string; label: string; src: string; size?: number }) {
  return (
    <a
      href={href}
      aria-label={label}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        textDecoration: "none",
        transition: "opacity 0.2s ease",
      }}
      onMouseEnter={e => { e.currentTarget.style.opacity = "0.7"; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
    >
      <img
        src={src}
        alt={label}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          display: "block",
        }}
      />
    </a>
  );
}

function BottomLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      style={{
        color: "#F4EBE4",
        fontFamily: "var(--font-body)",
        textDecoration: "none",
        transition: "opacity 0.2s ease",
      }}
      onMouseEnter={e => { e.currentTarget.style.opacity = "0.7"; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
    >
      {children}
    </a>
  );
}