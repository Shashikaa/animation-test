"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { InfoSlide } from "../../app/projects/[slug]/data";

interface ProjectInfoSlideProps {
  slides: InfoSlide[];
  isActive?: boolean;
}

const TEXT_DURATION = 0.4;

export default function ProjectInfoSlide({ slides }: ProjectInfoSlideProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef<number>(0);

  function animateTextIn(index: number) {
    if (!containerRef.current) return;
    const targets = containerRef.current.querySelectorAll(
      `.slide-text-${index} .info-anim-item`
    );

    gsap.killTweensOf(targets);
    gsap.fromTo(
      targets,
      { y: 20, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: TEXT_DURATION,
        ease: "power2.out",
        stagger: 0.04,
        overwrite: "auto",
      }
    );
  }

  function animateTextOut(index: number, callback?: () => void) {
    if (!containerRef.current) return;
    const targets = containerRef.current.querySelectorAll(
      `.slide-text-${index} .info-anim-item`
    );

    if (targets.length === 0) {
      if (callback) callback();
      return;
    }

    gsap.killTweensOf(targets);
    gsap.to(targets, {
      y: -15,
      opacity: 0,
      duration: 0.25,
      ease: "power2.in",
      stagger: 0.02,
      onComplete: callback,
      overwrite: "auto",
    });
  }

  useEffect(() => {
    (window as any)._projectInfoGoTo = (nextIdx: number) => {
      const prevIdx = currentRef.current;
      if (nextIdx === prevIdx) return;

      currentRef.current = nextIdx;

      animateTextOut(prevIdx, () => {
        if (!containerRef.current) return;

        slides.forEach((_, i) => {
          const el = containerRef.current?.querySelector(
            `.slide-text-${i}`
          ) as HTMLElement;
          if (el) {
            const isTarget = i === nextIdx;
            el.style.opacity = isTarget ? "1" : "0";
            el.style.pointerEvents = isTarget ? "auto" : "none";
            el.style.visibility = isTarget ? "visible" : "hidden";
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
      className="absolute inset-0 w-full h-full overflow-hidden bg-[#131313] project-info-master z-[20] gpu-accelerated"
      style={{ contain: "paint" }}
    >
      <div className="w-full h-full flex flex-col lg:grid lg:grid-cols-2">
        {/* Text Column */}
        <div className="relative w-full h-[50vh] lg:h-full order-1 lg:order-2 bg-[#EFECE6] !p-6 md:!p-16 lg:!p-20 flex flex-col justify-center z-[60] text-[#131313]">
          <div className="relative w-full h-full flex flex-col justify-center">
            {slides.map((slide, index) => (
              <div
                key={`info-text-${index}`}
                className={`info-text-block slide-text-${index} absolute inset-0 flex flex-col justify-center gap-3 md:gap-8`}
                style={{
                  opacity: index === 0 ? 1 : 0,
                  pointerEvents: index === 0 ? "auto" : "none",
                  visibility: index === 0 ? "visible" : "hidden",
                  willChange: "opacity, transform",
                }}
              >
                <h2 className="info-anim-item text-[#242A27] font-display text-2xl sm:text-3xl md:text-5xl font-light leading-tight">
                  {slide.title}
                </h2>
                <div className="info-anim-item max-w-md pt-1 md:pt-0 pb-0 md:pb-12">
                  <p className="text-xs sm:text-sm md:text-base leading-relaxed text-[#242A27] font-normal">
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
              className={`info-img-layer info-img-layer-${index} absolute inset-0 w-full h-full overflow-hidden gpu-accelerated`}
              style={{
                zIndex: index + 10,
                willChange: "clip-path",
                clipPath:
                  index === 0
                    ? "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)"
                    : "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
              }}
            >
              <div
                className="info-image-inner w-full h-full bg-cover bg-center gpu-accelerated"
                style={{
                  backgroundImage: `url(${slide.image})`,
                  transform: "scale(1.2)",
                  transformOrigin: "center center",
                  willChange: "transform",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}