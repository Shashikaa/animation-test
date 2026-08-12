"use client";

import dynamic from "next/dynamic";
import Hero from "@/src/components/About/Hero";
import { useState, useRef, useEffect, useCallback } from "react";
import { useSite } from "@/src/app/context/SiteContext";
import { useHeroIntro } from "@/src/app/utils/useHeroIntro";
import { useTextReveal, restoreTextReveal } from "@/src/app/utils/useTextReveal";

// Dynamically import heavy sections to isolate execution during hero intro
const SectionOne = dynamic(() => import("@/src/components/About/SectionOne"));
const SectionTwo = dynamic(() => import("@/src/components/About/SectionTwo"));
const SectionThree = dynamic(() => import("@/src/components/About/SectionThree"));
const SectionFour = dynamic(() => import("@/src/components/About/SectionFour"));
const SectionFive = dynamic(() => import("@/src/components/About/SectionFive"));
const SectionCTA = dynamic(() => import("@/src/components/SectionCTA"));
const Footer = dynamic(() => import("@/src/components/Footer"));

// Bumped to 13 to give full scroll track room for the footer reveal
const TOTAL_SCROLL_STEPS = 13;

export default function AboutDesktop() {
  const [isSectionFiveActive, setIsSectionFiveActive] = useState(false);
  const scopeRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fixedFrameRef = useRef<HTMLDivElement>(null);

  const layer6Ref = useRef<HTMLDivElement>(null);
  const layer7Ref = useRef<HTMLDivElement>(null);

  // Cached layout measurements
  const dimensionsRef = useRef({ ctaHeight: 0, footerHeight: 0, vh: 0 });

  const progressRef = useRef(0);
  const revealedSections = useRef<Set<string>>(new Set());
  const lastSec5Idx = useRef<number>(-1);

  const { smootherRef } = useSite();
  const { introDone, preloaderDone, shouldLoadRest } = useHeroIntro(scopeRef, {
    isMobile: false,
    introDurationMs: 2800,
  });

  // ── 1. UNLOCK LENIS & FORCE INSTANT SCROLL RESPONSIVENESS ──
  useEffect(() => {
    const lenis = smootherRef?.current;

    if (!preloaderDone || !introDone) {
      if (lenis && typeof lenis.stop === "function") lenis.stop();
      if (progressRef?.current !== undefined) progressRef.current = 0;
    } else {
      document.body.classList.remove("preloading");
      document.documentElement.classList.remove("preloading");

      if (lenis) {
        if (typeof lenis.resize === "function") lenis.resize();
        if (typeof lenis.start === "function") lenis.start();
      }

      // Instantly trigger scroll loop calculation on next frame
      requestAnimationFrame(() => {
        window.dispatchEvent(new Event("scroll"));
      });
    }
  }, [preloaderDone, introDone, smootherRef]);

  // ── 2. CACHE ELEMENT DIMENSIONS ON RESIZE & DYNAMIC ITEM MOUNT ──
  useEffect(() => {
    if (!shouldLoadRest) return;

    const measure = () => {
      dimensionsRef.current = {
        ctaHeight: layer6Ref.current?.offsetHeight || window.innerHeight,
        footerHeight: layer7Ref.current?.offsetHeight || layer7Ref.current?.scrollHeight || window.innerHeight,
        vh: window.innerHeight,
      };
    };

    measure();

    // ResizeObserver guarantees measurement updates after next/dynamic chunk loads
    const resizeObserver = new ResizeObserver(() => measure());
    if (layer6Ref.current) resizeObserver.observe(layer6Ref.current);
    if (layer7Ref.current) resizeObserver.observe(layer7Ref.current);

    window.addEventListener("resize", measure, { passive: true });
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [shouldLoadRest]);

  // ── 3. SECTION 5 TRIGGER HOOK ──
  const triggerSec5Hook = useCallback((nextIdx: number) => {
    if (nextIdx !== lastSec5Idx.current) {
      lastSec5Idx.current = nextIdx;
      if (typeof window !== "undefined" && (window as any)._sec5GoTo) {
        (window as any)._sec5GoTo(nextIdx);
      }
    }
  }, []);

  const triggerPlayOnceTextReveal = (
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
        `${containerSelector} .gs-line-inner`
      );

      lineInners.forEach((el, idx) => {
        el.style.transition = `transform 0.85s cubic-bezier(0.16, 1, 0.3, 1) ${
          idx * 0.08
        }s, opacity 0.85s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 0.08}s`;
        el.style.transform = "translate3d(0, 0%, 0)";
        el.style.opacity = "1";
      });
    }
  };

  useEffect(() => {
    if (!preloaderDone || !introDone || !scopeRef.current) return;

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
  }, [introDone, preloaderDone]);

  // ── 4. DIRECT GPU SCROLL RENDERING ──
  useEffect(() => {
    if (!preloaderDone || !introDone || !scopeRef.current) return;

    const scope = scopeRef.current;
    const heroLeft = scope.querySelector<HTMLElement>(".about-hero-panel-left");
    const heroRight = scope.querySelector<HTMLElement>(".about-hero-panel-right");
    const heroBgs = scope.querySelectorAll<HTMLElement>(".about-hero-bg");
    const secTwo = scope.querySelector<HTMLElement>(".about-section-two");
    const secThree = scope.querySelector<HTMLElement>(".about-section-three");
    const secFour = scope.querySelector<HTMLElement>(".about-section-four");
    const s4GlassCard = scope.querySelector<HTMLElement>(".s4-glass-card");
    const secFive = scope.querySelector<HTMLElement>(".about-section-five");
    const s5Bg = scope.querySelector<HTMLElement>(".s5-bg");

    const renderTransforms = () => {
      const stepProgress = progressRef.current * (TOTAL_SCROLL_STEPS - 1);
      const { ctaHeight, footerHeight, vh } = dimensionsRef.current;

      // 1. HERO CURTAIN SPLIT (STEPS 0 -> 1)
      const s1Prog = Math.min(Math.max(stepProgress, 0), 1);
      if (heroLeft && heroRight) {
        const clipVal = s1Prog * 100;
        heroLeft.style.clipPath = `inset(0% 50% ${clipVal}% 0%)`;
        heroRight.style.clipPath = `inset(${clipVal}% 0% 0% 50%)`;
      }
      if (heroBgs) {
        const scaleVal = (1.15 - s1Prog * 0.15).toFixed(4);
        heroBgs.forEach((bg) => {
          bg.style.transform = `translate3d(0,0,0) scale3d(${scaleVal}, ${scaleVal}, 1)`;
        });
      }
      triggerPlayOnceTextReveal(".about-section-one", stepProgress, 0.4);

      // 2. SECTION TWO (STEPS 1.2 -> 2.2)
      const s2Prog = Math.min(Math.max((stepProgress - 1.2) / 1.0, 0), 1);
      if (secTwo) {
        secTwo.style.visibility = stepProgress >= 1.0 ? "visible" : "hidden";
        secTwo.style.transform = `translate3d(0, ${(1 - s2Prog) * 100}%, 0)`;
      }
      triggerPlayOnceTextReveal(".about-section-two", stepProgress, 1.8);

      // 3. SECTION THREE (STEPS 2.4 -> 3.4)
      const s3Prog = Math.min(Math.max((stepProgress - 2.4) / 1.0, 0), 1);
      if (secThree) {
        secThree.style.visibility = stepProgress >= 2.2 ? "visible" : "hidden";
        secThree.style.clipPath = `inset(${(1 - s3Prog) * 100}% 0% 0% 0%)`;
      }
      triggerPlayOnceTextReveal(".about-section-three", stepProgress, 3.0);

      // 4. SECTION FOUR (STEPS 3.6 -> 4.6)
      const s4Prog = Math.min(Math.max((stepProgress - 3.6) / 1.0, 0), 1);
      if (secFour) {
        secFour.style.visibility = stepProgress >= 3.4 ? "visible" : "hidden";
        secFour.style.clipPath = `inset(${(1 - s4Prog) * 100}% 0% 0% 0%)`;
      }
      if (s4GlassCard) {
        const glassProg = Math.min(Math.max((stepProgress - 4.0) / 0.6, 0), 1);
        s4GlassCard.style.opacity = `${glassProg}`;
        s4GlassCard.style.transform = `translate3d(0, ${(1 - glassProg) * 40}px, 0)`;
      }
      triggerPlayOnceTextReveal(".about-section-four", stepProgress, 4.2);

      // 5. SECTION FIVE (STEPS 4.8 -> 5.8)
      const s5Prog = Math.min(Math.max((stepProgress - 4.8) / 1.0, 0), 1);
      if (secFive) {
        secFive.style.visibility = stepProgress >= 4.6 ? "visible" : "hidden";
        secFive.style.transform = `translate3d(0, ${(1 - s5Prog) * 100}%, 0)`;
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
        const parallaxProg = Math.min(Math.max((stepProgress - 4.8) / 3.4, 0), 1);
        s5Bg.style.transform = `translate3d(0, ${-parallaxProg * 50}%, 0)`;
      }

      // 6. LAYER 6 (CTA) - STEPS 8.2 -> 10.0
      const ctaProgress = Math.min(Math.max((stepProgress - 8.2) / 1.8, 0), 1);
      if (layer6Ref.current) {
        const startY = vh;
        const endY = -(ctaHeight - vh);
        const currentY = startY + (endY - startY) * ctaProgress;
        layer6Ref.current.style.transform = `translate3d(0, ${currentY}px, 0)`;
      }

      // 7. LAYER 7 (FOOTER) - STEPS 10.0 -> 12.0
      const footerProgress = Math.min(Math.max((stepProgress - 10.0) / 2.0, 0), 1);
      if (layer7Ref.current) {
        const startY = vh;
        const endY = vh - footerHeight;
        const translateY = startY + (endY - startY) * footerProgress;
        layer7Ref.current.style.transform = `translate3d(0, ${translateY}px, 0)`;
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

      requestAnimationFrame(renderTransforms);
    };

    handleScroll();

    const lenis = smootherRef?.current;
    if (lenis && typeof lenis.on === "function") {
      lenis.on("scroll", handleScroll);
    } else {
      window.addEventListener("scroll", handleScroll, { passive: true });
    }

    return () => {
      if (lenis && typeof lenis.off === "function") {
        lenis.off("scroll", handleScroll);
      } else {
        window.removeEventListener("scroll", handleScroll);
      }
      if (typeof window !== "undefined") {
        delete (window as any)._sec5GoTo;
      }
    };
  }, [introDone, preloaderDone, smootherRef, triggerSec5Hook]);

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
          className="about-pin fixed top-0 left-0 h-[100svh] w-full overflow-hidden bg-[#162D24] z-10"
        >
          {/* HERO COMPONENT */}
          <div
            className="absolute inset-0 h-full w-full structural-layer will-change-transform transform-gpu"
            style={{ zIndex: 20 }}
          >
            <Hero isMobile={false} />
          </div>

          {/* DOWNSTREAM SECTIONS */}
          {shouldLoadRest && (
            <>
              {/* SECTION ONE */}
              <div
                className="about-section-one absolute inset-0 h-full w-full structural-layer bg-[#162D24]"
                style={{ zIndex: 10 }}
              >
                <SectionOne />
              </div>

              {/* SECTION TWO */}
              <div
                className="about-section-two absolute inset-0 h-full w-full structural-layer"
                style={{ zIndex: 30, visibility: "hidden", transform: "translate3d(0, 100%, 0)" }}
              >
                <SectionTwo />
              </div>

              {/* SECTION THREE */}
              <div
                className="about-section-three absolute inset-0 h-full w-full structural-layer"
                style={{ zIndex: 40, visibility: "hidden", clipPath: "inset(100% 0% 0% 0%)" }}
              >
                <SectionThree />
              </div>

              {/* SECTION FOUR */}
              <div
                className="about-section-four absolute inset-0 h-full w-full structural-layer"
                style={{ zIndex: 50, visibility: "hidden", clipPath: "inset(100% 0% 0% 0%)" }}
              >
                <SectionFour />
              </div>

              {/* SECTION FIVE */}
              <div
                className="about-section-five absolute inset-0 h-full w-full structural-layer"
                style={{ zIndex: 60, visibility: "hidden", transform: "translate3d(0, 100%, 0)" }}
              >
                <SectionFive isActive={isSectionFiveActive} />
              </div>

              {/* SECTION CTA */}
              <div
                ref={layer6Ref}
                className="about-section-cta absolute left-0 top-0 w-full z-[90]"
                style={{ transform: "translate3d(0, 100vh, 0)" }}
              >
                <SectionCTA preloaderDone={isReady} />
              </div>

              {/* FOOTER */}
              <div
                ref={layer7Ref}
                className="about-footer-wrap absolute left-0 top-0 w-full z-[100]"
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