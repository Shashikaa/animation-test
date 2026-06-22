// components/SectionCTA.tsx
"use client";
import { useState, useRef, useEffect } from "react";
import WaterBackground from "../Ripplecanvas";

export default function SectionCTA() {
  return (
    <section
      className="section-cta !min-h-screen"
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        /* --- Gradient Background Added --- */
        background: "linear-gradient(135deg, #19211c 0%, #094146 100%)",
      }}
    >
      {/* ── Placeholder colour fix & Custom Option Overrides ── */}
      <style>{`
        .cta-select.is-placeholder {
          color: #F4EEDF !important;
        }
        .cta-select:not(.is-placeholder) {
          color: #F4EEDF !important;
        }
        /* Targets the text input placeholders specifically */
        .cta-input::placeholder {
          color: #F4EEDF !important;
        }
        /* Forces standard browser dropdown lists to use your theme background */
        .cta-select option {
          background-color: #094146 !important;
          color: #F4EEDF !important;
        }
        /* Fixes iOS/Safari native overlay variations */
        @media (prefers-color-scheme: dark) {
          .cta-select option {
            background-color: #094146 !important;
            color: #F4EEDF !important;
          }
        }
      `}</style>

      {/* ── [Image Removed] ── */}

      {/* ── Water canvas ── */}
      <div style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none" }}>
        <WaterBackground />
      </div>

      {/* ══════════════════════════════════════════
          DESKTOP layout — unchanged, now starts at lg
          ══════════════════════════════════════════ */}
      <div
        className="hidden lg:flex section-continer"
        style={{
          position: "relative",
          zIndex: 10,
          alignItems: "center",
          justifyContent: "space-between",
          gap: 44,
          height: "100%",
          maxWidth: 1440,
          margin: "0 auto",
          padding: "0 48px",
        }}
      >
        {/* LEFT */}
        <div style={{ flex: "0 0 auto", maxWidth: 600, display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <h2
              className="font-display"
              style={{ color: "#F4EEDF", fontWeight: 100, lineHeight: 1.2, margin: 0 }}
            >
              Ready to Build Your Dream Pool?
            </h2>
          </div>
          <p
            className="font-body"
            style={{ color: "#F4EEDF", fontSize: 16, lineHeight: 1.2, margin: 0, maxWidth: 400 }}
          >
            Let&apos;s bring your vision to life with a custom-designed pool
            crafted for your space and lifestyle. Reach out to get started today.
          </p>
        </div>

        {/* RIGHT: Form */}
        <div style={{ flex: "1 1 auto", maxWidth: 560, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72 }}>
            <CtaInput placeholder="Full Name" />
            <CtaInput placeholder="Email" type="email" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72 }}>
            <CtaInput placeholder="Phone No." type="tel" />
            <CtaInput placeholder="Post Code" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72 }}>
            <CtaSelect placeholder="Budget Type" options={["Residential", "Commercial", "Mixed Use"]} />
            <CtaSelect placeholder="Budget Range" options={["$10k – $30k", "$30k – $75k", "$75k – $150k", "$150k+"]} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72 }}>
            <CtaSelect placeholder="Preferred Contract Method" options={["Fixed Price", "Cost Plus", "Design & Build", "Negotiated"]} />
            <div />
          </div>
          <div style={{ marginTop: 18 }}>
            <SubmitButton />
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          MOBILE + TABLET layout — matches Figma
          Vertical stack: title → para → form fields (single col) → submit
          Now applies up to lg breakpoint (covers tablets too)
          ══════════════════════════════════════════ */}
      <div
        className="flex lg:hidden"
        style={{
          position: "relative",
          zIndex: 10,
          flexDirection: "column",
          justifyContent: "center",
          height: "100%",
          padding: "0 24px",
          margin: 0,
          gap: 0,
        }}
      >
        {/* Title */}
        <h2
          className="font-display max-w-[400px] "
          style={{
            color: "#F4EEDF",
       
            fontWeight: 100,
            lineHeight: 1.2,
            margin: 0,
            marginBottom: 32,
          }}
        >
          Ready to Build Your Dream Pool?
        </h2>

        {/* Para */}
        <p
          className="font-body max-w-[500px]"
          style={{
            color: "#F4EEDF",
            fontSize: 14,
            lineHeight: 1.5,
            margin: 0,
            marginBottom: 32,
          }}
        >
          Let&apos;s bring your vision to life with a custom-designed pool
          crafted for your space and lifestyle. Reach out to get started today.
        </p>

        {/* Form — single column full width */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            width: "80%",
          }}
        >
          <CtaInput placeholder="Full Name" />
          <CtaInput placeholder="Email" type="email" />
          <CtaInput placeholder="Phone No" type="tel" />
          <CtaInput placeholder="Post Code" />
          <CtaSelect placeholder="Budget Type" options={["Residential", "Commercial", "Mixed Use"]} />
          <CtaSelect placeholder="Budget Range" options={["$10k – $30k", "$30k – $75k", "$75k – $150k", "$150k+"]} />
          <CtaSelect placeholder="Preferred Contract Method" options={["Fixed Price", "Cost Plus", "Design & Build", "Negotiated"]} />
        </div>

        {/* Submit */}
        <div style={{ marginTop: 68 }}>
          <SubmitButton />
        </div>
      </div>
    </section>
  );
}

