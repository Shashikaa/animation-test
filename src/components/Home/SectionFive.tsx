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
        // FIX: Promote section to GPU layer. GSAP animates yPercent on
        // this element; without pre-promotion the first paint happens
        // on the animation frame, which is visually a 1-frame jump.
        willChange:         "transform",
        transform:          "translateZ(0)",
        backfaceVisibility: "hidden",
      }}
    >
      {/* Blurred bg image */}
      <img
        src="/sec-five.webp"
        alt=""
        aria-hidden
        style={{
          position:           "absolute",
          inset:              0,
          width:              "100%",
          height:             "100%",
          objectFit:          "cover",
          objectPosition:     "center",
          zIndex:             0,
          filter:             "blur(12px)",
          transform:          "scale(1.08) translateZ(0)",
          backfaceVisibility: "hidden",
        }}
      />

      {/* Dark overlay */}
      <div
        style={{
          position:  "absolute",
          inset:     0,
          background:"rgba(10, 20, 15, 0.45)",
          zIndex:    1,
          transform: "translateZ(0)",
        }}
      />

      {/* Center card + text */}
      <div
        style={{
          position:       "absolute",
          inset:          0,
          zIndex:         10,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
        }}
      >
        <div
          className="s5-card"
          style={{
            position:        "relative",
            width:           "100%",
            maxWidth:        577,
            height:          623,
            overflow:        "hidden",
            transformOrigin: "center center",
            // FIX: Pre-promote the card to its own GPU layer.
            // GSAP will animate scaleX/scaleY on this element; having
            // will-change:transform here means the compositor already
            // has the texture cached before the scale tween fires,
            // eliminating the rasterization stutter at the S4→S5
            // boundary.
            willChange:      "transform",
            transform:       "translateZ(0)",
            backfaceVisibility: "hidden",
          }}
        >
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

          <div
            style={{
              position:      "absolute",
              inset:         0,
              zIndex:        1,
              pointerEvents: "none",
            }}
          >
            {/* Canvas always mounted, paused when offscreen */}
            <WaterBackground paused={offscreen} />
          </div>
        </div>

        {/* Text — sibling of card, never scales */}
        <div
          style={{
            position:       "absolute",
            zIndex:         20,
            display:        "flex",
            flexDirection:  "column",
            alignItems:     "flex-start",
            justifyContent: "center",
            gap:            40,
            pointerEvents:  "none",
            textAlign:      "left",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <h2
              className="font-display"
              style={{ color: "#F4EEDF", fontSize: 24, lineHeight: 1.2, margin: 0 }}
            >
              Crafting Stunning Pools<br />
              <em className="font-cormorant italic"> With Expertise &amp; Precision</em>
            </h2>
          </div>

          <p
            className="font-body"
            style={{
              color:      "#F4EBE480",
              fontSize:   16,
              lineHeight: 1.2,
              margin:     0,
              maxWidth:   420,
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