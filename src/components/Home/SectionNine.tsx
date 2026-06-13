"use client";

export default function SectionNine() {
  return (
    <section className="s9-section relative w-full h-screen overflow-hidden">

      {/* Desktop bg */}
      <div
        className="s9-bg-img absolute bg-cover bg-center hidden lg:block"
        style={{
          backgroundImage: "url('/murray-st-prahran.webp')",
          top:        0,
          left:       0,
          width:      "100%",
          height:     "120%",
          willChange: "transform",
        }}
      />

      {/* Mobile bg */}
      <div
        className="s9-bg-img absolute bg-cover bg-center block lg:hidden"
        style={{
          backgroundImage: "url('/murray-st-prahran-mobile.webp')",
          top:        0,
          left:       0,
          width:      "100%",
          height:     "120%",
          willChange: "transform",
        }}
      />

      {/* Desktop overlays — unchanged */}
      <div
        className="absolute inset-0 hidden lg:block"
        style={{
          background: "radial-gradient(100% 100% at 0% 0%, rgba(25,33,28,0.9) 0%, rgba(25,33,28,0) 100%)",
        }}
      />
      <div className="absolute inset-0 z-10 hidden lg:block" style={{ background: "#19211C8F" }} />

      {/* Desktop title — unchanged */}
      <h2
        className="s9-title absolute z-20 text-[#F4EEDF] font-display pointer-events-none hidden lg:block"
        style={{
          top:        "50%",
          left:       "50%",
          transform:  "translate(-50%, -50%)",
          fontSize:   "46px",
          lineHeight: 1.2,
          whiteSpace: "nowrap",
          margin:     0,
          padding:    0,
          opacity:    0,
        }}
      >
        Do you feel like diving in?
      </h2>

      {/* Desktop para — unchanged */}
      <p
        className="s9-para absolute z-20 text-[#F4EEDF] font-body pointer-events-none hidden lg:block"
        style={{
          right:     "4rem",
          bottom:    "8rem",
          maxWidth:  "376px",
          textAlign: "right",
          opacity:   0,
        }}
      >
        Don't hold back. As you swim along the sun-drenched water, delight in
        the kaleidoscope of shifting reflections and backyard panoramas that
        will leave you impressed. This is your private retreat — set your pace
        and enjoy it at your desire.
      </p>

      {/* Mobile title */}
      <h2
        className="s9-title absolute z-20 text-[#F4EEDF] font-display pointer-events-none block lg:hidden"
        style={{
          top:        "8rem",
          right:      "1.5rem",
          maxWidth:   "300px",

          textAlign:  "right",
          margin:     0,
          padding:    0,
          opacity:    0,
        }}
      >
        Do you feel like diving in?
      </h2>

      {/* Mobile para */}
      <p
        className="s9-para absolute z-20 text-[#F4EEDF] font-body pointer-events-none block lg:hidden md:!mt-10"
        style={{
          top:        "calc(8rem + 90px)",
          right:      "1.5rem",
          maxWidth:   "300px",
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