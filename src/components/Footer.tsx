// components/Footer.tsx
"use client";

const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://www.instagram.com/grandpools_aus/", src: "/ig.svg" },
  { label: "Facebook",  href: "https://facebook.com",  src: "/Facebook.svg" },
  { label: "LinkedIn",  href: "https://linkedin.com",  src: "/linkedin.svg" },
  { label: "YouTube",   href: "https://youtube.com",   src: "/yt.svg" },
];

export default function Footer() {
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
        {/* Top section — Nav | Contact | Socials */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            alignItems: "center",
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

          {/* Center — Contact details */}
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
          </div>

          {/* Right — Social icons */}
          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 14 }}>
            {SOCIAL_LINKS.map(({ label, href, src }) => (
              <SocialLink key={label} href={href} label={label} src={src} />
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, margin: "0 48px", background: "#F4EBE4" }} />

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
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

        {/* Large Footer Logo Wordmark */}
        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            marginTop: 60,
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

function SocialLink({ href, label, src }: { href: string; label: string; src: string }) {
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
        width: 22,
        height: 22,
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