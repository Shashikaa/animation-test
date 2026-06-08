"use client";

/**
 * SectionTwo.tsx — FIXED
 * ─────────────────────────────────────────────────────────────
 * FIX 1: WaterBackground receives `paused` prop driven by
 *   IntersectionObserver. When section is offscreen, paused=true
 *   and the canvas skips all GL work — no GPU draw calls, no
 *   texture uploads, nothing. This eliminates the biggest source
 *   of scroll lag: 3 WebGL canvases all drawing simultaneously.
 *
 * FIX 2: Instead of unmounting/remounting the canvas on visibility
 *   change (which caused a flash + WebGL context recreation cost),
 *   we keep the canvas mounted and use the paused prop.
 *   Context recreation is expensive (~100ms). Skipping draw calls
 *   is essentially free.
 *
 * FIX 3: GPU layer promotion via translateZ(0) on the section root
 *   and background image. Without this, the section merges into the
 *   scroll layer and forces full-page raster invalidation on scroll.
 * ─────────────────────────────────────────────────────────────
 */

import { useRef, useState, useEffect } from "react";
import WaterBackground from "./Ripplecanvas";

export default function SectionTwo() {
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
      style={{
        position:           "relative",
        width:              "100%",
        height:             "100%",
        overflow:           "hidden",
        transform:          "translateZ(0)",
        backfaceVisibility: "hidden",
      }}
    >
      <img
        src="/marvin-van.webp"
        alt=""
        aria-hidden
        style={{
          position:           "absolute",
          inset:              0,
          width:              "100%",
          height:             "100%",
          objectFit:          "cover",
          zIndex:             0,
          transform:          "translateZ(0)",
          backfaceVisibility: "hidden",
        }}
      />

      {/* Canvas stays mounted, paused when offscreen — no context recreation cost */}
      <WaterBackground paused={offscreen} />

      <div
        className="section-continer"
        style={{
          position:        "relative",
          zIndex:          2,
          height:          "100%",
          display:         "flex",
          alignItems:      "center",
          justifyContent:  "center",
        }}
      >
        <div
          style={{
            textAlign:      "center",
            maxWidth:       620,
            display:        "flex",
            flexDirection:  "column",
            alignItems:     "center",
            gap:            24,
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