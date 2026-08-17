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

const EFFECTIVE_STEPS = 11.0;
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

  const lastSizeRef = useRef({ width: 0, height: 0 });

  const targetProgress = useRef(0);
  const smoothProgress = useRef(0);
  const revealedElements = useRef<Set<string>>(new Set());
  const lastSec5Idx = useRef(-1);
  const rafId = useRef<number | null>(null);

  const { smootherRef } = useSite();

  const { introDone, preloaderDone, shouldLoadRest } = useHeroIntro(scopeRef, {
    isMobile: false,
    introDurationMs: 2800,
    unlockScrollEarlyMs: 1800,
  });

  useEffect(() => {
    const lenis = smootherRef?.current;

    if (!preloaderDone || !shouldLoadRest) {
      if (lenis?.stop) lenis.stop();
      targetProgress.current = 0;
      smoothProgress.current = 0;
      return;
    }

    document.body.classList.remove("preloading");
    document.documentElement.classList.remove("preloading");

    if (lenis) {
      if (lenis.resize) lenis.resize();
      if (lenis.start) lenis.start();
    }

    requestAnimationFrame(() => {
      window.dispatchEvent(new Event("scroll"));
    });
  }, [preloaderDone, shouldLoadRest, smootherRef]);

  const measure = useCallback(() => {
    if (!trackRef.current) return;

    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const rect = trackRef.current.getBoundingClientRect();

    const calculatedHeight = vh * EFFECTIVE_STEPS;
    trackRef.current.style.height = `${calculatedHeight}px`;

    dimensionsRef.current = {
      ctaHeight: layer6Ref.current?.offsetHeight || vh,
      footerHeight:
        layer7Ref.current?.offsetHeight ||
        layer7Ref.current?.scrollHeight ||
        vh,
      vh,
      trackTopOffset: window.scrollY + rect.top,
      totalScrollable: Math.max(0, calculatedHeight - vh),
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

    const resizeObserver = new ResizeObserver(measure);

    if (layer6Ref.current) resizeObserver.observe(layer6Ref.current);
    if (layer7Ref.current) resizeObserver.observe(layer7Ref.current);

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("orientationchange", measure, { passive: true });

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", measure);
    };
  }, [shouldLoadRest, measure, handleResize]);

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

  const triggerProgressTextReveal = useCallback(
    (containerSelector: string, currentProgress: number, threshold: number) => {
      if (!scopeRef.current) return;

      if (currentProgress >= threshold) {
        const container = scopeRef.current.querySelector<HTMLElement>(containerSelector);
        if (!container || container.style.visibility === "hidden") return;

        const revealElements = container.querySelectorAll<HTMLElement>(".reveal-text");
        revealElements.forEach((el, index) => {
          const key = `${containerSelector}-${index}`;
          if (revealedElements.current.has(key)) return;

          revealedElements.current.add(key);

          const lineInners = el.querySelectorAll<HTMLElement>(".gs-line-inner");
          lineInners.forEach((line, idx) => {
            const delay = idx * 0.08;
            line.style.transition =
              `transform 0.85s cubic-bezier(0.16,1,0.3,1) ${delay}s, ` +
              `opacity 0.85s cubic-bezier(0.16,1,0.3,1) ${delay}s`;

            line.style.transform = "translate3d(0,0%,0)";
            line.style.opacity = "1";
          });
        });
      }
    },
    []
  );

  const triggerSpatialTextReveal = useCallback((containerSelector: string, thresholdRatio = 0.85) => {
    if (!scopeRef.current) return;

    const container = scopeRef.current.querySelector<HTMLElement>(containerSelector);
    if (!container || container.style.visibility === "hidden") return;

    const revealElements = container.querySelectorAll<HTMLElement>(".reveal-text");

    revealElements.forEach((el, index) => {
      const key = `${containerSelector}-${index}`;
      if (revealedElements.current.has(key)) return;

      const rect = el.getBoundingClientRect();
      const vh = dimensionsRef.current.vh || window.innerHeight;

      if (rect.top > 0 && rect.top < vh * thresholdRatio) {
        revealedElements.current.add(key);

        const lineInners = el.querySelectorAll<HTMLElement>(".gs-line-inner");
        lineInners.forEach((line, idx) => {
          const delay = idx * 0.08;
          line.style.transition =
            `transform 0.85s cubic-bezier(0.16,1,0.3,1) ${delay}s, ` +
            `opacity 0.85s cubic-bezier(0.16,1,0.3,1) ${delay}s`;

          line.style.transform = "translate3d(0,0%,0)";
          line.style.opacity = "1";
        });
      }
    });
  }, []);

  const triggerClippedTextReveal = useCallback(
    (containerSelector: string, clipProgress: number) => {
      if (!scopeRef.current) return;

      const container = scopeRef.current.querySelector<HTMLElement>(containerSelector);
      if (!container || container.style.visibility === "hidden") return;

      const vh = dimensionsRef.current.vh || window.innerHeight;
      const visibleClipTopPx = vh * (1 - clipProgress);

      const revealElements = container.querySelectorAll<HTMLElement>(".reveal-text");

      revealElements.forEach((el, index) => {
        const key = `${containerSelector}-${index}`;
        if (revealedElements.current.has(key)) return;

        const rect = el.getBoundingClientRect();

        if (visibleClipTopPx <= rect.top + rect.height * 0.2) {
          revealedElements.current.add(key);

          const lineInners = el.querySelectorAll<HTMLElement>(".gs-line-inner");
          lineInners.forEach((line, idx) => {
            const delay = idx * 0.08;
            line.style.transition =
              `transform 0.85s cubic-bezier(0.16,1,0.3,1) ${delay}s, ` +
              `opacity 0.85s cubic-bezier(0.16,1,0.3,1) ${delay}s`;

            line.style.transform = "translate3d(0,0%,0)";
            line.style.opacity = "1";
          });
        }
      });
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

  useEffect(() => {
    if (!shouldLoadRest || !scopeRef.current) return;

    const scope = scopeRef.current;
    let isRunning = true;
    let lastTime = performance.now();

    const EASE_FACTOR = 0.15;
    const MAX_PROGRESS_DELTA_PER_FRAME = 0.008;

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

      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const dynamicEase = 1 - Math.exp(-EASE_FACTOR * 60 * dt);
      let delta =
        (targetProgress.current - smoothProgress.current) * dynamicEase;

      if (Math.abs(delta) > MAX_PROGRESS_DELTA_PER_FRAME) {
        delta = Math.sign(delta) * MAX_PROGRESS_DELTA_PER_FRAME;
      }

      smoothProgress.current = clamp(smoothProgress.current + delta);

      const currentProgress = smoothProgress.current;
      const stepProgress = currentProgress * EFFECTIVE_STEPS;

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
      triggerProgressTextReveal(".about-section-one", s1Prog, 0.35);

      // 2. SECTION TWO
      const s2Prog = easeOutQuad(clamp((stepProgress - 1.2) / 1.0, 0, 1));
      if (secTwo) {
        secTwo.style.visibility = stepProgress >= 1 ? "visible" : "hidden";
        secTwo.style.transform = `translate3d(0,${((1 - s2Prog) * 100).toFixed(3)}%,0)`;
      }
      triggerSpatialTextReveal(".about-section-two");

      // 3. SECTION THREE
      const s3Prog = easeOutQuad(clamp((stepProgress - 2.4) / 1.0, 0, 1));
      if (secThree) {
        secThree.style.visibility = stepProgress >= 2.2 ? "visible" : "hidden";
        secThree.style.clipPath = `inset(${((1 - s3Prog) * 100).toFixed(2)}% 0% 0% 0%)`;
      }
      triggerClippedTextReveal(".about-section-three", s3Prog);

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
      triggerClippedTextReveal(".about-section-four", s4Prog);

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

      // 6. CTA & 7. FOOTER
      const ctaProgress = easeOutQuad(clamp((stepProgress - 8.2) / 1.6, 0, 1));
      const footerProgress = easeOutQuad(clamp((stepProgress - 9.8) / 1.2, 0, 1));

      if (layer6Ref.current) {
        const startY = vh;
        const endY = -(ctaHeight - vh);
        const currentY = startY + (endY - startY) * ctaProgress;
        layer6Ref.current.style.transform = `translate3d(0,${currentY.toFixed(2)}px,0)`;

        // Calculate fade-out specifically for the inner CTA container as footer comes in
        const innerOpacity = (1 - footerProgress).toFixed(3);
        layer6Ref.current.style.setProperty("--cta-inner-opacity", innerOpacity);
      }

      if (layer7Ref.current) {
        const startY = vh;
        const endY = vh - footerHeight;
        const translateY = startY + (endY - startY) * footerProgress;
        layer7Ref.current.style.transform = `translate3d(0,${translateY.toFixed(2)}px,0)`;
      }

      rafId.current = requestAnimationFrame(renderTransforms);
    };

    const handleScroll = (e?: any) => {
      const lenis = smootherRef?.current;
      const scrollY = e?.scroll ?? lenis?.scroll ?? window.scrollY;

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
    rafId.current = requestAnimationFrame(renderTransforms);

    return () => {
      isRunning = false;
      if (rafId.current) cancelAnimationFrame(rafId.current);
      if (lenis && typeof lenis.off === "function") {
        lenis.off("scroll", handleScroll);
      } else {
        window.removeEventListener("scroll", handleScroll);
      }
      if (typeof window !== "undefined") {
        delete (window as any)._sec5GoTo;
      }
    };
  }, [
    shouldLoadRest,
    smootherRef,
    triggerSec5Hook,
    triggerSpatialTextReveal,
    triggerClippedTextReveal,
    triggerProgressTextReveal,
  ]);

  const isReady = preloaderDone && introDone;

  return (
    <div ref={scopeRef} className="w-full bg-[#162D24]">
      <div
        ref={trackRef}
        className="about-track-container relative w-full"
      >
        <div
          ref={fixedFrameRef}
          className="about-pin fixed top-0 left-0 h-[100vh] w-full overflow-hidden bg-[#162D24] z-10 transform-gpu"
        >
          <div
            className="absolute inset-0 h-full w-full structural-layer transform-gpu"
            style={{ zIndex: 20 }}
          >
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
                style={{
                  zIndex: 30,
                  visibility: "hidden",
                  transform: "translate3d(0,100%,0)",
                }}
              >
                <SectionTwo />
              </div>

              <div
                className="about-section-three absolute inset-0 h-full w-full structural-layer transform-gpu will-change-[clip-path]"
                style={{
                  zIndex: 40,
                  visibility: "hidden",
                  clipPath: "inset(100% 0% 0% 0%)",
                }}
              >
                <SectionThree />
              </div>

              <div
                className="about-section-four absolute inset-0 h-full w-full structural-layer transform-gpu will-change-[clip-path]"
                style={{
                  zIndex: 50,
                  visibility: "hidden",
                  clipPath: "inset(100% 0% 0% 0%)",
                }}
              >
                <SectionFour />
              </div>

              <div
                className="about-section-five absolute inset-0 h-full w-full structural-layer transform-gpu will-change-transform"
                style={{
                  zIndex: 60,
                  visibility: "hidden",
                  transform: "translate3d(0,100%,0)",
                }}
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