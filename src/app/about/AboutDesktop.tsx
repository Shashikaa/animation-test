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

type AboutDesktopProps = {
  preloaderDone: boolean;
};

export default function AboutDesktop({ preloaderDone }: AboutDesktopProps) {
  const { setPreloaderDone } = useSite();
  const [introDone, setIntroDone] = useState(false);
  const scopeRef = useRef<HTMLDivElement>(null);
  
  const activeCardRef = useRef<number>(0);

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
    const ctx = gsap.context(() => {
      gsap.set(".about-hero-bg", { scale: 1.4 });
      gsap.set([".hero-title", ".hero-desc"], { opacity: 0, y: 30 });
      gsap.set(".about-hero-panel-left", { clipPath: "inset(0% 0% 0% 0%)" });
      gsap.set(".about-hero-panel-right", { clipPath: "inset(0% 0% 0% 0%)" });

      gsap.set(".about-section-two", { 
        visibility: "hidden", 
        yPercent: 100
      });
      
      gsap.set(".about-section-three", { visibility: "hidden", clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(".about-section-four", { visibility: "hidden", clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(".s4-glass-card", { y: 80, opacity: 0 });
      
      gsap.set(".about-section-five", { 
        visibility: "hidden", 
        yPercent: 100
      });
      
      gsap.set(".s5-slide-card-0", { opacity: 1, pointerEvents: "auto" });
      gsap.set([".s5-slide-card-1", ".s5-slide-card-2"], { opacity: 0, pointerEvents: "none" });
      
      gsap.set([".about-section-cta", ".about-footer-wrap"], { yPercent: 100, visibility: "hidden" });
      gsap.set(".about-section-cta", { zIndex: 95 });
      gsap.set(".about-footer-wrap", { zIndex: 96 });
    }, scopeRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!preloaderDone) return;

    const ctx = gsap.context(() => {
      const introTl = gsap.timeline({
        onComplete: () => setIntroDone(true)
      });

      introTl.to(".about-hero-bg", {
        scale: 1.15,
        duration: 2.2,
        ease: "power2.out"
      }, 0);

      introTl.to([".hero-title", ".hero-desc"], {
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
        ".about-hero-panel-left", ".about-hero-panel-right", ".about-hero-bg",
        ".about-section-two", ".about-section-three", ".about-section-four", ".about-section-five",
        ".about-section-cta", ".about-footer-wrap", ".s2-bg", ".s3-bg", ".s4-img-bg", ".s5-bg"
      ];

      performanceTargets.forEach(selector => {
        gsap.set(selector, {
          force3D: true,
          willChange: "transform, opacity, clip-path"
        });
      });

      // Standardized to match the Home page's close scrub speed tracking
      const scrubValue = 1.2; 

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
              trigger: ".about-pin",
              start: "top top",
              // 8 sections (Hero/S1, S2, S3, S4, S5 Card 1, S5 Card 2, S5 Card 3, CTA/Footer) x 1200px = 9600px
              end: "+=9600", 
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
                ease: "power1.inOut" // Softened snapping curve for continuous scroll parity
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

          const triggerCardFade = (targetIndex: number) => {
            if (activeCardRef.current === targetIndex) return;
            
            const outboundSelector = `.s5-slide-card-${activeCardRef.current}`;
            const inboundSelector = `.s5-slide-card-${targetIndex}`;
            activeCardRef.current = targetIndex;

            gsap.to(outboundSelector, {
              opacity: 0,
              duration: 0.6,
              ease: "power2.inOut",
              pointerEvents: "none",
              overwrite: "auto"
            });

            gsap.to(inboundSelector, {
              opacity: 1,
              duration: 0.6,
              ease: "power2.inOut",
              pointerEvents: "auto",
              overwrite: "auto"
            });
          };

          // Standardized Timeline Structure: Each block takes exactly 1.0 unit weight relative duration
          tl.set(".about-hero-panel-left", { clipPath: "inset(0% 50% 0% 0%)" }, 0);
          tl.set(".about-hero-panel-right", { clipPath: "inset(0% 0% 0% 50%)" }, 0);

          // ── SECTION 1 REVEAL ──
          tl.addLabel("sec1Start")
            .to(".about-hero-panel-left", { clipPath: "inset(0% 50% 100% 0%)", duration: 1.0 })
            .to(".about-hero-panel-right", { clipPath: "inset(100% 0% 0% 50%)", duration: 1.0 }, "<")
            .fromTo(".about-hero-bg", { scale: 1.15 }, { scale: 1.0, duration: 1.0 }, "<");

          addPlayOnceTextReveal("sec1Start", 0.35, ".about-section-one .reveal-text .gs-line-inner, .about-section-one .reveal-text > *");

          // ── SECTION 2 REVEAL ──
          tl.addLabel("sec2Start")
            .set(".about-section-two", { visibility: "visible", yPercent: 100 })
            .to(".about-section-two", { yPercent: 0, duration: 1.0 })
            .fromTo(".s2-bg", { scale: 1.1 }, { scale: 1.0, duration: 1.0 }, "<");

          addPlayOnceTextReveal("sec2Start", 0.35, ".about-section-two .reveal-text .gs-line-inner, .about-section-two .reveal-text > *");

          // ── SECTION 3 REVEAL ──
          tl.addLabel("sec3Start")
            .set(".about-section-three", { visibility: "visible" })
            .fromTo(".about-section-three", { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.0 })
            .to(".s2-bg", { yPercent: -15, duration: 1.0 }, "<")
            .fromTo(".s3-bg", { scale: 1.15 }, { scale: 1.0, duration: 1.0 }, "<");

          addPlayOnceTextReveal("sec3Start", 0.35, ".about-section-three .s3-reveal-bottom .gs-line-inner, .about-section-three .s3-reveal-bottom > *");
          addPlayOnceTextReveal("sec3Start", 0.6, ".about-section-three .s3-reveal-top .gs-line-inner, .about-section-three .s3-reveal-top > *");

          // ── SECTION 4 REVEAL ──
          tl.addLabel("sec4Start")
            .set(".about-section-four", { visibility: "visible" })
            .to(".about-section-four", { clipPath: "inset(0% 0% 0% 0%)", duration: 1.0 })
            .to(".s4-glass-card", { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, "sec4Start+=0.2");

          addPlayOnceTextReveal("sec4Start", 0.35, ".about-section-four .reveal-text .gs-line-inner, .about-section-four .reveal-text > *");

          // ── SECTION 4 TO 5 TRANSITION ──
          tl.addLabel("sec5Start")
            .set(".about-section-five", { visibility: "visible" })
            .to(".about-section-four .s4-img-bg", { scale: 1.03, yPercent: -10, duration: 1.0 })
            .fromTo(".about-section-five", { yPercent: 100 }, { yPercent: 0, duration: 1.0 }, "<")
            .fromTo(".s5-bg", { yPercent: 0, scale: 1.2 }, { yPercent: 0, scale: 1.15, duration: 1.0 }, "<");
          
          tl.call(() => triggerCardFade(0), [], "sec5Start+=1.0");

          // ── SECTION 5 INTERNAL SLIDE CARDS ──
          tl.addLabel("sec5_card2", "sec5Start+=1.0")
            .to(".s5-bg", { yPercent: -10, duration: 1.0 })
            .call(() => triggerCardFade(1), [], "sec5_card2+=1.0");

          tl.addLabel("sec5_card3", "sec5_card2+=1.0")
            .to(".s5-bg", { yPercent: -20, duration: 1.0 })
            .call(() => triggerCardFade(2), [], "sec5_card3+=1.0");

          // ── CTA REVEAL TRACK ──
          tl.addLabel("ctaStart", "sec5_card3+=1.0")
            .set(".about-section-cta", { visibility: "visible" })
            .to(".about-section-cta", { yPercent: 0, duration: 1.0 })
            .to(".about-section-five", { scale: 1.0, duration: 1.0 }, "<");

          // ── FOOTER REVEAL TRACK ──
          tl.addLabel("footerStart")
            .set(".about-footer-wrap", { visibility: "visible" })
            .to(".about-footer-wrap", { yPercent: 0, duration: 1.0 })
            .to(".about-section-five", { scale: 1.05, duration: 1.0 }, "<")
            .to(".about-section-cta .cta-inner-desktop", { opacity: 0, duration: 0.7, ease: "power1.out" }, "<");
          
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
          <Hero/>
        </div>
        <div className="about-hero-panel-right absolute inset-0 h-full w-full structural-layer" style={{ zIndex: 20, overflow: "hidden" }}>
          <Hero />
        </div>
        
        <div className="about-section-two absolute inset-0 h-full w-full structural-layer" style={{ zIndex: 30 }}>
          <SectionTwo />
        </div>
        
        <div className="about-section-three absolute inset-0 w-full h-full structural-layer" style={{ zIndex: 40, clipPath: "inset(100% 0% 0% 0%)" }}>
          <SectionThree />
        </div>
        <div className="about-section-four absolute inset-0 h-full w-full structural-layer" style={{ zIndex: 50, clipPath: "inset(100% 0% 0% 0%)" }}>
          <SectionFour />
        </div>
        
        <div className="about-section-five absolute inset-0 h-full w-full structural-layer" style={{ zIndex: 60 }}>
          <SectionFive />
        </div>
        
        <div className="about-section-cta absolute bottom-0 left-0 w-full structural-layer" style={{ zIndex: 70 }}>
          <SectionCTA />
        </div>
        <div className="about-footer-wrap absolute left-0 bottom-0 w-full structural-layer" style={{ zIndex: 80 }}>
          <Footer />
        </div>
      </div>
    </div>
  );
}