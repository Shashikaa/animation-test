"use client";

export default function SectionFour() {
  return (
    <section
      style={{
        position:           "absolute",
        inset:              0,
        width:              "100%",
        height:             "100%",

        zIndex:             40,
        willChange:         "transform",
        transform:          "translateZ(0)",
        backfaceVisibility: "hidden",
      }}
    >

      {/* ── Layer 0: Full-bleed background image ─────────────────────── */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0 }}>
        <div
          className="s4-bg-img"
          style={{
            position:           "absolute",
            top:                "-10%",
            left:               0,
            width:              "100%",
            height:             "140vh",
            backgroundImage:    "url('/murray-st-prahran.webp')",
            backgroundSize:     "cover",
            backgroundPosition: "center",
            willChange:         "transform",
          }}
        />
      </div>

      {/* ── Layer 1: Radial gradient overlay ─────────────────────────── */}
      <div
        style={{
          position:   "absolute",
          inset:      0,
          zIndex:     1,
          background: `radial-gradient(
            ellipse 140% 140% at 50% 50%,
            rgba(25, 33, 28, 0.72) 0%,
            rgba(25, 33, 28, 0.30) 100%
          )`,
        }}
      />

      {/* ── Layer 2: Glassmorphism blur ───────────────────────────────── */}
      <div
        style={{
          position:             "absolute",
          inset:                0,
          zIndex:               2,
          backdropFilter:       "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          boxShadow:            "inset -5px -5px 250px 0px rgba(255,255,255,0.02)",
          background:           "rgba(25,33,28,0.15)",
        }}
      />

      {/* ── Layer 3: Content wrapper ── */}
      <div
        className="s4-content section-continer "
        style={{
          position:      "absolute",
          top:           0,
          left:          0,
          width:         "100%",
          height:        "140vh",
          zIndex:        3,
          display:       "flex",
          flexDirection: "column",
          boxSizing:     "border-box",
          willChange:    "transform",
        }}
      >

        {/* ROW 1: Title — right aligned */}
        <div style={{ flexShrink: 0, display: "flex", justifyContent: "flex-end" }}>
          <h2
            className="font-display s4-title !mt-24 text-[#F4EEDF]"
          >
            Making Memories.
          </h2>
        </div>

        {/* ROW 2: Para + CTA */}
        <div
          style={{
            flexShrink: 0,
            marginTop:  100,
            maxWidth:   400,
          }}
        >
          <p
            className="font-body s4-para text-[#F4EEDF]"
          >
            At Grand Pools, we build more than just swimming pools — we create
            spaces where families gather, friends connect, and lasting memories
            are made. With expert craftsmanship and a passion for innovation,
            we bring your vision to life.
          </p>
        </div>

        {/* ROW 3: Image card — fixed 560px, parallax via .s4-img */}
        <div
          style={{
            flexShrink:   0,
            position:     "relative",
            overflow:     "hidden",
  
            marginTop:    50,
            marginBottom: 50,
            height:       560,
            width:        "100%",
          }}
        >
          <div
            className="s4-img"
            style={{
              position:           "absolute",
              top:                "-10%",
              left:               0,
              width:              "100%",
              height:             "630px",
              backgroundImage:    "url('/parallax-image.webp')",
              backgroundSize:     "cover",
              backgroundPosition: "center 60%",
              willChange:         "transform",
            }}
          />
        </div>

      </div>
    </section>
  );
}