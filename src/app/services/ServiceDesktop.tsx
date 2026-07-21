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

type ServicesDesktopProps = {
  preloaderDone: boolean;
};

export default function ServicesDesktop({ preloaderDone }: ServicesDesktopProps) {
  const { setPreloaderDone } = useSite();
  const scopeRef = useRef<HTMLDivElement>(null);
  
  const [introDone, setIntroDone] = useState(false);
  const [isSectionTwoActive, setIsSectionTwoActive] = useState(false);
  
  // Track current inner index for Section Two panels safely across refreshes
  const lastSec2Idx = useRef<number>(-1);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.history.scrollRestoration) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
    document.body.classList.remove("preloading");
    setPreloaderDone(true);
  }, [setPreloaderDone]);

  useEffect(() => {
    const locked = !preloaderDone || !introDone;
    document.body.style.overflow = locked ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [preloaderDone, introDone]);

  useLayoutEffect(() => {
    if (!preloaderDone) return;
    const ctx = gsap.context(() => {
      // Hero Initial Layout Restores
      gsap.set(".service-hero-bg", { scale: 1.3, xPercent: 0, transformOrigin: "center center" });
      gsap.set([".hero-title", ".hero-desc", ".hero-btn"], { opacity: 0, y: -60 });
      gsap.set(".services-hero-top-layer", { width: "100%" });
      
      // Section One Sheet Setups
      gsap.set(".section-one-wrap", { clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(".s1-glass-card", { x: 40, opacity: 0 }); 
      
      // Section Two Panel Split Configurations
      gsap.set(".services-section-two-wrap", { visibility: "hidden", opacity: 1 });
      gsap.set(".s2-left-panel", { yPercent: 100 });
      gsap.set(".s2-right-panel", { yPercent: -100 });
      gsap.set(".s2-inner-fade-target", { opacity: 0 });

      // App Section Initialization
      gsap.set(".services-appsec-wrap", { visibility: "hidden", yPercent: 100 });

      // CTA & Footer Backdrops Fixed
      gsap.set([".services-section-cta", ".services-footer-wrap"], { yPercent: 100, visibility: "hidden" });
      gsap.set(".services-section-cta", { zIndex: 70 });
      gsap.set(".services-footer-wrap", { zIndex: 80 });
    }, scopeRef);
    return () => ctx.revert();
  }, [preloaderDone]);

  useEffect(() => {
    if (!preloaderDone) return;

    const ctx = gsap.context(() => {
      // Standard Hero Intro Animation (Unchanged)
      const introTl = gsap.timeline({
        onComplete: () => setIntroDone(true)
      });

      introTl.to(".service-hero-bg", {
        scale: 1.1, 
        duration: 2.2,
        ease: "power2.out"
      }, 0);

      introTl.to([".hero-title", ".hero-desc", ".hero-btn"], {
        opacity: 1,
        y: 0,
        duration: 1.4,
        stagger: 0.2,
        ease: "power3.out",
      }, 0.4);
    }, scopeRef);

    return () => ctx.revert();
  }, [preloaderDone]);

  useEffect(() => {
    if (!introDone) return;

    if (isTouchOnly()) {
      ScrollTrigger.normalizeScroll(true);
    }

    let vvCleanup: (() => void) | null = null;

    const ctx = gsap.context(() => {
      gsap.ticker.lagSmoothing(0);

      ScrollTrigger.config({
        ignoreMobileResize: true,
        autoRefreshEvents: "visibilitychange,DOMContentLoaded,load,resize",
      });

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

      const scrubValue = 1.2;

      // ── TEXT REVEAL INITIALIZATION FOR ALL NON-HERO SECTIONS ──
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

      const buildTimeline = () => {
        requestAnimationFrame(() => {
          ScrollTrigger.refresh();

          const vv = typeof visualViewport !== "undefined" ? visualViewport : null;
          if (vv) {
            const onVVResize = () => ScrollTrigger.refresh(true);
            vv.addEventListener("resize", onVVResize);
            vvCleanup = () => vv.removeEventListener("resize", onVVResize);
          }

          const revealedElements = new Set<string>();

          const tl = gsap.timeline({
            defaults: { ease: "none" }, 
            scrollTrigger: {
              trigger: ".services-hero-master",
              start: "top top",
              end: "+=10800",
              scrub: scrubValue,
              pin: true,
              pinSpacing: true,
              anticipatePin: 1,
              preventOverlaps: true,
              invalidateOnRefresh: true,
              snap: {
                snapTo: (progress) => {
                  const labels = Object.keys(tl.labels).map(name => tl.labels[name] / tl.totalDuration());
                  labels.sort((a, b) => a - b);
                  
                  const currentProg = tl.progress();
                  const isForward = tl.scrollTrigger ? tl.scrollTrigger.direction > 0 : true;

                  for (let i = 0; i < labels.length - 1; i++) {
                    const start = labels[i];
                    const end = labels[i + 1];

                    if (currentProg >= start && currentProg <= end) {
                      const localProgress = (currentProg - start) / (end - start);
                      if (isForward) {
                        return localProgress >= 0.35 ? end : start;
                      } else {
                        return localProgress <= 0.40 ? start : end;
                      }
                    }
                  }
                  return progress;
                },
                duration: { min: 0.3, max: 0.6 },
                delay: 0.01,
                ease: "power1.inOut",
              }
            },
          });

          // Play-once text reveal trigger function (Identical to About Page)
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

          const triggerSec2Hook = (nextIdx: number) => {
            if (nextIdx !== lastSec2Idx.current) {
              lastSec2Idx.current = nextIdx;
              if ((window as any)._sec2GoTo) {
                (window as any)._sec2GoTo(nextIdx);
              }
            }
          };

          // ── HERO HOLD BUFFER & COMPRESSION ──
          tl.addLabel("heroStart")
            .set(".hero-text-wrap", { transformOrigin: "left bottom" }, 0)
            .to(".hero-text-wrap", { y: 60, scale: 0.75, duration: 1.0 }, 0)
            .to(".services-hero-top-layer", { width: "60%", duration: 1.0 }, 0);

          // ── SECTION 1 SHEET REVEAL ──
          tl.addLabel("sec1Start")
            .to(".section-one-wrap", { clipPath: "inset(0% 0% 0% 0%)", duration: 1.0 })
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
                onStart: () => setIsSectionTwoActive(true),
                onReverseComplete: () => {
                  setIsSectionTwoActive(false);
                  gsap.set(".services-section-two-wrap", { visibility: "hidden" });
                  triggerSec2Hook(0);
                }
            }, "sec2Start")
            .to(".s2-right-panel", { yPercent: 0, duration: 1.0 }, "sec2Start")
            .to(".s2-inner-fade-target", { opacity: 1, duration: 0.4, ease: "power1.out" }, "sec2Start+=0.6");

          addPlayOnceTextReveal("sec2Start", 0.35, ".services-section-two-wrap .reveal-text .gs-line-inner, .services-section-two-wrap .reveal-text > *");

          tl.call(() => {
            const isForward = tl.scrollTrigger ? tl.scrollTrigger.direction > 0 : true;
            triggerSec2Hook(isForward ? 0 : 0);
          }, [], "sec2Start+=1.0");

          // ── SECTION 2 PANEL INTERNAL STEP SLIDES ──
          tl.addLabel("sec2_card2", "sec2Start+=1.0")
            .to({}, { duration: 1.0 })
            .call(() => {
              const isForward = tl.scrollTrigger ? tl.scrollTrigger.direction > 0 : true;
              triggerSec2Hook(isForward ? 1 : 0);
            }, [], "sec2_card2+=1.0");

          tl.addLabel("sec2_card3", "sec2_card2+=1.0")
            .to({}, { duration: 1.0 })
            .call(() => {
              const isForward = tl.scrollTrigger ? tl.scrollTrigger.direction > 0 : true;
              triggerSec2Hook(isForward ? 2 : 1);
            }, [], "sec2_card3+=1.0");

          tl.addLabel("sec2_card4", "sec2_card3+=1.0")
            .to({}, { duration: 1.0 })
            .call(() => {
              const isForward = tl.scrollTrigger ? tl.scrollTrigger.direction > 0 : true;
              triggerSec2Hook(isForward ? 3 : 2);
            }, [], "sec2_card4+=1.0");

          // ── CARD 4 HOLD TRACK ──
          tl.addLabel("sec2_card4_hold", "sec2_card4+=1.0")
            .to({}, { duration: 1.0 });

          // ── APP SECTION SLIDE OVER ──
          tl.addLabel("appsecStart", "sec2_card4_hold+=1.0")
            .set(".services-appsec-wrap", { visibility: "visible" })
            .to(".services-appsec-wrap", { 
              yPercent: 0, 
              duration: 1.0,
              onStart: () => {
                const isForward = tl.scrollTrigger ? tl.scrollTrigger.direction > 0 : true;
                if (isForward) triggerSec2Hook(3);
              },
              onReverseComplete: () => {
                const isForward = tl.scrollTrigger ? tl.scrollTrigger.direction > 0 : true;
                if (!isForward) triggerSec2Hook(3);
              }
            });

          addPlayOnceTextReveal("appsecStart", 0.35, ".services-appsec-wrap .reveal-text .gs-line-inner, .services-appsec-wrap .reveal-text > *");

          // ── CTA REVEAL TRACK ──
          tl.addLabel("ctaStart")
            .set(".services-section-cta", { visibility: "visible" })
            .to(".services-section-cta", { yPercent: 0, duration: 1.0 })
            .to(".services-appsec-wrap", { scale: 1.0, duration: 1.0 }, "<");

          // ── FOOTER REVEAL TRACK ──
          tl.addLabel("footerStart")
            .set(".services-footer-wrap", { visibility: "visible" })
            .to(".services-footer-wrap", { yPercent: 0, duration: 1.0 })
            .to(".services-appsec-wrap", { scale: 1.05, duration: 1.0 }, "<")
            .to(".services-section-cta .cta-inner-desktop", { opacity: 0, duration: 0.7, ease: "power1.out" }, "<");
          
          tl.addLabel("end");
        });
      };

      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        (window as any).requestIdleCallback(
          () => document.fonts.ready.then(buildTimeline),
          { timeout: 300 }
        );
      } else {
        setTimeout(() => document.fonts.ready.then(buildTimeline), 0);
      }

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
    <div ref={scopeRef} className="w-full relative">
      <div className="services-hero-master relative w-full h-screen overflow-hidden bg-black" style={{ visibility: "visible" }}>
        <Hero />
        
        <div className="section-one-wrap absolute inset-0 w-full h-full overflow-hidden" style={{ zIndex: 20 }}>
          <SectionOne />
        </div>
        
        <div className="services-section-two-wrap absolute inset-0 w-full h-full overflow-hidden" style={{ zIndex: 30 }}>
          <SectionTwo isActive={isSectionTwoActive} />
        </div>
        
        <div className="services-appsec-wrap absolute inset-0 w-full h-full overflow-hidden" style={{ zIndex: 35 }}>
          <Appsection />
        </div>
        
        <div className="services-section-cta absolute bottom-0 left-0 w-full structural-layer" style={{ zIndex: 70 }}>
          <SectionCTA />
        </div>
        
        <div className="services-footer-wrap absolute left-0 bottom-0 w-full structural-layer" style={{ zIndex: 80 }}>
          <Footer />
        </div>
      </div>
    </div>
  );
}