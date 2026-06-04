"use client";

export default function SectionNine() {
  return (
    <section className="s9-section relative w-full h-screen overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/murray-st-prahran.webp')" }}
      />
      {/* Radial gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(100% 100% at 0% 0%, rgba(25,33,28,0.9) 0%, rgba(25,33,28,0) 100%)",
        }}
      />
      {/* Flat tint overlay */}
      <div className="absolute inset-0 z-10" style={{ background: "#19211C8F" }} />

      {/*
        Title — starts visually centered via CSS.
        GSAP will clearProps the CSS transform and take over with x/y/scale.
        Keep position:absolute, top:50%, left:50% so the pre-animation
        "centered" state matches what visitors see on load.
      */}
      <h2
        className="s9-title absolute z-20 text-[#F4EEDF] font-display pointer-events-none"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: "46px",
          lineHeight: 1.2,
          whiteSpace: "nowrap",
          margin: 0,
          padding: 0,
        }}
      >
        Do you feel like diving in?
      </h2>

      {/*
        Body paragraph — hidden until GSAP fades it in.
        Anchored bottom-right, same as its final resting place.
      */}
      <p
        className="s9-para absolute z-20 text-[#F4EEDF] font-body text-[14px] leading-[1.2]"
        style={{
          right: "4rem",
          bottom: "10rem",
          maxWidth: "376px",
          textAlign: "right",
          opacity: 0,
        }}
      >
        Don't hold back. As you swim along the sun-drenched water, delight in
        the kaleidoscope of shifting reflections and backyard panoramas that
        will leave you impressed. This is your private retreat — set your pace
        and enjoy it at your desire.
      </p>

      {/*
        Invisible measurement target.
        Positioned above the para — exact bottom is calculated in GSAP,
        but we pre-position it here as a sensible default so BCR works
        even if JS hasn't run yet.
        right / fontSize / fontFamily must match the title's END state.
      */}
      <div
        className="s9-title-target"
        aria-hidden
        style={{
          position: "absolute",
          right: "4rem",
          /* This bottom is overwritten by JS after measuring para height */
          bottom: "calc(10.5rem + 112px)",
          maxWidth: "276px",
          width: "276px",
          fontSize: "24px",
          lineHeight: 1.2,
          fontFamily: "var(--font-display)",
          whiteSpace: "normal",
          textAlign: "right",
          color: "transparent",
          pointerEvents: "none",
          userSelect: "none",
          zIndex: 19,
        }}
      >
        Do you feel like diving in?
      </div>
    </section>
  );
}