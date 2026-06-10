"use client";

import { useRef, useState, useEffect } from "react";
import WaterBackground from "../Ripplecanvas";

export default function SectionTwo() {
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
      className="relative w-full h-full overflow-hidden"
      style={{ transform: "translateZ(0)", backfaceVisibility: "hidden" }}
    >
      {/* Background image — given class s2-bg so page.tsx can scrub it */}
      <img
        src="/marvin-van.webp"
        alt=""
        aria-hidden
        className="s2-bg absolute inset-0 w-full h-full object-cover z-0"
        style={{ transform: "translateZ(0)", backfaceVisibility: "hidden" }}
      />

      <WaterBackground paused={offscreen} />

      <div className="section-continer relative z-[2] h-full flex flex-col justify-between pb-10 md:pb-14 lg:pb-16">
{/* TOP */}
<div className="flex flex-col !mt-44">
  <h2 className="s2-title-main font-display text-[#F4EEDF] leading-[1.1] !font-[100]">
    Premium Pool <br />
  </h2>
  <p className="s2-title-sub font-body text-[#F4EEDF] text-sm md:text-base">
    Solution For Every Need
  </p>
</div>

{/* BOTTOM RIGHT */}
<div className="flex justify-end">
  <p className="s2-body font-body text-[#F4EEDF] max-w-[220px] md:max-w-[280px] lg:max-w-[280px]">
    From renovations to new builds, we design and construct pools that
    combine style, functionality, and durability.
  </p>
</div>
      </div>
    </section>
  );
}