"use client";

import dynamic from "next/dynamic";
import { useRef, useEffect, useState, useCallback } from "react";
import Hero from "@/src/components/Service/Hero";
import { useSite } from "@/src/app/context/SiteContext";
import { useHeroIntro } from "@/src/app/utils/useHeroIntro";
import { prefersReducedMotion, settleReducedMotion } from "../../lib/reducedMotion";

const SectionOne = dynamic(() => import("@/src/components/Service/SectionOne"));
const SectionTwo = dynamic(() => import("@/src/components/Service/SectionTwo"));
const Appsection = dynamic(() => import("@/src/components/Appsection"));
const SectionCTA = dynamic(() => import("@/src/components/SectionCTA"));
const Footer = dynamic(() => import("@/src/components/Footer"));

const clamp = (val: number, min = 0, max = 1) => Math.min(Math.max(val, min), max);

// Original timeline: 6 steps, Hero(1) + Sec1(1) + Sec2(2) + App(1) + Footer(1)
const ORIGINAL_TOTAL_STEPS = 6.0;

// Pinned scene ends when the App section is fully in place (old footer start, step 5.0).
// CTA + Footer now live in normal document flow after the pinned track.
const PIN_END_STEP = 5.0;
const PIN_END_P = PIN_END_STEP / ORIGINAL_TOTAL_STEPS;

// Short hold at the end of the pin so the smoothed animation finishes
// BEFORE the pin releases and the CTA scrolls in. Set to 0 to disable.
const HOLD_VH = 40;

// Initial track height (before measuring), assuming App = Footer = 1 viewport.
// Same formula as updateMetrics: PIN_END_P * (3vh + app + footer) + hold + 1vh
const INITIAL_TRACK_HEIGHT_VH = PIN_END_P * 5 * 100 + HOLD_VH + 100;

