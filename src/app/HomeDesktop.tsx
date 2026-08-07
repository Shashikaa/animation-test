"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import dynamic from "next/dynamic";
import { useSite } from "./context/SiteContext";

import Hero from "../components/Home/Hero";
import SectionTwo from "../components/Home/SectionTwo";
import Footer from "../components/Footer";

// Lazy-load non-hero components
const SectionCTA = dynamic(() => import("../components/SectionCTA"), { ssr: false });
const SectionSeven = dynamic(() => import("../components/Home/Sectionseven"), { ssr: false });
const SectionEight = dynamic(() => import("../components/Home/Sectioneight"), { ssr: false });
const SectionNine = dynamic(() => import("../components/Home/SectionNine"), { ssr: false });
const SectionTen = dynamic(() => import("../components/Home/SectionTen"), { ssr: false });
const Appsection = dynamic(() => import("../components/Appsection"), { ssr: false });

import { useTextReveal, restoreTextReveal } from "./utils/useTextReveal";

gsap.registerPlugin(ScrollTrigger);

const isTouchOnly = () => ScrollTrigger.isTouch === 1;

// Standardized Desktop Metrics for Uniform Scroll Feel
const PX_PER_MAIN_PANEL = 1000;
const PX_PER_SUB_STEP = 600; 
const PAUSE_PX = 350; 

function executeDesktopSplitting(selector: string) {
  const element = document.querySelector(selector) as HTMLElement;
  if (!element || element.dataset.splitComplete === "true") return;

  const rawText = element.textContent || "";
  const linesArray = rawText.split("\n").map(line => line.trim()).filter(line => line.length > 0);

  const fragment = document.createDocumentFragment();
  linesArray.forEach(lineText => {
    const wrapper = document.createElement("span");
    wrapper.className = "custom-line-wrap";
    wrapper.style.display = "block";
    wrapper.style.overflow = "visible";
    wrapper.style.position = "relative";

    const inner = document.createElement("span");
    inner.className = "custom-line-inner";
    inner.style.display = "block";
    inner.textContent = lineText;

    wrapper.appendChild(inner);
    fragment.appendChild(wrapper);
  });

  element.innerHTML = "";
  element.appendChild(fragment);
  element.dataset.splitComplete = "true";
}

