"use client";

import dynamic from "next/dynamic";
import Hero from "@/src/components/About/Hero";
import { useState, useRef, useEffect, useCallback } from "react";
import { useSite } from "@/src/app/context/SiteContext";
import { useHeroIntro } from "@/src/app/utils/useHeroIntro";

const SectionOne = dynamic(() => import("@/src/components/About/SectionOne"));
const SectionTwo = dynamic(() => import("@/src/components/About/SectionTwo"));
const SectionThree = dynamic(() => import("@/src/components/About/SectionThree"));
const SectionFour = dynamic(() => import("@/src/components/About/SectionFour"));
const SectionFive = dynamic(() => import("@/src/components/About/SectionFive"));
const Footer = dynamic(() => import("@/src/components/Footer"));

const clamp = (val: number, min = 0, max = 1) => Math.min(Math.max(val, min), max);
const mapRange = (val: number, inMin: number, inMax: number) => {
  if (inMin === inMax) return 0;
  return clamp((val - inMin) / (inMax - inMin));
};

export default function AboutMobile() {
  const [isSectionFiveActive, setIsSectionFiveActive] = useState(false);
  const scopeRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fixedFrameRef = useRef<HTMLDivElement>(null);
  const layer7Ref = useRef<HTMLDivElement>(null);

  const scrollMetricsRef = useRef({ totalScrollable: 0, vh: 0, trackTopOffset: 0 });
  const rawProgress = useRef(0);
  const smoothProgress = useRef(0); // Clamped speed tracker
  
  const rafId = useRef<number | null>(null);
  const lastSec5Idx = useRef<number>(-1);

  const { smootherRef } = useSite();
  const { preloaderDone, shouldLoadRest } = useHeroIntro(scopeRef, {
    isMobile: true,
    introDurationMs: 2800,
    unlockScrollEarlyMs: 1800,
  });

  const updateMetrics = useCallback(() => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const vh = window.innerHeight;
    scrollMetricsRef.current = {
      totalScrollable: rect.height - vh,
      vh,
      trackTopOffset: window.scrollY + rect.top,
    };
  }, []);

  useEffect(() => {
    if (!shouldLoadRest) return;
    updateMetrics();
    window.addEventListener("resize", updateMetrics, { passive: true });
    return () => window.removeEventListener("resize", updateMetrics);
  }, [shouldLoadRest, updateMetrics]);

  const triggerSec5Hook = useCallback((nextIdx: number) => {
    if (nextIdx !== lastSec5Idx.current) {
      lastSec5Idx.current = nextIdx;
      if (typeof window !== "undefined" && (window as any)._sec5GoTo) {
        (window as any)._sec5GoTo(nextIdx);
      }
    }
  }, []);

  // ── SMOOTHLY CONTROLLED MOBILE ENGINE ──
  useEffect(() => {
    if (!shouldLoadRest) return;

    const panels = trackRef.current?.querySelectorAll<HTMLElement>(".about-stack-layer");
    const s5Bg = scopeRef.current?.querySelector<HTMLElement>(".s5-bg");

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      // Smooth dampening factor (0.12) caps fast swipes so animation plays out progressively
      const diff = rawProgress.current - smoothProgress.current;
      smoothProgress.current += diff * 0.12;
      const p = smoothProgress.current;

      const s1Prog = mapRange(p, 0.00, 0.14);
      const s2Prog = mapRange(p, 0.14, 0.28);
      const s3Prog = mapRange(p, 0.28, 0.42);
      const s4Prog = mapRange(p, 0.42, 0.56);
      const s5Prog = mapRange(p, 0.56, 0.70);
      const footerProgress = mapRange(p, 0.86, 1.00);

      if (panels && panels.length > 0) {
        if (panels[1]) panels[1].style.transform = `translate3d(0, ${((1 - s1Prog) * 100).toFixed(3)}%, 0)`;
        if (panels[2]) panels[2].style.transform = `translate3d(0, ${((1 - s2Prog) * 100).toFixed(3)}%, 0)`;
        if (panels[3]) panels[3].style.transform = `translate3d(0, ${((1 - s3Prog) * 100).toFixed(3)}%, 0)`;
        if (panels[4]) panels[4].style.transform = `translate3d(0, ${((1 - s4Prog) * 100).toFixed(3)}%, 0)`;
        if (panels[5]) panels[5].style.transform = `translate3d(0, ${((1 - s5Prog) * 100).toFixed(3)}%, 0)`;
      }

      const { vh } = scrollMetricsRef.current;

      if (layer7Ref.current) {
        const footerHeight = layer7Ref.current.offsetHeight || vh;
        const translateY = vh - footerHeight * footerProgress;
        layer7Ref.current.style.transform = `translate3d(0, ${translateY.toFixed(2)}px, 0)`;
      }

      if (s5Bg) {
        const parallaxProg = mapRange(p, 0.56, 0.86);
        s5Bg.style.transform = `translate3d(0, ${(-parallaxProg * 50).toFixed(2)}%, 0)`;
      }

      if (p >= 0.70 && p < 0.86) {
        setIsSectionFiveActive(true);
        const s5Internal = mapRange(p, 0.70, 0.86);
        if (s5Internal < 0.33) triggerSec5Hook(0);
        else if (s5Internal < 0.66) triggerSec5Hook(1);
        else triggerSec5Hook(2);
      } else if (p < 0.70) {
        setIsSectionFiveActive(false);
        triggerSec5Hook(0);
      }

      rafId.current = requestAnimationFrame(render);
    };

    const handleScroll = (e?: any) => {
      const lenis = smootherRef?.current;
      const scrollY = e?.scroll ?? lenis?.scroll ?? window.scrollY;
      const { totalScrollable, trackTopOffset } = scrollMetricsRef.current;

      if (totalScrollable <= 0) return;

      const relativeScroll = scrollY - trackTopOffset;
      const trackBottom = relativeScroll + totalScrollable;

      if (fixedFrameRef.current) {
        if (relativeScroll >= 0 && trackBottom >= 0) {
          fixedFrameRef.current.style.position = "fixed";
          fixedFrameRef.current.style.top = "0px";
          fixedFrameRef.current.style.bottom = "auto";
        } else if (trackBottom < 0) {
          fixedFrameRef.current.style.position = "absolute";
          fixedFrameRef.current.style.top = "auto";
          fixedFrameRef.current.style.bottom = "0px";
        } else {
          fixedFrameRef.current.style.position = "absolute";
          fixedFrameRef.current.style.top = "0px";
          fixedFrameRef.current.style.bottom = "auto";
        }
      }

      rawProgress.current = clamp(relativeScroll / totalScrollable);
    };

    const lenis = smootherRef?.current;
    if (lenis && typeof lenis.on === "function") {
      lenis.on("scroll", handleScroll);
    } else {
      window.addEventListener("scroll", handleScroll, { passive: true });
    }

    handleScroll();
    rafId.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (rafId.current) cancelAnimationFrame(rafId.current);
      if (lenis && typeof lenis.off === "function") {
        lenis.off("scroll", handleScroll);
      } else {
        window.removeEventListener("scroll", handleScroll);
      }
      if (typeof window !== "undefined") delete (window as any)._sec5GoTo;
    };
  }, [shouldLoadRest, smootherRef, triggerSec5Hook]);

  return (
    <div ref={scopeRef} className="w-full">
      <div
        ref={trackRef}
        className="about-track-container relative w-full"
        style={{ height: "700vh" }}
      >
        <div
          ref={fixedFrameRef}
          className="fixed top-0 left-0 w-full overflow-hidden z-10 h-[100vh]"
        >
          <div className="about-stack-layer absolute inset-0 w-full h-[100vh] z-10 gpu-accelerated transform-gpu will-change-transform">
            <Hero isMobile={true} />
          </div>

          {shouldLoadRest && (
            <>
              <div
                className="about-stack-layer absolute inset-0 w-full h-[100vh] z-20 gpu-accelerated will-change-transform"
                style={{ transform: "translate3d(0, 100%, 0)" }}
              >
                <SectionOne />
              </div>
              <div
                className="about-stack-layer absolute inset-0 w-full h-[100vh] z-30 gpu-accelerated will-change-transform"
                style={{ transform: "translate3d(0, 100%, 0)" }}
              >
                <SectionTwo />
              </div>
              <div
                className="about-stack-layer absolute inset-0 w-full h-[100vh] z-40 gpu-accelerated will-change-transform"
                style={{ transform: "translate3d(0, 100%, 0)" }}
              >
                <SectionThree />
              </div>
              <div
                className="about-stack-layer absolute inset-0 w-full h-[100vh] z-50 gpu-accelerated will-change-transform"
                style={{ transform: "translate3d(0, 100%, 0)" }}
              >
                <SectionFour />
              </div>
              <div
                className="about-stack-layer absolute inset-0 w-full h-[100vh] z-[60] gpu-accelerated will-change-transform"
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