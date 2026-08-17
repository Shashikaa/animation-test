"use client";

import dynamic from "next/dynamic";
import { useState, useRef, useEffect, useCallback } from "react";
import SubServiceHero from "@/src/components/Service/SubServiceHero";
import { useSite } from "@/src/app/context/SiteContext";
import { useHeroIntro } from "@/src/app/utils/useHeroIntro";
import { restoreTextReveal } from "@/src/app/utils/useTextReveal";
import { FullServiceData } from "./data";

const SubServiceSectionOne = dynamic(() => import("@/src/components/Service/SubServiceSectionOne"));
const SubServiceFAQSection = dynamic(() => import("@/src/components/Service/SubServiceFAQSection"));
const Footer = dynamic(() => import("@/src/components/Footer"));

const clamp = (val: number, min = 0, max = 1) => Math.min(Math.max(val, min), max);

type SubServicesMobileProps = {
  pageData: FullServiceData;
};

export default function SubServicesMobile({ pageData }: SubServicesMobileProps) {
  const scopeRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fixedFrameRef = useRef<HTMLDivElement>(null);

  const heroPanelRef = useRef<HTMLDivElement>(null);
  const sectionOneRef = useRef<HTMLDivElement>(null);
  const faqSectionRef = useRef<HTMLDivElement>(null);
  const footerLayerRef = useRef<HTMLDivElement>(null);

  // Cached DOM references
  const heroTextWrapRef = useRef<HTMLElement | null>(null);
  const heroTopLayerRef = useRef<HTMLElement | null>(null);
  const heroBgRef = useRef<HTMLElement | null>(null);

  const s10ParaTopRef = useRef<HTMLElement | null>(null);
  const s10TitleRef = useRef<HTMLElement | null>(null);
  const s10ImgInnerWrapRef = useRef<HTMLElement | null>(null);
  const s10ImgElementRef = useRef<HTMLElement | null>(null);
  const seqContainerRef = useRef<HTMLElement | null>(null);

  // Cached layout metrics to eliminate forced reflows during scroll
  const scrollMetricsRef = useRef({
    totalScrollable: 0,
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

  // Measure dynamic heights and offsets (About Page style logic)
  const updateMetrics = useCallback(() => {
    if (!trackRef.current) return;

    const vh = window.innerHeight;
    const vw = window.innerWidth;

    // Calculate dynamic height based on auto-height elements
    const faqHeight = faqSectionRef.current?.offsetHeight || vh;
    const footerHeight = footerLayerRef.current?.offsetHeight || vh;

    // 6 Full Viewport Steps + Dynamic Tail Heights for FAQ & Footer
    const totalTrackHeight = vh * 5 + faqHeight + footerHeight;
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

  // Smooth Easing & Render Loop with Velocity Cap logic
  useEffect(() => {
    if (!shouldLoadRest) return;

    let isRunning = true;

    const isAndroid = typeof navigator !== "undefined" && /android/i.test(navigator.userAgent);
const EASE_FACTOR = isAndroid ? 0.06 : 0.06;
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
      const totalSteps = 7.0;
      const stepProgress = currentProg * totalSteps;

      const { vh } = scrollMetricsRef.current;
      const faqHeight = faqSectionRef.current?.offsetHeight || vh;
      const footerHeight = footerLayerRef.current?.offsetHeight || vh;

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
          const seqY = -textProg * 1240;
          seqContainerRef.current.style.transform = `translate3d(0, ${seqY}px, 0)`;
        }
      }

      // STEP 4: FAQ Section Reveal (5.0 -> 6.0)
      const faqProg = clamp(stepProgress - 5.0);
      if (faqSectionRef.current) {
        const startY = vh;
        const endY = -(faqHeight - vh);
        const currentY = startY + (endY - startY) * faqProg;
        faqSectionRef.current.style.transform = `translate3d(0, ${currentY}px, 0)`;
      }

      if (sectionOneRef.current && faqProg > 0) {
        sectionOneRef.current.style.transform = `translate3d(0, ${-faqProg * 15}%, 0)`;
      }

      // STEP 5: Footer Reveal (6.0 -> 7.0)
      const footerProg = clamp(stepProgress - 6.0);
      if (footerLayerRef.current) {
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
    };
  }, [shouldLoadRest, smootherRef]);

  return (
    <div ref={scopeRef} className="w-full bg-[#162D24]">
      <div ref={trackRef} className="services-track-container relative w-full">
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

              {/* Layer 3: Dynamic FAQ Section */}
              <div
                ref={faqSectionRef}
                className="layer-auto-height transform-gpu absolute left-0 top-0 w-full z-30 will-change-transform backface-hidden"
                style={{ transform: "translate3d(0, 100svh, 0)" }}
              >
                <SubServiceFAQSection data={pageData.sectionTwo} />
              </div>

              {/* Layer 4: Footer */}
              <div
                ref={footerLayerRef}
                className="layer-auto-height transform-gpu absolute left-0 top-0 w-full z-[95] will-change-transform backface-hidden"
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