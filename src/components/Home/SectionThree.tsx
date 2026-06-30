"use client";

import { useRef, useState, useCallback, useLayoutEffect } from "react";
import gsap from "gsap";

const slides = [
  {
    id: "concrete",
    label: "Concrete Pool Renovation",
    desc: "Restore and modernise your pool with high-quality finishes and functional upgrades for a fresh, stylish, and long-lasting look.",
    tab: "Concrete",
    img: "/pool-renovation.webp",
  },
  {
    id: "equipment",
    label: "Pool Equipment & Installation",
    desc: "We provide and install premium pool pumps, filters, heating systems, and automation solutions.",
    tab: "Equipment",
    img: "/hero.webp",
  },
  {
    id: "new-pool",
    label: "New Pool Construction",
    desc: "From concept to completion, we build bespoke pools tailored to your space, lifestyle, and vision.",
    tab: "New Pool",
    img: "/pool-new.webp",
  },
];

const CLIP_DURATION = 1.0;

export default function SectionThree() {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef<number>(0);
  const [current, setCurrent] = useState(0);
  const animating = useRef<boolean>(false);
  const indicatorRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Offset layout components initially for timeline entrance
      gsap.set(".s3-services-nav", { x: 40, opacity: 0 });
      gsap.set(".s3-text-content-wrapper", { opacity: 0, y: 20 });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const goTo = useCallback((next: number, direction: "next" | "prev") => {
    const prev = currentRef.current;
    if (animating.current || next === prev || !containerRef.current) return;
    animating.current = true;

    const isMobile = window.innerWidth < 768;
    currentRef.current = next;
    setCurrent(next);

    if (indicatorRef.current) {
      const segmentWidthPercentage = 100 / slides.length;
      const targetLeftPosition = next * segmentWidthPercentage;
      
      gsap.to(indicatorRef.current, {
        left: `${targetLeftPosition}%`,
        duration: CLIP_DURATION,
        ease: "power2.inOut",
      });
    }

    const incomingClipStart = direction === "next" ? "inset(0 100% 0 0)" : "inset(0 0% 0 100%)";
    const incomingClipEnd = "inset(0 0% 0 0%)";
    const contextPrefix = isMobile ? ".s3-mobile-section" : ".s3-desktop-section";

    gsap.set(`${contextPrefix} .s3-bg-${next + 1}`, {
      clipPath: incomingClipStart,
      zIndex: 2,
    });
    gsap.set(`${contextPrefix} .s3-bg-${prev + 1}`, {
      clipPath: "inset(0 0% 0 0)",
      zIndex: 1,
    });

    gsap.to(`${contextPrefix} .s3-bg-${next + 1}`, {
      clipPath: incomingClipEnd,
      duration: CLIP_DURATION,
      ease: "power2.inOut",
      onComplete: () => {
        gsap.set(`${contextPrefix} .s3-bg-${next + 1}`, { zIndex: 1 });
        gsap.set(`${contextPrefix} .s3-bg-${prev + 1}`, {
          zIndex: 1,
          clipPath: "inset(0 100% 0 0)",
        });
      },
    });

    // ── STANDARD SLIDER CROSS-FADE SWITCH ──
    slides.forEach((_, i) => {
      const textBlocks = containerRef.current!.querySelectorAll(`.s3-text-${i + 1}`) as NodeListOf<HTMLElement>;
      textBlocks.forEach((textBlock) => {
        if (textBlock) {
          if (i === next) {
            gsap.fromTo(textBlock, 
              { opacity: 0, visibility: "visible" }, 
              { opacity: 1, duration: 0.4, ease: "power2.out", overwrite: "auto" }
            );
          } else {
            gsap.to(textBlock, {
              opacity: 0,
              visibility: "hidden",
              duration: 0.3,
              ease: "power2.in",
              overwrite: "auto"
            });
          }
        }
      });
    });

    gsap.delayedCall(CLIP_DURATION, () => {
      animating.current = false;
    });
  }, []);

  const handleTab = (idx: number) => {
    if (idx === currentRef.current) return;
    const direction = idx > currentRef.current ? "next" : "prev";
    goTo(idx, direction);
  };

  return (
    <div ref={containerRef} className="w-full h-full">
      {/* ── DESKTOP LAYOUT ── */}
      <section
        className="s3-desktop-section hidden md:block w-full min-h-screen relative overflow-hidden z-30"
        style={{ pointerEvents: "auto" }}
      >
        {slides.map((slide, i) => (
          <img
            key={slide.id}
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

        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0, 0, 0, 0.32)",
            zIndex: 2,
          }}
        />

        {/* Right Floating Nav Tab List */}
        <div
          className="s3-services-nav"
          style={{
            position: "absolute",
            right: "6%",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 20,
            display: "flex",
            flexDirection: "column",
            gap: "28px",
            minWidth: "300px",
          }}
        >
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => handleTab(i)}
              className="s3-card-btn font-display text-left transition-all duration-300 hover:!opacity-100"
              style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                fontSize: "18px",
                fontWeight: current === i ? "500" : "400",
                color: "#F4EEDF",
                transform: current === i ? "translateX(8px)" : "translateX(0)",
                opacity: current === i ? 1 : 0.5,
              }}
            >
              {slide.label}
            </button>
          ))}
        </div>

        {/* Main Content Layout Wrapper */}
        <div
          className="w-full"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            paddingBottom: "55px",
          }}
        >
          {/* Bottom Left Descriptive Blocks */}
          <div
            className="section-container w-full"
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              paddingLeft: "5%",
              paddingRight: "10%",
              paddingBottom: "35px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
              <div className="s3-text-content-wrapper" style={{ position: "relative", flex: 1, minHeight: "220px" }}>
                {slides.map((slide, i) => (
                  <div
                    key={slide.id}
                    className={`s3-text s3-text-${i + 1}`}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      display: "flex",
                      flexDirection: "column",
                      width: "100%",
                      visibility: i === 0 ? "visible" : "hidden",
                      opacity: i === 0 ? 1 : 0,
                    }}
                  >
                    <span className="font-body text-[14px] text-[#F4EEDF] block mb-2 tracking-widest">
                      (0{i + 1})
                    </span>
                    
                    <h2 className="font-display text-[#F4EEDF] text-[48px] leading-[1.1] max-w-[650px]">
                      {slide.label} 
                    </h2>

                    <p className="!mt-4 max-w-[440px] font-body text-[15px] leading-relaxed text-[#F4EEDF]">
                      {slide.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <a
              href="/contact"
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
                letterSpacing: "0.1em",
              }}
              className="group transition-opacity duration-200 hover:opacity-70 font-body"
            >
              CONTACT US
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
        </div>
      </section>

      {/* ── MOBILE LAYOUT ── */}
      <section
        className="s3-mobile-section flex md:hidden flex-col section-container w-full min-h-screen relative overflow-hidden z-30"
        style={{
          pointerEvents: "auto",
          background: "#19211C",
        }}
      >
        <div style={{ position: "relative", width: "100%", height: "45vh", overflow: "hidden", marginTop: 32 }}>
          {slides.map((slide, i) => (
            <img
              key={slide.id}
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
              background: "linear-gradient(2.13deg, #19211C 6.01%, rgba(21,40,31,0) 59.11%)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              position: "absolute",
              bottom: 20,
              left: 20,
              right: 0,
              zIndex: 3,
              display: "flex",
              overflowX: "auto",
              paddingRight: 20,
              gap: 24,
              scrollbarWidth: "none",
            }}
            className="no-scrollbar"
          >
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => handleTab(i)}
                className="font-body text-left"
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  paddingBottom: 6,
                  cursor: "pointer",
                  fontSize: 13,
                  flexShrink: 0,
                  color: current === i ? "#F4EEDF" : "rgba(244,238,223,0.4)",
                  borderBottom: current === i ? "1.5px solid #F4EEDF" : "1.5px solid transparent",
                  transition: "color 0.25s, border-color 0.25s",
                  whiteSpace: "nowrap",
                }}
              >
                {slide.tab}
              </button>
            ))}
          </div>
        </div>

        <div style={{ position: "relative", flexGrow: 1, minHeight: "220px" }}>
          {slides.map((slide, i) => (
            <div
              key={slide.id}
              className={`s3-text s3-text-${i + 1}`}
              style={{
                position: "absolute",
                top: "30px",
                left: "0",
                right: "20px",
                display: "flex",
                flexDirection: "column",
                visibility: i === 0 ? "visible" : "hidden",
                opacity: i === 0 ? 1 : 0,
              }}
            >
              <h2 className="font-display text-[#F4EEDF] text-[32px] leading-tight">
                {slide.label} 
              </h2>

              <p className="font-body text-[#F4EEDF]/90 mt-3 text-[14px] leading-relaxed">
                {slide.desc}
              </p>

              <div style={{ marginTop: 24 }}>
                <a
                  href="/services"
                  className="font-body"
                  style={{
                    position: "relative",
                    display: "inline-block",
                    paddingBottom: 6,
                    fontSize: 13,
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
          ))}
        </div>
      </section>
    </div>
  );
}