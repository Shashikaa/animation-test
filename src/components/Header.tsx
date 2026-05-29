"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { IconMark } from "./Preloader";

export const LOGO_FONT_SIZE   = 28;
export const LOGO_LETTER_SPC  = "0.32em";
export const LOGO_FONT_FAMILY = "'Cormorant Garamond', 'Didot', 'Georgia', serif";
export const LOGO_FONT_WEIGHT = 300;
export const LOGO_COLOR       = "#F4EEDF";
export const LOGO_ICON_W      = 84;
export const LOGO_ICON_H      = 68;
export const LOGO_GAP         = 8;

// ─── Menu icon ────────────────────────────────────────────────────────────────

function MenuIcon({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Open menu"
      className="menu-icon-btn"
      style={{
        background:    "none",
        border:        "none",
        cursor:        "pointer",
        padding:       "8px",
        display:       "flex",
        flexDirection: "column",
        alignItems:    "flex-end",
        gap:           "7px",
        outline:       "none",
        position:      "relative",
        zIndex:        2,
      }}
    >
      <span className="menu-line menu-line-top" />
      <span className="menu-line menu-line-bottom" />

      <style>{`
        .menu-line {
          display: block;
          height: 2px;
          background: ${LOGO_COLOR};
          border-radius: 1px;
          transition:
            width   0.48s cubic-bezier(0.76, 0, 0.24, 1),
            opacity 0.48s cubic-bezier(0.76, 0, 0.24, 1);
        }
        .menu-line-top    { width: 32px; opacity: 1; }
        .menu-line-bottom { width: 24px; opacity: 1; }
        .menu-icon-btn:hover .menu-line-top    { width: 24px; opacity: 1; }
        .menu-icon-btn:hover .menu-line-bottom { width: 32px; opacity: 1; }
      `}</style>
    </button>
  );
}
// ─── Logo ─────────────────────────────────────────────────────────────────────

function Logo({ onClick, href = "/" }: { onClick?: () => void; href?: string }) {
  const wordStyle: React.CSSProperties = {
    fontFamily:    LOGO_FONT_FAMILY,
    fontWeight:    LOGO_FONT_WEIGHT,
    fontSize:      LOGO_FONT_SIZE * 0.52,
    color:         LOGO_COLOR,
    letterSpacing: LOGO_LETTER_SPC,
    userSelect:    "none",
    whiteSpace:    "nowrap",
    lineHeight:    1,
    transition:    "opacity 0.3s ease",
  };

  return (
    <a
      href={href}
      onClick={onClick}
      aria-label="Grand Pools — go to homepage"
      id="header-logo-inner"
      style={{
        display:        "flex",
        alignItems:     "center",
        gap:            LOGO_GAP,
        position:       "relative",
        zIndex:         2,
        textDecoration: "none",
        cursor:         "pointer",
        opacity:        1,
        transition:     "opacity 0.3s ease",
      }}
      onMouseEnter={e => (e.currentTarget.style.opacity = "0.72")}
      onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
    >
      <span style={wordStyle}>GRAND</span>
      <IconMark
        style={{
          width:  LOGO_ICON_W * 0.52,
          height: LOGO_ICON_H * 0.52,
        }}
      />
      <span style={wordStyle}>POOLS</span>
    </a>
  );
}
// ─── Glassmorphic backdrop ────────────────────────────────────────────────────
//
//  Enter: 0.85 s — slow curtain unfurl from top
//    • translateY(-100% → 0%)  – slides down
//    • scaleY(0.4 → 1)         – "curtain" stretch anchored at top edge
//    • opacity(0 → 1)          – fades in
//    • easing: cubic-bezier(0.16, 1, 0.3, 1) — slow start, natural settle
//
//  Exit: 0.65 s — slightly faster (gravity pulls it back up)
//    • easing: cubic-bezier(0.76, 0, 0.24, 1) — quick pull away

const glassVariants = {
  hidden: {
    y:       "-100%",
    scaleY:  0.4,
    opacity: 0,
    transition: {
      duration: 0.65,
      ease:     [0.76, 0, 0.24, 1] as const,
    },
  },
  visible: {
    y:       "0%",
    scaleY:  1,
    opacity: 1,
    transition: {
      duration: 0.85,
      ease:     [0.16, 1, 0.3, 1] as const,
    },
  },
};

// ─── Header ──────────────────────────────────────────────────────────────────

interface HeaderProps {
  onMenuClick?:  () => void;
  onLogoClick?:  () => void;
  logoHref?:     string;
  visible?:      boolean;
  menuOpen?:     boolean;
}

export default function Header({
  onMenuClick,
  onLogoClick,
  logoHref  = "/",
  visible   = true,
  menuOpen  = false,
}: HeaderProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position:       "fixed",
        top: 0, left: 0, right: 0,
        zIndex:         1000,
        height:         72,
        display:        "flex",
        alignItems:     "center",
        justifyContent: "space-between",
        padding:        "0 40px",
        overflow:       "hidden",
      }}
    >
      {/* ── glassmorphic backdrop ── */}
      <motion.div
        variants={glassVariants}
        initial="hidden"
        animate={hovered || menuOpen ? "visible" : "hidden"}
        style={{
          position:        "absolute",
          inset:           0,
          zIndex:          0,
          transformOrigin: "top",

          background: `
            radial-gradient(
              ellipse 80% 160% at 50% -20%,
              rgba(255, 255, 255, 0.40) 0%,
              rgba(255, 255, 255, 0.00) 100%
            )
          `,

          backdropFilter:       "blur(42px) saturate(1.3)",
          WebkitBackdropFilter: "blur(42px) saturate(1.3)",

          boxShadow: "inset -5px -5px 250px 0px rgba(255, 255, 255, 0.02)",
        }}
      />

      <Logo onClick={onLogoClick} href={logoHref} />
      <MenuIcon onClick={onMenuClick} />
    </motion.header>
  );
}