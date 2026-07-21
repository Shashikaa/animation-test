"use client";

import { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";

const LiquidCanvas = dynamic(() => import("../LiquidCanvas"), {
  ssr: false,
});

export default function SectionTwo() {
  const sectionRef = useRef<HTMLElement>(null);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-full overflow-hidden bg-[#0A1410]"
      style={{ 
        transform: "translate3d(0, 0, 0)", 
        backfaceVisibility: "hidden" 
      }}
    >
      <link rel="preload" href="/sectiontwo.webp" as="image" type="image/webp" />
      <link rel="preload" href="/marvin-van-mobile.webp" as="image" type="image/webp" />

      {/* BACKGROUND LAYER RULE */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src="/sectiontwo.webp"
          alt="Background layer"
          className="w-full h-full object-cover"
          style={{ 
            willChange: "transform",
            transform: "translate3d(0,0,0)" 
          }}
        />
      </div>

      {/* CONTENT BLOCK OVERLAY (FIRST FRAME TEXT) */}
      <div className="section-container absolute inset-0 z-10 h-full flex flex-col justify-end pointer-events-none">
        <div className="flex flex-col items-end text-right gap-2 lg:gap-3 p-4 md:p-8">
          <h2 className="s2-title-main font-display text-[#F4EEDF] !font-[100] text-3xl md:text-5xl reveal-text">
            Premium Pool <br />
          </h2>
          <p className="s2-title-sub font-body text-[#F4EEDF] text-sm md:text-base reveal-text">
            Solution for Every Need
          </p>
        </div>
      </div>

      {/* CORE WORKSPACE GRID */}
      <div className="absolute inset-0 z-20 grid grid-cols-1 lg:grid-cols-2 w-full h-full pointer-events-none">
        {/* LEFT COLUMN: LANDING REFERENCE */}
        <div className="relative h-full overflow-hidden !pt-58 md:!pt-66 lg:!pt-36">
<div className="s2-body w-full max-w-[260px] md:max-w-[280px] lg:max-w-[340px] !mb-33 md:!mb-80 lg:!mb-0 h-[100px] !ml-[20px] md:!ml-[30px] lg:!ml-[65px]">
  <p className="reveal-text text-[#F4EEDF] font-body text-sm md:text-base leading-relaxed text-left">
    From renovations to new builds, we design and construct pools that combine style, functionality, and durability.
  </p>
</div>
        </div>

        {/* RIGHT COLUMN: DOUBLE LAYER STACK (DESKTOP) */}
        <div className="absolute top-0 right-0 bottom-0 left-1/2 hidden lg:block z-20 pointer-events-auto">
          {/* UNDERNEATH LAYER */}
          <div className="s2-right-img-frame-under absolute inset-0 w-full h-full z-10">
            <div className="w-full h-full relative overflow-hidden shadow-2xl">
              <img 
                src="/sectiontwo-right-under.webp" 
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

      {/* DESKTOP SCROLLING WORKSPACE GRID CONTAINER */}
      <div className="s2-scroll-content hidden lg:flex absolute left-4 md:left-8 lg:left-16 top-0 flex-col w-full max-w-[40%] z-30 pointer-events-none pt-[20vh] pb-32">
        <p className="text-[#F4EEDF] font-body text-base leading-relaxed !text-left max-w-[290px]">
          Since 2021, Grand Pools has been creating custom swimming pools with a focus on refined design, quality craftsmanship, and a smooth building experience.
        </p>
        <p className="text-[#F4EEDF] font-body text-base leading-relaxed !text-left max-w-[230px] !self-end !mt-[200px]">
          Tailor-Made Designs — Custom pools shaped around your space, style, and lifestyle
        </p>
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
        <p className="text-[#F4EEDF] font-body text-sm leading-relaxed !text-left max-w-[230px] !self-end !mt-[100px]">
          Seamless Process<br/>From consultation to completion, we make it easy stress-free.
        </p>
      </div>

      {/* MOBILE & TABLET SCROLL CONTAINER */}
      <div 
        className="s2-mob-scroll-wrapper section-container lg:hidden relative w-full h-auto z-40 pointer-events-auto"
        style={{ 
          opacity: 0,
          willChange: "transform", 
          transform: "translate3d(0, 100vh, 0)" 
        }}
      >
        <div className="w-full flex flex-col gap-22 md:gap-32 py-[14vh] items-start">
          
          {/* Row 1: Top-Left Paragraph text */}
          <p className="s2-mob-row1 text-[#F4EEDF] font-body max-w-[330px] text-left">
            Since 2021, Grand Pools has been creating custom swimming pools with a focus on refined design, quality craftsmanship, and a smooth building experience.
          </p>

          {/* Row 2: Image aligned right */}
          <div className="s2-mob-row2 w-full max-w-[80%] !h-[250px] md:!h-[380px] overflow-hidden self-end" style={{ transform: "translate3d(0,0,0)" }}>
            <img 
              src="/sectiontwo-left-sub.webp" 
              alt="Architectural swimming details" 
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>

          {/* Row 3: Current Last Text */}
          <div className="s2-mob-row3 flex flex-col gap-1 text-left max-w-[330px] self-start">
            <p className="text-[#F4EEDF] font-body">
              Tailor-Made Designs Custom pools shaped around your space, style, and lifestyle.
            </p>
          </div>

          {/* Row 4: Expert Craftsmanship */}
          <div className="s2-mob-row4 flex flex-col gap-1 text-right max-w-[330px] self-end">
            <p className="text-[#F4EEDF]">
               Expert Craftsmanship Built with precision using high-quality materials and techniques.
            </p>
          </div>

          {/* Row 5: Stacked Images Layout Container */}
          <div className="s2-mob-row5-container relative w-full max-w-[100%] !h-[270px] md:!h-[380px] self-end overflow-hidden" style={{ transform: "translate3d(0,0,0)" }}>
            {/* BASE / INITIAL IMAGE LAYER */}
            <div className="s2-mob-row5-under absolute inset-0 w-full h-full z-10">
              <img 
                src="/sectiontwo-right.webp" 
                alt="Premium overview pool structural layout" 
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>
            {/* NEW TARGET IMAGE FADING IN ON TOP */}
            <div className="s2-mob-row5 absolute inset-0 w-full h-full z-20" style={{ opacity: 0, transform: "translate3d(0,0,0)" }}>
              <img 
                src="/sectiontwo-right-under.webp" 
                alt="Premium pool design structural layout" 
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>
          </div>

          {/* Row 6: Seamless Process */}
          <div className="s2-mob-row6 flex flex-col gap-1 max-w-[330px] text-left">
            <p className="text-[#F4EEDF]">
              Seamless Process From consultation to completion, we make your journey easy and stress-free.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}