"use client";

import dynamic from "next/dynamic";
import { useState, useRef, useEffect, useCallback } from "react";
import ProjectScrollHero from "@/src/components/Projects/ProjectScrollHero";
import { useSite } from "@/src/app/context/SiteContext";
import { useHeroIntro } from "@/src/app/utils/useHeroIntro";
import { FullServiceData } from "./data";

const ProjectInfoSlide = dynamic(() => import("@/src/components/Projects/ProjectInfoSlide"));
const Appsection = dynamic(() => import("@/src/components/Projects/Appsection"));
const FAQSection = dynamic(() => import("@/src/components/contact/FAQSection"));
const Footer = dynamic(() => import("@/src/components/Footer"));

const clamp = (val: number, min = 0, max = 1) =>
  Math.min(Math.max(val, min), max);

const mapRange = (val: number, inMin: number, inMax: number) => {
  if (inMin === inMax) return 0;
  return clamp((val - inMin) / (inMax - inMin));
};

type SubServicesMobileProps = {
  pageData: FullServiceData;
};

export default function SingleProjectPageMobile({ pageData }: SubServicesMobileProps) {
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
  });

  const lastSizeRef = useRef({ width: 0, height: 0 });

  const currentProgress = useRef(0);
  const targetProgress = useRef(0);
  const rafId = useRef<number | null>(null);
  const lastInfoIdx = useRef<number>(-1);

  const { smootherRef } = useSite();
  const { preloaderDone, shouldLoadRest } = useHeroIntro(scopeRef, {
    isMobile: true,
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

  useEffect(() => {
    const lenis = smootherRef?.current;

    if (!preloaderDone || !shouldLoadRest) {
      if (lenis && typeof lenis.stop === "function") lenis.stop();
      targetProgress.current = 0;
      currentProgress.current = 0;
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

  const updateMetrics = useCallback(() => {
    if (!trackRef.current) return;

    const vh = window.innerHeight;
    const vw = window.innerWidth;

    const appHeight = appSectionRef.current?.offsetHeight || vh;
    const faqHeight = faqSectionRef.current?.offsetHeight || vh;
    const footerHeight = footerLayerRef.current?.offsetHeight || vh;

    // Dynamically calculate total track height to support variable length components
    const totalTrackHeight =
      vh * (2 + Math.max(0, infoSlidesCount - 1)) +
      appHeight +
      faqHeight +
      footerHeight;

    trackRef.current.style.height = `${totalTrackHeight}px`;

    const rect = trackRef.current.getBoundingClientRect();

    scrollMetricsRef.current = {
      totalScrollable: Math.max(0, totalTrackHeight - vh),
      vh,
      trackTopOffset: window.scrollY + rect.top,
    };

    lastSizeRef.current = { width: vw, height: vh };
  }, [infoSlidesCount]);

  const handleResize = useCallback(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const { width, height } = lastSizeRef.current;

    const isLikelyAddressBarToggle =
      vw === width && Math.abs(vh - height) < 150;

    if (isLikelyAddressBarToggle) return;

    updateMetrics();
  }, [updateMetrics]);

  useEffect(() => {
    if (!shouldLoadRest) return;

    updateMetrics();

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("orientationchange", updateMetrics, {
      passive: true,
    });

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", updateMetrics);
    };
  }, [shouldLoadRest, updateMetrics, handleResize]);

  useEffect(() => {
    if (!shouldLoadRest) return;

    let isRunning = true;

    const isAndroid =
      typeof navigator !== "undefined" && /android/i.test(navigator.userAgent);

    // Easing & speed cap controls matching About page setup
const EASE_FACTOR = isAndroid ? 0.1 : 0.5;
    const MAX_PROGRESS_DELTA_PER_FRAME = 0.006;

    let lastTime = performance.now();

    const render = () => {
      if (!isRunning) return;

      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const dynamicEase = 1 - Math.exp(-EASE_FACTOR * 60 * dt);

      let delta =
        (targetProgress.current - currentProgress.current) * dynamicEase;

      // Cap maximum speed per frame during fast flicks
      if (Math.abs(delta) > MAX_PROGRESS_DELTA_PER_FRAME) {
        delta = Math.sign(delta) * MAX_PROGRESS_DELTA_PER_FRAME;
      }

      currentProgress.current += delta;

      const p = currentProgress.current;
      const subSlidesSteps = Math.max(0, infoSlidesCount - 1);
      const PAUSE_BUFFER = 0.8;
      const totalSteps = 4 + subSlidesSteps + PAUSE_BUFFER;
      const stepProgress = p * totalSteps;

      const { vh } = scrollMetricsRef.current;

      // STEP 1: Hero Text Fade Out + Project Info Slide-Up
      const heroTextWrap =
        scopeRef.current?.querySelector<HTMLElement>(".hero-text-wrap");
      const infoProg = clamp(stepProgress);

      if (heroTextWrap) {
        heroTextWrap.style.opacity = `${1 - infoProg}`;
        heroTextWrap.style.transform = `translate3d(0, ${-30 * infoProg}px, 0)`;
        heroTextWrap.style.visibility = infoProg >= 1 ? "hidden" : "visible";
      }

      if (projectInfoRef.current) {
        projectInfoRef.current.style.transform = `translate3d(0, ${
          (1 - infoProg) * 100
        }%, 0)`;
      }

      const infoEndStep = 1.0 + subSlidesSteps + PAUSE_BUFFER;
      if (stepProgress >= 0.8 && stepProgress < infoEndStep + 0.3) {
        setIsProjectInfoActive(true);
      } else {
        setIsProjectInfoActive(false);
      }

      // STEP 2: Sequential Inner Info Slides
      if (subSlidesSteps > 0) {
        const subProgress =
          clamp((stepProgress - 1.0) / subSlidesSteps) * subSlidesSteps;
        const currentSubIdx = Math.min(
          infoSlidesCount - 1,
          Math.floor(subProgress)
        );
        triggerInfoHook(currentSubIdx);

        infoSlides.forEach((_, idx) => {
          if (idx === 0) return;

          const layerProg = clamp(stepProgress - (1.0 + idx - 1));
          const imgLayer = scopeRef.current?.querySelector<HTMLElement>(
            `.info-img-layer-${idx}`
          );
          const imgInner = scopeRef.current?.querySelector<HTMLElement>(
            `.info-img-layer-${idx} .info-image-inner`
          );

          if (imgLayer) {
            imgLayer.style.clipPath = `polygon(0% 0%, ${
              layerProg * 100
            }% 0%, ${layerProg * 100}% 100%, 0% 100%)`;
          }
          if (imgInner) {
            const scaleVal = 1.25 - layerProg * 0.25;
            imgInner.style.transform = `scale(${scaleVal})`;
          }
        });
      } else {
        triggerInfoHook(0);
      }

      // STEP 3: Dynamic App Section Reveal
      const appStartStep = 1.0 + subSlidesSteps + PAUSE_BUFFER;
      const appProg = clamp(stepProgress - appStartStep);

      if (appSectionRef.current) {
        const appHeight = appSectionRef.current.offsetHeight || vh;
        const startY = vh;
        const endY = appHeight > vh ? -(appHeight - vh) : 0;
        const currentY = startY + (endY - startY) * appProg;
        appSectionRef.current.style.transform = `translate3d(0, ${currentY}px, 0)`;
      }

      if (projectInfoRef.current && appProg > 0) {
        projectInfoRef.current.style.transform = `translate3d(0, ${
          -appProg * 15
        }%, 0)`;
      }

      const phoneWrapper =
        scopeRef.current?.querySelector<HTMLElement>(".appsec-phone-wrapper");
      if (phoneWrapper) {
        const phoneProg = clamp((stepProgress - (appStartStep + 0.2)) / 0.8);
        phoneWrapper.style.opacity = `${phoneProg}`;
        phoneWrapper.style.transform = `translate3d(0, ${
          (1 - phoneProg) * 30
        }px, 0)`;
      }

      // STEP 4: Dynamic FAQ Section Reveal
      const faqStartStep = appStartStep + 1.0;
      const faqProg = clamp(stepProgress - faqStartStep);

      if (faqSectionRef.current) {
        const faqHeight = faqSectionRef.current.offsetHeight || vh;
        const startY = vh;
        const endY = faqHeight > vh ? -(faqHeight - vh) : 0;
        const currentY = startY + (endY - startY) * faqProg;
        faqSectionRef.current.style.transform = `translate3d(0, ${currentY}px, 0)`;
      }

      // STEP 5: Footer Reveal
      const footerStartStep = faqStartStep + 1.0;
      const footerProg = clamp(stepProgress - footerStartStep);

      if (footerLayerRef.current) {
        const footerHeight = footerLayerRef.current.offsetHeight || vh;
        const translateY = vh - footerHeight * footerProg;
        footerLayerRef.current.style.transform = `translate3d(0, ${translateY}px, 0)`;
      }

      rafId.current = requestAnimationFrame(render);
    };

    const handleScroll = (e?: any) => {
      const lenis = smootherRef?.current;
      const scrollY = e?.scroll ?? lenis?.scroll ?? window.scrollY;
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

      targetProgress.current = clamp(relativeScroll / totalScrollable);
    };

    const lenis = smootherRef?.current;

    if (lenis && typeof lenis.on === "function") {
      lenis.on("scroll", handleScroll);
    } else {
      window.addEventListener("scroll", handleScroll, { passive: true });
    }

    handleScroll();
    rafId.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;

      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }

      if (lenis && typeof lenis.off === "function") {
        lenis.off("scroll", handleScroll);
      } else {
        window.removeEventListener("scroll", handleScroll);
      }

      if (typeof window !== "undefined") {
        delete (window as any)._projectInfoGoTo;
      }
    };
  }, [shouldLoadRest, smootherRef, infoSlidesCount, infoSlides, triggerInfoHook]);

  return (
    <div ref={scopeRef} className="w-full bg-[#162D24]">
      <div
        ref={trackRef}
        className="project-track-container relative w-full"
      >
        <div
          ref={fixedFrameRef}
          className="fixed top-0 left-0 w-full overflow-hidden bg-[#162D24] z-10 h-svh"
        >
          <div
            ref={heroPanelRef}
            className="project-hero-master absolute inset-0 w-full h-svh z-10 transform-gpu will-change-transform backface-hidden"
          >
            <ProjectScrollHero
              title={pageData.title}
              description={pageData.description}
              images={pageData.images || []}
            />
          </div>

          {shouldLoadRest && (
            <>
              <div
                ref={projectInfoRef}
                className="about-stack-layer absolute inset-0 w-full h-svh z-20 transform-gpu will-change-transform backface-hidden"
                style={{ transform: "translate3d(0, 100%, 0)" }}
              >
                <ProjectInfoSlide
                  slides={pageData.slides || []}
                  isActive={isProjectInfoActive}
                />
              </div>

              <div
                ref={appSectionRef}
                className="layer-auto-height transform-gpu absolute left-0 top-0 w-full z-30 will-change-transform backface-hidden"
                style={{ transform: "translate3d(0, 100svh, 0)" }}
              >
                <Appsection />
              </div>

              <div
                ref={faqSectionRef}
                className="layer-auto-height transform-gpu absolute left-0 top-0 w-full z-40 will-change-transform backface-hidden"
                style={{ transform: "translate3d(0, 100svh, 0)" }}
              >
                <FAQSection />
              </div>

              <div
                ref={footerLayerRef}
                className="layer-auto-height transform-gpu absolute left-0 top-0 w-full z-50 will-change-transform backface-hidden"
                style={{ transform: "translate3d(0, 100svh, 0)" }}
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