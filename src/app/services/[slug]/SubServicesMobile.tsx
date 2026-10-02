"use client";

import dynamic from "next/dynamic";
import { useRef, useEffect, useCallback } from "react";
import SubServiceHero from "@/src/components/Service/SubServiceHero";
import { useSite } from "@/src/app/context/SiteContext";
import { useHeroIntro } from "@/src/app/utils/useHeroIntro";
import { restoreTextReveal } from "@/src/app/utils/useTextReveal";
import { FullServiceData } from "./data";
import { prefersReducedMotion, settleReducedMotion } from "../../../lib/reducedMotion";

const SubServiceSectionOne = dynamic(() => import("@/src/components/Service/SubServiceSectionOne"));
const SubServiceFAQSection = dynamic(() => import("@/src/components/Service/SubServiceFAQSection"));
const Appsection = dynamic(() => import("@/src/components/Projects/Appsection"));
const SectionCTA = dynamic(() => import("@/src/components/SectionCTA"));
const Footer = dynamic(() => import("@/src/components/Footer"));

const clamp = (val: number, min = 0, max = 1) => Math.min(Math.max(val, min), max);

// Original timeline: 8 steps.
//   0-1 Hero | 1-2 Sec1 slide | 2-5 Sec1 expand | 5-7 App+FAQ travel | 7-8 Footer
const ORIGINAL_TOTAL_STEPS = 8.0;

// Pinned scene ends when App + FAQ have fully travelled (old footer start, step 7.0).
// CTA + Footer now live in normal document flow after the pinned track.
const PIN_END_STEP = 7.0;
const PIN_END_P = PIN_END_STEP / ORIGINAL_TOTAL_STEPS;

// Short hold at the end of the pin so the smoothed animation finishes
// BEFORE the pin releases and the CTA scrolls in. Set to 0 to disable.
const HOLD_VH = 40;

// Initial track height (before measuring), assuming App = FAQ = Footer = 1 viewport.
// Same formula as updateMetrics: PIN_END_P * (4vh + app + faq + footer) + hold + 1vh
const INITIAL_TRACK_HEIGHT_VH = PIN_END_P * 7 * 100 + HOLD_VH + 100;

type SubServicesMobileProps = {
  pageData: FullServiceData;
};

