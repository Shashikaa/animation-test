"use client";

import dynamic from "next/dynamic";
import Hero from "@/src/components/About/Hero";
import { useState, useRef, useEffect, useCallback } from "react";
import { useSite } from "@/src/app/context/SiteContext";
import { useHeroIntro } from "@/src/app/utils/useHeroIntro";
import { useTextReveal, restoreTextReveal } from "@/src/app/utils/useTextReveal";

const SectionOne = dynamic(() => import("@/src/components/About/SectionOne"));
const SectionTwo = dynamic(() => import("@/src/components/About/SectionTwo"));
const SectionThree = dynamic(() => import("@/src/components/About/SectionThree"));
const SectionFour = dynamic(() => import("@/src/components/About/SectionFour"));
const SectionFive = dynamic(() => import("@/src/components/About/SectionFive"));
const SectionCTA = dynamic(() => import("@/src/components/SectionCTA"));
const Footer = dynamic(() => import("@/src/components/Footer"));

const TOTAL_SCROLL_STEPS = 13;
const easeOutQuad = (t: number) => t * (2 - t);
const clamp = (v: number, min = 0, max = 1) => Math.min(Math.max(v, min), max);

export default function AboutDesktop() {
  const [isSectionFiveActive, setIsSectionFiveActive] = useState(false);

  const scopeRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fixedFrameRef = useRef<HTMLDivElement>(null);
  const layer6Ref = useRef<HTMLDivElement>(null);
  const layer7Ref = useRef<HTMLDivElement>(null);

  const dimensionsRef = useRef({
    ctaHeight: 0,
    footerHeight: 0,
    vh: 0,
    trackTopOffset: 0,
    totalScrollable: 0,
  });

  const targetProgress = useRef(0);
  const smoothProgress = useRef(0);
  const revealedSections = useRef<Set<string>>(new Set());
  const lastSec5Idx = useRef(-1);
  const rafId = useRef<number | null>(null);

  const { smootherRef } = useSite();

  const { introDone, preloaderDone, shouldLoadRest } = useHeroIntro(scopeRef, {
    isMobile: false,
    introDurationMs: 2800,
    unlockScrollEarlyMs: 1800,
  });

  // Handle class removals when intro triggers rest load
  useEffect(() => {
    if (shouldLoadRest) {
      document.body.classList.remove("preloading");
      document.documentElement.classList.remove("preloading");
    }
  }, [shouldLoadRest]);

  const measure = useCallback(() => {
    if (!trackRef.current) return;

    const rect = trackRef.current.getBoundingClientRect();
    const vh = window.innerHeight;

    dimensionsRef.current = {
      ctaHeight: layer6Ref.current?.offsetHeight || vh,
      footerHeight: layer7Ref.current?.offsetHeight || layer7Ref.current?.scrollHeight || vh,
      vh,
      trackTopOffset: window.scrollY + rect.top,
      totalScrollable: Math.max(0, rect.height - vh),
    };
  }, []);

  useEffect(() => {
    if (!shouldLoadRest) return;

    measure();
    const resizeObserver = new ResizeObserver(measure);

    if (layer6Ref.current) resizeObserver.observe(layer6Ref.current);
    if (layer7Ref.current) resizeObserver.observe(layer7Ref.current);

    window.addEventListener("resize", measure, { passive: true });

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [shouldLoadRest, measure]);

  const triggerSec5Hook = useCallback((nextIdx: number) => {
    if (nextIdx === lastSec5Idx.current) return;
    lastSec5Idx.current = nextIdx;

    if (typeof window !== "undefined" && typeof (window as any)._sec5GoTo === "function") {
      (window as any)._sec5GoTo(nextIdx);
    }
  }, []);

  const triggerPlayOnceTextReveal = useCallback(
    (containerSelector: string, currentStepProg: number, triggerThreshold: number) => {
      if (!scopeRef.current || revealedSections.current.has(containerSelector)) return;

      if (currentStepProg >= triggerThreshold) {
        revealedSections.current.add(containerSelector);

        const lineInners = scopeRef.current.querySelectorAll<HTMLElement>(
          `${containerSelector} .gs-line-inner`
        );

        lineInners.forEach((el, idx) => {
          const delay = idx * 0.08;
          el.style.transition =
            `transform 0.85s cubic-bezier(0.16,1,0.3,1) ${delay}s, ` +
            `opacity 0.85s cubic-bezier(0.16,1,0.3,1) ${delay}s`;
          el.style.transform = "translate3d(0,0%,0)";
          el.style.opacity = "1";
        });
      }
    },
    []
  );

  useEffect(() => {
    if (!shouldLoadRest || !scopeRef.current) return;

    useTextReveal(scopeRef, ".about-section-one .reveal-text");
    useTextReveal(scopeRef, ".about-section-two .reveal-text");
    useTextReveal(scopeRef, ".about-section-three .reveal-text");
    useTextReveal(scopeRef, ".about-section-four .reveal-text");

    return () => {
      if (scopeRef.current) {
        restoreTextReveal(
          scopeRef.current,
          [
            ".about-section-one .reveal-text",
            ".about-section-two .reveal-text",
            ".about-section-three .reveal-text",
            ".about-section-four .reveal-text",
          ].join(",")
        );
      }
    };
  }, [shouldLoadRest]);

  // Main Desktop Animation Engine
  useEffect(() => {
    if (!shouldLoadRest || !scopeRef.current) return;

    const scope = scopeRef.current;
    let isRunning = true;
    let lastTime = performance.now();

    const MAX_PROGRESS_SPEED = 1.8;
    const PROGRESS_SMOOTHNESS = 0.8;

    const heroLeft = scope.querySelector<HTMLElement>(".about-hero-panel-left");
    const heroRight = scope.querySelector<HTMLElement>(".about-hero-panel-right");
    const heroBgs = scope.querySelectorAll<HTMLElement>(".about-hero-bg");
    const secTwo = scope.querySelector<HTMLElement>(".about-section-two");
    const secThree = scope.querySelector<HTMLElement>(".about-section-three");
    const secFour = scope.querySelector<HTMLElement>(".about-section-four");
    const s4GlassCard = scope.querySelector<HTMLElement>(".s4-glass-card");
    const secFive = scope.querySelector<HTMLElement>(".about-section-five");
    const s5Bg = scope.querySelector<HTMLElement>(".s5-bg");

    const renderTransforms = (time: number) => {
      if (!isRunning) return;

      const deltaTime = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      const current = smoothProgress.current;
      const target = targetProgress.current;

      let next = current + (target - current) * PROGRESS_SMOOTHNESS;
      const maxStep = MAX_PROGRESS_SPEED * deltaTime;

      if (Math.abs(next - current) > maxStep) {
        next = current + Math.sign(next - current) * maxStep;
      }

      smoothProgress.current = clamp(next);
      const currentProgress = smoothProgress.current;
      const stepProgress = currentProgress * (TOTAL_SCROLL_STEPS - 1);

      const { ctaHeight, footerHeight, vh } = dimensionsRef.current;

      // 1. HERO
      const s1Prog = easeOutQuad(clamp(stepProgress, 0, 1));
      if (heroLeft && heroRight) {
        const clipVal = (s1Prog * 100).toFixed(2);
        heroLeft.style.clipPath = `inset(0% 50% ${clipVal}% 0%)`;
        heroRight.style.clipPath = `inset(${clipVal}% 0% 0% 50%)`;
      }

      if (heroBgs.length > 0) {
        const scaleVal = (1.15 - s1Prog * 0.15).toFixed(4);
        heroBgs.forEach((bg) => {
          bg.style.transform = `translate3d(0,0,0) scale3d(${scaleVal},${scaleVal},1)`;
        });
      }

      triggerPlayOnceTextReveal(".about-section-one", stepProgress, 0.4);

      // 2. SECTION TWO
      const s2Prog = easeOutQuad(clamp((stepProgress - 1.2) / 1.0, 0, 1));
      if (secTwo) {
        secTwo.style.visibility = stepProgress >= 1 ? "visible" : "hidden";
        secTwo.style.transform = `translate3d(0,${((1 - s2Prog) * 100).toFixed(3)}%,0)`;
      }
      triggerPlayOnceTextReveal(".about-section-two", stepProgress, 1.8);

      // 3. SECTION THREE
      const s3Prog = easeOutQuad(clamp((stepProgress - 2.4) / 1.0, 0, 1));
      if (secThree) {
        secThree.style.visibility = stepProgress >= 2.2 ? "visible" : "hidden";
        secThree.style.clipPath = `inset(${((1 - s3Prog) * 100).toFixed(2)}% 0% 0% 0%)`;
      }
      triggerPlayOnceTextReveal(".about-section-three", stepProgress, 3.0);

      // 4. SECTION FOUR
      const s4Prog = easeOutQuad(clamp((stepProgress - 3.6) / 1.0, 0, 1));
      if (secFour) {
        secFour.style.visibility = stepProgress >= 3.4 ? "visible" : "hidden";
        secFour.style.clipPath = `inset(${((1 - s4Prog) * 100).toFixed(2)}% 0% 0% 0%)`;
      }

      if (s4GlassCard) {
        const glassProg = easeOutQuad(clamp((stepProgress - 4.0) / 0.6, 0, 1));
        s4GlassCard.style.opacity = glassProg.toFixed(3);
        s4GlassCard.style.transform = `translate3d(0,${((1 - glassProg) * 40).toFixed(2)}px,0)`;
      }
      triggerPlayOnceTextReveal(".about-section-four", stepProgress, 4.2);

      // 5. SECTION FIVE
      const s5Prog = easeOutQuad(clamp((stepProgress - 4.8) / 1.0, 0, 1));
      if (secFive) {
        secFive.style.visibility = stepProgress >= 4.6 ? "visible" : "hidden";
        secFive.style.transform = `translate3d(0,${((1 - s5Prog) * 100).toFixed(3)}%,0)`;
      }

      if (stepProgress >= 5.5 && stepProgress < 8.2) {
        setIsSectionFiveActive(true);
        const sec5SubProgress = (stepProgress - 5.5) / 2.7;
        if (sec5SubProgress < 0.33) triggerSec5Hook(0);
        else if (sec5SubProgress < 0.66) triggerSec5Hook(1);
        else triggerSec5Hook(2);
      } else if (stepProgress < 5.5) {
        setIsSectionFiveActive(false);
        triggerSec5Hook(0);
      }

      if (s5Bg) {
        const parallaxProg = clamp((stepProgress - 4.8) / 3.4, 0, 1);
        s5Bg.style.transform = `translate3d(0,${(-parallaxProg * 50).toFixed(2)}%,0)`;
      }

      // 6. CTA
      const ctaProgress = easeOutQuad(clamp((stepProgress - 8.2) / 1.8, 0, 1));
      if (layer6Ref.current) {
        const currentY = vh + (-(ctaHeight - vh) - vh) * ctaProgress;
        layer6Ref.current.style.transform = `translate3d(0,${currentY.toFixed(2)}px,0)`;
      }

      // 7. FOOTER
      const footerProgress = easeOutQuad(clamp((stepProgress - 10.0) / 2.0, 0, 1));
      if (layer7Ref.current) {
        const translateY = vh + (vh - footerHeight - vh) * footerProgress;
        layer7Ref.current.style.transform = `translate3d(0,${translateY.toFixed(2)}px,0)`;
      }

      rafId.current = requestAnimationFrame(renderTransforms);
    };

    const handleScroll = (e?: any) => {
      const scrollY = e?.scroll !== undefined ? e.scroll : window.scrollY;

      if (dimensionsRef.current.totalScrollable <= 0) {
        measure();
      }

      const { totalScrollable, trackTopOffset } = dimensionsRef.current;
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
    smoothProgress.current = targetProgress.current;
    rafId.current = requestAnimationFrame(renderTransforms);

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
  }, [shouldLoadRest, smootherRef, triggerSec5Hook, triggerPlayOnceTextReveal, measure]);

  const isReady = preloaderDone && introDone;

  return (
    <div ref={scopeRef} className="w-full bg-[#162D24]">
      <div
        ref={trackRef}
        className="about-track-container relative w-full"
        style={{ height: `${TOTAL_SCROLL_STEPS * 100}vh` }}
      >
        <div
          ref={fixedFrameRef}
          className="about-pin fixed top-0 left-0 h-[100vh] w-full overflow-hidden bg-[#162D24] z-10 transform-gpu"
        >
          <div className="absolute inset-0 h-full w-full structural-layer transform-gpu" style={{ zIndex: 20 }}>
            <Hero isMobile={false} />
          </div>

          {shouldLoadRest && (
            <>
              <div
                className="about-section-one absolute inset-0 h-full w-full structural-layer bg-[#162D24] transform-gpu will-change-transform"
                style={{ zIndex: 10 }}
              >
                <SectionOne />
              </div>

              <div
                className="about-section-two absolute inset-0 h-full w-full structural-layer transform-gpu will-change-transform"
                style={{ zIndex: 30, visibility: "hidden", transform: "translate3d(0,100%,0)" }}
              >
                <SectionTwo />
              </div>

              <div
                className="about-section-three absolute inset-0 h-full w-full structural-layer transform-gpu will-change-[clip-path]"
                style={{ zIndex: 40, visibility: "hidden", clipPath: "inset(100% 0% 0% 0%)" }}
              >
                <SectionThree />
              </div>

              <div
                className="about-section-four absolute inset-0 h-full w-full structural-layer transform-gpu will-change-[clip-path]"
                style={{ zIndex: 50, visibility: "hidden", clipPath: "inset(100% 0% 0% 0%)" }}
              >
                <SectionFour />
              </div>

              <div
                className="about-section-five absolute inset-0 h-full w-full structural-layer transform-gpu will-change-transform"
                style={{ zIndex: 60, visibility: "hidden", transform: "translate3d(0,100%,0)" }}
              >
                <SectionFive isActive={isSectionFiveActive} />
              </div>

              <div
                ref={layer6Ref}
                className="about-section-cta absolute left-0 top-0 w-full z-[90] transform-gpu will-change-transform"
                style={{ transform: "translate3d(0,100vh,0)" }}
              >
                <SectionCTA preloaderDone={isReady} />
              </div>

              <div
                ref={layer7Ref}
                className="about-footer-wrap absolute left-0 top-0 w-full z-[100] transform-gpu will-change-transform"
                style={{ transform: "translate3d(0,100vh,0)" }}
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