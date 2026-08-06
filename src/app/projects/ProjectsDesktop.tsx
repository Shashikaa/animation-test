"use client";

import { useRef, useEffect, useState, useLayoutEffect } from "react";
import gsap from "gsap"; 
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSite } from "@/src/app/context/SiteContext";
import ProjectsHero from "../../components/Projects/ProjectsHero";
import { useTextReveal, restoreTextReveal } from "@/src/app/utils/useTextReveal"; 
import SectionOne from "@/src/components/Projects/SectionOne";
import SectionTwo from "@/src/components/Projects/SectionTwo";
import SectionCTA from "@/src/components/SectionCTA";
import Footer from "@/src/components/Footer";

gsap.registerPlugin(ScrollTrigger);

type ContactProps = {
  preloaderDone?: boolean;
};

// Standardized Desktop Metrics (Matched to Home Setup)
const PX_PER_MAIN_PANEL = 1000;
const PX_PER_SUB_STEP = 600; 
const PAUSE_PX = 350;

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
  const { setPreloaderDone, preloaderDone } = useSite();
  const scopeRef = useRef<HTMLDivElement>(null);
  const sectionOneRef = useRef<HTMLDivElement>(null);
  const [introDone, setIntroDone] = useState(false);
  const [isSectionTwoActive, setIsSectionTwoActive] = useState(false);

  const isTouchOnly = () => ScrollTrigger.isTouch === 1;

  // Setup initial scroll state and preloader signals
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.history.scrollRestoration) {
      window.history.scrollRestoration = "manual";
    }

    const isFullyReady = preloaderDone && introDone;

    if (!isFullyReady) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      window.scrollTo(0, 0);
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    }

    document.body.classList.remove("preloading");
    setPreloaderDone(true);

    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [setPreloaderDone, preloaderDone, introDone]);

  // Establish precise starting positions cleanly BEFORE browser paint
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.config({
        ignoreMobileResize: true,
        autoRefreshEvents: "DOMContentLoaded,load,visibilitychange,resize",
      });

      gsap.set(".projects-hero-bg", { scale: 1.4, yPercent: 0, force3D: true, transformOrigin: "center center" });
      gsap.set([".hero-title", ".hero-desc"], { opacity: 0, y: 30, force3D: true });
      
      gsap.set([".scroll-para-1", ".scroll-para-2"], { opacity: 1, visibility: "hidden" });
      
      gsap.set(".section-one-wrapper", { top: "100vh", y: 0, height: "auto", zIndex: 20 });
      gsap.set(".section-two-wrapper", { y: "100vh", zIndex: 30 });
      gsap.set(".parallax-img-asset", { yPercent: -20 });

      gsap.set([".projects-section-cta", ".projects-footer-wrap"], { yPercent: 100, visibility: "hidden", force3D: true });
      gsap.set(".projects-section-cta", { zIndex: 95 });
      gsap.set(".projects-footer-wrap", { zIndex: 96 });
      gsap.set([".cta-inner-desktop", ".cta-inner-mobile"], { opacity: 1, force3D: true });
    }, scopeRef);
    
    return () => ctx.revert();
  }, []);

  // Hero Intro Sequence matched to Home / About Desktop setup
  useEffect(() => {
    const ctx = gsap.context(() => {
      const introTl = gsap.timeline({ 
        onComplete: () => {
          setIntroDone(true);
        }
      });
      
      introTl
        .to(".projects-hero-bg", { scale: 1.15, duration: 1.2, ease: "power2.out" }, 0)
        .to([".hero-title", ".hero-desc"], { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: "power2.out" }, 0.2);
    }, scopeRef);
    
    return () => ctx.revert();
  }, []);

  // Master Timeline with Home Setup Metrics & Crisp Hero Speed
  useEffect(() => {
    if (!introDone || !preloaderDone) return;

    if (isTouchOnly()) {
      ScrollTrigger.normalizeScroll(true);
    }

    let vvCleanup: (() => void) | null = null;

    executeDesktopSplitting(".scroll-para-1");
    executeDesktopSplitting(".scroll-para-2");

    const ctx = gsap.context(() => {
      gsap.ticker.lagSmoothing(500, 33);

      const performanceTargets = [
        ".projects-hero-bg", ".section-one-wrapper", ".section-two-wrapper",
        ".parallax-img-asset", ".projects-section-cta", ".projects-footer-wrap"
      ];

      performanceTargets.forEach(selector => {
        gsap.set(selector, {
          force3D: true,
          willChange: "transform, opacity"
        });
      });

      useTextReveal(scopeRef, ".section-one-wrapper .reveal-text");

      gsap.set(".section-one-wrapper .reveal-text", { visibility: "visible", opacity: 1 });
      gsap.set([
        ".section-one-wrapper .reveal-text .gs-line-inner",
        ".section-one-wrapper .reveal-text .custom-line-inner",
        ".section-one-wrapper .reveal-text > *"
      ], { y: 45, opacity: 0 });

      const buildTimeline = () => {
        ScrollTrigger.refresh();

        const vv = typeof visualViewport !== "undefined" ? visualViewport : null;
        if (vv) {
          const onVVResize = () => ScrollTrigger.refresh(true);
          vv.addEventListener("resize", onVVResize);
          vvCleanup = () => vv.removeEventListener("resize", onVVResize);
        }

        // Uniform Duration Metrics
        const PANEL_ACTION = 2.0; 
        const PAUSE_ACTION = 0.4;

        const MAIN_PANELS_COUNT = 6;
        const SUB_STEPS_COUNT = 2;
        const PAUSES_COUNT = 5;

        const DYNAMIC_SCROLL_TRACK = 
          (MAIN_PANELS_COUNT * PX_PER_MAIN_PANEL) + 
          (SUB_STEPS_COUNT * PX_PER_SUB_STEP) + 
          (PAUSES_COUNT * PAUSE_PX);

        const scrollTl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: ".master-viewport",
            start: "top top",
            end: `+=${DYNAMIC_SCROLL_TRACK}`,
            pin: true,
            pinSpacing: true,
            scrub: 1,
            anticipatePin: 1,
            preventOverlaps: true,
            invalidateOnRefresh: true,
          }
        });

        const revealedElements = new Set<string>();

        // Original Text Reveal logic preserved exact offsets (-0.65) and duration (0.8)
        const addPlayOnceTextReveal = (labelName: string, timeOffset: number, selector: string) => {
          const absoluteTime = scrollTl.labels[labelName] + timeOffset;

          scrollTl.call(() => {
            const isForward = scrollTl.scrollTrigger ? scrollTl.scrollTrigger.direction > 0 : true;
            if (isForward && !revealedElements.has(selector)) {
              revealedElements.add(selector);

              gsap.to(selector, {
                y: 0,
                opacity: 1,
                stagger: 0.05,
                duration: 0.8,
                ease: "power2.out",
                overwrite: "auto"
              });
            }
          }, [], absoluteTime);
        };

        // ── STEP 1: HERO INNER TEXT SWAPPING (FAST & CRISP) ──
        scrollTl.addLabel("start", 0); 
        scrollTl.addLabel("phaseHeroMain", 0); 
        scrollTl.set([".scroll-para-1 .custom-line-inner", ".scroll-para-2 .custom-line-inner"], { opacity: 0, yPercent: 100 }, 0);

        // Fast transition out of title into Para 1
        scrollTl.to(".hero-text-wrap", { opacity: 0, y: -20, ease: "power1.inOut", duration: PANEL_ACTION * 0.4 }, 0);
        scrollTl.set(".hero-text-wrap", { visibility: "hidden" }, PANEL_ACTION * 0.4);
        
        scrollTl.set(".scroll-para-1", { visibility: "visible" }, PANEL_ACTION * 0.4);
        scrollTl.to(".scroll-para-1 .custom-line-inner", { 
          opacity: 1, 
          yPercent: 0, 
          stagger: 0.03, 
          duration: PANEL_ACTION * 0.5, 
          ease: "power2.out" 
        }, PANEL_ACTION * 0.4);

        // Hero Scale smoothly anchors without shifting position
        scrollTl.to(".projects-hero-bg", { scale: 1.05, duration: PANEL_ACTION, ease: "power1.inOut" }, 0);

        scrollTl.to({}, { duration: PAUSE_ACTION });

        // Swap Para 1 for Para 2
        scrollTl.addLabel("phaseHeroParaOne", ">"); 

        scrollTl.to(".scroll-para-1 .custom-line-inner", { opacity: 0, y: -20, ease: "power1.in", duration: PANEL_ACTION * 0.4 }, "phaseHeroParaOne");
        scrollTl.set(".scroll-para-1", { visibility: "hidden" }, `phaseHeroParaOne+=${PANEL_ACTION * 0.4}`);
        
        scrollTl.set(".scroll-para-2", { visibility: "visible" }, `phaseHeroParaOne+=${PANEL_ACTION * 0.4}`);
        scrollTl.to(".scroll-para-2 .custom-line-inner", { 
          opacity: 1, 
          yPercent: 0, 
          stagger: 0.03, 
          duration: PANEL_ACTION * 0.5, 
          ease: "power2.out" 
        }, `phaseHeroParaOne+=${PANEL_ACTION * 0.4}`);

        scrollTl.to({}, { duration: PAUSE_ACTION });

        // ── STEP 2: SECTION ONE SCROLL UP ──
        const getSectionOneScrollDistance = () => {
          if (!sectionOneRef.current) return "100vh";
          const elementHeight = sectionOneRef.current.offsetHeight;
          return `${elementHeight}px`;
        };

        scrollTl.addLabel("sectionOneStart", ">");

        scrollTl.to(".scroll-para-2 .custom-line-inner", { 
          opacity: 0, 
          y: -40, 
          ease: "power1.in", 
          duration: PANEL_ACTION * 0.4 
        }, "sectionOneStart");
        
        scrollTl.set(".scroll-para-2", { visibility: "hidden" }, `sectionOneStart+=${PANEL_ACTION * 0.4}`);

        scrollTl.to(".section-one-wrapper", {
          y: () => `-${getSectionOneScrollDistance()}`,
          duration: PANEL_ACTION * 1.5, 
          ease: "none"
        }, "sectionOneStart");

        scrollTl.to(".parallax-img-asset", {
          yPercent: 20,
          ease: "none",
          duration: PANEL_ACTION * 1.5
        }, "sectionOneStart");

        addPlayOnceTextReveal("sectionOneStart", 1, ".section-one-wrapper .gs-line-inner, .section-one-wrapper .custom-line-inner, .section-one-wrapper .reveal-text > *");

        scrollTl.to({}, { duration: PAUSE_ACTION });

        // ── STEP 3: SECTION TWO SLIDES UP OVER SECTION ONE ──
        scrollTl.addLabel("sectionTwoStart", ">");
        scrollTl.to(".section-two-wrapper", {
          y: "0vh",
          duration: PANEL_ACTION,
          ease: "power2.inOut",
          onStart: () => setIsSectionTwoActive(true),
          onReverseComplete: () => setIsSectionTwoActive(false)
        }, "sectionTwoStart");

        scrollTl.to({}, { duration: PAUSE_ACTION });

        // ── STEP 4: CTA REVEAL TRACK ──
        scrollTl.addLabel("ctaStart", ">");
        scrollTl.set(".projects-section-cta", { visibility: "visible" }, "ctaStart")
          .to(".projects-section-cta", { yPercent: 0, duration: PANEL_ACTION, ease: "power2.out" }, "ctaStart")
          .set(".section-two-wrapper", { pointerEvents: "none" }, "ctaStart");

        scrollTl.to({}, { duration: PAUSE_ACTION });

        // ── STEP 4.5: CTA INNER CONTENT FADE OUT FIRST (MATCHING HOME) ──
        scrollTl.addLabel("ctaFadeOut", ">")
          .to(".projects-section-cta .cta-inner-desktop", { 
            opacity: 0, 
            y: -40, 
            duration: PANEL_ACTION * 0.5, 
            ease: "power2.in" 
          }, "ctaFadeOut")
          .to({}, { duration: 0 });

        // ── STEP 5: FOOTER REVEAL TRACK ──
        scrollTl.addLabel("footerStart", ">")
          .set(".projects-footer-wrap", { visibility: "visible" }, "footerStart")
          .to(".projects-footer-wrap", { yPercent: 0, duration: PANEL_ACTION, ease: "power2.out" }, "footerStart");
      };

      requestAnimationFrame(buildTimeline);

    }, scopeRef);

    return () => {
      vvCleanup?.();
      if (isTouchOnly()) {
        ScrollTrigger.normalizeScroll(false);
      }
      ctx.revert();
      if (scopeRef.current) {
        restoreTextReveal(scopeRef.current, ".scroll-para-1");
        restoreTextReveal(scopeRef.current, ".scroll-para-2");
        restoreTextReveal(scopeRef.current, ".section-one-wrapper .reveal-text");
      }
    };
  }, [introDone, preloaderDone]);

  return (
    <div 
      ref={scopeRef} 
      className={`w-full relative ${!introDone ? "h-screen overflow-hidden" : "overflow-x-hidden"}`}
    >
      <div className="master-viewport relative w-full h-screen overflow-hidden bg-black">
        
        {/* Layer 1: Hero Section */}
        <div className="projects-hero-master absolute inset-0 w-full h-full z-10">
          <ProjectsHero />
        </div>

        {/* Layer 2: Section One Container */}
        <div 
          ref={sectionOneRef}
          className="section-one-wrapper absolute left-0 right-0 w-full h-auto"
        >
          <SectionOne />
        </div>

        {/* Layer 3: Section Two Container */}
        <div className="section-two-wrapper absolute inset-0 w-full h-full">
          <SectionTwo isActive={isSectionTwoActive}/>
        </div>
        
        {/* Layer 4: CTA Section Container */}
        <div
          className="projects-section-cta absolute bottom-0 left-0 w-full h-full structural-layer pointer-events-auto"
          style={{ zIndex: 95 }}
        >
          <SectionCTA  />
        </div>
        
        {/* Layer 5: Footer Container */}
        <div
          className="projects-footer-wrap absolute left-0 bottom-0 w-full structural-layer"
          style={{ zIndex: 96 }}
        >
          <Footer />
        </div>

      </div>
    </div>
  );
}