export default function SubServicesMobile({ pageData }: SubServicesMobileProps) {
  const scopeRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fixedFrameRef = useRef<HTMLDivElement>(null);

  const heroPanelRef = useRef<HTMLDivElement>(null);
  const sectionOneRef = useRef<HTMLDivElement>(null);
  const appFaqLayerRef = useRef<HTMLDivElement>(null);
  const appSectionRef = useRef<HTMLDivElement>(null);
  const faqSectionRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  // Cached DOM references
  const heroTextWrapRef = useRef<HTMLElement | null>(null);
  const heroTopLayerRef = useRef<HTMLElement | null>(null);
  const heroBgRef = useRef<HTMLElement | null>(null);

  const s10ParaTopRef = useRef<HTMLElement | null>(null);
  const s10TitleRef = useRef<HTMLElement | null>(null);
  const s10ImgInnerWrapRef = useRef<HTMLElement | null>(null);
  const s10ImgElementRef = useRef<HTMLElement | null>(null);
  const seqContainerRef = useRef<HTMLElement | null>(null);

  // Cached layout metrics
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

  const { smootherRef } = useSite();
  const { introDone, preloaderDone, shouldLoadRest } = useHeroIntro(scopeRef, {
    isMobile: true,
    introDurationMs: 2800,
    unlockScrollEarlyMs: 1800,
  });

  // Prevent scroll jumps on refresh
  useEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    if (!introDone) return;
    return () => {
      if (scopeRef.current) {
        restoreTextReveal(scopeRef.current, ".s2-reveal-text");
      }
    };
  }, [introDone]);

  // Cache target DOM elements once shouldLoadRest is true
  useEffect(() => {
    if (!shouldLoadRest || !scopeRef.current) return;

    const scope = scopeRef.current;
    heroTextWrapRef.current = scope.querySelector<HTMLElement>(".hero-text-wrap");
    heroTopLayerRef.current = scope.querySelector<HTMLElement>(".services-hero-top-layer");
    heroBgRef.current = scope.querySelector<HTMLElement>(".service-hero-bg");

    s10ParaTopRef.current = scope.querySelector<HTMLElement>(".s10-para-top");
    s10TitleRef.current = scope.querySelector<HTMLElement>(".s10-title");
    s10ImgInnerWrapRef.current = scope.querySelector<HTMLElement>(".s10-img-inner-wrap");
    s10ImgElementRef.current = scope.querySelector<HTMLElement>(".s10-img-element");
    seqContainerRef.current = scope.querySelector<HTMLElement>(".s10-seq-container");
  }, [shouldLoadRest]);

  // Manage smooth scroller state
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

  // Measure dynamic heights and offsets
  const updateMetrics = useCallback(() => {
    if (!trackRef.current) return;

    const vh = window.innerHeight;
    const vw = window.innerWidth;

    const appHeight = appSectionRef.current?.offsetHeight || vh;
    const faqHeight = faqSectionRef.current?.offsetHeight || vh;
    const footerHeight = footerRef.current?.offsetHeight || vh;

    // Same scroll distance per progress unit as before (4vh + App + FAQ + Footer),
    // but the track now only covers the pinned part (p = 0 -> PIN_END_P).
    const fullScrollable = vh * 4 + appHeight + faqHeight + footerHeight;
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

    // App / FAQ / Footer heights drive scroll speed (as before), so re-measure when they load/change
    const resizeObserver = new ResizeObserver(() => updateMetrics());
    if (appSectionRef.current) resizeObserver.observe(appSectionRef.current);
    if (faqSectionRef.current) resizeObserver.observe(faqSectionRef.current);
    if (footerRef.current) resizeObserver.observe(footerRef.current);

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("orientationchange", updateMetrics, { passive: true });

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", updateMetrics);
    };
  }, [shouldLoadRest, updateMetrics, handleResize]);

  // Smooth Easing & Render Loop
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

      const currentProg = currentProgress.current;
      // Same step mapping as before (p is scaled to 0 -> PIN_END_P)
      const stepProgress = currentProg * ORIGINAL_TOTAL_STEPS;

      const { vh } = scrollMetricsRef.current;
      const appHeight = appSectionRef.current?.offsetHeight || vh;
      const faqHeight = faqSectionRef.current?.offsetHeight || vh;

      // STEP 1: Hero Top Layer Clip & Text Fade (0.0 -> 1.0)
      const heroPhase1Prog = clamp(stepProgress / 1.0);

      if (heroTextWrapRef.current) {
        heroTextWrapRef.current.style.opacity = `${1 - heroPhase1Prog}`;
        heroTextWrapRef.current.style.transform = `translate3d(0, ${-30 * heroPhase1Prog}px, 0)`;
        heroTextWrapRef.current.style.visibility = heroPhase1Prog >= 1 ? "hidden" : "visible";
      }

      if (heroTopLayerRef.current) {
        const bottomInset = heroPhase1Prog * 100;
        heroTopLayerRef.current.style.clipPath = `inset(0% 0% ${bottomInset}% 0%)`;
      }

      if (heroBgRef.current) {
        const bgScale = 1.1 - heroPhase1Prog * 0.1;
        heroBgRef.current.style.transform = `scale(${bgScale})`;
      }

      // STEP 2: Section One Slides Up (1.0 -> 2.0)
      const s1Prog = clamp(stepProgress - 1.0);
      if (sectionOneRef.current) {
        sectionOneRef.current.style.transform = `translate3d(0, ${(1 - s1Prog) * 100}%, 0)`;
      }

      if (heroPanelRef.current && s1Prog > 0) {
        heroPanelRef.current.style.transform = `translate3d(0, ${-s1Prog * 15}%, 0)`;
      }

      // STEP 3: Section One Content Expansion (2.0 -> 5.0)
      if (stepProgress < 2.0) {
        if (s10ParaTopRef.current) {
          s10ParaTopRef.current.style.opacity = "1";
          s10ParaTopRef.current.style.transform = "translate3d(0, 0px, 0)";
        }
        if (s10TitleRef.current) {
          s10TitleRef.current.style.opacity = "1";
          s10TitleRef.current.style.transform = "translate3d(0, 0px, 0)";
        }
        if (s10ImgInnerWrapRef.current) {
          s10ImgInnerWrapRef.current.style.right = "4vw";
          s10ImgInnerWrapRef.current.style.bottom = "10vh";
          s10ImgInnerWrapRef.current.style.width = "calc(100vw - 8vw)";
          s10ImgInnerWrapRef.current.style.height = "220px";
        }
        if (s10ImgElementRef.current) {
          s10ImgElementRef.current.style.transform = "scale(1.15)";
        }
        if (seqContainerRef.current) {
          seqContainerRef.current.style.transform = "translate3d(0, 0px, 0)";
        }
      } else {
        const expandProg = clamp((stepProgress - 2.0) / 1.0);

        if (s10ParaTopRef.current) {
          s10ParaTopRef.current.style.opacity = `${1 - expandProg}`;
          s10ParaTopRef.current.style.transform = `translate3d(0, ${-35 * expandProg}px, 0)`;
        }
        if (s10TitleRef.current) {
          s10TitleRef.current.style.opacity = `${1 - expandProg}`;
          s10TitleRef.current.style.transform = `translate3d(0, ${-35 * expandProg}px, 0)`;
        }

        if (s10ImgInnerWrapRef.current) {
          const currentRight = (1 - expandProg) * 4;
          const currentBottom = (1 - expandProg) * 10;
          s10ImgInnerWrapRef.current.style.right = `${currentRight}vw`;
          s10ImgInnerWrapRef.current.style.bottom = `${currentBottom}vh`;
          s10ImgInnerWrapRef.current.style.width = `calc((100vw - 8vw) + 8vw * ${expandProg})`;
          s10ImgInnerWrapRef.current.style.height = `calc(220px + (100vh - 220px) * ${expandProg})`;
        }

        if (s10ImgElementRef.current) {
          const innerScale = 1.15 - expandProg * 0.15;
          s10ImgElementRef.current.style.transform = `scale(${innerScale})`;
        }

        if (seqContainerRef.current) {
          const textProg = clamp((stepProgress - 3.0) / 2.0);
          const seqY = -textProg * 1440;
          seqContainerRef.current.style.transform = `translate3d(0, ${seqY}px, 0)`;
        }
      }

      // STEP 4: APP + FAQ Continuous Layer Translation (5.0 -> 7.0)
      const appFaqProg = clamp((stepProgress - 5.0) / 2.0);
      if (appFaqLayerRef.current) {
        const totalContentTravel = appHeight + faqHeight;
        const targetOffset = totalContentTravel > vh ? -(totalContentTravel - vh) : 0;
        const startY = vh;
        const currentY = startY + (targetOffset - startY) * appFaqProg;
        appFaqLayerRef.current.style.transform = `translate3d(0, ${currentY}px, 0)`;
      }

      if (sectionOneRef.current && appFaqProg > 0) {
        sectionOneRef.current.style.transform = `translate3d(0, ${-appFaqProg * 15}%, 0)`;
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
    };
  }, [shouldLoadRest, smootherRef]);

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
          {/* Layer 1: Hero */}
          <div
            ref={heroPanelRef}
            className="subservice-hero-panel absolute inset-0 w-full h-svh z-10 transform-gpu will-change-transform backface-hidden"
          >
            <SubServiceHero data={pageData.hero} isMobile={true} />
          </div>

          {/* DOWNSTREAM SECTIONS */}
          {shouldLoadRest && (
            <>
              {/* Layer 2: Section One */}
              <div
                ref={sectionOneRef}
                className="about-stack-layer absolute inset-0 w-full h-svh z-20 transform-gpu will-change-transform backface-hidden"
                style={{ transform: "translate3d(0, 100%, 0)" }}
              >
                <SubServiceSectionOne data={pageData.sectionOne} />
              </div>

              {/* Layer 3: App + FAQ continuous layer */}
              <div
                ref={appFaqLayerRef}
                className="layer-auto-height transform-gpu absolute left-0 top-0 w-full z-30 will-change-transform backface-hidden pointer-events-auto"
                style={{ transform: "translate3d(0, 100svh, 0)" }}
              >
                <div ref={appSectionRef} className="w-full bg-[#162D24]">
                  <Appsection />
                </div>

                <div ref={faqSectionRef} className="w-full bg-[#162D24]">
                  <SubServiceFAQSection data={pageData.sectionTwo} />
                </div>
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