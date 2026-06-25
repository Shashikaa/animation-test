"use client";

import { useRef, useEffect, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSite } from "./context/SiteContext";
import dynamic from "next/dynamic";

import Hero from "../components/Home/Hero";
import SectionOne from "../components/Home/SectionOne";
import SectionTwo from "../components/Home/SectionTwo";
import SectionThree from "../components/Home/SectionThree";
import SectionFour from "../components/Home/SectionFour";
import SectionFive from "../components/Home/SectionFive";
import SectionSix from "../components/Home/SectionSix";
import SectionCTA from "../components/SectionCTA";
import Footer from "../components/Footer";

const SectionSeven = dynamic(() => import("../components/Home/Sectionseven"), { ssr: false });
const SectionEight = dynamic(() => import("../components/Home/Sectioneight"), { ssr: false });
const SectionNine = dynamic(() => import("../components/Home/SectionNine"), { ssr: false });
const SectionTen = dynamic(() => import("../components/Home/SectionTen"), { ssr: false });

import { useTextReveal, restoreTextReveal } from "./utils/useTextReveal";

gsap.registerPlugin(ScrollTrigger);

const isTouchOnly = () => ScrollTrigger.isTouch === 1;

const vvHeight = () =>
  (typeof visualViewport !== "undefined" && visualViewport != null
    ? visualViewport.height
    : null) ?? window.innerHeight;

