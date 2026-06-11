"use client";

export default function SectionNine() {
  return (
    <section className="s9-section relative w-full h-screen overflow-hidden">

      {/* s9-bg-img — no inline top offset, GSAP owns the transform via yPercent */}
      <div
        className=" absolute bg-cover bg-center"
        style={{
          backgroundImage: "url('/murray-st-prahran.webp')",
          top:    0,
          left:   0,
          width:  "100%",
          height: "120%",
          willChange: "transform",
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(100% 100% at 0% 0%, rgba(25,33,28,0.9) 0%, rgba(25,33,28,0) 100%)",
        }}
      />
      <div className="absolute inset-0 z-10" style={{ background: "#19211C8F" }} />

      {/* Single title — starts centered, flies to bottom-right via x/y only */}
      <h2
        className="s9-title absolute z-20 text-[#F4EEDF] font-display pointer-events-none"
        style={{
          top:       "50%",
          left:      "50%",
          transform: "translate(-50%, -50%)",
          fontSize:  "46px",
          lineHeight: 1.2,
          whiteSpace: "nowrap",
          margin:  0,
          padding: 0,
          opacity: 0,
        }}
      >
        Do you feel like diving in?
      </h2>

      <p
        className="s9-para absolute z-20 text-[#F4EEDF] font-body"
        style={{
          right:      "4rem",
          bottom:     "8rem",
          maxWidth:   "376px",
          textAlign:  "right",
          opacity:    0,
        }}
      >
        Don't hold back. As you swim along the sun-drenched water, delight in
        the kaleidoscope of shifting reflections and backyard panoramas that
        will leave you impressed. This is your private retreat — set your pace
        and enjoy it at your desire.
      </p>
    </section>
  );
}