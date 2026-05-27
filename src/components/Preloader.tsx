"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

interface PreloaderProps {
  onComplete: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRef      = useRef<HTMLDivElement>(null);
  const logoRef      = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    // ── 1. Line draws top → bottom ──────────────────────────────
    tl.fromTo(lineRef.current,
      { scaleY: 0, transformOrigin: "top center" },
      { scaleY: 1, duration: 0.8, ease: "power2.inOut" }
    );

    // ── 2. Line disappears bottom → top ─────────────────────────
    tl.to(lineRef.current,
      { scaleY: 0, transformOrigin: "bottom center", duration: 0.5, ease: "power2.in" },
      "+=0.2"
    );

    // ── 3. Logo fades in at full center size ─────────────────────
    tl.fromTo(logoRef.current,
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.4)" },
      "-=0.1"
    );

    // ── 4. Fly to header logo — measure at tween start ───────────
    tl.to(logoRef.current, {
      duration: 0.9,
      ease: "power3.inOut",
      delay: 0.35,

      x: () => {
        const header = document.getElementById("header-logo-inner");
        const logo   = logoRef.current;
        if (!header || !logo) return 0;
        const hRect = header.getBoundingClientRect();
        const lRect = logo.getBoundingClientRect();
        return (hRect.left + hRect.width  / 2) - (lRect.left + lRect.width  / 2);
      },

      y: () => {
        const header = document.getElementById("header-logo-inner");
        const logo   = logoRef.current;
        if (!header || !logo) return 0;
        const hRect = header.getBoundingClientRect();
        const lRect = logo.getBoundingClientRect();
        return (hRect.top  + hRect.height / 2) - (lRect.top  + lRect.height / 2);
      },

      scale: () => {
        const header = document.getElementById("header-logo-inner");
        const logo   = logoRef.current;
        if (!header || !logo) return 0.3;
        const hRect = header.getBoundingClientRect();
        const lRect = logo.getBoundingClientRect();
        return hRect.width / lRect.width;
      },

      transformOrigin: "center center",
    });

    // ── 5. Reveal the real header logo just before fade ──────────
    tl.call(() => {
      const headerLogo = document.getElementById("header-logo");
      if (headerLogo) headerLogo.style.opacity = "1";
    }, [], "+=0.05");

    // ── 6. Fade out green bg once logo has landed ────────────────
    tl.to(containerRef.current, {
      opacity: 0,
      duration: 0.5,
      ease: "power2.inOut",
      onComplete: () => onComplete(),
    });

  }, [onComplete]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "#1a7a4a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {/* Vertical line */}
      <div
        ref={lineRef}
        style={{
          position: "absolute",
          width: "2px",
          height: "100px",
          backgroundColor: "#ffffff",
        }}
      />

      {/* Logo — centered, animates to header after line */}
      <div
        ref={logoRef}
        style={{
          opacity: 0,
          display: "flex",
          alignItems: "center",
          gap: "10px",
          whiteSpace: "nowrap",
          transformOrigin: "center center",
          willChange: "transform",
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
  );
}