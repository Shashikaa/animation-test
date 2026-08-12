"use client";

import dynamic from "next/dynamic";
import { useRef, useEffect, useCallback } from "react";
import SubServiceHero from "@/src/components/Service/SubServiceHero";
import { useSite } from "@/src/app/context/SiteContext";
import { useHeroIntro } from "@/src/app/utils/useHeroIntro";
import { restoreTextReveal } from "@/src/app/utils/useTextReveal";
import { FullServiceData } from "./data";

const SubServiceSectionOne = dynamic(() => import("@/src/components/Service/SubServiceSectionOne"));
const SubServiceFAQSection = dynamic(() => import("@/src/components/Service/SubServiceFAQSection"));
const SectionCTA = dynamic(() => import("@/src/components/SectionCTA"));
const Footer = dynamic(() => import("@/src/components/Footer"));

const easeOutQuad = (t: number) => t * (2 - t);

type SubServicesMobileProps = {
  pageData: FullServiceData;
};

export default function SubServicesMobile({ pageData }: SubServicesMobileProps) {
  const scopeRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fixedFrameRef = useRef<HTMLDivElement>(null);

  const heroPanelRef = useRef<HTMLDivElement>(null);
  const sectionOneRef = useRef<HTMLDivElement>(null);
  const faqSectionRef = useRef<HTMLDivElement>(null);
  const ctaLayerRef = useRef<HTMLDivElement>(null);
  const footerLayerRef = useRef<HTMLDivElement>(null);

  const scrollMetricsRef = useRef({ totalScrollable: 0, vh: 0, trackTopOffset: 0 });
  const targetProgress = useRef(0);
  const rafId = useRef<number | null>(null);

  const { smootherRef } = useSite();
  const { introDone, preloaderDone, shouldLoadRest } = useHeroIntro(scopeRef, {
    isMobile: true,
    introDurationMs: 2800,
    unlockScrollEarlyMs: 1800,
  });

  useEffect(() => {
    if (!introDone) return;
    return () => {
      if (scopeRef.current) {
        restoreTextReveal(scopeRef.current, ".s2-reveal-text");
      }
    };
  }, [introDone]);

  // 1. UNLOCK LENIS & INITIALIZE
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

  // 2. CACHE METRICS
  const updateMetrics = useCallback(() => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const vh = window.innerHeight;
    scrollMetricsRef.current = {
      totalScrollable: rect.height - vh,
      vh,
      trackTopOffset: window.scrollY + rect.top,
    };
  }, []);

  useEffect(() => {
    if (!shouldLoadRest) return;
    updateMetrics();
    window.addEventListener("resize", updateMetrics, { passive: true });
    return () => window.removeEventListener("resize", updateMetrics);
  }, [shouldLoadRest, updateMetrics]);

  // 3. GPU-ACCELERATED RENDER LOOP (FAQ MATOHES CTA DYNAMIC HEIGHT TRANSLATION)
  useEffect(() => {
    if (!shouldLoadRest) return;

    const render = () => {
      const currentProg = targetProgress.current;
      const totalSteps = 8.0;
      const stepProgress = currentProg * totalSteps;

      const { vh } = scrollMetricsRef.current;

      // --- STEP 1: HERO TOP LAYER CLIP / TEXT FADE (0.0 -> 1.0) ---
      const heroTextWrap = scopeRef.current?.querySelector<HTMLElement>(".hero-text-wrap");
      const heroTopLayer = scopeRef.current?.querySelector<HTMLElement>(".services-hero-top-layer");
      const heroBg = scopeRef.current?.querySelector<HTMLElement>(".service-hero-bg");

      const heroPhase1Prog = Math.min(Math.max(stepProgress / 1.0, 0), 1);
      if (heroTextWrap) {
        heroTextWrap.style.opacity = `${1 - heroPhase1Prog}`;
        heroTextWrap.style.transform = `translate3d(0, ${-30 * heroPhase1Prog}px, 0)`;
        heroTextWrap.style.visibility = heroPhase1Prog >= 1 ? "hidden" : "visible";
      }

      if (heroTopLayer) {
        const layerWidthProg = (1 - heroPhase1Prog) * 100;
        heroTopLayer.style.clipPath = `inset(0% 0% 0% ${100 - layerWidthProg}%)`;
      }

      if (heroBg) {
        const bgScale = 1.1 - heroPhase1Prog * 0.1;
        heroBg.style.transform = `scale(${bgScale})`;
      }

      // --- STEP 2: SECTION ONE SLIDES UP OVER HERO (1.0 -> 2.0) ---
      const s1Prog = easeOutQuad(Math.min(Math.max(stepProgress - 1.0, 0), 1));
      if (sectionOneRef.current) {
        sectionOneRef.current.style.transform = `translate3d(0, ${(1 - s1Prog) * 100}%, 0)`;
      }

      if (heroPanelRef.current && s1Prog > 0) {
        heroPanelRef.current.style.transform = `translate3d(0, ${-s1Prog * 15}%, 0)`;
      }

      // --- STEP 3: SECTION ONE EXPANSION & INNER ANIMATIONS (2.0 -> 5.0) ---
      const s10ParaTop = scopeRef.current?.querySelector<HTMLElement>(".s10-para-top");
      const s10Title = scopeRef.current?.querySelector<HTMLElement>(".s10-title");
      const s10ImgContainer = scopeRef.current?.querySelector<HTMLElement>(".s10-img-absolute-container");
      const s10ImgElement = scopeRef.current?.querySelector<HTMLElement>(".s10-img-element");
      const seqContainer = scopeRef.current?.querySelector<HTMLElement>(".s10-seq-container");

      if (stepProgress < 2.0) {
        if (s10ParaTop) {
          s10ParaTop.style.opacity = "1";
          s10ParaTop.style.transform = "translate3d(0, 0px, 0)";
        }
        if (s10Title) {
          s10Title.style.opacity = "1";
          s10Title.style.transform = "translate3d(0, 0px, 0)";
        }
        if (s10ImgContainer) {
          s10ImgContainer.style.width = "";
          s10ImgContainer.style.height = "";
          s10ImgContainer.style.right = "";
          s10ImgContainer.style.bottom = "";
          s10ImgContainer.style.borderRadius = "0px";
        }
        if (s10ImgElement) {
          s10ImgElement.style.transform = "scale(1.0)";
        }
        if (seqContainer) {
          seqContainer.style.transform = "translate3d(0, 0px, 0)";
        }
      } else {
        const expandProg = Math.min(Math.max((stepProgress - 2.0) / 1.0, 0), 1);

        if (s10ParaTop) {
          s10ParaTop.style.opacity = `${1 - expandProg}`;
          s10ParaTop.style.transform = `translate3d(0, ${-35 * expandProg}px, 0)`;
        }
        if (s10Title) {
          s10Title.style.opacity = `${1 - expandProg}`;
          s10Title.style.transform = `translate3d(0, ${-35 * expandProg}px, 0)`;
        }
        if (s10ImgContainer) {
          const initialWidth = window.innerWidth * 0.92;
          const initialHeight = 220;
          const currentWidth = initialWidth + (window.innerWidth - initialWidth) * expandProg;
          const currentHeight = initialHeight + (vh - initialHeight) * expandProg;
          const currentRight = (1 - expandProg) * (window.innerWidth * 0.04);
          const currentBottom = (1 - expandProg) * (vh * 0.1);

          s10ImgContainer.style.width = `${currentWidth}px`;
          s10ImgContainer.style.height = `${currentHeight}px`;
          s10ImgContainer.style.right = `${currentRight}px`;
          s10ImgContainer.style.bottom = `${currentBottom}px`;
          s10ImgContainer.style.borderRadius = "0px";
        }

        if (s10ImgElement) {
          s10ImgElement.style.transform = `scale(${1.0 + expandProg * 0.06})`;
        }

        if (seqContainer) {
          const textProg = Math.min(Math.max((stepProgress - 3.0) / 2.0, 0), 1);
          const seqY = -textProg * 1240;
          seqContainer.style.transform = `translate3d(0, ${seqY}px, 0)`;
        }
      }

      // --- STEP 4: FAQ SECTION REVEAL (IDENTICAL TRANSFORM MATH TO CTA) (5.0 -> 6.0) ---
      const faqProg = easeOutQuad(Math.min(Math.max(stepProgress - 5.0, 0), 1));
      if (faqSectionRef.current) {
        const faqHeight = faqSectionRef.current.offsetHeight || vh;
        const startY = vh;
        const endY = -(faqHeight - vh);
        const currentY = startY + (endY - startY) * faqProg;
        faqSectionRef.current.style.transform = `translate3d(0, ${currentY}px, 0)`;
      }

      if (sectionOneRef.current && faqProg > 0) {
        sectionOneRef.current.style.transform = `translate3d(0, ${-faqProg * 15}%, 0)`;
      }

      // --- STEP 5: CTA REVEAL (6.0 -> 7.0) ---
      const ctaProg = easeOutQuad(Math.min(Math.max(stepProgress - 6.0, 0), 1));
      if (ctaLayerRef.current) {
        const ctaHeight = ctaLayerRef.current.offsetHeight || vh;
        const startY = vh;
        const endY = -(ctaHeight - vh);
        const currentY = startY + (endY - startY) * ctaProg;
        ctaLayerRef.current.style.transform = `translate3d(0, ${currentY}px, 0)`;
      }

      // --- STEP 6: FOOTER REVEAL (7.0 -> 8.0) ---
      const footerProg = easeOutQuad(Math.min(Math.max(stepProgress - 7.0, 0), 1));
      if (footerLayerRef.current) {
        const footerHeight = footerLayerRef.current.offsetHeight || vh;
        const startY = vh;
        const endY = vh - footerHeight;
        const translateY = startY + (endY - startY) * footerProg;
        footerLayerRef.current.style.transform = `translate3d(0, ${translateY}px, 0)`;
      }
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

      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(render);
    };

    const lenis = smootherRef?.current;
    if (lenis && typeof lenis.on === "function") {
      lenis.on("scroll", handleScroll);
    } else {
      window.addEventListener("scroll", handleScroll, { passive: true });
    }

    handleScroll();
    render();

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      if (lenis && typeof lenis.off === "function") {
        lenis.off("scroll", handleScroll);
      } else {
        window.removeEventListener("scroll", handleScroll);
      }
    };
  }, [shouldLoadRest, smootherRef]);

  return (
    <div ref={scopeRef} className="w-full bg-[#162D24]">
      <div
        ref={trackRef}
        className="services-track-container relative w-full"
        style={{ height: "800vh" }}
      >
        <div
          ref={fixedFrameRef}
          className="fixed top-0 left-0 w-full overflow-hidden bg-[#162D24] z-10 h-[100dvh]"
        >
          {/* Layer 1: Hero */}
          <div
            ref={heroPanelRef}
            className="subservice-hero-panel absolute inset-0 w-full h-[100dvh] z-10 gpu-accelerated transform-gpu will-change-transform"
          >
            <SubServiceHero data={pageData.hero} isMobile={true} />
          </div>

          {shouldLoadRest && (
            <>
              {/* Layer 2: Section One */}
              <div
                ref={sectionOneRef}
                className="about-stack-layer absolute inset-0 w-full h-[100dvh] z-20 gpu-accelerated will-change-transform"
                style={{ transform: "translate3d(0, 100%, 0)" }}
              >
                <SubServiceSectionOne data={pageData.sectionOne} />
              </div>

              {/* Layer 3: Dynamic Height FAQ Section */}
              <div
                ref={faqSectionRef}
                className="layer-auto-height gpu-accelerated absolute left-0 top-0 w-full z-30 will-change-transform"
                style={{ transform: "translate3d(0, 100vh, 0)" }}
              >
                <SubServiceFAQSection data={pageData.sectionTwo} />
              </div>

              {/* Layer 4: Section CTA */}
              <div
                ref={ctaLayerRef}
                className="layer-auto-height gpu-accelerated absolute left-0 top-0 w-full z-[95] will-change-transform"
                style={{ transform: "translate3d(0, 100vh, 0)" }}
              >
                <SectionCTA />
              </div>

              {/* Layer 5: Footer */}
              <div
                ref={footerLayerRef}
                className="layer-auto-height gpu-accelerated absolute left-0 top-0 w-full z-[96] will-change-transform"
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