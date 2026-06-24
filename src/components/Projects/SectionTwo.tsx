"use client";

import { useRef, useState, useCallback, useEffect, useLayoutEffect } from "react";
import gsap from "gsap";

const PROJECTS = [
  {
    id: "mernda",
    label: "Mernda Ave Bonbeach",
    tag: "Exceptional Pools,",
    tagline: "Built to Impress",
    description:
      "This custom residential oasis seamlessly blends sun-drenched outdoor living with sleek, modern concrete pool design.",
    image: "/mernda-ave-bonbeach.webp",
  },
  {
    id: "dennett",
    label: "Dennett st Carrum",
    tag: "A flawless blend",
    tagline: "of luxury",
    description:
      "This custom concrete pool transforms a classic Carrum backyard into a private, light-filled family sanctuary.",
    image: "/pool-renovation.webp",
  },
  {
    id: "kooyong",
    label: "Kooyong Rd Toorak",
    tag: "High-End",
    tagline: "Architectural Vibe",
    description:
      "This stunning Toorak build creates a sophisticated, resort-style escape tailored for elite inner-city living.",
    image: "/kooyong-rd-toorak.webp",
  },
  {
    id: "corner",
    label: "'The Como' Toorak",
    tag: "Showcase luxury",
    tagline: "at its finest",
    description:
      "'The Como' project in Toorak showcases our commitment to custom engineering, sophisticated integration, and master craftsmanship.",
    image: "/the-corner-toorak.webp",
  },
  {
    id: "murray",
    label: "Murray st Prahran",
    tag: "When master",
    tagline: "craftsmanship meets smart",
    description:
      "Our Murray St, Prahran project masterfully conquers a compact, inner-city space with a striking, custom-engineered concrete pool.",
    image: "/murray-st-prahran.webp",
  },
  {
    id: "rosy",
    label: "Rosy Rd Mooroolbark",
    tag: "Masterfully blends premium",
    tagline: "concrete craftsmanship",
    description:
      "Blending rugged outer-suburban terrain with premium concrete craftsmanship, it creates the ultimate resort-style backyard retreat.",
    image: "/rosy-rd-mooroolbark.webp",
  },
];

const CLIP_DURATION = 1.0;

type SectionTwoProps = {
  isActive: boolean;
};

