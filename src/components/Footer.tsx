"use client";

import { useSite } from "../app/context/SiteContext"; // adjust path if needed

const SOCIAL_LINKS = [
  { label: "YouTube",   href: "https://youtube.com",   src: "/yt.svg" },
  { label: "LinkedIn",  href: "https://linkedin.com",  src: "/linkedin.svg" },
  { label: "Instagram", href: "https://www.instagram.com/grandpools_aus/", src: "/ig.svg" },
  { label: "Facebook",  href: "https://facebook.com",  src: "/Facebook.svg" },
];

export default function Footer() {
  const { smootherRef } = useSite();

  return (
    <footer
      style={{
        position: "relative",
        width: "100%",
        zIndex: 20,
        boxSizing: "border-box",
      }}
    >
      {/* Dynamic Style Injection for Mobile and Tablet Layouts Only */}
      <style jsx global>{`
        @media (max-width: 1023px) {
          .responsive-row-2 {
            flex-direction: column !important;
            align-items: center !important;
            gap: 48px !important;
          }
          .responsive-links-container {
            width: 100% !important;
            justify-content: space-between !important;
            gap: 0px !important;
          }
          .responsive-socials-container {
            width: 100% !important;
            align-items: center !important;
            margin-left: 0 !important;
          }
          .desktop-only-contacts {
            display: none !important;
          }
          .mobile-only-row-4 {
            display: flex !important;
          }
          .desktop-only-row-4 {
            display: none !important;
          }
          .responsive-bottom-row {
            flex-direction: column !important;
            gap: 32px !important;
          }
          .responsive-attribution {
            width: 100% !important;
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
          }
          .responsive-attribution span {
            width: auto !important;
            text-align: left !important;
          }
        }
      `}</style>

{/* Background / Container */}
<div 
className="!px-[20px] md:!px-[30px] !pb-[20px] md:!pb-[30px] "
  style={{
    width: "100%",
    overflow: "hidden",
  }}
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
            marginBottom: 0,
          }}
        >
          <img
            src="/Footer.svg"
            alt="Grand Pools"
            style={{
              width: "100%",
              maxWidth: "1140px",
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
          className="responsive-row-2"
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "start",
            gap: "20%",
            marginBottom: 48,
          }}
        >
          {/* Wrapper around Col 1 & Col 2 to manage mobile/tablet space-between stretching cleanly */}
    <div 
  className="responsive-links-container flex flex-row justify-between lg:justify-start lg:gap-44  !text-[14px] md:!text-[16px]" 
  style={{ display: "flex", flexDirection: "row" }} // If you can, remove inline styles and use Tailwind's 'flex flex-row'
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

            {/* Col 2 — Service Capabilities list */}
  <nav className="flex flex-col !items-end lg:!items-start gap-3">
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
          </div>

          {/* Col 3 — Contact Info & Social Icons */}
          <div className="responsive-socials-container" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", marginLeft: "auto", gap: 8 }}>
            <div className="desktop-only-contacts  !text-[14px] md:!text-[16px]" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
              <a
                href="tel:0422630394"
                style={{
                  color: "#F4EBE4",
     
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
            </div>

            {/* Social icons row */}
            <div style={{ display: "flex", alignItems: "center", gap: 52, marginTop: 12 }}>
              {SOCIAL_LINKS.map(({ label, href, src }) => (
                <SocialLink key={label} href={href} label={label} src={src} size={24} />
              ))}
            </div>
          </div>
        </div>

        {/* Divider Line */}
        <div
          style={{ height: "1px", background: "#F4EBE4", marginBottom: 30 }}
          className="w-full"
        />

        {/* ══════════════════════════════════════
            ROW 3: Legal Terms & Author Attribution
        ══════════════════════════════════════ */}
        <div
          className="responsive-bottom-row  !text-[14px] md:!text-[16px]"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,

          }}
        >
          {/* Mobile Split Layout */}
          <div className="mobile-only-row-4 " style={{ display: "none", justifyContent: "space-between", alignItems: "flex-start", width: "100%" }}>
            <div className=" !text-[14px] md:!text-[16px]" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <BottomLink href="/terms-of-use">Terms of Use</BottomLink>
              <BottomLink href="/privacy-policy">Privacy Policy</BottomLink>
            </div>
            <div  style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12, textAlign: "right"}}>
              <a href="tel:0422630394" style={{ color: "#F4EBE4",  textDecoration: "none", fontFamily: "var(--font-body)" }}>
                0422 630 394
              </a>
              <a href="mailto:admin@grandpools.com.au" style={{ color: "#F4EBE4" , textDecoration: "none", fontFamily: "var(--font-body)" }}>
                admin@grandpools.com.au
              </a>
            </div>
          </div>

          {/* Original Desktop Order Elements */}
          <span className="desktop-only-row-4" style={{ color: "#F4EBE4", fontFamily: "var(--font-body)" }}>
            © 2026 Grand Pools. All rights reserved.
          </span>

          <div className="desktop-only-row-4  !text-[14px] md:!text-[16px]" style={{ display: "flex", gap: 24, alignItems: "center" }}>
            <BottomLink href="/terms-of-use">Terms of Use</BottomLink>
            <BottomLink href="/privacy-policy">Privacy Policy</BottomLink>
          </div>

          {/* Handled dynamic bottom attribution block for mobile screen switching layout */}
          <div className="responsive-attribution !text-[14px] md:!text-[16px] !pt-4" style={{ display: "contents" }}>
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

            {/* Mobile layout placement adjustment container for copy block */}
            <span className="mobile-only-row-4 !text-[14px] md:!text-[16px] !text-right" style={{ display: "none", color: "#F4EBE4",  fontFamily: "var(--font-body)" }}>
              © 2026 Grand Pools.<br />All rights reserved.
            </span>
          </div>

        </div>
      </div>
    </footer>
  );
}

/* ── Helper components ── */

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