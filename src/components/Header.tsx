"use client";

interface HeaderProps {
  visible: boolean;
}

export default function Header({ visible }: HeaderProps) {
  return (
    <header style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      padding: "16px 24px",
      display: "flex",
      alignItems: "center",
    }}>
      {/*
        Outer wrapper keeps the layout slot.
        id="header-logo" is toggled by React for the final reveal.
      */}
      <div
        id="header-logo"
        style={{
          opacity: visible ? 1 : 0,
        }}
      >
        {/*
          id="header-logo-inner" is what the preloader MEASURES.
          It is rendered at the SAME base size as the preloader logo
          (svg 36×36, font clamp(28px,5vw,56px)) but scaled down via
          CSS transform so it visually appears as the small header logo.
          GSAP reads its getBoundingClientRect() which reflects the
          post-transform size — so the scale math lands perfectly.
        */}
        <div
          id="header-logo-inner"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            whiteSpace: "nowrap",
            transformOrigin: "left center",
            transform: "scale(0.32)",   // tweak this to set your final header logo size
          }}
        >
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="18" cy="18" r="17" stroke="#ffffff" strokeWidth="2" />
            <path d="M10 22 Q18 10 26 22" stroke="#ffffff" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
            <path d="M10 26 Q18 14 26 26" stroke="rgba(255,255,255,0.45)" strokeWidth="2" fill="none" strokeLinecap="round"/>
          </svg>
          <span style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontWeight: 800,
            fontSize: "clamp(28px, 5vw, 56px)",
            color: "#ffffff",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}>
            GRAND POOLS
          </span>
        </div>
      </div>
    </header>
  );
}