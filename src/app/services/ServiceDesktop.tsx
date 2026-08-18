"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useHeroIntro } from "@/src/app/utils/useHeroIntro";
import { useTextReveal, restoreTextReveal } from "@/src/app/utils/useTextReveal";
import Hero from "@/src/components/Service/Hero";
import SectionOne from "@/src/components/Service/SectionOne";
import SectionTwo from "@/src/components/Service/SectionTwo";
import Appsection from "@/src/components/Appsection";
import SectionCTA from "@/src/components/SectionCTA";
import Footer from "@/src/components/Footer";
import { useSite } from "@/src/app/context/SiteContext";

const TOTAL_SCROLL_STEPS = 12;

const easeOutQuad = (t: number) => t * (2 - t);

// Utility for DOM text line splitting matching parent implementations
function executeDesktopSplitting(selector: string) {
  const elements = document.querySelectorAll<HTMLElement>(selector);
  elements.forEach((element) => {
    if (!element || element.dataset.splitComplete === "true") return;

    const rawText = element.textContent || "";
    const linesArray = rawText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    element.innerHTML = "";
    linesArray.forEach((lineText) => {
      const wrapper = document.createElement("span");
      wrapper.className = "custom-line-wrap";
      wrapper.style.display = "block";
      wrapper.style.overflow = "hidden";
      wrapper.style.position = "relative";

      const inner = document.createElement("span");
      inner.className = "custom-line-inner";
      inner.style.display = "block";
      inner.style.transform = "translate3d(0, 100%, 0)";
      inner.style.opacity = "0";
      inner.textContent = lineText;

      wrapper.appendChild(inner);
      element.appendChild(wrapper);
    });

    element.dataset.splitComplete = "true";
  });
}

