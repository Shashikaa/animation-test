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
    img: "/pool-new.webp",
    label: "Pool Equipment & Installation",
    desc: "Breathe new life into your existing pool with high-quality renovations. Whether it needs resurfacing, structural repairs, or a modern upgrade, we ensure a seamless transformation with lasting results.",
  },
  {
    img: "/pool.webp",
    label: "Commercial Pool Construction",
    desc: "We design and build large-scale pools for hotels, resorts, apartment complexes, and public facilities, delivering premium quality and durability.",
  },
];

const CLIP_DURATION = 0.5;
const TEXT_DURATION = 0.45;

type SectionTwoProps = {
  isActive: boolean;
};

function splitElementIntoLines(el: HTMLElement) {
  if (el.dataset.originalHtml !== undefined) return;

  el.dataset.originalHtml = el.innerHTML;
  el.style.transform = "none";

  el.innerHTML = el.innerHTML.replace(/(\S+)/g, '<span class="gs-word">$1</span>');
  const words = Array.from(el.querySelectorAll<HTMLElement>(".gs-word"));

  const lineMap = new Map<number, HTMLElement[]>();
  words.forEach((w) => {
    const top = Math.round(w.getBoundingClientRect().top);
    if (!lineMap.has(top)) lineMap.set(top, []);
    lineMap.get(top)!.push(w);
  });

  const lines = Array.from(lineMap.values());
  el.innerHTML = "";

  lines.forEach((group) => {
    const lineOuter = document.createElement("span");
    lineOuter.className = "gs-line";
    lineOuter.style.cssText =
      "display:block; overflow:hidden; padding-bottom:0.25em; margin-bottom:-0.25em;";

    const lineInner = document.createElement("span");
    lineInner.className = "gs-line-inner";
    lineInner.style.cssText =
      "display:block; will-change:transform, opacity; padding-bottom:0.25em;";

    group.forEach((w, i) => {
      lineInner.appendChild(w);
      if (i < group.length - 1) {
        lineInner.appendChild(document.createTextNode(" "));
      }
    });

    lineOuter.appendChild(lineInner);
    el.appendChild(lineOuter);
  });
}

