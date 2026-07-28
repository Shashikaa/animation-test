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
        backfaceVisibility: "hidden",
      }}
    >
      <link rel="preload" href="/sectiontwo.webp" as="image" type="image/webp" />
      <link rel="preload" href="/hero.webp" as="image" type="image/webp" />
      <link rel="preload" href="/pool-new.webp" as="image" type="image/webp" />
      <link rel="preload" href="/pool.webp" as="image" type="image/webp" />

      {/* BASE BACKGROUND LAYER (IMAGE 1) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Mobile / Tablet Background */}
        <img
          src="/PremiumPool.webp"
          alt="Background layer mobile"
          className="block lg:hidden w-full h-full object-cover"
          style={{
            willChange: "transform",
            transform: "translate3d(0,0,0)",
          }}
        />

        {/* Desktop Background */}
        <img
          src="/sectiontwo.webp"
          alt="Background layer desktop"
          className="hidden lg:block w-full h-full object-cover"
          style={{
            willChange: "transform",
            transform: "translate3d(0,0,0)",
          }}
        />
      </div>

      {/* MOBILE BACKGROUND LAYER 2 */}
      <div
        className="s2-mob-clip-bg-1 lg:hidden absolute inset-0 z-[1] overflow-hidden pointer-events-none origin-left"
        style={{
          transform: "scaleX(0) translate3d(0,0,0)",
          willChange: "transform",
        }}
      >
        <img
          src="/hero.webp"
          alt="Background layer 2"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black opacity-50"></div>
      </div>

      {/* MOBILE BACKGROUND LAYER 3 */}
      <div
        className="s2-mob-clip-bg-2 lg:hidden absolute inset-0 z-[2] overflow-hidden pointer-events-none origin-left"
        style={{
          transform: "scaleX(0) translate3d(0,0,0)",
          willChange: "transform",
        }}
      >
        <img
          src="/pool-new.webp"
          alt="Background layer 3"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black opacity-50"></div>
      </div>

      {/* MOBILE BACKGROUND LAYER 4 */}
      <div
        className="s2-mob-clip-bg-3 lg:hidden absolute inset-0 z-[3] overflow-hidden pointer-events-none origin-left"
        style={{
          transform: "scaleX(0) translate3d(0,0,0)",
          willChange: "transform",
        }}
      >
        <img
          src="/pool.webp"
          alt="Background layer 4"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black opacity-50"></div>
      </div>

      {/* CONTENT BLOCK OVERLAY (FIRST FRAME TEXT) */}
      <div className="section-container absolute inset-0 z-10 h-full flex flex-col justify-end pointer-events-none">
        <div className="s2-body flex flex-col items-end text-right gap-2 lg:gap-3 p-4 md:p-8">
          <p className="reveal-text text-[#F4EEDF] font-body text-sm md:text-base leading-relaxed text-right w-full max-w-[260px] md:max-w-[280px] lg:max-w-[340px]">
            From renovations to new builds, we design and construct pools that combine style, functionality, and durability.
          </p>
        </div>
      </div>

      {/* CORE WORKSPACE GRID */}
      <div className="absolute inset-0 z-20 grid grid-cols-1 lg:grid-cols-2 w-full h-full pointer-events-none">
        {/* LEFT COLUMN: INITIAL TITLE */}
        <div className="relative h-full overflow-hidden !pt-58 md:!pt-66 lg:!pt-36">
          <div className="!mb-33 md:!mb-80 lg:!mb-0 h-[100px] !ml-[20px] md:!ml-[30px] lg:!ml-[65px]">
            <h2 className="s2-title-main font-display text-[#F4EEDF] !font-[100] text-3xl md:text-5xl reveal-text !mb-4">
              Premium Pool 
            </h2>
            <p className="s2-title-sub font-body text-[#F4EEDF] text-sm md:text-base reveal-text">
              Solution for Every Need
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: DOUBLE LAYER STACK (DESKTOP ONLY) */}
        <div className="absolute top-0 right-0 bottom-0 left-1/2 hidden lg:block z-20 pointer-events-auto">
          {/* UNDERNEATH LAYER */}
          <div 
            className="s2-right-img-frame-under absolute inset-0 w-full h-full z-10"
            style={{ 
              willChange: "clip-path, transform", 
              transform: "translate3d(0,0,0)",
              backfaceVisibility: "hidden" 
            }}
          >
            <div className="w-full h-full relative overflow-hidden shadow-2xl">
              <img
                src="/pool-new.webp"
                alt="Premium pool design structural layout"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* TOP INITIAL LAYER */}
          <div 
            className="s2-right-img-frame absolute inset-0 w-full h-full z-20"
            style={{ 
              willChange: "clip-path, transform", 
              transform: "translate3d(0,0,0)",
              backfaceVisibility: "hidden" 
            }}
          >
            <div className="w-full h-full relative overflow-hidden shadow-2xl">
              <img
                src="/pool.webp"
                alt="Figma layout premium overview pool"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* DESKTOP SCROLLING WORKSPACE GRID CONTAINER */}
      <div 
        className="s2-scroll-content hidden lg:flex absolute left-4 md:left-8 lg:left-16 top-0 flex-col w-full max-w-[40%] z-30 pointer-events-none pt-[12vh] pb-16 opacity-0"
        style={{
          willChange: "transform, opacity",
          transform: "translate3d(0, 100%, 0)",
          backfaceVisibility: "hidden"
        }}
      >
        <p className="text-[#F4EEDF] font-body text-base leading-relaxed !text-left max-w-[290px]">
          Since 2021, Grand Pools has been creating custom swimming pools with a focus on refined design, quality craftsmanship, and a smooth building experience.
        </p>
        <p className="text-[#F4EEDF] font-body text-base leading-relaxed !text-left max-w-[230px] !self-end !mt-[80px]">
          Tailor-Made Designs — Custom pools shaped around your space, style, and lifestyle
        </p>
        <div className="w-full aspect-[4/3] max-w-[340px] overflow-hidden !mt-[40px]">
          <img
            src="/hero.webp"
            alt="Architectural swimming details"
            className="w-full h-full object-cover"
          />
        </div>
        <p className="text-[#F4EEDF] font-body text-sm leading-relaxed !text-left max-w-[290px] !mt-[60px]">
          Expert Craftsmanship <br />
          Built with precision using high-quality materials and techniques.
        </p>
        <p className="text-[#F4EEDF] font-body text-sm leading-relaxed !text-left max-w-[230px] !self-end !mt-[40px]">
          Seamless Process<br />
          From consultation to completion, we make it easy stress-free.
        </p>
      </div>

      {/* MOBILE & TABLET TEXT-ONLY SCROLL CONTAINER */}
      <div
        className="s2-mob-scroll-wrapper section-container lg:hidden relative w-full h-auto z-40 pointer-events-auto px-6 md:px-12"
        style={{
          opacity: 0,
          willChange: "transform",
          transform: "translate3d(0, 100vh, 0)",
        }}
      >
        <div className="w-full flex flex-col py-[18vh] items-start">
          <p className="s2-mob-row1 text-[#F4EEDF] font-body max-w-[320px] text-left text-sm md:text-base leading-relaxed">
            Since 2021, Grand Pools has been creating custom swimming pools with a focus on refined design, quality craftsmanship, and a smooth building experience.
          </p>

          <div className="s2-mob-row2 flex flex-col gap-1 text-left max-w-[300px] self-start !mt-[500px]">
            <p className="text-[#F4EEDF] text-xl md:text-2xl font-light">
              Tailor-Made Designs
            </p>
            <p className="text-[#F4EEDF] font-body text-xs md:text-sm leading-relaxed">
              Custom pools shaped around your space, style, and lifestyle.
            </p>
          </div>

          <div className="s2-mob-row3 flex flex-col gap-1 text-left max-w-[300px] self-start !mt-[500px]">
            <p className="text-[#F4EEDF] text-xl md:text-2xl font-light">
              Expert Craftsmanship
            </p>
            <p className="text-[#F4EEDF] font-body text-xs md:text-sm leading-relaxed">
              Built with precision using high-quality materials and techniques.
            </p>
          </div>

          <div className="s2-mob-row4 flex flex-col gap-1 max-w-[300px] text-left self-start !mt-[500px]">
            <p className="text-[#F4EEDF] text-xl md:text-2xl font-light">
              Seamless Process
            </p>
            <p className="text-[#F4EEDF] font-body text-xs md:text-sm leading-relaxed">
              From consultation to completion, we make your journey easy and stress-free.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}