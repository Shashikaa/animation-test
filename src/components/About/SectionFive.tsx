"use client";

import { useRef, useState, useCallback, useEffect } from "react";

const slides = [
  {
    stat: "25+ Years ",
    label: "Industry Experience",
    desc: "Decades of knowledge in pool design and construction.",
  },
  {
    stat: "100+",
    label: "Completed Projects",
    desc: "Stunning pools crafted for homes and businesses.",
  },
  {
    stat: "100%",
    label: "Client Satisfaction",
    desc: "Trusted for quality, service, and seamless execution.",
  },
];

type SectionFiveProps = {
  isActive?: boolean;
};

export default function SectionFive({ isActive = true }: SectionFiveProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef<number>(0);
  const [current, setCurrent] = useState(0);

  const goTo = useCallback((next: number) => {
    if (next === currentRef.current) return;
    currentRef.current = next;
    setCurrent(next);
  }, []);

  useEffect(() => {
    (window as any)._sec5GoTo = (targetIdx: number) => {
      goTo(targetIdx);
    };
    return () => {
      delete (window as any)._sec5GoTo;
    };
  }, [goTo]);

  return (
    <section ref={containerRef} className="relative w-full h-full overflow-hidden flex flex-col lg:grid lg:grid-cols-2 bg-[#F4EEDF]">
      
      {/* TOP / LEFT SIDE */}
      <div className="relative w-full h-[65svh] lg:h-full lg:min-h-screen overflow-hidden bg-[#19211C]">
        <div className="s5-bg absolute -top-[0%] left-0 w-full h-[240%] bg-cover bg-center will-change-transform bg-[url('/project-aerial2.webp')]" />
        
        <div className="absolute inset-0 bg-black/40 pointer-events-none z-[1]" />
        
        <div className="absolute z-10 bottom-[30px] md:bottom-[60px] left-[24px] md:left-[65px] flex flex-col !gap-2 md:!gap-4 overflow-hidden">
          <h2
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl !font-[100] text-[#F4EEDF]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Decades of Expertise
          </h2>
          <p 
            className="text-sm sm:text-base md:text-lg text-[#F4EEDF]" 
            style={{ fontFamily: "var(--font-body)" }}
          >
            Unmatched Craftsmanship
          </p>
        </div>
      </div>

      {/* BOTTOM / RIGHT SIDE */}
      <div className="s5-right-panel relative w-full flex-1 lg:h-full lg:min-h-screen bg-[#F4EEDF] flex items-center justify-center px-6 py-8 md:px-12">
        <div className="relative w-full max-w-[320px] h-[180px] sm:h-[220px] lg:h-[250px] bg-[#F4EEDF]">
          {slides.map((slide, i) => (
            <div
              key={i}
              className={`s5-text-group s5-text-group-${i + 1} absolute inset-0 flex flex-col justify-center gap-2 md:gap-4 w-full h-full`}
              style={{
                opacity: current === i ? 1 : 0,
                pointerEvents: current === i ? "auto" : "none",
                visibility: current === i ? "visible" : "hidden",
                transition: "opacity 0.4s ease, visibility 0.4s ease",
              }}
            >
              <h3 className="font-normal text-[#19211C] font-body text-4xl sm:text-5xl lg:text-3xl">
                {slide.stat}
              </h3>
              <div className="flex flex-col gap-1">
                <p className="font-medium text-sm sm:text-base text-[#19211C]">
                  {slide.label}
                </p>
                <p className="text-xs sm:text-sm md:text-base text-[#19211C]/80" style={{ fontFamily: "var(--font-body)" }}>
                  {slide.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}