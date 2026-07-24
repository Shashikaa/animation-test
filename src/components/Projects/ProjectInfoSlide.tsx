"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { InfoSlide } from "../../app/projects/[slug]/data";

interface ProjectInfoSlideProps {
  slides: InfoSlide[];
  isActive?: boolean;
}

const TEXT_DURATION = 0.55;

function splitElementIntoLines(el: HTMLElement) {
  if (el.dataset.originalHtml !== undefined) return;

  el.dataset.originalHtml = el.innerHTML;
  el.style.transform = "none";

  // Wrap words and prevent internal hyphen splitting during line calculation
  el.innerHTML = el.innerHTML.replace(/(\S+)/g, '<span class="gs-word" style="display:inline-block; white-space:nowrap;">$1</span>');
  const words = Array.from(el.querySelectorAll<HTMLElement>(".gs-word"));

  // Group words into lines using a 6px threshold buffer to avoid subpixel layout bugs
  const lines: HTMLElement[][] = [];
  words.forEach((w) => {
    const top = w.getBoundingClientRect().top;
    let added = false;
    for (const line of lines) {
      const lineTop = line[0].getBoundingClientRect().top;
      if (Math.abs(top - lineTop) < 6) { // 6px tolerance threshold
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
      "display:block; overflow:hidden; padding-bottom:0.25em; margin-bottom:-0.25em;";

    const lineInner = document.createElement("span");
    lineInner.className = "gs-line-inner";
    lineInner.style.cssText =
      "display:block; will-change:transform, opacity; padding-bottom:0.25em;";

    group.forEach((w, i) => {
      w.style.display = ""; // Reset inline-block back to default
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

export default function ProjectInfoSlide({ slides, isActive = true }: ProjectInfoSlideProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef<number>(0);

  function animateTextIn(index: number) {
    if (!containerRef.current) return;
    const targets = containerRef.current.querySelectorAll(`.slide-text-${index} .gs-line-inner`);
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

  function animateTextOut(index: number, callback?: () => void) {
    if (!containerRef.current) return;
    const targets = containerRef.current.querySelectorAll(`.slide-text-${index} .gs-line-inner`);
    if (targets.length === 0) {
      if (callback) callback();
      return;
    }
    gsap.killTweensOf(Array.from(targets));
    gsap.to(Array.from(targets), {
      y: -20,
      opacity: 0,
      duration: 0.35,
      ease: "power2.in",
      stagger: 0.02,
      onComplete: callback,
    });
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

    // Wait until fonts are 100% loaded before splitting text
    if (document.fonts) {
      document.fonts.ready.then(() => {
        setTimeout(runSplitLogic, 50);
      });
    } else {
      setTimeout(runSplitLogic, 150);
    }
  }, [slides]);

  useEffect(() => {
    (window as any)._projectInfoGoTo = (nextIdx: number) => {
      const prevIdx = currentRef.current;
      if (nextIdx === prevIdx) return;

      currentRef.current = nextIdx;

      animateTextOut(prevIdx, () => {
        if (!containerRef.current) return;

        slides.forEach((_, i) => {
          const el = containerRef.current?.querySelector(`.slide-text-${i}`) as HTMLElement;
          if (el) {
            el.style.opacity = i === nextIdx ? "1" : "0";
            el.style.pointerEvents = i === nextIdx ? "auto" : "none";
            el.style.visibility = i === nextIdx ? "visible" : "hidden";
          }
        });

        animateTextIn(nextIdx);
      });
    };

    return () => {
      delete (window as any)._projectInfoGoTo;
    };
  }, [slides]);

  if (!slides || slides.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-y-auto lg:overflow-hidden bg-[#131313] project-info-master z-[20]"
    >
      <div className="w-full min-h-full flex flex-col lg:grid lg:grid-cols-2">
        {/* Text Column */}
        <div className="relative w-full h-auto min-h-[50vh] lg:h-full order-1 lg:order-2 bg-[#EFECE6] !p-6 md:!p-16 lg:!p-20 flex flex-col justify-center z-[60] text-[#131313]">
          <div className="relative w-full h-full flex flex-col justify-center  md:pt-20 md:pb-8">
            {slides.map((slide, index) => (
              <div
                key={`info-text-${index}`}
                className={`info-text-block slide-text-${index} absolute inset-0 flex flex-col justify-center  !gap-4 md:!gap-8`}
                style={{
                  opacity: index === 0 ? 1 : 0,
                  pointerEvents: index === 0 ? "auto" : "none",
                  visibility: index === 0 ? "visible" : "hidden",
                  transition: "opacity 0.4s ease, visibility 0.4s",
                }}
              >
                <h2 className="text-[#242A27] font-display split-text-target text-2xl sm:text-3xl md:text-5xl font-light">
                  {slide.title}
                </h2>
                <div className="max-w-md pt-2 md:pt-0 pb-0 md:pb-12">
                  <p className="text-xs sm:text-sm md:text-base leading-relaxed text-[#242A27] font-normal split-text-target">
                    {slide.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Image Layer Column */}
        <div className="relative w-full h-[50vh] lg:h-full order-2 lg:order-1 overflow-hidden bg-[#1e1e1e]">
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