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

const SLIDE_DURATION = 0.8;
const TEXT_DURATION = 0.6;

function animateTextIn(selector: string) {
  document.querySelectorAll(selector).forEach((el) => {
    (Array.from(el.querySelectorAll(":scope > .s5-line-wrap > .s5-line-inner")) as HTMLElement[])
      .forEach((inner, idx) => {
        gsap.killTweensOf(inner);
        gsap.fromTo(inner,
          { y: 15, opacity: 0 },
          { y: 0, opacity: 1, duration: TEXT_DURATION, ease: "power2.out", delay: idx * 0.06 }
        );
      });
  });
}

function animateTextOut(selector: string) {
  document.querySelectorAll(selector).forEach((el) => {
    (Array.from(el.querySelectorAll(":scope > .s5-line-wrap > .s5-line-inner")) as HTMLElement[])
      .forEach((inner, idx) => {
        gsap.killTweensOf(inner);
        gsap.to(inner, { y: -15, opacity: 0, duration: 0.2, ease: "power2.in", delay: idx * 0.02 });
      });
  });
}

export default function SectionFive() {
  const currentRef = useRef<number>(0);
  const [current, setCurrent] = useState(0);
  const animating = useRef<boolean>(false);
  
  // Refs for the sliding card backgrounds
  const activeBgRef = useRef<HTMLDivElement>(null);
  const incomingBgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    slides.forEach((_, i) => {
      document.querySelectorAll(`.s5-text-${i + 1} > .s5-line-wrap > .s5-line-inner`)
        .forEach((el) => gsap.set(el, i === 0 ? { y: 0, opacity: 1 } : { y: 15, opacity: 0 }));
    });

    // Setup initial state for Section Five entrance reveals
    gsap.set([".s5-static-title", ".s5-static-desc"], { y: 30, opacity: 0 });
    gsap.set(".s5-main-glass-card", { x: 100, opacity: 0 });
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

    // ── Glass Card Background Slider Logic ──
    if (activeBgRef.current && incomingBgRef.current) {
      // 1. Prepare incoming color panel offscreen
      gsap.set(incomingBgRef.current, { 
        backgroundColor: slides[next].glassColor,
        x: startX,
        display: "block"
      });

      // 2. Slide the current background panel out
      gsap.to(activeBgRef.current, {
        x: exitX,
        duration: SLIDE_DURATION,
        ease: "power3.inOut"
      });

      // 3. Slide the incoming background panel into view
      gsap.to(incomingBgRef.current, {
        x: "0%",
        duration: SLIDE_DURATION,
        ease: "power3.inOut",
        onComplete: () => {
          // Sync baseline background state cleanly after the transition finishes
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

    // ── Text Fade/Slide Mechanics ──
    document.querySelectorAll(`.s5-text-${prev + 1} > .s5-line-wrap > .s5-line-inner`)
      .forEach((el) => { gsap.killTweensOf(el); gsap.set(el, { y: 0, opacity: 1 }); });
    animateTextOut(`.s5-text-${prev + 1}`);

    gsap.set(`.s5-text-${next + 1}`, { opacity: 1 });
    document.querySelectorAll(`.s5-text-${next + 1} > .s5-line-wrap > .s5-line-inner`)
      .forEach((el) => { gsap.killTweensOf(el); gsap.set(el, { y: 15, opacity: 0 }); });
    gsap.delayedCall(0.25, () => animateTextIn(`.s5-text-${next + 1}`));

  }, []);

  const handlePrev = () => goTo((currentRef.current - 1 + slides.length) % slides.length, "prev");
  const handleNext = () => goTo((currentRef.current + 1) % slides.length, "next");

  return (
    <section className="!relative !w-full !h-[100lvh] !overflow-hidden">

      {/* Static Full Screen Background Image (Doesn't move on navigation click) */}
      <div
        className="s5-bg absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/parallax-image.webp')" }}
      />

      {/* Static dark overlay */}
      <div
        className="!absolute !inset-0 !pointer-events-none !z-[2]"
        style={{ backgroundColor: "#00000096" }}
      />

      {/* Bottom-left titles */}
      <div className="!absolute !z-10 !bottom-[105px] !left-[65px] !flex !flex-col !gap-2 !overflow-hidden">
        <h2
          className="s5-static-title !font-[100] !text-[#F4EEDF] !will-change-transform"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Decades of Expertise
        </h2>
        <p 
          className="s5-static-desc !text-[#F4EEDF] !will-change-transform" 
          style={{ fontFamily: "var(--font-body)" }}
        >
          Unmatched Craftsmanship
        </p>
      </div>

      {/* Right Glass Card Frame
         `overflow-hidden` keeps the sliding background panels contained inside the card frame
      */}
      <div
        className="s5-main-glass-card !absolute !z-10 !right-[65px] !top-1/2 !-translate-y-1/2 !w-full !max-w-[280px] md:!max-w-[300px] !flex !flex-col !gap-6 !px-5 !py-8 md:!px-6 !overflow-hidden !will-change-transform"
        style={{
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          boxShadow: "-5px -5px 25px rgba(255,255,255,0.02) inset",
        }}
      >
        {/* Sliding Background Layer Trackers */}
        <div 
          ref={activeBgRef} 
          className="absolute inset-0 pointer-events-none z-0" 
          style={{ backgroundColor: slides[0].glassColor }} 
        />
        <div 
          ref={incomingBgRef} 
          className="absolute inset-0 pointer-events-none z-0 hidden" 
        />

        {/* Content Container (Needs higher z-index to stay above sliding bgs) */}
        <div className="!relative !z-10">
          <div className="!relative">
            {slides.map((slide, i) => (
              <div
                key={i}
                className={`s5-text s5-text-${i + 1} !flex !flex-col !gap-3 !w-full`}
                style={{
                  position: i === 0 ? "relative" : "absolute",
                  top: 0,
                  left: 0,
                  opacity: i === 0 ? 1 : 0,
                }}
              >
                <div className="s5-line-wrap !overflow-hidden">
                  <div className="s5-line-inner">
                    <h3
                      className="!font-normal !text-white text-[40px]"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {slide.stat}
                    </h3>
                  </div>
                </div>
                <div className="s5-line-wrap !overflow-hidden !mt-4">
                  <div className="s5-line-inner">
                    <p className="!text-white" style={{ fontFamily: "var(--font-body)" }}>
                      {slide.label}
                      <br />
                      {slide.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Controls */}
          <div className="!flex !items-center !justify-between !mt-8">
            <button
              type="button"
              onClick={handlePrev}
              className="!font-body !cursor-pointer !text-sm !text-[#F4EEDF] !flex !items-center !gap-2 !transition-opacity !duration-200 hover:!opacity-70"
            >
              <img src="/arrow-right.svg" alt="Previous" className="!w-4 !h-4 !rotate-180" />
              <span>Previous</span>
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="!font-body !cursor-pointer !text-sm !text-[#F4EEDF] !flex !items-center !gap-2 !transition-opacity !duration-200 hover:!opacity-70"
            >
              <span>Next</span>
              <img src="/arrow-right.svg" alt="Next" className="!w-4 !h-4" />
            </button>
          </div>
        </div>
      </div>

    </section>
  );
}