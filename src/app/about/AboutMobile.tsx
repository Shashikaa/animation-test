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

const clamp = (val: number, min = 0, max = 1) =>
  Math.min(Math.max(val, min), max);

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

  const scrollMetricsRef = useRef({
    totalScrollable: 0,
    vh: 0,
    trackTopOffset: 0,
  });

  const currentProgress = useRef(0);
  const targetProgress = useRef(0);
  const smoothedTargetProgress = useRef(0);
  const rafId = useRef<number | null>(null);
  const lastSec5Idx = useRef(-1);

  const { smootherRef } = useSite();

  const { shouldLoadRest } = useHeroIntro(scopeRef, {
    isMobile: true,
    introDurationMs: 2800,
    unlockScrollEarlyMs: 1800,
  });

  const updateMetrics = useCallback(() => {
    if (!trackRef.current) return;

    const rect = trackRef.current.getBoundingClientRect();
    const vh = window.innerHeight;

    scrollMetricsRef.current = {
      totalScrollable: Math.max(0, rect.height - vh),
      vh,
      trackTopOffset: window.scrollY + rect.top,
    };
  }, []);

  useEffect(() => {
    if (!shouldLoadRest) return;

    updateMetrics();

    window.addEventListener("resize", updateMetrics, { passive: true });
    window.addEventListener("orientationchange", updateMetrics, {
      passive: true,
    });

    return () => {
      window.removeEventListener("resize", updateMetrics);
      window.removeEventListener("orientationchange", updateMetrics);
    };
  }, [shouldLoadRest, updateMetrics]);

  const triggerSec5Hook = useCallback((nextIdx: number) => {
    if (nextIdx === lastSec5Idx.current) return;

    lastSec5Idx.current = nextIdx;

    if (
      typeof window !== "undefined" &&
      typeof (window as any)._sec5GoTo === "function"
    ) {
      (window as any)._sec5GoTo(nextIdx);
    }
  }, []);

  useEffect(() => {
    if (!shouldLoadRest) return;

    const panels =
      trackRef.current?.querySelectorAll<HTMLElement>(
        ".about-stack-layer"
      );

    const s5Bg =
      scopeRef.current?.querySelector<HTMLElement>(".s5-bg");

    let isRunning = true;

    const isAndroid =
      typeof navigator !== "undefined" && /android/i.test(navigator.userAgent);

    // Ease factor to maintain steady momentum
    const EASE_FACTOR = isAndroid ? 0.05 : 0.08;

    // Hard velocity cap on animation progress per 16ms frame (0.25% max progress per frame)
    const MAX_PROGRESS_DELTA_PER_FRAME = isAndroid ? 0.0025 : 0.008;

    let lastTime = performance.now();

    const render = () => {
      if (!isRunning) return;

      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Filter touch acceleration spikes
      smoothedTargetProgress.current +=
        (targetProgress.current - smoothedTargetProgress.current) * (isAndroid ? 0.04 : 0.1);

      const dynamicEase = 1 - Math.exp(-EASE_FACTOR * 60 * dt);

      let delta =
        (smoothedTargetProgress.current - currentProgress.current) * dynamicEase;

      // Strict velocity clamp
      if (Math.abs(delta) > MAX_PROGRESS_DELTA_PER_FRAME) {
        delta = Math.sign(delta) * MAX_PROGRESS_DELTA_PER_FRAME;
      }

      currentProgress.current += delta;
      const p = currentProgress.current;

      const { vh, totalScrollable } = scrollMetricsRef.current;
      const footerHeight = layer7Ref.current?.offsetHeight || vh;

      // Dynamically calculate footer scroll fraction based on actual footer pixel height
      const totalScrollableVh = totalScrollable / (vh || 1);
      const footerVhRatio = footerHeight / (vh || 1);

      // Proportionally calculate how much of the timeline the footer should consume
      const footerScrollFraction = Math.min(
        0.18,
        totalScrollableVh > 0 ? (footerVhRatio / totalScrollableVh) * 1.1 : 0.1
      );

      const footerStart = 1.0 - footerScrollFraction;
      const mainEnd = footerStart;

      // ─────────────────────────────────────
      // DYNAMIC TIMELINE ALLOCATION
      // ─────────────────────────────────────

      const s1Prog = mapRange(p, 0.0, mainEnd * 0.15);
      const s2Prog = mapRange(p, mainEnd * 0.15, mainEnd * 0.30);
      const s3EntranceProg = mapRange(p, mainEnd * 0.30, mainEnd * 0.45);
      const s3ExitProg = mapRange(p, mainEnd * 0.45, mainEnd * 0.60);
      const s5EntranceProg = mapRange(p, mainEnd * 0.60, mainEnd * 0.75);
      const s5ActiveProg = mapRange(p, mainEnd * 0.75, mainEnd);
      const footerProgress = mapRange(p, footerStart, 1.0);

      // ─────────────────────────────────────
      // PANELS
      // ─────────────────────────────────────

      if (panels && panels.length > 0) {
        // Section 1
        if (panels[1]) {
          const y = (1 - s1Prog) * 100;
          panels[1].style.transform = `translate3d(0, ${y}%, 0)`;
        }

        // Section 2
        if (panels[2]) {
          const y = (1 - s2Prog) * 100;
          panels[2].style.transform = `translate3d(0, ${y}%, 0)`;
        }

        // Section 3
        if (panels[3]) {
          const y = (1 - s3EntranceProg) * 100 - s3ExitProg * 110;
          panels[3].style.transform = `translate3d(0, ${y}%, 0)`;
        }

        // Section 4
        if (panels[4]) {
          const visible = p >= mainEnd * 0.45;
          panels[4].style.opacity = visible ? "1" : "0";
          panels[4].style.pointerEvents = visible ? "auto" : "none";
        }

        // Section 5
        if (panels[5]) {
          const y = (1 - s5EntranceProg) * 100;
          panels[5].style.transform = `translate3d(0, ${y}%, 0)`;
        }
      }

      // ─────────────────────────────────────
      // FOOTER (PROPORTIONAL SCROLL)
      // ─────────────────────────────────────

      if (layer7Ref.current) {
        const y = vh - footerHeight * footerProgress;
        layer7Ref.current.style.transform = `translate3d(0, ${y}px, 0)`;
      }

      // ─────────────────────────────────────
      // SECTION 5 BACKGROUND
      // ─────────────────────────────────────

      if (s5Bg) {
        const parallaxProg = mapRange(p, mainEnd * 0.60, mainEnd);
        s5Bg.style.transform = `translate3d(0, ${-parallaxProg * 50}%, 0)`;
      }

      // ─────────────────────────────────────
      // SECTION 5 STEPS
      // ─────────────────────────────────────

      if (p >= mainEnd * 0.75 && p < mainEnd) {
        setIsSectionFiveActive(true);

        if (s5ActiveProg < 0.33) {
          triggerSec5Hook(0);
        } else if (s5ActiveProg < 0.66) {
          triggerSec5Hook(1);
        } else {
          triggerSec5Hook(2);
        }
      } else if (p < mainEnd * 0.75) {
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

      targetProgress.current = clamp(relativeScroll / totalScrollable);
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

      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }

      if (lenis && typeof lenis.off === "function") {
        lenis.off("scroll", handleScroll);
      } else {
        window.removeEventListener("scroll", handleScroll);
      }

      if (typeof window !== "undefined") {
        delete (window as any)._sec5GoTo;
      }
    };
  }, [shouldLoadRest, smootherRef, triggerSec5Hook]);

  return (
    <div ref={scopeRef} className="w-full">
      <div
        ref={trackRef}
        className="about-track-container relative w-full"
        style={{ height: "480vh" }}
      >
        <div
          ref={fixedFrameRef}
          className="fixed top-0 left-0 w-full overflow-hidden z-10 h-dvh"
        >
          {/* HERO */}
          <div className="about-stack-layer absolute inset-0 w-full h-dvh z-10 transform-gpu will-change-transform backface-hidden">
            <Hero isMobile={true} />
          </div>

          {shouldLoadRest && (
            <>
              {/* SECTION 1 */}
              <div
                className="about-stack-layer absolute inset-0 w-full h-dvh z-20 transform-gpu will-change-transform backface-hidden"
                style={{ transform: "translate3d(0, 100%, 0)" }}
              >
                <SectionOne />
              </div>

              {/* SECTION 2 */}
              <div
                className="about-stack-layer absolute inset-0 w-full h-dvh z-30 transform-gpu will-change-transform backface-hidden"
                style={{ transform: "translate3d(0, 100%, 0)" }}
              >
                <SectionTwo />
              </div>

              {/* SECTION 3 */}
              <div
                className="about-stack-layer absolute inset-0 w-full h-dvh z-50 transform-gpu will-change-transform backface-hidden"
                style={{ transform: "translate3d(0, 100%, 0)" }}
              >
                <SectionThree />
              </div>

              {/* SECTION 4 */}
              <div className="about-stack-layer absolute inset-0 w-full h-dvh z-40 transform-gpu opacity-0 pointer-events-none backface-hidden">
                <SectionFour />
              </div>

              {/* SECTION 5 */}
              <div
                className="about-stack-layer absolute inset-0 w-full h-dvh z-[60] transform-gpu will-change-transform backface-hidden"
                style={{ transform: "translate3d(0, 100%, 0)" }}
              >
                <SectionFive isActive={isSectionFiveActive} />
              </div>

              {/* FOOTER */}
              <div
                ref={layer7Ref}
                className="layer-auto-height transform-gpu absolute left-0 top-0 w-full z-[151] will-change-transform backface-hidden"
                style={{ transform: "translate3d(0, 100dvh, 0)" }}
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