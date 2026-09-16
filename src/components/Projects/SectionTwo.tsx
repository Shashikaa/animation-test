"use client";

import { useRef, useState, useCallback, useEffect, useLayoutEffect } from "react";
import gsap from "gsap";
import { GRAND_POOLS_DATA } from "@/src/app/projects/[slug]/data";
import Link from "next/link";

const PROJECTS = Object.entries(GRAND_POOLS_DATA).map(([key, data]) => {
  const source = data.media || data.images[0] || "/kooyong-rd-toorak.webp";
  const isVideo = /\.(mp4|webm|mov)$/i.test(source);

  return {
    id: key,
    label: data.title,
    description: data.description,
    mediaSrc: source,
    isVideo,
    slug: `/projects/${key}`,
  };
});

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
  
  // Keep separate refs for desktop and mobile video elements if needed, or query them directly
  const desktopMediaRefs = useRef<(HTMLVideoElement | HTMLImageElement | null)[]>([]);
  const mobileMediaRefs = useRef<(HTMLVideoElement | HTMLImageElement | null)[]>([]);

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
      const currentMedia = desktopMediaRefs.current[currentRef.current];
      if (currentMedia instanceof HTMLVideoElement) {
        currentMedia.play().catch(() => {});
      }
      const currentMobileMedia = mobileMediaRefs.current[currentRef.current];
      if (currentMobileMedia instanceof HTMLVideoElement) {
        currentMobileMedia.play().catch(() => {});
      }
    } else {
      entranceTimeline.current?.reverse();
      desktopMediaRefs.current.forEach((el) => {
        if (el instanceof HTMLVideoElement) el.pause();
      });
      mobileMediaRefs.current.forEach((el) => {
        if (el instanceof HTMLVideoElement) el.pause();
      });
    }
  }, [isActive]);

  const goTo = useCallback((next: number, direction: "next" | "prev") => {
    const prev = currentRef.current;
    if (animating.current || next === prev || !containerRef.current) return;
    animating.current = true;

    currentRef.current = next;
    setCurrent(next);

    // Play incoming videos
    const nextDesktop = desktopMediaRefs.current[next];
    const nextMobile = mobileMediaRefs.current[next];
    if (nextDesktop instanceof HTMLVideoElement) {
      nextDesktop.currentTime = 0;
      nextDesktop.play().catch(() => {});
    }
    if (nextMobile instanceof HTMLVideoElement) {
      nextMobile.currentTime = 0;
      nextMobile.play().catch(() => {});
    }

    if (indicatorRef.current) {
      const segmentWidthPercentage = 100 / PROJECTS.length;
      const targetLeftPosition = next * segmentWidthPercentage;

      gsap.to(indicatorRef.current, {
        left: `${targetLeftPosition}%`,
        duration: FADE_DURATION,
        ease: "power2.inOut",
      });
    }

    // Run transition for both contexts to ensure consistency
    [".s2-desktop-section", ".s3-mobile-section"].forEach((contextPrefix) => {
      const incomingEl = containerRef.current?.querySelector(`${contextPrefix} .s3-bg-${next + 1}`);
      const outgoingEl = containerRef.current?.querySelector(`${contextPrefix} .s3-bg-${prev + 1}`);

      if (incomingEl && outgoingEl) {
        // Set incoming element above outgoing element immediately
        gsap.set(incomingEl, { zIndex: 2, opacity: 0 });
        gsap.set(outgoingEl, { zIndex: 1 });

        // Smooth crossfade animation
        gsap.to(incomingEl, {
          opacity: 1,
          duration: FADE_DURATION,
          ease: "power2.inOut",
          onComplete: () => {
            // Clean up z-indexes and hide outgoing element after fade completes
            gsap.set(incomingEl, { zIndex: 2 });
            gsap.set(outgoingEl, { zIndex: 1, opacity: 0 });
            
            const prevDesktop = desktopMediaRefs.current[prev];
            const prevMobile = mobileMediaRefs.current[prev];
            if (prevDesktop instanceof HTMLVideoElement) prevDesktop.pause();
            if (prevMobile instanceof HTMLVideoElement) prevMobile.pause();
          },
        });
      }
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

  const renderMediaElement = (
    project: (typeof PROJECTS)[0], 
    i: number, 
    refList: React.MutableRefObject<(HTMLVideoElement | HTMLImageElement | null)[]>
  ) => {
    const commonStyles = {
      position: "absolute" as const,
      inset: 0,
      width: "100%",
      height: "100%",
      objectFit: "cover" as const,
      zIndex: i === 0 ? 2 : 1,
      opacity: i === 0 ? 1 : 0,
      willChange: "opacity", // Optimizes browser rendering for smooth transitions
    };

    if (project.isVideo) {
      return (
        <video
          key={project.id}
          ref={(el) => { refList.current[i] = el; }}
          className={`s3-bg s3-bg-${i + 1}`}
          src={project.mediaSrc}
          autoPlay
          loop
          muted
          playsInline
          aria-hidden
          style={commonStyles}
        />
      );
    }

    return (
      <img
        key={project.id}
        ref={(el) => { refList.current[i] = el; }}
        className={`s3-bg s3-bg-${i + 1}`}
        src={project.mediaSrc}
        alt={project.label}
        aria-hidden
        style={commonStyles}
      />
    );
  };

  return (
    <div ref={containerRef}>
      {/* ── DESKTOP LAYOUT ── */}
      <section
        className="s2-desktop-section hidden md:block w-full min-h-[100svh] relative overflow-hidden z-30"
        style={{ pointerEvents: "auto" }}
      >
        {PROJECTS.map((project, i) => renderMediaElement(project, i, desktopMediaRefs))}

        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            zIndex: 3,
            pointerEvents: "none",
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

        {/* Desktop Footer Action */}
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
            pointerEvents: "none",
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
              pointerEvents: "auto",
            }}
          >
            <Link
              href={PROJECTS[current].slug}
              className="group btn-underline font-body"
            >
              LEARN MORE
            </Link>
          </div>
        </div>
      </section>

      {/* ── MOBILE LAYOUT ── */}
      <section
        className="s3-mobile-section block md:hidden w-full min-h-[100svh] relative overflow-hidden z-30"
        style={{ pointerEvents: "auto" }}
      >
        {PROJECTS.map((project, i) => renderMediaElement(project, i, mobileMediaRefs))}

        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            zIndex: 3,
            pointerEvents: "none",
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

        {/* Mobile Footer Action */}
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
            pointerEvents: "none",
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
              pointerEvents: "auto",
            }}
          >
            <Link
              href={PROJECTS[current].slug}
              className="group btn-underline font-body"
            >
              LEARN MORE
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}