export default function HomeDesktop() {
  const contextValues = useSite() as any;
  const preloaderDone = contextValues.preloaderDone;
  const onScrollReady = contextValues.onScrollReady ?? (() => {});
  const scopeRef = useRef<HTMLDivElement>(null);

  // ── INITIAL STATE SETTING (PRE-RENDER RUN) ──
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(".hero", { yPercent: 0, zIndex: 30, display: "block" });
      gsap.set(".section-1", { yPercent: 0, zIndex: 20, display: "block" });
      gsap.set(".section-2", { display: "block", clipPath: "inset(100% 0% 0% 0%)", zIndex: 25 });
      gsap.set(".section-3", { display: "none", clipPath: "inset(0% 100% 0% 0%)", zIndex: 30 });
      gsap.set(".section-4", { yPercent: 100, display: "block", zIndex: 40 });
      gsap.set(".section-5", { yPercent: 100, display: "block", zIndex: 50 });
      gsap.set(".section-6", { display: "block", clipPath: "inset(0% 0% 0% 100%)", zIndex: 55 });
      gsap.set(".section-10", { display: "none", clipPath: "inset(100% 0% 0% 0%)", zIndex: 65 });
      gsap.set(".section-7", { display: "block", yPercent: 100, zIndex: 75 });
      gsap.set(".section-8", { display: "none", clipPath: "inset(100% 0% 0% 0%)", zIndex: 80 });
      gsap.set(".section-9", { display: "none", opacity: 1, zIndex: 79 });
      gsap.set(".section-cta", { yPercent: 100, zIndex: 95, display: "none" });
      gsap.set(".footer", { yPercent: 100, zIndex: 96, display: "none" }); 
    }, scopeRef);
    return () => ctx.revert();
  }, []);

  // ── MAIN RUNTIME SCROLLTRIGGER ENGINE ──
  useEffect(() => {
    if (!preloaderDone) return;

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
        ".hero", ".section-1", ".section-2", ".section-3", ".section-4", 
        ".section-5", ".section-6", ".section-7", ".section-8", ".section-9", 
        ".section-10", ".s1-bg", ".s2-bg", ".s4-bg-img", ".s4-img", 
        ".s7-bg-img", ".s8-bg-img", ".s9-bg-img", ".s10-bg-img", ".s10-static-bg"
      ];
      
      performanceTargets.forEach(selector => {
        gsap.set(selector, { force3D: true, willChange: "transform, opacity, clip-path" });
      });

      const scrubValue = 0.8;

      gsap.set(".s1-bg", { yPercent: 10, scale: 1.0 });
      gsap.set(".s1-card", { yPercent: 80, opacity: 0 });
      gsap.set(".s2-bg", { yPercent: 0, scale: 1.0 });
      gsap.set(".s5-card", { scale: 1, transformOrigin: "center center" });
      gsap.set(".s4-scroll-body", { y: 0 });
      gsap.set(".s4-img", { yPercent: 15 });
      gsap.set(".s4-bg-img", { yPercent: 8 });
      gsap.set(".s10-card", { clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(".s10-card-body", { clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(".s10-video-wrap", { clipPath: "inset(0% 0% 100% 0%)" });
      gsap.set(".s10-bg-img", { y: "100%" });
      gsap.set(".s10-static-bg", { yPercent: 20 });
      gsap.set(".s7-bg-img", { yPercent: 20 });
      gsap.set(".s8-bg-img", { yPercent: 20 });
      gsap.set(".s9-bg-img", { yPercent: 0, scale: 1.15 });
      gsap.set(".s8-panel-left", { clipPath: "inset(0% 50% 0% 0%)", zIndex: 85 });
      gsap.set(".s8-panel-right", { clipPath: "inset(0% 0% 0% 50%)", zIndex: 85 });
      gsap.set(".s9-para", { opacity: 0, y: 5 });
      gsap.set(".footer", { yPercent: 100 }); 

      gsap.set(".s9-title", { 
        opacity: 0, 
        position: "absolute",
        left: "50%", 
        top: "50%", 
        xPercent: -50, 
        yPercent: -50,
        x: 0, 
        y: 0 
      });

      const buildTimeline = () => {
        requestAnimationFrame(() => {
          ScrollTrigger.refresh();

          const vv = typeof visualViewport !== "undefined" ? visualViewport : null;
          if (vv) {
            const onVVResize = () => ScrollTrigger.refresh(true);
            vv.addEventListener("resize", onVVResize);
            vvCleanup = () => vv.removeEventListener("resize", onVVResize);
          }

          let cachedProgressLabels: number[] = [];

          const tl = gsap.timeline({
            defaults: { ease: "none" }, 
            scrollTrigger: {
              trigger: ".pin-all",
              start: "top top",
              end: "+=26400",
              scrub: scrubValue,
              pin: true,
              anticipatePin: 1,
              preventOverlaps: true,
              fastScrollEnd: true,
              invalidateOnRefresh: true,
              snap: {
                snapTo: (progress) => {
                  if (cachedProgressLabels.length === 0) return progress;
                  if (progress <= 0) return 0;
                  if (progress >= 1) return 1;

                  for (let i = 0; i < cachedProgressLabels.length - 1; i++) {
                    const start = cachedProgressLabels[i];
                    const end = cachedProgressLabels[i + 1];

                    if (progress >= start && progress <= end) {
                      const localProgress = (progress - start) / (end - start);
                      return localProgress > 0.3 ? end : start;
                    }
                  }
                  return progress;
                },
                duration: { min: 0.7, max: 1.2 }, 
                delay: 0.1, 
                ease: "power2.inOut", 
              },
            },
          });

          // ── HERO TO SECTION 1 ──
          tl.addLabel("heroStart")
            .to(".hero", { yPercent: -100, duration: 3.8 }, "heroStart")
            .to(".s1-bg", { yPercent: 0, scale: 1, duration: 3.8 }, "heroStart")
            .to(".s1-card", { yPercent: 0, opacity: 1, duration: 2.8 }, "heroStart+=0.4")
            .set(".hero", { display: "none" });

          // ── SECTION 2 REVEAL ──
          tl.addLabel("sec2Start")
            .to(".section-2", { clipPath: "inset(0% 0% 0% 0%)", duration: 3.8 }, "sec2Start")
            .to(".section-1", { scale: 1.05, duration: 3.8 }, "sec2Start")
            .to(".s2-bg", { yPercent: 0, scale: 1, duration: 3.8 }, "sec2Start")
            .to({}, { duration: 0.2 }) 
            .set(".section-1", { display: "none" });

          // ── SECTION 3 REVEAL ──
          tl.addLabel("sec3Start")
            .set(".section-3", { display: "block" })
            .to(".section-3", { clipPath: "inset(0% 0% 0% 0%)", duration: 3.8 }, "sec3Start")
            .to(".section-2", { scale: 1.05, duration: 3.8 }, "sec3Start")
            .to({}, { duration: 0.2 }) 
            .set(".section-2", { display: "none" });

          // ── SECTION 4 REVEAL ──
          tl.addLabel("sec4Start")
            .to(".section-4", { yPercent: 0, duration: 4.5 }, "sec4Start")
            .set([".section-2", ".section-3"], { display: "none" });

          // INTERNAL SECTION 4 SCROLL 
          tl.addLabel("sec4ContentStart", "sec4Start+=4.5")
            .to(".s4-content", { y: () => vvHeight() * -0.45, duration: 4.5 }, "sec4ContentStart")
            .to(".s4-img", { yPercent: -15, duration: 4.5 }, "sec4ContentStart")
            .to(".s4-bg-img", { yPercent: 0, duration: 4.5 }, "sec4ContentStart")
            .addLabel("sec4ContentEnd");

          // ── SECTION 5 REVEAL ──
          tl.addLabel("sec5Start")
            .to(".section-5", { yPercent: 0, duration: 4.2 }, "sec5Start")
            .set(".section-4", { display: "none" });

          // ── SECTION 6 REVEAL ──
          tl.addLabel("sec6Start")
            .to(".section-6", { clipPath: "inset(0% 0% 0% 0%)", duration: 3.8 }, "sec6Start")
            .to(".section-5", { scale: 1.05, duration: 3.8 }, "sec6Start")
            .to({}, { duration: 0.2 }) 
            .set(".section-5", { display: "none" });

          // ── SECTION 10 REVEAL ──
          tl.addLabel("sec10Start")
            .set(".section-10", { display: "block" })
            .to(".section-10", { clipPath: "inset(0% 0% 0% 0%)", duration: 3.8 }, "sec10Start")
            .to(".section-6", { scale: 1.05, duration: 3.8 }, "sec10Start")
            .to(".s10-static-bg", { yPercent: 0, duration: 3.8 }, "sec10Start")
            
            .addLabel("sec10TextHide")
            .to(".s10-title", { opacity: 0, y: -50, duration: 1.0 })
            .to(".s10-title-sub", { opacity: 0, y: -40, duration: 1.0 }, "<")
            .to(".s10-para-top", { opacity: 0, y: -50, duration: 1.0 }, "<")
            
            .addLabel("sec10CardReveal")
            .to(".s10-card", { clipPath: "inset(0% 0% 0% 0%)", duration: 2.0 })
            .to(".s10-card-body", { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5 }, "<")
            
            .addLabel("sec10VideoTransition")
            .to(".s10-video-wrap", { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5 })
            .to(".s10-video-wrap", { clipPath: "inset(0% 0% 100% 0%)", duration: 1.2 })
            .set(".s10-video-wrap", { display: "none" })
            
            .addLabel("sec10FinalScroll")
            .to(".s10-card", {
              y: () => {
                const card = document.querySelector(".s10-card") as HTMLElement;
                if (!card) return -vvHeight() * 0.7;
                return -card.getBoundingClientRect().top;
              },
              duration: 2.5,
            }, "<+0.2")
            .to(".s10-card-body", { y: 50, duration: 2.5 }, "<")
            .to(".s10-bg-img", { y: "0%", duration: 2.5 }, "<")
            .to({}, { duration: 0.2 }) 
            .set(".section-6", { display: "none" });

          // ── SECTION 7 REVEAL ──
          tl.addLabel("sec7Start")
            .to(".section-7", { yPercent: 0, duration: 4.2 }, "sec7Start")
            .to(".section-10", { scale: 1.05, duration: 4.2 }, "sec7Start")
            .to(".s7-bg-img", { yPercent: 0, duration: 4.2 }, "sec7Start")
            .to({}, { duration: 0.2 }) 
            .set(".section-10", { display: "none" });

          // ── SECTION 8 REVEAL ──
          tl.addLabel("sec8Start")
            .set(".section-8", { display: "block" })
            .to(".section-8", { clipPath: "inset(0% 0% 0% 0%)", duration: 3.8 }, "sec8Start")
            .to(".section-7", { scale: 1.0, duration: 3.8 }, "sec8Start")
            .to(".s8-bg-img", { yPercent: 0, duration: 3.8 }, "sec8Start")
            .to({}, { duration: 0.2 }); 

          // ── SECTION 9 REVEAL (SPLIT PANELS) ──
          tl.addLabel("sec9Start")
            .set(".section-7", { display: "none" })
            .set(".section-9", { display: "block" })
            .to(".s8-panel-left", { clipPath: "inset(0% 50% 100% 0%)", duration: 3.8 }, "sec9Start")
            .to(".s8-panel-right", { clipPath: "inset(100% 0% 0% 50%)", duration: 3.8 }, "sec9Start")
            .to(".s9-bg-img", { yPercent: 0, scale: 1, duration: 3.8 }, "sec9Start")
            
            .addLabel("sec9TitleFade")
            .to(".s9-title", { opacity: 1, duration: 2.0 }, "sec9Start+=1.2")
            
            .addLabel("sec9TitleMove")
            .to(".s9-title", {
              x: () => {
                const el = document.querySelector(".s9-title") as HTMLElement;
                const para = document.querySelector(".s9-para") as HTMLElement;
                if (!el || !para) return 0;
                
                const targetX = para.getBoundingClientRect().right;
                const currentX = el.getBoundingClientRect().right; 
                return targetX - currentX;
              },
              y: () => {
                const el = document.querySelector(".s9-title") as HTMLElement;
                const para = document.querySelector(".s9-para") as HTMLElement;
                if (!el || !para) return 0;
                
                const targetY = para.getBoundingClientRect().top - 16;
                const currentY = el.getBoundingClientRect().bottom;
                return targetY - currentY;
              },
              duration: 3.5,
            })
            .to(".s9-para", { opacity: 1, y: 0, duration: 2.0 }, "<+1.5")
            .to({}, { duration: 0.2 }) 
            .set(".section-8", { display: "none" });

          // ── CTA REVEAL ──
          tl.addLabel("ctaStart")
            .set(".section-cta", { display: "block" })
            .to(".section-cta", { yPercent: 0, duration: 4.8 }, "ctaStart")
            .to(".section-9", { scale: 1.05, duration: 4.8 }, "ctaStart")
            .to({}, { duration: 0.2 }); 

          // ── FOOTER REVEAL ──
          tl.addLabel("footerStart")
            .set(".footer", { display: "block" })
            .to(".footer", { yPercent: 0, duration: 5.5 }, "footerStart")
            .to(".section-9", { scale: 1.05, duration: 5.5 }, "footerStart");

          // ── TEXT REVEAL TIMINGS ──
          useTextReveal(scopeRef, ".s2-title-main", { tl, position: "sec2Start+=1.9", duration: 0.4, stagger: 0.05 });
          useTextReveal(scopeRef, ".s2-title-sub", { tl, position: "sec2Start+=1.9", duration: 0.4, stagger: 0.04 });
          useTextReveal(scopeRef, ".s2-body", { tl, position: "sec2Start+=1.3", duration: 0.4, stagger: 0.05 });
          
          useTextReveal(scopeRef, ".s4-title", { tl, position: "sec4Start+=2.0", duration: 0.4, stagger: 0.05 });
          useTextReveal(scopeRef, ".s4-para", { tl, position: "sec4Start+=2.0", duration: 0.4, stagger: 0.05 });
          useTextReveal(scopeRef, ".s4-cta", { tl, position: ">+0.2", duration: 0.4, stagger: 0.04 });
          
          useTextReveal(scopeRef, ".s5-title", { tl, position: "sec5Start+=2.8", duration: 0.4, stagger: 0.05 });
          useTextReveal(scopeRef, ".s5-body", { tl, position: "sec5Start+=2.8", duration: 0.4, stagger: 0.05 });
          
          useTextReveal(scopeRef, ".s10-title", { tl, position: "sec10Start+=1.9", duration: 0.4, stagger: 0.05 });
          useTextReveal(scopeRef, ".s10-title-sub", { tl, position: "sec10Start+=1.8", duration: 0.4, stagger: 0.04 });
          useTextReveal(scopeRef, ".s10-para-top", { tl, position: "sec10Start+=1.0", duration: 0.4, stagger: 0.04 });
          
          useTextReveal(scopeRef, ".s7-title", { tl, position: "sec7Start+=1.7", duration: 0.4, stagger: 0.05, yOffset: -10 });
          useTextReveal(scopeRef, ".s7-para", { tl, position: "sec7Start+=1.7", duration: 0.4, stagger: 0.05, yOffset: -10 });
          
          useTextReveal(scopeRef, ".s8-heading", { tl, position: "sec8Start+=1.9", duration: 0.4, stagger: 0.05 });
          useTextReveal(scopeRef, ".s8-para", { tl, position: "sec8Start+=1.8", duration: 0.4, stagger: 0.05 });

          // Matrix mapping configuration including inner checkpoints
          const totalDuration = tl.totalDuration();
          const labelNames = [
            "heroStart", 
            "sec2Start", 
            "sec3Start", 
            "sec4Start", "sec4ContentStart", "sec4ContentEnd",
            "sec5Start", 
            "sec6Start", 
            "sec10Start", "sec10TextHide", "sec10CardReveal", "sec10VideoTransition", "sec10FinalScroll",
            "sec7Start", 
            "sec8Start", 
            "sec9Start", "sec9TitleFade", "sec9TitleMove",
            "ctaStart", 
            "footerStart"
          ];
          cachedProgressLabels = [0, ...labelNames.map(name => tl.labels[name] / totalDuration), 1];

          onScrollReady();
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
            ".s2-title-main", ".s2-title-sub", ".s2-body",
            ".s4-title", ".s4-para", ".s4-cta",
            ".s5-title", ".s5-body",
            ".s10-title", ".s10-title-sub", ".s10-para-top",
            ".s7-title", ".s7-para",
            ".s8-heading", ".s8-para",
          ].join(",")
        );
      }
      ctx.revert();
    };
  }, [preloaderDone]);

  return (
    <div ref={scopeRef}>
      <div className="pin-all relative h-screen w-screen overflow-hidden bg-black">
        <div className="section-1 absolute inset-0 h-full w-full structural-layer">
          <SectionOne />
        </div>
        <div className="section-2 absolute inset-0 h-full w-full structural-layer">
          <SectionTwo />
        </div>
        <div className="section-3 absolute inset-0 h-full w-full structural-layer">
          <SectionThree />
        </div>
        <div className="section-4 absolute inset-0 h-full w-full structural-layer" style={{ overflow: "visible" }}>
          <SectionFour />
        </div>
        <div className="section-5 absolute inset-0 h-full w-full structural-layer">
          <SectionFive />
        </div>
        <div className="section-6 absolute inset-0 h-full w-full structural-layer">
          <SectionSix />
        </div>
        <div className="section-10 absolute inset-0 h-full w-full structural-layer">
          <SectionTen />
        </div>
        <div className="section-7 absolute inset-0 h-full w-full structural-layer">
          <SectionSeven />
        </div>
        <div className="section-9 absolute inset-0 h-full w-full structural-layer">
          <SectionNine />
        </div>
        <div className="section-8 absolute inset-0 h-full w-full structural-layer">
          <SectionEight />
        </div>
        <div className="hero absolute inset-0 h-full w-full structural-layer">
          <Hero />
        </div>
        <div className="section-cta absolute bottom-0 left-0 w-full structural-layer">
          <SectionCTA />
        </div>
        <div className="footer absolute left-0 bottom-0 w-full structural-layer">
          <Footer />
        </div>
      </div>
    </div>
  );
}