export default function ServicesDesktop() {
  const scopeRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fixedFrameRef = useRef<HTMLDivElement>(null);

  const layerCTA = useRef<HTMLDivElement>(null);
  const layerFooter = useRef<HTMLDivElement>(null);

  const scrollMetricsRef = useRef({
    ctaHeight: 0,
    footerHeight: 0,
    vh: 0,
    trackTopOffset: 0,
    totalScrollable: 0,
  });

  const lastSizeRef = useRef({ width: 0, height: 0 });

  const targetProgress = useRef(0);
  const smoothProgress = useRef(0);
  const rafId = useRef<number | null>(null);
  const lastSec2Idx = useRef<number>(-1);
  const revealedSections = useRef<Set<string>>(new Set());

  const [isSectionTwoActive, setIsSectionTwoActive] = useState(false);

  const { smootherRef } = useSite();
  const { introDone, preloaderDone, shouldLoadRest } = useHeroIntro(scopeRef, {
    isMobile: false,
    introDurationMs: 2800,
    unlockScrollEarlyMs: 1800,
  });

  // ── 1. UNLOCK LENIS / SCROLL ──
  useEffect(() => {
    const lenis = smootherRef?.current;

    if (!preloaderDone || !shouldLoadRest) {
      if (lenis && typeof lenis.stop === "function") lenis.stop();
      targetProgress.current = 0;
      smoothProgress.current = 0;
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

  // ── 2. CACHE METRICS TO PREVENT LAYOUT THRASHING ──
  const measure = useCallback(() => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const vh = window.innerHeight;
    const vw = window.innerWidth;

    scrollMetricsRef.current = {
      ctaHeight: layerCTA.current?.offsetHeight || vh,
      footerHeight: layerFooter.current?.offsetHeight || layerFooter.current?.scrollHeight || vh,
      vh,
      trackTopOffset: window.scrollY + rect.top,
      totalScrollable: rect.height - vh,
    };

    lastSizeRef.current = { width: vw, height: vh };
  }, []);

  const handleResize = useCallback(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const { width, height } = lastSizeRef.current;

    if (vw === width && Math.abs(vh - height) < 150) return;

    measure();
  }, [measure]);

  useEffect(() => {
    if (!shouldLoadRest) return;
    measure();

    const resizeObserver = new ResizeObserver(() => measure());
    if (layerCTA.current) resizeObserver.observe(layerCTA.current);
    if (layerFooter.current) resizeObserver.observe(layerFooter.current);

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("orientationchange", measure, { passive: true });

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", measure);
    };
  }, [shouldLoadRest, measure, handleResize]);

  // ── 3. TEXT REVEAL LOGIC & PREPARATION ──
  const triggerPlayOnceTextReveal = useCallback((
    containerSelector: string,
    currentStepProg: number,
    triggerThreshold: number
  ) => {
    if (!scopeRef.current) return;

    const key = containerSelector;
    if (revealedSections.current.has(key)) return;

    if (currentStepProg >= triggerThreshold) {
      revealedSections.current.add(key);

      const lineInners = scopeRef.current.querySelectorAll<HTMLElement>(
        `${containerSelector} .gs-line-inner, ${containerSelector} .custom-line-inner`
      );

      lineInners.forEach((el, idx) => {
        el.style.transition = `transform 0.85s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 0.05}s, opacity 0.85s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 0.05}s`;
        el.style.transform = "translate3d(0, 0%, 0)";
        el.style.opacity = "1";
      });
    }
  }, []);

  useEffect(() => {
    if (!shouldLoadRest || !scopeRef.current) return;

    // Split paragraphs across all animated sections
    executeDesktopSplitting(".scroll-para-1");
    executeDesktopSplitting(".section-one-wrap .reveal-text");
    executeDesktopSplitting(".services-section-two-wrap .reveal-text");
    executeDesktopSplitting(".services-appsec-wrap .reveal-text");

    useTextReveal(scopeRef, ".section-one-wrap .reveal-text");
    useTextReveal(scopeRef, ".services-section-two-wrap .reveal-text");
    useTextReveal(scopeRef, ".services-appsec-wrap .reveal-text");

    return () => {
      if (scopeRef.current) {
        restoreTextReveal(scopeRef.current, ".scroll-para-1");
        restoreTextReveal(
          scopeRef.current,
          [
            ".section-one-wrap .reveal-text",
            ".services-section-two-wrap .reveal-text",
            ".services-appsec-wrap .reveal-text",
          ].join(",")
        );
      }
    };
  }, [shouldLoadRest]);

  // SectionTwo Slide Trigger Hook
  const triggerSec2Hook = useCallback((targetIdx: number) => {
    if (targetIdx !== lastSec2Idx.current) {
      lastSec2Idx.current = targetIdx;
      if (typeof (window as any)._sec2GoTo === "function") {
        (window as any)._sec2GoTo(targetIdx);
      }
    }
  }, []);

  // ── 4. CONTINUOUS LERP RENDER ENGINE ──
  useEffect(() => {
    if (!shouldLoadRest || !scopeRef.current) return;

    const scope = scopeRef.current;
    let isRunning = true;
    let lastTime = performance.now();

    const EASE_FACTOR = 0.15;
    const MAX_PROGRESS_DELTA_PER_FRAME = 0.008;

    const heroTextWrap = scope.querySelector<HTMLElement>(".hero-text-wrap");
    const heroTopLayer = scope.querySelector<HTMLElement>(".services-hero-top-layer");
    const heroBtn = scope.querySelector<HTMLElement>(".hero-btn");
    const secOneWrap = scope.querySelector<HTMLElement>(".section-one-wrap");
    const heroBg = scope.querySelector<HTMLElement>(".service-hero-bg");
    const glassCard = scope.querySelector<HTMLElement>(".s1-glass-card");
    const secTwoWrap = scope.querySelector<HTMLElement>(".services-section-two-wrap");
    const s2DesktopSec = scope.querySelector<HTMLElement>(".s2-desktop-section");
    const appSecWrap = scope.querySelector<HTMLElement>(".services-appsec-wrap");

    // Hardware-promote key nodes
    [
      heroTextWrap,
      heroTopLayer,
      heroBtn,
      secOneWrap,
      heroBg,
      glassCard,
      secTwoWrap,
      s2DesktopSec,
      appSecWrap,
      layerCTA.current,
      layerFooter.current,
    ].forEach((el) => {
      if (el) {
        el.style.willChange = "transform, opacity, clip-path";
        el.style.transform = "translate3d(0, 0, 0)";
      }
    });

    const renderTransforms = (time: number) => {
      if (!isRunning) return;

      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const dynamicEase = 1 - Math.exp(-EASE_FACTOR * 60 * dt);
      let delta =
        (targetProgress.current - smoothProgress.current) * dynamicEase;

      if (Math.abs(delta) > MAX_PROGRESS_DELTA_PER_FRAME) {
        delta = Math.sign(delta) * MAX_PROGRESS_DELTA_PER_FRAME;
      }

      smoothProgress.current = Math.min(
        Math.max(smoothProgress.current + delta, 0),
        1
      );

      const currentProgress = smoothProgress.current;

      const stepProgress = currentProgress * (TOTAL_SCROLL_STEPS - 1);
      const { ctaHeight, footerHeight, vh } = scrollMetricsRef.current;

      // STEP 1: HERO HOLD & TOP LAYER NARROW (STEPS 0.0 -> 0.8)
      const heroProg = easeOutQuad(Math.min(Math.max(stepProgress / 0.8, 0), 1));

      if (heroTextWrap) {
        heroTextWrap.style.transformOrigin = "left bottom";
        heroTextWrap.style.transform = `translate3d(0, ${(heroProg * 60).toFixed(2)}px, 0) scale3d(${(1 - heroProg * 0.25).toFixed(4)}, ${(1 - heroProg * 0.25).toFixed(4)}, 1)`;
      }

      if (heroTopLayer) {
        heroTopLayer.style.width = `${(100 - heroProg * 40).toFixed(2)}%`;
      }

      if (heroBtn) {
        const btnProg = easeOutQuad(Math.min(Math.max(stepProgress / 0.05, 0), 1));
        heroBtn.style.opacity = `${(1 - btnProg).toFixed(2)}`;
        heroBtn.style.pointerEvents = btnProg >= 1 ? "none" : "auto";
      }

      // STEP 2: SECTION ONE CLIP REVEAL & TEXT REVEAL (STEPS 0.8 -> 2.2)
      const s1Prog = easeOutQuad(Math.min(Math.max((stepProgress - 0.8) / 1.4, 0), 1));

      if (secOneWrap) {
        const clipVal = ((1 - s1Prog) * 100).toFixed(2);
        const clipValue = `inset(${clipVal}% 0% 0% 0%)`;
        secOneWrap.style.clipPath = clipValue;
        secOneWrap.style.setProperty("-webkit-clip-path", clipValue);
      }

      triggerPlayOnceTextReveal(".section-one-wrap", stepProgress, 1.1);

      if (heroBg) {
        const xPerc = (-s1Prog * 8).toFixed(2);
        const scaleVal = (1.0 + s1Prog * 0.6).toFixed(4);
        heroBg.style.transform = `translate3d(${xPerc}%, 0, 0) scale3d(${scaleVal}, ${scaleVal}, 1)`;
      }

      if (glassCard) {
        const cardProg = easeOutQuad(Math.min(Math.max((stepProgress - 1.2) / 0.8, 0), 1));
        glassCard.style.opacity = `${cardProg.toFixed(2)}`;
        glassCard.style.transform = `translate3d(${((1 - cardProg) * 40).toFixed(2)}px, 0, 0)`;
      }

      // STEP 3: VERTICAL SLIDE UP FOR SECTION TWO (STEPS 2.5 -> 3.8)
      const rawS2Prog = Math.min(Math.max((stepProgress - 2.5) / 1.3, 0), 1);
      const s2SlideProg = easeOutQuad(rawS2Prog);

      if (secTwoWrap) {
        secTwoWrap.style.visibility = stepProgress >= 2.3 ? "visible" : "hidden";
        if (stepProgress < 6.8) {
          secTwoWrap.style.transform = `translate3d(0, ${((1 - s2SlideProg) * 100).toFixed(2)}%, 0)`;
        }
      }

      if (s2DesktopSec) {
        s2DesktopSec.style.visibility = stepProgress >= 2.3 ? "visible" : "hidden";
      }

      if (secOneWrap && stepProgress < 2.5) {
        secOneWrap.style.transform = `translate3d(0, 0%, 0) scale3d(1, 1, 1)`;
      }

      triggerPlayOnceTextReveal(".services-section-two-wrap", stepProgress, 2.9);

      if (glassCard && stepProgress >= 2.5) {
        const cardOutProg = easeOutQuad(Math.min(Math.max((stepProgress - 2.5) / 0.6, 0), 1));
        glassCard.style.opacity = `${(1 - cardOutProg).toFixed(2)}`;
        glassCard.style.transform = `translate3d(0, ${(-cardOutProg * 50).toFixed(2)}px, 0)`;
      }

      if (stepProgress >= 2.8 && stepProgress < 6.8) {
        setIsSectionTwoActive(true);
      } else {
        setIsSectionTwoActive(false);
      }

      // STEP 4: BALANCED & SYNCHRONIZED SECTION TWO SLIDE INDEXING
      if (stepProgress < 4.8) {
        triggerSec2Hook(0);
      } else if (stepProgress >= 4.8 && stepProgress < 5.8) {
        triggerSec2Hook(1);
      } else {
        triggerSec2Hook(2);
      }

      // STEP 5: APP SECTION REVEAL OVER SECTION TWO (STEPS 6.8 -> 8.2)
      const appProg = easeOutQuad(Math.min(Math.max((stepProgress - 6.8) / 1.4, 0), 1));

      if (appSecWrap) {
        appSecWrap.style.visibility = stepProgress >= 6.6 ? "visible" : "hidden";
        if (stepProgress < 9.8) {
          appSecWrap.style.transform = `translate3d(0, ${((1 - appProg) * 100).toFixed(2)}%, 0)`;
        }
      }

      if (secTwoWrap && appProg > 0 && stepProgress < 6.8) {
        secTwoWrap.style.transform = `translate3d(0, 0%, 0) scale3d(1, 1, 1)`;
      }

      triggerPlayOnceTextReveal(".services-appsec-wrap", stepProgress, 7.2);

      // STEP 6: LAYER CTA SLIDE (STEPS 8.5 -> 9.8)
      const ctaProgress = easeOutQuad(Math.min(Math.max((stepProgress - 8.5) / 1.3, 0), 1));

      if (layerCTA.current) {
        layerCTA.current.style.visibility = stepProgress >= 8.3 ? "visible" : "hidden";
        const startY = vh;
        const endY = -(ctaHeight - vh);
        const currentY = startY + (endY - startY) * ctaProgress;
        layerCTA.current.style.transform = `translate3d(0, ${currentY.toFixed(2)}px, 0)`;
      }

      // STEP 7: LAYER FOOTER & CTA FADE OUT (STEPS 9.8 -> 11.0)
      const footerProgress = easeOutQuad(Math.min(Math.max((stepProgress - 9.8) / 1.2, 0), 1));

      if (layerCTA.current) {
        const innerOpacity = (1 - footerProgress).toFixed(3);
        layerCTA.current.style.setProperty("--cta-inner-opacity", innerOpacity);
      }

      if (layerFooter.current) {
        layerFooter.current.style.visibility = stepProgress >= 9.6 ? "visible" : "hidden";
        const startY = vh;
        const endY = vh - footerHeight;
        const translateY = startY + (endY - startY) * footerProgress;
        layerFooter.current.style.transform = `translate3d(0, ${translateY.toFixed(2)}px, 0)`;
      }

      const upperOpacity = (1 - footerProgress).toFixed(3);

      if (appSecWrap && footerProgress > 0) {
        const appScale = (1.0 - footerProgress * 0.08).toFixed(4);
        appSecWrap.style.opacity = upperOpacity;
        appSecWrap.style.transform = `translate3d(0, 0%, 0) scale3d(${appScale}, ${appScale}, 1)`;
      }

      rafId.current = requestAnimationFrame(renderTransforms);
    };

    const handleScroll = (e?: any) => {
      const scrollY = e?.scroll !== undefined ? e.scroll : window.scrollY;
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

      targetProgress.current = Math.min(Math.max(relativeScroll / totalScrollable, 0), 1);
    };

    const lenis = smootherRef?.current;
    if (lenis && typeof lenis.on === "function") {
      lenis.on("scroll", handleScroll);
    } else {
      window.addEventListener("scroll", handleScroll, { passive: true });
    }

    handleScroll();
    rafId.current = requestAnimationFrame(renderTransforms);

    return () => {
      isRunning = false;
      if (rafId.current) cancelAnimationFrame(rafId.current);
      if (lenis && typeof lenis.off === "function") {
        lenis.off("scroll", handleScroll);
      } else {
        window.removeEventListener("scroll", handleScroll);
      }
    };
  }, [shouldLoadRest, smootherRef, triggerSec2Hook, triggerPlayOnceTextReveal]);

  const isReady = preloaderDone && introDone;

  return (
    <div ref={scopeRef} className="w-full bg-black">
      <div
        ref={trackRef}
        className="services-track relative w-full"
        style={{ height: `${TOTAL_SCROLL_STEPS * 100}vh` }}
      >
        <div
          ref={fixedFrameRef}
          className="services-pin fixed top-0 left-0 h-[100vh] w-full overflow-hidden bg-black z-10 transform-gpu"
        >
          {/* Layer 1: Hero Container */}
          <div className="services-hero-wrap absolute inset-0 z-10 pointer-events-auto w-full h-full structural-layer transform-gpu will-change-transform">
            <Hero />
          </div>

          {/* DOWNSTREAM SECTIONS */}
          {shouldLoadRest && (
            <>
              {/* Layer 2: Section One Container */}
              <div
                className="section-one-wrap absolute inset-0 w-full h-full z-20 overflow-hidden structural-layer transform-gpu will-change-[clip-path]"
                style={{
                  clipPath: "inset(100% 0% 0% 0%)",
                  WebkitClipPath: "inset(100% 0% 0% 0%)",
                }}
              >
                <SectionOne />
              </div>

              {/* Layer 3: Section Two Container */}
              <div
                className="services-section-two-wrap absolute inset-0 w-full h-full z-30 overflow-hidden structural-layer transform-gpu will-change-transform"
                style={{
                  visibility: "hidden",
                  transform: "translate3d(0, 100%, 0)",
                }}
              >
                <SectionTwo isActive={isSectionTwoActive} />
              </div>

              {/* Layer 4: App Section Container */}
              <div
                className="services-appsec-wrap absolute inset-0 w-full h-full z-35 overflow-hidden structural-layer transform-gpu will-change-transform"
                style={{
                  visibility: "hidden",
                  transform: "translate3d(0, 100%, 0)",
                }}
              >
                <Appsection />
              </div>

              {/* Layer 5: Section CTA Container */}
              <div
                ref={layerCTA}
                className="services-section-cta absolute left-0 top-0 w-full z-[120] structural-layer pointer-events-auto transform-gpu will-change-transform"
                style={{ transform: "translate3d(0, 100vh, 0)", visibility: "hidden" }}
              >
                <SectionCTA preloaderDone={isReady} />
              </div>

              {/* Layer 6: Footer Container */}
              <div
                ref={layerFooter}
                className="services-footer-wrap absolute left-0 top-0 w-full z-[125] structural-layer transform-gpu will-change-transform"
                style={{ transform: "translate3d(0, 100vh, 0)", visibility: "hidden" }}
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