export default function HomeDesktop() {
  const scopeRef = useRef<HTMLDivElement>(null);
  const context = useSite();
  const preloaderDone = context?.preloaderDone ?? false;
  
  const [introDone, setIntroDone] = useState(false);

  // Strict Scroll Lock Control
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    if (window.history.scrollRestoration) {
      window.history.scrollRestoration = "manual";
    }

    const isFullyReady = preloaderDone && introDone;

    if (!isFullyReady) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      window.scrollTo(0, 0);
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    }

    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [preloaderDone, introDone]);

  useLayoutEffect(() => {
    executeDesktopSplitting(".hero-title");
    executeDesktopSplitting(".hero-right-text");
    executeDesktopSplitting(".hero-secondary-para");

    const ctx = gsap.context(() => {
      gsap.set(".hero", { 
        yPercent: 0, 
        zIndex: 90, 
        display: "block", 
        opacity: 1, 
        visibility: "visible",
        force3D: true,
        transformStyle: "preserve-3d"
      });
      
      gsap.set(".hero-bg-wrapper", { opacity: 1, visibility: "visible" });
      gsap.set(".hero-gradient-bg", { opacity: 1, visibility: "visible" });

      gsap.set([".hero-contact-btn", ".hero-scroll-indicator"], { opacity: 1, y: 0, visibility: "visible" });
      
      // Hero text initial states
      gsap.set(".hero-left-initial", { y: 0, opacity: 1 });
      gsap.set(".hero-title", { opacity: 1, visibility: "visible" });
      gsap.set(".hero-title .custom-line-inner", { opacity: 1, yPercent: 0 });

      gsap.set(".hero-right-text", { opacity: 0, visibility: "hidden" });
      gsap.set(".hero-right-text .custom-line-inner", { opacity: 0, yPercent: 100 });

      gsap.set(".hero-secondary-text-wrap", { y: 0, opacity: 0, visibility: "hidden" });

      gsap.set(".hero-bg", { 
        scale: 1.0, 
        transformOrigin: "center center", 
        force3D: true,
        willChange: "transform" 
      });

      gsap.set(".section-2", { display: "block", clipPath: "none", zIndex: 95, yPercent: 100, opacity: 1, force3D: true });
      gsap.set(".s2-right-img-frame", { clipPath: "inset(100% 0% 0% 0%)", force3D: true });
      gsap.set(".s2-right-img-frame-under", { clipPath: "inset(100% 0% 0% 0%)", force3D: true });
      gsap.set(".s2-scroll-content", { yPercent: 100, y: 0, opacity: 0, force3D: true });

      gsap.set(".section-10", { display: "block", yPercent: 100, opacity: 1, zIndex: 100, force3D: true });
      gsap.set(".s10-content-wrap", { opacity: 1, yPercent: 0, y: "150vh" });

      gsap.set(".s10-bg-img", { yPercent: 0, scale: 1.5, transformOrigin: "center center", force3D: true });
      gsap.set(".s10-static-bg", { yPercent: 0 });

      gsap.set(".section-7", { display: "block", yPercent: 100, zIndex: 105, force3D: true });
      gsap.set(".section-appsec", { display: "none", yPercent: 100, zIndex: 110, force3D: true });
      gsap.set(".section-8", { display: "block", clipPath: "none", yPercent: 100, zIndex: 99, force3D: true });
      gsap.set(".section-9", { visibility: "hidden", yPercent: 0, opacity: 1, zIndex: 115, force3D: true });
      gsap.set(".s9-left-side", { yPercent: 100 });
      gsap.set(".s9-right-side", { xPercent: 0, yPercent: -100 });
      gsap.set(".s9-para-desktop", { opacity: 0 });
      gsap.set(".section-cta", { yPercent: 100, zIndex: 120, display: "none", force3D: true });
      gsap.set(".footer", { yPercent: 100, zIndex: 125, display: "none", force3D: true });
    }, scopeRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!preloaderDone) return;

    const ctx = gsap.context(() => {
      const introTl = gsap.timeline({
        onComplete: () => {
          setIntroDone(true);
        }
      });

      introTl.to(".hero-bg", { scale: 1.0, duration: 0.2, ease: "power1.out" });
    }, scopeRef);

    return () => ctx.revert();
  }, [preloaderDone]);

  useEffect(() => {
    if (!preloaderDone || !introDone) return;

    if (isTouchOnly()) {
      ScrollTrigger.normalizeScroll(true);
    }

    let vvCleanup: (() => void) | null = null;

    const ctx = gsap.context(() => {
      gsap.ticker.lagSmoothing(500, 33);

      ScrollTrigger.config({
        ignoreMobileResize: true,
        autoRefreshEvents: "visibilitychange,DOMContentLoaded,load,resize",
      });

      gsap.set([".hero-bg", ".section-2", ".s2-right-img-frame", ".s2-right-img-frame-under", ".s2-scroll-content", ".s10-bg-img"], {
        force3D: true,
        backfaceVisibility: "hidden"
      });

      const buildTimeline = () => {
        executeDesktopSplitting(".hero-title");
        executeDesktopSplitting(".hero-right-text");
        executeDesktopSplitting(".hero-secondary-para");

        useTextReveal(scopeRef, ".section-2 .reveal-text");
        useTextReveal(scopeRef, ".section-8 .reveal-text");
        useTextReveal(scopeRef, ".section-10 .reveal-text");
        useTextReveal(scopeRef, ".section-7 .reveal-text");
        useTextReveal(scopeRef, ".section-appsec .reveal-text");

        gsap.set([
          ".section-2 .reveal-text",
          ".section-8 .reveal-text",
          ".section-10 .reveal-text",
          ".section-7 .reveal-text",
          ".section-appsec .reveal-text"
        ], { visibility: "visible", opacity: 1 });

        const allTextInners = [
          ".section-2 .gs-line-inner, .section-2 .custom-line-inner, .section-2 .reveal-text > *",
          ".section-8 .gs-line-inner, .section-8 .custom-line-inner, .section-8 .reveal-text > *",
          ".section-10 .gs-line-inner, .section-10 .custom-line-inner, .section-10 .reveal-text > *",
          ".section-7 .gs-line-inner, .section-7 .custom-line-inner, .section-7 .reveal-text > *",
          ".section-appsec .gs-line-inner, .section-appsec .custom-line-inner, .section-appsec .reveal-text > *"
        ].join(",");
        
        gsap.set(allTextInners, { y: 45, opacity: 0, immediateRender: true });

        const vv = typeof visualViewport !== "undefined" ? visualViewport : null;
        if (vv) {
          const onVVResize = () => ScrollTrigger.refresh(true);
          vv.addEventListener("resize", onVVResize);
          vvCleanup = () => vv.removeEventListener("resize", onVVResize);
        }

        const revealedElements = new Set<string>();

        // UNIFORM DURATION METRICS
        const PANEL_ACTION = 2.0; 
        const HOLD_ACTION = 1.0;  
        const PAUSE_ACTION = 0.4;

        const MAIN_PANELS_COUNT = 8;
        const SUB_STEPS_COUNT = 12; 
        const PAUSES_COUNT = 9;

        const DYNAMIC_SCROLL_TRACK = 
          (MAIN_PANELS_COUNT * PX_PER_MAIN_PANEL) + 
          (SUB_STEPS_COUNT * PX_PER_SUB_STEP) + 
          (PAUSES_COUNT * PAUSE_PX);

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: ".pin-all",
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
            if (!revealedElements.has(selector)) {
              revealedElements.add(selector);

              gsap.to(selector, {
                y: 0,
                opacity: 1,
                stagger: 0.04,
                duration: 0.7,
                ease: "power2.out"
              });
            }
          }, [], absoluteTime);
        };

        const s2TextSelector = ".section-2 .gs-line-inner, .section-2 .custom-line-inner, .section-2 .reveal-text > *";
        const s8TextSelector = ".section-8 .gs-line-inner, .section-8 .custom-line-inner, .section-8 .reveal-text > *";
        const s10TextSelector = ".section-10 .gs-line-inner, .section-10 .custom-line-inner, .section-10 .reveal-text > *";
        const s7TextSelector = ".section-7 .gs-line-inner, .section-7 .custom-line-inner, .section-7 .reveal-text > *";
        const appSecTextSelector = ".section-appsec .gs-line-inner, .section-appsec .custom-line-inner, .section-appsec .reveal-text > *";

        // ── 1. HERO PHASE 1 (Scroll Start) ──
        tl.addLabel("heroPhase1", 0)
          .to(".hero-bg", { scale: 1.15, duration: PANEL_ACTION, ease: "sine.inOut" }, "heroPhase1")

          // SMOOTHER: Initial Left Title slides UP smoothly across the scroll span
          .to(".hero-left-initial", {
            y: "-100vh",
            duration: PANEL_ACTION,
            ease: "none"
          }, "heroPhase1")

          // Meantime: Right paragraph reveals above the button
          .set(".hero-right-text", { visibility: "visible", opacity: 1 }, "heroPhase1+=0.05")
          .to(".hero-right-text .custom-line-inner", {
            opacity: 1,
            yPercent: 0,
            stagger: 0.04,
            duration: PANEL_ACTION * 0.7,
            ease: "power1.out"
          }, "heroPhase1+=0.05");

        tl.to({}, { duration: HOLD_ACTION });

        // ── HERO PHASE 2 (Further Scroll) ──
        tl.addLabel("heroPhase2", ">")
          // Right text hides
          .to(".hero-right-text .custom-line-inner", { opacity: 0, y: -20, duration: PANEL_ACTION * 0.4, ease: "power1.in" }, "heroPhase2")
          .set(".hero-right-text", { visibility: "hidden" }, `heroPhase2+=${PANEL_ACTION * 0.4}`)
          
          .to(".hero-bg", { scale: 1.3, duration: PANEL_ACTION, ease: "sine.inOut" }, "heroPhase2")
          
          // SMOOTHER: 2nd Left Para slides UP smoothly from bottom to middle (-50vh)
          .set(".hero-secondary-text-wrap", { visibility: "visible", opacity: 1 }, "heroPhase2")
          .to(".hero-secondary-text-wrap", {
            y: "-50vh",
            duration: PANEL_ACTION,
            ease: "sine.out"
          }, "heroPhase2");

        tl.to({}, { duration: HOLD_ACTION });

        // ── 2. HERO TO SECTION 2 REVEAL ──
        tl.addLabel("sec2Arrived", ">")
          // SMOOTHER: 2nd left text continues sliding smoothly out off top
          .to(".hero-secondary-text-wrap", {
            y: "-110vh",
            duration: PANEL_ACTION,
            ease: "sine.in"
          }, "sec2Arrived")

          .to([".hero-contact-btn", ".hero-scroll-indicator"], {
            opacity: 0,
            duration: PANEL_ACTION * 0.5,
            ease: "power1.inOut"
          }, "sec2Arrived")

          .set(".hero", { display: "block", zIndex: 90, opacity: 1 }, "sec2Arrived")
          .set(".hero-bg-wrapper", { visibility: "visible", opacity: 1 }, "sec2Arrived")
          .to(".hero-bg", { scale: 1.4, duration: PANEL_ACTION, ease: "sine.inOut" }, "sec2Arrived")
          .fromTo(".section-2",
            { yPercent: 100, zIndex: 95, display: "block" },
            { yPercent: 0, duration: PANEL_ACTION, ease: "sine.inOut" },
            "sec2Arrived"
          );

        addPlayOnceTextReveal("sec2Arrived", 0.9, s2TextSelector);

        // ── SECTION 2 INNER ANIMATIONS ──
        tl.addLabel("s2InnerAnimation", `sec2Arrived+=${PANEL_ACTION}`)
          .set(".hero", { display: "none" }, "s2InnerAnimation")
          .to(s2TextSelector, { opacity: 0, y: -40, duration: PANEL_ACTION * 0.5, ease: "power1.in" }, "s2InnerAnimation")

          .addLabel("s2TitleFaded", `s2InnerAnimation+=${PANEL_ACTION * 0.5}`)
          .fromTo(".s2-right-img-frame", 
            { clipPath: "inset(100% 0% 0% 0%)" }, 
            { clipPath: "inset(0% 0% 0% 0%)", duration: PANEL_ACTION, ease: "power1.inOut" }, 
            "s2TitleFaded"
          )
          .fromTo(".s2-scroll-content", 
            { yPercent: 100, opacity: 1 }, 
            { yPercent: 0, opacity: 1, duration: PANEL_ACTION, ease: "power1.out" }, 
            `s2TitleFaded+=${PANEL_ACTION * 0.9}`
          )

          .addLabel("s2FirstPhaseDone", `s2TitleFaded+=${PANEL_ACTION * 1.2}`)
          .to(".s2-right-img-frame", { clipPath: "inset(0% 0% 100% 0%)", duration: PANEL_ACTION, ease: "power1.inOut" }, "s2FirstPhaseDone")
          .fromTo(".s2-right-img-frame-under", 
            { clipPath: "inset(100% 0% 0% 0%)" }, 
            { clipPath: "inset(0% 0% 0% 0%)", duration: PANEL_ACTION, ease: "power1.inOut" }, 
            "s2FirstPhaseDone"
          )
          .to(".s2-scroll-content", { yPercent: -45, duration: PANEL_ACTION, ease: "power1.inOut" }, "s2FirstPhaseDone")

          .addLabel("s2ImageTwoRevealed", `s2FirstPhaseDone+=${PANEL_ACTION}`);

        tl.to({}, { duration: PAUSE_ACTION });

        // ── 3. SECTION 8 REVEAL ──
        tl.addLabel("sec8Start", ">")
          .set(".section-8", { zIndex: 99, display: "block", clipPath: "none", yPercent: 100 }, "sec8Start")
          .to(".section-8", { scale: 1, yPercent: 0, duration: PANEL_ACTION, ease: "power2.inOut" }, "sec8Start")
          .to(".s8-bg-img", { yPercent: 0, duration: PANEL_ACTION, ease: "power2.inOut" }, "sec8Start")
          .set(".section-2", { display: "none" }, `sec8Start+=${PANEL_ACTION}`);

        addPlayOnceTextReveal("sec8Start", 0.9, s8TextSelector);

        tl.to({}, { duration: PAUSE_ACTION });

        // ── 4. SECTION 10 REVEAL ──
        tl.addLabel("sec10Start", ">")
          .set(".section-10", { zIndex: 100, display: "block" }, "sec10Start")
          .fromTo(".section-10", { yPercent: 100 }, { yPercent: 0, duration: PANEL_ACTION, ease: "power2.inOut" }, "sec10Start")
          .fromTo(".s10-static-bg", { yPercent: 0 }, { yPercent: 0, duration: PANEL_ACTION, ease: "power2.out" }, "sec10Start")
          .fromTo(".s10-bg-img", 
            { yPercent: 0, scale: 1.5 }, 
            { yPercent: 0, scale: 1.5, duration: PANEL_ACTION, ease: "power2.out" }, 
            "sec10Start"
          )
          .set(".section-8", { display: "none" }, `sec10Start+=${PANEL_ACTION}`)
          .set(".s10-content-wrap", { opacity: 1, yPercent: 0, y: "100vh" }, "sec10Start");

        addPlayOnceTextReveal("sec10Start", 0.9, s10TextSelector);

        // Section 10 Paragraph Content Slide Up
        tl.addLabel("sec10TextHide", `sec10Start+=${PANEL_ACTION}`)
          .to(s10TextSelector, { opacity: 0, y: -100, duration: PANEL_ACTION * 0.5, ease: "power2.in" }, "sec10TextHide")

          .addLabel("sec10ContentReveal", `sec10TextHide+=${PANEL_ACTION * 0.3}`)
          .fromTo(".s10-content-wrap", { opacity: 1, y: "150vh" }, { opacity: 1, y: 0, duration: PANEL_ACTION, ease: "power2.out" }, "sec10ContentReveal")
          .to(".s10-bg-img", { scale: 1.6, yPercent: 0, duration: PANEL_ACTION, ease: "none" }, "sec10ContentReveal");

        tl.to({}, { duration: PAUSE_ACTION });

        // ── 5. SECTION 7 REVEAL ──
        tl.addLabel("sec7Start", ">")
          .set(".section-7", { display: "block", zIndex: 105 }, "sec7Start")
          .to(".section-7", { yPercent: 0, duration: PANEL_ACTION, ease: "power2.inOut" }, "sec7Start")
          .to(".s7-bg-img", { yPercent: 0, duration: PANEL_ACTION, ease: "power2.inOut" }, "sec7Start")
          .to(".s10-content-wrap", { opacity: 0, y: -60, duration: PANEL_ACTION * 0.75, ease: "power2.in" }, "sec7Start")
          .set(".section-10", { display: "none" }, `sec7Start+=${PANEL_ACTION}`);

        addPlayOnceTextReveal("sec7Start", 0.9, s7TextSelector);

        tl.to({}, { duration: PAUSE_ACTION });

        // ── 6. APPSECTION REVEAL ──
        tl.addLabel("appSecStart", ">")
          .set(".section-appsec", { display: "block", zIndex: 110 }, "appSecStart")
          .set(".appsec-bg", { scale: 1.25, yPercent: 0 }, "appSecStart")
          .set(".appsec-content", { opacity: 1 }, "appSecStart")
          .set(".appsec-phone-wrapper", { yPercent: 40 }, "appSecStart")

          .fromTo(".section-appsec", { yPercent: 100 }, { yPercent: 0, duration: PANEL_ACTION, ease: "power2.inOut" }, "appSecStart")
          .to(".appsec-phone-wrapper", { yPercent: 0, duration: PANEL_ACTION * 0.8, ease: "power2.out" }, `appSecStart+=${PANEL_ACTION * 0.1}`)
          .set(".section-7", { display: "none" }, `appSecStart+=${PANEL_ACTION}`);

        addPlayOnceTextReveal("appSecStart", 0.9, appSecTextSelector);

        tl.to({}, { duration: PAUSE_ACTION });

        // ── 7. SECTION 9 REVEAL & FLY TEXT ──
        tl.addLabel("sec9Start", ">")
          .set(".section-9", { visibility: "visible", zIndex: 115 }, "sec9Start")

          .to(".appsec-content", { opacity: 0, duration: PANEL_ACTION * 0.4, ease: "power1.out" }, "sec9Start")
          .to(".appsec-bg", { scale: 1.0, yPercent: 12, duration: PANEL_ACTION, ease: "power2.inOut" }, "sec9Start")

          .fromTo(".s9-left-side", { yPercent: 100 }, { yPercent: 0, duration: PANEL_ACTION, ease: "power2.inOut" }, "sec9Start")
          .fromTo(".s9-right-side", { xPercent: 0, yPercent: -100 }, { xPercent: 0, yPercent: 0, duration: PANEL_ACTION, ease: "power2.inOut" }, "sec9Start")
          .fromTo([".s9-bg-img-left", ".s9-bg-img-right"], { scale: 1.1 }, { scale: 1.0, duration: PANEL_ACTION, ease: "power2.out" }, "sec9Start")

          .set(".section-appsec", { display: "none" }, `sec9Start+=${PANEL_ACTION}`)

          .to({}, { duration: PAUSE_ACTION })

          .addLabel("sec9FlyText", ">")
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
            duration: PANEL_ACTION,
            ease: "power2.inOut"
          }, "sec9FlyText")
          .fromTo(".s9-para-desktop", { y: 30, opacity: 0 }, { opacity: 1, y: 0, duration: PANEL_ACTION * 0.6, ease: "power2.out" }, `sec9FlyText+=${PANEL_ACTION * 0.4}`);

        tl.to({}, { duration: PAUSE_ACTION });

        // ── 8. CTA REVEAL ──
        tl.addLabel("ctaStart", ">")
          .set(".section-cta", { display: "block", zIndex: 120 })
          .to(".section-cta", { yPercent: 0, duration: PANEL_ACTION, ease: "power2.out" }, "ctaStart")
          .to(".section-9", { scale: 1.0 }, "ctaStart");

        tl.to({}, { duration: PAUSE_ACTION });

        // ── 8.5 FADE OUT CTA CONTENT ──
        tl.addLabel("ctaFadeOut", ">")
          .to(".section-cta .cta-inner-desktop", { 
            opacity: 0, 
            y: -40, 
            duration: PANEL_ACTION * 0.5, 
            ease: "power2.in" 
          }, "ctaFadeOut")
          
          .to({}, { duration: 0 });

        // ── 9. FOOTER REVEAL ──
        tl.addLabel("footerStart", ">")
          .set(".footer", { display: "block", zIndex: 125 })
          .to(".footer", { 
            yPercent: 0, 
            duration: PANEL_ACTION, 
            ease: "power2.out" 
          }, "footerStart")
          .to(".section-9", { 
            scale: 1.05, 
            duration: PANEL_ACTION 
          }, "footerStart")

          .addLabel("timelineEnd", `footerStart+=${PANEL_ACTION}`)
          .to({}, { duration: PAUSE_ACTION }, "timelineEnd");
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
            ".section-2 .reveal-text",
            ".section-8 .reveal-text",
            ".section-10 .reveal-text",
            ".section-7 .reveal-text",
            ".section-appsec .reveal-text",
            ".s9-para-desktop", ".s9-para-mobile"
          ].join(",")
        );
      }
      ctx.revert();
    };
  }, [preloaderDone, introDone]);

  return (
    <div 
      ref={scopeRef}
      className="home-desktop-scope w-full h-full opacity-100 visible"
    >
      <div className="pin-all relative h-screen w-screen overflow-hidden bg-black">
        <div className="section-2 absolute inset-0 h-full w-full structural-layer">
          <SectionTwo />
        </div>

        <div className="section-8 absolute inset-0 h-full w-full structural-layer">
          <SectionEight preloaderDone={preloaderDone} />
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

        <div className="section-cta absolute inset-0 h-full w-full structural-layer">
          <SectionCTA preloaderDone={preloaderDone} />
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