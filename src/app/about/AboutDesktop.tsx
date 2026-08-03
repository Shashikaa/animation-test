"use client";

import Hero from "@/src/components/About/Hero";
import SectionOne from "@/src/components/About/SectionOne";
import SectionTwo from "@/src/components/About/SectionTwo";
import SectionThree from "@/src/components/About/SectionThree";
import SectionFour from "@/src/components/About/SectionFour";
import SectionFive from "@/src/components/About/SectionFive";
import SectionCTA from "@/src/components/SectionCTA";
import { useState, useRef, useEffect, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Footer from "@/src/components/Footer";
import { useSite } from "@/src/app/context/SiteContext";
import { useTextReveal, restoreTextReveal } from "@/src/app/utils/useTextReveal"; 

gsap.registerPlugin(ScrollTrigger);

const isTouchOnly = () => ScrollTrigger.isTouch === 1;

// Standardized Desktop Metrics
const PX_PER_MAIN_PANEL = 1000;
const PX_PER_SUB_STEP = 600; 
const PAUSE_PX = 350; 

export default function AboutDesktop() {
  const { setPreloaderDone, preloaderDone } = useSite();
  const [introDone, setIntroDone] = useState(false);
  const [isSectionFiveActive, setIsSectionFiveActive] = useState(false);
  const scopeRef = useRef<HTMLDivElement>(null);
  const lastSec5Idx = useRef<number>(-1);

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

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.config({
        ignoreMobileResize: true,
        autoRefreshEvents: "DOMContentLoaded,load,visibilitychange,resize",
      });

      gsap.set(".about-hero-bg", { scale: 1.4, force3D: true });
      gsap.set([".hero-title", ".hero-desc"], { opacity: 0, y: 30, force3D: true });
      gsap.set(".about-hero-panel-left", { clipPath: "inset(0% 0% 0% 0%)", WebkitClipPath: "inset(0% 0% 0% 0%)", force3D: true });
      gsap.set(".about-hero-panel-right", { clipPath: "inset(0% 0% 0% 0%)", WebkitClipPath: "inset(0% 0% 0% 0%)", force3D: true });

      gsap.set(".about-section-two", { 
        visibility: "hidden", 
        yPercent: 100,
        force3D: true
      });
      
      gsap.set(".about-section-three", { 
        visibility: "hidden", 
        clipPath: "inset(100% 0% 0% 0%)",
        WebkitClipPath: "inset(100% 0% 0% 0%)",
        force3D: true 
      });

      gsap.set(".about-section-four", { 
        visibility: "hidden", 
        clipPath: "inset(100% 0% 0% 0%)",
        WebkitClipPath: "inset(100% 0% 0% 0%)",
        force3D: true 
      });
      gsap.set(".s4-glass-card", { y: 80, opacity: 0, force3D: true });
      
      gsap.set(".about-section-five", { 
        visibility: "hidden", 
        yPercent: 100,
        force3D: true 
      });
      
      gsap.set([".about-section-cta", ".about-footer-wrap"], { yPercent: 100, visibility: "hidden", force3D: true });
    }, scopeRef);
    
    return () => ctx.revert();
  }, []);

  // Hero Intro Sequence
  useEffect(() => {
    const ctx = gsap.context(() => {
      const introTl = gsap.timeline({
        onComplete: () => {
          setIntroDone(true);
        }
      });

      introTl.to(".about-hero-bg", {
        scale: 1.15,
        duration: 1.5,
        ease: "power2.out"
      }, 0);

      introTl.to([".hero-title", ".hero-desc"], {
        opacity: 1,
        y: 0,
        duration: 1.0,
        stagger: 0.15,
        ease: "power2.out",
      }, 0.2);
    }, scopeRef);

    return () => ctx.revert();
  }, []);

  // Master Scroll Timeline
  useEffect(() => {
    if (!introDone || !preloaderDone) return;

    if (isTouchOnly()) {
      ScrollTrigger.normalizeScroll(true);
    }

    let vvCleanup: (() => void) | null = null;

    const ctx = gsap.context(() => {
      gsap.ticker.lagSmoothing(500, 33);

      const performanceTargets = [
        ".about-hero-panel-left", ".about-hero-panel-right", ".about-hero-bg",
        ".about-section-two", ".about-section-three", ".about-section-four", ".about-section-five",
        ".about-section-cta", ".about-footer-wrap", ".s2-bg", ".s3-bg", ".s4-img-bg", ".s5-bg"
      ];

      performanceTargets.forEach(selector => {
        gsap.set(selector, {
          force3D: true,
          willChange: "transform, clip-path, opacity"
        });
      });

      useTextReveal(scopeRef, ".about-section-one .reveal-text");
      useTextReveal(scopeRef, ".about-section-two .reveal-text");
      useTextReveal(scopeRef, ".about-section-three .reveal-text");
      useTextReveal(scopeRef, ".about-section-four .reveal-text");

      gsap.set([
        ".about-section-one .reveal-text",
        ".about-section-two .reveal-text",
        ".about-section-three .reveal-text",
        ".about-section-four .reveal-text"
      ], { visibility: "visible", opacity: 1 });

      gsap.set([
        ".about-section-one .reveal-text .gs-line-inner",
        ".about-section-two .reveal-text .gs-line-inner",
        ".about-section-three .reveal-text .gs-line-inner",
        ".about-section-four .reveal-text .gs-line-inner",
        ".about-section-one .reveal-text > *",
        ".about-section-two .reveal-text > *",
        ".about-section-three .reveal-text > *",
        ".about-section-four .reveal-text > *"
      ], { y: 45, opacity: 0 });

      const buildTimeline = () => {
        ScrollTrigger.refresh();

        const vv = typeof visualViewport !== "undefined" ? visualViewport : null;
        if (vv) {
          const onVVResize = () => ScrollTrigger.refresh(true);
          vv.addEventListener("resize", onVVResize);
          vvCleanup = () => vv.removeEventListener("resize", onVVResize);
        }

        const revealedElements = new Set<string>();

        // Uniform Duration Metrics
        const PANEL_ACTION = 2.0; 
        const SUB_ACTION = 1.8;   
        const PAUSE_ACTION = 0.5;

        const MAIN_PANELS_COUNT = 7;
        const SUB_STEPS_COUNT = 2;
        const PAUSES_COUNT = 10;

        const DYNAMIC_SCROLL_TRACK = 
          (MAIN_PANELS_COUNT * PX_PER_MAIN_PANEL) + 
          (SUB_STEPS_COUNT * PX_PER_SUB_STEP) + 
          (PAUSES_COUNT * PAUSE_PX);

        const triggerSec5Hook = (nextIdx: number) => {
          if (nextIdx !== lastSec5Idx.current) {
            lastSec5Idx.current = nextIdx;
            if ((window as any)._sec5GoTo) {
              (window as any)._sec5GoTo(nextIdx);
            }
          }
        };

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: ".about-pin",
            start: "top top",
            end: `+=${DYNAMIC_SCROLL_TRACK}`,
            scrub: 1, 
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            preventOverlaps: true,
            invalidateOnRefresh: true,
            onUpdate: () => {
              const sec5Time = tl.labels["sec5FullyRevealed"];
              const ctaTime = tl.labels["ctaStart"];

              if (sec5Time !== undefined && ctaTime !== undefined) {
                const currentTime = tl.time();

                if (currentTime >= sec5Time && currentTime < ctaTime) {
                  const sec5Progress = (currentTime - sec5Time) / (ctaTime - sec5Time);

                  if (sec5Progress < 0.33) {
                    triggerSec5Hook(0);
                  } else if (sec5Progress < 0.66) {
                    triggerSec5Hook(1);
                  } else {
                    triggerSec5Hook(2);
                  }
                } else if (currentTime < sec5Time) {
                  triggerSec5Hook(0);
                }
              }
            },
          },
        });

        const addPlayOnceTextReveal = (labelName: string, timeOffset: number, selector: string) => {
          const absoluteTime = tl.labels[labelName] + timeOffset;
          
          tl.call(() => {
            const isForward = tl.scrollTrigger ? tl.scrollTrigger.direction > 0 : true;
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

        // Time 0: Initial Hero rest label
        tl.addLabel("start", 0);

        tl.set(".about-hero-panel-left", { clipPath: "inset(0% 50% 0% 0%)", WebkitClipPath: "inset(0% 50% 0% 0%)" }, 0);
        tl.set(".about-hero-panel-right", { clipPath: "inset(0% 0% 0% 50%)", WebkitClipPath: "inset(0% 0% 0% 50%)" }, 0);

        // ── SECTION 1 REVEAL ──
        tl.to(".about-hero-panel-left", { clipPath: "inset(0% 50% 100% 0%)", WebkitClipPath: "inset(0% 50% 100% 0%)", duration: PANEL_ACTION, ease: "power2.inOut" }, "start")
          .to(".about-hero-panel-right", { clipPath: "inset(100% 0% 0% 50%)", WebkitClipPath: "inset(100% 0% 0% 50%)", duration: PANEL_ACTION, ease: "power2.inOut" }, "start")
          .fromTo(".about-hero-bg", { scale: 1.15 }, { scale: 1.0, duration: PANEL_ACTION, ease: "power2.inOut" }, "start")
          .addLabel("sec1Start");

        addPlayOnceTextReveal("sec1Start", -0.95, ".about-section-one .reveal-text .gs-line-inner, .about-section-one .reveal-text > *");

        tl.to({}, { duration: PAUSE_ACTION });

        // ── SECTION 2 REVEAL ──
        tl.addLabel("sec2Start", ">")
          .set(".about-section-two", { visibility: "visible", yPercent: 100 }, "sec2Start")
          .to(".about-section-two", { yPercent: 0, duration: PANEL_ACTION, ease: "power2.inOut" }, "sec2Start")
          .fromTo(".s2-bg", { scale: 1.1 }, { scale: 1.0, duration: PANEL_ACTION, ease: "power2.out" }, "sec2Start");

        addPlayOnceTextReveal("sec2Start", 1, ".about-section-two .reveal-text .gs-line-inner, .about-section-two .reveal-text > *");

        tl.to({}, { duration: PAUSE_ACTION });

        // ── SECTION 3 REVEAL ──
        tl.addLabel("sec3Start", ">")
          .set(".about-section-three", { visibility: "visible" }, "sec3Start")
          .fromTo(".about-section-three", 
            { clipPath: "inset(100% 0% 0% 0%)", WebkitClipPath: "inset(100% 0% 0% 0%)" }, 
            { clipPath: "inset(0% 0% 0% 0%)", WebkitClipPath: "inset(0% 0% 0% 0%)", duration: PANEL_ACTION, ease: "power2.inOut" },
            "sec3Start"
          )
          .to(".s2-bg", { yPercent: -15, duration: PANEL_ACTION, ease: "power2.inOut" }, "sec3Start")
          .fromTo(".s3-bg", { scale: 1.15 }, { scale: 1.0, duration: PANEL_ACTION, ease: "power2.out" }, "sec3Start");

        addPlayOnceTextReveal("sec3Start", 1, ".about-section-three .s3-reveal-bottom .gs-line-inner, .about-section-three .s3-reveal-bottom > *");
        addPlayOnceTextReveal("sec3Start", 1, ".about-section-three .s3-reveal-top .gs-line-inner, .about-section-three .s3-reveal-top > *");

        tl.to({}, { duration: PAUSE_ACTION });

        // ── SECTION 4 REVEAL ──
        tl.addLabel("sec4Start", ">")
          .set(".about-section-four", { visibility: "visible" }, "sec4Start")
          .to(".about-section-four", { clipPath: "inset(0% 0% 0% 0%)", WebkitClipPath: "inset(0% 0% 0% 0%)", duration: PANEL_ACTION, ease: "power2.inOut" }, "sec4Start")
          .to(".s4-glass-card", { opacity: 1, y: 0, duration: PANEL_ACTION * 0.5, ease: "power2.out" }, `sec4Start+=${PANEL_ACTION * 0.2}`);

        addPlayOnceTextReveal("sec4Start", 1, ".about-section-four .reveal-text .gs-line-inner, .about-section-four .reveal-text > *");

        tl.to({}, { duration: PAUSE_ACTION });

        // ── SECTION 5 REVEAL ──
        tl.addLabel("sec5Start", ">")
          .set(".about-section-five", { visibility: "visible" }, "sec5Start")
          .to(".about-section-four .s4-img-bg", { scale: 1.03, yPercent: -10, duration: PANEL_ACTION, ease: "power2.inOut" }, "sec5Start")
          .fromTo(".about-section-five", { yPercent: 100 }, { 
            yPercent: 0, 
            duration: PANEL_ACTION,
            ease: "power2.inOut",
            onStart: () => setIsSectionFiveActive(true),
            onReverseComplete: () => {
              setIsSectionFiveActive(false);
              triggerSec5Hook(0);
            }
          }, "sec5Start")
          .fromTo(".s5-bg", { yPercent: 0, scale: 1.2 }, { yPercent: -20, scale: 1.15, duration: PANEL_ACTION + (SUB_ACTION * 2), ease: "none" }, "sec5Start");

        tl.addLabel("sec5FullyRevealed", `sec5Start+=${PANEL_ACTION}`);

        // ── SECTION 5 INNER CARDS TRACK ALLOCATION ──
        tl.to({}, { duration: SUB_ACTION * 2 });

// ── 8. CTA REVEAL TRACK ──
        tl.addLabel("ctaStart", ">")
          .set(".about-section-cta", { visibility: "visible" }, "ctaStart")
          .to(".about-section-cta", { yPercent: 0, duration: PANEL_ACTION, ease: "power2.out" }, "ctaStart")
          .to(".about-section-five", { scale: 1.0, duration: PANEL_ACTION }, "ctaStart");

        tl.to({}, { duration: PAUSE_ACTION });

        // ── 8.5. CTA CONTENT FADE OUT FIRST (MATCHING HOME) ──
        tl.addLabel("ctaFadeOut", ">")
          .to(".about-section-cta .cta-inner-desktop", { 
            opacity: 0, 
            y: -40, 
            duration: PANEL_ACTION * 0.5, 
            ease: "power2.in" 
          }, "ctaFadeOut")
          
          // Pause so content is completely clear before footer enters
          .to({}, { duration: PAUSE_ACTION });

        // ── 9. FOOTER REVEAL TRACK ──
        tl.addLabel("footerStart", ">")
          .set(".about-footer-wrap", { visibility: "visible" }, "footerStart")
          .to(".about-footer-wrap", { 
            yPercent: 0, 
            duration: PANEL_ACTION, 
            ease: "power2.out" 
          }, "footerStart")
          .to(".about-section-five", { 
            scale: 1.05, 
            duration: PANEL_ACTION 
          }, "footerStart")

          .addLabel("timelineEnd", `footerStart+=${PANEL_ACTION}`)
          .to({}, { duration: PAUSE_ACTION }, "timelineEnd");
      };

      requestAnimationFrame(buildTimeline);

    }, scopeRef);

    return () => {
      vvCleanup?.();
      if (isTouchOnly()) {
        ScrollTrigger.normalizeScroll(false);
      }
      if (scopeRef.current) {
        restoreTextReveal(
          scopeRef.current,
          [
            ".about-section-one .reveal-text",
            ".about-section-two .reveal-text",
            ".about-section-three .reveal-text",
            ".about-section-four .reveal-text"
          ].join(",")
        );
      }
      ctx.revert();
    };
  }, [introDone, preloaderDone]);

  return (
    <div ref={scopeRef}>
      <div className="about-pin relative h-screen w-screen overflow-hidden bg-black" style={{ visibility: "visible" }}>
        <div className="about-section-one absolute inset-0 h-full w-full structural-layer" style={{ zIndex: 10 }}>
          <SectionOne />
        </div>

        <div className="about-hero-panel-left absolute inset-0 h-full w-full structural-layer" style={{ zIndex: 20, overflow: "hidden" }}>
          <Hero />
        </div>
        <div className="about-hero-panel-right absolute inset-0 h-full w-full structural-layer" style={{ zIndex: 20, overflow: "hidden" }}>
          <Hero />
        </div>

        <div className="about-section-two absolute inset-0 h-full w-full structural-layer" style={{ zIndex: 30 }}>
          <SectionTwo />
        </div>

        <div className="about-section-three absolute inset-0 w-full h-full structural-layer" style={{ zIndex: 40, clipPath: "inset(100% 0% 0% 0%)" }}>
          <SectionThree preloaderDone={preloaderDone} />
        </div>

        <div className="about-section-four absolute inset-0 h-full w-full structural-layer" style={{ zIndex: 50, clipPath: "inset(100% 0% 0% 0%)" }}>
          <SectionFour />
        </div>

        <div className="about-section-five absolute inset-0 h-full w-full structural-layer" style={{ zIndex: 60 }}>
          <SectionFive isActive={isSectionFiveActive} />
        </div>

        <div className="about-section-cta absolute bottom-0 left-0 w-full structural-layer" style={{ zIndex: 90 }}>
          <SectionCTA preloaderDone={preloaderDone} />
        </div>

        <div className="about-footer-wrap absolute left-0 bottom-0 w-full structural-layer" style={{ zIndex: 100 }}>
          <Footer />
        </div>
      </div>
    </div>
  );
}