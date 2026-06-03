// components/SectionFive.tsx
"use client";
import WaterBackground from "./Ripplecanvas";

export default function SectionFive() {
  return (
    <section
      className="section-5"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        zIndex: 10,
      }}
    >
      {/* Full-section background image — blurred */}
      <img
        src="/sec-five.webp"
        alt=""
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
          zIndex: 0,
          filter: "blur(12px)",
          transform: "scale(1.08)",
        }}
      />

      {/* Dark overlay on bg */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(10, 20, 15, 0.45)",
          zIndex: 1,
        }}
      />

      {/* Center card + text wrapper */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Card — only visual layers, this is the one that scales */}
        <div
          className="s5-card"
          style={{
            position: "relative",
            width: "100%",
            maxWidth: 577,
            height: 623,
            overflow: "hidden",
        
            transformOrigin: "center center",
          }}
        >
          {/* IntroReveal image INSIDE the card */}
          <img
            src="/IntroReveal.webp"
            alt=""
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center 30%",
              zIndex: 0,
            }}
          />

          {/* Water canvas ON TOP of image */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
              pointerEvents: "none",
            }}
          >
            <WaterBackground />
          </div>
        </div>

        {/* Text content — sibling of card, NOT a child, so it never scales */}
        <div
          style={{
            position: "absolute",
            zIndex: 20,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
            gap: 40,
            pointerEvents: "none",
            textAlign: "left",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <h2
              className="font-display"
              style={{
                color: "#F4EEDF",
                fontSize: 24,
                lineHeight: 1.1,
                margin: 0,
              }}
            >
              Crafting Stunning Pools
            </h2>
            <p
              className="font-cormorant"
              style={{
                color: "#F4EEDF",
                fontSize: 24,
                fontStyle: "italic",
                margin: 0,
              }}
            >
              With Expertise &amp; Precision
            </p>
          </div>

          <p
            className="font-body"
            style={{
              color: "#F4EBE480",
              fontSize: 16,
              lineHeight: 1.2,
              margin: 0,
              maxWidth: 420,
            }}
          >
            With expert craftsmanship and attention to detail, we bring your
            vision to life. Whether you need a backyard retreat or a high-end
            commercial pool, our team ensures a seamless experience from
            design to completion.
          </p>
        </div>
      </div>
    </section>
  );
}