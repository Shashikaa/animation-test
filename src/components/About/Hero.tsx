"use client";

import { useRef } from "react";

interface HeroProps {
  hideText?: boolean;
}

export default function Hero({ hideText = false }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  return (
    <section ref={sectionRef} className="relative w-full h-screen overflow-hidden bg-[#111]">
      {/* ── Hardware Accelerated Background image ── */}
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

      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 z-1" />

      {/* ── CONDITIONAL RENDERING: Completely removes duplicate text from DOM ── */}
      {!hideText && (
        <div className="section-continer relative z-10 h-full flex flex-col justify-end !pb-22">
          <div className="flex flex-col gap-4 lg:gap-2">
            <h1
              className="hero-title text-[#F4EEDF] !font-[100]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Designing Pool,
            </h1>
            <p className="hero-desc text-[#F4EEDF] !mt-1">
              Creating Experiences
            </p>
          </div>
        </div>
      )}
    </section>
  );
}