"use client";

import WaterBackground from "./Ripplecanvas";

export default function SectionTwo() {
  return (
    <section
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <img
        src="/marvin-van.webp"
        alt=""
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
        }}
      />

      <WaterBackground />

      <div
        className="section-continer"
        style={{
          position: "relative",
          zIndex: 2,
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            textAlign: "center",
            maxWidth: 620,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
          }}
        >
          <h2
            className="font-display text-[#F4EEDF]"
            style={{ fontSize: 40, lineHeight: 1.15, textAlign: "left" }}
          >
            Premium Pool Solutions for
            <br />
            <span className="italic font-cormorant">Every Need</span>
          </h2>

          <p
            className="text-[#F4EEDF] text-body"
            style={{ maxWidth: 320, textAlign: "left", alignSelf: "flex-start" }}
          >
            From renovations to new builds, we design and construct pools that
            combine style, functionality, and durability.
          </p>
        </div>
      </div>
    </section>
  );
}