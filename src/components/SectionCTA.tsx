// components/SectionCTA.tsx
"use client";
import { useState } from "react";
import WaterBackground from "./Ripplecanvas";

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
      {/* ── Placeholder colour fix ── */}
      <style>{`
        .cta-select.is-placeholder {
          color: rgba(244, 238, 223, 0.698) !important;
        }
        .cta-select:not(.is-placeholder) {
          color: #F4EEDF !important;
        }
      `}</style>

      {/* ── Background image ── */}
      <img
        src="/CTA-FORM.webp"
        alt=""
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "top 20%",
          transform: "scale(1.08)",
          filter: "blur(4px)",
          zIndex: 0,
        }}
      />

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
        <div style={{ flex: "0 0 auto", maxWidth: 420, display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <h2
              className="font-display"
              style={{ color: "#F4EEDF", fontSize: "40px", fontWeight: 400, lineHeight: 1.2, margin: 0 }}
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

/* ── Select ── */
function CtaSelect({ placeholder, options }: { placeholder: string; options: string[] }) {
  const [hasValue, setHasValue] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <select
        defaultValue=""
        className={`cta-select ${hasValue ? "" : "is-placeholder"}`}
        onChange={(e) => setHasValue(e.target.value !== "")}
        style={{
          appearance: "none",
          WebkitAppearance: "none",
          background: "transparent",
          border: "none",
          borderBottom: "1px solid rgba(244, 238, 223, 0.35)",
          fontSize: 14,
          padding: "10px 24px 10px 0",
          outline: "none",
          width: "100%",
          fontFamily: "inherit",

          cursor: "pointer",
          transition: "border-color 0.25s",
        }}
        onFocus={(e) => ((e.target as HTMLSelectElement).style.borderColor = "rgba(244,238,223,0.75)")}
        onBlur={(e) => ((e.target as HTMLSelectElement).style.borderColor = "rgba(244,238,223,0.35)")}
      >
        <option value="" disabled style={{ background: "#0d1f15", color: "#888" }}>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o} value={o} style={{ background: "#0d1f15", color: "#F4EEDF" }}>
            {o}
          </option>
        ))}
      </select>

      {/* chevron */}
      <svg
        style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", opacity: 0.6 }}
        width="14" height="8" viewBox="0 0 14 8" fill="none"
      >
        <path d="M1 1L7 7L13 1" stroke="#F4EEDF" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}