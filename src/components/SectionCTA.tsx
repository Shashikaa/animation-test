// components/SectionCTA.tsx
"use client";
import { useState, useRef, useEffect } from "react";
import WaveCanvas from "./WaveCanvas"; // Path verified matching Section 10

export default function SectionCTA() {
  return (
    <section
      className="section-cta !min-h-screen"
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* ── Background WebGL Layer ── */}
      <div className="absolute inset-0 z-[1] pointer-events-auto w-full h-full">
        <WaveCanvas imageSrc="/CTA.webp" />
      </div>

      {/* ══════════════════════════════════════════
          DESKTOP layout — unchanged, now starts at lg
          ══════════════════════════════════════════ */}
      <div
        className="hidden lg:flex section-container cta-inner-desktop "
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
        <div style={{ flex: "0 0 auto", maxWidth: 620, display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <h2
              className="font-display"
              style={{ color: "#F4EEDF",  fontWeight: 100,  margin: 0 }}
            >
              Ready to Build Your Dream 
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
            <CtaInput placeholder="Full Name" name="fullName" />
            <CtaInput placeholder="Email" type="email" name="email" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72 }}>
            <CtaInput placeholder="Phone No." type="tel" name="phone" />
            <CtaInput placeholder="Post Code" name="postCode" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72 }}>
            <CtaSelect placeholder="Budget Type" options={["Residential", "Commercial", "Mixed Use"]} name="budgetType" />
            <CtaSelect placeholder="Budget Range" options={["$10k – $30k", "$30k – $75k", "$75k – $150k", "$150k+"]} name="budgetRange" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72 }}>
            <CtaSelect placeholder="Preferred Contract Method" options={["Fixed Price", "Cost Plus", "Design & Build", "Negotiated"]} name="contractMethod" />
            <div />
          </div>
          <div style={{ marginTop: 18 }}>
            <SubmitButton />
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          MOBILE + TABLET layout — matches Figma
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
            fontSize: "clamp(28px, 8vw, 36px)",
            fontWeight: 400,
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
          <CtaInput placeholder="Full Name" name="fullName_mobile" />
          <CtaInput placeholder="Email" type="email" name="email_mobile" />
          <CtaInput placeholder="Phone No" type="tel" name="phone_mobile" />
          <CtaInput placeholder="Post Code" name="postCode_mobile" />
          <CtaSelect placeholder="Budget Type" options={["Residential", "Commercial", "Mixed Use"]} name="budgetType_mobile" />
          <CtaSelect placeholder="Budget Range" options={["$10k – $30k", "$30k – $75k", "$75k – $150k", "$150k+"]} name="budgetRange_mobile" />
          <CtaSelect placeholder="Preferred Contract Method" options={["Fixed Price", "Cost Plus", "Design & Build", "Negotiated"]} name="contractMethod_mobile" />
        </div>

        {/* Submit */}
        <div style={{ marginTop: 68 }}>
          <SubmitButton />
        </div>
      </div>
    </section>
  );
}

/* ── Submit button ── */
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
function CtaInput({ placeholder, type = "text", name }: { placeholder: string; type?: string; name?: string }) {
  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      style={{
        background: "transparent",
        border: "none",
        borderBottom: "1px solid rgba(244, 238, 223, 0.35)",
        color: "#F4EEDF",
        fontSize: 14,
        padding: "10px 0",
        outline: "none",
        width: "100%",
        fontFamily: "inherit",
        letterSpacing: "0.02em",
        transition: "border-color 0.25s",
      }}
      onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = "rgba(244,238,223,0.75)")}
      onBlur={(e) => ((e.target as HTMLInputElement).style.borderColor = "rgba(244,238,223,0.35)")}
    />
  );
}

/* ── Custom Dropdown Menu with Figma Gradient ── */
function CtaSelect({ placeholder, options, name }: { placeholder: string; options: string[]; name?: string }) {
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
      <input type="hidden" name={name} value={selectedValue} />

      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: "transparent",
          borderBottom: isOpen ? "1px solid rgba(244,238,223,0.75)" : "1px solid rgba(244, 238, 223, 0.35)",
          fontSize: 14,
          padding: "10px 24px 10px 0",
          width: "100%",
          fontFamily: "inherit",
          cursor: "pointer",
          letterSpacing: "0.02em",
          color: selectedValue ? "#F4EEDF" : "rgba(244, 238, 223, 0.4)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          userSelect: "none",
          transition: "border-color 0.25s",
        }}
      >
        <span style={{ flexGrow: 1 }}>{selectedValue || placeholder}</span>
        
        <svg
          style={{
            transform: `rotate(${isOpen ? "180deg" : "0deg"})`,
            opacity: isOpen ? 0.9 : 0.5,
            transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s",
          }}
          width="11" height="7" viewBox="0 0 11 7" fill="none"
        >
          <path d="M1 1.5L5.5 5.5L10 1.5" stroke="#F4EEDF" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Floating Panel Menu with exact Figma Linear Gradient */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: "6px",
            // Exact Linear Gradient extracted from your selection panel stops (162D24 -> 094146)
            background: "linear-gradient(135deg, #162D24 0%, #094146 100%)",

        
            boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
            zIndex: 100,
            overflow: "hidden",
            maxHeight: "220px",
            overflowY: "auto",
          }}
        >
          {options.map((option) => (
            <div
              key={option}
              onClick={() => {
                setSelectedValue(option);
                setIsOpen(false);
              }}
              style={{
                padding: "12px 16px",
                color: selectedValue === option ? "#162D24" : "#F4EEDF",
                background: selectedValue === option ? "#F4EEDF" : "transparent",
                fontSize: 14,
                cursor: "pointer",
                transition: "background 0.15s ease, color 0.15s ease",
              }}
              onMouseEnter={(e) => {
                if (selectedValue !== option) {
                  e.currentTarget.style.background = "rgba(244, 238, 223, 0.08)";
                }
              }}
              onMouseLeave={(e) => {
                if (selectedValue !== option) {
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}