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
      className="relative w-full h-full overflow-hidden bg-[#0A1410]"
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

      {/* CONTENT BLOCK OVERLAY */}
      <div className="section-container absolute inset-0 z-10 h-full flex flex-col justify-end pointer-events-none">
        <div className="flex flex-col items-end text-right gap-2 lg:gap-3 p-4 md:p-8">
          <h2 className="s2-title-main font-display text-[#F4EEDF] !font-[100] text-3xl md:text-5xl">
            Premium Pool <br />
          </h2>
          <p className="s2-title-sub font-body text-[#F4EEDF] text-sm md:text-base">
            Solution for Every Need
          </p>
        </div>
      </div>

      {/* CORE WORKSPACE GRID */}
      <div className="absolute inset-0 z-20 grid grid-cols-1 md:grid-cols-2 w-full h-full pointer-events-none">
        
        {/* LEFT COLUMN: LANDING REFERENCE */}
        <div className="relative h-full overflow-hidden !pt-12 md:!pt-36 lg:!pt-36">
          <div className="s2-body w-full max-w-[260px] md:max-w-[280px] lg:max-w-[340px] !mb-33 md:!mb-80 lg:!mb-0 h-[100px] !ml-14 " />
        </div>

        {/* RIGHT COLUMN: DOUBLE LAYER STACK */}
        <div className="absolute top-0 right-0 bottom-0 left-1/2 hidden md:block z-20 pointer-events-auto">
          
          {/* UNDERNEATH LAYER (Reveals bottom-to-top) */}
          <div className="s2-right-img-frame-under absolute inset-0 w-full h-full z-10">
            <div className="w-full h-full relative overflow-hidden shadow-2xl">
              <img 
                src="/sectiontwo-right-under.webp" // Replace with your new underlying image path
                alt="Premium pool design structural layout" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* TOP INITIAL LAYER */}
          <div className="s2-right-img-frame absolute inset-0 w-full h-full z-20">
            <div className="w-full h-full relative overflow-hidden shadow-2xl">
              <img 
                src="/sectiontwo-right.webp" 
                alt="Figma layout premium overview pool" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>

        </div>
      </div>

      {/* SCROLLING WORKSPACE GRID CONTAINER */}
      <div className="s2-scroll-content absolute left-4 md:left-8 lg:left-16 top-0 flex flex-col w-full max-w-[40%] z-30 pointer-events-none pt-[20vh] pb-32">
        <p className="text-[#F4EEDF] font-body text-base leading-relaxed !text-left max-w-[290px]">
          Since 2021, Grand Pools has been creating custom swimming pools with a focus on refined design, quality craftsmanship, and a smooth building experience.
        </p>
        <p className="text-[#F4EEDF] font-body text-base leading-relaxed !text-left max-w-[230px] !self-end !mt-[200px]">
          Tailor-Made Designs — Custom pools shaped around your space, style, and lifestyle</p>
        <div className="w-full aspect-[4/3] max-w-[400px] overflow-hidden !mt-[64px]">
          <img 
            src="/sectiontwo-left-sub.webp" 
            alt="Architectural swimming details" 
            className="w-full h-full object-cover"
          />
        </div>
        <p className="text-[#F4EEDF] font-body text-sm leading-relaxed !text-left max-w-[290px] !mt-[140px]">
           Expert Craftsmanship <br/>Built with precision using high-quality materials and techniques.
        </p>
        <p className="text-[#F4EEDF] font-body text-sm leading-relaxed !text-left max-w-[230px] !self-end !mt-[200px]">
          Seamless Process<br/>From consultation to completion, we make it easy  stress-free.
        </p>
      </div>
</section>
  );
}