"use client";

import Hero from "@/src/components/About/Hero";
import SectionOne from "@/src/components/About/SectionOne";
import SectionTwo from "@/src/components/About/SectionTwo";
import SectionThree from "@/src/components/About/SectionThree";
import SectionFour from "@/src/components/About/SectionFour";
import SectionFive from "@/src/components/About/SectionFive";
import SectionCTA from "@/src/components/SectionCTA";
import Footer from "@/src/components/Footer";
import { useState, useRef, useEffect } from "react";
import { useSite } from "@/src/app/context/SiteContext";

const TOTAL_SCROLL_STEPS = 11;

// Easing function for smooth acceleration/deceleration curve (Ease-Out Quad)
const easeOutQuad = (t: number) => t * (2 - t);

export default function AboutMobile() {
  const [isSectionFiveActive, setIsSectionFiveActive] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const fixedFrameRef = useRef<HTMLDivElement>(null);
  const ctaWrapRef = useRef<HTMLDivElement>(null);
  const footerWrapRef = useRef<HTMLDivElement>(null);

  // Targets and interpolated values for smooth LERP
  const targetProgress = useRef(0);
  const currentProgress = useRef(0);
  const rafId = useRef<number | null>(null);

  const lastSec5Idx = useRef<number>(-1);
  const { smootherRef } = useSite();

  useEffect(() => {
    const panels = trackRef.current?.querySelectorAll<HTMLElement>(".about-stack-layer");
    if (!panels || panels.length === 0) return;

    const triggerSec5Hook = (nextIdx: number) => {
      if (nextIdx !== lastSec5Idx.current) {
        lastSec5Idx.current = nextIdx;
        if ((window as any)._sec5GoTo) {
          (window as any)._sec5GoTo(nextIdx);
        }
      }
    };

    // Render loop running via requestAnimationFrame for smooth 60/120fps physics interpolation
    const updatePhysics = () => {
      // Linear Interpolation (LERP) factor (0.08 = ultra smooth fluid momentum)
      const lerpFactor = 0.08;
      currentProgress.current += (targetProgress.current - currentProgress.current) * lerpFactor;

      const progress = currentProgress.current;
      const stepProgress = progress * (TOTAL_SCROLL_STEPS - 1);

      const vh = window.innerHeight;

      // --- SECTION SLIDE-UP PROGRESS WITH EASING CURVES ---
      const s1Progress = easeOutQuad(Math.min(Math.max(stepProgress - 0, 0), 1));
      const s2Progress = easeOutQuad(Math.min(Math.max(stepProgress - 1, 0), 1));
      const s3Progress = easeOutQuad(Math.min(Math.max(stepProgress - 2, 0), 1));
      const s4Progress = easeOutQuad(Math.min(Math.max(stepProgress - 3, 0), 1));
      const s5Progress = easeOutQuad(Math.min(Math.max(stepProgress - 4, 0), 1));

      panels[1].style.transform = `translate3d(0, ${(1 - s1Progress) * 100}%, 0)`;
      panels[2].style.transform = `translate3d(0, ${(1 - s2Progress) * 100}%, 0)`;
      panels[3].style.transform = `translate3d(0, ${(1 - s3Progress) * 100}%, 0)`;
      panels[4].style.transform = `translate3d(0, ${(1 - s4Progress) * 100}%, 0)`;
      panels[5].style.transform = `translate3d(0, ${(1 - s5Progress) * 100}%, 0)`;

      // --- SECTION 5 INNER CARD STEPPING (Steps 4.5 -> 7.0) ---
      if (stepProgress >= 4.5 && stepProgress < 7.0) {
        setIsSectionFiveActive(true);
        const sec5SubProgress = (stepProgress - 4.5) / 2.5;

        if (sec5SubProgress < 0.33) {
          triggerSec5Hook(0);
        } else if (sec5SubProgress < 0.66) {
          triggerSec5Hook(1);
        } else {
          triggerSec5Hook(2);
        }
      } else {
        if (stepProgress < 4.5) {
          setIsSectionFiveActive(false);
          triggerSec5Hook(0);
        }
      }

      // --- SECTION CTA SLIDE-UP & EXTENDED TRAVEL (Steps 7.0 -> 8.5) ---
      const ctaEl = ctaWrapRef.current;
      const ctaHeight = ctaEl ? ctaEl.offsetHeight : vh;
      const extraCtaScroll = Math.max(0, ctaHeight - vh);

      const rawCtaProgress = Math.min(Math.max((stepProgress - 7.0) / 1.5, 0), 1);
      const ctaProgress = easeOutQuad(rawCtaProgress);
      const ctaY = (1 - ctaProgress) * vh - ctaProgress * extraCtaScroll;
      panels[6].style.transform = `translate3d(0, ${ctaY}px, 0)`;

      // --- FOOTER FULL REVEAL SLIDE-UP (Steps 8.5 -> 9.8) ---
      const footerEl = footerWrapRef.current;
      const footerHeight = footerEl ? footerEl.offsetHeight : vh;

      const rawFooterProgress = Math.min(Math.max((stepProgress - 8.5) / 1.3, 0), 1);
      const footerProgress = easeOutQuad(rawFooterProgress);
      const footerY = (1 - footerProgress) * footerHeight;

      panels[7].style.transform = `translate3d(0, ${footerY}px, 0)`;

      // Keep animation frame running smoothly
      rafId.current = requestAnimationFrame(updatePhysics);
    };

    const handleScroll = () => {
      if (!trackRef.current || !fixedFrameRef.current) return;

      const trackRect = trackRef.current.getBoundingClientRect();
      const vh = window.innerHeight;
      const totalScrollable = trackRect.height - vh;

      if (totalScrollable <= 0) return;

      // Pinning Management
      if (trackRect.top <= 0 && trackRect.bottom >= vh) {
        fixedFrameRef.current.style.position = "fixed";
        fixedFrameRef.current.style.top = "0px";
        fixedFrameRef.current.style.bottom = "auto";
      } else if (trackRect.bottom < vh) {
        fixedFrameRef.current.style.position = "absolute";
        fixedFrameRef.current.style.top = "auto";
        fixedFrameRef.current.style.bottom = "0px";
      } else {
        fixedFrameRef.current.style.position = "absolute";
        fixedFrameRef.current.style.top = "0px";
        fixedFrameRef.current.style.bottom = "auto";
      }

      // Update target progress for LERP loop
      const currentScroll = Math.max(0, -trackRect.top);
      targetProgress.current = Math.min(Math.max(currentScroll / totalScrollable, 0), 1);
    };

    // Start RAF loop
    rafId.current = requestAnimationFrame(updatePhysics);

    const lenis = smootherRef?.current;
    if (lenis) {
      lenis.on("scroll", handleScroll);
    } else {
      window.addEventListener("scroll", handleScroll, { passive: true });
    }

    handleScroll();

    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
      if (lenis) {
        lenis.off("scroll", handleScroll);
      } else {
        window.removeEventListener("scroll", handleScroll);
      }
    };
  }, [smootherRef]);

  return (
    <div
      ref={trackRef}
      className="about-track-container relative w-full"
      style={{ height: `${TOTAL_SCROLL_STEPS * 100}vh` }}
    >
      <div
        ref={fixedFrameRef}
        className="absolute top-0 left-0 h-[100svh] w-full overflow-hidden bg-[#162D24] z-10"
      >
        {/* 0: HERO PANEL */}
        <div className="about-stack-layer absolute inset-0 w-full h-full z-10 gpu-accelerated">
          <Hero isMobile={true} />
        </div>

        {/* 1: SECTION ONE */}
        <div
          className="about-stack-layer absolute inset-0 w-full h-full z-20 gpu-accelerated"
          style={{ transform: "translate3d(0, 100%, 0)" }}
        >
          <SectionOne />
        </div>

        {/* 2: SECTION TWO */}
        <div
          className="about-stack-layer absolute inset-0 w-full h-full z-30 gpu-accelerated"
          style={{ transform: "translate3d(0, 100%, 0)" }}
        >
          <SectionTwo />
        </div>

        {/* 3: SECTION THREE */}
        <div
          className="about-stack-layer absolute inset-0 w-full h-full z-40 gpu-accelerated"
          style={{ transform: "translate3d(0, 100%, 0)" }}
        >
          <SectionThree />
        </div>

        {/* 4: SECTION FOUR */}
        <div
          className="about-stack-layer absolute inset-0 w-full h-full z-50 gpu-accelerated"
          style={{ transform: "translate3d(0, 100%, 0)" }}
        >
          <SectionFour />
        </div>

        {/* 5: SECTION FIVE */}
        <div
          className="about-stack-layer absolute inset-0 w-full h-full z-[60] gpu-accelerated"
          style={{ transform: "translate3d(0, 100%, 0)" }}
        >
          <SectionFive isActive={isSectionFiveActive} />
        </div>

        {/* 6: SECTION CTA */}
        <div
          ref={ctaWrapRef}
          className="about-stack-layer absolute left-0 top-0 w-full min-h-[100svh] z-[150] gpu-accelerated bg-[#162D24]"
          style={{ transform: "translate3d(0, 100%, 0)" }}
        >
          <SectionCTA />
        </div>

        {/* 7: FOOTER WRAP */}
        <div
          ref={footerWrapRef}
          className="about-stack-layer absolute inset-x-0 bottom-0 w-full z-[160] gpu-accelerated"
          style={{ transform: "translate3d(0, 100%, 0)" }}
        >
          <Footer />
        </div>
      </div>
    </div>
  );
}