export default function ServicesMobile() {
  const scopeRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fixedFrameRef = useRef<HTMLDivElement>(null);

  const heroPanelRef = useRef<HTMLDivElement>(null);
  const sectionOneRef = useRef<HTMLDivElement>(null);
  const sectionTwoRef = useRef<HTMLDivElement>(null);
  const appSecRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  const [isSectionTwoActive, setIsSectionTwoActive] = useState(false);

  const scrollMetricsRef = useRef({
    totalScrollable: 0,
    animScrollable: 0,
    vh: 0,
    trackTopOffset: 0,
  });
  const lastSizeRef = useRef({ width: 0, height: 0 });

  const currentProgress = useRef(0);
  const targetProgress = useRef(0);
  const rafId = useRef<number | null>(null);
  const lastSec2Idx = useRef<number>(-1);

  const { smootherRef } = useSite();
  const { introDone, preloaderDone, shouldLoadRest } = useHeroIntro(scopeRef, {
    isMobile: true,
    introDurationMs: 2800,
    unlockScrollEarlyMs: 1800,
  });

  const triggerSec2Hook = useCallback((nextIdx: number) => {
    if (nextIdx !== lastSec2Idx.current) {
      lastSec2Idx.current = nextIdx;
      if (typeof window !== "undefined" && typeof (window as any)._sec2GoTo === "function") {
        (window as any)._sec2GoTo(nextIdx);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    const lenis = smootherRef?.current;

    if (!preloaderDone || !shouldLoadRest) {
      if (lenis && typeof lenis.stop === "function") lenis.stop();
      targetProgress.current = 0;
      currentProgress.current = 0;
    } else {
      document.body.classList.remove("preloading");
      document.documentElement.classList.remove("preloading");

      if (lenis) {
        if (typeof lenis.resize === "function") lenis.resize();
        if (typeof lenis.start === "function") lenis.start();
      }

      requestAnimationFrame(() => {
        window.dispatchEvent(new Event("scroll"));
      });
    }
  }, [preloaderDone, shouldLoadRest, smootherRef]);

  // Dynamic track height calculation
  const updateMetrics = useCallback(() => {
    if (!trackRef.current) return;

    const vh = window.innerHeight;
    const vw = window.innerWidth;

    const appHeight = appSecRef.current?.offsetHeight || vh;
    const footerHeight = footerRef.current?.offsetHeight || vh;

    // Same scroll distance per progress unit as before (3vh + App + Footer),
    // but the track now only covers the pinned part (p = 0 -> PIN_END_P).
    const fullScrollable = vh * 3.0 + appHeight + footerHeight;
    const animScrollable = PIN_END_P * fullScrollable;
    const holdPx = (HOLD_VH / 100) * vh;
    const totalScrollable = animScrollable + holdPx;

    trackRef.current.style.height = `${totalScrollable + vh}px`;

    const rect = trackRef.current.getBoundingClientRect();

    scrollMetricsRef.current = {
      totalScrollable: Math.max(0, totalScrollable),
      animScrollable: Math.max(1, animScrollable),
      vh,
      trackTopOffset: window.scrollY + rect.top,
    };

    lastSizeRef.current = { width: vw, height: vh };
  }, []);

  const handleResize = useCallback(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const { width, height } = lastSizeRef.current;

    const isLikelyAddressBarToggle = vw === width && Math.abs(vh - height) < 150;
    if (isLikelyAddressBarToggle) return;

    updateMetrics();
  }, [updateMetrics]);

  useEffect(() => {
    if (!shouldLoadRest) return;

    updateMetrics();

    // App + Footer heights drive scroll speed (as before), so re-measure when they load/change
    const resizeObserver = new ResizeObserver(() => updateMetrics());
    if (appSecRef.current) resizeObserver.observe(appSecRef.current);
    if (footerRef.current) resizeObserver.observe(footerRef.current);

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("orientationchange", updateMetrics, { passive: true });

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", updateMetrics);
    };
  }, [shouldLoadRest, updateMetrics, handleResize]);

  useEffect(() => {
    if (!shouldLoadRest) return;

    let isRunning = true;
    // Reduced motion: skip the pinned scroll-scrub entirely and leave content
    // settled and visible. The CSS media query alone cannot stop this rAF loop.
    if (prefersReducedMotion()) {
      isRunning = false;
      settleReducedMotion(scopeRef.current);
      return;
    }


    const EASE_FACTOR = 0.06;
    const MAX_PROGRESS_DELTA_PER_FRAME = 0.006;

    let lastTime = performance.now();

    const render = () => {
      if (!isRunning) return;

      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const dynamicEase = 1 - Math.exp(-EASE_FACTOR * 60 * dt);

      let delta = (targetProgress.current - currentProgress.current) * dynamicEase;

      if (Math.abs(delta) > MAX_PROGRESS_DELTA_PER_FRAME) {
        delta = Math.sign(delta) * MAX_PROGRESS_DELTA_PER_FRAME;
      }

      currentProgress.current += delta;

      const p = currentProgress.current;

      // Same step mapping as before (p is scaled to 0 -> PIN_END_P)
      const stepProgress = p * ORIGINAL_TOTAL_STEPS;

      const { vh } = scrollMetricsRef.current;

      // --- STEP 1: COMPRESS HERO TOP LAYER (0.0 -> 1.0) ---
      const heroTextWrap = scopeRef.current?.querySelector<HTMLElement>(".hero-text-wrap");
      const heroBtn = scopeRef.current?.querySelector<HTMLElement>(".hero-btn");
      const heroTopLayer = scopeRef.current?.querySelector<HTMLElement>(".services-hero-top-layer");
      const serviceHeroBg = scopeRef.current?.querySelector<HTMLElement>(".service-hero-bg");

      const step1Prog = clamp(stepProgress / 1.0);

      if (heroTextWrap) {
        heroTextWrap.style.transform = `translate3d(0, ${-vh * step1Prog}px, 0)`;
        heroTextWrap.style.opacity = `${1 - step1Prog}`;
      }
      if (heroBtn) {
        heroBtn.style.transform = `translate3d(0, ${-vh * step1Prog}px, 0)`;
        heroBtn.style.opacity = `${1 - step1Prog}`;
      }
      if (heroTopLayer) {
        const bottomInset = step1Prog * 60;
        heroTopLayer.style.clipPath = `inset(0px 0px ${bottomInset}% 0px)`;
      }
      if (serviceHeroBg) {
        serviceHeroBg.style.transform = `translate3d(0, ${-120 * step1Prog}px, 0)`;
      }

      // --- STEP 2: SECTION ONE SLIDES UP OVER HERO (1.0 -> 2.0) ---
      const step2Prog = clamp(stepProgress - 1.0);
      if (sectionOneRef.current) {
        sectionOneRef.current.style.transform = `translate3d(0, ${(1 - step2Prog) * 100}%, 0)`;
      }
      if (heroPanelRef.current && step2Prog > 0) {
        heroPanelRef.current.style.transform = `translate3d(0, ${-step2Prog * 15}%, 0)`;
      }

      // --- STEP 3: SECTION TWO SLIDES UP & CYCLES SLIDES (2.0 -> 4.0) ---
      const entryProg = clamp(stepProgress - 2.0);

      if (sectionTwoRef.current) {
        sectionTwoRef.current.style.transform = `translate3d(0, ${(1 - entryProg) * 100}%, 0)`;
      }
      if (sectionOneRef.current && entryProg > 0) {
        sectionOneRef.current.style.transform = `translate3d(0, ${-entryProg * 15}%, 0)`;
      }

      if (stepProgress >= 2.0 && stepProgress < 4.0) {
        setIsSectionTwoActive(true);

        // Slide 0 remains active while sliding up (2.0 -> 3.0) and during buffer (3.0 -> 3.25)
        if (stepProgress < 3.25) {
          triggerSec2Hook(0);
        } else if (stepProgress < 3.65) {
          // Slide 1 stays active across equal scroll distance (3.25 -> 3.65)
          triggerSec2Hook(1);
        } else {
          // Slide 2 stays active until Section Two begins exiting (3.65 -> 4.0)
          triggerSec2Hook(2);
        }
      } else if (stepProgress < 2.0) {
        setIsSectionTwoActive(false);
        triggerSec2Hook(0);
      }

      // --- STEP 4: APP SECTION SLIDES UP (4.0 -> 5.0) ---
      const appProg = clamp(stepProgress - 4.0);
      if (appSecRef.current) {
        const appHeight = appSecRef.current.offsetHeight || vh;
        const startY = vh;
        const endY = -(appHeight - vh);
        const currentY = startY + (endY - startY) * appProg;
        appSecRef.current.style.transform = `translate3d(0, ${currentY}px, 0)`;
      }
      if (sectionTwoRef.current && appProg > 0) {
        sectionTwoRef.current.style.transform = `translate3d(0, ${-appProg * 15}%, 0)`;
      }

      // CTA & Footer now live in normal document flow below the pinned track.

      rafId.current = requestAnimationFrame(render);
    };

    const handleScroll = (e?: any) => {
      const lenis = smootherRef?.current;
      const scrollY = e?.scroll ?? lenis?.scroll ?? window.scrollY;
      const { totalScrollable, animScrollable, trackTopOffset } = scrollMetricsRef.current;

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

      // Animation completes after `animScrollable` (p = PIN_END_P); the remaining
      // HOLD_VH is a hold so smoothing catches up before the pin releases.
      targetProgress.current = clamp(relativeScroll / animScrollable) * PIN_END_P;
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
      if (typeof window !== "undefined") delete (window as any)._sec2GoTo;
    };
  }, [shouldLoadRest, smootherRef, triggerSec2Hook]);

  const isReady = preloaderDone && introDone;

  return (
    <div ref={scopeRef} className="w-full bg-[#162D24]">
      <div
        ref={trackRef}
        className="services-track-container relative w-full gp-pin-track"
        style={{ height: `${INITIAL_TRACK_HEIGHT_VH}vh` }}
      >
        <div
          ref={fixedFrameRef}
          className="fixed top-0 left-0 w-full overflow-hidden bg-[#162D24] z-10 h-svh"
        >
          {/* Layer 1: Hero Block */}
          <div
            ref={heroPanelRef}
            className="services-hero-panel absolute inset-0 w-full h-svh z-10 transform-gpu will-change-transform backface-hidden"
          >
            <Hero isMobile={true} />
          </div>

          {shouldLoadRest && (
            <>
              {/* Layer 2: Section One */}
              <div
                ref={sectionOneRef}
                className="about-stack-layer absolute inset-0 w-full h-svh z-20 transform-gpu will-change-transform backface-hidden"
                style={{ transform: "translate3d(0, 100%, 0)" }}
              >
                <SectionOne />
              </div>

              {/* Layer 3: Section Two Context */}
              <div
                ref={sectionTwoRef}
                className="about-stack-layer absolute inset-0 w-full h-svh z-30 transform-gpu will-change-transform backface-hidden"
                style={{ transform: "translate3d(0, 100%, 0)" }}
              >
                <SectionTwo isActive={isSectionTwoActive} />
              </div>

              {/* Layer 4: App Section Wrapper */}
              <div
                ref={appSecRef}
                className="layer-auto-height transform-gpu absolute left-0 top-0 w-full z-[35] will-change-transform backface-hidden"
                style={{ transform: "translate3d(0, 100svh, 0)" }}
              >
                <Appsection />
              </div>
            </>
          )}
        </div>
      </div>

      {/* STANDARD DOCUMENT FLOW FOR CTA AND FOOTER */}
      {shouldLoadRest && (
        <div
          className="relative z-20 w-full bg-[#162D24]"
          style={{ visibility: isReady ? "visible" : "hidden" }}
        >
          <SectionCTA preloaderDone={isReady} />
          <div ref={footerRef}>
            <Footer />
          </div>
        </div>
      )}
    </div>
  );
}