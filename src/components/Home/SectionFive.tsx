"use client";

import { useRef, useState, useEffect } from "react";
import WaterBackground from "../Ripplecanvas";

export default function SectionFive() {
  const sectionRef = useRef<HTMLElement>(null);
  const [offscreen, setOffscreen] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setOffscreen(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="section-5"
      style={{
        position:           "absolute",
        inset:              0,
        width:              "100%",
        height:             "100%",
        overflow:           "hidden",
        zIndex:             10,
        willChange:         "transform",
        transform:          "translateZ(0)",
        backfaceVisibility: "hidden",
      }}
    >
      {/* Full-section bg image */}
      <img
        src="/IntroReveal.webp"
        alt=""
        aria-hidden
        style={{
          position:           "absolute",
          inset:              0,
          width:              "100%",
          height:             "100%",
          objectFit:          "cover",
          objectPosition:     "center 30%",
          zIndex:             0,
          transform:          "translateZ(0)",
          backfaceVisibility: "hidden",
        }}
      />

      {/* Water canvas over the full section */}
      <div
        style={{
          position:      "absolute",
          inset:         0,
          zIndex:        1,
          pointerEvents: "none",
        }}
      >
        <WaterBackground paused={offscreen} />
      </div>

      {/* Text */}
      <div
        style={{
          position:       "absolute",
          inset:          0,
          zIndex:         10,
          display:        "flex",
          flexDirection:  "column",
          alignItems:     "center",
          justifyContent: "center",
          gap:            80,
          pointerEvents:  "none",
          textAlign:      "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <h2
            className="s5-title font-display !font-[100]"
            style={{ color: "#F4EEDF" }}
          >
            Crafting Stunning Pools
          </h2>
        </div>

        <p
          className="s5-body font-body"
          style={{
            color:    "#F4EBE4",
            maxWidth: 360,
          }}
        >
          With expert craftsmanship and attention to detail, we bring your vision
          to life. Whether you need a backyard retreat or a high-end commercial
          pool, our team ensures a seamless experience from design to completion.
        </p>
      </div>
    </section>
  );
}