export default function SectionTwo({ isActive }: SectionTwoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef<number>(0);
  const [current, setCurrent] = useState(0);
  const animating = useRef<boolean>(false);
  const entranceTimeline = useRef<gsap.core.Timeline | null>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);

  // Set up baseline structural states and clean, non-text layout entries
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Setup structural nav layout animations without tampering with text or individual button opacities
      gsap.set(".s2-projects-nav", { x: 80, opacity: 0 });
      gsap.set(".s2-indicator-container", { scaleX: 0, opacity: 0 });

      entranceTimeline.current = gsap.timeline({ paused: true })
        .to(".s2-projects-nav", {
          x: 0,
          opacity: 1,
          duration: 1.2,
          ease: "power3.out",
        })
        .to(".s2-indicator-container", {
          scaleX: 1,
          opacity: 1,
          duration: 1.0,
          ease: "power3.out",
        }, "-=1.0");
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Listen to the active status to bring navigation container in or out
  useEffect(() => {
    if (isActive) {
      entranceTimeline.current?.play();
    } else {
      entranceTimeline.current?.reverse();
    }
  }, [isActive]);

  const goTo = useCallback((next: number, direction: "next" | "prev") => {
    const prev = currentRef.current;
    if (animating.current || next === prev || !containerRef.current) return;
    animating.current = true;

    const isMobile = window.innerWidth < 768;

    currentRef.current = next;
    setCurrent(next);

    // Dynamic Slider Progress Indicator Bar Shift
    if (indicatorRef.current) {
      const segmentWidthPercentage = 100 / PROJECTS.length;
      const targetLeftPosition = next * segmentWidthPercentage;
      
      gsap.to(indicatorRef.current, {
        left: `${targetLeftPosition}%`,
        duration: CLIP_DURATION,
        ease: "power2.inOut",
      });
    }

    const incomingClipStart = direction === "next" ? "inset(0 100% 0 0)" : "inset(0 0% 0 100%)";
    const incomingClipEnd = "inset(0 0% 0 0%)";
    const contextPrefix = isMobile ? ".s3-mobile-section" : ".s2-desktop-section";

    // Image transitioning
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

    // Handle instant text adjustments globally for mobile/desktop without animations
    PROJECTS.forEach((_, i) => {
      const textBlocks = containerRef.current!.querySelectorAll(`.s3-text-${i + 1}`) as NodeListOf<HTMLElement>;
      textBlocks.forEach((textBlock) => {
        if (textBlock) {
          textBlock.style.opacity = i === next ? "1" : "0";
          // If inside mobile context, toggle position rules to prevent stack spacing layout collision
          if (textBlock.closest(".s3-mobile-section")) {
            textBlock.style.position = i === next ? "relative" : "absolute";
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
    <div ref={containerRef}>
      {/* ── DESKTOP LAYOUT ── */}
      <section
        className="s2-desktop-section hidden md:block w-full min-h-screen relative overflow-hidden z-30"
        style={{ pointerEvents: "auto" }}
      >
        {PROJECTS.map((project, i) => (
          <img
            key={project.id}
            className={`s3-bg s3-bg-${i + 1}`}
            src={project.image}
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
            background: "linear-gradient(182deg, rgba(21, 40, 31, 0) 40%, #19211C 97%)",
            zIndex: 2,
          }}
        />

        {/* Floating Nav List */}
        <div
          className="s2-projects-nav"
          style={{
            position: "absolute",
            right: "10%",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 20,
            display: "flex",
            flexDirection: "column",
            gap: "28px",
            minWidth: "300px",
          }}
        >
          {PROJECTS.map((project, i) => (
            <button
              key={project.id}
              type="button"
              onClick={() => handleTab(i)}
              className="s2-card-btn font-display text-left transition-all duration-300 hover:!opacity-100"
              style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                fontSize: "18px",
                fontWeight: current === i ? "500" : "400",
                color: "#F4EEDF",
                transform: current === i ? "translateX(8px)" : "translateX(0)",
                opacity: current === i ? 1 : 0.5, // Native inline rendering handles explicit initial opacities accurately now
              }}
            >
              {project.label}
            </button>
          ))}
        </div>

        {/* Main Content & Indicator Layout Wrapper */}
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
          {/* Bottom Content Row */}
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
              <div style={{ position: "relative", flex: 1 }}>
                {PROJECTS.map((project, i) => (
                  <div
                    key={project.id}
                    className={`s3-text s3-text-${i + 1}`}
                    style={{
                      position: i === 0 ? "relative" : "absolute",
                      top: 0,
                      left: 0,
                      opacity: i === current ? 1 : 0,
                      display: "flex",
                      flexDirection: "column",
                      width: "100%",
                      transition: "opacity 0.4s ease",
                    }}
                  >
                    <div className="s3-line-wrap">
                      <span className="font-body text-[14px] text-[#F4EEDF] block !mb-2 tracking-widest">
                        (0{i + 1})
                      </span>
                    </div>
                    
                    <div className="s3-line-wrap">
                      <h2 className="font-display text-[#F4EEDF] max-w-[650px] font-light text-4xl">
                        {project.label} 
                      </h2>
                    </div>

                    <div className="s3-line-wrap">
                      <p className="!mt-3 max-w-[440px] font-body text-[15px] text-[#F4EEDF]">
                        {project.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <a
              href="/contact-us"
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

          {/* Slider Indicator Bar */}
          <div 
            className="s2-indicator-container"
            style={{
              alignSelf: "center",
              width: "220px",
              height: "2px",
              backgroundColor: "rgba(244, 238, 223, 0.24)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              ref={indicatorRef}
              style={{
                position: "absolute",
                top: 0,
                height: "100%",
                width: `${100 / PROJECTS.length}%`, 
                left: `${(current * 100) / PROJECTS.length}%`,
                backgroundColor: "#F4EEDF",
              }}
            />
          </div>
        </div>
      </section>

      {/* ── MOBILE LAYOUT ── */}
      <section
        className="s3-mobile-section flex md:hidden flex-col section-container w-full min-h-screen relative overflow-hidden z-30 "
        style={{
          pointerEvents: "auto",
          background: "#19211C",
        }}
      >
        <div style={{ position: "relative", width: "100%", height: "45vh", overflow: "hidden", marginTop: 32 }}>
          {PROJECTS.map((project, i) => (
            <img
              key={project.id}
              className={`s3-bg s3-bg-${i + 1}`}
              src={project.image}
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

          {/* Mobile Horizontal Selector */}
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
            {PROJECTS.map((project, i) => (
              <button
                key={project.id}
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
                {project.label.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        <div style={{ position: "relative", flexGrow: 1, padding: "0 " }}>
          {PROJECTS.map((project, i) => (
            <div
              key={project.id}
              className={`s3-text s3-text-${i + 1}`}
              style={{
                position: i === 0 ? "relative" : "absolute",
                top: "30px",
                left: "0",
                right: "20px",
                opacity: i === current ? 1 : 0,
                display: "flex",
                flexDirection: "column",
                transition: "opacity 0.4s ease",
              }}
            >
              <div className="s3-line-wrap">
                <h2 className="font-display text-[#F4EEDF]">
                  {project.label} 
                </h2>
              </div>

              <div className="s3-line-wrap" style={{ marginTop: 12 }}>
                <p
                  className="font-body text-[#F4EEDF] "
                  style={{ fontSize: 14,  margin: 0 }}
                >
                  {project.description}
                </p>
              </div>

              <div className="s3-line-wrap" style={{ marginTop: 24 }}>
                <a
                  href="/contact-us"
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