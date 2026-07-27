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

// Dedicated Desktop Scroll Metrics
const PX_PER_MAIN_PANEL = 1250;
const PX_PER_SUB_STEP = 550;  
const PAUSE_PX = 150;         

export default function AboutDesktop() {
  const { setPreloaderDone, preloaderDone } = useSite();
  const [introDone, setIntroDone] = useState(false);
  const [isSectionFiveActive, setIsSectionFiveActive] = useState(false);
  const scopeRef = useRef<HTMLDivElement>(null);
  const lastSec5Idx = useRef<number>(-1);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.history.scrollRestoration) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);

    document.body.classList.remove("preloading");
    setPreloaderDone(true);
  }, [setPreloaderDone]);

  // Lock body overflow strictly during hero intro
  useEffect(() => {
    const locked = !introDone;
    document.body.style.overflow = locked ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [introDone]);

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

  // Hero Intro Sequence (Zoom Out: 1.4s, Text Fade: 1.0s)
  useEffect(() => {
    const ctx = gsap.context(() => {
      const introTl = gsap.timeline({
        onComplete: () => {
          setIntroDone(true);
          setTimeout(() => ScrollTrigger.refresh(), 50);
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
    if (!introDone) return;

    if (isTouchOnly()) {
      ScrollTrigger.normalizeScroll(true);
    }

    let vvCleanup: (() => void) | null = null;

    const ctx = gsap.context(() => {

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

        const MAIN_PANELS_COUNT = 7;
        const SUB_STEPS_COUNT = 2;
        const PAUSES_COUNT = 5;

        const DYNAMIC_SCROLL_TRACK = 
          (MAIN_PANELS_COUNT * PX_PER_MAIN_PANEL) + 
          (SUB_STEPS_COUNT * PX_PER_SUB_STEP) + 
          (PAUSES_COUNT * PAUSE_PX);

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: ".about-pin",
            start: "top top",
            end: `+=${DYNAMIC_SCROLL_TRACK}`,
            scrub: 1, // Tight scrub duration for high-precision track response
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            preventOverlaps: true,
            invalidateOnRefresh: true,
            snap: {
              directional: false,
              snapTo: (value, self) => {
                const totalDur = tl.totalDuration();
                if (!totalDur) return value;

                // Build strictly clean list of normalized label times
                const labelTimes = Array.from(
                  new Set(
                    Object.keys(tl.labels).map(name =>
                      Number((tl.labels[name] / totalDur).toFixed(5))
                    )
                  )
                ).sort((a, b) => a - b);

                if (labelTimes.length < 2) return value;

                const curProgress = self ? self.progress : value;
                const isScrollingDown = value >= curProgress;

                for (let i = 0; i < labelTimes.length - 1; i++) {
                  const start = labelTimes[i];
                  const end = labelTimes[i + 1];

                  if (curProgress >= start - 0.0001 && curProgress <= end + 0.0001) {
                    const gap = end - start;
                    if (gap <= 0.00001) continue;

                    const localProgress = (curProgress - start) / gap;

                    if (isScrollingDown) {
                      return localProgress >= 0.35 ? end : start;
                    } else {
                      return localProgress <= 0.50 ? start : end;
                    }
                  }
                }

                return value;
              },
              duration: { min: 0.4, max: 0.8 },
              delay: 0.05,
              ease: "power3.inOut"
            }
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

        const triggerSec5Hook = (nextIdx: number) => {
          if (nextIdx !== lastSec5Idx.current) {
            lastSec5Idx.current = nextIdx;
            if ((window as any)._sec5GoTo) {
              (window as any)._sec5GoTo(nextIdx);
            }
          }
        };

        // Time 0: Initial Hero rest label
        tl.addLabel("start", 0);

        tl.set(".about-hero-panel-left", { clipPath: "inset(0% 50% 0% 0%)", WebkitClipPath: "inset(0% 50% 0% 0%)" }, 0);
        tl.set(".about-hero-panel-right", { clipPath: "inset(0% 0% 0% 50%)", WebkitClipPath: "inset(0% 0% 0% 50%)" }, 0);

        // ── SECTION 1 REVEAL ──
        tl.to(".about-hero-panel-left", { clipPath: "inset(0% 50% 100% 0%)", WebkitClipPath: "inset(0% 50% 100% 0%)", duration: 1.0 })
          .to(".about-hero-panel-right", { clipPath: "inset(100% 0% 0% 50%)", WebkitClipPath: "inset(100% 0% 0% 50%)", duration: 1.0 }, "<")
          .fromTo(".about-hero-bg", { scale: 1.15 }, { scale: 1.0, duration: 1.0 }, "<")
          .addLabel("sec1Start");

        addPlayOnceTextReveal("sec1Start", -0.65, ".about-section-one .reveal-text .gs-line-inner, .about-section-one .reveal-text > *");

        // ── SECTION 2 REVEAL ──
        tl.set(".about-section-two", { visibility: "visible", yPercent: 100 })
          .to(".about-section-two", { yPercent: 0, duration: 1.0 })
          .fromTo(".s2-bg", { scale: 1.1 }, { scale: 1.0, duration: 1.0 }, "<")
          .addLabel("sec2Start");

        addPlayOnceTextReveal("sec2Start", -0.65, ".about-section-two .reveal-text .gs-line-inner, .about-section-two .reveal-text > *");

        // ── SECTION 3 REVEAL ──
        tl.set(".about-section-three", { visibility: "visible" })
          .fromTo(".about-section-three", 
            { clipPath: "inset(100% 0% 0% 0%)", WebkitClipPath: "inset(100% 0% 0% 0%)" }, 
            { clipPath: "inset(0% 0% 0% 0%)", WebkitClipPath: "inset(0% 0% 0% 0%)", duration: 1.0 }
          )
          .to(".s2-bg", { yPercent: -15, duration: 1.0 }, "<")
          .fromTo(".s3-bg", { scale: 1.15 }, { scale: 1.0, duration: 1.0 }, "<")
          .addLabel("sec3Start");

        addPlayOnceTextReveal("sec3Start", -0.65, ".about-section-three .s3-reveal-bottom .gs-line-inner, .about-section-three .s3-reveal-bottom > *");
        addPlayOnceTextReveal("sec3Start", -0.4, ".about-section-three .s3-reveal-top .gs-line-inner, .about-section-three .s3-reveal-top > *");

        // ── SECTION 4 REVEAL ──
        tl.set(".about-section-four", { visibility: "visible" })
          .to(".about-section-four", { clipPath: "inset(0% 0% 0% 0%)", WebkitClipPath: "inset(0% 0% 0% 0%)", duration: 1.0 })
          .to(".s4-glass-card", { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, "<+=0.2")
          .addLabel("sec4Start");

        addPlayOnceTextReveal("sec4Start", -0.65, ".about-section-four .reveal-text .gs-line-inner, .about-section-four .reveal-text > *");

        // ── SECTION 5 REVEAL (Card 1) ──
        tl.set(".about-section-five", { visibility: "visible" })
          .to(".about-section-four .s4-img-bg", { scale: 1.03, yPercent: -10, duration: 1.0 })
          .fromTo(".about-section-five", { yPercent: 100 }, { 
            yPercent: 0, 
            duration: 1.0,
            onStart: () => setIsSectionFiveActive(true),
            onReverseComplete: () => {
              setIsSectionFiveActive(false);
              triggerSec5Hook(0);
            }
          }, "<")
          .fromTo(".s5-bg", { yPercent: 0, scale: 1.2 }, { yPercent: 0, scale: 1.15, duration: 1.0 }, "<")
          .addLabel("sec5_card1")
          .call(() => triggerSec5Hook(0));

        // ── SECTION 5 CARD 2 ──
        tl.to(".s5-bg", { yPercent: -10, duration: 1.0 })
          .addLabel("sec5_card2")
          .call(() => triggerSec5Hook(1));

        // ── SECTION 5 CARD 3 ──
        tl.to(".s5-bg", { yPercent: -20, duration: 1.0 })
          .addLabel("sec5_card3")
          .call(() => triggerSec5Hook(2));

        // ── CTA REVEAL TRACK ──
        tl.set(".about-section-cta", { visibility: "visible" })
          .to(".about-section-cta", { yPercent: 0, duration: 1.0 })
          .to(".about-section-five", { scale: 1.0, duration: 1.0 }, "<")
          .addLabel("ctaStart");

        // ── FOOTER REVEAL TRACK ──
        tl.set(".about-footer-wrap", { visibility: "visible" })
          .to(".about-footer-wrap", { yPercent: 0, duration: 1.0 })
          .to(".about-section-five", { scale: 1.05, duration: 1.0 }, "<")
          .to(".about-section-cta .cta-inner-desktop", { opacity: 0, duration: 0.7, ease: "power1.out" }, "<")
          .addLabel("footerStart");
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
  }, [introDone]);

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