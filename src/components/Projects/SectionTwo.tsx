"use client";

import { useRef, useState, useCallback, useEffect, useLayoutEffect } from "react";
import gsap from "gsap";

const PROJECTS = [
  {
    id: "kooyong",
    label: "Kooyong Rd Toorak",
    tag: "Exceptional Pools,",
    tagline: "Built to Impress",
    description:
      "This stunning Toorak build creates a sophisticated, resort-style escape tailored for elite inner-city living.",
    image: "/kooyong-rd-toorak.webp",
    slug: "/projects/kooyong",
  },
  {
    id: "dennett",
    label: "Dennett st Carrum",
    tag: "A flawless blend",
    tagline: "of luxury",
    description:
      "This custom concrete pool transforms a classic Carrum backyard into a private, light-filled family sanctuary.",
    image: "/pool-renovation.webp",
    slug: "/projects/dennett",
  },
  {
    id: "murray",
    label: "Murray st Prahran",
    tag: "When master",
    tagline: "craftsmanship meets smart",
    description:
      "Our Murray St, Prahran project masterfully conquers a compact, inner-city space with a striking, custom-engineered concrete pool.",
    image: "/murray-st-prahran.webp",
    slug: "/projects/murray",
  },
  {
    id: "reay",
    label: "Reay Rd Mooroolbark",
    tag: "Showcase luxury",
    tagline: "at its finest",
    description:
      "This custom residential oasis seamlessly blends sun-drenched outdoor living with sleek, modern concrete pool design in Mooroolbark.",
    image: "/the-corner-toorak.webp",
    slug: "/projects/reay",
  },
  {
    id: "como",
    label: "‘The Como’ Toorak",
    tag: "High-End",
    tagline: "Architectural Vibe",
    description:
      "'The Como' project in Toorak showcases our commitment to custom engineering, sophisticated integration, and master craftsmanship.",
    image: "/mernda-ave-bonbeach.webp",
    slug: "/projects/como",
  },
];

// Reduced slightly for a snappier, more modern modern fade feel (e.g., 0.7s - 0.8s)
const FADE_DURATION = 0.8; 

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

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(".s2-projects-nav", { x: -60, opacity: 0 });
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

    if (indicatorRef.current) {
      const segmentWidthPercentage = 100 / PROJECTS.length;
      const targetLeftPosition = next * segmentWidthPercentage;
      
      gsap.to(indicatorRef.current, {
        left: `${targetLeftPosition}%`,
        duration: FADE_DURATION,
        ease: "power2.inOut",
      });
    }

    const contextPrefix = isMobile ? ".s3-mobile-section" : ".s2-desktop-section";

    // Prepare incoming image layout layer properties
    gsap.set(`${contextPrefix} .s3-bg-${next + 1}`, {
      opacity: 0,
      zIndex: 2,
    });
    
    // Maintain old layout layer underneath during the transition fade
    gsap.set(`${contextPrefix} .s3-bg-${prev + 1}`, {
      zIndex: 1,
    });

    // Animate opacity for the premium fade look
    gsap.to(`${contextPrefix} .s3-bg-${next + 1}`, {
      opacity: 1,
      duration: FADE_DURATION,
      ease: "power2.out",
      onComplete: () => {
        gsap.set(`${contextPrefix} .s3-bg-${next + 1}`, { zIndex: 1 });
        gsap.set(`${contextPrefix} .s3-bg-${prev + 1}`, {
          zIndex: 0,
          opacity: 0,
        });
      },
    });

    PROJECTS.forEach((_, i) => {
      const textBlocks = containerRef.current!.querySelectorAll(`.s3-text-${i + 1}`) as NodeListOf<HTMLElement>;
      textBlocks.forEach((textBlock) => {
        if (textBlock) {
          textBlock.style.opacity = i === next ? "1" : "0";
          textBlock.style.pointerEvents = i === next ? "auto" : "none";
          if (textBlock.closest(".s3-mobile-section")) {
            textBlock.style.position = i === next ? "relative" : "absolute";
          }
        }
      });
    });

    gsap.delayedCall(FADE_DURATION, () => {
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
              transition: "none", // Ensures pure GSAP control
              zIndex: i === 0 ? 1 : 0,
              opacity: i === 0 ? 1 : 0,
            }}
          />
        ))}

        {/* Pure Flat Color Overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            zIndex: 2,
          }}
        />

        {/* Desktop Navigation */}
        <div
          className="s2-projects-nav"
          style={{
            position: "absolute",
            left: "8%",
            top: "45%",
            transform: "translateY(-50%)",
            zIndex: 20,
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            minWidth: "350px",
          }}
        >
          {PROJECTS.map((project, i) => (
            <button
              key={project.id}
              type="button"
              onClick={() => handleTab(i)}
              className="s2-card-btn font-display text-left transition-all duration-300 hover:!opacity-100 "
              style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                fontSize: "32px",
                fontWeight: "300",
                color: current === i ? "#F4EEDF" : "rgba(244, 238, 223, 0.65)",
         
              }}
            >
              {project.label}
            </button>
          ))}
        </div>

        {/* Desktop Global Action Footer Wrapper */}
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
          <div
            className="section-container w-full"
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "flex-end", 
              paddingLeft: "8%",
              paddingRight: "8%",
              paddingBottom: "35px",
            }}
          >
            <a
              href={PROJECTS[current].slug}

              className="group btn-underline font-body"
            >
              LEARN MORE
       

            </a>
          </div>
        </div>
      </section>

      {/* ── MOBILE LAYOUT ── */}
      <section
        className="s3-mobile-section block md:hidden w-full min-h-screen relative overflow-hidden z-30"
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
              transition: "none",
              zIndex: i === 0 ? 1 : 0,
              opacity: i === 0 ? 1 : 0,
            }}
          />
        ))}

        {/* Pure Flat Color Overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            zIndex: 2,
          }}
        />

        {/* Mobile Navigation */}
        <div
          className="s2-projects-nav"
          style={{
            position: "absolute",
            left: "8%",
            top: "45%",
            transform: "translateY(-50%)",
            zIndex: 20,
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            minWidth: "280px",
          }}
        >
          {PROJECTS.map((project, i) => (
            <button
              key={project.id}
              type="button"
              onClick={() => handleTab(i)}
              className="font-display text-left transition-all duration-300"
              style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                fontSize: "26px",
                letterSpacing: "-0.02em",
                fontWeight: "300",
                color: current === i ? "#F4EEDF" : "rgba(244, 238, 223, 0.65)",
             
              }}
            >
              {project.label}
            </button>
          ))}
        </div>

        {/* Mobile Global Action Footer Wrapper */}
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
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "flex-end", 
              paddingLeft: "8%",
              paddingRight: "8%",
              paddingBottom: "55px",
            }}
          >
                     <a
              href={PROJECTS[current].slug}

              className="group btn-underline font-body"
            >
              LEARN MORE
       

            </a>
          </div>
        </div>
      </section>
    </div>
  );
}