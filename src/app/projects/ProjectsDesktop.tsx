"use client";

import { useRef, useEffect, useState } from "react";
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

function executeDesktopSplitting(selector: string) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((element) => {
    const htmlElement = element as HTMLElement;
    if (!htmlElement || htmlElement.dataset.splitComplete === "true") return;

    const rawText = htmlElement.textContent || "";
    const linesArray = rawText.split("\n").map(line => line.trim()).filter(line => line.length > 0);

    htmlElement.innerHTML = "";
    linesArray.forEach(lineText => {
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
      htmlElement.appendChild(wrapper);
    });

    htmlElement.dataset.splitComplete = "true";
  });
}

export default function ProjectsDesktop({ preloaderDone: propPreloaderDone = true }: ContactProps) {
  const scopeRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fixedFrameRef = useRef<HTMLDivElement>(null);
  const sectionOneRef = useRef<HTMLDivElement>(null);

  const layerCTA = useRef<HTMLDivElement>(null);
  const layerFooter = useRef<HTMLDivElement>(null);

  const dimensionsRef = useRef({ sec1Height: 0, ctaHeight: 0, footerHeight: 0, vh: 0 });
  const progressRef = useRef(0);
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
        sec1Height: sectionOneRef.current?.offsetHeight || window.innerHeight,
        ctaHeight: layerCTA.current?.offsetHeight || window.innerHeight,
        footerHeight: layerFooter.current?.offsetHeight || layerFooter.current?.scrollHeight || window.innerHeight,
        vh: window.innerHeight,
      };
    };

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
  }, [shouldLoadRest]);

  // ── 3. TEXT REVEALS ──
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
        `${containerSelector} .gs-line-inner, ${containerSelector} .custom-line-inner`
      );

      lineInners.forEach((el, idx) => {
        el.style.transition = `transform 0.85s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 0.05}s, opacity 0.85s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 0.05}s`;
        el.style.transform = "translate3d(0, 0%, 0)";
        el.style.opacity = "1";
      });
    }
  };

  useEffect(() => {
    if (!shouldLoadRest || !scopeRef.current) return;

    executeDesktopSplitting(".scroll-para-1");
    useTextReveal(scopeRef, ".section-one-wrapper .reveal-text");

    return () => {
      if (scopeRef.current) {
        restoreTextReveal(scopeRef.current, ".scroll-para-1");
        restoreTextReveal(scopeRef.current, ".section-one-wrapper .reveal-text");
      }
    };
  }, [shouldLoadRest]);

  // ── 4. DIRECT GPU TRANSFORM RENDERING (SYNCHRONIZED WITH LENIS) ──
  useEffect(() => {
    if (!shouldLoadRest || !scopeRef.current) return;

    const scope = scopeRef.current;
    const heroTextWrap = scope.querySelector<HTMLElement>(".hero-text-wrap");
    const scrollPara1 = scope.querySelector<HTMLElement>(".scroll-para-1");
    const paraInners = scope.querySelectorAll<HTMLElement>(".scroll-para-1 .custom-line-inner");
    const heroBgs = scope.querySelectorAll<HTMLElement>(".projects-hero-bg, .hero-bg-anim");
    const secOne = scope.querySelector<HTMLElement>(".section-one-wrapper");
    const parallaxImg = scope.querySelector<HTMLElement>(".parallax-img-asset");
    const secTwo = scope.querySelector<HTMLElement>(".section-two-wrapper");

    let rafId: number | null = null;

    const renderTransforms = () => {
      const stepProgress = progressRef.current * (TOTAL_SCROLL_STEPS - 1);
      const { sec1Height, ctaHeight, footerHeight, vh } = dimensionsRef.current;

      // ── STEP 1: HERO TEXT, PARAGRAPH & BACKGROUND TRANSLATE ──
      const heroFadeOutProg = Math.min(Math.max(stepProgress / 0.4, 0), 1);

      if (heroTextWrap) {
        heroTextWrap.style.opacity = `${1 - heroFadeOutProg}`;
        heroTextWrap.style.transform = `translate3d(0, ${-heroFadeOutProg * 20}px, 0)`;
        heroTextWrap.style.visibility = heroFadeOutProg >= 1 ? "hidden" : "visible";
      }

      const paraStart = 0.4;
      const paraInProg = Math.min(Math.max((stepProgress - paraStart) / 0.6, 0), 1);

      if (scrollPara1) {
        scrollPara1.style.visibility = stepProgress >= paraStart ? "visible" : "hidden";
      }

      if (paraInners && paraInners.length > 0) {
        paraInners.forEach((inner) => {
          inner.style.opacity = `${paraInProg}`;
          inner.style.transform = `translate3d(0, ${(1 - paraInProg) * 100}%, 0)`;
        });
      }

      // Hero background scale AND translate upward
      const heroBgProg = Math.min(Math.max(stepProgress / 1.0, 0), 1);
      if (heroBgs && heroBgs.length > 0) {
        const scaleVal = (1.0 + heroBgProg * 0.05).toFixed(4);
        const bgY = (-heroBgProg * 12).toFixed(2);
        heroBgs.forEach((bg) => {
          bg.style.transform = `translate3d(0, ${bgY}%, 0) scale3d(${scaleVal}, ${scaleVal}, 1)`;
        });
      }

      // ── STEP 2: SECTION ONE FULL HEIGHT REVEAL (STEPS 1.0 -> 3.0) ──
      const s1Start = 1.0;
      const s1Prog = Math.min(Math.max((stepProgress - s1Start) / 2.0, 0), 1);

      if (secOne) {
        const targetY = -(sec1Height - vh);
        const currentY = vh + (targetY - vh) * s1Prog;
        secOne.style.transform = `translate3d(0, ${currentY}px, 0)`;
      }

      if (parallaxImg) {
        const imgY = (-20 + s1Prog * 40).toFixed(2);
        parallaxImg.style.transform = `translate3d(0, ${imgY}%, 0)`;
      }

      triggerPlayOnceTextReveal(".section-one-wrapper", stepProgress, 1.5);

      // ── STEP 3: SECTION TWO SLIDES OVER SECTION ONE (STEPS 3.5 -> 5.5) ──
      const s2Start = 3.5;
      const s2Prog = Math.min(Math.max((stepProgress - s2Start) / 2.0, 0), 1);

      if (secTwo) {
        secTwo.style.transform = `translate3d(0, ${(1 - s2Prog) * 100}%, 0)`;
      }

      if (stepProgress >= 4.0 && stepProgress < 7.0) {
        setIsSectionTwoActive(true);
      } else {
        setIsSectionTwoActive(false);
      }

      // ── STEP 4: LAYER CTA SLIDE (STEPS 6.0 -> 7.8) ──
      const ctaProgress = Math.min(Math.max((stepProgress - 6.0) / 1.8, 0), 1);
      if (layerCTA.current) {
        const startY = vh;
        const endY = -(ctaHeight - vh);
        const currentY = startY + (endY - startY) * ctaProgress;
        layerCTA.current.style.transform = `translate3d(0, ${currentY}px, 0)`;
      }

      // ── STEP 5: LAYER FOOTER SLIDE (STEPS 7.8 -> 9.0) ──
      const footerProgress = Math.min(Math.max((stepProgress - 7.8) / 1.2, 0), 1);
      if (layerFooter.current) {
        const startY = vh;
        const endY = vh - footerHeight;
        const translateY = startY + (endY - startY) * footerProgress;
        layerFooter.current.style.transform = `translate3d(0, ${translateY}px, 0)`;
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
  }, [shouldLoadRest, smootherRef]);

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
                className="section-one-wrapper absolute left-0 right-0 w-full h-auto structural-layer transform-gpu"
                style={{ zIndex: 20, transform: "translate3d(0, 100vh, 0)" }}
              >
                <SectionOne />
              </div>

              {/* Layer 3: Section Two Container */}
              <div
                className="section-two-wrapper absolute inset-0 w-full h-[100vh] structural-layer transform-gpu"
                style={{ zIndex: 30, transform: "translate3d(0, 100%, 0)" }}
              >
                <SectionTwo isActive={isSectionTwoActive} />
              </div>

              {/* Layer 4: CTA Section Container */}
              <div
                ref={layerCTA}
                className="projects-section-cta absolute left-0 top-0 w-full z-[95] structural-layer pointer-events-auto transform-gpu"
                style={{ transform: "translate3d(0, 100vh, 0)" }}
              >
                <SectionCTA preloaderDone={isReady} />
              </div>

              {/* Layer 5: Footer Container */}
              <div
                ref={layerFooter}
                className="projects-footer-wrap absolute left-0 top-0 w-full z-[96] structural-layer transform-gpu"
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