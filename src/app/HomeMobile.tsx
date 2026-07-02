"use client";

import { useRef, useEffect, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSite } from "./context/SiteContext";
import dynamic from "next/dynamic";

import Hero         from "../components/Home/Hero";
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

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(".hero", { yPercent: 0, zIndex: 90 });
      gsap.set(".section-2", { clipPath: "none", zIndex: 25 });
    }, scopeRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!preloaderDone) return;

    let vvCleanup: (() => void) | null = null;
    let fallbackTimeout: NodeJS.Timeout | null = null;
    let timelineInitialized = false;

    const ctx = gsap.context(() => {
      gsap.ticker.lagSmoothing(0);

      ScrollTrigger.config({
        autoRefreshEvents: "visibilitychange,DOMContentLoaded,load", 
      });

      const TRANSITION = 2.0;
      const EASE       = "power2.inOut";
      const PAUSE      = 0.5; 

      // Initial Setup States
      gsap.set(".hero",    { yPercent: 0, zIndex: 90 });
      gsap.set(".hero-bg-wrapper", { clipPath: "inset(0% 0% 0% 0%)" });
      gsap.set(".hero-bg", { yPercent: 0 });
      gsap.set(".hero h1, .hero-right-text", { opacity: 1, y: 0 });
      
      gsap.set(".hero-secondary-text-wrap", { height: "auto" });
      gsap.set(".hero-secondary-para", { visibility: "hidden" });

      gsap.set(".s2-mob-row5", { clipPath: "inset(0% 0% 0% 0%)" });
      gsap.set(".s2-mob-row5-under", { opacity: 1 });

      gsap.set(".section-3", {
        visibility: "hidden",
        yPercent:   100,
        zIndex:     100,
      });

      // Section 10 Initial Reset States
      gsap.set(".section-10", { visibility: "hidden", yPercent: 100, zIndex: 112 });
      gsap.set(".s10-img-right-wrap", { clipPath: "inset(0% 0% 0% 0%)" });
      gsap.set(".s10-scrollable-container", { y: "0vh" });

      // Reviews Section Initial Position
      gsap.set(".section-reviews", { visibility: "hidden", yPercent: 100, zIndex: 115 });

      // Section 7 Setup
      gsap.set(".section-7", { visibility: "visible", yPercent: 100, zIndex: 130, clipPath: "inset(0% 0% 0% 0%)" });
      gsap.set(".s7-bg-img", { yPercent: 20 });

      // Section 8 Setup
      gsap.set(".section-8", {
        visibility: "hidden",
        yPercent:   100,
        zIndex:     128,
        clipPath:   "none"
      });
      gsap.set(".s8-bg-img", { yPercent: 20 });

      // Section 9 Setup (Higher z-index than Section 8 for overlapping slide up)
      gsap.set(".section-9", { visibility: "hidden", yPercent: 100, zIndex: 135 });
      gsap.set(".s9-bg-img", { yPercent: 20 });
      gsap.set(".s9-title",  { opacity: 0 });
      gsap.set(".s9-para",   { opacity: 0 });

      gsap.set(".s8-panel-left",  { clipPath: "inset(0% 50% 0% 0%)", zIndex: 145 });
      gsap.set(".s8-panel-right", { clipPath: "inset(0% 0% 0% 50%)", zIndex: 145 });

      // Layer setups
      gsap.set(".section-cta", { yPercent: 100, zIndex: 150, visibility: "hidden" });
      gsap.set([".section-cta .cta-inner-mobile", ".section-cta .cta-inner-desktop"], { opacity: 1, y: 0 });
      gsap.set(".footer",      { yPercent: 100, zIndex: 151, visibility: "hidden" });

      // Force heavy layout sections to GPU hardware layers natively
      gsap.set([
        ".hero-bg-wrapper", ".hero-bg", ".s2-mob-row5", ".s2-mob-scroll-wrapper", ".section-3", ".section-10", 
        ".s10-img-right-wrap", ".s10-scrollable-container", ".section-reviews", 
        ".section-7", ".s7-bg-img", ".s7-mob-bg", ".section-8", ".s8-bg-img", 
        ".s8-mob-bg", ".section-9", ".s9-bg-img", ".section-cta", ".footer"
      ], { force3D: true, willChange: "transform" });

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

            gsap.set(".s7-mob-bg", { scale: 1.15, transformOrigin: "center center" });
            gsap.set(".s8-mob-bg", { scale: 1.15, transformOrigin: "center center" });

            const tl = gsap.timeline({
              defaults: { 
                ease: "none",
                lazy: true 
              },
              scrollTrigger: {
                trigger:              ".pin-all",
                start:                "top top",
                end:                  "+=14000",
                scrub:                true,  
                pin:                  true,
                anticipatePin:        1,
                preventOverlaps:      true,
                fastScrollEnd:        true,
                invalidateOnRefresh:  true,
                onRefresh: () => {
                  if (pinEl) pinEl.style.removeProperty("max-height");
                }
              },
            });

            let calculatedFlightY = 0;

            tl
              .to(".hero h1, .hero-right-text", { 
                opacity: 0, 
                y: -40, 
                duration: TRANSITION * 0.4, 
                ease: "power2.in" 
              })
              .addLabel("heroSecondaryReveal")
              .set(".hero-secondary-para", { visibility: "visible" }, "heroSecondaryReveal")
              
              .to(".hero-bg-wrapper", { 
                clipPath: "inset(0% 0% 40% 0%)", 
                duration: TRANSITION, 
                ease: "power1.inOut" 
              }, 0)
              .to(".hero-bg", { 
                yPercent: -25, 
                duration: TRANSITION, 
                ease: "power1.inOut" 
              }, 0)
              .to({}, { duration: PAUSE })

              .addLabel("textFlightStart")
              .set([".s2-title-main", ".s2-title-sub"], { opacity: 0 }, "textFlightStart")
              
              .to(".hero-bg-wrapper", {
                clipPath: "inset(0% 0% 100% 0%)", 
                duration: TRANSITION * 0.8,
                ease: "power2.inOut"
              }, "textFlightStart")
              
              .to(".hero-gradient-bg", {
                opacity: 0, 
                duration: TRANSITION * 0.6,
                ease: "power2.out"
              }, "textFlightStart")
              
              .to([".s2-title-main", ".s2-title-sub"], { opacity: 1, duration: TRANSITION * 0.8 }, "textFlightStart+=0.3")

              .to(".hero-secondary-para", {
                y: () => {
                  const startEl = document.querySelector(".hero-secondary-text-wrap") as HTMLElement;
                  const targetEl = document.querySelector(".s2-body") as HTMLElement;
                  if (!startEl || !targetEl) return 0;
                  calculatedFlightY = targetEl.getBoundingClientRect().top - startEl.getBoundingClientRect().top;
                  return calculatedFlightY;
                },
                x: () => {
                  const startEl = document.querySelector(".hero-secondary-text-wrap") as HTMLElement;
                  const targetEl = document.querySelector(".s2-body") as HTMLElement;
                  if (!startEl || !targetEl) return 0;
                  return targetEl.getBoundingClientRect().left - startEl.getBoundingClientRect().left;
                },
                duration: TRANSITION,
                ease: "power1.inOut"
              }, "textFlightStart")
              .to({}, { duration: PAUSE })

              .addLabel("s2TextDismissal")
              .to(".hero-secondary-para", {
                opacity: 0,
                y: () => calculatedFlightY - 60, 
                duration: TRANSITION * 0.8,
                ease: "power2.in"
              }, "s2TextDismissal")
              .to([".s2-title-main", ".s2-title-sub"], {
                opacity: 0,
                y: -60, 
                duration: TRANSITION * 0.8,
                ease: "power2.in"
              }, "s2TextDismissal")
              
              // Optimized Section 2 scroll mapping to fix performance lag
              .addLabel("s2MobileScrollStart", ">")
              .set(".s2-mob-scroll-wrapper", { visibility: "visible" }, "s2MobileScrollStart")
              .fromTo(".s2-mob-scroll-wrapper", 
                { yPercent: 100, y: 0 }, 
                { 
                  yPercent: () => (window.innerWidth >= 768 ? -60 : -70),
                  y: 0,
                  duration: TRANSITION * 3.5, 
                  ease: "power1.out" 
                }, 
                "s2MobileScrollStart"
              )
              
              .to(".s2-mob-row5", {
                clipPath: "inset(0% 100% 0% 0%)", 
                duration: TRANSITION * 1.2,
                ease: "power2.inOut"
              }, "s2MobileScrollStart+=2.8")

              // Section 3
              .addLabel("sec3Start", ">")
              .set(".section-3", { visibility: "visible" }, "sec3Start")
              .to(".section-3", { yPercent: 0, duration: TRANSITION, ease: EASE })
              .to({}, { duration: PAUSE })

              // Section 10 Animation Adjustments
              .set(".section-10", { visibility: "visible" })
              .to(".section-10", { yPercent: 0, duration: TRANSITION * 1.5, ease: "power1.inOut" })
              
              .to(".s10-title, .s10-title-sub, .s10-para-top", {
                y: "-100vh",
                duration: TRANSITION * 2.2,
                ease: "none"
              }, ">-=0.5")

              .fromTo(".s10-scrollable-container", 
                { y: "0vh" },
                {
                  y: "-100vh", 
                  duration: TRANSITION * 2.5,
                  ease: "none"
                },
                "<"
              )

              .to(".s10-img-right-wrap", {
                clipPath: "inset(0% 0% 100% 0%)",
                duration: TRANSITION * 1.0,
                ease: "power2.inOut"
              }, "<+2.0")

              // Reviews Section
              .set(".section-reviews", { visibility: "visible", pointerEvents: "auto" })
              .to(".section-reviews", { yPercent: 0, duration: TRANSITION, ease: EASE })
              .to({}, { duration: PAUSE })
              .to({}, { duration: PAUSE * 0.4 })

              // Section 7 & 8 Arrival
              .set(".section-8", { visibility: "visible" })
              .to(".section-7",    { yPercent: 0, duration: TRANSITION, ease: "power3.out" })
              .to(".section-8",    { yPercent: 0, duration: TRANSITION, ease: "power3.out" }, "<")
              .to(".s7-bg-img",    { yPercent: 0, duration: TRANSITION, ease: "power2.out" }, "<")
              .to(".s8-bg-img",    { yPercent: 0, duration: TRANSITION, ease: "power2.out" }, "<")
              .to(".s7-mob-bg",    { scale: 1,    duration: TRANSITION, ease: "power2.out" }, "<")
              .to({}, { duration: PAUSE })

              // Bottom-to-Top Clip Reveal
              .to(".section-reviews", { yPercent: -100, duration: TRANSITION, ease: EASE })
              .to(".section-7", { clipPath: "inset(0% 0% 100% 0%)", duration: TRANSITION, ease: EASE }, "<")
              .to(".s8-mob-bg", { scale: 1,        duration: TRANSITION, ease: "power2.out" }, "<")
              .to({}, { duration: PAUSE })

              .set([".section-7", ".section-reviews"], { visibility: "hidden" })

              // Section 8 to 9 Slide Up Transition Overlap
              .set(".section-9", { visibility: "visible" })
              .to(".section-9", { yPercent: 0, duration: TRANSITION, ease: EASE })
              .to(".s9-bg-img", { yPercent: 0, duration: TRANSITION, ease: "power2.out" }, "<")
              .to(".s9-title",  { opacity: 1,  duration: 1.2, ease: "power2.out" }, "<+1.0")
              .to(".s9-para",   { opacity: 1,  duration: 1.2, ease: "power3.out" }, "<")
              .to({}, { duration: PAUSE })

              // ── CTA ARRIVAL ──
              .addLabel("ctaStart")
              .set(".section-cta", { visibility: "visible" }, "ctaStart")
              .to(".section-cta", { yPercent: 0,   duration: TRANSITION, ease: "power3.out" }, "ctaStart") 
              .to(".s9-bg-img",   { yPercent: -10, duration: TRANSITION, ease: "none" }, "ctaStart")
              .to({}, { duration: PAUSE }) 

              // ── FOOTER SLIDE UP + CTA INNER CONTENT FADEOUT ──
              .addLabel("footerStart")
              
              .to([".section-cta .cta-inner-mobile", ".section-cta .cta-inner-desktop"], { 
                opacity: 0, 
                duration: 0.3, 
                ease: "power2.out" 
              }, "footerStart")
              
              .set(".footer", { visibility: "visible" }, "footerStart+=0.1")
              .to(".footer",    { yPercent: 0,          duration: TRANSITION, ease: "power2.out" }, "footerStart+=0.1") 
              .to(".s9-bg-img", { yPercent: -20, duration: TRANSITION, ease: "none" }, "footerStart+=0.1")
              .to({}, { duration: 0.4 }); 

            useTextReveal(scopeRef, ".hero-secondary-para", {
              tl,
              position: "heroSecondaryReveal",
              duration: TRANSITION * 0.8,
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
      <div className="pin-all relative overflow-hidden bg-black">
        <div className="section-2 absolute inset-0 z-[25]">
          <SectionTwo />
        </div>
        
        <div 
          className="section-3 absolute inset-0 z-[100]" 
          style={{ pointerEvents: "auto", visibility: "hidden", transform: "translateY(100%)" }}
        >
          <SectionThree />
        </div>

        <div className="section-10 absolute inset-0 z-[112]" style={{ pointerEvents: "auto", visibility: "hidden" }}>
          <SectionTen />
        </div>
        
        <div className="section-reviews absolute inset-0 z-[115]" style={{ pointerEvents: "auto", visibility: "hidden" }}>
          <SectionReviews />
        </div>

        <div 
          className="section-9 absolute inset-0 z-[135]" 
          style={{ pointerEvents: "auto", visibility: "hidden", transform: "translateY(100%)" }}
        >
          <SectionNine />
        </div>
        <div className="section-8 absolute inset-0 z-[128]" style={{ pointerEvents: "auto", visibility: "hidden" }}>
          <SectionEight />
        </div>
        <div className="section-7 absolute inset-0 z-[130]" style={{ pointerEvents: "auto", visibility: "hidden" }}>
          <SectionSeven />
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