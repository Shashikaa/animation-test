"use client";

import { useEffect, useState } from "react";

export default function Hero() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY < 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      style={{
        position: "relative",
        width: "100%",
        height: "100vh", // ← was "100%", needs a fixed height to anchor bottom positioning
        overflow: "hidden",
        backgroundImage: "url('/hero.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          background:
            "linear-gradient(107.8deg, rgba(25, 33, 28, 0) 50.32%, rgba(25, 33, 28, 0.72) 78.81%)",
        }}
      />
      <div
        className="section-continer"
        style={{
          position: "relative",
          zIndex: 1,
          height: "100%",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "flex-end",
          paddingBottom: "85px",
        }}
      >
        <div style={{ maxWidth: 400, textAlign: "right" }}>
          <p className="text-[#F4EEDF] text-body leading-[1.2] font-light">
            At Grand Pools, we create custom swimming pools that blend style,
            function, and quality. Every pool is designed to complement your
            outdoor space, adding value and elegance to your home or business.
          </p>
        </div>
      </div>

      {/* Scroll Indicator */}
<div
  style={{
    position: "absolute",
    bottom: "32px",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 10,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    opacity: visible ? 1 : 0,
    transition: "opacity 0.4s ease",
    pointerEvents: "none",
  }}
>
  <span
    style={{
      color: "#F4EEDF",
      fontSize: "10px",
      fontWeight: 300,
      letterSpacing: "0.2em",
      textTransform: "uppercase",
      textShadow: "0 1px 6px rgba(0,0,0,0.8)", // ← dark shadow behind text
    }}
  >
    Scroll
  </span>

  <div
    style={{
      width: "22px",
      height: "34px",
      borderRadius: "11px",
      border: "1.5px solid rgba(244, 238, 223, 0.9)", // ← more opaque border
      position: "relative",
      display: "flex",
      justifyContent: "center",
      paddingTop: "5px",
      boxShadow: "0 0 12px rgba(0,0,0,0.5), inset 0 0 8px rgba(0,0,0,0.2)", // ← dark glow
      backdropFilter: "blur(4px)", // ← frosted glass over bright bg
      backgroundColor: "rgba(0,0,0,0.15)",
    }}
  >
    <div
      style={{
        width: "3px",
        height: "6px",
        borderRadius: "2px",
        backgroundColor: "#F4EEDF",
        animation: "scrollDot 1.6s ease-in-out infinite",
      }}
    />
  </div>

  <style>{`
    @keyframes scrollDot {
      0%   { transform: translateY(0);    opacity: 1; }
      60%  { transform: translateY(10px); opacity: 0; }
      61%  { transform: translateY(0);    opacity: 0; }
      100% { transform: translateY(0);    opacity: 1; }
    }
  `}</style>
</div>
    </section>
  );
}