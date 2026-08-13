"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import ProjectScrollHero from "@/src/components/Projects/ProjectScrollHero";
import ProjectInfoSlide from "@/src/components/Projects/ProjectInfoSlide";
import Appsection from "@/src/components/Projects/Appsection";
import FAQSection from "@/src/components/contact/FAQSection";
import Footer from "@/src/components/Footer";
import { useHeroIntro } from "@/src/app/utils/useHeroIntro";
import { useSite } from "@/src/app/context/SiteContext";
import { FullServiceData } from "./data";

// QUADRATIC EASING MATCHING HOME DESKTOP
const easeOutQuad = (t: number) => t * (2 - t);

type SubServicesDesktopProps = {
  pageData: FullServiceData;
};

export default function SingleProjectPageDesktop({ pageData }: SubServicesDesktopProps) {
  const scopeRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fixedFrameRef = useRef<HTMLDivElement>(null);

  const heroPanelRef = useRef<HTMLDivElement>(null);
  const projectInfoRef = useRef<HTMLDivElement>(null);
  const appSectionRef = useRef<HTMLDivElement>(null);
  const faqSectionRef = useRef<HTMLDivElement>(null);
  const footerLayerRef = useRef<HTMLDivElement>(null);

  const [isProjectInfoActive, setIsProjectInfoActive] = useState(false);

  const scrollMetricsRef = useRef({
    totalScrollable: 0,
    vh: 0,
    trackTopOffset: 0,
    appHeight: 0,
    faqHeight: 0,
    footerHeight: 0,
  });

  const targetProgress = useRef(0);
  const rafId = useRef<number | null>(null);
  const lastInfoIdx = useRef<number>(-1);

  const { smootherRef } = useSite();
  const { preloaderDone, shouldLoadRest } = useHeroIntro(scopeRef, {
    isMobile: false,
    introDurationMs: 2800,
    unlockScrollEarlyMs: 1800,
  });

  const infoSlides = pageData.slides || [];
  const infoSlidesCount = infoSlides.length;

  const triggerInfoHook = useCallback((nextIdx: number) => {
    if (nextIdx !== lastInfoIdx.current) {
      lastInfoIdx.current = nextIdx;
      if (typeof window !== "undefined" && (window as any)._projectInfoGoTo) {
        (window as any)._projectInfoGoTo(nextIdx);
      }
    }
  }, []);

  // ── 1. UNLOCK LENIS & INITIALIZE ──
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

  // ── 2. CACHE METRICS TO PREVENT LAYOUT THRASHING ──
  const updateMetrics = useCallback(() => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const vh = window.innerHeight;

    scrollMetricsRef.current = {
      totalScrollable: rect.height - vh,
      vh,
      trackTopOffset: window.scrollY + rect.top,
      appHeight: appSectionRef.current?.offsetHeight || vh,
      faqHeight: faqSectionRef.current?.offsetHeight || vh,
      footerHeight: footerLayerRef.current?.offsetHeight || vh,
    };
  }, []);

  useEffect(() => {
    if (!shouldLoadRest) return;
    updateMetrics();

    const resizeObserver = new ResizeObserver(() => updateMetrics());
    if (appSectionRef.current) resizeObserver.observe(appSectionRef.current);
    if (faqSectionRef.current) resizeObserver.observe(faqSectionRef.current);
    if (footerLayerRef.current) resizeObserver.observe(footerLayerRef.current);

    window.addEventListener("resize", updateMetrics, { passive: true });
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateMetrics);
    };
  }, [shouldLoadRest, updateMetrics]);

  // ── 3. ULTRA-SMOOTH CONTINUOUS LERP RENDER ENGINE (HOMEDESKTOP PARITY) ──
  useEffect(() => {
    if (!shouldLoadRest || !scopeRef.current) return;

    const scope = scopeRef.current;
    let isRunning = true;
    let currentProgress = targetProgress.current;

    // Cache element references inside the closure
    const heroTextWrap = scope.querySelector<HTMLElement>(".hero-text-wrap");
    const phoneWrapper = scope.querySelector<HTMLElement>(".appsec-phone-wrapper");

    // Hardware promote element layers for ultra-smooth GPU composition
    [
      heroPanelRef.current,
      projectInfoRef.current,
      appSectionRef.current,
      faqSectionRef.current,
      footerLayerRef.current,
    ].forEach((el) => {
      if (el) {
        el.style.willChange = "transform, opacity, clip-path";
        el.style.transform = "translate3d(0, 0, 0)";
      }
    });

    const renderTransforms = () => {
      if (!isRunning) return;

      // CONTINUOUS SILKY PHYSICS LERP INERTIA
      currentProgress += (targetProgress.current - currentProgress) * 0.08;

      const subSlidesSteps = Math.max(0, infoSlidesCount - 1);
      const PAUSE_BUFFER = 0.5;
      const totalSteps = 4 + subSlidesSteps + PAUSE_BUFFER;
      const stepProgress = currentProgress * totalSteps;

      const { vh, appHeight, faqHeight, footerHeight } = scrollMetricsRef.current;

      // STEP 1: Hero Text Fade Out + Project Info Slide-Up (0.0 -> 1.0)
      const infoProg = easeOutQuad(Math.min(Math.max(stepProgress, 0), 1));

      if (heroTextWrap) {
        heroTextWrap.style.opacity = `${(1 - infoProg).toFixed(3)}`;
        heroTextWrap.style.transform = `translate3d(0, ${(-30 * infoProg).toFixed(2)}px, 0)`;
        heroTextWrap.style.visibility = infoProg >= 1 ? "hidden" : "visible";
      }

      if (projectInfoRef.current) {
        projectInfoRef.current.style.transform = `translate3d(0, ${((1 - infoProg) * 100).toFixed(3)}%, 0)`;
      }

      const infoEndStep = 1.0 + subSlidesSteps + PAUSE_BUFFER;
      if (stepProgress >= 0.8 && stepProgress < infoEndStep + 0.3) {
        setIsProjectInfoActive(true);
      } else {
        setIsProjectInfoActive(false);
      }

      // STEP 2: Sequential Inner Info Slides
      if (subSlidesSteps > 0) {
        const subProgress = Math.min(Math.max(stepProgress - 1.0, 0), subSlidesSteps);
        const currentSubIdx = Math.min(infoSlidesCount - 1, Math.floor(subProgress));
        triggerInfoHook(currentSubIdx);

        infoSlides.forEach((_, idx) => {
          if (idx === 0) return;

          const layerProg = Math.min(Math.max(stepProgress - (1.0 + idx - 1), 0), 1);
          const imgLayer = scope.querySelector<HTMLElement>(`.info-img-layer-${idx}`);
          const imgInner = scope.querySelector<HTMLElement>(`.info-img-layer-${idx} .info-image-inner`);

          if (imgLayer) {
            const clipTop = (100 - layerProg * 100).toFixed(2);
            imgLayer.style.clipPath = `polygon(0% ${clipTop}%, 100% ${clipTop}%, 100% 100%, 0% 100%)`;
          }
          if (imgInner) {
            const scaleVal = (1.25 - layerProg * 0.25).toFixed(4);
            imgInner.style.transform = `scale3d(${scaleVal}, ${scaleVal}, 1)`;
          }
        });
      } else {
        triggerInfoHook(0);
      }

      // STEP 3: Dynamic Height App Section Reveal
      const appStartStep = 1.0 + subSlidesSteps + PAUSE_BUFFER;
      const appProg = easeOutQuad(Math.min(Math.max(stepProgress - appStartStep, 0), 1));

      if (appSectionRef.current) {
        const startY = vh;
        const endY = appHeight > vh ? -(appHeight - vh) : 0;
        const currentY = startY + (endY - startY) * appProg;
        appSectionRef.current.style.transform = `translate3d(0, ${currentY.toFixed(2)}px, 0)`;
      }
      if (projectInfoRef.current && appProg > 0) {
        projectInfoRef.current.style.transform = `translate3d(0, ${(-appProg * 15).toFixed(2)}%, 0)`;
      }

      if (phoneWrapper) {
        const phoneProg = Math.min(Math.max((stepProgress - (appStartStep + 0.2)) / 0.8, 0), 1);
        phoneWrapper.style.opacity = `${phoneProg.toFixed(3)}`;
        phoneWrapper.style.transform = `translate3d(0, ${((1 - phoneProg) * 30).toFixed(2)}px, 0)`;
      }

      // STEP 4: Dynamic Height FAQ Section Reveal
      const faqStartStep = appStartStep + 1.0;
      const faqProg = easeOutQuad(Math.min(Math.max(stepProgress - faqStartStep, 0), 1));

      if (faqSectionRef.current) {
        const startY = vh;
        const endY = faqHeight > vh ? -(faqHeight - vh) : 0;
        const currentY = startY + (endY - startY) * faqProg;
        faqSectionRef.current.style.transform = `translate3d(0, ${currentY.toFixed(2)}px, 0)`;
      }

      // STEP 5: Footer Reveal
      const footerStartStep = faqStartStep + 1.0;
      const footerProg = easeOutQuad(Math.min(Math.max(stepProgress - footerStartStep, 0), 1));

      if (footerLayerRef.current) {
        const startY = vh;
        const endY = vh - footerHeight;
        const translateY = startY + (endY - startY) * footerProg;
        footerLayerRef.current.style.transform = `translate3d(0, ${translateY.toFixed(2)}px, 0)`;
      }

      // Keep RAF loop running continuously for momentum smoothing
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
      if (typeof window !== "undefined") delete (window as any)._projectInfoGoTo;
    };
  }, [shouldLoadRest, smootherRef, infoSlidesCount, infoSlides, triggerInfoHook]);

  // Scaled height prevents the layout track from feeling too long/short
  const containerHeightVh = 400 + infoSlidesCount * 100;

  return (
    <div ref={scopeRef} className="w-full bg-[#162D24]">
      <div
        ref={trackRef}
        className="single-project-track relative w-full"
        style={{ height: `${containerHeightVh}vh` }}
      >
        <div
          ref={fixedFrameRef}
          className="fixed top-0 left-0 w-full overflow-hidden bg-[#162D24] z-10 h-[100dvh] transform-gpu"
        >
          {/* Layer 1: Hero */}
          <div
            ref={heroPanelRef}
            className="project-hero-master absolute inset-0 w-full h-[100dvh] z-10 gpu-accelerated transform-gpu will-change-transform"
          >
            <ProjectScrollHero
              title={pageData.title}
              description={pageData.description}
              images={pageData.images || []}
            />
          </div>

          {/* DOWNSTREAM SECTIONS */}
          {shouldLoadRest && (
            <>
              {/* Layer 2: Interactive Project Info Overlay Panel */}
              <div
                ref={projectInfoRef}
                className="about-stack-layer absolute inset-0 w-full h-[100dvh] z-20 gpu-accelerated transform-gpu will-change-transform"
                style={{ transform: "translate3d(0, 100%, 0)" }}
              >
                <ProjectInfoSlide
                  slides={pageData.slides || []}
                  isActive={isProjectInfoActive}
                />
              </div>

              {/* Layer 3: Dynamic Height App Section */}
              <div
                ref={appSectionRef}
                className="layer-auto-height gpu-accelerated transform-gpu absolute left-0 top-0 w-full z-30 will-change-transform"
                style={{ transform: "translate3d(0, 100vh, 0)" }}
              >
                <Appsection />
              </div>

              {/* Layer 4: Dynamic Height FAQ Section */}
              <div
                ref={faqSectionRef}
                className="layer-auto-height gpu-accelerated transform-gpu absolute left-0 top-0 w-full z-40 will-change-transform"
                style={{ transform: "translate3d(0, 100vh, 0)" }}
              >
                <FAQSection />
              </div>

              {/* Layer 5: Master Footer Overlay Panel */}
              <div
                ref={footerLayerRef}
                className="layer-auto-height gpu-accelerated transform-gpu absolute left-0 top-0 w-full z-50 will-change-transform"
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