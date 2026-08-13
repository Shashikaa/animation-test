"use client";

import dynamic from "next/dynamic";
import Hero from "@/src/components/About/Hero";
import { useState, useRef, useEffect, useCallback } from "react";
import { useSite } from "@/src/app/context/SiteContext";
import { useHeroIntro } from "@/src/app/utils/useHeroIntro";
import { useStackedScroll } from "@/src/app/utils/useStackedScroll";

const SectionOne = dynamic(() => import("@/src/components/About/SectionOne"));
const SectionTwo = dynamic(() => import("@/src/components/About/SectionTwo"));
const SectionThree = dynamic(() => import("@/src/components/About/SectionThree"));
const SectionFour = dynamic(() => import("@/src/components/About/SectionFour"));
const SectionFive = dynamic(() => import("@/src/components/About/SectionFive"));
const Footer = dynamic(() => import("@/src/components/Footer"));

const easeOutQuad = (t: number) => t * (2 - t);

export default function AboutMobile() {
  const [isSectionFiveActive, setIsSectionFiveActive] = useState(false);
  const layer7Ref = useRef<HTMLDivElement>(null);
  const rafId = useRef<number | null>(null);
  const lastSec5Idx = useRef<number>(-1);

  const scopeRef = useRef<HTMLDivElement>(null);
  const { smootherRef } = useSite();
  const { preloaderDone, shouldLoadRest } = useHeroIntro(scopeRef, {
    isMobile: true,
    introDurationMs: 2800,
    unlockScrollEarlyMs: 1800,
  });

  // Keep total track steps aligned with your original setup
  const { trackRef, fixedFrameRef, rawProgress, scrollMetricsRef } = useStackedScroll({
    totalSteps: 7.5,
    shouldLoadRest,
  });

  // Original Section 5 Hook Handler
  const triggerSec5Hook = useCallback((nextIdx: number) => {
    if (nextIdx !== lastSec5Idx.current) {
      lastSec5Idx.current = nextIdx;
      if (typeof window !== "undefined" && (window as any)._sec5GoTo) {
        (window as any)._sec5GoTo(nextIdx);
      }
    }
  }, []);

  useEffect(() => {
    if (!shouldLoadRest) return;

    const panels = trackRef.current?.querySelectorAll<HTMLElement>(".about-stack-layer");
    const s5Bg = scopeRef.current?.querySelector<HTMLElement>(".s5-bg");

    const render = () => {
      const currentProg = rawProgress.current;
      const totalSteps = 7.5;
      const stepProgress = currentProg * totalSteps;

      // Exact original step progress calculations & threshold triggers
      const s1Prog = easeOutQuad(Math.min(Math.max(stepProgress - 0, 0), 1));
      const s2Prog = easeOutQuad(Math.min(Math.max(stepProgress - 1, 0), 1));
      const s3Prog = easeOutQuad(Math.min(Math.max(stepProgress - 2, 0), 1));
      const s4Prog = easeOutQuad(Math.min(Math.max(stepProgress - 3, 0), 1));
      const s5Prog = easeOutQuad(Math.min(Math.max(stepProgress - 4, 0), 1));

      const footerProgress = easeOutQuad(Math.min(Math.max(stepProgress - 6.5, 0), 1));

      if (panels && panels.length > 0) {
        if (panels[1]) panels[1].style.transform = `translate3d(0, ${(1 - s1Prog) * 100}%, 0)`;
        if (panels[2]) panels[2].style.transform = `translate3d(0, ${(1 - s2Prog) * 100}%, 0)`;
        if (panels[3]) panels[3].style.transform = `translate3d(0, ${(1 - s3Prog) * 100}%, 0)`;
        if (panels[4]) panels[4].style.transform = `translate3d(0, ${(1 - s4Prog) * 100}%, 0)`;
        if (panels[5]) panels[5].style.transform = `translate3d(0, ${(1 - s5Prog) * 100}%, 0)`;
      }

      const { vh } = scrollMetricsRef.current;

      if (layer7Ref.current) {
        const footerHeight = layer7Ref.current.offsetHeight || vh;
        const startY = vh;
        const endY = vh - footerHeight;
        const translateY = startY + (endY - startY) * footerProgress;
        layer7Ref.current.style.transform = `translate3d(0, ${translateY}px, 0)`;
      }

      if (s5Bg) {
        const parallaxProg = Math.min(Math.max((stepProgress - 4.0) / 2.5, 0), 1);
        s5Bg.style.transform = `translate3d(0, ${-parallaxProg * 50}%, 0)`;
      }

      // Restored exact original inner animation triggers for Section Five
      if (stepProgress >= 4.2 && stepProgress < 6.5) {
        setIsSectionFiveActive(true);
        if (stepProgress < 5.0) triggerSec5Hook(0);
        else if (stepProgress < 5.7) triggerSec5Hook(1);
        else triggerSec5Hook(2);
      } else if (stepProgress < 4.2) {
        setIsSectionFiveActive(false);
        triggerSec5Hook(0);
      }
    };

    const handleScroll = () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(render);
    };

    const lenis = smootherRef?.current;
    if (lenis && typeof lenis.on === "function") {
      lenis.on("scroll", handleScroll);
    } else {
      window.addEventListener("scroll", handleScroll, { passive: true });
    }

    render();

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      if (lenis && typeof lenis.off === "function") {
        lenis.off("scroll", handleScroll);
      } else {
        window.removeEventListener("scroll", handleScroll);
      }
      if (typeof window !== "undefined") delete (window as any)._sec5GoTo;
    };
  }, [shouldLoadRest, smootherRef, triggerSec5Hook, trackRef, rawProgress, scrollMetricsRef]);

  return (
    <div ref={scopeRef} className="w-full">
      <div ref={trackRef} className="about-track-container relative w-full">
        <div
          ref={fixedFrameRef}
          className="fixed top-0 left-0 w-full overflow-hidden z-10 h-[100dvh]"
        >
          <div className="about-stack-layer absolute inset-0 w-full h-[100dvh] z-10 gpu-accelerated transform-gpu will-change-transform">
            <Hero isMobile={true} />
          </div>

          {shouldLoadRest && (
            <>
              <div
                className="about-stack-layer absolute inset-0 w-full h-[100dvh] z-20 gpu-accelerated will-change-transform"
                style={{ transform: "translate3d(0, 100%, 0)" }}
              >
                <SectionOne />
              </div>
              <div
                className="about-stack-layer absolute inset-0 w-full h-[100dvh] z-30 gpu-accelerated will-change-transform"
                style={{ transform: "translate3d(0, 100%, 0)" }}
              >
                <SectionTwo />
              </div>
              <div
                className="about-stack-layer absolute inset-0 w-full h-[100dvh] z-40 gpu-accelerated will-change-transform"
                style={{ transform: "translate3d(0, 100%, 0)" }}
              >
                <SectionThree />
              </div>
              <div
                className="about-stack-layer absolute inset-0 w-full h-[100dvh] z-50 gpu-accelerated will-change-transform"
                style={{ transform: "translate3d(0, 100%, 0)" }}
              >
                <SectionFour />
              </div>
              <div
                className="about-stack-layer absolute inset-0 w-full h-[100dvh] z-[60] gpu-accelerated will-change-transform"
                style={{ transform: "translate3d(0, 100%, 0)" }}
              >
                <SectionFive isActive={isSectionFiveActive} />
              </div>
              <div
                ref={layer7Ref}
                className="layer-auto-height gpu-accelerated absolute left-0 top-0 w-full z-[151] will-change-transform"
                style={{ transform: "translate3d(0, 100vh, 0)" }}
              >
                <Footer />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}