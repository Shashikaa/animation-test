"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import ProjectsHero from "../../components/Projects/ProjectsHero";
import { useTextReveal, restoreTextReveal } from "@/src/app/utils/useTextReveal";
import SectionOne from "@/src/components/Projects/SectionOne";
import SectionTwo from "@/src/components/Projects/SectionTwo";
import SectionCTA from "@/src/components/SectionCTA";
import Footer from "@/src/components/Footer";
import { useHeroIntro } from "@/src/app/utils/useHeroIntro";
import { useSite } from "@/src/app/context/SiteContext";

type ContactProps = {
  preloaderDone?: boolean;
};

const TOTAL_SCROLL_STEPS = 10;

// Quadratic Easing matching About component setup
const easeOutQuad = (t: number) => t * (2 - t);

// Utility for DOM text line splitting matching About implementation
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
      inner.textContent = lineText;

      wrapper.appendChild(inner);
      element.appendChild(wrapper);
    });

    element.dataset.splitComplete = "true";
  });
}

export default function ProjectsDesktop({ preloaderDone: propPreloaderDone = true }: ContactProps) {
  const scopeRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fixedFrameRef = useRef<HTMLDivElement>(null);
  const sectionOneRef = useRef<HTMLDivElement>(null);

  const layerCTA = useRef<HTMLDivElement>(null);
  const layerFooter = useRef<HTMLDivElement>(null);

  const dimensionsRef = useRef({
    sec1Height: 0,
    ctaHeight: 0,
    footerHeight: 0,
    vh: 0,
    trackTopOffset: 0,
    totalScrollable: 0,
  });

  const targetProgress = useRef(0);
  const revealedSections = useRef<Set<string>>(new Set());
  const rafId = useRef<number | null>(null);

  const [isSectionTwoActive, setIsSectionTwoActive] = useState(false);

  const { smootherRef } = useSite();
  const { introDone, preloaderDone, shouldLoadRest } = useHeroIntro(scopeRef, {
    isMobile: false,
    introDurationMs: 2800,
    unlockScrollEarlyMs: 1800,
  });

  // ── 1. UNLOCK LENIS / SCROLL (MATCHING ABOUT LOGIC) ──
  useEffect(() => {
    const lenis = smootherRef?.current;

    if (!preloaderDone || !shouldLoadRest) {
      if (lenis && typeof lenis.stop === "function") lenis.stop();
      targetProgress.current = 0;
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

  // ── 2. CACHE METRICS ──
  const measure = useCallback(() => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const vh = window.innerHeight;

    dimensionsRef.current = {
      sec1Height: sectionOneRef.current?.offsetHeight || vh,
      ctaHeight: layerCTA.current?.offsetHeight || vh,
      footerHeight: layerFooter.current?.offsetHeight || layerFooter.current?.scrollHeight || vh,
      vh,
      trackTopOffset: window.scrollY + rect.top,
      totalScrollable: rect.height - vh,
    };
  }, []);

  useEffect(() => {
    if (!shouldLoadRest) return;
    measure();

    const resizeObserver = new ResizeObserver(() => measure());
    if (sectionOneRef.current) resizeObserver.observe(sectionOneRef.current);
    if (layerCTA.current) resizeObserver.observe(layerCTA.current);
    if (layerFooter.current) resizeObserver.observe(layerFooter.current);

    window.addEventListener("resize", measure, { passive: true });
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [shouldLoadRest, measure]);

  // ── 3. TEXT REVEAL LOGIC (EXACT ABOUT implementation) ──
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

    // Apply text splitting and hook text reveals exactly like About
    executeDesktopSplitting(".scroll-para-1");
    useTextReveal(scopeRef, ".reveal-text");
    useTextReveal(scopeRef, ".section-one-wrapper .reveal-text");

    return () => {
      if (scopeRef.current) {
        restoreTextReveal(scopeRef.current, ".scroll-para-1");
        restoreTextReveal(scopeRef.current, ".reveal-text");
        restoreTextReveal(scopeRef.current, ".section-one-wrapper .reveal-text");
      }
    };
  }, [shouldLoadRest]);

  // ── 4. CONTINUOUS LERP RENDER ENGINE (MATCHING ABOUT SCROLL LOGIC) ──
  useEffect(() => {
    if (!shouldLoadRest || !scopeRef.current) return;

    const scope = scopeRef.current;
    let isRunning = true;
    let currentProgress = targetProgress.current;

    // Cache element references inside closure
    const heroTextWrap = scope.querySelector<HTMLElement>(".hero-text-wrap");
    const scrollPara1 = scope.querySelector<HTMLElement>(".scroll-para-1");
    const paraInners = scope.querySelectorAll<HTMLElement>(".scroll-para-1 .custom-line-inner");
    const heroBgs = scope.querySelectorAll<HTMLElement>(".projects-hero-bg, .hero-bg-anim");
    const secOne = scope.querySelector<HTMLElement>(".section-one-wrapper");
    const parallaxImg = scope.querySelector<HTMLElement>(".parallax-img-asset");
    const secTwo = scope.querySelector<HTMLElement>(".section-two-wrapper");

    // Promote elements for hardware acceleration
    [secOne, parallaxImg, secTwo, layerCTA.current, layerFooter.current].forEach((el) => {
      if (el) {
        el.style.willChange = "transform, opacity";
        el.style.transform = "translate3d(0, 0, 0)";
      }
    });

    const renderTransforms = () => {
      if (!isRunning) return;

      // Inertial Lerp calculation (identical to About smoothing factor)
      currentProgress += (targetProgress.current - currentProgress) * 0.08;

      const stepProgress = currentProgress * (TOTAL_SCROLL_STEPS - 1);
      const { sec1Height, ctaHeight, footerHeight, vh } = dimensionsRef.current;

      // ── STEP 1: HERO TEXT, PARAGRAPH & BACKGROUND ──
      const heroFadeOutProg = easeOutQuad(Math.min(Math.max(stepProgress / 0.4, 0), 1));

      if (heroTextWrap) {
        heroTextWrap.style.opacity = `${(1 - heroFadeOutProg).toFixed(3)}`;
        heroTextWrap.style.transform = `translate3d(0, ${(-heroFadeOutProg * 20).toFixed(2)}px, 0)`;
        heroTextWrap.style.visibility = heroFadeOutProg >= 1 ? "hidden" : "visible";
      }

      const paraStart = 0.4;
      const paraInProg = easeOutQuad(Math.min(Math.max((stepProgress - paraStart) / 0.6, 0), 1));

      if (scrollPara1) {
        scrollPara1.style.visibility = stepProgress >= paraStart ? "visible" : "hidden";
      }

      if (paraInners && paraInners.length > 0) {
        paraInners.forEach((inner) => {
          inner.style.opacity = `${paraInProg.toFixed(3)}`;
          inner.style.transform = `translate3d(0, ${((1 - paraInProg) * 100).toFixed(2)}%, 0)`;
        });
      }

      const heroBgProg = easeOutQuad(Math.min(Math.max(stepProgress / 1.0, 0), 1));
      if (heroBgs && heroBgs.length > 0) {
        const scaleVal = (1.0 + heroBgProg * 0.05).toFixed(4);
        const bgY = (-heroBgProg * 12).toFixed(2);
        heroBgs.forEach((bg) => {
          bg.style.transform = `translate3d(0, ${bgY}%, 0) scale3d(${scaleVal}, ${scaleVal}, 1)`;
        });
      }

      // ── STEP 2: SECTION ONE SLIDE & REVEAL (STEPS 1.0 -> 3.0) ──
      const s1Start = 1.0;
      const s1Prog = easeOutQuad(Math.min(Math.max((stepProgress - s1Start) / 2.0, 0), 1));

      if (secOne) {
        const targetY = -(sec1Height - vh);
        const currentY = vh + (targetY - vh) * s1Prog;
        secOne.style.transform = `translate3d(0, ${currentY.toFixed(2)}px, 0)`;
      }

      if (parallaxImg) {
        const imgY = (-20 + s1Prog * 40).toFixed(2);
        parallaxImg.style.transform = `translate3d(0, ${imgY}%, 0)`;
      }

      // Play text reveal based on step threshold
      triggerPlayOnceTextReveal(".section-one-wrapper", stepProgress, 1.5);

      // ── STEP 3: SECTION TWO SLIDE (STEPS 3.5 -> 5.5) ──
      const s2Start = 3.5;
      const s2Prog = easeOutQuad(Math.min(Math.max((stepProgress - s2Start) / 2.0, 0), 1));

      if (secTwo) {
        secTwo.style.transform = `translate3d(0, ${((1 - s2Prog) * 100).toFixed(3)}%, 0)`;
      }

      if (stepProgress >= 4.0 && stepProgress < 7.0) {
        setIsSectionTwoActive(true);
      } else {
        setIsSectionTwoActive(false);
      }

      // ── STEP 4: LAYER CTA SLIDE (STEPS 6.0 -> 7.8) ──
      const ctaProgress = easeOutQuad(Math.min(Math.max((stepProgress - 6.0) / 1.8, 0), 1));
      if (layerCTA.current) {
        const startY = vh;
        const endY = -(ctaHeight - vh);
        const currentY = startY + (endY - startY) * ctaProgress;
        layerCTA.current.style.transform = `translate3d(0, ${currentY.toFixed(2)}px, 0)`;
      }

      // ── STEP 5: LAYER FOOTER & CTA FADE OUT (STEPS 7.8 -> 9.0 - EXACT ABOUT LOGIC) ──
      const footerProgress = easeOutQuad(Math.min(Math.max((stepProgress - 7.8) / 1.2, 0), 1));

      if (layerCTA.current) {
        // Sets CSS variable matching SectionCTA's internal opacity styling in About
        const innerOpacity = (1 - footerProgress).toFixed(3);
        layerCTA.current.style.setProperty("--cta-inner-opacity", innerOpacity);
      }

      if (layerFooter.current) {
        const startY = vh;
        const endY = vh - footerHeight;
        const translateY = startY + (endY - startY) * footerProgress;
        layerFooter.current.style.transform = `translate3d(0, ${translateY.toFixed(2)}px, 0)`;
      }

      // Smooth opacity decrease on prior sections as footer rises
      const upperOpacity = (1 - footerProgress).toFixed(3);

      if (secTwo) {
        secTwo.style.opacity = upperOpacity;
      }
      if (secOne) {
        secOne.style.opacity = upperOpacity;
      }

      rafId.current = requestAnimationFrame(renderTransforms);
    };

    const handleScroll = (e?: any) => {
      const scrollY = e?.scroll !== undefined ? e.scroll : window.scrollY;
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
  }, [shouldLoadRest, smootherRef, triggerPlayOnceTextReveal]);

  const isReady = preloaderDone && introDone;

  return (
    <div ref={scopeRef} className="w-full bg-black">
      <div
        ref={trackRef}
        className="projects-track-container relative w-full"
        style={{ height: `${TOTAL_SCROLL_STEPS * 100}vh` }}
      >
        <div
          ref={fixedFrameRef}
          className="projects-pin fixed top-0 left-0 h-[100vh] w-full overflow-hidden bg-black z-10 transform-gpu"
        >
          {/* Layer 1: Hero Section */}
          <div
            className="projects-hero-master absolute inset-0 w-full h-full structural-layer will-change-transform transform-gpu"
            style={{ zIndex: 10 }}
          >
            <ProjectsHero />
          </div>

          {/* DOWNSTREAM SECTIONS */}
          {shouldLoadRest && (
            <>
              {/* Layer 2: Section One Container */}
              <div
                ref={sectionOneRef}
                className="section-one-wrapper absolute left-0 right-0 w-full h-auto structural-layer transform-gpu will-change-transform"
                style={{ zIndex: 20, transform: "translate3d(0, 100vh, 0)" }}
              >
                <SectionOne />
              </div>

              {/* Layer 3: Section Two Container */}
              <div
                className="section-two-wrapper absolute inset-0 w-full h-[100vh] structural-layer transform-gpu will-change-transform"
                style={{ zIndex: 30, transform: "translate3d(0, 100%, 0)" }}
              >
                <SectionTwo isActive={isSectionTwoActive} />
              </div>

              {/* Layer 4: CTA Section Container */}
              <div
                ref={layerCTA}
                className="projects-section-cta absolute left-0 top-0 w-full z-[95] structural-layer pointer-events-auto transform-gpu will-change-transform"
                style={{ transform: "translate3d(0, 100vh, 0)" }}
              >
                <SectionCTA preloaderDone={isReady} />
              </div>

              {/* Layer 5: Footer Container */}
              <div
                ref={layerFooter}
                className="projects-footer-wrap absolute left-0 top-0 w-full z-[96] structural-layer transform-gpu will-change-transform"
                style={{ zIndex: 96, transform: "translate3d(0, 100vh, 0)" }}
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