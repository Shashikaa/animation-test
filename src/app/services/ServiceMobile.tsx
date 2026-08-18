"use client";

import dynamic from "next/dynamic";
import { useRef, useEffect, useState, useCallback } from "react";
import Hero from "@/src/components/Service/Hero";
import { useSite } from "@/src/app/context/SiteContext";
import { useHeroIntro } from "@/src/app/utils/useHeroIntro";

const SectionOne = dynamic(() => import("@/src/components/Service/SectionOne"));
const SectionTwo = dynamic(() => import("@/src/components/Service/SectionTwo"));
const Appsection = dynamic(() => import("@/src/components/Appsection"));
const Footer = dynamic(() => import("@/src/components/Footer"));

const clamp = (val: number, min = 0, max = 1) => Math.min(Math.max(val, min), max);

export default function ServicesMobile() {
  const scopeRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fixedFrameRef = useRef<HTMLDivElement>(null);

  const heroPanelRef = useRef<HTMLDivElement>(null);
  const sectionOneRef = useRef<HTMLDivElement>(null);
  const sectionTwoRef = useRef<HTMLDivElement>(null);
  const appSecRef = useRef<HTMLDivElement>(null);
  const footerLayerRef = useRef<HTMLDivElement>(null);

  const [isSectionTwoActive, setIsSectionTwoActive] = useState(false);

  const scrollMetricsRef = useRef({ totalScrollable: 0, vh: 0, trackTopOffset: 0 });
  const lastSizeRef = useRef({ width: 0, height: 0 });

  const currentProgress = useRef(0);
  const targetProgress = useRef(0);
  const rafId = useRef<number | null>(null);
  const lastSec2Idx = useRef<number>(-1);

  const { smootherRef } = useSite();
  const { preloaderDone, shouldLoadRest } = useHeroIntro(scopeRef, {
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
    const footerHeight = footerLayerRef.current?.offsetHeight || vh;

    // Total track height = 1.0 Hero + 1.0 Sec1 + 2.0 Sec2 + AppHeight + FooterHeight
    const totalTrackHeight = vh * 4.0 + appHeight + footerHeight;

    trackRef.current.style.height = `${totalTrackHeight}px`;

    const rect = trackRef.current.getBoundingClientRect();

    scrollMetricsRef.current = {
      totalScrollable: Math.max(0, totalTrackHeight - vh),
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

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("orientationchange", updateMetrics, { passive: true });

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", updateMetrics);
    };
  }, [shouldLoadRest, updateMetrics, handleResize]);

  useEffect(() => {
    if (!shouldLoadRest) return;

    let isRunning = true;

    const isAndroid = typeof navigator !== "undefined" && /android/i.test(navigator.userAgent);
    const EASE_FACTOR = isAndroid ? 0.08 : 0.08;
    const MAX_PROGRESS_DELTA_PER_FRAME = 0.01;

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

      // Total timeline steps: Hero (1.0) + Sec1 (1.0) + Sec2 (2.0) + App (1.0) + Footer (1.0) = 6.0
      const totalSteps = 6.0;
      const stepProgress = p * totalSteps;

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

      // --- STEP 5: FOOTER REVEAL (5.0 -> 6.0) ---
      const footerProg = clamp(stepProgress - 5.0);
      if (footerLayerRef.current) {
        const footerHeight = footerLayerRef.current.offsetHeight || vh;
        const translateY = vh - footerHeight * footerProg;
        footerLayerRef.current.style.transform = `translate3d(0, ${translateY}px, 0)`;
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
      if (rafId.current) cancelAnimationFrame(rafId.current);
      if (lenis && typeof lenis.off === "function") {
        lenis.off("scroll", handleScroll);
      } else {
        window.removeEventListener("scroll", handleScroll);
      }
      if (typeof window !== "undefined") delete (window as any)._sec2GoTo;
    };
  }, [shouldLoadRest, smootherRef, triggerSec2Hook]);

  return (
    <div ref={scopeRef} className="w-full bg-[#162D24]">
      <div ref={trackRef} className="services-track-container relative w-full">
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

              {/* Layer 5: Footer Wrapper Frame */}
              <div
                ref={footerLayerRef}
                className="layer-auto-height transform-gpu absolute left-0 top-0 w-full z-[151] will-change-transform backface-hidden"
                style={{ transform: "translate3d(0, 100svh, 0)" }}
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