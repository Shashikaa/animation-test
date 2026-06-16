"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import gsap from "gsap";

const slides = [
  {
    stat: "25+ years",
    label: "Industry Experience",
    desc: "Decades of knowledge in pool design and construction.",
    glassColor: "rgba(25, 33, 28, 0.4)",       // dark green tint (slides 1&2 in Figma)
    overlayColor: "rgba(25, 33, 28, 0.45)",
  },
  {
    stat: "500+",
    label: "Pools Built",
    desc: "Delivering exceptional results across Melbourne.",
    glassColor: "rgba(25, 33, 28, 0.4)",
    overlayColor: "rgba(25, 33, 28, 0.45)",
  },
  {
    stat: "100%",
    label: "Client Satisfaction",
    desc: "Every project completed to the highest standard.",
    glassColor: "rgba(45, 50, 48, 0.45)",       // lighter grey tint (slide 3 in Figma)
    overlayColor: "rgba(40, 45, 42, 0.5)",
  },
];

const CLIP_DURATION = 1.0;
const TEXT_DURATION = 0.7;

function animateTextIn(selector: string) {
  document.querySelectorAll(selector).forEach((el) => {
    (Array.from(el.querySelectorAll(":scope > .s5-line-wrap > .s5-line-inner")) as HTMLElement[])
      .forEach((inner, idx) => {
        gsap.killTweensOf(inner);
        gsap.fromTo(inner, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: TEXT_DURATION, ease: "elastic.out(1, 0.5)", delay: idx * 0.08 });
      });
  });
}

function animateTextOut(selector: string) {
  document.querySelectorAll(selector).forEach((el) => {
    (Array.from(el.querySelectorAll(":scope > .s5-line-wrap > .s5-line-inner")) as HTMLElement[])
      .forEach((inner, idx) => {
        gsap.killTweensOf(inner);
        gsap.to(inner, { y: -10, opacity: 0, duration: 0.2, ease: "power2.in", delay: idx * 0.03 });
      });
  });
}

export default function SectionFive() {
  const currentRef = useRef<number>(0);
  const [current, setCurrent] = useState(0);
  const animating = useRef<boolean>(false);
  const glassRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    slides.forEach((_, i) => {
      document.querySelectorAll(`.s5-text-${i + 1} > .s5-line-wrap > .s5-line-inner`)
        .forEach((el) => gsap.set(el, i === 0 ? { y: 0, opacity: 1 } : { y: 10, opacity: 0 }));
    });
  }, []);

  const goTo = useCallback((next: number, direction: "next" | "prev") => {
    const prev = currentRef.current;
    if (animating.current || next === prev) return;
    animating.current = true;
    currentRef.current = next;
    setCurrent(next);

    // ── Background clip animation ──
    const incomingClipStart = direction === "next" ? "inset(0 100% 0 0)" : "inset(0 0% 0 100%)";
    gsap.set(`.s5-bg-${next + 1}`, { clipPath: incomingClipStart, zIndex: 2 });
    gsap.set(`.s5-bg-${prev + 1}`, { clipPath: "inset(0 0% 0 0)", zIndex: 1 });
    gsap.to(`.s5-bg-${next + 1}`, {
      clipPath: "inset(0 0% 0 0%)",
      duration: CLIP_DURATION,
      ease: "power2.inOut",
      onComplete: () => {
        gsap.set(`.s5-bg-${next + 1}`, { zIndex: 1 });
        gsap.set(`.s5-bg-${prev + 1}`, { zIndex: 1, clipPath: "inset(0 100% 0 0)" });
      },
    });

    // ── Glass card background color transition ──
    if (glassRef.current) {
      gsap.to(glassRef.current, {
        backgroundColor: slides[next].glassColor,
        duration: CLIP_DURATION,
        ease: "power2.inOut",
      });
    }

    // ── Overlay color transition ──
    if (overlayRef.current) {
      gsap.to(overlayRef.current, {
        backgroundColor: slides[next].overlayColor,
        duration: CLIP_DURATION,
        ease: "power2.inOut",
      });
    }

    // ── Text animations ──
    document.querySelectorAll(`.s5-text-${prev + 1} > .s5-line-wrap > .s5-line-inner`)
      .forEach((el) => { gsap.killTweensOf(el); gsap.set(el, { y: 0, opacity: 1 }); });
    animateTextOut(`.s5-text-${prev + 1}`);

    gsap.set(`.s5-text-${next + 1}`, { opacity: 1 });
    document.querySelectorAll(`.s5-text-${next + 1} > .s5-line-wrap > .s5-line-inner`)
      .forEach((el) => { gsap.killTweensOf(el); gsap.set(el, { y: 10, opacity: 0 }); });
    gsap.delayedCall(0.32, () => animateTextIn(`.s5-text-${next + 1}`));

    // ── Progress bars ──
    gsap.to(`.s5-bar-${prev + 1}`, { background: "rgba(244,238,223,0.3)", duration: 0.3 });
    gsap.to(`.s5-bar-${next + 1}`, { background: "#F4EEDF", duration: 0.3 });

    gsap.delayedCall(CLIP_DURATION + 0.15, () => { animating.current = false; });
  }, []);

  const handlePrev = () => goTo((currentRef.current - 1 + slides.length) % slides.length, "prev");
  const handleNext = () => goTo((currentRef.current + 1) % slides.length, "next");

  return (
    <section className="!relative !w-full !h-[100lvh] !overflow-hidden">

      {/* ── Background images ── */}
      {slides.map((_, i) => (
        <div
          key={i}
          className={`s5-bg s5-bg-${i + 1} !absolute !inset-0 !bg-cover !bg-center !will-change-transform`}
          style={{
            backgroundImage: "url('/parallax-image.webp')",
            zIndex: 1,
            clipPath: i === 0 ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)",
          }}
        />
      ))}

      {/* ── Gradient overlay (animates color per slide) ── */}
<div
        ref={overlayRef}
        className="!absolute !inset-0 !pointer-events-none !z-[2]"
        style={{
          backgroundColor: "#00000096",
        }}
      />
      {/* ── Bottom-left title ── */}
      <div className="!absolute !z-10 !bottom-[85px] !left-[65px] !flex !flex-col !gap-2">
        <h2
          className="!font-[100] !text-[#F4EEDF]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Decades of Expertise
        </h2>
        <p
          className="!text-[#F4EEDF]"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Unmatched Craftsmanship
        </p>
      </div>

      {/* ── Right glass card ── */}
      <div
        ref={glassRef}
        className="!absolute !z-10 !right-[65px] !top-1/2 !-translate-y-1/2 !w-full !max-w-[280px] md:!max-w-[300px] !flex !flex-col !gap-6 !px-5 !py-8 md:!px-6"
        style={{
          backgroundColor: slides[0].glassColor,
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          boxShadow: "-5px -5px 25px rgba(255,255,255,0.02) inset",
        }}
      >
        {/* ── Sliding stat text ── */}
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
                  <p
                    className="!text-white"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {slide.label}
                    <br />
                    {slide.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Prev / Next ── */}
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

    </section>
  );
}