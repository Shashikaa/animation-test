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
    // Base structural positions before master scroll triggers them
    gsap.set([".s5-static-title", ".s5-static-desc"], { y: 30, opacity: 0 });
    gsap.set(".s5-main-glass-card", { x: 40, opacity: 0 });
    
    // Setup clean initial states for content crossfades
    gsap.set(".s5-slide-card", { opacity: 0, y: 15, pointerEvents: "none" });
    gsap.set(".s5-slide-card-0", { opacity: 1, y: 0, pointerEvents: "auto" });
  }, []);

  return (
    <section className="!relative !w-full !h-[100lvh] !overflow-hidden">
      {/* Background Media - Handled responsively via Tailwind arbitrary classes */}
      <div className="s5-bg absolute top-0 left-0 w-full h-[100lvh] lg:h-[125lvh] bg-cover bg-center will-change-transform bg-[url('/parallax-image-about-mobile.webp')] md:bg-[url('/parallax-image-about.webp')]" />
      
      {/* Main Container Titles */}
      {/* Added lg:!top-auto so bottom-[60px] functions properly on desktop viewports */}
<div className="!absolute !z-10 !top-[150px] lg:!top-auto lg:!bottom-[60px] !left-[30px] md:!left-[65px] !flex !flex-col !gap-3 !overflow-hidden">
  <h2
    className="s5-static-title s5-reveal-text !whitespace-nowrap !font-[100] !text-[#F4EEDF] !will-change-transform"
    style={{ fontFamily: "var(--font-display)" }}
  >
    Decades of Expertise
  </h2>
  <p 
    className="s5-static-desc s5-reveal-text !text-[#F4EEDF] !will-change-transform" 
    style={{ fontFamily: "var(--font-body)" }}
  >
    Unmatched Craftsmanship
  </p>
</div>

      {/* Dynamic Slide Deck Panel Card */}
      <div 
/* Update your className string to include lg:left-auto */
className="s5-main-glass-card s5-dynamic-bg absolute z-10 left-[65px] md:left-1/3 lg:left-auto lg:!right-[65px] top-3/5 lg:top-1/2 -translate-y-1/2 w-full max-w-[200px] flex flex-col gap-6 px-5 py-8 overflow-hidden will-change-transform transition-colors duration-700"      >
        {/* Content Stack */}
        <div className="relative z-10 min-h-[150px]">
          {slides.map((slide, i) => (
            <div
              key={i}
              className={`s5-slide-card s5-slide-card-${i} flex flex-col gap-2 w-full absolute top-0 left-0`}
            >
              <h3 className="s5-reveal-text font-normal text-white text-3xl md:text-[40px]">
                {slide.stat}
              </h3>
              <p className="s5-reveal-text text-white text-sm !mt-4" style={{ fontFamily: "var(--font-body)" }}>
                <span>{slide.desc}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}