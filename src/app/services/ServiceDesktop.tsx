"use client";

import { useRef, useEffect, useLayoutEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useHeroIntro } from "@/src/app/utils/useHeroIntro";
import { useTextReveal, restoreTextReveal } from "@/src/app/utils/useTextReveal";
import Hero from "@/src/components/Service/Hero";
import SectionOne from "@/src/components/Service/SectionOne";
import SectionTwo from "@/src/components/Service/SectionTwo";
import Appsection from "@/src/components/Appsection"; 
import SectionCTA from "@/src/components/SectionCTA";
import Footer from "@/src/components/Footer";

gsap.registerPlugin(ScrollTrigger);

const isTouchOnly = () => ScrollTrigger.isTouch === 1;

// Standardized Desktop Metrics (Matching Home & About standards)
const PX_PER_MAIN_PANEL = 1000;
const PX_PER_SUB_STEP = 600;
const PAUSE_PX = 350;

export default function ServicesDesktop() {
  const scopeRef = useRef<HTMLDivElement>(null);
  
  const [isSectionTwoActive, setIsSectionTwoActive] = useState(false);
  const lastSec2Idx = useRef<number>(-1);

  // Single unified utility hook for Hero Intro & scroll handling
  const { introDone, preloaderDone } = useHeroIntro(scopeRef);

  // Offscreen layout setup & initial component positions
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(".services-hero-top-layer", { width: "100%", force3D: true });
      
      gsap.set(".section-one-wrap", { clipPath: "inset(100% 0% 0% 0%)", WebkitClipPath: "inset(100% 0% 0% 0%)", force3D: true });
      gsap.set(".s1-glass-card", { x: 40, opacity: 0, force3D: true }); 
      
      gsap.set(".services-section-two-wrap", { visibility: "hidden", opacity: 1, force3D: true });
      gsap.set(".s2-left-panel", { yPercent: 100, force3D: true });
      gsap.set(".s2-right-panel", { yPercent: -100, force3D: true });
      gsap.set(".s2-inner-fade-target", { opacity: 0, force3D: true });

      gsap.set(".services-appsec-wrap", { visibility: "hidden", yPercent: 100, force3D: true });

      gsap.set(".services-section-cta", { yPercent: 100, visibility: "hidden", zIndex: 120, force3D: true });
      gsap.set(".services-footer-wrap", { yPercent: 100, visibility: "hidden", zIndex: 125, force3D: true });
      gsap.set([".cta-inner-desktop", ".cta-inner-mobile"], { opacity: 1, force3D: true });
    }, scopeRef);

    return () => ctx.revert();
  }, []);

  // Master Single ScrollTrigger Timeline
  useEffect(() => {
    if (!introDone || !preloaderDone) return;

    if (isTouchOnly()) {
      ScrollTrigger.normalizeScroll(true);
    }

    let vvCleanup: (() => void) | null = null;

    const ctx = gsap.context(() => {
      gsap.ticker.lagSmoothing(500, 33);

      const performanceTargets = [
        ".services-hero-master", ".service-hero-bg", ".services-hero-top-layer",
        ".section-one-wrap", ".s1-glass-card", ".services-section-two-wrap",
        ".s2-left-panel", ".s2-right-panel", ".services-appsec-wrap",
        ".services-section-cta", ".services-footer-wrap"
      ];

      performanceTargets.forEach(selector => {
        gsap.set(selector, {
          force3D: true,
          willChange: "transform, opacity, clip-path"
        });
      });

      useTextReveal(scopeRef, ".section-one-wrap .reveal-text");
      useTextReveal(scopeRef, ".services-section-two-wrap .reveal-text");
      useTextReveal(scopeRef, ".services-appsec-wrap .reveal-text");

      gsap.set([
        ".section-one-wrap .reveal-text",
        ".services-section-two-wrap .reveal-text",
        ".services-appsec-wrap .reveal-text"
      ], { visibility: "visible", opacity: 1 });

      gsap.set([
        ".section-one-wrap .reveal-text .gs-line-inner",
        ".services-section-two-wrap .reveal-text .gs-line-inner",
        ".services-appsec-wrap .reveal-text .gs-line-inner",
        ".section-one-wrap .reveal-text > *",
        ".services-section-two-wrap .reveal-text > *",
        ".services-appsec-wrap .reveal-text > *"
      ], { y: 45, opacity: 0 });

      const triggerSec2Hook = (targetIdx: number) => {
        if (targetIdx !== lastSec2Idx.current) {
          lastSec2Idx.current = targetIdx;
          if (typeof (window as any)._sec2GoTo === "function") {
            (window as any)._sec2GoTo(targetIdx);
          }
        }
      };

      const buildTimeline = () => {
        ScrollTrigger.refresh();

        const vv = typeof visualViewport !== "undefined" ? visualViewport : null;
        if (vv) {
          const onVVResize = () => ScrollTrigger.refresh(true);
          vv.addEventListener("resize", onVVResize);
          vvCleanup = () => vv.removeEventListener("resize", onVVResize);
        }

        const revealedElements = new Set<string>();

        // Standardized Uniform Metrics
        const PANEL_ACTION = 2.0;
        const SUB_ACTION = 1.8;
        const PAUSE_ACTION = 0.5;

        const MAIN_PANELS_COUNT = 6;
        const SUB_STEPS_COUNT = 2;
        const PAUSES_COUNT = 7;

        const DYNAMIC_SCROLL_TRACK = 
          (MAIN_PANELS_COUNT * PX_PER_MAIN_PANEL) + 
          (SUB_STEPS_COUNT * PX_PER_SUB_STEP) + 
          (PAUSES_COUNT * PAUSE_PX);

        const tl = gsap.timeline({
          defaults: { ease: "none" }, 
          scrollTrigger: {
            trigger: ".services-pin",
            start: "top top",
            end: `+=${DYNAMIC_SCROLL_TRACK}`, 
            scrub: 1,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            preventOverlaps: true,
            invalidateOnRefresh: true,
          }
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

        // ── HERO HOLD BUFFER ──
        tl.addLabel("heroStart", 0);
        tl.set(".hero-btn", { pointerEvents: "auto", zIndex: 50 }, 0);
        tl.set(".hero-text-wrap", { transformOrigin: "left bottom" }, 0);

        tl.to(".hero-text-wrap", { y: 60, scale: 0.75, duration: PANEL_ACTION }, 0)
          .to(".services-hero-top-layer", { width: "60%", duration: PANEL_ACTION }, 0)
          .to(".hero-btn", { opacity: 0, duration: PANEL_ACTION * 0.2, ease: "power2.out", pointerEvents: "none" }, 0);

        // ── SECTION 1 SHEET REVEAL ──
        tl.addLabel("sec1Start")
          .to(".section-one-wrap", { clipPath: "inset(0% 0% 0% 0%)", WebkitClipPath: "inset(0% 0% 0% 0%)", duration: PANEL_ACTION, ease: "power2.inOut" }, "sec1Start")
          .to(".service-hero-bg", { xPercent: -8, scale: 1.6, duration: PANEL_ACTION, ease: "power2.inOut" }, "<")
          .to(".s1-glass-card", { opacity: 1, x: 0, duration: PANEL_ACTION * 0.5, ease: "power2.out" }, `sec1Start+=${PANEL_ACTION * 0.2}`);

        addPlayOnceTextReveal("sec1Start", 0.35, ".section-one-wrap .reveal-text .gs-line-inner, .section-one-wrap .reveal-text > *");

        tl.to({}, { duration: PAUSE_ACTION });

        // ── SECTION TWO TRANSITION ──
        tl.addLabel("sec2Start", ">")
          .set(".services-section-two-wrap", { visibility: "visible" }, "sec2Start")
          .to(".s1-glass-card", { opacity: 0, y: -50, duration: PANEL_ACTION * 0.5 }, "sec2Start")
          .to(".s2-left-panel", { 
              yPercent: 0, 
              duration: PANEL_ACTION,
              ease: "power2.inOut",
              onReverseComplete: () => {
                setIsSectionTwoActive(false);
                gsap.set(".services-section-two-wrap", { visibility: "hidden" });
                triggerSec2Hook(0);
              }
          }, "sec2Start")
          .to(".s2-right-panel", { yPercent: 0, duration: PANEL_ACTION, ease: "power2.inOut" }, "sec2Start")
          
          .to(".s2-inner-fade-target", { 
            opacity: 1, 
            duration: PANEL_ACTION * 0.5, 
            ease: "power2.out",
            onStart: () => setIsSectionTwoActive(true),
            onReverseComplete: () => setIsSectionTwoActive(false)
          }, `sec2Start+=${PANEL_ACTION * 0.8}`);

        addPlayOnceTextReveal("sec2Start", 1.0, ".services-section-two-wrap .reveal-text .gs-line-inner, .services-section-two-wrap .reveal-text > *");

        // ── SECTION 2 PANEL INTERNAL SLIDES ──
        tl.addLabel("sec2_card1", `sec2Start+=${PANEL_ACTION * 1.2}`);
        tl.call(() => {
          triggerSec2Hook(0);
        }, [], "sec2_card1");

        tl.addLabel("sec2_card2", `sec2_card1+=${SUB_ACTION}`);
        tl.call(() => {
          const isForward = tl.scrollTrigger ? tl.scrollTrigger.direction > 0 : true;
          triggerSec2Hook(isForward ? 1 : 0);
        }, [], "sec2_card2");

        tl.addLabel("sec2_card3", `sec2_card2+=${SUB_ACTION}`);
        tl.call(() => {
          const isForward = tl.scrollTrigger ? tl.scrollTrigger.direction > 0 : true;
          triggerSec2Hook(isForward ? 2 : 1);
        }, [], "sec2_card3");

        tl.to({}, { duration: PAUSE_ACTION });

        // ── APP SECTION SLIDE OVER ──
        tl.addLabel("appsecStart", ">")
          .set(".services-appsec-wrap", { visibility: "visible" }, "appsecStart")
          .to(".s2-inner-fade-target", { opacity: 1, duration: PANEL_ACTION * 0.5 }, "appsecStart")
          .to(".services-appsec-wrap", { 
            yPercent: 0, 
            duration: PANEL_ACTION,
            ease: "power2.inOut",
            onStart: () => triggerSec2Hook(2),
            onReverseComplete: () => triggerSec2Hook(2)
          }, "appsecStart");

        addPlayOnceTextReveal("appsecStart", 0.35, ".services-appsec-wrap .reveal-text .gs-line-inner, .services-appsec-wrap .reveal-text > *");

        tl.to({}, { duration: PAUSE_ACTION });

        // ── CTA REVEAL TRACK ──
        tl.addLabel("ctaStart", ">")
          .set(".services-section-cta", { 
            visibility: "visible",
            onStart: () => {
              window.dispatchEvent(new Event("resize"));
            }
          }, "ctaStart")
          .to(".services-section-cta", { yPercent: 0, duration: PANEL_ACTION, ease: "power2.out" }, "ctaStart")
          .to(".services-appsec-wrap", { scale: 1.0, duration: PANEL_ACTION }, "<");

        tl.to({}, { duration: PAUSE_ACTION });

        // ── CTA INNER CONTENT FADE OUT FIRST ──
        tl.addLabel("ctaFadeOut", ">")
          .to(".services-section-cta .cta-inner-desktop", { 
            opacity: 0, 
            y: -40, 
            duration: PANEL_ACTION * 0.5, 
            ease: "power2.in" 
          }, "ctaFadeOut")
          .to({}, { duration: 0 });

        // ── FOOTER REVEAL TRACK ──
        tl.addLabel("footerStart", ">")
          .set(".services-footer-wrap", { visibility: "visible" }, "footerStart")
          .to(".services-footer-wrap", { yPercent: 0, duration: PANEL_ACTION, ease: "power2.out" }, "footerStart")
          .to(".services-appsec-wrap", { scale: 1.05, duration: PANEL_ACTION }, "<");
        
        tl.addLabel("end");
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
            ".section-one-wrap .reveal-text",
            ".services-section-two-wrap .reveal-text",
            ".services-appsec-wrap .reveal-text"
          ].join(",")
        );
      }
      ctx.revert();
    };
  }, [introDone, preloaderDone]);

  return (
    <div ref={scopeRef}>
      <div className="services-pin relative h-screen w-screen overflow-hidden bg-black" style={{ visibility: "visible" }}>
        
        {/* Layer 1: Hero Container */}
        <div className="services-hero-wrap relative z-10 pointer-events-auto w-full h-full">
          <Hero />
        </div>
        
        {/* Layer 2: Section One Container */}
        <div className="section-one-wrap absolute inset-0 w-full h-full overflow-hidden" style={{ zIndex: 20 }}>
          <SectionOne />
        </div>
        
        {/* Layer 3: Section Two Container */}
        <div className="services-section-two-wrap absolute inset-0 w-full h-full overflow-hidden" style={{ zIndex: 30 }}>
          <SectionTwo isActive={isSectionTwoActive} />
        </div>
        
        {/* Layer 4: App Section Container */}
        <div className="services-appsec-wrap absolute inset-0 w-full h-full overflow-hidden" style={{ zIndex: 35 }}>
          <Appsection />
        </div>
        
        {/* Layer 5: CTA Section Container */}
        <div className="services-section-cta absolute bottom-0 left-0 w-full structural-layer pointer-events-auto" style={{ zIndex: 120 }}>
          <SectionCTA  />
        </div>
        
        {/* Layer 6: Footer Container */}
        <div className="services-footer-wrap absolute left-0 bottom-0 w-full structural-layer" style={{ zIndex: 125 }}>
          <Footer />
        </div>

      </div>
    </div>
  );
}