/* ── Submit button — shared ── */
function SubmitButton() {
  return (
    <button
      type="button"
      style={{
        position: "relative",
        display: "inline-block",
        width: "fit-content",
        fontSize: 14,
        fontWeight: 500,
        textTransform: "uppercase",
        color: "#F4EEDF",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        fontFamily: "inherit",
        padding: "0 0 8px 0",
      }}
      className="group transition-opacity duration-200 hover:opacity-70"
    >
      Submit Now
      <span
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 1,
          background: "#F4EEDF",
          transition: "transform 0.2s ease",
        }}
        className="group-hover:-translate-y-[2px]"
      />
    </button>
  );
}

/* ── Input ── */
function CtaInput({ placeholder, type = "text" }: { placeholder: string; type?: string }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      className="cta-input"
      style={{
        background: "transparent",
        border: "none",
        borderBottom: "0.82px solid rgba(244, 238, 223, 1)",
        color: "#F4EEDF",
        fontSize: 14,
        padding: "10px 0",
        outline: "none",
        width: "100%",
        fontFamily: "inherit",
        letterSpacing: "0.02em",
        transition: "border-color 0.25s",
      }}
      onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = "rgba(244,238,223,1)")}
      onBlur={(e) => ((e.target as HTMLInputElement).style.borderColor = "rgba(244,238,223,1)")}
    />
  );
}

/* ── Custom Modern Dropdown ── */
function CtaSelect({ placeholder, options }: { placeholder: string; options: string[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} style={{ position: "relative", width: "100%" }}>
      {/* Trigger Area - Keeps exact border & padding styles from original select layout */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "transparent",
          border: "none",
          borderBottom: "0.82px solid rgba(244, 238, 223, 1)",
          fontSize: 14,
          padding: "10px 24px 10px 0",
          outline: "none",
          width: "100%",
          fontFamily: "inherit",
          cursor: "pointer",
          color: "#F4EEDF",
          userSelect: "none",
          transition: "border-color 0.25s",
        }}
      >
        <span>{selectedValue || placeholder}</span>

        {/* Chevron Arrow */}
        <svg
          style={{
            position: "absolute",
            right: 0,
            top: "50%",
            transform: isOpen ? "translateY(-50%) rotate(180deg)" : "translateY(-50%)",
            pointerEvents: "none",
            opacity: 0.6,
            transition: "transform 0.2s ease"
          }}
          width="14" height="8" viewBox="0 0 14 8" fill="none"
        >
          <path d="M1 1L7 7L13 1" stroke="#F4EEDF" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* Modern Popover container utilizing custom brand color */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            backgroundColor: "#094146",
            border: "1px solid rgba(244, 238, 223, 0.2)",
            zIndex: 100,
            maxHeight: "200px",
            overflowY: "auto",
          }}
        >
          {options.map((o) => (
            <div
              key={o}
              onClick={() => {
                setSelectedValue(o);
                setIsOpen(false);
              }}
              style={{
                padding: "10px 14px",
                fontSize: 14,
                color: "#F4EEDF",
                cursor: "pointer",
                fontFamily: "inherit",
                backgroundColor: "transparent",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(244, 238, 223, 0.15)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              {o}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}