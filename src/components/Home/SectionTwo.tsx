"use client";

import { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";

const LiquidCanvas = dynamic(() => import("../LiquidCanvas"), {
  ssr: false,
});

export default function SectionTwo() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const activeBgImage = isMobile ? "/marvin-van-mobile.webp" : "/sectiontwo.webp";

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-full overflow-hidden"
      style={{ transform: "translateZ(0)", backfaceVisibility: "hidden" }}
    >
      <link rel="preload" href="/sectiontwo.webp" as="image" type="image/webp" />
      <link rel="preload" href="/marvin-van-mobile.webp" as="image" type="image/webp" />

      {/* Canvas wrapper layer */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 w-full h-[100%]" style={{ willChange: "transform" }}>
          <LiquidCanvas imageSrc={activeBgImage} />
        </div>
      </div>

      {/* Content Overlay */}
      <div className="section-container relative z-[2] h-full flex flex-col justify-between !pb-25 md:!pb-34 lg:pb-16">
        {/* TOP */}
        <div className="flex flex-col !mt-44 md:!mt-64 lg:!mt-24">
          {/* Empty Target Box: No text inside, just acts as a landing zone */}
          <div className="s2-body w-full max-w-[260px] md:max-w-[280px] lg:max-w-[340px] !mb-33 md:!mb-80 lg:!mb-0 h-[100px]" />
        </div>

        {/* BOTTOM RIGHT */}
        <div className="flex flex-col items-end text-right gap-2 lg:gap-3">
          <h2 className="s2-title-main font-display text-[#F4EEDF] !font-[100]">
            Premium Pool <br />
          </h2>
          <p className="s2-title-sub font-body text-[#F4EEDF] text-sm md:text-base">
            Solution for Every Need
          </p>
        </div>
      </div>
    </section>
  );
}