export default function SectionTwo({ isActive }: SectionTwoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef<number>(0);
  const [current, setCurrent] = useState(0);

  // Directly resets and animates text in for a given slide
  const animateTextIn = useCallback((index: number, immediate = false) => {
    if (!containerRef.current) return;

    // First ensure container elements for target slide are visible
    slides.forEach((_, i) => {
      const groupEl = containerRef.current?.querySelector(`.s3-text-group-${i + 1}`) as HTMLElement;
      if (groupEl) {
        const isTarget = i === index;
        groupEl.style.opacity = isTarget ? "1" : "0";
        groupEl.style.pointerEvents = isTarget ? "auto" : "none";
        groupEl.style.visibility = isTarget ? "visible" : "hidden";
      }
    });

    const targets = containerRef.current.querySelectorAll(
      `.s3-text-group-${index + 1} .gs-line-inner`
    );

    gsap.killTweensOf(targets);

    if (immediate) {
      gsap.set(targets, { y: 0, opacity: 1 });
    } else {
      gsap.fromTo(
        targets,
        { y: 25, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: TEXT_DURATION,
          ease: "power2.out",
          stagger: 0.03,
          overwrite: "auto",
        }
      );
    }
  }, []);

  const goTo = useCallback((next: number, direction: "next" | "prev") => {
    const prev = currentRef.current;
    if (next === prev || !containerRef.current) return;

    const isRapidJump = Math.abs(next - prev) > 1;
    currentRef.current = next;
    setCurrent(next);

    const targetPanels = [".s2-desktop-section", ".s3-mobile-section"];

    targetPanels.forEach((panel) => {
      const allBgs = containerRef.current!.querySelectorAll(`${panel} .s3-bg`);
      gsap.killTweensOf(allBgs);

      // Handle Background layers synchronously if rapid jump
      slides.forEach((_, i) => {
        const bgEl = containerRef.current!.querySelector(`${panel} .s3-bg-${i + 1}`);
        if (bgEl) {
          if (i === next) {
            gsap.set(bgEl, { zIndex: 2, clipPath: "inset(0% 0 0 0)" });
          } else {
            gsap.set(bgEl, { zIndex: 0, clipPath: "inset(100% 0 0 0)" });
          }
        }
      });
    });

    // Animate text directly without relying on asynchronous complete callbacks
    slides.forEach((_, i) => {
      if (i !== next) {
        const outTargets = containerRef.current?.querySelectorAll(`.s3-text-group-${i + 1} .gs-line-inner`);
        if (outTargets) {
          gsap.killTweensOf(outTargets);
          gsap.set(outTargets, { y: -15, opacity: 0 });
        }
      }
    });

    animateTextIn(next, isRapidJump);
  }, [animateTextIn]);

  useEffect(() => {
    if (!containerRef.current) return;

    const timeout = setTimeout(() => {
      if (!containerRef.current) return;
      const splitTargets = containerRef.current.querySelectorAll<HTMLElement>(".split-text-target");
      splitTargets.forEach((el) => splitElementIntoLines(el));

      // Set initial state for all slides
      slides.forEach((_, i) => {
        const targets = containerRef.current!.querySelectorAll(`.s3-text-group-${i + 1} .gs-line-inner`);
        if (i === 0) {
          gsap.set(targets, { y: 0, opacity: 1 });
        } else {
          gsap.set(targets, { y: 25, opacity: 0 });
        }
      });
    }, 50);

    return () => clearTimeout(timeout);
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

  useEffect(() => {
    if (isActive && containerRef.current) {
      animateTextIn(currentRef.current, false);
    }
  }, [isActive, animateTextIn]);

  const renderTextContent = () => (
    <div className="absolute bottom-[10%] left-[5%] md:left-[8%] right-[5%] z-10 pointer-events-none max-w-6xl">
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`s3-text-group s3-text-group-${i + 1} flex flex-col items-start gap-4 md:gap-8 lg:gap-12`}
          style={{
            position: i === 0 ? "relative" : "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            opacity: current === i ? 1 : 0,
            pointerEvents: current === i ? "auto" : "none",
            visibility: current === i ? "visible" : "hidden",
          }}
        >
          {/* Title with Split Text */}
          <h2 className="split-text-target font-display text-[#F4EEDF] text-3xl md:text-5xl lg:text-[70px] tracking-wide leading-[1.1] font-light">
            {slide.label}
          </h2>

          {/* Indicators and Description */}
          <div className="flex flex-row items-stretch gap-4 md:gap-6">
            {/* 3 Vertical Bars Indicator */}
            <div className="flex flex-col gap-[4px] py-1 justify-center">
              {slides.map((_, barIdx) => (
                <div
                  key={barIdx}
                  className={`w-[2px] transition-all duration-300 ease-out ${
                    current === barIdx ? "bg-white h-4 opacity-100" : "bg-white/30 h-4 opacity-40"
                  }`}
                />
              ))}
            </div>

            {/* Description Paragraph with Split Text */}
            <div className="flex-1">
              <p className="split-text-target font-body text-[#F4EEDF]/80 text-[13px] md:text-[16px] leading-relaxed max-w-[420px]">
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
      {/* DESKTOP LAYOUT */}
      <section className="s2-desktop-section hidden md:block w-full h-screen relative overflow-hidden bg-transparent">
        <div className="absolute inset-0 z-10 flex flex-row w-full h-full pointer-events-none">
          <div className="s2-left-panel absolute left-0 top-0 w-1/2 h-full overflow-hidden bg-black" style={{ willChange: "transform" }}>
            <img src={slides[0].img} alt="" aria-hidden className="absolute inset-0 w-[200%] h-full object-cover max-w-none" style={{ left: "0%" }} />
            <div className="absolute top-0 h-full z-[2] w-[200%]" style={{ left: "0%", background: "linear-gradient(2.13deg, #19211C 3.01%, rgba(21, 40, 31, 0) 59.11%)" }} />
          </div>
          
          <div className="s2-right-panel absolute right-0 top-0 w-1/2 h-full overflow-hidden bg-black" style={{ willChange: "transform" }}>
            <img src={slides[0].img} alt="" aria-hidden className="absolute inset-0 w-[200%] h-full object-cover max-w-none" style={{ left: "-100%" }} />
            <div className="absolute top-0 h-full z-[2] w-[200%]" style={{ left: "-100%", background: "linear-gradient(2.13deg, #19211C 3.01%, rgba(21, 40, 31, 0) 59.11%)" }} />
          </div>
        </div>

        <div className="absolute inset-0 z-20 w-full h-full pointer-events-none">
          {slides.map((slide, i) => (
            <div
              key={i}
              className={`s3-bg s3-bg-${i + 1} absolute inset-0 w-full h-full`}
              style={{ 
                zIndex: i === 0 ? 1 : 0, 
                clipPath: i === 0 ? "inset(0 0 0 0)" : "inset(100% 0 0 0)",
                visibility: i === 0 ? "hidden" : "visible"
              }} 
            >
              <img src={slide.img} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 z-[2]" style={{ background: "linear-gradient(2.13deg, #19211C 3.01%, rgba(21, 40, 31, 0) 59.11%)" }} />
            </div>
          ))}
        </div>

        <div className="s2-inner-fade-target absolute inset-0 z-30 w-full h-full pointer-events-none">
          {renderTextContent()}
        </div>
      </section>

      {/* MOBILE LAYOUT */}
      <section className="s3-mobile-section flex md:hidden flex-col w-full h-screen relative overflow-hidden bg-black">
        <div className="absolute inset-0 w-full h-full z-0">
          {slides.map((slide, i) => (
            <div
              key={i}
              className={`s3-bg s3-bg-${i + 1} absolute inset-0 w-full h-full`}
              style={{ 
                zIndex: i === 0 ? 1 : 0, 
                clipPath: i === 0 ? "inset(0 0 0 0)" : "inset(100% 0 0 0)" 
              }}
            >
              <img src={slide.img} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#19211C]/95 via-[#19211C]/40 to-transparent z-[2]" />
            </div>
          ))}
        </div>
        <div className="s2-inner-fade-target absolute inset-0 z-10 w-full h-full pointer-events-none">
          {renderTextContent()}
        </div>
      </section>
    </div>
  );
}