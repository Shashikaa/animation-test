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

// Dedicated Desktop Scroll Metrics
const PX_PER_MAIN_PANEL = 1250;
const PX_PER_SUB_STEP = 550;  
const PAUSE_PX = 150;         

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
    wrapper.style.overflow = "hidden";
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
  const [webglReady, setWebglReady] = useState(false);

  // Callback to trigger when WebGL context or heavy canvases finish setting up
  const handleWebGLReady = () => {
    setWebglReady(true);
  };

  // Fallback timer: ensure scroll unlocks even if WebGL load event is slow or drops
  useEffect(() => {
    if (!preloaderDone) return;

    const timer = setTimeout(() => {
      setWebglReady(true);
    }, 2500); // 2.5s maximum wait for WebGL context creation

    return () => clearTimeout(timer);
  }, [preloaderDone]);

  // Strict Scroll Lock Control until Preloader, Hero intro transition, AND WebGL are fully ready
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    if (window.history.scrollRestoration) {
      window.history.scrollRestoration = "manual";
    }

    const isFullyReady = preloaderDone && introDone && webglReady;

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
  }, [preloaderDone, introDone, webglReady]);

  // Initial baseline styling
  useLayoutEffect(() => {
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

      gsap.set([".hero-title", ".hero-contact-btn", ".hero-scroll-indicator"], { opacity: 1, y: 0, visibility: "visible" });
      gsap.set([".hero-right-text", ".hero-secondary-para"], { opacity: 1, visibility: "hidden" });
      gsap.set(".hero-secondary-text-wrap", { height: "auto" });

      gsap.set(".hero-bg", { scale: 1.0, transformOrigin: "center center", force3D: true });

      // Secondary structural layers default state
      gsap.set(".section-2", { display: "block", clipPath: "none", zIndex: 95, yPercent: 100, opacity: 1 });
      gsap.set(".s2-right-img-frame", { clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(".s2-right-img-frame-under", { clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(".s2-scroll-content", { yPercent: 100, y: 0, opacity: 0 });

      gsap.set(".section-10", { display: "block", yPercent: 100, opacity: 1, zIndex: 100 });
      gsap.set(".s10-content-wrap", { opacity: 1, yPercent: 0, y: "150vh" });

      gsap.set(".s10-bg-img", { yPercent: 0, scale: 1.5, transformOrigin: "center center" });
      gsap.set(".s10-static-bg", { yPercent: 0 });

      gsap.set(".section-7", { display: "block", yPercent: 100, zIndex: 105 });
      gsap.set(".section-appsec", { display: "none", yPercent: 100, zIndex: 110 });
      gsap.set(".section-8", { display: "block", clipPath: "none", yPercent: 100, zIndex: 99 });
      gsap.set(".section-9", { visibility: "hidden", yPercent: 0, opacity: 1, zIndex: 115 });
      gsap.set(".s9-left-side", { yPercent: 100 });
      gsap.set(".s9-right-side", { xPercent: 0, yPercent: -100 });
      gsap.set(".s9-para-desktop", { opacity: 0 });
      gsap.set(".section-cta", { yPercent: 100, zIndex: 120, display: "none" });
      gsap.set(".footer", { yPercent: 100, zIndex: 125, display: "none" });
    }, scopeRef);

    return () => ctx.revert();
  }, []);

  // Smooth intro transition after preloader completes
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

  // Main Timeline & Smooth Scrub Controller (Waits for WebGL readiness)
  useEffect(() => {
    if (!preloaderDone || !introDone || !webglReady) return;

    if (isTouchOnly()) {
      ScrollTrigger.normalizeScroll(true);
    }

    let vvCleanup: (() => void) | null = null;

    const ctx = gsap.context(() => {
      gsap.ticker.lagSmoothing(1000, 16);

      ScrollTrigger.config({
        ignoreMobileResize: true,
        autoRefreshEvents: "visibilitychange,DOMContentLoaded,load,resize",
      });

      gsap.set([".hero-bg", ".section-2", ".s2-right-img-frame", ".s10-bg-img"], {
        force3D: true,
        backfaceVisibility: "hidden"
      });

      const buildTimeline = () => {
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

        const MAIN_PANELS_COUNT = 8;
        const SUB_STEPS_COUNT = 7;
        const PAUSES_COUNT = 5;

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
            scrub: 1.0,
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
                    return isScrollingDown
                      ? (localProgress >= 0.35 ? end : start)
                      : (localProgress <= 0.50 ? start : end);
                  }
                }
                return value;
              },
              duration: { min: 0.4, max: 0.8 },
              delay: 0.05,
              ease: "power2.inOut"
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
                stagger: 0.04,
                duration: 0.7,
                ease: "power2.out",
                overwrite: "auto"
              });
            }
          }, [], absoluteTime);
        };

        const s2TextSelector = ".section-2 .gs-line-inner, .section-2 .custom-line-inner, .section-2 .reveal-text > *";
        const s8TextSelector = ".section-8 .gs-line-inner, .section-8 .custom-line-inner, .section-8 .reveal-text > *";
        const s10TextSelector = ".section-10 .gs-line-inner, .section-10 .custom-line-inner, .section-10 .reveal-text > *";
        const s7TextSelector = ".section-7 .gs-line-inner, .section-7 .custom-line-inner, .section-7 .reveal-text > *";
        const appSecTextSelector = ".section-appsec .gs-line-inner, .section-appsec .custom-line-inner, .section-appsec .reveal-text > *";

        // ── HERO PHASE 1 ──
        tl.addLabel("heroPhase1", 0)
          .set([".hero-right-text .custom-line-inner", ".hero-secondary-para .custom-line-inner"], { opacity: 0, yPercent: 100 }, "heroPhase1")
          .to(".hero-bg", { scale: 1.15, duration: 1.0, ease: "sine.inOut" }, "heroPhase1")
          .to([".hero-title", ".hero-contact-btn", ".hero-scroll-indicator"], { opacity: 0, y: -20, duration: 0.5, ease: "power1.out" }, "heroPhase1")
          .set([".hero-title", ".hero-contact-btn", ".hero-scroll-indicator"], { visibility: "hidden" }, "heroPhase1+=0.5")
          .set(".hero-right-text", { visibility: "visible" }, "heroPhase1+=0.5")
          .to(".hero-right-text .custom-line-inner", { opacity: 1, yPercent: 0, stagger: 0.04, duration: 0.5, ease: "power2.out" }, "heroPhase1+=0.5");

        // ── HERO PHASE 2 ──
        tl.addLabel("heroPhase2", "heroPhase1+=1.0")
          .to(".hero-right-text .custom-line-inner", { opacity: 0, y: -20, duration: 0.4, ease: "power1.in" }, "heroPhase2")
          .set(".hero-right-text", { visibility: "hidden" }, "heroPhase2+=0.4")
          .to(".hero-bg", { scale: 1.3, duration: 1.0, ease: "sine.inOut" }, "heroPhase2")
          .set(".hero-secondary-para", { visibility: "visible" }, "heroPhase2+=0.4")
          .to(".hero-secondary-para .custom-line-inner", { opacity: 1, yPercent: 0, stagger: 0.04, duration: 0.5, ease: "power2.out" }, "heroPhase2+=0.4");

        // ── HERO PHASE 3 (TRANSITION TO SECTION 2) ──
        tl.addLabel("sec2Arrived", "heroPhase2+=1.0")
          .to(".hero-secondary-para .custom-line-inner", { opacity: 0, y: -60, duration: 0.5, ease: "power1.in" }, "sec2Arrived")
          .set(".hero-secondary-para", { visibility: "hidden" }, "sec2Arrived+=0.5")
          .set(".hero", { display: "block", zIndex: 90, opacity: 1 }, "sec2Arrived")
          .set(".hero-bg-wrapper", { visibility: "visible", opacity: 1 }, "sec2Arrived")
          .to(".hero-bg", { scale: 1.4, duration: 1.5, ease: "sine.out" }, "sec2Arrived")

          .fromTo(".section-2",
            { yPercent: 100, zIndex: 95, display: "block" },
            { yPercent: 0, duration: 1.5, ease: "power2.out" },
            "sec2Arrived"
          );

        addPlayOnceTextReveal("sec2Arrived", 0.1, s2TextSelector);

        // ── SECTION 2 INNER ANIMATIONS ──
        tl.addLabel("s2InnerAnimation", "sec2Arrived+=1.5")
          .set(".hero", { display: "none" }, "s2InnerAnimation")
          .to(s2TextSelector, { opacity: 0, y: -40, duration: 0.5, ease: "power2.in" }, "s2InnerAnimation")
          .to(".hero-secondary-para", { opacity: 0, duration: 0.4, ease: "power1.out" }, "s2InnerAnimation")
          
          .to(".s2-right-img-frame", { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "power2.inOut" }, "s2InnerAnimation")
          .to(".s2-scroll-content", { yPercent: 0, opacity: 1, duration: 1.0, ease: "power2.out" }, "s2InnerAnimation+=0.5")
          
          .addLabel("s2ImageOneRevealed", "s2InnerAnimation+=1.5")

          .to(".s2-right-img-frame", { clipPath: "inset(0% 0% 100% 0%)", duration: 1.5, ease: "power2.inOut" }, "s2ImageOneRevealed")
          .to(".s2-right-img-frame-under", { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "power2.inOut" }, "s2ImageOneRevealed")
          .to(".s2-scroll-content", { y: -250, duration: 1.5, ease: "power2.inOut" }, "s2ImageOneRevealed")

          .addLabel("s2ImageTwoRevealed", "s2ImageOneRevealed+=1.5")

          .to(".s2-scroll-content", { y: -500, opacity: 1, duration: 1.2, ease: "power2.in" }, "s2ImageTwoRevealed")
          
          .addLabel("s2TextScrolled", "s2ImageTwoRevealed+=1.2");

        // ── SECTION 8 REVEAL ──
        tl.addLabel("sec8Start", "s2TextScrolled+=0.5")
          .set(".section-8", { zIndex: 99, display: "block", clipPath: "none", yPercent: 100 }, "sec8Start")
          .to(".section-8", { scale: 1, yPercent: 0, duration: 2.0, ease: "power2.inOut" }, "sec8Start")
          .to(".s8-bg-img", { yPercent: 0, duration: 2.0, ease: "none" }, "sec8Start")
          .set(".section-2", { display: "none" }, "sec8Start+=2.0");

        addPlayOnceTextReveal("sec8Start", 1.0, s8TextSelector);

        // ── SECTION 10 REVEAL ──
        tl.addLabel("sec10Start", "sec8Start+=2.0")
          .set(".section-10", { zIndex: 100, display: "block" }, "sec10Start")
          .fromTo(".section-10", { yPercent: 100 }, { yPercent: 0, duration: 2.0, ease: "power2.inOut" }, "sec10Start")
          .fromTo(".s10-static-bg", { yPercent: 0 }, { yPercent: 0, duration: 2.0, ease: "power2.out" }, "sec10Start")
          
          .fromTo(".s10-bg-img", 
            { yPercent: 0, scale: 1.5 }, 
            { yPercent: 0, scale: 1.5, duration: 2.0, ease: "power2.out" }, 
            "sec10Start"
          )
          
          .set(".section-8", { display: "none" }, "sec10Start+=2.0")
          .set(".s10-content-wrap", { opacity: 1, yPercent: 0, y: "100vh" }, "sec10Start");

        addPlayOnceTextReveal("sec10Start", 1.0, s10TextSelector);

        // ── SECTION 10 INNER PARAGRAPH SLIDE UP ──
        tl.addLabel("sec10TextHide", "sec10Start+=2.0")
          .to(s10TextSelector, { opacity: 0, y: -100, duration: 0.5, ease: "power2.in" }, "sec10TextHide")

          .addLabel("sec10ContentReveal", "sec10TextHide+=0.1")
          .fromTo(".s10-content-wrap", { opacity: 1, y: "150vh" }, { opacity: 1, y: 0, duration: 2.0, ease: "power2.out" }, "sec10ContentReveal")
          
          .to(".s10-bg-img", { scale: 1.6, yPercent: 0, duration: 2.0, ease: "none" }, "sec10ContentReveal");

        // ── SECTION 7 REVEAL ──
        tl.addLabel("sec7Start", "sec10ContentReveal+=2.0")
          .set(".section-7", { display: "block", zIndex: 105 }, "sec7Start")
          .to(".section-7", { yPercent: 0, duration: 2.0, ease: "power2.inOut" }, "sec7Start")
          .to(".s7-bg-img", { yPercent: 0, duration: 2.0 }, "sec7Start")
          .to(".s10-content-wrap", { opacity: 0, y: -60, duration: 1.5, ease: "power2.in" }, "sec7Start")
          .set(".section-10", { display: "none" }, "sec7Start+=2.0");

        addPlayOnceTextReveal("sec7Start", 1.0, s7TextSelector);

        // ── APPSECTION REVEAL ──
        tl.addLabel("appSecStart", "sec7Start+=2.0")
          .set(".section-appsec", { display: "block", zIndex: 110 }, "appSecStart")
          .set(".appsec-bg", { scale: 1.25, yPercent: 0 }, "appSecStart")
          .set(".appsec-content", { opacity: 1 }, "appSecStart")
          .set(".appsec-phone-wrapper", { yPercent: 40 }, "appSecStart")

          .fromTo(".section-appsec", { yPercent: 100 }, { yPercent: 0, duration: 2.0 }, "appSecStart")
          .to(".appsec-phone-wrapper", { yPercent: 0, duration: 1.5, ease: "power2.out" }, "appSecStart+=0.2")
          .set(".section-7", { display: "none" }, "appSecStart+=2.0");

        addPlayOnceTextReveal("appSecStart", 1.0, appSecTextSelector);

        // ── SECTION 9 REVEAL ──
        tl.addLabel("sec9Start", "appSecStart+=2.0")
          .set(".section-9", { visibility: "visible", zIndex: 115 }, "sec9Start")

          .to(".appsec-content", { opacity: 0, duration: 0.5, ease: "power1.out" }, "sec9Start")
          .to(".appsec-bg", { scale: 1.0, yPercent: 12, duration: 2.0, ease: "power2.inOut" }, "sec9Start")

          .fromTo(".s9-left-side", { yPercent: 100 }, { yPercent: 0, duration: 2.0, ease: "power2.inOut" }, "sec9Start")
          .fromTo(".s9-right-side", { xPercent: 0, yPercent: -100 }, { xPercent: 0, yPercent: 0, duration: 2.0, ease: "power2.inOut" }, "sec9Start")
          .fromTo([".s9-bg-img-left", ".s9-bg-img-right"], { scale: 1.1 }, { scale: 1.0, duration: 2.0, ease: "power2.out" }, "sec9Start")

          .set(".section-appsec", { display: "none" }, "sec9Start+=2.0")

          .addLabel("sec9FlyText", "sec9Start+=2.0")
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
            duration: 2.0,
            ease: "power2.inOut"
          }, "sec9FlyText")
          .fromTo(".s9-para-desktop", { y: 30, opacity: 0 }, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, "sec9FlyText+=1.0");

        tl.addLabel("sec9MainTrack", "sec9FlyText+=2.0")
          .to({}, { duration: 0.5 }, "sec9MainTrack");

        // ── CTA REVEAL ──
        tl.addLabel("ctaStart", "sec9MainTrack+=0.5")
          .set(".section-cta", { display: "block", zIndex: 120 })
          .to(".section-cta", { yPercent: 0, duration: 2.0, ease: "power2.out" }, "ctaStart")
          .to(".section-9", { scale: 1.0 }, "ctaStart");

        // ── FOOTER REVEAL ──
        tl.addLabel("footerStart", "ctaStart+=2.0")
          .set(".footer", { display: "block", zIndex: 125 })
          .to(".footer", { yPercent: 0, duration: 2.0, ease: "power2.out" }, "footerStart")
          .to(".section-9", { scale: 1.05, duration: 2.0 }, "footerStart")
          .to(".section-cta .cta-inner-desktop", { opacity: 0, duration: 0.8, ease: "power1.out" }, "footerStart")

          .addLabel("timelineEnd", "footerStart+=2.0")
          .to({}, { duration: 0.2 }, "timelineEnd");
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
  }, [preloaderDone, introDone, webglReady]);

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
          <Hero onReady={handleWebGLReady} />
        </div>

        <div className="footer absolute left-0 bottom-0 w-full structural-layer">
          <Footer />
        </div>
      </div>
    </div>
  );
}