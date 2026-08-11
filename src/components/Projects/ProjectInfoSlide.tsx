"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { InfoSlide } from "../../app/projects/[slug]/data";

interface ProjectInfoSlideProps {
  slides: InfoSlide[];
  isActive?: boolean;
}

const TEXT_DURATION = 0.45;

function splitElementIntoLines(el: HTMLElement) {
  if (el.dataset.originalHtml !== undefined) return;

  el.dataset.originalHtml = el.innerHTML;
  el.style.transform = "none";

  el.innerHTML = el.innerHTML.replace(
    /(\S+)/g,
    '<span class="gs-word" style="display:inline-block; white-space:nowrap;">$1</span>'
  );
  const words = Array.from(el.querySelectorAll<HTMLElement>(".gs-word"));

  const lines: HTMLElement[][] = [];
  words.forEach((w) => {
    const top = w.getBoundingClientRect().top;
    let added = false;
    for (const line of lines) {
      const lineTop = line[0].getBoundingClientRect().top;
      if (Math.abs(top - lineTop) < 6) {
        line.push(w);
        added = true;
        break;
      }
    }
    if (!added) {
      lines.push([w]);
    }
  });

  el.innerHTML = "";

  lines.forEach((group) => {
    const lineOuter = document.createElement("span");
    lineOuter.className = "gs-line";
    lineOuter.style.cssText =
      "display:block; overflow:hidden; padding-bottom:0.15em; margin-bottom:-0.15em;";

    const lineInner = document.createElement("span");
    lineInner.className = "gs-line-inner";
    lineInner.style.cssText =
      "display:block; will-change:transform, opacity; padding-bottom:0.15em;";

    group.forEach((w, i) => {
      w.style.display = "";
      w.style.whiteSpace = "";
      lineInner.appendChild(w);
      if (i < group.length - 1) {
        lineInner.appendChild(document.createTextNode(" "));
      }
    });

    lineOuter.appendChild(lineInner);
    el.appendChild(lineOuter);
  });
}

