"use client";

import { useRef, useState, useCallback } from "react";
import gsap from "gsap";

const slides = [
  {
    img: "/pool-renovation.webp",
    label: "Concrete Pool Renovation",
    desc: "Restore and modernise your pool with high-quality finishes and functional upgrades for a fresh, stylish, and long-lasting look.",
  },
  {
    img: "/hero.webp",
    label: "Pool Equipment & Installation",
    desc: "We provide and install premium pool pumps, filters, heating systems, and automation solutions.",
  },
  {
    img: "/pool-new.webp",
    label: "New Pool Construction",
    desc: "From concept to completion, we build bespoke pools tailored to your space, lifestyle, and vision.",
  },
];

const CLIP_DURATION = 1.0;
const TEXT_DURATION = 0.7;

function animateTextIn(selector: string) {
  const el = document.querySelector(selector);
  if (!el) return;
  const inners = Array.from(
    el.querySelectorAll(":scope > .s3-line-wrap > .s3-line-inner")
  ) as HTMLElement[];
  inners.forEach((inner, idx) => {
    gsap.killTweensOf(inner);
    gsap.fromTo(
      inner,
      { y: 10, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: TEXT_DURATION,
        ease: "elastic.out(1, 0.5)",
        delay: idx * 0.08,
      }
    );
  });
}

function animateTextOut(selector: string) {
  const el = document.querySelector(selector);
  if (!el) return;
  const inners = Array.from(
    el.querySelectorAll(":scope > .s3-line-wrap > .s3-line-inner")
  ) as HTMLElement[];
  inners.forEach((inner, idx) => {
    gsap.killTweensOf(inner);
    gsap.to(inner, {
      y: -10,
      opacity: 0,
      duration: 0.2,
      ease: "power2.in",
      delay: idx * 0.03,
    });
  });
}

