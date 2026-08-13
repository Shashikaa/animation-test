"use client";

import { useRef, useEffect } from "react";
import { useHeroIntro } from "@/src/app/utils/useHeroIntro";
import { restoreTextReveal } from "@/src/app/utils/useTextReveal";
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

export default function SubServicesDesktop({ pageData }: SubServicesDesktopProps) {
  const scopeRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fixedFrameRef = useRef<HTMLDivElement>(null);

  const layerCTA = useRef<HTMLDivElement>(null);
  const layerFooter = useRef<HTMLDivElement>(null);

  const dimensionsRef = useRef({ ctaHeight: 0, footerHeight: 0, vh: 0 });
  const progressRef = useRef(0);

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

  useEffect(() => {
    return () => {
      if (scopeRef.current) {
        restoreTextReveal(scopeRef.current, ".services-faq-wrap .reveal-text");
      }
    };
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
    const s10ParaTop = scope.querySelector<HTMLElement>(".s10-para-top");
    const s10Title = scope.querySelector<HTMLElement>(".s10-title");
    const s10ImgAbs = scope.querySelector<HTMLElement>(".s10-img-absolute-container");
    const s10ImgElem = scope.querySelector<HTMLElement>(".s10-img-element");
    const s10SeqContainer = scope.querySelector<HTMLElement>(".s10-seq-container");
    const faqWrap = scope.querySelector<HTMLElement>(".services-faq-wrap");

    let rafId: number | null = null;

    const renderTransforms = () => {
      const stepProgress = progressRef.current * (TOTAL_SCROLL_STEPS - 1);
      const { ctaHeight, footerHeight, vh } = dimensionsRef.current;

      // STEP 1: HERO HOLD & WIDTH SHIFT (STEPS 0.0 -> 0.8)
      const heroProg = Math.min(Math.max(stepProgress / 0.8, 0), 1);

      if (heroTextWrap) {
        heroTextWrap.style.transformOrigin = "left bottom";
        heroTextWrap.style.transform = `translate3d(0, ${heroProg * 10}px, 0) scale3d(${1 - heroProg * 0.25}, ${1 - heroProg * 0.25}, 1)`;
      }

      if (heroTopLayer) {
        heroTopLayer.style.width = `${100 - heroProg * 40}%`;
      }

      if (heroBtn) {
        const btnProg = Math.min(Math.max(stepProgress / 0.3, 0), 1);
        heroBtn.style.opacity = `${1 - btnProg}`;
        heroBtn.style.pointerEvents = btnProg >= 1 ? "none" : "auto";
      }

      // STEP 2: SECTION ONE CLIP REVEAL & HERO BG ZOOM (STEPS 0.8 -> 1.8)
      const s1Prog = Math.min(Math.max((stepProgress - 0.8) / 1.0, 0), 1);

      if (secOneWrap) {
        const clipVal = (1 - s1Prog) * 100;
        secOneWrap.style.clipPath = `inset(${clipVal}% 0% 0% 0%)`;
        (secOneWrap.style as any).webkitClipPath = `inset(${clipVal}% 0% 0% 0%)`;
      }

      if (heroBg) {
        const xPerc = -s1Prog * 8;
        const scaleVal = 1.0 + s1Prog * 0.6;
        heroBg.style.transform = `translate3d(${xPerc}%, 0, 0) scale3d(${scaleVal}, ${scaleVal}, 1)`;
      }

      // STEP 3: IMMEDIATE IMAGE FULLSCREEN EXPAND (STEPS 1.8 -> 3.2)
      const expandProg = Math.min(Math.max((stepProgress - 1.8) / 1.4, 0), 1);

      if (s10ParaTop && s10Title) {
        const textFade = Math.min(Math.max((stepProgress - 1.8) / 0.5, 0), 1);
        s10ParaTop.style.opacity = `${1 - textFade}`;
        s10ParaTop.style.transform = `translate3d(0, ${-textFade * 45}px, 0)`;
        s10Title.style.opacity = `${1 - textFade}`;
        s10Title.style.transform = `translate3d(0, ${-textFade * 45}px, 0)`;
      }

      if (s10ImgAbs) {
        const widthVal = 40 + expandProg * 60; // 40vw -> 100vw
        const heightVal = 40 + expandProg * 60; // 40vh -> 100vh
        s10ImgAbs.style.width = `${widthVal}vw`;
        s10ImgAbs.style.height = `${heightVal}vh`;
        s10ImgAbs.style.right = `${(1 - expandProg) * 5}%`;
        s10ImgAbs.style.bottom = `${(1 - expandProg) * 5}%`;
        s10ImgAbs.style.borderRadius = "0px";
      }

      if (s10ImgElem) {
        const imgScale = 1.0 + expandProg * 0.06;
        s10ImgElem.style.transform = `scale3d(${imgScale}, ${imgScale}, 1)`;
        s10ImgElem.style.borderRadius = "0px";
      }

      // STEP 4: SEQUENTIAL PARAGRAPHS ROLL UP (STEPS 3.5 -> 6.0)
      const seqProg = Math.min(Math.max((stepProgress - 3.5) / 2.5, 0), 1);

      if (s10SeqContainer) {
        const translateY = -seqProg * 1100;
        s10SeqContainer.style.transform = `translate3d(0, ${translateY}px, 0)`;
      }

      // STEP 5: FAQ SECTION SLIDE UP (STEPS 6.2 -> 7.5)
      const faqProg = Math.min(Math.max((stepProgress - 6.2) / 1.3, 0), 1);

      if (faqWrap) {
        faqWrap.style.visibility = stepProgress >= 6.0 ? "visible" : "hidden";
        faqWrap.style.transform = `translate3d(0, ${(1 - faqProg) * 100}%, 0)`;
      }

      // STEP 6: LAYER CTA SLIDE (STEPS 7.5 -> 8.5)
      const ctaProgress = Math.min(Math.max((stepProgress - 7.5) / 1.0, 0), 1);

      if (layerCTA.current) {
        layerCTA.current.style.visibility = stepProgress >= 7.3 ? "visible" : "hidden";
        const startY = vh;
        const endY = -(ctaHeight - vh);
        const currentY = startY + (endY - startY) * ctaProgress;
        layerCTA.current.style.transform = `translate3d(0, ${currentY}px, 0)`;
      }

      // STEP 7: LAYER FOOTER SLIDE (STEPS 8.5 -> 9.0)
      const footerProgress = Math.min(Math.max((stepProgress - 8.5) / 0.5, 0), 1);

      if (layerFooter.current) {
        layerFooter.current.style.visibility = stepProgress >= 8.3 ? "visible" : "hidden";
        const startY = vh;
        const endY = vh - footerHeight;
        const translateY = startY + (endY - startY) * footerProgress;
        layerFooter.current.style.transform = `translate3d(0, ${translateY}px, 0)`;
      }

      if (faqWrap && footerProgress > 0) {
        const faqScale = 1.0 - footerProgress * 0.08;
        faqWrap.style.transform = `translate3d(0, 0%, 0) scale3d(${faqScale}, ${faqScale}, 1)`;
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
                className="section-one-wrap absolute inset-0 w-full h-full z-20 overflow-hidden structural-layer transform-gpu"
                style={{
                  clipPath: "inset(100% 0% 0% 0%)",
                  WebkitClipPath: "inset(100% 0% 0% 0%)",
                }}
              >
                <SubServiceSectionOne data={pageData.sectionOne} />
              </div>

              {/* Layer 3: FAQ slide overlay */}
              <div
                className="services-faq-wrap absolute inset-0 w-full h-full z-30 overflow-hidden structural-layer transform-gpu"
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
                className="services-section-cta absolute left-0 top-0 w-full z-[95] structural-layer pointer-events-auto transform-gpu"
                style={{ transform: "translate3d(0, 100vh, 0)", visibility: "hidden" }}
              >
                <SectionCTA preloaderDone={isReady} />
              </div>

              {/* Layer 5: Footer wrapper */}
              <div
                ref={layerFooter}
                className="services-footer-wrap absolute left-0 top-0 w-full z-[96] structural-layer transform-gpu"
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