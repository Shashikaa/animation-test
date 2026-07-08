"use client";

import { useRef, useEffect, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSite } from "./context/SiteContext";
import dynamic from "next/dynamic";

import Hero           from "../components/Home/Hero";
import SectionTwo    from "../components/Home/SectionTwo";
import SectionThree  from "../components/Home/SectionThree";
import SectionCTA    from "../components/SectionCTA";
import Footer        from "../components/Footer";
import SectionReviews from "../components/SectionReviews"; 

const SectionSeven = dynamic(() => import("../components/Home/Sectionseven"), { ssr: false });
const SectionEight = dynamic(() => import("../components/Home/Sectioneight"), { ssr: false });
const SectionNine  = dynamic(() => import("../components/Home/SectionNine"),   { ssr: false });
const SectionTen   = dynamic(() => import("../components/Home/SectionTen"),    { ssr: false });

gsap.registerPlugin(ScrollTrigger);

// Helper function implemented directly inside the file context to handle immediate raw text segmentation
function executeInlineSplitting(selector: string) {
  const element = document.querySelector(selector) as HTMLElement;
  if (!element || element.dataset.splitComplete === "true") return;

  const rawText = element.textContent || "";
  const linesArray = rawText.split("\n").map(line => line.trim()).filter(line => line.length > 0);
  
  element.innerHTML = "";
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
    element.appendChild(wrapper);
  });

  element.dataset.splitComplete = "true";
}

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

      gsap.set(".hero", { yPercent: 0, zIndex: 90, display: "block", opacity: 1 });
      gsap.set(".hero-bg-wrapper", { opacity: 1, visibility: "visible", clipPath: "none" });
      gsap.set(".hero-gradient-bg", { opacity: 1, visibility: "visible" });
      
      // Load settings matching updated sequence
      gsap.set([".hero-title", ".hero-contact-btn", ".hero-scroll-indicator"], { opacity: 1, y: 0 });
      gsap.set([".hero-right-text", ".hero-secondary-para"], { opacity: 1, visibility: "hidden" });
      gsap.set(".hero-secondary-text-wrap", { height: "auto" });

      // Configured Section 2 z-index to stay above the Hero layer so it can slide on top natively
      gsap.set(".section-2", { display: "block", clipPath: "none", zIndex: 95, yPercent: 100, opacity: 1 });
      gsap.set(".s2-mob-scroll-wrapper", { opacity: 0, y: "100vh" });
      
      gsap.set(".s2-mob-row5", { opacity: 0, clipPath: "none" });
      gsap.set(".s2-mob-row5-under", { opacity: 1 });

      gsap.set(".section-3", { visibility: "hidden", yPercent: 100, zIndex: 100 });
      gsap.set(".section-10", { visibility: "hidden", yPercent: 0, zIndex: 112 });
      gsap.set(".s10-img-right-wrap", { clipPath: "inset(0% 0% 0% 0%)" });
      gsap.set(".s10-scrollable-container", { y: "0vh" });

      gsap.set(".section-reviews", { visibility: "hidden", yPercent: 100, zIndex: 115 });
      gsap.set(".reviews-bg-img", { scale: 1.35, transformOrigin: "center center" });

      gsap.set(".section-7", { visibility: "hidden", yPercent: 100, zIndex: 135, clipPath: "inset(0% 0% 0% 0%)" });
      gsap.set(".s7-bg-img", { yPercent: 20 });
      gsap.set(".s7-mob-bg", { scale: 1.35, transformOrigin: "center center" });

      gsap.set(".section-8", { visibility: "hidden", yPercent: 100, zIndex: 128 });
      gsap.set(".s8-bg-img", { yPercent: 20 });
      gsap.set(".s8-mob-bg", { scale: 1.35, transformOrigin: "center center" });

      gsap.set(".section-9", { visibility: "hidden", yPercent: 100, zIndex: 140 });
      gsap.set(".s9-bg-img", { yPercent: 20, scale: 1.35, transformOrigin: "center center" });
      gsap.set(".s9-title", { opacity: 0 });
      gsap.set(".s9-para", { opacity: 0 });

      gsap.set(".section-cta", { yPercent: 100, zIndex: 150, visibility: "hidden" });
      gsap.set([".section-cta .cta-inner-mobile", ".section-cta .cta-inner-desktop"], { opacity: 1, y: 0 });
      gsap.set(".footer", { yPercent: 100, zIndex: 151, visibility: "hidden" });

      gsap.set(".hero-bg", { scale: 1.0, transformOrigin: "center center" });
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
      gsap.ticker.lagSmoothing(0);

      ScrollTrigger.config({
        ignoreMobileResize: true,
        autoRefreshEvents: "visibilitychange,DOMContentLoaded,load,resize", 
      });

      ScrollTrigger.normalizeScroll({
        allowNestedScroll: true,
        debounce: false
      });

      const ACTION      = 2.0; 
      const DEAD_SCROLL = 0.4; 

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
            let cachedScrollWrapperY = 0;

            executeInlineSplitting(".hero-right-text");
            executeInlineSplitting(".hero-secondary-para");

            const tl = gsap.timeline({
              defaults: { 
                ease: "none",
                lazy: true 
              },
              scrollTrigger: {
                trigger:               ".pin-all",
                start:                 "top top",
                end:                   "+=14500", 
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

                  const scrollWrapper = document.querySelector(".s2-mob-scroll-wrapper") as HTMLElement;
                  if (scrollWrapper) {
                    cachedScrollWrapperY = -(scrollWrapper.offsetHeight - window.innerHeight * 0.85);
                  } else {
                    cachedScrollWrapperY = window.innerWidth >= 768 ? -window.innerHeight * 0.55 : -window.innerHeight * 0.65;
                  }
                }
              },
            });

            // ── HERO ENGINE SEQUENCE ──
            tl.addLabel("heroStart", 0)
              
              // Uninterrupted continuous image zoom mapping smoothly across the entire lifecycle of the hero
              .fromTo(".hero-bg", 
                { scale: 1.0 },
                { scale: 1.45, duration: ACTION * 5.0, ease: "none" }, 
                "heroStart"
              )

              // Setup text split layout line inner values
              .set([".hero-right-text .custom-line-inner", ".hero-secondary-para .custom-line-inner"], {
                opacity: 0,
                yPercent: 100
              }, "heroStart")

              // 1. Smoothly fade out initial landing titles
              .to([".hero-title", ".hero-contact-btn", ".hero-scroll-indicator"], {
                opacity: 0,
                y: -40,
                duration: ACTION * 0.6,
                ease: "power1.inOut"
              }, "heroStart")

              // 2. Line-by-Line Reveal of Right text block
              .set(".hero-right-text", { visibility: "visible" }, `heroStart+=${ACTION * 0.5}`)
              .addLabel("heroRightReveal", `heroStart+=${ACTION * 0.5}`)
              .to(".hero-right-text .custom-line-inner", {
                opacity: 1,
                yPercent: 0,
                stagger: 0.12,
                duration: ACTION * 0.7,
                ease: "power3.out"
              }, "heroRightReveal")

              // 3. Smooth Fade Out of Right Text block
              .addLabel("heroRightHide", "heroRightReveal+=1.6")
              .to(".hero-right-text .custom-line-inner", {
                opacity: 0,
                y: -30,
                duration: ACTION * 0.5,
                ease: "power1.in"
              }, "heroRightHide")

              // 4. Line-by-Line Reveal of Left text block 
              .set(".hero-secondary-para", { visibility: "visible" }, `heroRightHide+=${ACTION * 0.5}`)
              .addLabel("heroLeftReveal", `heroRightHide+=${ACTION * 0.5}`)
              .to(".hero-secondary-para .custom-line-inner", {
                opacity: 1,
                yPercent: 0,
                stagger: 0.12,
                duration: ACTION * 0.7,
                ease: "power3.out"
              }, "heroLeftReveal")

              // ── HERO EXIT TRACK: SECTION 2 SLIDES OVER TOP ──
              .addLabel("heroExit", "heroLeftReveal+=1.6")
              
              // Move left secondary paragraph upward synchronously during exit and reverse playbacks
              .to(".hero-secondary-para .custom-line-inner", {
                opacity: 0,
                y: -60,
                duration: ACTION * 0.6,
                ease: "power1.in"
              }, "heroExit")
              
              // Target spatial position coordinates flight paths safely on backwards/forwards scrolls
              .to(".hero-secondary-para", { y: () => cachedFlightY, x: () => cachedFlightX, duration: ACTION * 0.8 }, "heroExit")

              // Section 2 overlays seamlessly on top by sliding up instead of clean visibility cuts
              .fromTo(".section-2", 
                { yPercent: 100 }, 
                { yPercent: 0, duration: ACTION * 0.8, ease: "power1.inOut" }, 
                "heroExit"
              )
              .addLabel("textLanding", `heroExit+=${ACTION * 0.8}`);

            // ── CONTINUOUS SEQUENTIAL MOBILE FLOWS UNTOUCHED ──
            tl.to({}, { duration: DEAD_SCROLL })

              .addLabel("s2TextDismissal", ">")
              .to([".s2-title-main", ".s2-title-sub"], { opacity: 0, y: -60, duration: ACTION }, "s2TextDismissal")
              
              .addLabel("s2MobileScrollStart", ">")
              .to(".s2-mob-scroll-wrapper", { opacity: 1, duration: ACTION * 0.1 }, "s2MobileScrollStart")
              .fromTo(".s2-mob-scroll-wrapper", 
                { y: () => window.innerHeight }, 
                { 
                  y: () => cachedScrollWrapperY, 
                  duration: ACTION 
                }, 
                "s2MobileScrollStart"
              )
              
              .to(".s2-mob-row5", { opacity: 1, duration: ACTION }, ">")

              .addLabel("sec3Start", ">")
              .set(".section-3", { visibility: "visible" }, "sec3Start")
              .to(".section-3", { yPercent: 0, duration: ACTION }, "sec3Start")

              .to({}, { duration: DEAD_SCROLL })

              .addLabel("sec10Start", ">")
              .set(".section-10", { visibility: "visible" }, "sec10Start")
              .fromTo(".section-10", { yPercent: 100 }, { yPercent: 0, duration: ACTION }, "sec10Start")
              
              .to(".s10-title, .s10-title-sub, .s10-para-top", { y: "-100vh", duration: ACTION }, ">")
              .fromTo(".s10-scrollable-container", { y: "0vh" }, { y: "-84vh", duration: ACTION }, "<")

              .to({}, { duration: DEAD_SCROLL })

              .addLabel("reviewsStart", ">")
              .set(".section-reviews", { visibility: "visible", pointerEvents: "auto" }, "reviewsStart")
              .to(".section-reviews", { yPercent: 0, duration: ACTION }, "reviewsStart")
              .to(".section-10", { yPercent: -10, duration: ACTION }, "reviewsStart")
              .to(".reviews-bg-img", { scale: 1, duration: ACTION }, "reviewsStart")

              .to({}, { duration: DEAD_SCROLL })

              .addLabel("sec78Start", ">")
              .set(".section-7",    { visibility: "visible" }, "sec78Start") 
              .to(".section-7",     { yPercent: 0, duration: ACTION }, "sec78Start")
              .to(".section-reviews", { yPercent: -10, duration: ACTION }, "sec78Start")
              .to(".s7-bg-img",     { yPercent: 0, duration: ACTION }, "sec78Start")
              .to(".s7-mob-bg",     { scale: 1,    duration: ACTION }, "sec78Start") 
              
              .set(".section-8",    { visibility: "visible" }, "sec78Start")
              .to(".section-8",     { yPercent: 0, duration: ACTION }, "sec78Start")
              .to(".s8-bg-img",     { yPercent: 0, duration: ACTION }, "sec78Start")

              .to({}, { duration: DEAD_SCROLL })

              .addLabel("clipRevealStart", ">")
              .to(".section-reviews", { yPercent: -100, duration: ACTION }, "clipRevealStart")
              .to(".s8-mob-bg",       { scale: 1,       duration: ACTION }, "clipRevealStart")
              .to(".section-7", { clipPath: "inset(0% 0% 100% 0%)", duration: ACTION }, "clipRevealStart")
              
              .set([".section-7", ".section-reviews"], { visibility: "hidden" }, ">")

              .to({}, { duration: DEAD_SCROLL })

              .addLabel("sec9Start", ">")
              .set(".section-9", { visibility: "visible" }, "sec9Start")
              .set(".section-8", { visibility: "visible", yPercent: 0 }, "sec9Start")
              
              .fromTo(".section-9", { yPercent: 100 }, { yPercent: 0, duration: ACTION }, "sec9Start")
              .to(".section-8", { yPercent: -10, duration: ACTION }, "sec9Start")
              .to(".s9-bg-img", { scale: 1, yPercent: 0, duration: ACTION }, "sec9Start")
              
              .to(".s9-title",  { opacity: 1,  duration: ACTION * 0.5 }, "sec9Start+=0.3")
              .to(".s9-para",   { opacity: 1,  duration: ACTION * 0.5 }, "sec9Start+=0.3")

              .to({}, { duration: DEAD_SCROLL })

              .addLabel("ctaStart", ">")
              .set(".section-cta", { visibility: "visible" }, "ctaStart")
              .to(".section-cta", { yPercent: 0,    duration: ACTION }, "ctaStart") 
              .to(".s9-bg-img",   { yPercent: -10, duration: ACTION }, "ctaStart")

              .to({}, { duration: DEAD_SCROLL })

              .addLabel("footerStart", ">")
              .to([".section-cta .cta-inner-mobile", ".section-cta .cta-inner-desktop"], { opacity: 0, duration: ACTION * 0.3 }, "footerStart")
              
              .set(".footer", { visibility: "visible" }, "footerStart+=0.1")
              .to(".footer",    { yPercent: 0,          duration: ACTION }, "footerStart+=0.1") 
              .to(".s9-bg-img", { yPercent: -20, duration: ACTION }, "footerStart+=0.1");

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
      ctx.revert();
    };
  }, [preloaderDone]);

  return (
    <div ref={scopeRef}>
      <style jsx global>{`
        .pin-all {
          height: 100lvh; 
        }
      `}</style>

      <div className="pin-all relative overflow-hidden">
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

        <div className="section-7 absolute inset-0 z-[135]" style={{ pointerEvents: "auto", visibility: "hidden" }}>
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