export default function SectionThree() {
  const currentRef = useRef<number>(0);
  const [current, setCurrent] = useState(0);
  const animating = useRef<boolean>(false);

  const goTo = useCallback((next: number, direction: "next" | "prev") => {
    const prev = currentRef.current;
    if (animating.current || next === prev) return;
    animating.current = true;

    currentRef.current = next;
    setCurrent(next);

    const incomingClipStart =
      direction === "next" ? "inset(0 100% 0 0)" : "inset(0 0% 0 100%)";
    const incomingClipEnd = "inset(0 0% 0 0%)";

    gsap.set(`.s3-bg-${next + 1}`, {
      clipPath: incomingClipStart,
      zIndex: 2,
    });
    gsap.set(`.s3-bg-${prev + 1}`, {
      clipPath: "inset(0 0% 0 0)",
      zIndex: 1,
    });

    gsap.to(`.s3-bg-${next + 1}`, {
      clipPath: incomingClipEnd,
      duration: CLIP_DURATION,
      ease: "power2.inOut",
      onComplete: () => {
        gsap.set(`.s3-bg-${next + 1}`, { zIndex: 1 });
        gsap.set(`.s3-bg-${prev + 1}`, {
          zIndex: 1,
          clipPath: "inset(0 100% 0 0)",
        });
      },
    });

    animateTextOut(`.s3-text-${prev + 1}`);
    gsap.set(`.s3-text-${next + 1}`, { opacity: 1 });
    gsap.delayedCall(0.18, () => animateTextIn(`.s3-text-${next + 1}`));

    gsap.to(`.s3-bar-${prev + 1}`, { background: "rgba(244,238,223,0.3)", duration: 0.3 });
    gsap.to(`.s3-bar-${next + 1}`, { background: "#F4EEDF", duration: 0.3 });

    gsap.delayedCall(CLIP_DURATION + 0.15, () => {
      animating.current = false;
    });
  }, []);

  const handlePrev = () => {
    goTo((currentRef.current - 1 + slides.length) % slides.length, "prev");
  };

  const handleNext = () => {
    goTo((currentRef.current + 1) % slides.length, "next");
  };

  return (
    <section
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        zIndex: 30,
        pointerEvents: "auto", // ← ensures clicks reach buttons
      }}
    >
      {/* ── Background images ── */}
      {slides.map((slide, i) => (
        <img
          key={i}
          className={`s3-bg s3-bg-${i + 1}`}
          src={slide.img}
          alt=""
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 1,
            zIndex: 1,
            clipPath: i === 0 ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)",
          }}
        />
      ))}

      {/* ── Gradient overlay ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(2.13deg, #19211C 3.01%, rgba(21, 40, 31, 0) 59.11%)",
          zIndex: 2,
        }}
      />

      {/* ── Bottom Content ── */}
      <div
        className="section-continer"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
        }}
      >
        {/* ── Left Content ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 44, flex: 1 }}>

          {/* Indicator Bars */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              alignSelf: "stretch",
              justifyContent: "center",
              marginTop: "62px",
            }}
          >
            {slides.map((_, i) => (
              <div
                key={i}
                className={`s3-bar s3-bar-${i + 1}`}
                style={{
                  width: 2,
                  height: 24,
                  background: i === 0 ? "#F4EEDF" : "rgba(244,238,223,0.3)",
                }}
              />
            ))}
          </div>

          {/* Text Block */}
          <div style={{ position: "relative", flex: 1 }}>
            {slides.map((slide, i) => (
              <div
                key={i}
                className={`s3-text s3-text-${i + 1}`}
                style={{
                  position: i === 0 ? "relative" : "absolute",
                  top: 0,
                  left: 0,
                  opacity: i === 0 ? 1 : 0,
                  display: "flex",
                  flexDirection: "column",
                  width: "100%",
                }}
              >
                {/* Number */}
                <div className="s3-line-wrap" style={{ overflow: "hidden" }}>
                  <div className="s3-line-inner">
                    <span className="font-body text-[14px] text-[#F4EEDF] block !mb-2">
                      ({i + 1})
                    </span>
                  </div>
                </div>

                {/* Title */}
                <div className="s3-line-wrap" style={{ overflow: "hidden" }}>
                  <div className="s3-line-inner">
                    <h2 className="font-display text-[#F4EEDF]">{slide.label}</h2>
                  </div>
                </div>

                {/* Description */}
                <div className="s3-line-wrap" style={{ overflow: "hidden" }}>
                  <div className="s3-line-inner">
                    <p className="!mt-6 max-w-[340px] text-[#F4EEDF]">{slide.desc}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Prev / Next */}
            <div className="!mt-10 flex items-center gap-20">
              <button
                type="button"
                onClick={handlePrev}
                className="group font-body cursor-pointer text-[14px] text-[#F4EEDF] flex items-center gap-2 transition-opacity duration-200 hover:opacity-70"
              >
                <img
                  src="/arrow-right.svg"
                  alt="Previous"
                  style={{ width: 16, height: 16, transform: "rotate(180deg)" }}
                />
                <span>Previous</span>
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="group font-body cursor-pointer text-[14px] text-[#F4EEDF] flex items-center gap-2 transition-opacity duration-200 hover:opacity-70"
              >
                <span>Next</span>
                <img
                  src="/arrow-right.svg"
                  alt="Next"
                  style={{ width: 16, height: 16 }}
                />
              </button>
            </div>
          </div>
        </div>

        {/* ── Learn More ── */}
        <a
          href="/services"
          style={{
            position: "relative",
            display: "inline-block",
            width: "fit-content",
            paddingBottom: 8,
            fontSize: 14,
            fontWeight: 500,
            textTransform: "uppercase",
            color: "#F4EEDF",
            textDecoration: "none",
            flexShrink: 0,
            marginLeft: 40,
          }}
          className="group transition-opacity duration-200 hover:opacity-70 font-body"
        >
          LEARN MORE
          <span
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: 1,
              background: "#F4EEDF",
              transition: "transform 0.2s ease",
            }}
            className="group-hover:-translate-y-[2px]"
          />
        </a>
      </div>
    </section>
  );
}