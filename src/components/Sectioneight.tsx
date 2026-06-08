"use client";

/**
 * SectionEight.tsx — FIXED
 * ─────────────────────────────────────────────────────────────
 * FIX 1: Both WaterBackground canvases receive `paused` prop.
 *   S8 is hidden behind S7 for most of the scroll sequence.
 *   Both canvases were burning GPU time while invisible.
 *
 * FIX 2: Only ONE canvas per panel (was already the case but
 *   confirmed here). Two canvases in one section is intentional —
 *   left and right panels are separate clip-path regions.
 * ─────────────────────────────────────────────────────────────
 */

import { useRef, useState, useEffect } from "react";
import WaterBackground from "./Ripplecanvas";

export default function SectionEight() {
  const sectionRef = useRef<HTMLDivElement>(null);
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
    <div
      ref={sectionRef}
      className="relative w-full h-full overflow-hidden"
      style={{
        transform:          "translateZ(0)",
        backfaceVisibility: "hidden",
      }}
    >
      {/* LEFT panel */}
      <div
        className="s8-panel-left absolute inset-0"
        style={{ clipPath: "inset(0% 50% 0% 0%)" }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/Wellness.webp')",
            transform:       "translateZ(0)",
          }}
        />
        <div className="absolute inset-0 z-10">
          <WaterBackground paused={offscreen} />
        </div>
      </div>

      {/* RIGHT panel */}
      <div
        className="s8-panel-right absolute inset-0"
        style={{ clipPath: "inset(0% 0% 0% 50%)" }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/Wellness.webp')",
            transform:       "translateZ(0)",
          }}
        />
        <div className="absolute inset-0 z-10">
          <WaterBackground paused={offscreen} />
        </div>

        <div
          className="absolute z-20 pointer-events-none"
          style={{
            right:          "2rem",
            top:            0,
            height:         "100%",
            width:          "100%",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "flex-end",
            paddingRight:   "10rem",
          }}
        >
          <div className="flex flex-col gap-5">
            <h2 className="text-[#F4EEDF] text-[24px] leading-[1.2] font-display">
              Water as<br />
              <em className="font-cormorant italic">Sanctuary.</em>
            </h2>
            <p className="text-[#F4EEDF] leading-[1.2] max-w-[300px] font-body text-[16px]">
              Designed to disappear into the landscape, not announce itself.
              The result isn't a pool. It's a quiet room you walk outside to find.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}