"use client";

import { useRef, useState, useCallback, useEffect, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Ensure ScrollTrigger is registered
gsap.registerPlugin(ScrollTrigger);

const slides = [
  {
    img: "/pool-renovation.webp",
    label: "Concrete Pool Renovation",
    desc: "Restore and modernise your pool with high-quality finishes and functional upgrades for a fresh, stylish, and long-lasting look.",
    tab: "Concrete",
  },
  {
    img: "/hero.webp",
    label: "Pool Equipment & Installation",
    desc: "We provide and install premium pool pumps, filters, heating systems, and automation solutions.",
    tab: "Equipment",
  },
  {
    img: "/pool-new.webp",
    label: "New Pool Construction",
    desc: "From concept to completion, we build bespoke pools tailored to your space, lifestyle, and vision.",
    tab: "New Pool",
  },
];

const CLIP_DURATION = 1.0;
const TEXT_DURATION = 0.7;

function animateTextIn(selector: string) {
  document.querySelectorAll(selector).forEach((el) => {
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
  });
}

function animateTextOut(selector: string) {
  document.querySelectorAll(selector).forEach((el) => {
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
  });
}

export default function SectionTwo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef<number>(0);
  const [current, setCurrent] = useState(0);
  const animating = useRef<boolean>(false);

  useEffect(() => {
    slides.forEach((_, i) => {
      document
        .querySelectorAll(`.s3-text-${i + 1} > .s3-line-wrap > .s3-line-inner`)
        .forEach((el) => {
          gsap.set(el, i === 0 ? { y: 0, opacity: 1 } : { y: 10, opacity: 0 });
        });
    });
  }, []);

  // ── INVIEW REVEAL ANIMATION FOR GLASS CARD & BUTTON TEXTS ──
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Baseline hidden state
      gsap.set(".s2-glass-card", { x: 120, opacity: 0 });
      gsap.set(".s2-card-btn", { y: 20, opacity: 0 });

      // Trigger animation on scroll entry
      gsap.to(".s2-glass-card", {
        x: 0,
        opacity: 1,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".s2-desktop-section",
          start: "top 75%",
          toggleActions: "play none none none",
        },
        onComplete: () => {
          // Staggered text reveal once card slides in
          gsap.to(".s2-card-btn", {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: "power2.out",
          });

          // 🌟 FIX: Trigger text animation for the first slide immediately on enter
          animateTextIn(".s3-text-1");
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

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

    document
      .querySelectorAll(`.s3-text-${prev + 1} > .s3-line-wrap > .s3-line-inner`)
      .forEach((el) => {
        gsap.killTweensOf(el);
        gsap.set(el, { y: 0, opacity: 1 });
      });
    animateTextOut(`.s3-text-${prev + 1}`);

    gsap.set(`.s3-text-${next + 1}`, { opacity: 1 });
    document
      .querySelectorAll(`.s3-text-${next + 1} > .s3-line-wrap > .s3-line-inner`)
      .forEach((el) => {
        gsap.killTweensOf(el);
        gsap.set(el, { y: 10, opacity: 0 });
      });

    gsap.delayedCall(0.32, () => animateTextIn(`.s3-text-${next + 1}`));

    gsap.delayedCall(CLIP_DURATION + 0.15, () => {
      animating.current = false;
    });
  }, []);

  const handleTab = (idx: number) => {
    if (idx === currentRef.current) return;
    const direction = idx > currentRef.current ? "next" : "prev";
    goTo(idx, direction);
  };

  return (
    <div ref={containerRef}>
      {/* ── DESKTOP LAYOUT ── */}
      <section
        className="s2-desktop-section hidden md:block w-full min-h-screen relative overflow-hidden z-30"
        style={{ pointerEvents: "auto" }}
      >
        {/* Background images */}
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

        {/* Gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(2.13deg, #19211C 3.01%, rgba(21, 40, 31, 0) 59.11%)",
            zIndex: 2,
          }}
        />

        {/* Floating Glass Card Container Layer (Right Side) */}
        <div
          className="s2-glass-card"
          style={{
            position: "absolute",
            right: "10%",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 20,
            background: "rgba(255, 255, 255, 0.06)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            padding: "40px 32px",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            minWidth: "280px",
          }}
        >
          {slides.map((slide, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleTab(i)}
              className="s2-card-btn font-display text-left transition-all duration-300"
              style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: current === i ? "500" : "100",
                color: current === i ? "#F4EEDF" : "rgba(244,238,223,0.45)",
                transform: current === i ? "translateX(4px)" : "translateX(0)",
              }}
            >
              {slide.label}
            </button>
          ))}
        </div>

        {/* Bottom Content */}
        <div
          className="section-continer w-full"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            paddingBottom: "60px",
            paddingLeft: "5%",
            paddingRight: "5%",
          }}
        >
          {/* Left Content */}
          <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
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
                  <div className="s3-line-wrap" style={{ overflow: "hidden" }}>
                    <div className="s3-line-inner">
                      <span className="font-body text-[14px] text-[#F4EEDF] block !mb-2">
                        ({i + 1})
                      </span>
                    </div>
                  </div>
                  <div className="s3-line-wrap" style={{ overflow: "hidden" }}>
                    <div className="s3-line-inner">
                      <h2 className="font-display text-[#F4EEDF] text-5xl max-w-[600px] leading-tight">
                        {slide.label}
                      </h2>
                    </div>
                  </div>
                  <div className="s3-line-wrap" style={{ overflow: "hidden" }}>
                    <div className="s3-line-inner">
                      <p className="!mt-6 max-w-[420px] text-[#F4EEDF] opacity-80 leading-relaxed">
                        {slide.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Learn More */}
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
            LEARNING MORE
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

      {/* ── MOBILE LAYOUT ── */}
      <section
        className="flex md:hidden flex-col section-continer w-full min-h-screen relative overflow-hidden z-30"
        style={{
          pointerEvents: "auto",
          backgroundImage: "url('/services.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "50vh",
            overflow: "hidden",
          }}
        >
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
                zIndex: 1,
                clipPath: i === 0 ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)",
              }}
            />
          ))}

          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 2,
              background:
                "linear-gradient(2.13deg, #19211C 6.01%, rgba(21,40,31,0) 59.11%)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              position: "absolute",
              bottom: 20,
              left: 20,
              right: 20,
              zIndex: 3,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: 44,
            }}
          >
            {slides.map((slide, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleTab(i)}
                className="font-body text-left"
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  paddingBottom: 6,
                  cursor: "pointer",
                  fontSize: 14,
                  flex: 1,
                  textAlign: "left",
                  color: current === i ? "#F4EEDF" : "rgba(244,238,223,0.45)",
                  borderBottom:
                    current === i
                      ? "1.5px solid #F4EEDF"
                      : "1.5px solid rgba(244,238,223,0.45)",
                  transition: "color 0.25s, border-color 0.25s",
                  whiteSpace: "nowrap",
                }}
              >
                {slide.tab}
              </button>
            ))}
          </div>
        </div>

        <div style={{ position: "relative", flexGrow: 1, padding: "20px" }}>
          {slides.map((slide, i) => (
            <div
              key={i}
              className={`s3-text s3-text-${i + 1}`}
              style={{
                position: i === 0 ? "relative" : "absolute",
                top: "20px",
                left: "20px",
                right: "20px",
                opacity: i === 0 ? 1 : 0,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div className="s3-line-wrap" style={{ overflow: "hidden" }}>
                <div className="s3-line-inner">
                  <h2 className="font-display text-[#F4EEDF] text-2xl">
                    {slide.label}
                  </h2>
                </div>
              </div>

              <div className="s3-line-wrap" style={{ overflow: "hidden", marginTop: 16 }}>
                <div className="s3-line-inner">
                  <p
                    className="font-body text-[#F4EEDF]"
                    style={{ fontSize: 14, lineHeight: 1.6, margin: 0 }}
                  >
                    {slide.desc}
                  </p>
                </div>
              </div>

              <div className="s3-line-wrap" style={{ overflow: "hidden", marginTop: 24 }}>
                <div className="s3-line-inner">
                  <a
                    href="/services"
                    className="font-body"
                    style={{
                      position: "relative",
                      display: "inline-block",
                      paddingBottom: 10,
                      fontSize: 14,
                      fontWeight: 500,
                      textTransform: "uppercase",
                      color: "#F4EEDF",
                      textDecoration: "none",
                    }}
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
                      }}
                    />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}