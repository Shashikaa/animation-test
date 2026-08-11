"use client";

import { useRef, useState, useCallback, useEffect, useLayoutEffect } from "react";
import gsap from "gsap";
import { GRAND_POOLS_DATA } from "@/src/app/projects/[slug]/data"; // Update path if needed

// Map the keys from GRAND_POOLS_DATA into the array structure needed for SectionTwo
const PROJECTS = Object.entries(GRAND_POOLS_DATA).map(([key, data]) => ({
  id: key,
  label: data.title,
  description: data.description,
  // Uses the primary/first image from the dataset, falling back to a default if empty
  image: data.images[0] || "/kooyong-rd-toorak.webp",
  slug: `/projects/${key}`,
}));

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

      entranceTimeline.current = gsap
        .timeline({ paused: true })
        .to(".s2-projects-nav", {
          x: 0,
          opacity: 1,
          duration: 1.2,
          ease: "power3.out",
        })
        .to(
          ".s2-indicator-container",
          {
            scaleX: 1,
            opacity: 1,
            duration: 1.0,
            ease: "power3.out",
          },
          "-=1.0"
        );
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

    // Maintain old layout layer underneath during transition fade
    gsap.set(`${contextPrefix} .s3-bg-${prev + 1}`, {
      zIndex: 1,
    });

    // Animate opacity
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
      const textBlocks = containerRef.current!.querySelectorAll(
        `.s3-text-${i + 1}`
      ) as NodeListOf<HTMLElement>;
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
        className="s2-desktop-section hidden md:block w-full min-h-[100svh] relative overflow-hidden z-30"
        style={{ pointerEvents: "auto" }}
      >
        {PROJECTS.map((project, i) => (
          <img
            key={project.id}
            className={`s3-bg s3-bg-${i + 1}`}
            src={project.image}
            alt={project.label}
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
              className="s2-card-btn font-display text-left transition-all duration-300 hover:!opacity-100"
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
        className="s3-mobile-section block md:hidden w-full min-h-[100svh] relative overflow-hidden z-30"
        style={{ pointerEvents: "auto" }}
      >
        {PROJECTS.map((project, i) => (
          <img
            key={project.id}
            className={`s3-bg s3-bg-${i + 1}`}
            src={project.image}
            alt={project.label}
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