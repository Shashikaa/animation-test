// components/SectionCTA.tsx
"use client";
import { useState, useRef, useEffect } from "react";
import WaveCanvas from "../WaveCanvas"; // Path verified matching Section 10

export default function SectionCTA() {
  return (
    <section
      className="section-cta !min-h-screen"
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
                background: "linear-gradient(135deg, #19211c 0%, #094146 100%)",
      }}
    >
<div className="absolute inset-0 z-[1] pointer-events-auto w-full h-full">
        {/* Show WebGL canvas only on desktop */}

      <div className="hidden lg:block absolute inset-0 z-[1] pointer-events-auto w-full h-full">
        <WaveCanvas imageSrc="/CTAFORM.png" />
      </div>

        {/* Show static background image on mobile and tablet */}
        <div className="block lg:hidden w-full h-full">
          <img 
            src="/CTAFORM.png" 
            alt="Background" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>


      {/* ══════════════════════════════════════════
          DESKTOP layout — completely unchanged
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
          MOBILE + TABLET layout
          ══════════════════════════════════════════ */}
      <div
        className="flex lg:hidden cta-inner-mobile"
        style={{
          position: "relative",
          zIndex: 10,
          flexDirection: "column",
          justifyContent: "center",
          height: "100%",
          padding: "0 20px",
          margin: 0,
          gap: 0,
        }}
      >
        {/* Title */}
        <h2
          className="font-display !max-w-[300px] md:!max-w-[430px] "
          style={{
            color: "#F4EEDF",
            margin: 0,
            marginBottom: 20,
          }}
        >
          Ready to Build Your Dream 
        </h2>

        {/* Para */}
        <p
          className="font-body max-w-[500px]"
          style={{
            color: "#F4EEDF",
            margin: 0,
            marginBottom: 24,
          }}
        >
          Let&apos;s bring your vision to life with a custom-designed pool
          crafted for your space and lifestyle. Reach out to get started today.
        </p>

        {/* Form — single column on mobile, changes to desktop grid on tablet (md:) */}
        <div
          className="flex flex-col md:grid md:grid-cols-2 gap-2 md:gap-x-[72px] md:gap-y-4 w-full max-w-[500px] md:max-w-[100%] md:!mt-12 "
          style={{
            margin: "0 auto",
          }}
        >
          <CtaInput placeholder="Full Name" name="fullName_mobile" isMobile />
          <CtaInput placeholder="Email" type="email" name="email_mobile" isMobile />
          <CtaInput placeholder="Phone No" type="tel" name="phone_mobile" isMobile />
          <CtaInput placeholder="Post Code" name="postCode_mobile" isMobile />
          <CtaSelect placeholder="Budget Type" options={["Residential", "Commercial", "Mixed Use"]} name="budgetType_mobile" isMobile />
          <CtaSelect placeholder="Budget Range" options={["$10k – $30k", "$30k – $75k", "$75k – $150k", "$150k+"]} name="budgetRange_mobile" isMobile />
          
          {/* On tablet grid, make the final select pull cleanly or balance out */}
          <CtaSelect placeholder="Preferred Contract Method" options={["Fixed Price", "Cost Plus", "Design & Build", "Negotiated"]} name="contractMethod_mobile" isMobile />
          <div className="hidden md:block" />
        </div>

        {/* Submit — Centered via self-center */}
        <div style={{ marginTop: 44 }} className="self-center md:!self-start">
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
function CtaInput({ 
  placeholder, 
  type = "text", 
  name, 
  isMobile = false 
}: { 
  placeholder: string; 
  type?: string; 
  name?: string; 
  isMobile?: boolean;
}) {
  const borderOpacity = isMobile ? "1" : "0.35";
  
  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .cta-input-field::placeholder {
          color: rgba(244, 238, 223, 0.4);
          opacity: 1;
        }
        .cta-input-field-mobile::placeholder {
          color: #F4EEDF !important;
          opacity: 1;
        }
      `}}/>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        className={isMobile ? "cta-input-field-mobile" : "cta-input-field"}
        style={{
          background: "transparent",
          border: "none",
          borderBottom: `1px solid rgba(244, 238, 223, ${borderOpacity})`,
          color: "#F4EEDF",
          fontSize: 14,
          padding: "10px 10px 10px 0",
          outline: "none",
          width: "100%",
          fontFamily: "inherit",
          letterSpacing: "0.02em",
          transition: "border-color 0.25s",
        }}
        onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = "rgba(244,238,223,0.75)")}
        onBlur={(e) => ((e.target as HTMLInputElement).style.borderColor = `rgba(244,238,223,${borderOpacity})`)}
      />
    </>
  );
}

/* ── Custom Dropdown Menu with Figma Gradient ── */
function CtaSelect({ 
  placeholder, 
  options, 
  name, 
  isMobile = false 
}: { 
  placeholder: string; 
  options: string[]; 
  name?: string; 
  isMobile?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        boxSetIsOpen(false);
      }
    }
    function boxSetIsOpen(val: boolean) {
      setIsOpen(val);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const borderOpacity = isMobile ? "1" : "0.35";
  const placeholderColor = isMobile ? "#F4EEDF" : "rgba(244, 238, 223, 0.4)";
  const arrowOpacity = isMobile ? 0.9 : (isOpen ? 0.9 : 0.5);

  return (
    <div ref={dropdownRef} style={{ position: "relative", width: "100%" }}>
      <input type="hidden" name={name} value={selectedValue} />

      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: "transparent",
          borderBottom: isOpen ? "1px solid rgba(244,238,223,0.75)" : `1px solid rgba(244, 238, 223, ${borderOpacity})`,
          fontSize: 14,
          padding: "10px 10px 10px 0",
          width: "100%",
          fontFamily: "inherit",
          cursor: "pointer",
          letterSpacing: "0.02em",
          color: selectedValue ? "#F4EEDF" : placeholderColor,
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
            opacity: arrowOpacity,
            transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s",
          }}
          width="11" height="7" viewBox="0 0 11 7" fill="none"
        >
          <path d="M1 1.5L5.5 5.5L10 1.5" stroke="#F4EEDF" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: "6px",
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