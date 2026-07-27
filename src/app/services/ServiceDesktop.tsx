"use client";

import { useRef, useEffect, useLayoutEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSite } from "@/src/app/context/SiteContext";
import { useTextReveal, restoreTextReveal } from "@/src/app/utils/useTextReveal";
import Hero from "@/src/components/Service/Hero";
import SectionOne from "@/src/components/Service/SectionOne";
import SectionTwo from "@/src/components/Service/SectionTwo";
import Appsection from "@/src/components/Appsection"; 
import SectionCTA from "@/src/components/SectionCTA";
import Footer from "@/src/components/Footer";

gsap.registerPlugin(ScrollTrigger);

const isTouchOnly = () => ScrollTrigger.isTouch === 1;

// Dedicated Desktop Scroll Metrics
const PX_PER_MAIN_PANEL = 1250;
const PX_PER_SUB_STEP = 550;
const PAUSE_PX = 150;

export default function ServicesDesktop() {
  const { setPreloaderDone, preloaderDone } = useSite();
  const scopeRef = useRef<HTMLDivElement>(null);
  
  const [introDone, setIntroDone] = useState(false);
  const [isSectionTwoActive, setIsSectionTwoActive] = useState(false);
  
  const lastSec2Idx = useRef<number>(-1);

  // 1. Scroll restoration & initialization
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.history.scrollRestoration) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
    document.body.classList.remove("preloading");
    setPreloaderDone(true);
  }, [setPreloaderDone]);

  // 2. Lock body scroll during intro sequence
  useEffect(() => {
    const locked = !introDone;
    document.body.style.overflow = locked ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [introDone]);

  // 3. Offscreen layout setup (Keeps CTA layout bounds intact for WebGL)
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.config({
        ignoreMobileResize: true,
        autoRefreshEvents: "DOMContentLoaded,load,visibilitychange,resize",
      });

      gsap.set(".service-hero-bg", { scale: 1.4, xPercent: 0, force3D: true, transformOrigin: "center center" });
      gsap.set([".hero-title", ".hero-desc", ".hero-btn"], { opacity: 0, y: -60, force3D: true });
      gsap.set(".services-hero-top-layer", { width: "100%", force3D: true });
      
      gsap.set(".section-one-wrap", { clipPath: "inset(100% 0% 0% 0%)", WebkitClipPath: "inset(100% 0% 0% 0%)", force3D: true });
      gsap.set(".s1-glass-card", { x: 40, opacity: 0, force3D: true }); 
      
      gsap.set(".services-section-two-wrap", { visibility: "hidden", opacity: 1, force3D: true });
      gsap.set(".s2-left-panel", { yPercent: 100, force3D: true });
      gsap.set(".s2-right-panel", { yPercent: -100, force3D: true });
      gsap.set(".s2-inner-fade-target", { opacity: 0, force3D: true });

      gsap.set(".services-appsec-wrap", { visibility: "hidden", yPercent: 100, force3D: true });

      // FIX: Standardize offscreen position without using display: none so WebGL context initializes cleanly
      gsap.set(".services-section-cta", { yPercent: 100, visibility: "hidden", zIndex: 120, force3D: true });
      gsap.set(".services-footer-wrap", { yPercent: 100, visibility: "hidden", zIndex: 125, force3D: true });
    }, scopeRef);
    return () => ctx.revert();
  }, []);

  // 4. Play Intro Cinematic Animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      const introTl = gsap.timeline({
        onComplete: () => {
          setIntroDone(true);
          setTimeout(() => ScrollTrigger.refresh(), 50);
        }
      });

      introTl.to(".service-hero-bg", {
        scale: 1.15, 
        duration: 1.5,
        ease: "power2.out"
      }, 0);

      introTl.to([".hero-title", ".hero-desc", ".hero-btn"], {
        opacity: 1,
        y: 0,
        duration: 1.0,
        stagger: 0.15,
        ease: "power2.out",
      }, 0.2);
    }, scopeRef);

    return () => ctx.revert();
  }, []);

  // 5. Master Single ScrollTrigger Timeline
  useEffect(() => {
    if (!introDone) return;

    if (isTouchOnly()) {
      ScrollTrigger.normalizeScroll(true);
    }

    let vvCleanup: (() => void) | null = null;

    const ctx = gsap.context(() => {
      gsap.ticker.lagSmoothing(0);

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

        const MAIN_PANELS_COUNT = 6;
        const SUB_STEPS_COUNT = 2;
        const PAUSES_COUNT = 4;

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
            snap: {
              directional: false,
              snapTo: (value, self) => {
                const totalDur = tl.totalDuration();
                if (!totalDur) return value;

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

        tl.to(".hero-text-wrap", { y: 60, scale: 0.75, duration: 1.0 }, 0)
          .to(".services-hero-top-layer", { width: "60%", duration: 1.0 }, 0)
          .to(".hero-btn", { opacity: 0, duration: 0.4, ease: "power2.out", pointerEvents: "none" }, 0);

        // ── SECTION 1 SHEET REVEAL ──
        tl.addLabel("sec1Start")
          .to(".section-one-wrap", { clipPath: "inset(0% 0% 0% 0%)", WebkitClipPath: "inset(0% 0% 0% 0%)", duration: 1.0 }, "sec1Start")
          .to(".service-hero-bg", { xPercent: -8, scale: 1.6, duration: 1.0 }, "<")
          .to(".s1-glass-card", { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" }, "sec1Start+=0.2");

        addPlayOnceTextReveal("sec1Start", 0.35, ".section-one-wrap .reveal-text .gs-line-inner, .section-one-wrap .reveal-text > *");

        // ── SECTION TWO TRANSITION ──
        tl.addLabel("sec2Start")
          .set(".services-section-two-wrap", { visibility: "visible" })
          .to(".s1-glass-card", { opacity: 0, y: -50, duration: 0.5 }, "sec2Start")
          .to(".s2-left-panel", { 
              yPercent: 0, 
              duration: 1.0,
              onReverseComplete: () => {
                setIsSectionTwoActive(false);
                gsap.set(".services-section-two-wrap", { visibility: "hidden" });
                triggerSec2Hook(0);
              }
          }, "sec2Start")
          .to(".s2-right-panel", { yPercent: 0, duration: 1.0 }, "sec2Start")
          
          .to(".s2-inner-fade-target", { 
            opacity: 1, 
            duration: 0.5, 
            ease: "power2.out",
            onStart: () => setIsSectionTwoActive(true),
            onReverseComplete: () => setIsSectionTwoActive(false)
          }, "sec2Start+=1.0");

        addPlayOnceTextReveal("sec2Start", 1.0, ".services-section-two-wrap .reveal-text .gs-line-inner, .services-section-two-wrap .reveal-text > *");

        // ── SECTION 2 PANEL INTERNAL SLIDES (WITH REVERSE SYNC HOOKS) ──
        tl.addLabel("sec2_card1", "sec2Start+=1.5");
        tl.call(() => {
          triggerSec2Hook(0);
        }, [], "sec2_card1");

        tl.addLabel("sec2_card2", "sec2_card1+=1.0");
        tl.call(() => {
          const isForward = tl.scrollTrigger ? tl.scrollTrigger.direction > 0 : true;
          triggerSec2Hook(isForward ? 1 : 0);
        }, [], "sec2_card2");

        tl.addLabel("sec2_card3", "sec2_card2+=1.0");
        tl.call(() => {
          const isForward = tl.scrollTrigger ? tl.scrollTrigger.direction > 0 : true;
          triggerSec2Hook(isForward ? 2 : 1);
        }, [], "sec2_card3");

        // ── APP SECTION SLIDE OVER ──
        tl.addLabel("appsecStart", "sec2_card3+=0.8");
        tl.set(".services-appsec-wrap", { visibility: "visible" })
          .to(".s2-inner-fade-target", { opacity: 1, duration: 0.5 }, "appsecStart")
          .to(".services-appsec-wrap", { 
            yPercent: 0, 
            duration: 1.0,
            ease: "power1.inOut",
            onStart: () => triggerSec2Hook(2),
            onReverseComplete: () => triggerSec2Hook(2)
          }, "appsecStart");

        addPlayOnceTextReveal("appsecStart", 0.35, ".services-appsec-wrap .reveal-text .gs-line-inner, .services-appsec-wrap .reveal-text > *");

        // ── CTA REVEAL TRACK ──
        tl.addLabel("ctaStart")
          .set(".services-section-cta", { 
            visibility: "visible",
            onStart: () => {
              // Force WebGL Canvas to re-calculate viewport dimensions on reveal
              window.dispatchEvent(new Event("resize"));
            }
          })
          .to(".services-section-cta", { yPercent: 0, duration: 1.0, ease: "power2.out" }, "ctaStart")
          .to(".services-appsec-wrap", { scale: 1.0, duration: 1.0 }, "<");

        // ── FOOTER REVEAL TRACK ──
        tl.addLabel("footerStart")
          .set(".services-footer-wrap", { visibility: "visible" })
          .to(".services-footer-wrap", { yPercent: 0, duration: 1.0, ease: "power2.out" }, "footerStart")
          .to(".services-appsec-wrap", { scale: 1.05, duration: 1.0 }, "<")
          .to(".services-section-cta .cta-inner-desktop", { opacity: 0, duration: 0.7, ease: "power1.out" }, "<");
        
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
  }, [introDone]);

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
          <SectionCTA preloaderDone={preloaderDone} />
        </div>
        
        {/* Layer 6: Footer Container */}
        <div className="services-footer-wrap absolute left-0 bottom-0 w-full structural-layer" style={{ zIndex: 125 }}>
          <Footer />
        </div>

      </div>
    </div>
  );
}