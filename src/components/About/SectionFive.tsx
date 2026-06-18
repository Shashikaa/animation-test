"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import gsap from "gsap";

const slides = [
  {
    stat: "25+ years",
    label: "Industry Experience",
    desc: "Decades of knowledge in pool design and construction.",
    glassColor: "rgba(25, 33, 28, 0.4)",
  },
  {
    stat: "100+",
    label: "Pools Built",
    desc: "Completed Projects Stunning pools crafted for homes and businesses.",
    glassColor: "rgba(35, 43, 38, 0.45)",
  },
  {
    stat: "100%",
    label: "Client Satisfaction",
    desc: "Client Satisfaction Trusted for quality, service, and seamless execution.",
    glassColor: "rgba(45, 50, 48, 0.45)",
  },
];

const SLIDE_DURATION = 0.5;

export default function SectionFive() {
  const currentRef = useRef<number>(0);
  const [current, setCurrent] = useState(0);
  const animating = useRef<boolean>(false);
  
  const activeBgRef = useRef<HTMLDivElement>(null);
  const incomingBgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // We set clean starting coordinates for the parent panels. 
    // The master scroll timeline in AboutMobile reveals them nicely without text splitting loops.
    gsap.set([".s5-static-title", ".s5-static-desc"], { y: 30, opacity: 0 });
    gsap.set(".s5-main-glass-card", { x: 40, opacity: 0 });
  }, []);

  const goTo = useCallback((next: number, direction: "next" | "prev") => {
    const prev = currentRef.current;
    if (animating.current || next === prev) return;
    animating.current = true;
    currentRef.current = next;
    setCurrent(next);

    const isNext = direction === "next";
    const startX = isNext ? "100%" : "-100%";
    const exitX = isNext ? "-100%" : "100%";

    // Glass panel color slider track
    if (activeBgRef.current && incomingBgRef.current) {
      gsap.set(incomingBgRef.current, { 
        backgroundColor: slides[next].glassColor,
        x: startX,
        display: "block"
      });

      gsap.to(activeBgRef.current, {
        x: exitX,
        duration: SLIDE_DURATION,
        ease: "power2.inOut"
      });

      gsap.to(incomingBgRef.current, {
        x: "0%",
        duration: SLIDE_DURATION,
        ease: "power2.inOut",
        onComplete: () => {
          if (activeBgRef.current) {
            gsap.set(activeBgRef.current, { 
              backgroundColor: slides[next].glassColor,
              x: "0%" 
            });
          }
          gsap.set(incomingBgRef.current, { display: "none" });
          animating.current = false;
        }
      });
    }
  }, []);

  const handlePrev = () => goTo((currentRef.current - 1 + slides.length) % slides.length, "prev");
  const handleNext = () => goTo((currentRef.current + 1) % slides.length, "next");

  return (
    <section className="!relative !w-full !h-[100lvh] !overflow-hidden">
      {/* Background Media */}
      <div
        className="s5-bg absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/parallax-image.webp')" }}
      />

      <div className="!absolute !inset-0 !pointer-events-none !z-[2] bg-black/60" />

      {/* Main Container Titles */}
      <div className="!absolute !z-10 !bottom-[60px] !left-[30px] md:!bottom-[105px] md:!left-[65px] !flex !flex-col !gap-1 !overflow-hidden">
        <h2
          className="s5-static-title !font-[100] !text-2xl md:!text-4xl !text-[#F4EEDF] !will-change-transform"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Decades of Expertise
        </h2>
        <p 
          className="s5-static-desc !text-sm md:!text-base !text-[#F4EEDF] !will-change-transform" 
          style={{ fontFamily: "var(--font-body)" }}
        >
          Unmatched Craftsmanship
        </p>
      </div>

      {/* Dynamic Slide Deck Panel Card */}
      <div
        className="s5-main-glass-card !absolute !z-10 !right-[30px] md:!right-[65px] !top-1/2 !-translate-y-1/2 !w-full !max-w-[260px] md:!max-w-[300px] !flex !flex-col !gap-6 !px-5 !py-8 !overflow-hidden !will-change-transform"
        style={{
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          boxShadow: "-5px -5px 25px rgba(255,255,255,0.02) inset",
        }}
      >
        {/* Color tracks */}
        <div 
          ref={activeBgRef} 
          className="absolute inset-0 pointer-events-none z-0" 
          style={{ backgroundColor: slides[0].glassColor }} 
        />
        <div ref={incomingBgRef} className="absolute inset-0 pointer-events-none z-0 hidden" />

        {/* Content Stack */}
        <div className="!relative !z-10">
          <div className="!relative">
            {slides.map((slide, i) => (
              <div
                key={i}
                className="!flex !flex-col !gap-2 !w-full !transition-opacity !duration-300"
                style={{
                  position: i === 0 ? "relative" : "absolute",
                  top: 0,
                  left: 0,
                  opacity: current === i ? 1 : 0,
                  pointerEvents: current === i ? "auto" : "none"
                }}
              >
                {/* ⚡ NO MORE INNER LINE WRAPPERS OR GSAP SPLITTING TWEENS HERE ⚡ */}
                <h3 className="!font-normal !text-white !text-3xl md:!text-[40px]">
                  {slide.stat}
                </h3>
                <p className="!text-white !text-sm !mt-1" style={{ fontFamily: "var(--font-body)" }}>
                  <strong className="block !text-white/90">{slide.label}</strong>
                  <span className="text-white/70">{slide.desc}</span>
                </p>
              </div>
            ))}
          </div>

          {/* Navigation Controls */}
          <div className="!flex !items-center !justify-between !mt-6">
            <button
              type="button"
              onClick={handlePrev}
              className="!font-body !cursor-pointer !text-xs !text-[#F4EEDF] !flex !items-center !gap-1 !transition-opacity !duration-200 hover:!opacity-70"
            >
              <img src="/arrow-right.svg" alt="Previous" className="!w-3 !h-3 !rotate-180" />
              <span>Previous</span>
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="!font-body !cursor-pointer !text-xs !text-[#F4EEDF] !flex !items-center !gap-1 !transition-opacity !duration-200 hover:!opacity-70"
            >
              <span>Next</span>
              <img src="/arrow-right.svg" alt="Next" className="!w-3 !h-3" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}