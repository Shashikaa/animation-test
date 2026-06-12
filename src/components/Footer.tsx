// components/Footer.tsx
"use client";

import { useSite } from "../app/context/SiteContext"; // adjust path if needed

const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://www.instagram.com/grandpools_aus/", src: "/ig.svg" },
  { label: "Facebook",  href: "https://facebook.com",  src: "/Facebook.svg" },
  { label: "LinkedIn",  href: "https://linkedin.com",  src: "/linkedin.svg" },
  { label: "YouTube",   href: "https://youtube.com",   src: "/yt.svg" },
];

export default function Footer() {
  const { lenisRef } = useSite();

  const scrollToTop = () => {
    if (lenisRef?.current) {
      lenisRef.current.scrollTo(0, { duration: 1.5 });
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
      {/* Glassmorphic block */}
      <div
        style={{
          width: "100%",
          background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          borderBottom: "2px solid rgba(255,255,255,0.10)",

          boxShadow: "0 8px 48px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)",
          overflow: "hidden",
        }}
      >
        {/* ══════════════════════════════════════
            DESKTOP — Top section: Nav | Contact+Socials | Scroll-to-top
        ══════════════════════════════════════ */}
        <div
          className="hidden md:grid"
          style={{
            gridTemplateColumns: "1fr 1fr 1fr",
            alignItems: "start",
            padding: "56px 56px 80px",
            gap: 32,
          }}
        >
          {/* Left — Nav links */}
          <nav style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {["Home", "Services", "Projects", "Contact"].map((item) => (
                  <a
                key={item}
                href="#"
                style={{
                  color: "#F4EBE4",
                  fontSize: 16,
                  textDecoration: "none",
                  fontFamily: "var(--font-body)",
                  transition: "color 0.2s ease",
                }}
              >
                {item}
              </a>
            ))}
          </nav>

          {/* Center — Contact details + Social icons below */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
                <a
              href="tel:0422630394"
              style={{
                color: "#F4EBE4",
                fontSize: 16,
                textDecoration: "none",
                fontFamily: "var(--font-body)",
              }}
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
              }}
            >
              admin@grandpools.com.au
            </a>

            {/* Social icons — now under contact details */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 12 }}>
              {SOCIAL_LINKS.map(({ label, href, src }) => (
                <SocialLink key={label} href={href} label={label} src={src} />
              ))}
            </div>
          </div>

          {/* Right — Scroll-to-top button */}
          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "flex-start" }}>
            <ScrollTopButton onClick={scrollToTop} size={44} />
          </div>
        </div>

        {/* ══════════════════════════════════════
            MOBILE — Top section:
            Row 1: Scroll-to-top button
            Row 2: Nav links
            Row 3: Contact + Socials
        ══════════════════════════════════════ */}
        <div
          className="flex md:hidden"
          style={{
            flexDirection: "column",
            padding: "32px 24px 56px",
            gap: 28,
          }}
        >
          {/* Row 1 — scroll-to-top button */}
          <div style={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
            <ScrollTopButton onClick={scrollToTop} size={36} />
          </div>

          {/* Row 2 — Nav links | Contact details + Social icons */}
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%", gap: 24 }}>
            <nav style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {["Home", "Services", "Projects", "Contact"].map((item) => (
                    <a
                  key={item}
                  href="#"
                  style={{
                    color: "#F4EBE4",
                    fontSize: 15,
                    textDecoration: "none",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {item}
                </a>
              ))}
            </nav>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                  <a
                href="tel:0422630394"
                style={{
                  color: "#F4EBE4",
                  fontSize: 15,
                  textDecoration: "none",
                  fontFamily: "var(--font-body)",
                  textAlign: "right",
                }}
              >
                0422 630 394
              </a>
                  <a
                href="mailto:admin@grandpools.com.au"
                style={{
                  color: "#F4EBE4",
                  fontSize: 15,
                  textDecoration: "none",
                  fontFamily: "var(--font-body)",
                  textAlign: "right",
                }}
              >
                admin@grandpools.com.au
              </a>
              <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 8 }}>
                {SOCIAL_LINKS.map(({ label, href, src }) => (
                  <SocialLink key={label} href={href} label={label} src={src} size={20} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Divider — shared */}
        <div
          className="hidden md:block"
          style={{ height: 1, margin: "0 48px", background: "#F4EBE4" }}
        />
        <div
          className="block md:hidden"
          style={{ height: 1, margin: "0 24px", background: "#F4EBE4" }}
        />

        {/* ══════════════════════════════════════
            DESKTOP — Bottom bar
        ══════════════════════════════════════ */}
        <div
          className="hidden md:flex"
          style={{
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 48px",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <span style={{ color: "#F4EBE4", fontSize: 16, fontFamily: "var(--font-body)" }}>
            © 2026 Grand Pools. All rights reserved.
          </span>

          <div style={{ display: "flex", gap: 24, alignItems: "center", color: "#F4EBE4", fontSize: 16 }}>
            <BottomLink href="#">Terms of Use</BottomLink>
            <BottomLink href="#">Privacy Policy</BottomLink>
          </div>

          <span
            style={{
              color: "#F4EBE4",
              fontSize: 16,
              fontFamily: "var(--font-body)",
              letterSpacing: "0.03em",
            }}
          >
            Design &amp; Development by{" "}
                <a
              href="#"
              style={{ color: "#F4EBE4", textDecoration: "none", transition: "color 0.2s ease", fontWeight: 500 }}
            >
              Tactik
            </a>
          </span>
        </div>

        {/* ══════════════════════════════════════
            MOBILE — Bottom bar
        ══════════════════════════════════════ */}
        <div
          className="flex md:hidden"
          style={{
            flexDirection: "column",
            alignItems: "flex-start",
            padding: "20px 24px",
            gap: 16,
          }}
        >
          {/* Row 1: Terms/Privacy (left) | Copyright (right) */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              width: "100%",
              gap: 22,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <BottomLink href="#">Terms of Use</BottomLink>
              <BottomLink href="#">Privacy Policy</BottomLink>
            </div>

            <span
              style={{
                color: "#F4EBE4",
                fontSize: 14,
                fontFamily: "var(--font-body)",
                textAlign: "right",
                width: "40%",
              }}
            >
              © 2026 Grand Pools. All rights reserved.
            </span>
          </div>

          {/* Row 2: Design & Development by Tactik */}
          <span
            style={{
              color: "#F4EBE4",
              fontSize: 14,
              fontFamily: "var(--font-body)",
              marginTop: "32px",
            }}
          >
            Design &amp; Development by{" "}
                <a
              href="#"
              style={{ color: "#F4EBE4", textDecoration: "none", fontWeight: 500 }}
            >
              Tactik
            </a>
          </span>
        </div>

        {/* Large Footer Logo Wordmark — shared */}
        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            marginTop: 32,
          }}
        >
          <img
            src="/Footer-Logo.svg"
            alt="Grand Pools"
            style={{
              width: "94%",
              maxWidth: "80%",
              height: "auto",
              display: "block",
              verticalAlign: "bottom",
              pointerEvents: "none",
              userSelect: "none",
            }}
          />
        </div>
      </div>
    </footer>
  );
}

/* ── Helper components ── */

function ScrollTopButton({ onClick, size = 50 }: { onClick: () => void; size?: number }) {
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
        pointerEvents: "auto",
        flexShrink: 0,
        padding: 0,
      }}
    >
      <img
        src="/scrolltop.svg"
        alt=""
        aria-hidden
        style={{
          width: "60%",
          height: "60%",
          objectFit: "contain",
          pointerEvents: "none",
        }}
      />
    </button>
  );
}

function SocialLink({ href, label, src, size = 22 }: { href: string; label: string; src: string; size?: number }) {
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
        flexShrink: 0,
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
          pointerEvents: "none",
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
        fontSize: 16,
        fontFamily: "var(--font-body)",
        textDecoration: "none",
        transition: "color 0.2s ease",
      }}
    >
      {children}
    </a>
  );
}