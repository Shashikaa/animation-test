"use client";

import { useRef } from "react";

interface HeroProps {
  hideText?: boolean;
  isMobile?: boolean; // Added flag to handle dynamic mobile bypass
}

export default function Hero({ hideText = false, isMobile = false }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  return (
    <section ref={sectionRef} className="relative w-full h-screen overflow-hidden bg-[#111]">
      <div
        ref={bgRef}
        className="about-hero-bg absolute left-0 right-0 bg-cover bg-center"
        style={{
          top: "-10%",
          bottom: "-10%",
          backgroundImage: "url('/hero-about.webp')",
          transform: "scale(1.3) translateZ(0)", 
          willChange: "transform",                 
          backfaceVisibility: "hidden",            
        }}
      />

      {/* Changed z-1 to arbitrary z-[1] so it handles stacking properly */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 z-[1]" />

      {!hideText && (
        <div 
          className="section-continer relative z-10 h-full flex flex-col justify-end !pb-22"
        >
          <div className="flex flex-col !gap-2 lg:!gap-6 leading-normal">
            <h1
              className="hero-title text-[#F4EEDF] !font-[100]"
              style={{ 
                fontFamily: "var(--font-display)",
                opacity: isMobile ? 1 : 0 // ✅ Immediate visibility on mobile, hidden for animation on desktop
              }}
            >
              Designing Pool,
            </h1>
            <p 
              className="hero-desc text-[#F4EEDF] !mt-1"
              style={{
                opacity: isMobile ? 1 : 0 // ✅ Immediate visibility on mobile, hidden for animation on desktop
              }}
            >
              Creating Experiences
            </p>
          </div>
        </div>
      )}
    </section>
  );
}