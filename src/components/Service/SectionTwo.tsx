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
    desc: "Upgrade and protect your pool with high-performance equipment and professional installation. From energy-efficient pumps and advanced filtration systems to smart automation, we ensure seamless setup and reliable performance for crystal-clear water.",
  },
  {
    img: "/pool.webp",
    label: "Commercial Pool Construction",
    desc: "We design and build large-scale pools for hotels, resorts, apartment complexes, and public facilities, delivering premium quality and durability.",
  },
];

// Reduced duration slightly for responsive transitions
const TRANSITION_DURATION = 0.6; 

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
  const isAnimatingRef = useRef<boolean>(false);
  const [current, setCurrent] = useState(0);

  const goTo = useCallback((next: number) => {
    const prev = currentRef.current;
    if (next === prev || !containerRef.current) return;

    currentRef.current = next;
    setCurrent(next);
    isAnimatingRef.current = true;

    const targetPanels = [".s2-desktop-section", ".s3-mobile-section"];

    // ── 1. SMOOTH SLIDE TRANSITION ──
    targetPanels.forEach((panel) => {
      slides.forEach((_, i) => {
        const bgEl = containerRef.current!.querySelector(
          `${panel} .s3-bg-${i + 1}`
        ) as HTMLElement;
        const imgEl = bgEl?.querySelector(".s3-img-inner") as HTMLElement;
        if (!bgEl || !imgEl) return;

        gsap.killTweensOf([bgEl, imgEl]);

        if (i === next) {
          gsap.set(bgEl, { zIndex: 2, visibility: "visible", opacity: 1 });

          gsap.fromTo(
            bgEl,
            { yPercent: next > prev ? 100 : -100 },
            {
              yPercent: 0,
              duration: TRANSITION_DURATION,
              ease: "power3.inOut",
              onComplete: () => {
                isAnimatingRef.current = false;
              },
            }
          );

          gsap.fromTo(
            imgEl,
            { yPercent: next > prev ? -100 : 100, scale: 1.05 },
            {
              yPercent: 0,
              scale: 1,
              duration: TRANSITION_DURATION,
              ease: "power3.inOut",
            }
          );
        } else if (i === prev) {
          gsap.set(bgEl, {
            zIndex: 1,
            visibility: "visible",
            opacity: 1,
            yPercent: 0,
          });
          gsap.set(imgEl, { yPercent: 0, scale: 1 });
        } else {
          gsap.set(bgEl, {
            zIndex: 0,
            visibility: "hidden",
            opacity: 1,
            yPercent: -100,
          });
          gsap.set(imgEl, { yPercent: 100 });
        }
      });
    });

    // ── 2. TEXT OUT TRANSITION ──
    const prevGroup = containerRef.current.querySelector(`.s3-text-group-${prev + 1}`);
    const prevLines = containerRef.current.querySelectorAll(
      `.s3-text-group-${prev + 1} .gs-line-inner`
    );

    if (prevGroup && prevLines.length > 0) {
      gsap.killTweensOf([prevGroup, prevLines]);
      gsap.to(prevLines, {
        y: -15,
        opacity: 0,
        duration: 0.2,
        ease: "power2.in",
        stagger: 0.015,
      });

      gsap.to(prevGroup, {
        opacity: 0,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => {
          gsap.set(prevGroup, { visibility: "hidden", pointerEvents: "none" });
        },
      });
    }

    // ── 3. TEXT IN TRANSITION ──
    const nextGroup = containerRef.current.querySelector(
      `.s3-text-group-${next + 1}`
    ) as HTMLElement;
    const nextLines = containerRef.current.querySelectorAll(
      `.s3-text-group-${next + 1} .gs-line-inner`
    );

    if (nextGroup) {
      gsap.killTweensOf([nextGroup, nextLines]);
      gsap.set(nextGroup, { visibility: "visible", pointerEvents: "auto" });

      gsap.to(nextGroup, {
        opacity: 1,
        duration: 0.3,
        delay: 0.1,
        ease: "power2.out",
      });

      if (nextLines.length > 0) {
        gsap.fromTo(
          nextLines,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.35,
            delay: 0.15,
            ease: "power2.out",
            stagger: 0.02,
          }
        );
      }
    }
  }, []);

  // Split-text DOM setup & initial slide state
  useEffect(() => {
    if (!containerRef.current) return;

    const timeout = setTimeout(() => {
      if (!containerRef.current) return;

      const splitTargets =
        containerRef.current.querySelectorAll<HTMLElement>(".split-text-target");
      splitTargets.forEach((el) => splitElementIntoLines(el));

      const targetPanels = [".s2-desktop-section", ".s3-mobile-section"];
      targetPanels.forEach((panel) => {
        slides.forEach((_, i) => {
          const bgEl = containerRef.current!.querySelector(
            `${panel} .s3-bg-${i + 1}`
          ) as HTMLElement;
          const imgEl = bgEl?.querySelector(".s3-img-inner") as HTMLElement;
          if (!bgEl || !imgEl) return;

          if (i === 0) {
            gsap.set(bgEl, { zIndex: 1, visibility: "visible", yPercent: 0 });
            gsap.set(imgEl, { yPercent: 0 });
          } else {
            gsap.set(bgEl, { zIndex: 0, visibility: "hidden", yPercent: -100 });
            gsap.set(imgEl, { yPercent: 100 });
          }
        });
      });

      slides.forEach((_, i) => {
        const targets = containerRef.current!.querySelectorAll(
          `.s3-text-group-${i + 1} .gs-line-inner`
        );
        if (i === 0) {
          gsap.set(targets, { y: 0, opacity: 1 });
        } else {
          gsap.set(targets, { y: 20, opacity: 0 });
        }
      });
    }, 50);

    return () => clearTimeout(timeout);
  }, []);

  // Global trigger hook for parent scroll listener
  useEffect(() => {
    (window as any)._sec2GoTo = (targetIdx: number) => {
      if (targetIdx === currentRef.current) return;
      goTo(targetIdx);
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
          className={`s3-text-group s3-text-group-${
            i + 1
          } flex flex-col items-start gap-4 md:gap-8 lg:gap-12`}
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
          <h2 className="split-text-target font-display text-[#F4EEDF] text-3xl md:text-5xl lg:text-[70px] !leading-[1] font-light">
            {slide.label}
          </h2>

          <div className="flex flex-row items-stretch gap-4 md:gap-6">
            <div className="flex flex-col gap-[4px] py-1 justify-center">
              {slides.map((_, barIdx) => (
                <div
                  key={barIdx}
                  className={`w-[2px] transition-all duration-500 ease-out ${
                    current === barIdx
                      ? "bg-white h-5 opacity-100"
                      : "bg-white/30 h-3 opacity-40"
                  }`}
                />
              ))}
            </div>

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
        <div className="absolute inset-0 z-20 w-full h-full pointer-events-none overflow-hidden">
          {slides.map((slide, i) => (
            <div
              key={i}
              className={`s3-bg s3-bg-${
                i + 1
              } absolute inset-0 w-full h-full overflow-hidden will-change-transform transform-gpu`}
            >
              <div className="s3-img-inner absolute inset-0 w-full h-full overflow-hidden will-change-transform transform-gpu">
                <img
                  src={slide.img}
                  alt=""
                  aria-hidden
                  className="absolute inset-0 w-full h-full object-cover transform-gpu backface-hidden"
                />
                <div
                  className="absolute inset-0 z-[2]"
                  style={{
                    background:
                      "linear-gradient(2.13deg, #19211C 3.01%, rgba(21, 40, 31, 0) 59.11%)",
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="s2-inner-fade-target absolute inset-0 z-30 w-full h-full pointer-events-none">
          {renderTextContent()}
        </div>
      </section>

      {/* MOBILE LAYOUT */}
      <section className="s3-mobile-section flex md:hidden flex-col w-full h-full relative overflow-hidden bg-black">
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
          {slides.map((slide, i) => (
            <div
              key={i}
              className={`s3-bg s3-bg-${
                i + 1
              } absolute inset-0 w-full h-full overflow-hidden will-change-transform transform-gpu`}
            >
              <div className="s3-img-inner absolute inset-0 w-full h-full overflow-hidden will-change-transform transform-gpu">
                <img
                  src={slide.img}
                  alt=""
                  className="w-full h-full object-cover transform-gpu backface-hidden"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#19211C]/95 via-[#19211C]/40 to-transparent z-[2]" />
              </div>
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