export default function ProjectInfoSlide({ slides }: ProjectInfoSlideProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef<number>(0);
  const isAnimatingRef = useRef<boolean>(false);

  function transitionToSlide(nextIdx: number) {
    if (!containerRef.current) return;

    const prevIdx = currentRef.current;
    if (nextIdx === prevIdx && isAnimatingRef.current) return;
    currentRef.current = nextIdx;
    isAnimatingRef.current = true;

    const prevTargets = containerRef.current.querySelectorAll(
      `.slide-text-${prevIdx} .gs-line-inner`
    );
    const nextTargets = containerRef.current.querySelectorAll(
      `.slide-text-${nextIdx} .gs-line-inner`
    );

    // Synchronous immediate toggle to avoid animation overlap lag
    slides.forEach((_, i) => {
      const el = containerRef.current?.querySelector(`.slide-text-${i}`) as HTMLElement;
      if (el) {
        if (i === nextIdx) {
          el.style.opacity = "1";
          el.style.pointerEvents = "auto";
          el.style.visibility = "visible";
        } else if (i !== prevIdx) {
          el.style.opacity = "0";
          el.style.pointerEvents = "none";
          el.style.visibility = "hidden";
        }
      }
    });

    // Animate out previous text
    if (prevTargets.length > 0 && prevIdx !== nextIdx) {
      gsap.killTweensOf(Array.from(prevTargets));
      gsap.to(Array.from(prevTargets), {
        y: -20,
        opacity: 0,
        duration: 0.25,
        ease: "power2.in",
        stagger: 0.015,
        onComplete: () => {
          const prevEl = containerRef.current?.querySelector(`.slide-text-${prevIdx}`) as HTMLElement;
          if (prevEl && currentRef.current !== prevIdx) {
            prevEl.style.opacity = "0";
            prevEl.style.pointerEvents = "none";
            prevEl.style.visibility = "hidden";
          }
        },
      });
    }

    // Animate in new text
    if (nextTargets.length > 0) {
      gsap.killTweensOf(Array.from(nextTargets));
      gsap.fromTo(
        Array.from(nextTargets),
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: TEXT_DURATION,
          ease: "power2.out",
          stagger: 0.02,
          onComplete: () => {
            isAnimatingRef.current = false;
          },
        }
      );
    } else {
      isAnimatingRef.current = false;
    }
  }

  useEffect(() => {
    if (!containerRef.current) return;

    const runSplitLogic = () => {
      if (!containerRef.current) return;

      const blocks = containerRef.current.querySelectorAll<HTMLElement>(".info-text-block");
      const savedStyles: Array<{ visibility: string; opacity: string }> = [];

      blocks.forEach((b) => {
        savedStyles.push({ visibility: b.style.visibility, opacity: b.style.opacity });
        b.style.visibility = "visible";
        b.style.opacity = "1";
      });

      const splitTargets = containerRef.current.querySelectorAll<HTMLElement>(".split-text-target");
      splitTargets.forEach((el) => splitElementIntoLines(el));

      blocks.forEach((b, i) => {
        b.style.visibility = savedStyles[i].visibility;
        b.style.opacity = savedStyles[i].opacity;
      });

      slides.forEach((_, i) => {
        if (i !== 0) {
          gsap.set(containerRef.current!.querySelectorAll(`.slide-text-${i} .gs-line-inner`), {
            y: 30,
            opacity: 0,
          });
        }
      });
    };

    if (document.fonts) {
      document.fonts.ready.then(() => {
        requestAnimationFrame(runSplitLogic);
      });
    } else {
      setTimeout(runSplitLogic, 100);
    }
  }, [slides]);

  useEffect(() => {
    (window as any)._projectInfoGoTo = (nextIdx: number) => {
      transitionToSlide(nextIdx);
    };

    return () => {
      delete (window as any)._projectInfoGoTo;
    };
  }, [slides]);

  if (!slides || slides.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden bg-[#131313] project-info-master z-[20] touch-none select-none"
    >
      <div className="w-full h-full flex flex-col lg:grid lg:grid-cols-2">
        {/* Text Column */}
        <div className="relative w-full h-[55%] lg:h-full order-1 lg:order-2 bg-[#EFECE6] !p-6 sm:p-12 md:!p-16 lg:!p-20 flex flex-col justify-center z-[60] text-[#131313]">
          <div className="relative w-full h-full flex flex-col justify-center">
            {slides.map((slide, index) => (
              <div
                key={`info-text-${index}`}
                className={`info-text-block slide-text-${index} absolute inset-0 flex flex-col justify-center gap-3 sm:gap-4 md:gap-6`}
                style={{
                  opacity: index === 0 ? 1 : 0,
                  pointerEvents: index === 0 ? "auto" : "none",
                  visibility: index === 0 ? "visible" : "hidden",
                }}
              >
                <h2 className="text-[#242A27] font-display split-text-target text-xl sm:text-2xl md:text-4xl lg:text-5xl font-light">
                  {slide.title}
                </h2>
                <div className="max-w-md pt-1 md:pt-0">
                  <p className="text-xs sm:text-sm md:text-base leading-relaxed text-[#242A27] font-normal split-text-target">
                    {slide.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Image Layer Column */}
        <div className="relative w-full h-[45%] lg:h-full order-2 lg:order-1 overflow-hidden bg-[#1e1e1e]">
          {slides.map((slide, index) => (
            <div
              key={`info-img-layer-${index}`}
              className={`info-img-layer info-img-layer-${index} absolute inset-0 w-full h-full overflow-hidden`}
              style={{
                zIndex: index + 10,
                clipPath:
                  index === 0
                    ? "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)"
                    : "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
              }}
            >
              <div
                className="info-image-inner w-full h-full bg-cover bg-center will-change-transform"
                style={{
                  backgroundImage: `url(${slide.image})`,
                  transform: "scale(1.2)",
                  transformOrigin: "center center",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}