"use client";

import { useEffect, useState } from "react";

export default function Hero() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY < 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="hero relative w-full h-screen overflow-hidden bg-transparent">

      {/* Gradient layer — sits underneath the image, faded independently */}
      <div
        className="hero-gradient-bg absolute inset-0 w-full h-full bg-gradient-to-br from-[#10221C] to-[#0A4145] will-change-[opacity]"
        style={{ opacity: 1 }}
      />

      {/* Targetable Background wrapper layer for the collapsing animation */}
      <div
        className="hero-bg-wrapper absolute inset-0 w-full h-full will-change-[clip-path] z-21"
        style={{ clipPath: "inset(0% 0% 0% 0%)" }}
      >
        <div
          className="hero-bg absolute inset-0 bg-cover bg-center bg-[url('/heroHome.webp')] will-change-transform "
          style={{ transform: "scale(1.15)", transformOrigin: "center center" }}
        />
      </div>

      {/* Main Content Layer */}
      <div className="section-container relative h-full w-full flex flex-col justify-end items-start lg:flex-row lg:items-end lg:justify-between !pb-[100px] md:!pb-[140px] lg:!pb-30 gap-8">

        {/* Isolated content stack for the Left Side */}
        <div className="max-w-xl lg:max-w-4xl flex flex-col justify-end overflow-visible relative">

          {/* Title Block */}
          <div className="block h-fit overflow-visible relative z-22">
            <h1 className="text-[#F4EEDF] text-display text-[36px] sm:text-[48px] lg:!text-[80px] font-[100] text-left will-change-[transform,opacity] m-0 p-0 select-none leading-tight">
              Refined Pools <br /> for Modern Living
            </h1>
          </div>

          {/* Secondary Text Wrapper */}
          <div className="hero-secondary-text-wrap w-full max-w-[260px] md:max-w-[280px] lg:max-w-[340px] absolute bottom-10 lg:bottom-30 left-0 translate-y-full z-20 overflow-visible pt-4">
            <p

              className="hero-secondary-para font-body text-[#F4EEDF] text-left text-sm sm:text-base leading-relaxed m-0 p-0"
              style={{ visibility: "hidden" }}
            >
              From renovations to new builds, we design and construct pools that combine style, functionality, and durability.
            </p>
          </div>
        </div>

        {/* Right Text Block */}
        <div className="hero-right-text max-w-[310px] md:max-w-[280px] lg:max-w-[320px] text-left mt-4 lg:mt-0 lg:!pb-25 z-22">
          <p className="text-[#F4EEDF] font-normal leading-relaxed text-sm sm:text-base">
            Premium pools with refined wellness infrastructure, designed for private outdoor living.
          </p>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 pointer-events-none transition-opacity duration-[400ms] ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        <span className="text-[#F4EEDF] text-[10px] font-light tracking-[0.2em] uppercase [text-shadow:0_1px_6px_rgba(0,0,0,0.8)]">
          Scroll
        </span>
        <div className="w-[22px] h-[34px] rounded-[11px] border-[1.5px] border-[rgba(244,238,223,0.9)] relative flex justify-center pt-[5px] shadow-[0_0_12px_rgba(0,0,0,0.5),inset_0_0_8px_rgba(0,0,0,0.2)] backdrop-blur-sm bg-black/15">
          <div className="w-[3px] h-[6px] rounded-[2px] bg-[#F4EEDF] [animation:scrollDot_1.6s_ease-in-out_infinite]" />
        </div>
      </div>

      <style>{`
        @keyframes scrollDot {
          0%   { transform: translateY(0);    opacity: 1; }
          60%  { transform: translateY(10px); opacity: 0; }
          61%  { transform: translateY(0);    opacity: 0; }
          100% { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </section>
  );
}