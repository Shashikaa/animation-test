"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import gsap from "gsap";

const slides = [
  {
    img: "/pool-renovation.webp",
    label: "Residential Pool Construction",
    desc: "Whether you're creating a peaceful backyard retreat or an entertainer’s dream, we bring your vision to life with tailored designs, expert craftsmanship, and a seamless building process from start to finish.",
  },
  {
    img: "/hero.webp",
    label: "Concrete Pool Renovation",
    desc: "Breathe new life into your existing pool with high-quality renovations. Whether it needs resurfacing, structural repairs, or a modern upgrade, we ensure a seamless transformation with lasting results.",
  },
  {
    img: "/pool-new.webp",
    label: "Pool Equipment & Installation",
    desc: "Breathe new life into your existing pool with high-quality renovations. Whether it needs resurfacing, structural repairs, or a modern upgrade, we ensure a seamless transformation with lasting results.",
  },
  {
    img: "/sectionOne.webp",
    label: "Commercial Pool Construction",
    desc: "We design and build large-scale pools for hotels, resorts, apartment complexes, and public facilities, delivering premium quality and durability.",
  },
];

const CLIP_DURATION = 1.0;
const TEXT_DURATION = 0.7;

type SectionTwoProps = {
  isActive: boolean;
};

export default function SectionTwo({ isActive }: SectionTwoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef<number>(0);
  const [current, setCurrent] = useState(0);
  const animating = useRef<boolean>(false);

  function animateTextIn(selector: string) {
    if (!containerRef.current) return;
    const targets = containerRef.current.querySelectorAll(`${selector} .s3-line-inner`);
    targets.forEach((inner, idx) => {
      gsap.killTweensOf(inner);
      gsap.fromTo(
        inner,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: TEXT_DURATION,
          ease: "power3.out",
          delay: idx * 0.08,
        }
      );
    });
  }

  function animateTextOut(selector: string, callback?: () => void) {
    if (!containerRef.current) return;
    const targets = containerRef.current.querySelectorAll(`${selector} .s3-line-inner`);
    if (targets.length === 0) {
      if (callback) callback();
      return;
    }
    gsap.to(Array.from(targets), {
      y: -30,
      opacity: 0,
      duration: 0.35,
      ease: "power2.in",
      stagger: 0.03,
      onComplete: callback,
    });
  }

  useEffect(() => {
    if (!containerRef.current) return;
    slides.forEach((_, i) => {
      if (i !== 0) {
        gsap.set(containerRef.current!.querySelectorAll(`.s3-text-group-${i + 1} .s3-line-inner`), {
          y: 40,
          opacity: 0,
        });
      }
    });
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    if (isActive) {
      animateTextIn(`.s3-text-group-${currentRef.current + 1}`);
    } else {
      slides.forEach((_, i) => {
        gsap.killTweensOf(containerRef.current!.querySelectorAll(`.s3-text-group-${i + 1} .s3-line-inner`));
        gsap.set(containerRef.current!.querySelectorAll(`.s3-text-group-${i + 1} .s3-line-inner`), {
          y: 40,
          opacity: 0,
        });
      });
    }
  }, [isActive]);

  const goTo = useCallback((next: number, direction: "next" | "prev") => {
    const prev = currentRef.current;
    if (animating.current || next === prev || !containerRef.current) return;
    animating.current = true;

    currentRef.current = next;
    setCurrent(next);

    const targetPanels = [".s2-desktop-section", ".s3-mobile-section"];
    
    targetPanels.forEach((panel) => {
      const currentIncoming = containerRef.current!.querySelector(`${panel} .s3-bg-${next + 1}`);
      const currentPrev = containerRef.current!.querySelector(`${panel} .s3-bg-${prev + 1}`);

      if (currentIncoming && currentPrev) {
        if (direction === "next") {
          gsap.set(currentIncoming, { clipPath: "inset(0 100% 0 0)", zIndex: 2 });
          gsap.set(currentPrev, { clipPath: "inset(0 0 0 0)", zIndex: 1 });

          gsap.to(currentIncoming, {
            clipPath: "inset(0 0% 0 0%)",
            duration: CLIP_DURATION,
            ease: "power2.inOut",
            onComplete: () => {
              gsap.set(currentIncoming, { zIndex: 1 });
              gsap.set(currentPrev, { zIndex: 0, clipPath: "inset(0 0 0 100%)" });
            },
          });
        } else {
          gsap.set(currentIncoming, { clipPath: "inset(0 0 0 0)", zIndex: 1 });
          gsap.set(currentPrev, { clipPath: "inset(0 0 0 0)", zIndex: 2 });

          gsap.to(currentPrev, {
            clipPath: "inset(0 100% 0 0)",
            duration: CLIP_DURATION,
            ease: "power2.inOut",
            onComplete: () => {
              gsap.set(currentPrev, { zIndex: 0 });
            },
          });
        }
      }
    });

    animateTextOut(`.s3-text-group-${prev + 1}`, () => {
      gsap.set(containerRef.current!.querySelectorAll(`.s3-text-group-${next + 1} .s3-line-inner`), {
        y: 40,
        opacity: 0,
      });
      animateTextIn(`.s3-text-group-${next + 1}`);
    });

    gsap.delayedCall(CLIP_DURATION + 0.15, () => {
      animating.current = false;
    });
  }, []);

  useEffect(() => {
    (window as any)._sec2GoTo = (targetIdx: number) => {
      if (targetIdx === currentRef.current) return;
      const dir = targetIdx > currentRef.current ? "next" : "prev";
      goTo(targetIdx, dir);
    };
    return () => {
      delete (window as any)._sec2GoTo;
    };
  }, [goTo]);

  const renderTextContent = () => (
    <div className="absolute bottom-[10%] left-[5%] md:left-[8%] right-[5%] z-10 pointer-events-none max-w-6xl">
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`s3-text-group s3-text-group-${i + 1} flex flex-col items-start gap-6 md:gap-8 lg:gap-12`}
          style={{
            position: i === 0 ? "relative" : "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            opacity: current === i ? 1 : 0,
            pointerEvents: current === i ? "auto" : "none",
            transition: "opacity 0.4s ease, visibility 0.4s",
            visibility: current === i ? "visible" : "hidden",
          }}
        >
          {/* Main Title */}
          <div className="s3-line-wrap overflow-hidden w-full">
            <h2 className="s3-line-inner font-display text-[#F4EEDF] text-4xl md:text-5xl lg:text-[70px] tracking-wide leading-[1.1] font-light">
              {slide.label}
            </h2>
          </div>

          {/* Indicator & Description */}
          <div className="flex flex-row items-stretch gap-4 md:gap-6">
            
            {/* 4 Vertical Bars Indicator */}
            <div className="flex flex-col gap-[4px] py-1 justify-center">
              {slides.map((_, barIdx) => (
                <div
                  key={barIdx}
                  className={`w-[2px] transition-all duration-500 ease-out ${
                    current === barIdx ? "bg-white h-4 opacity-100" : "bg-white/30 h-4 opacity-40"
                  }`}
                />
              ))}
            </div>

            {/* Description Text */}
            <div className="s3-line-wrap overflow-hidden flex-1">
              <p className="s3-line-inner font-body text-[#F4EEDF]/80 text-[14px] md:text-[16px] leading-relaxed max-w-[420px]">
                {slide.desc}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div ref={containerRef} className="w-full h-full">
      <section className="s2-desktop-section hidden md:block w-full h-screen relative overflow-hidden bg-transparent">
        
        {/* 1. INITIAL REVEAL PANELS */}
        <div className="absolute inset-0 z-10 flex flex-row w-full h-full pointer-events-none">
          {/* LEFT PANEL */}
          <div className="s2-left-panel absolute left-0 top-0 w-1/2 h-full overflow-hidden bg-black" style={{ willChange: "transform" }}>
            <img src={slides[0].img} alt="" aria-hidden className="absolute inset-0 w-[200%] h-full object-cover max-w-none" style={{ left: "0%" }} />
            <div className="absolute top-0 h-full z-[2] w-[200%]" style={{ left: "0%", background: "linear-gradient(2.13deg, #19211C 3.01%, rgba(21, 40, 31, 0) 59.11%)" }} />
          </div>
          
          {/* RIGHT PANEL */}
          <div className="s2-right-panel absolute right-0 top-0 w-1/2 h-full overflow-hidden bg-black" style={{ willChange: "transform" }}>
            <img src={slides[0].img} alt="" aria-hidden className="absolute inset-0 w-[200%] h-full object-cover max-w-none" style={{ left: "-100%" }} />
            <div className="absolute top-0 h-full z-[2] w-[200%]" style={{ left: "-100%", background: "linear-gradient(2.13deg, #19211C 3.01%, rgba(21, 40, 31, 0) 59.11%)" }} />
          </div>
        </div>

        {/* 2. UNIFIED MAIN SLIDER */}
        <div className="absolute inset-0 z-20 w-full h-full pointer-events-none">
          {slides.map((slide, i) => (
            <div
              key={i}
              className={`s3-bg s3-bg-${i + 1} absolute inset-0 w-full h-full`}
              style={{ 
                zIndex: i === 0 ? 1 : 0, 
                clipPath: i === 0 ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)",
                visibility: i === 0 ? "hidden" : "visible"
              }} 
            >
              <img src={slide.img} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 z-[2]" style={{ background: "linear-gradient(2.13deg, #19211C 3.01%, rgba(21, 40, 31, 0) 59.11%)" }} />
            </div>
          ))}
        </div>

        {/* 3. TEXT TARGET */}
        <div className="s2-inner-fade-target absolute inset-0 z-30 w-full h-full pointer-events-none">
          {renderTextContent()}
        </div>
      </section>

      {/* MOBILE LAYOUT */}
      <section className="s3-mobile-section flex md:hidden flex-col w-full h-screen relative overflow-hidden bg-black">
        <div className="absolute inset-0 w-full h-full z-0 s2-left-panel">
          {slides.map((slide, i) => (
            <div
              key={i}
              className={`s3-bg s3-bg-${i + 1} absolute inset-0 w-full h-full`}
              style={{ zIndex: i === 0 ? 1 : 0, clipPath: i === 0 ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)" }}
            >
              <img src={slide.img} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#19211C]/90 via-[#19211C]/30 to-transparent z-[2]" />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 z-10 w-full h-full pointer-events-none">
           {renderTextContent()}
        </div>
      </section>
    </div>
  );
}