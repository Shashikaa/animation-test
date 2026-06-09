"use client";

export default function SectionFour() {
  return (
    <section
      className="section-4"
      style={{
        position:           "absolute",
        inset:              0,
        width:              "100%",
        height:             "100%",
        overflow:           "hidden",
        zIndex:             40,
        // NO backdropFilter here — it creates a stacking context that
        // traps section-5 (zIndex:50) underneath. Move blur to inner div.
        willChange:         "transform",
        transform:          "translateZ(0)",
        backfaceVisibility: "hidden",
      }}
    >
      {/* Blur layer — isolated inner div, does NOT create a stacking context
          on the section root so section-5 can stack above freely */}
      <div
        style={{
          position:             "absolute",
          inset:                0,
          backdropFilter:       "blur(5px)",
          WebkitBackdropFilter: "blur(20px)",
          background:           "#00000033",
          zIndex:               0,
        }}
      />

      {/* Dark overlay */}
      <div
        style={{
          position:  "absolute",
          inset:     0,
          background:"rgba(0,0,0,0.20)",
          zIndex:    1,
        }}
      />

      {/* Content */}
      <div
        style={{
          position:       "absolute",
          inset:          0,
          zIndex:         2,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            maxWidth:      567,
            display:       "flex",
            flexDirection: "column",
            alignItems:    "center",
            gap:           40,
            textAlign:     "center",
          }}
        >
          <p
            className="font-body"
            style={{
              color:      "#F4EEDF",
              fontSize:   16,
              lineHeight: 1.2,
              margin:     0,
            }}
          >
            At Grand Pools, we build more than just swimming pools — we create
            spaces where families gather, friends connect, and lasting memories
            are made. With expert craftsmanship and a passion for innovation,
            we bring your vision to life.
          </p>

          <a
            href="/contact"
            style={{
              position:       "relative",
              display:        "inline-block",
              width:          "fit-content",
              paddingBottom:  8,
              fontSize:       14,
              fontWeight:     500,
              textTransform:  "uppercase",
              color:          "#F4EEDF",
              textDecoration: "none",
            }}
            className="group transition-opacity duration-200 hover:opacity-70"
          >
            Get a free consultation
            <span
              style={{
                position:   "absolute",
                left:       0,
                right:      0,
                bottom:     0,
                height:     1,
                background: "#F4EEDF",
                transition: "transform 0.2s ease",
              }}
              className="group-hover:-translate-y-[2px]"
            />
          </a>
        </div>
      </div>
    </section>
  );
}