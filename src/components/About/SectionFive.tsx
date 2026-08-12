"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import gsap from "gsap";

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

const TEXT_DURATION = 0.55;

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

type SectionFiveProps = {
  isActive?: boolean;
};

export default function SectionFive({ isActive = true }: SectionFiveProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef<number>(0);
  const [current, setCurrent] = useState(0);

  function animateTextIn(index: number) {
    if (!containerRef.current) return;
    const targets = containerRef.current.querySelectorAll(
      `.s5-text-group-${index + 1} .gs-line-inner`
    );
    targets.forEach((inner, idx) => {
      gsap.killTweensOf(inner);
      gsap.fromTo(
        inner,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: TEXT_DURATION,
          ease: "power2.out",
          delay: idx * 0.03,
        }
      );
    });
  }

  const goTo = useCallback((next: number) => {
    const prev = currentRef.current;
    if (next === prev || !containerRef.current) return;

    currentRef.current = next;
    setCurrent(next);

    slides.forEach((_, i) => {
      const el = containerRef.current?.querySelector(`.s5-text-group-${i + 1}`) as HTMLElement;
      if (el) {
        el.style.opacity = i === next ? "1" : "0";
        el.style.pointerEvents = i === next ? "auto" : "none";
        el.style.visibility = i === next ? "visible" : "hidden";
      }
    });

    animateTextIn(next);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const timeout = setTimeout(() => {
      if (!containerRef.current) return;
      const splitTargets = containerRef.current.querySelectorAll<HTMLElement>(".s5-split-text-target");
      splitTargets.forEach((el) => splitElementIntoLines(el));

      slides.forEach((_, i) => {
        if (i !== 0) {
          gsap.set(
            containerRef.current!.querySelectorAll(`.s5-text-group-${i + 1} .gs-line-inner`),
            { y: 30, opacity: 0 }
          );
        }
      });
    }, 50);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    (window as any)._sec5GoTo = (targetIdx: number) => {
      if (targetIdx === currentRef.current) return;
      goTo(targetIdx);
    };
    return () => {
      delete (window as any)._sec5GoTo;
    };
  }, [goTo]);

  useEffect(() => {
    if (isActive && containerRef.current) {
      animateTextIn(currentRef.current);
    }
  }, [isActive]);

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
                transition: "opacity 0.4s ease, visibility 0.4s",
              }}
            >
              <h3 className="s5-split-text-target font-normal text-[#19211C] font-body text-4xl sm:text-5xl lg:text-3xl">
                {slide.stat}
              </h3>
              <div className="flex flex-col gap-1">
                <p className="s5-split-text-target font-medium text-sm sm:text-base text-[#19211C]">
                  {slide.label}
                </p>
                <p className="s5-split-text-target text-xs sm:text-sm md:text-base text-[#19211C]/80" style={{ fontFamily: "var(--font-body)" }}>
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