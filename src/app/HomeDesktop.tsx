"use client";

import { useRef, useEffect, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSite } from "./context/SiteContext";
import dynamic from "next/dynamic";

import Hero from "../components/Home/Hero";
import SectionTwo from "../components/Home/SectionTwo";
import SectionCTA from "../components/SectionCTA";
import Footer from "../components/Footer";

const SectionSeven = dynamic(() => import("../components/Home/Sectionseven"), { ssr: false });
const SectionEight = dynamic(() => import("../components/Home/Sectioneight"), { ssr: false });
const SectionNine = dynamic(() => import("../components/Home/SectionNine"), { ssr: false });
const SectionTen = dynamic(() => import("../components/Home/SectionTen"), { ssr: false });
const Appsection = dynamic(() => import("../components/Appsection"), { ssr: false });

import { useTextReveal, restoreTextReveal } from "./utils/useTextReveal";

gsap.registerPlugin(ScrollTrigger);

const isTouchOnly = () => ScrollTrigger.isTouch === 1;

function executeDesktopSplitting(selector: string) {
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

export default function HomeDesktop() {
  const contextValues = useSite() as any;
  const preloaderDone = contextValues.preloaderDone;
  const onScrollReady = contextValues.onScrollReady ?? (() => {});
  const scopeRef = useRef<HTMLDivElement>(null);

  const textTriggersRef = useRef({
    hero: false,
    sec10: false,
    sec7: false,
    sec8: false,
    sec9: false,
  });

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(".hero", { yPercent: 0, zIndex: 90, display: "block", opacity: 1 });
      gsap.set(".hero-bg-wrapper", { opacity: 1, visibility: "visible" });
      gsap.set(".hero-gradient-bg", { opacity: 1, visibility: "visible" });

      gsap.set([".hero-title", ".hero-contact-btn", ".hero-scroll-indicator"], { opacity: 1, y: 0 });
      gsap.set([".hero-right-text", ".hero-secondary-para"], { opacity: 1, visibility: "hidden" });
      gsap.set(".hero-secondary-text-wrap", { height: "auto" });

      gsap.set(".section-2", { display: "block", clipPath: "none", zIndex: 95, yPercent: 100, opacity: 1 });
      gsap.set(".s2-right-img-frame", { clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(".s2-right-img-frame-under", { clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(".s2-scroll-content", { yPercent: 100, y: 0, opacity: 0 });
      gsap.set([".s2-title-main", ".s2-title-sub", ".s2-body"], { opacity: 1, y: 0, visibility: "visible" });

      gsap.set(".section-10", { display: "block", yPercent: 100, opacity: 1, zIndex: 100 });
      gsap.set([".s10-title", ".s10-title-sub", ".s10-para-top"], { opacity: 0 });
      
      gsap.set(".s10-img-right-wrap", { opacity: 1, yPercent: 0, y: "150vh", clipPath: "inset(0% 0% 0% 0%)", display: "block" });
      gsap.set(".s10-content-wrap", { opacity: 1, yPercent: 0, y: "150vh" });

      gsap.set(".section-7", { display: "block", yPercent: 100, zIndex: 70 });
      gsap.set([".s7-title", ".s7-para"], { opacity: 0, y: 0 });

      gsap.set(".section-appsec", { display: "none", yPercent: 100, zIndex: 71 });

      gsap.set(".section-8", { display: "block", clipPath: "none", yPercent: 100, zIndex: 99 });
      gsap.set([".s8-heading", ".s8-para"], { opacity: 0, y: 0 });

      gsap.set(".section-9", { visibility: "hidden", yPercent: 0, opacity: 1, zIndex: 115 });
      gsap.set(".s9-left-side", { yPercent: 100 });
      gsap.set(".s9-right-side", { xPercent: 0, yPercent: -100 });
      gsap.set(".s9-para-desktop", { opacity: 0 });

      gsap.set(".section-cta", { yPercent: 100, zIndex: 120, display: "none" });
      gsap.set(".footer", { yPercent: 100, zIndex: 125, display: "none" });

      gsap.set(".hero-bg", { scale: 1.0, transformOrigin: "center center" });
    }, scopeRef);
    return () => ctx.revert();
  }, []);

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

      // Hardware level optimization configurations
      gsap.set(".hero-bg", {
        force3D: true,
        willChange: "transform",
        transformStyle: "flat" 
      });

      const performanceTargets = [
        ".section-2", ".s2-right-img-frame", ".s2-right-img-frame-under", ".s2-scroll-content",
        ".section-7", ".section-8", ".section-9", ".section-10", ".section-appsec",
        ".s7-bg-img", ".s8-bg-img", ".s9-bg-img-left", ".s9-bg-img-right", ".s10-bg-img", ".s10-static-bg", ".s10-img-right-wrap",
        ".s9-left-side", ".s9-right-side", ".s9-flight-wrapper", ".appsec-bg", ".appsec-content", ".appsec-phone-wrapper"
      ];

      performanceTargets.forEach(selector => {
        gsap.set(selector, {
          force3D: true,
          willChange: "transform, opacity"
        });
      });

      const scrubValue = 1.2;

      gsap.set(".s10-bg-img", { yPercent: 100, scale: 1.25, transformOrigin: "center center" });
      gsap.set(".s10-static-bg", { yPercent: 12 });
      gsap.set(".s7-bg-img", { yPercent: 0 });
      gsap.set(".s8-bg-img", { yPercent: 0, scale: 1.15 });
      gsap.set(".footer", { yPercent: 100 });

      const buildTimeline = () => {
        requestAnimationFrame(() => {
          ScrollTrigger.refresh();

          const vv = typeof visualViewport !== "undefined" ? visualViewport : null;
          if (vv) {
            const onVVResize = () => ScrollTrigger.refresh(true);
            vv.addEventListener("resize", onVVResize);
            vvCleanup = () => vv.removeEventListener("resize", onVVResize);
          }

          executeDesktopSplitting(".hero-right-text");
          executeDesktopSplitting(".hero-secondary-para");

          let snapPointsArray: number[] = [0];

          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: ".pin-all",
              end: "+=24000",
              scrub: scrubValue,
              pin: true,
              anticipatePin: 1,
              preventOverlaps: true,
              fastScrollEnd: true,
              invalidateOnRefresh: true,
              snap: {
                snapTo: (val) => gsap.utils.snap(snapPointsArray, val),
                duration: { min: 0.3, max: 0.6 },
                delay: 0.01,
                ease: "power1.inOut",
              },
            },
          });

          textTriggersRef.current = { hero: false, sec10: false, sec7: false, sec8: false, sec9: false };

          // ── PHASE 1: INITIAL STATE -> SMOOTH ZOOM TO 1.18 ──
          tl.addLabel("heroPhase1")
            .set([".hero-right-text .custom-line-inner", ".hero-secondary-para .custom-line-inner"], { opacity: 0, yPercent: 100 }, "heroPhase1")
            .to(".hero-bg", { scale: 1.18, duration: 4.0, ease: "sine.inOut" }, "heroPhase1")
            .to([".hero-title", ".hero-contact-btn", ".hero-scroll-indicator"], { opacity: 0, y: -30, duration: 2.0, ease: "power1.out" }, "heroPhase1")
            .set([".hero-title", ".hero-contact-btn", ".hero-scroll-indicator"], { visibility: "hidden" }, "heroPhase1+=2.0")
            .set(".hero-right-text", { visibility: "visible" }, "heroPhase1+=2.0")
            .to(".hero-right-text .custom-line-inner", { opacity: 1, yPercent: 0, stagger: 0.1, duration: 2.0, ease: "power2.out" }, "heroPhase1+=2.0");

          // ── PHASE 2: ZOOM CLOSER TO 1.35 WITH INTEGRATED EASING ──
          tl.addLabel("heroPhase2", "heroPhase1+=4.0")
            .to(".hero-right-text .custom-line-inner", { opacity: 0, y: -30, duration: 1.5, ease: "power1.in" }, "heroPhase2")
            .set(".hero-right-text", { visibility: "hidden" }, "heroPhase2+=1.5")
            .to(".hero-bg", { scale: 1.35, duration: 4.0, ease: "sine.inOut" }, "heroPhase2")
            .set(".hero-secondary-para", { visibility: "visible" }, "heroPhase2+=1.5")
            .to(".hero-secondary-para .custom-line-inner", { opacity: 1, yPercent: 0, stagger: 0.1, duration: 2.0, ease: "power2.out" }, "heroPhase2+=1.5");

          // ── PHASE 3: REVEAL SECTION 2 -> CONTINUOUS GRADUAL ZOOM ──
          tl.addLabel("heroPhase3", "heroPhase2+=4.0")
            .to(".hero-secondary-para .custom-line-inner", { opacity: 0, y: -80, duration: 2.5, ease: "power1.in" }, "heroPhase3")
            .set(".hero-secondary-para", { visibility: "hidden" }, "heroPhase3+=2.5")
            
            .set(".hero", { display: "block", zIndex: 90, opacity: 1 }, "heroPhase3")
            .set(".hero-bg-wrapper", { visibility: "visible", opacity: 1 }, "heroPhase3")
            
            .to(".hero-bg", { 
              scale: 1.45, 
              duration: 4.0, 
              ease: "sine.out" 
            }, "heroPhase3")

            .fromTo(".section-2", 
              { yPercent: 100, zIndex: 95, display: "block" }, 
              { yPercent: 0, duration: 4.0, ease: "sine.out" }, 
              "heroPhase3"
            )
            .addLabel("textLanding", "heroPhase3+=4.0");

          // ── SECTION 2 INNER ANIMATION ──
          tl.addLabel("s2InnerAnimation", "textLanding")
            .set(".hero", { display: "none" }, "s2InnerAnimation")
            .to(".s2-right-img-frame", { clipPath: "inset(0% 0% 0% 0%)", duration: 4.0, ease: "power2.inOut" }, "s2InnerAnimation")
            .to(".hero-secondary-para", { opacity: 0, duration: 1.5, ease: "power1.out" }, "s2InnerAnimation")
            .to([".s2-title-main", ".s2-title-sub", ".s2-body"], { opacity: 0, y: -60, duration: 2.0, ease: "power2.in" }, "s2InnerAnimation")
            
            .addLabel("s2InnerMidpoint", "s2InnerAnimation+1.5")
            .to(".s2-scroll-content", { yPercent: 0, opacity: 1, duration: 5.0, ease: "power2.out" }, "s2InnerAnimation+=1.5")
            
            .addLabel("s2InnerSplitReveal", "s2InnerAnimation+=3.5")
            .to(".s2-right-img-frame", { clipPath: "inset(0% 0% 100% 0%)", duration: 4.0, ease: "power2.inOut" }, "s2InnerAnimation+=3.5")
            .to(".s2-right-img-frame-under", { clipPath: "inset(0% 0% 0% 0%)", duration: 4.0, ease: "power2.inOut" }, "s2InnerAnimation+=3.5")
            .to(".s2-scroll-content", { y: -500, duration: 6.0, ease: "none" }, "s2InnerAnimation+=5.0");

          // ── SECTION 2 TO 8 SLIDE UP REVEAL ──
          tl.addLabel("sec8Start")
            .set(".section-8", { zIndex: 99, display: "block", clipPath: "none", yPercent: 100 }, "sec8Start")
            .to(".section-8", { scale: 1, yPercent: 0, duration: 5.5, ease: "power2.inOut" }, "sec8Start")
            .to(".s8-bg-img", { yPercent: 0, duration: 5.5, ease: "none" }, "sec8Start")
            .to({}, {
              duration: 0.1,
              onStart: () => {
                if (!textTriggersRef.current.sec8 && tl.scrollTrigger && tl.scrollTrigger.direction > 0) {
                  textTriggersRef.current.sec8 = true;
                  gsap.set([".s8-heading", ".s8-para"], { opacity: 1 });
                  useTextReveal(scopeRef, ".s8-heading", { duration: 0.4, stagger: 0.05 });
                  useTextReveal(scopeRef, ".s8-para", { duration: 0.4, stagger: 0.05 });
                }
              }
            }, "sec8Start+=2.0")
            .set([".section-2"], { display: "none" }, "sec8Start+=5.5");

          // ── SECTION 10 SLIDE UP OVER SECTION 8 ──
          tl.addLabel("sec10Start", "sec8Start+=5.5")
            .set(".section-10", { zIndex: 100, display: "block" }, "sec10Start")
            .fromTo(".section-10", { yPercent: 100 }, { yPercent: 0, duration: 6.0, ease: "power2.inOut" }, "sec10Start")
            .fromTo(".s10-static-bg", { yPercent: 12 }, { yPercent: 0, duration: 6.0, ease: "power2.out" }, "sec10Start")
            .fromTo(".s10-bg-img", { yPercent: 100 }, { yPercent: -6, duration: 6.0, ease: "power2.out" }, "sec10Start")
            .set(".section-8", { display: "none" }, "sec10Start+=6.0")
            
            .set([".s10-content-wrap", ".s10-img-right-wrap"], { opacity: 1, yPercent: 0, y: "100vh" }, "sec10Start")
            
            .to({}, {
              duration: 0.1,
              onStart: () => {
                if (!textTriggersRef.current.sec10 && tl.scrollTrigger && tl.scrollTrigger.direction > 0) {
                  textTriggersRef.current.sec10 = true;
                  gsap.set([".s10-title", ".s10-title-sub", ".s10-para-top"], { opacity: 1 });
                  useTextReveal(scopeRef, ".s10-title", { duration: 0.5, stagger: 0.05 });
                  useTextReveal(scopeRef, ".s10-title-sub", { duration: 0.4, stagger: 0.04 });
                  useTextReveal(scopeRef, ".s10-para-top", { duration: 0.5, stagger: 0.03 });
                }
              }
            }, "sec10Start+=3.0")

          // ── SECTION 10 CONTENT TRANSITION & EXIT ──
          tl.addLabel("sec10TextHide", "sec10Start+=6.0")
            .to([".s10-title", ".s10-title-sub", ".s10-para-top"], { opacity: 0, y: -100, duration: 2.0, stagger: 0.03, ease: "power2.in" }, "sec10TextHide")
            
            .addLabel("sec10ContentReveal", "sec10TextHide+=0.2")
            .fromTo([".s10-content-wrap", ".s10-img-right-wrap"], { opacity: 1, y: "150vh" }, { opacity: 1, y: 0, duration: 6.5, stagger: 0.15, ease: "power2.out" }, "sec10ContentReveal")
            .fromTo(".s10-bg-img", { yPercent: -6 }, { yPercent: 6, duration: 6.5, ease: "none" }, "sec10ContentReveal")
            
            .addLabel("sec10ExitSequence", "sec10ContentReveal+=5.0")
            .to(".s10-img-right-wrap", { clipPath: "inset(0% 0% 100% 0%)", y: -60, opacity: 0, duration: 5.5, ease: "power2.inOut" }, "sec10ExitSequence")
            .to(".s10-content-wrap", { opacity: 0, y: -100, duration: 5.0, ease: "power2.inOut" }, "sec10ExitSequence");

          // ── SECTION 7 SLIDE UP ──
          tl.addLabel("sec7Start", "sec10ExitSequence+=0.5")
            .set(".section-7", { display: "block", zIndex: 105 }, "sec7Start")
            .to(".section-7", { yPercent: 0, duration: 4.5 }, "sec7Start")
            .to(".s7-bg-img", { yPercent: 0, duration: 4.5 }, "sec7Start")
            .set(".section-10", { display: "none" }, "sec7Start+=4.5")
            .to({}, {
              duration: 0.1,
              onStart: () => {
                if (!textTriggersRef.current.sec7 && tl.scrollTrigger && tl.scrollTrigger.direction > 0) {
                  textTriggersRef.current.sec7 = true;
                  gsap.set([".s7-title", ".s7-para"], { opacity: 1 });
                  useTextReveal(scopeRef, ".s7-title", { duration: 0.4, stagger: 0.05 });
                  useTextReveal(scopeRef, ".s7-para", { duration: 0.4, stagger: 0.05 });
                }
              }
            }, "sec7Start+=1.5");

          // ── APPSECTION SLIDES UP OVER SECTION 7 ──
          tl.addLabel("appSecStart", "sec7Start+=4.5")
            .set(".section-appsec", { display: "block", zIndex: 110 }, "appSecStart")
            .set(".appsec-bg", { scale: 1.25, yPercent: 0 }, "appSecStart")
            .set(".appsec-content", { opacity: 1 }, "appSecStart")
            .set(".appsec-phone-wrapper", { yPercent: 40 }, "appSecStart")
            
            .fromTo(".section-appsec", { yPercent: 100 }, { yPercent: 0, duration: 4.5 }, "appSecStart")
            .to(".appsec-phone-wrapper", { yPercent: 0, duration: 4.0, ease: "power2.out" }, "appSecStart+=0.5")
            .set(".section-7", { display: "none" }, "appSecStart+=4.5");

          // ── SECTION 9 OVERLAY ENTRY & APPSEC OUTRO ANIMATION ──
          tl.addLabel("sec9Start", "appSecStart+=4.5")
            .set(".section-9", { visibility: "visible", zIndex: 115 }, "sec9Start")
            
            .to(".appsec-content", { opacity: 0, duration: 2.5, ease: "power1.out" }, "sec9Start")
            .to(".appsec-bg", { scale: 1.0, yPercent: 12, duration: 5.0, ease: "power2.inOut" }, "sec9Start")

            .fromTo(".s9-left-side", { yPercent: 100 }, { yPercent: 0, duration: 6.0, ease: "power2.inOut" }, "sec9Start")
            .fromTo(".s9-right-side", { xPercent: 0, yPercent: -100 }, { xPercent: 0, yPercent: 0, duration: 6.0, ease: "power2.inOut" }, "sec9Start")
            .fromTo([".s9-bg-img-left", ".s9-bg-img-right"], { scale: 1.1 }, { scale: 1.0, duration: 6.0, ease: "power2.out" }, "sec9Start")
            
            .set(".section-appsec", { display: "none" }, "sec9Start+=6.0")
            
            .addLabel("sec9FlyText", "sec9Start+=6.5")
            .set([".s9-native-title-wrapper-1", ".s9-native-title-wrapper-2"], { opacity: 0, visibility: "hidden" }, "sec9FlyText")
            .set(".s9-global-flight-container", { opacity: 1, visibility: "visible" }, "sec9FlyText")
            
            .to(".s9-flight-wrapper", {
              x: () => {
                const target = document.querySelector(".s9-target-wrapper");
                const current = document.querySelector(".s9-flight-wrapper") as HTMLElement;
                if (!target || !current) return 0;
                
                const currentX = gsap.getProperty(current, "x") as number;
                gsap.set(current, { x: 0 });
                
                const targetRect = target.getBoundingClientRect();
                const currentRect = current.getBoundingClientRect();
                
                const targetCenter = targetRect.left + (targetRect.width / 2);
                const currentCenter = currentRect.left + (currentRect.width / 2);
                
                gsap.set(current, { x: currentX });
                return targetCenter - currentCenter;
              },
              y: () => {
                const target = document.querySelector(".s9-target-wrapper");
                const current = document.querySelector(".s9-flight-wrapper") as HTMLElement;
                if (!target || !current) return 0;
                
                const currentY = gsap.getProperty(current, "y") as number;
                gsap.set(current, { y: 0 });
                
                const targetRect = target.getBoundingClientRect();
                const currentRect = current.getBoundingClientRect();
                
                const targetCenter = targetRect.top + (targetRect.height / 2);
                const currentCenter = currentRect.top + (currentRect.height / 2);
                
                gsap.set(current, { y: currentY });
                return targetCenter - currentCenter;
              },
              duration: 4.5,
              ease: "power2.inOut"
            }, "sec9FlyText")

          tl.to(".s9-para-desktop", { opacity: 1, duration: 2.0, ease: "power1.out" }, "sec9FlyText+=4.0")
            .to({}, {
              duration: 0.1,
              onStart: () => {
                if (!textTriggersRef.current.sec9 && tl.scrollTrigger && tl.scrollTrigger.direction > 0) {
                  textTriggersRef.current.sec9 = true;
                  useTextReveal(scopeRef, ".s9-para-desktop", { duration: 0.5, stagger: 0.03 });
                  useTextReveal(scopeRef, ".s9-para-mobile", { duration: 0.5, stagger: 0.03 });
                }
              }
            }, "sec9FlyText+=4.0")
            
            .addLabel("sec9MainTrack", "sec9FlyText+=4.5")
            .to({}, { duration: 2.0 }, "sec9MainTrack");

          // ── CTA REVEAL ──
          tl.addLabel("ctaStart", "sec9MainTrack+=2.0")
            .set(".section-cta", { display: "block", zIndex: 120 })
            .to(".section-cta", { yPercent: 0, duration: 4.8 }, "ctaStart")
            .to(".section-9", { scale: 1.05, duration: 4.8 }, "ctaStart");

          // ── FOOTER REVEAL ──
          tl.addLabel("footerStart", "ctaStart+=4.8")
            .set(".footer", { display: "block", zIndex: 125 })
            .to(".footer", { yPercent: 0, duration: 5.5 }, "footerStart")
            .to(".section-9", { scale: 1.05, duration: 5.5 }, "footerStart")
            .to(".section-cta .cta-inner-desktop", { opacity: 0, duration: 4.0, ease: "power1.out" }, "footerStart");

          const totalDuration = tl.totalDuration();
          const labelNames = [
            "heroPhase1", "heroPhase2", "heroPhase3", "textLanding", 
            "s2InnerAnimation", "s2InnerMidpoint", "s2InnerSplitReveal", "sec8Start",
            "sec10Start", "sec10TextHide", "sec10ContentReveal", "sec10ExitSequence", 
            "sec7Start", "appSecStart", "sec9Start", "sec9FlyText", "sec9MainTrack", "ctaStart", "footerStart"
          ];
          
          snapPointsArray = [0, ...labelNames.map(name => tl.labels[name] / totalDuration), 1];

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
            " .hero-secondary-para",
            ".s2-title-main", ".s2-title-sub", ".s2-body",
            ".s10-title", ".s10-title-sub", ".s10-para-top",
            ".s7-title", ".s7-para",
            ".s8-heading", ".s8-para",
            ".s9-para-desktop", ".s9-para-mobile"
          ].join(",")
        );
      }
      ctx.revert();
    };
  }, [preloaderDone]);

  return (
    <div ref={scopeRef}>
      <div className="pin-all relative h-screen w-screen overflow-hidden bg-black">
        {/* Added missing Section 2 layout wrapper */}
        <div className="section-2 absolute inset-0 h-full w-full structural-layer">
          <SectionTwo />
        </div>

        {/* Added missing Section 8 layout wrapper */}
        <div className="section-8 absolute inset-0 h-full w-full structural-layer">
          <SectionEight />
        </div>

        <div className="section-10 absolute inset-0 h-full w-full structural-layer">
          <SectionTen />
        </div>
        
        <div className="section-7 absolute inset-0 h-full w-full structural-layer">
          <SectionSeven />
        </div>
        
        <div className="section-appsec absolute inset-0 h-full w-full structural-layer">
          <Appsection />
        </div>
        
        <div className="section-9 absolute inset-0 h-full w-full structural-layer">
          <SectionNine />
        </div>

        {/* Added missing CTA Layout wrapper */}
        <div className="section-cta absolute inset-0 h-full w-full structural-layer">
          <SectionCTA />
        </div>

        <div className="hero absolute inset-0 h-full w-full structural-layer">
          <Hero />
        </div>

        <div className="footer absolute left-0 bottom-0 w-full structural-layer">
          <Footer />
        </div>
      </div>
    </div>
  );
}