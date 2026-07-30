"use client";

import { useEffect } from "react";

interface HeroProps {
  onReady?: () => void;
}

export default function Hero({ onReady }: HeroProps) {
  useEffect(() => {
    // Preload the background image to ensure context is fully painted
    const img = new Image();
    img.src = "/hero-home.webp";

    if (img.complete) {
      onReady?.();
    } else {
      img.onload = () => {
        onReady?.();
      };
      img.onerror = () => {
        // Fallback: unlock even if image fails to load
        onReady?.();
      };
    }
  }, [onReady]);

  return (
    <section className="hero relative w-full h-screen overflow-hidden bg-transparent">

      {/* Gradient layer — sits underneath everything at the absolute bottom */}
      <div
        className="hero-gradient-bg absolute inset-0 w-full h-full bg-gradient-to-br from-[#10221C] to-[#0A4145] z-10"
        style={{ opacity: 1 }}
      />

      {/* Secondary Text Wrapper (Left Text) */}
      <div className="hero-secondary-text-wrap w-full max-w-[340px] absolute bottom-[140px] md:bottom-[180px] lg:bottom-40 left-6 sm:left-12 lg:left-24 z-30 overflow-hidden pt-4">
        <p className="hero-secondary-para font-body text-[#F4EEDF] text-left text-sm sm:text-base leading-relaxed m-0 p-0">
{`Expert craftsmanship and attention
to detail bring your vision to life,
delivering seamless pool solutions
from concept to completion.`}
        </p>
      </div>

      {/* Targetable Background wrapper layer — sits at z-20 */}
      <div
        className="hero-bg-wrapper absolute inset-0 w-full h-full z-20 overflow-hidden"
        style={{ clipPath: "inset(0% 0% 0% 0%)" }}
      >
        <div
          className="hero-bg absolute inset-0 bg-cover bg-center bg-[url('/hero-home.webp')]"
          style={{ transform: "scale(1)", transformOrigin: "center center" }}
        />
        
        {/* Black Overlay on top of the background image */}
        <div className="hero-overlay absolute inset-0 bg-black/30 pointer-events-none z-[21]" />
      </div>

      {/* Modern Studio-Style Vertical Progress Bar (Mobile) */}
      <div className="hero-progress-wrapper absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-[100] flex items-center gap-3 pointer-events-none lg:hidden">
        


        {/* Minimalist Line Track */}
        <div className="relative flex flex-col items-center">
          {/* Top Marker */}
          <div className="w-1.5 h-1.5 rounded-full bg-[#F4EEDF] shadow-[0_0_12px_#F4EEDF]" />

          {/* Vertical Track Line with High Contrast Backing */}
          <div className="relative w-[2px] h-36 sm:h-44 bg-black/80 my-1 rounded-full overflow-hidden shadow-[0_0_8px_rgba(0,0,0,0.9)]">
            {/* Dark background buffer */}
            <div className="absolute inset-0 bg-white/20" />
            
            {/* Animated Golden Fill */}
            <div 
              className="hero-progress-bar-fill relative w-full h-full bg-[#F4EEDF] origin-top scale-y-0 shadow-[0_0_10px_#F4EEDF]"
            />
          </div>

          {/* Bottom Dot */}
          <div className="w-1 h-1 rounded-full bg-[#F4EEDF]/40" />
        </div>

      </div>

      {/* Main Content Layer */}
      <div className="section-container relative h-full w-full flex flex-col justify-end items-start lg:flex-row lg:items-end lg:justify-between !pb-[100px] md:!pb-[140px] lg:!pb-30 gap-8 z-30">

        {/* Left Side: Initial Title Block */}
        <div className="max-w-xl lg:max-w-4xl flex flex-col justify-end overflow-visible relative">
          <div className="block h-fit overflow-visible relative z-30 max-w-[260px]">
            <p className="hero-title text-[#F4EEDF] text-left m-0 p-0 select-none leading-relaxed relative z-30 font-body">
              Premium pools with refined wellness infrastructure, designed for private outdoor living.
            </p>
          </div>
        </div>

        {/* Right Side */}
        <div className="mt-4 lg:mt-0 lg:!pb-6 z-30 relative flex-shrink-0 flex flex-col items-start lg:items-end justify-end gap-4 min-h-[0px] w-full lg:w-auto">
          
          <div className="hero-right-text-wrap absolute bottom-12 left-0 lg:relative lg:bottom-0 w-full max-w-[340px] md:max-w-[390px] lg:max-w-[400px] overflow-hidden text-left lg:text-right">
            <p className="hero-right-text font-body text-[#F4EEDF] text-left lg:text-right text-sm sm:text-base leading-relaxed m-0 p-0">
{`At Grand Pools, we create custom swimming 
pools that blend style, function, and quality.
 Every pool is designed to complement your
outdoor space, adding value and elegance.`}
            </p>
          </div>

          <a
            href="/projects"

            className="hero-contact-btn group btn-underline  font-body ml-0 lg:ml-10"
          >
            See Our Projects

          </a>
        </div>
      </div>

      {/* Scroll Indicator — hidden on mobile & tablet, visible on desktop (lg:flex) */}
      <div className="hero-scroll-indicator absolute bottom-8 left-1/2 -translate-x-1/2 z-30 hidden lg:flex flex-col items-center gap-2 pointer-events-none transition-opacity duration-[400ms]">
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