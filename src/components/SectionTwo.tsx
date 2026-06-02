"use client";

import WaterBackground from "./Ripplecanvas";

export default function SectionTwo() {
  return (
    <section className="section-2 absolute inset-0 z-10 overflow-hidden">
      {/* Layer 1 — static background photo */}
      <img
        src="/marvin-van.webp"
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover"
        style={{ zIndex: 0 }}
      />

      {/* Layer 2 — Three.js water video overlay */}
      <WaterBackground />

      {/* Content — sits above the canvas (z-index: 1 on canvas, so z-10 here) */}
      <div className="relative z-10 section-continer min-h-screen flex items-center justify-center">
        <div className="text-center max-w-[620px] flex flex-col items-center gap-y-[24px]">
          <h2
            className="text-[#F4EEDF] font-light leading-[1.15]"
            style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
          >
            Premium Pool Solutions for{" "}
            <em className="italic font-light">Every Need</em>
          </h2>

          <p className="text-[#F4EEDF]/70 text-body leading-[1.6] font-light max-w-[480px]">
            From renovations to new builds, we design and construct pools
            that combine style, functionality, and durability.
          </p>
        </div>
      </div>
    </section>
  );
}