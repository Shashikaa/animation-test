"use client";

import { useRef, useEffect, useCallback } from "react";
import { useHeroIntro } from "@/src/app/utils/useHeroIntro";
import { useTextReveal, restoreTextReveal } from "@/src/app/utils/useTextReveal";
import SubServiceHero from "@/src/components/Service/SubServiceHero";
import SubServiceSectionOne from "@/src/components/Service/SubServiceSectionOne";
import SubServiceFAQSection from "@/src/components/Service/SubServiceFAQSection";
import Appsection from "@/src/components/Projects/Appsection";
import SectionCTA from "@/src/components/SectionCTA";
import Footer from "@/src/components/Footer";
import { useSite } from "@/src/app/context/SiteContext";
import { FullServiceData } from "./data";

type SubServicesDesktopProps = {
  pageData: FullServiceData;
};

const TOTAL_SCROLL_STEPS = 10;
const easeOutQuad = (t: number) => t * (2 - t);

export default function SubServicesDesktop({ pageData }: SubServicesDesktopProps) {
  const scopeRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fixedFrameRef = useRef<HTMLDivElement>(null);

  const layerCTA = useRef<HTMLDivElement>(null);
  const layerFooter = useRef<HTMLDivElement>(null);

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
  const rafId = useRef<number | null>(null);

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

  // ── 2. CACHE METRICS ──
  const measure = useCallback(() => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const vh = window.innerHeight;
    const vw = window.innerWidth;

    dimensionsRef.current = {
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

  // ── 3. TEXT REVEAL INITIALIZATION ──
  useEffect(() => {
    if (!shouldLoadRest || !scopeRef.current) return;

    useTextReveal(scopeRef, ".section-one-wrap .reveal-text");
    useTextReveal(scopeRef, ".s10-seq-container .reveal-text");
    useTextReveal(scopeRef, ".services-app-faq-layer .reveal-text");
    useTextReveal(scopeRef, ".services-faq-wrap .reveal-text");

    return () => {
      if (scopeRef.current) {
        restoreTextReveal(
          scopeRef.current,
          [
            ".section-one-wrap .reveal-text",
            ".s10-seq-container .reveal-text",
            ".services-app-faq-layer .reveal-text",
            ".services-faq-wrap .reveal-text",
          ].join(",")
        );
      }
    };
  }, [shouldLoadRest]);

  // ── 4. REVEAL TRIGGER HELPER ──
  const triggerProgressTextReveal = useCallback(
    (containerSelector: string, currentStepProg: number, threshold: number) => {
      if (!scopeRef.current) return;

      if (currentStepProg >= threshold) {
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

  // ── 5. CONTINUOUS LERP RENDER ENGINE ──
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
    const s10ParaTop = scope.querySelector<HTMLElement>(".s10-para-top");
    const s10Title = scope.querySelector<HTMLElement>(".s10-title");
    const s10ImgInnerWrap = scope.querySelector<HTMLElement>(".s10-img-inner-wrap");
    const s10ImgElem = scope.querySelector<HTMLElement>(".s10-img-element");
    const s10SeqContainer = scope.querySelector<HTMLElement>(".s10-seq-container");
    const appFaqLayer = scope.querySelector<HTMLElement>(".services-app-faq-layer");

    const renderTransforms = (time: number) => {
      if (!isRunning) return;

      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const dynamicEase = 1 - Math.exp(-EASE_FACTOR * 60 * dt);
      let delta = (targetProgress.current - smoothProgress.current) * dynamicEase;

      if (Math.abs(delta) > MAX_PROGRESS_DELTA_PER_FRAME) {
        delta = Math.sign(delta) * MAX_PROGRESS_DELTA_PER_FRAME;
      }

      smoothProgress.current = Math.min(Math.max(smoothProgress.current + delta, 0), 1);

      const currentProgress = smoothProgress.current;
      const stepProgress = currentProgress * (TOTAL_SCROLL_STEPS - 1);
      const { ctaHeight, footerHeight, vh } = dimensionsRef.current;

      // STEP 1: HERO HOLD & WIDTH SHIFT (STEPS 0.0 -> 0.8)
      const heroProg = easeOutQuad(Math.min(Math.max(stepProgress / 0.8, 0), 1));

      if (heroTextWrap) {
        heroTextWrap.style.transformOrigin = "left bottom";
        heroTextWrap.style.transform = `translate3d(0, ${(heroProg * 10).toFixed(2)}px, 0) scale3d(${(1 - heroProg * 0.25).toFixed(4)}, ${(1 - heroProg * 0.25).toFixed(4)}, 1)`;
      }

      if (heroTopLayer) {
        heroTopLayer.style.width = `${(100 - heroProg * 40).toFixed(2)}%`;
      }

      if (heroBtn) {
        const btnProg = Math.min(Math.max(stepProgress / 0.3, 0), 1);
        heroBtn.style.opacity = `${(1 - btnProg).toFixed(2)}`;
        heroBtn.style.pointerEvents = btnProg >= 1 ? "none" : "auto";
      }

      // STEP 2: SECTION ONE CLIP REVEAL & HERO BG ZOOM (STEPS 0.8 -> 1.8)
      const s1Prog = easeOutQuad(Math.min(Math.max((stepProgress - 0.8) / 1.0, 0), 1));

      if (secOneWrap) {
        const clipVal = ((1 - s1Prog) * 100).toFixed(2);
        secOneWrap.style.clipPath = `inset(${clipVal}% 0% 0% 0%)`;
        (secOneWrap.style as any).webkitClipPath = `inset(${clipVal}% 0% 0% 0%)`;
      }

      if (heroBg) {
        const xPerc = (-s1Prog * 8).toFixed(2);
        const scaleVal = (1.0 + s1Prog * 0.6).toFixed(4);
        heroBg.style.transform = `translate3d(${xPerc}%, 0, 0) scale3d(${scaleVal}, ${scaleVal}, 1)`;
      }

      // Trigger Section One Reveal at Step 1.15 (when clipPath is ~35% open)
      triggerProgressTextReveal(".section-one-wrap", stepProgress, 1.15);

      // STEP 3: DESKTOP IMAGE EXPAND (STEPS 1.8 -> 3.2)
      const expandProg = easeOutQuad(Math.min(Math.max((stepProgress - 1.8) / 1.4, 0), 1));

      if (s10ParaTop && s10Title) {
        const textFade = easeOutQuad(Math.min(Math.max((stepProgress - 1.8) / 0.5, 0), 1));
        s10ParaTop.style.opacity = `${(1 - textFade).toFixed(2)}`;
        s10ParaTop.style.transform = `translate3d(0, ${(-textFade * 45).toFixed(2)}px, 0)`;
        s10Title.style.opacity = `${(1 - textFade).toFixed(2)}`;
        s10Title.style.transform = `translate3d(0, ${(-textFade * 45).toFixed(2)}px, 0)`;
      }

      if (s10ImgInnerWrap) {
        if (expandProg <= 0) {
          s10ImgInnerWrap.style.right = "8vw";
          s10ImgInnerWrap.style.bottom = "10vh";
          s10ImgInnerWrap.style.width = "min(500px, 38vw)";
          s10ImgInnerWrap.style.height = "clamp(300px, 28vh, 420px)";
        } else {
          const currentRight = ((1 - expandProg) * 8).toFixed(2);
          const currentBottom = ((1 - expandProg) * 10).toFixed(2);

          s10ImgInnerWrap.style.right = `${currentRight}vw`;
          s10ImgInnerWrap.style.bottom = `${currentBottom}vh`;
          s10ImgInnerWrap.style.width = `calc(min(500px, 38vw) + (100vw - min(500px, 38vw)) * ${expandProg.toFixed(4)})`;
          s10ImgInnerWrap.style.height = `calc(clamp(300px, 28vh, 420px) + (100vh - clamp(300px, 28vh, 420px)) * ${expandProg.toFixed(4)})`;
        }
      }

      if (s10ImgElem) {
        const imgScale = (1.15 - expandProg * 0.15).toFixed(4);
        s10ImgElem.style.transform = `scale3d(${imgScale}, ${imgScale}, 1)`;
      }

      // STEP 4: SEQUENTIAL PARAGRAPHS ROLL UP (STEPS 3.2 -> 5.5)
      const seqProg = easeOutQuad(Math.min(Math.max((stepProgress - 3.2) / 2.3, 0), 1));

      if (s10SeqContainer) {
        const translateY = (-seqProg * 1400).toFixed(2);
        s10SeqContainer.style.transform = `translate3d(0, ${translateY}px, 0)`;
      }

      // Trigger paragraph reveals early at Step 2.6 (as image expansion starts)
      triggerProgressTextReveal(".s10-seq-container", stepProgress, 2.6);

      // STEP 5: APP + FAQ MOVE AS ONE CONTINUOUS SHEET (STEPS 5.5 -> 7.5)
      const appFaqProgress = easeOutQuad(
        Math.min(Math.max((stepProgress - 5.5) / 2.0, 0), 1)
      );

      if (appFaqLayer) {
        appFaqLayer.style.visibility = stepProgress >= 5.4 ? "visible" : "hidden";
        const startY = vh;
        const endY = -vh;
        const currentY = startY + (endY - startY) * appFaqProgress;
        appFaqLayer.style.transform = `translate3d(0, ${currentY.toFixed(2)}px, 0)`;
        appFaqLayer.style.opacity = "1";
      }

      // Trigger Appsection reveal at Step 5.7 (as the layer starts sliding up)
      triggerProgressTextReveal(".services-app-faq-layer", stepProgress, 5.7);

      // Trigger FAQ section reveal at Step 6.5 (as FAQ rises into the lower viewport)
      triggerProgressTextReveal(".services-faq-wrap", stepProgress, 6.5);

      // STEP 6: LAYER CTA SLIDE (STEPS 7.5 -> 8.5)
      const ctaProgress = easeOutQuad(Math.min(Math.max((stepProgress - 7.5) / 1.0, 0), 1));

      if (layerCTA.current) {
        layerCTA.current.style.visibility = stepProgress >= 7.4 ? "visible" : "hidden";
        const startY = vh;
        const endY = -(ctaHeight - vh);
        const currentY = startY + (endY - startY) * ctaProgress;
        layerCTA.current.style.transform = `translate3d(0, ${currentY.toFixed(2)}px, 0)`;
      }

      // STEP 7: LAYER FOOTER & CTA FADE OUT (STEPS 8.5 -> 9.0)
      const footerProgress = easeOutQuad(Math.min(Math.max((stepProgress - 8.5) / 0.5, 0), 1));

      if (layerCTA.current) {
        const innerOpacity = (1 - footerProgress).toFixed(3);
        layerCTA.current.style.setProperty("--cta-inner-opacity", innerOpacity);
      }

      if (layerFooter.current) {
        layerFooter.current.style.visibility = stepProgress >= 8.4 ? "visible" : "hidden";
        const startY = vh;
        const endY = vh - footerHeight;
        const translateY = startY + (endY - startY) * footerProgress;
        layerFooter.current.style.transform = `translate3d(0, ${translateY.toFixed(2)}px, 0)`;
      }

      if (appFaqLayer) {
        if (footerProgress > 0) {
          const upperOpacity = (1 - footerProgress).toFixed(3);
          const faqScale = (1.0 - footerProgress * 0.08).toFixed(4);
          appFaqLayer.style.opacity = upperOpacity;
          appFaqLayer.style.transform = `translate3d(0, ${-vh}px, 0) scale3d(${faqScale}, ${faqScale}, 1)`;
        } else if (stepProgress >= 7.5) {
          appFaqLayer.style.opacity = "1";
          appFaqLayer.style.transform = `translate3d(0, ${-vh}px, 0) scale3d(1, 1, 1)`;
        }
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
  }, [shouldLoadRest, smootherRef, triggerProgressTextReveal]);

  const isReady = preloaderDone && introDone;

  return (
    <div ref={scopeRef} className="w-full bg-black">
      <div
        ref={trackRef}
        className="sub-services-track relative w-full"
        style={{ height: `${TOTAL_SCROLL_STEPS * 100}vh` }}
      >
        <div
          ref={fixedFrameRef}
          className="sub-services-pin fixed top-0 left-0 h-[100vh] w-full overflow-hidden bg-black z-10 transform-gpu"
        >
          {/* Layer 1: Hero view base */}
          <div className="services-hero-wrap absolute inset-0 z-10 pointer-events-auto w-full h-full structural-layer transform-gpu">
            <SubServiceHero data={pageData.hero} />
          </div>

          {/* DOWNSTREAM SECTIONS */}
          {shouldLoadRest && (
            <>
              {/* Layer 2: Section One scrolling sheet */}
              <div
                className="section-one-wrap absolute inset-0 w-full h-full z-20 overflow-hidden structural-layer transform-gpu will-change-[clip-path]"
                style={{
                  clipPath: "inset(100% 0% 0% 0%)",
                  WebkitClipPath: "inset(100% 0% 0% 0%)",
                }}
              >
                <SubServiceSectionOne data={pageData.sectionOne} />
              </div>

              {/* Layer 3: App + FAQ continuous slide sheet */}
              <div
                className="services-app-faq-layer absolute left-0 top-0 w-full h-[200vh] z-30 bg-black structural-layer transform-gpu will-change-transform"
                style={{
                  visibility: "hidden",
                  transform: "translate3d(0, 100vh, 0)",
                }}
              >
                <div className="w-full h-screen overflow-hidden bg-black">
                  <Appsection />
                </div>

                <div className="services-faq-wrap w-full h-screen overflow-hidden bg-black">
                  <SubServiceFAQSection data={pageData.sectionTwo} />
                </div>
              </div>

              {/* Layer 4: Section CTA wrapper */}
              <div
                ref={layerCTA}
                className="services-section-cta absolute left-0 top-0 w-full z-[95] structural-layer pointer-events-auto transform-gpu will-change-transform"
                style={{ transform: "translate3d(0, 100vh, 0)", visibility: "hidden" }}
              >
                <SectionCTA preloaderDone={isReady} />
              </div>

              {/* Layer 5: Footer wrapper */}
              <div
                ref={layerFooter}
                className="services-footer-wrap absolute left-0 top-0 w-full z-[96] structural-layer transform-gpu will-change-transform"
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