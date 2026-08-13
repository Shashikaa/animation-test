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

export default function ServicesDesktop() {
  const scopeRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fixedFrameRef = useRef<HTMLDivElement>(null);

  const layerCTA = useRef<HTMLDivElement>(null);
  const layerFooter = useRef<HTMLDivElement>(null);

  const dimensionsRef = useRef({ ctaHeight: 0, footerHeight: 0, vh: 0 });
  const progressRef = useRef(0);
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
      progressRef.current = 0;
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

  // ── 2. CACHE DIMENSIONS ──
  useEffect(() => {
    if (!shouldLoadRest) return;

    const measure = () => {
      dimensionsRef.current = {
        ctaHeight: layerCTA.current?.offsetHeight || window.innerHeight,
        footerHeight: layerFooter.current?.offsetHeight || layerFooter.current?.scrollHeight || window.innerHeight,
        vh: window.innerHeight,
      };
    };

    measure();

    const resizeObserver = new ResizeObserver(() => measure());
    if (layerCTA.current) resizeObserver.observe(layerCTA.current);
    if (layerFooter.current) resizeObserver.observe(layerFooter.current);

    window.addEventListener("resize", measure, { passive: true });
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [shouldLoadRest]);

  // Text Reveal Preparation
  useEffect(() => {
    if (!shouldLoadRest || !scopeRef.current) return;

    useTextReveal(scopeRef, ".section-one-wrap .reveal-text");
    useTextReveal(scopeRef, ".services-section-two-wrap .reveal-text");
    useTextReveal(scopeRef, ".services-appsec-wrap .reveal-text");

    return () => {
      if (scopeRef.current) {
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

  // Trigger Play-Once Text Reveal Helper
  const triggerPlayOnceTextReveal = useCallback((containerSelector: string) => {
    if (!scopeRef.current || revealedSections.current.has(containerSelector)) return;

    revealedSections.current.add(containerSelector);
    const lineInners = scopeRef.current.querySelectorAll<HTMLElement>(
      `${containerSelector} .gs-line-inner, ${containerSelector} .custom-line-inner`
    );

    lineInners.forEach((el, idx) => {
      el.style.transition = `transform 0.85s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 0.05}s, opacity 0.85s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 0.05}s`;
      el.style.transform = "translate3d(0, 0%, 0)";
      el.style.opacity = "1";
    });
  }, []);

  // SectionTwo Slide Trigger Hook
  const triggerSec2Hook = useCallback((targetIdx: number) => {
    if (targetIdx !== lastSec2Idx.current) {
      lastSec2Idx.current = targetIdx;
      if (typeof (window as any)._sec2GoTo === "function") {
        (window as any)._sec2GoTo(targetIdx);
      }
    }
  }, []);

  // ── 3. DIRECT GPU TRANSFORM RENDERING LOOP (SYNCHRONIZED WITH LENIS) ──
  useEffect(() => {
    if (!shouldLoadRest || !scopeRef.current) return;

    const scope = scopeRef.current;

    const heroTextWrap = scope.querySelector<HTMLElement>(".hero-text-wrap");
    const heroTopLayer = scope.querySelector<HTMLElement>(".services-hero-top-layer");
    const heroBtn = scope.querySelector<HTMLElement>(".hero-btn");
    const secOneWrap = scope.querySelector<HTMLElement>(".section-one-wrap");
    const heroBg = scope.querySelector<HTMLElement>(".service-hero-bg");
    const glassCard = scope.querySelector<HTMLElement>(".s1-glass-card");

    const secTwoWrap = scope.querySelector<HTMLElement>(".services-section-two-wrap");
    const s2DesktopSec = scope.querySelector<HTMLElement>(".s2-desktop-section");

    const appSecWrap = scope.querySelector<HTMLElement>(".services-appsec-wrap");

    let rafId: number | null = null;

    const renderTransforms = () => {
      const stepProgress = progressRef.current * (TOTAL_SCROLL_STEPS - 1);
      const { ctaHeight, footerHeight, vh } = dimensionsRef.current;

      // ── STEP 1: HERO HOLD & TOP LAYER NARROW (STEPS 0.0 -> 0.8) ──
      const heroProg = Math.min(Math.max(stepProgress / 0.8, 0), 1);

      if (heroTextWrap) {
        heroTextWrap.style.transformOrigin = "left bottom";
        heroTextWrap.style.transform = `translate3d(0, ${heroProg * 60}px, 0) scale3d(${1 - heroProg * 0.25}, ${1 - heroProg * 0.25}, 1)`;
      }

      if (heroTopLayer) {
        heroTopLayer.style.width = `${100 - heroProg * 40}%`;
      }

      // Hide hero button immediately as hero animation begins
      if (heroBtn) {
        const btnProg = Math.min(Math.max(stepProgress / 0.05, 0), 1);
        heroBtn.style.opacity = `${1 - btnProg}`;
        heroBtn.style.pointerEvents = btnProg >= 1 ? "none" : "auto";
      }

      // ── STEP 2: SECTION ONE CLIP REVEAL & TEXT REVEAL (STEPS 0.8 -> 2.2) ──
      const s1Prog = Math.min(Math.max((stepProgress - 0.8) / 1.4, 0), 1);

      if (secOneWrap) {
        const clipVal = (1 - s1Prog) * 100;
        const clipValue = `inset(${clipVal}% 0% 0% 0%)`;
        secOneWrap.style.clipPath = clipValue;
        secOneWrap.style.setProperty("-webkit-clip-path", clipValue);
      }

      if (s1Prog >= 0.3) {
        triggerPlayOnceTextReveal(".section-one-wrap");
      }

      if (heroBg) {
        const xPerc = -s1Prog * 8;
        const scaleVal = 1.0 + s1Prog * 0.6;
        heroBg.style.transform = `translate3d(${xPerc}%, 0, 0) scale3d(${scaleVal}, ${scaleVal}, 1)`;
      }

      if (glassCard) {
        const cardProg = Math.min(Math.max((stepProgress - 1.2) / 0.8, 0), 1);
        glassCard.style.opacity = `${cardProg}`;
        glassCard.style.transform = `translate3d(${(1 - cardProg) * 40}px, 0, 0)`;
      }

      // ── STEP 3: VERTICAL SLIDE UP FOR SECTION TWO (STEPS 2.5 -> 3.8) ──
      const rawS2Prog = Math.min(Math.max((stepProgress - 2.5) / 1.3, 0), 1);
      const s2SlideProg = easeOutQuad(rawS2Prog);

      if (secTwoWrap) {
        secTwoWrap.style.visibility = stepProgress >= 2.3 ? "visible" : "hidden";
        secTwoWrap.style.transform = `translate3d(0, ${(1 - s2SlideProg) * 100}%, 0)`;
      }

      if (s2DesktopSec) {
        s2DesktopSec.style.visibility = stepProgress >= 2.3 ? "visible" : "hidden";
      }

      // Keep Section 1 unscaled at 100% size as Section 2 slides over it
      if (secOneWrap) {
        secOneWrap.style.transform = `translate3d(0, 0%, 0) scale3d(1, 1, 1)`;
      }

      if (s2SlideProg >= 0.3) {
        triggerPlayOnceTextReveal(".services-section-two-wrap");
      }

      if (glassCard && stepProgress >= 2.5) {
        const cardOutProg = Math.min(Math.max((stepProgress - 2.5) / 0.6, 0), 1);
        glassCard.style.opacity = `${1 - cardOutProg}`;
        glassCard.style.transform = `translate3d(0, ${-cardOutProg * 50}px, 0)`;
      }

      if (stepProgress >= 2.8 && stepProgress < 6.8) {
        setIsSectionTwoActive(true);
      } else {
        setIsSectionTwoActive(false);
      }

      // ── STEP 4: FAST SMOOTH SECTION TWO INTERNAL CARDS INDEXING ──
      if (stepProgress < 4.5) {
        triggerSec2Hook(0);
      } else if (stepProgress >= 4.5 && stepProgress < 5.3) {
        triggerSec2Hook(1);
      } else {
        triggerSec2Hook(2);
      }

      // ── STEP 5: APP SECTION REVEAL OVER SECTION TWO (STEPS 6.8 -> 8.2) ──
      const appProg = easeOutQuad(Math.min(Math.max((stepProgress - 6.8) / 1.4, 0), 1));

      if (appSecWrap) {
        appSecWrap.style.visibility = stepProgress >= 6.6 ? "visible" : "hidden";
        appSecWrap.style.transform = `translate3d(0, ${(1 - appProg) * 100}%, 0)`;
      }

      // Section Two stays fully unscaled (100% size) as App Section slides over top
      if (secTwoWrap && appProg > 0) {
        secTwoWrap.style.transform = `translate3d(0, 0%, 0) scale3d(1, 1, 1)`;
      }

      if (appProg >= 0.3) {
        triggerPlayOnceTextReveal(".services-appsec-wrap");
      }

      // ── STEP 6: LAYER CTA SLIDE (STEPS 8.5 -> 9.8) ──
      const ctaProgress = easeOutQuad(Math.min(Math.max((stepProgress - 8.5) / 1.3, 0), 1));

      if (layerCTA.current) {
        layerCTA.current.style.visibility = stepProgress >= 8.3 ? "visible" : "hidden";
        const startY = vh;
        const endY = -(ctaHeight - vh);
        const currentY = startY + (endY - startY) * ctaProgress;
        layerCTA.current.style.transform = `translate3d(0, ${currentY}px, 0)`;
      }

      // ── STEP 7: LAYER FOOTER SLIDE (STEPS 9.8 -> 11.0) ──
      const footerProgress = easeOutQuad(Math.min(Math.max((stepProgress - 9.8) / 1.2, 0), 1));

      if (layerFooter.current) {
        layerFooter.current.style.visibility = stepProgress >= 9.6 ? "visible" : "hidden";
        const startY = vh;
        const endY = vh - footerHeight;
        const translateY = startY + (endY - startY) * footerProgress;
        layerFooter.current.style.transform = `translate3d(0, ${translateY}px, 0)`;
      }

      if (appSecWrap && footerProgress > 0) {
        const appScale = 1.0 - footerProgress * 0.05;
        appSecWrap.style.transform = `translate3d(0, 0%, 0) scale3d(${appScale}, ${appScale}, 1)`;
      }
    };

    const handleScroll = () => {
      if (!trackRef.current || !fixedFrameRef.current) return;

      const trackRect = trackRef.current.getBoundingClientRect();
      const vh = window.innerHeight;
      const totalScrollable = trackRect.height - vh;

      if (totalScrollable <= 0) return;

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

      const currentScroll = Math.max(0, -trackRect.top);
      progressRef.current = Math.min(Math.max(currentScroll / totalScrollable, 0), 1);

      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(renderTransforms);
    };

    handleScroll();

    const lenis = smootherRef?.current;
    if (lenis && typeof lenis.on === "function") {
      lenis.on("scroll", handleScroll);
    } else {
      window.addEventListener("scroll", handleScroll, { passive: true });
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
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
          <div className="services-hero-wrap absolute inset-0 z-10 pointer-events-auto w-full h-full structural-layer transform-gpu">
            <Hero />
          </div>

          {/* DOWNSTREAM SECTIONS */}
          {shouldLoadRest && (
            <>
              {/* Layer 2: Section One Container */}
              <div
                className="section-one-wrap absolute inset-0 w-full h-full z-20 overflow-hidden structural-layer transform-gpu will-change-transform"
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
                className="services-section-cta absolute left-0 top-0 w-full z-[120] structural-layer pointer-events-auto transform-gpu"
                style={{ transform: "translate3d(0, 100vh, 0)", visibility: "hidden" }}
              >
                <SectionCTA preloaderDone={isReady} />
              </div>

              {/* Layer 6: Footer Container */}
              <div
                ref={layerFooter}
                className="services-footer-wrap absolute left-0 top-0 w-full z-[125] structural-layer transform-gpu"
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