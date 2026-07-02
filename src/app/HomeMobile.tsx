"use client";

import { useRef, useEffect, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSite } from "./context/SiteContext";
import dynamic from "next/dynamic";

import Hero          from "../components/Home/Hero";
import SectionTwo   from "../components/Home/SectionTwo";
import SectionThree from "../components/Home/SectionThree";
import SectionCTA   from "../components/SectionCTA";
import Footer       from "../components/Footer";
import SectionReviews from "../components/Home/SectionReviews"; 

const SectionSeven = dynamic(() => import("../components/Home/Sectionseven"), { ssr: false });
const SectionEight = dynamic(() => import("../components/Home/Sectioneight"), { ssr: false });
const SectionNine  = dynamic(() => import("../components/Home/SectionNine"),   { ssr: false });
const SectionTen   = dynamic(() => import("../components/Home/SectionTen"),    { ssr: false });

import { useTextReveal, restoreTextReveal } from "./utils/useTextReveal";

gsap.registerPlugin(ScrollTrigger);

export default function HomeMobile() {
  const contextValues = useSite() as any;
  const preloaderDone = contextValues.preloaderDone;
  const onScrollReady = contextValues.onScrollReady ?? (() => {});
  const scopeRef = useRef<HTMLDivElement>(null);

  // 1. INITIAL STATES RESET
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set([
        ".hero-bg-wrapper", ".hero-bg", ".s2-mob-row5", ".section-3", ".section-10", 
        ".s10-img-right-wrap", ".s10-scrollable-container", ".section-reviews", ".reviews-bg-img",
        ".section-7", ".s7-bg-img", ".s7-mob-bg", ".section-8", ".s8-bg-img", 
        ".s8-mob-bg", ".section-9", ".s9-bg-img", ".section-cta", ".footer"
      ], { force3D: true });

      gsap.set(".hero", { yPercent: 0, zIndex: 90 });
      gsap.set(".hero-bg-wrapper", { clipPath: "inset(0% 0% 0% 0%)" });
      gsap.set(".hero-bg", { yPercent: 0, scale: 1.3, transformOrigin: "center center" });
      
      // Explicit target paths forced visible instantly on mount lifecycle
      gsap.set([".hero-title", ".hero-right-text", ".hero-scroll-indicator"], { 
        opacity: 1, 
        y: 0, 
        visibility: "visible" 
      });
      
      gsap.set(".hero-secondary-text-wrap", { height: "auto" });
      gsap.set(".hero-secondary-para", { visibility: "hidden" });

      gsap.set(".section-2", { clipPath: "none", zIndex: 25 });
      gsap.set(".s2-mob-scroll-wrapper", { opacity: 0, y: "100vh" });
      gsap.set(".s2-mob-row5", { clipPath: "inset(0% 0% 0% 0%)" });
      gsap.set(".s2-mob-row5-under", { opacity: 1 });

      gsap.set(".section-3", { visibility: "hidden", yPercent: 100, zIndex: 100 });

      gsap.set(".section-10", { visibility: "hidden", yPercent: 0, zIndex: 112 });
      gsap.set(".s10-img-right-wrap", { clipPath: "inset(0% 0% 0% 0%)" });
      gsap.set(".s10-scrollable-container", { y: "0vh" });

      gsap.set(".section-reviews", { visibility: "hidden", yPercent: 100, zIndex: 115 });
      gsap.set(".reviews-bg-img", { scale: 1.35, transformOrigin: "center center" });

      gsap.set(".section-7", { visibility: "hidden", yPercent: 100, zIndex: 130, clipPath: "inset(0% 0% 0% 0%)" });
      gsap.set(".s7-bg-img", { yPercent: 20 });
      gsap.set(".s7-mob-bg", { scale: 1.35, transformOrigin: "center center" });

      gsap.set(".section-8", { visibility: "hidden", yPercent: 100, zIndex: 128 });
      gsap.set(".s8-bg-img", { yPercent: 20 });
      gsap.set(".s8-mob-bg", { scale: 1.35, transformOrigin: "center center" });

      gsap.set(".section-9", { visibility: "hidden", yPercent: 100, zIndex: 140 });
      gsap.set(".s9-bg-img", { yPercent: 20, scale: 1.35, transformOrigin: "center center" });
      gsap.set(".s9-title", { opacity: 0 });
      gsap.set(".s9-para", { opacity: 0 });

      gsap.set(".s8-panel-left", { clipPath: "inset(0% 50% 0% 0%)", zIndex: 145 });
      gsap.set(".s8-panel-right", { clipPath: "inset(0% 0% 0% 50%)", zIndex: 145 });

      gsap.set(".section-cta", { yPercent: 100, zIndex: 150, visibility: "hidden" });
      gsap.set([".section-cta .cta-inner-mobile", ".section-cta .cta-inner-desktop"], { opacity: 1, y: 0 });
      gsap.set(".footer", { yPercent: 100, zIndex: 151, visibility: "hidden" });
    }, scopeRef);

    return () => ctx.revert();
  }, []);

  // 2. MAIN TIMELINE DRIVER
  useEffect(() => {
    if (!preloaderDone) return;

    let vvCleanup: (() => void) | null = null;
    let fallbackTimeout: NodeJS.Timeout | null = null;
    let timelineInitialized = false;

    const ctx = gsap.context(() => {
      gsap.ticker.lagSmoothing(50, 16);

      ScrollTrigger.config({
        autoRefreshEvents: "visibilitychange,DOMContentLoaded,load", 
      });

      const ACTION = 2.0; 
      const EASE   = "none"; 

      const waitForMobBgs = (cb: () => void) => {
        let framesChecked = 0;
        const check = () => {
          framesChecked++;
          const hasS7 = document.querySelector(".s7-mob-bg");
          const hasS8 = document.querySelector(".s8-mob-bg");
          if ((hasS7 && hasS8) || framesChecked > 60) {
            cb();
          } else {
            requestAnimationFrame(check);
          }
        };
        check();
      };

      const buildTimeline = () => {
        if (timelineInitialized) return;
        timelineInitialized = true;

        waitForMobBgs(() => {
          requestAnimationFrame(() => {
            const pinEl = document.querySelector(".pin-all") as HTMLElement;

            ScrollTrigger.refresh(true);

            const onOrientationChange = () => {
              ScrollTrigger.refresh(true);
            };
            screen.orientation?.addEventListener("change", onOrientationChange);
            vvCleanup = () => screen.orientation?.removeEventListener("change", onOrientationChange);

            let cachedFlightY = 0;
            let cachedFlightX = 0;

            const tl = gsap.timeline({
              defaults: { 
                ease: EASE,
                lazy: true 
              },
              scrollTrigger: {
                trigger:               ".pin-all",
                start:                 "top top",
                end:                   "+=11000",
                scrub:                 true, 
                pin:                   true,
                anticipatePin:         1,
                preventOverlaps:       true, 
                fastScrollEnd:         true, 
                invalidateOnRefresh:   true,
                onRefresh: (self) => {
                  if (pinEl) pinEl.style.removeProperty("max-height");
                  
                  const startEl = document.querySelector(".hero-secondary-text-wrap") as HTMLElement;
                  const targetEl = document.querySelector(".s2-body") as HTMLElement;
                  if (startEl && targetEl) {
                    cachedFlightY = targetEl.getBoundingClientRect().top - startEl.getBoundingClientRect().top;
                    cachedFlightX = targetEl.getBoundingClientRect().left - startEl.getBoundingClientRect().left;
                  }
                }
              },
            });

            // Delayed offset execution window protects early viewport visibility mapping 
            tl
              .to([".hero-title", ".hero-right-text", ".hero-scroll-indicator"], { 
                opacity: 0, 
                y: -40, 
                duration: ACTION * 0.5 
              }, 0.2)
              
              // Phase 1 Clipping
              .to(".hero-bg-wrapper", { clipPath: "inset(0% 0% 40% 0%)", duration: ACTION }, 0)
              .to(".hero-bg", { yPercent: -25, scale: 1.15, duration: ACTION }, 0)

              .addLabel("heroSecondaryReveal", ACTION * 0.4)
              .set(".hero-secondary-para", { visibility: "visible" }, "heroSecondaryReveal")

              .addLabel("textFlightStart", ACTION)
              
              // Phase 2 Clipping
              .to(".hero-bg-wrapper", { clipPath: "inset(0% 0% 100% 0%)", duration: ACTION }, "textFlightStart")
              .to(".hero-bg", { scale: 1, duration: ACTION }, "textFlightStart")
              .to(".hero-gradient-bg", { opacity: 0, duration: ACTION }, "textFlightStart")
              
              .to([".s2-title-main", ".s2-title-sub"], { opacity: 1, duration: ACTION }, "textFlightStart+=0.2")
              .to(".hero-secondary-para", { y: () => cachedFlightY, x: () => cachedFlightX, duration: ACTION }, "textFlightStart")

              .addLabel("s2TextDismissal", ">")
              .to(".hero-secondary-para", { opacity: 0, y: () => cachedFlightY - 60, duration: ACTION }, "s2TextDismissal")
              .to([".s2-title-main", ".s2-title-sub"], { opacity: 0, y: -60, duration: ACTION }, "s2TextDismissal")
              
              // Section 2 Scroll Sequence
              .addLabel("s2MobileScrollStart", ">")
              .to(".s2-mob-scroll-wrapper", { opacity: 1, duration: ACTION * 0.1 }, "s2MobileScrollStart")
              .fromTo(".s2-mob-scroll-wrapper", 
                { y: () => window.innerHeight }, 
                { 
                  y: () => {
                    const scrollWrapper = document.querySelector(".s2-mob-scroll-wrapper") as HTMLElement;
                    if (scrollWrapper) {
                      // Measures total scroll track height minus viewport window buffer so layout never stops early
                      return -(scrollWrapper.offsetHeight - window.innerHeight * 0.85);
                    }
                    return window.innerWidth >= 768 ? -window.innerHeight * 0.55 : -window.innerHeight * 0.65;
                  },
                  duration: ACTION 
                }, 
                "s2MobileScrollStart"
              )
              
              .to(".s2-mob-row5", { clipPath: "inset(0% 100% 0% 0%)", duration: ACTION }, ">")

              // Section 3 Slide Up
              .addLabel("sec3Start", ">")
              .set(".section-3", { visibility: "visible" }, "sec3Start")
              .to(".section-3", { yPercent: 0, duration: ACTION }, "sec3Start")

              // Section 10 Slide Up
              .addLabel("sec10Start", ">")
              .set(".section-10", { visibility: "visible" }, "sec10Start")
              .fromTo(".section-10", { yPercent: 100 }, { yPercent: 0, duration: ACTION }, "sec10Start")
              
              .to(".s10-title, .s10-title-sub, .s10-para-top", { y: "-100vh", duration: ACTION }, ">")
              
              // Section 10 internal pan
              .fromTo(".s10-scrollable-container", { y: "0vh" }, { y: "-84vh", duration: ACTION }, "<")

              // Reviews Slide Up
              .addLabel("reviewsStart", ">")
              .set(".section-reviews", { visibility: "visible", pointerEvents: "auto" }, "reviewsStart")
              .to(".section-reviews", { yPercent: 0, duration: ACTION }, "reviewsStart")
              .to(".section-10", { yPercent: -10, duration: ACTION }, "reviewsStart")
              .to(".reviews-bg-img", { scale: 1, duration: ACTION }, "reviewsStart")

              // Section 7 & 8 Slide Up sequence adjustment
              .addLabel("sec78Start", ">")
              .set(".section-7",    { visibility: "visible" }, "sec78Start") 
              .to(".section-7",     { yPercent: 0, duration: ACTION }, "sec78Start")
              .to(".section-reviews", { yPercent: -10, duration: ACTION }, "sec78Start")
              .to(".s7-bg-img",     { yPercent: 0, duration: ACTION }, "sec78Start")
              .to(".s7-mob-bg",     { scale: 1,    duration: ACTION }, "sec78Start") 
              
              .set(".section-8",    { visibility: "visible" }, "sec78Start")
              .to(".section-8",     { yPercent: 0, duration: ACTION }, "sec78Start")
              .to(".s8-bg-img",     { yPercent: 0, duration: ACTION }, "sec78Start")

              // Clip Reveal Transition
              .addLabel("clipRevealStart", ">")
              .to(".section-reviews", { yPercent: -100, duration: ACTION }, "clipRevealStart")
              .to(".section-7", { clipPath: "inset(0% 0% 100% 0%)", duration: ACTION }, "clipRevealStart")
              .to(".s8-mob-bg", { scale: 1,        duration: ACTION }, "clipRevealStart")
              
              .to(".s8-panel-left", { clipPath: "inset(0% 100% 0% 0%)", duration: ACTION }, "clipRevealStart")
              .to(".s8-panel-right", { clipPath: "inset(0% 0% 0% 100%)", duration: ACTION }, "clipRevealStart")
              
              .set([".section-7", ".section-reviews"], { visibility: "hidden" }, ">")

              // Section 9 Slide Up
              .addLabel("sec9Start", ">")
              .set(".section-9", { visibility: "visible" }, "sec9Start")
              .set(".section-8", { visibility: "visible", yPercent: 0 }, "sec9Start")
              
              .fromTo(".section-9", { yPercent: 100 }, { yPercent: 0, duration: ACTION }, "sec9Start")
              .to(".section-8", { yPercent: -10, duration: ACTION }, "sec9Start")
              .to(".s9-bg-img", { scale: 1, yPercent: 0, duration: ACTION }, "sec9Start")
              
              .to(".s9-title",  { opacity: 1,  duration: ACTION * 0.5 }, "sec9Start+=0.3")
              .to(".s9-para",   { opacity: 1,  duration: ACTION * 0.5 }, "sec9Start+=0.3")

              // CTA Arrival
              .addLabel("ctaStart", ">")
              .set(".section-cta", { visibility: "visible" }, "ctaStart")
              .to(".section-cta", { yPercent: 0,   duration: ACTION }, "ctaStart") 
              .to(".s9-bg-img",   { yPercent: -10, duration: ACTION }, "ctaStart")

              // Footer Slide Up
              .addLabel("footerStart", ">")
              .to([".section-cta .cta-inner-mobile", ".section-cta .cta-inner-desktop"], { opacity: 0, duration: ACTION * 0.3 }, "footerStart")
              
              .set(".footer", { visibility: "visible" }, "footerStart+=0.1")
              .to(".footer",    { yPercent: 0,          duration: ACTION }, "footerStart+=0.1") 
              .to(".s9-bg-img", { yPercent: -20, duration: ACTION }, "footerStart+=0.1");

            useTextReveal(scopeRef, ".hero-secondary-para", {
              tl,
              position: "heroSecondaryReveal",
              duration: ACTION * 0.5,
              stagger: 0.06,
            });

            requestAnimationFrame(() => {
              if (pinEl) pinEl.style.removeProperty("max-height");
            });

            onScrollReady();
          });
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

      fallbackTimeout = setTimeout(() => {
        if (!timelineInitialized) {
          buildTimeline();
        }
      }, 1000);

    }, scopeRef);

    return () => {
      vvCleanup?.();
      if (fallbackTimeout) clearTimeout(fallbackTimeout);
      if (scopeRef.current) {
        restoreTextReveal(scopeRef.current, ".hero-secondary-para");
      }
      ctx.revert();
    };
  }, [preloaderDone]);

  return (
    <div ref={scopeRef}>
      <style jsx global>{`
        .pin-all > div {
          will-change: transform, clip-path;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          transform: translate3d(0,0,0);
        }
        .pin-all img, .pin-all section, .pin-all div {
          transform: translateZ(0);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
      `}</style>

      <div className="pin-all relative overflow-hidden bg-black">
        <div className="section-2 absolute inset-0 z-[25]">
          <SectionTwo />
        </div>
        
        <div 
          className="section-3 absolute inset-0 z-[100]" 
          style={{ 
            pointerEvents: "auto", 
            visibility: "hidden", 
            transform: "translateY(100%)"
          }}
        >
          <SectionThree />
        </div>

        <div className="section-10 absolute inset-0 z-[112]" style={{ pointerEvents: "auto", visibility: "hidden" }}>
          <SectionTen />
        </div>
        
        <div className="section-reviews absolute inset-0 z-[115]" style={{ pointerEvents: "auto", visibility: "hidden" }}>
          <SectionReviews />
        </div>

        <div className="section-8 absolute inset-0 z-[128]" style={{ pointerEvents: "auto", visibility: "hidden" }}>
          <SectionEight />
        </div>

        <div className="section-7 absolute inset-0 z-[130]" style={{ pointerEvents: "auto", visibility: "hidden" }}>
          <SectionSeven />
        </div>

        <div 
          className="section-9 absolute inset-0 z-[140]" 
          style={{ pointerEvents: "auto", visibility: "hidden" }}
        >
          <SectionNine />
        </div>

        <div className="hero absolute inset-0 z-[90]" style={{ pointerEvents: "auto" }}>
          <Hero />
        </div>
        
        <div
          className="section-cta absolute inset-0 z-[150]"
          style={{ pointerEvents: "auto", visibility: "hidden" }}
        >
          <SectionCTA />
        </div>
        
        <div
          className="footer absolute left-0 bottom-0 w-full z-[151]"
          style={{ pointerEvents: "auto", visibility: "hidden" }}
        >
          <Footer />
        </div>
      </div>
    </div>
  );
}