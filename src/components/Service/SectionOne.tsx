"use client";

import { useRef, useState, useEffect } from "react";
import WaterBackground from "../Ripplecanvas";

export default function SectionOne() {
  const sectionRef = useRef<HTMLElement>(null);
  const [offscreen, setOffscreen] = useState(false);

  // Pause water canvas when off-screen
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
      className="relative w-full h-screen overflow-hidden"
      style={{ transform: "translateZ(0)", backfaceVisibility: "hidden" }}
    >
      {/* Background image */}
      <picture>
        <source media="(max-width: 767px)" srcSet="/Service1.webp" />
        <img
          src="/Service1.webp"
          alt=""
          aria-hidden
          className="s1-bg absolute inset-0 w-full h-full object-cover z-0 will-change-transform"
          style={{ transform: "translateZ(0)", backfaceVisibility: "hidden" }}
        />
      </picture>

      <WaterBackground paused={offscreen} />

      <div className="section-container relative z-[2] h-full flex flex-col justify-between pb-10 md:pb-14 lg:pb-16">
        
        {/* TOP CONTENT */}
        {/* We keep the split class targeted tightly to individual blocks to prevent multi-element layout collapse */}
        <div className="flex flex-col !mt-44">
          <h2 className="s1-reveal-top font-display text-[#F4EEDF] leading-[1.2] !font-[100]">
            Tailored Pool <br />Solutions
          </h2>
          <p className="s1-reveal-top font-body text-[#F4EEDF] text-sm md:text-base !mt-3">
            For Every Need
          </p>
        </div>

        {/* BOTTOM RIGHT CONTENT */}
        <div className="flex justify-end">
          <p className="s1-reveal-bottom font-body text-[#F4EEDF] text-right max-w-[220px] md:max-w-[280px] lg:max-w-[280px] !mb-33 md:!mb-80 lg:!mb-0">
            From renovations to new builds, we deliver high-quality pools with expert craftsmanship and precision.
          </p>
        </div>
      </div>
    </section>
  );
}