"use client";

import { useRef, useEffect, useCallback } from "react";
import { useHeroIntro } from "@/src/app/utils/useHeroIntro";
import { useTextReveal, restoreTextReveal } from "@/src/app/utils/useTextReveal";
import SubServiceHero from "@/src/components/Service/SubServiceHero";
import SubServiceSectionOne from "@/src/components/Service/SubServiceSectionOne";
import SubServiceFAQSection from "@/src/components/Service/SubServiceFAQSection";
import SectionCTA from "@/src/components/SectionCTA";
import Footer from "@/src/components/Footer";
import { useSite } from "@/src/app/context/SiteContext";
import { FullServiceData } from "./data";

type SubServicesDesktopProps = {
  pageData: FullServiceData;
};

const TOTAL_SCROLL_STEPS = 10;

// QUADRATIC EASING MATCHING ABOUT DESKTOP
const easeOutQuad = (t: number) => t * (2 - t);

// Utility for DOM text line splitting matching About/Projects implementation
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

  const targetProgress = useRef(0);
  const revealedSections = useRef<Set<string>>(new Set());
  const rafId = useRef<number | null>(null);

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
    if (layerCTA.current) resizeObserver.observe(layerCTA.current);
    if (layerFooter.current) resizeObserver.observe(layerFooter.current);

    window.addEventListener("resize", measure, { passive: true });
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [shouldLoadRest, measure]);

  // ── 3. TEXT REVEAL LOGIC (EXACT ABOUT TRIGGER IMPLEMENTATION) ──
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

  // Prepare custom line splitting & setup text reveal instances
  useEffect(() => {
    if (!shouldLoadRest || !scopeRef.current) return;

    // Split custom paragraphs into line-wrap structures matching About desktop
    executeDesktopSplitting(".scroll-para-1");
    executeDesktopSplitting(".reveal-text");
    executeDesktopSplitting(".services-faq-wrap .reveal-text");

    return () => {
      if (scopeRef.current) {
        restoreTextReveal(scopeRef.current, ".scroll-para-1");
        restoreTextReveal(scopeRef.current, ".reveal-text");
        restoreTextReveal(scopeRef.current, ".services-faq-wrap .reveal-text");
      }
    };
  }, [shouldLoadRest]);

  // ── 4. CONTINUOUS LERP RENDER ENGINE ──
  useEffect(() => {
    if (!shouldLoadRest || !scopeRef.current) return;

    const scope = scopeRef.current;
    let isRunning = true;
    let currentProgress = targetProgress.current;

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
    const faqWrap = scope.querySelector<HTMLElement>(".services-faq-wrap");

    [
      heroTextWrap,
      heroTopLayer,
      secOneWrap,
      heroBg,
      s10ParaTop,
      s10Title,
      s10ImgInnerWrap,
      s10ImgElem,
      s10SeqContainer,
      faqWrap,
      layerCTA.current,
      layerFooter.current,
    ].forEach((el) => {
      if (el) {
        el.style.willChange = "transform, opacity, clip-path";
        el.style.transform = "translate3d(0, 0, 0)";
      }
    });

    const renderTransforms = () => {
      if (!isRunning) return;

      currentProgress += (targetProgress.current - currentProgress) * 0.08;
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

      // ── TRIGGER TEXT REVEALS AT EXACT STEP THRESHOLDS ──
      // Section One Heading / Top Paragraph
      triggerPlayOnceTextReveal(".section-one-wrap", stepProgress, 0.95);

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

      // STEP 4: SEQUENTIAL PARAGRAPHS ROLL UP (STEPS 3.5 -> 6.0)
      const seqProg = easeOutQuad(Math.min(Math.max((stepProgress - 3.5) / 2.5, 0), 1));

      if (s10SeqContainer) {
        const translateY = (-seqProg * 1100).toFixed(2);
        s10SeqContainer.style.transform = `translate3d(0, ${translateY}px, 0)`;
      }

      // Trigger paragraph reveal inside the sequential container
      triggerPlayOnceTextReveal(".s10-seq-container", stepProgress, 3.6);

      // STEP 5: FAQ SECTION SLIDE UP (STEPS 6.2 -> 7.5)
      const faqProg = easeOutQuad(Math.min(Math.max((stepProgress - 6.2) / 1.3, 0), 1));

      if (faqWrap) {
        faqWrap.style.visibility = stepProgress >= 6.0 ? "visible" : "hidden";
        if (stepProgress < 8.5) {
          faqWrap.style.transform = `translate3d(0, ${((1 - faqProg) * 100).toFixed(2)}%, 0)`;
          faqWrap.style.opacity = "1";
        }
      }

      // Trigger FAQ section title and text reveals
      triggerPlayOnceTextReveal(".services-faq-wrap", stepProgress, 6.4);

      // STEP 6: LAYER CTA SLIDE (STEPS 7.5 -> 8.5)
      const ctaProgress = easeOutQuad(Math.min(Math.max((stepProgress - 7.5) / 1.0, 0), 1));

      if (layerCTA.current) {
        layerCTA.current.style.visibility = stepProgress >= 7.3 ? "visible" : "hidden";
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
        layerFooter.current.style.visibility = stepProgress >= 8.3 ? "visible" : "hidden";
        const startY = vh;
        const endY = vh - footerHeight;
        const translateY = startY + (endY - startY) * footerProgress;
        layerFooter.current.style.transform = `translate3d(0, ${translateY.toFixed(2)}px, 0)`;
      }

      if (faqWrap) {
        if (footerProgress > 0) {
          const upperOpacity = (1 - footerProgress).toFixed(3);
          const faqScale = (1.0 - footerProgress * 0.08).toFixed(4);
          faqWrap.style.opacity = upperOpacity;
          faqWrap.style.transform = `translate3d(0, 0%, 0) scale3d(${faqScale}, ${faqScale}, 1)`;
        } else if (stepProgress >= 7.5 && stepProgress < 8.5) {
          faqWrap.style.opacity = "1";
          faqWrap.style.transform = "translate3d(0, 0%, 0) scale3d(1, 1, 1)";
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
  }, [shouldLoadRest, smootherRef, triggerPlayOnceTextReveal]);

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

              {/* Layer 3: FAQ slide overlay */}
              <div
                className="services-faq-wrap absolute inset-0 w-full h-full z-30 overflow-hidden bg-black structural-layer transform-gpu will-change-transform"
                style={{
                  visibility: "hidden",
                  transform: "translate3d(0, 100%, 0)",
                }}
              >
                <SubServiceFAQSection data={pageData.sectionTwo} />
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