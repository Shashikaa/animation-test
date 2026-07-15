"use client";

import { useEffect } from "react";
import gsap from "gsap";

const slides = [
  {
    stat: "25+ years",
    label: "Industry Experience",
    desc: "Decades of knowledge in pool design and construction.",
  },
  {
    stat: "100+",
    label: "Pools Built",
    desc: "Completed Projects. Stunning pools crafted for homes and businesses.",
  },
  {
    stat: "100%",
    label: "Client Satisfaction",
    desc: "Trusted for quality, service, and seamless execution.",
  },
];

export default function SectionFive() {
  useEffect(() => {
    // Keep left-hand typography fully hidden prior to target label arrival
    gsap.set([".s5-static-title", ".s5-static-desc"], { y: 30, opacity: 0 });
    
    // Smooth opacity system base layers setup
    gsap.set(".s5-slide-card", { opacity: 0, pointerEvents: "none" });
    gsap.set(".s5-slide-card-0", { opacity: 1, pointerEvents: "auto" });
  }, []);

  return (
    <section className="relative w-full h-full min-h-screen overflow-hidden flex flex-col lg:grid lg:grid-cols-2 bg-[#F4EEDF]">
      
      {/* TOP / LEFT SIDE: Image + Title Overlay */}
      <div className="relative w-full h-[65svh] lg:h-full lg:min-h-screen overflow-hidden bg-[#19211C]">
        {/* Main image container - Adjusted height and negative top to anchor safely behind boundaries */}
        <div className="s5-bg absolute -top-[20%] left-0 w-full h-[140%] bg-cover bg-center will-change-transform bg-[url('/projects.webp')]" />
        
        <div className="absolute z-10 bottom-[30px] md:bottom-[60px] left-[24px] md:left-[65px] flex flex-col !gap-2 md:!gap-4 overflow-hidden">
          <h2
            className="s5-static-title text-3xl sm:text-4xl md:text-5xl lg:text-6xl  !font-[100] text-[#F4EEDF] will-change-transform opacity-0"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Decades of Expertise
          </h2>
          <p 
            className="s5-static-desc text-sm sm:text-base md:text-lg text-[#F4EEDF] will-change-transform opacity-0" 
            style={{ fontFamily: "var(--font-body)" }}
          >
            Unmatched Craftsmanship
          </p>
        </div>
      </div>

      {/* BOTTOM / RIGHT SIDE: Smooth Fixed Card Container Area */}
      <div className="s5-right-panel relative w-full flex-1 lg:h-full lg:min-h-screen bg-[#F4EEDF] flex items-center justify-center px-6 py-8 md:px-12">
        <div className="relative w-full max-w-[320px] h-[180px] sm:h-[220px] lg:h-[250px] bg-[#F4EEDF]">
          {slides.map((slide, i) => (
            <div
              key={i}
              className={`s5-slide-card s5-slide-card-${i} absolute inset-0 flex flex-col justify-center gap-2 md:gap-4 w-full h-full`}
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