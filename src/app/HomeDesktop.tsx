"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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

const TOTAL_SCROLL_STEPS = 18;

// QUADRATIC EASING MATCHES THE ULTRA-SMOOTH FLUID INERTIA
const easeOutQuad = (t: number) => t * (2 - t);

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
  const trackRef = useRef<HTMLDivElement>(null);
  const fixedFrameRef = useRef<HTMLDivElement>(null);

  const layerCTA = useRef<HTMLDivElement>(null);
  const layerFooter = useRef<HTMLDivElement>(null);

  const dimensionsRef = useRef({ ctaHeight: 0, footerHeight: 0, vh: 0, vw: 0, trackTopOffset: 0, totalScrollable: 0 });
  const s9TargetRectRef = useRef<{ deltaX: number; deltaY: number } | null>(null);
  
  const targetProgress = useRef(0);
  const currentProgressRef = useRef(0);
  const rafId = useRef<number | null>(null);
  const revealedSections = useRef<Set<string>>(new Set());

  const context = useSite();
  const smootherRef = context?.smootherRef;
  const preloaderDone = context?.preloaderDone ?? false;
  
  const [introDone, setIntroDone] = useState(false);

  // ── 1. INITIAL SPLITTING & HERO INTRO SIMULATION ──
  useEffect(() => {
    executeDesktopSplitting(".hero-title");
    executeDesktopSplitting(".hero-right-text");
    executeDesktopSplitting(".hero-secondary-para");

    const heroRightText = document.querySelector<HTMLElement>(".hero-right-text");
    if (heroRightText) {
      heroRightText.style.visibility = "hidden";
      heroRightText.style.opacity = "0";
    }

    const s9Flight = scopeRef.current?.querySelector<HTMLElement>(".s9-global-flight-container");
    if (s9Flight) {
      s9Flight.style.visibility = "hidden";
      s9Flight.style.opacity = "0";
    }

    if (preloaderDone) {
      const timer = setTimeout(() => {
        setIntroDone(true);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [preloaderDone]);

  // ── 2. SCROLL LOCK CONTROL & LENIS UNLOCK ──
  useEffect(() => {
    if (typeof window === "undefined") return;

    const lenis = smootherRef?.current;
    const isFullyReady = preloaderDone && introDone;

    if (!isFullyReady) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      if (lenis && typeof lenis.stop === "function") lenis.stop();
      window.scrollTo(0, 0);
      targetProgress.current = 0;
      currentProgressRef.current = 0;
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";

      if (lenis) {
        if (typeof lenis.resize === "function") lenis.resize();
        if (typeof lenis.start === "function") lenis.start();
      }

      requestAnimationFrame(() => {
        window.dispatchEvent(new Event("scroll"));
      });
    }

    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [preloaderDone, introDone, smootherRef]);

  // ── 3. CACHE METRICS TO PREVENT LAYOUT THRASHING ──
  const measure = useCallback(() => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const vh = window.innerHeight;

    dimensionsRef.current = {
      ctaHeight: layerCTA.current?.offsetHeight || vh,
      footerHeight: layerFooter.current?.offsetHeight || layerFooter.current?.scrollHeight || vh,
      vh,
      vw: window.innerWidth,
      trackTopOffset: window.scrollY + rect.top,
      totalScrollable: rect.height - vh,
    };

    if (scopeRef.current) {
      const target = scopeRef.current.querySelector<HTMLElement>(".s9-target-wrapper");
      if (target) {
        const targetRect = target.getBoundingClientRect();
        const startX = window.innerWidth / 2;
        const startY = window.innerHeight / 2;
        const targetCenterX = targetRect.left + targetRect.width / 2;
        const targetCenterY = targetRect.top + targetRect.height / 2;

        s9TargetRectRef.current = {
          deltaX: targetCenterX - startX,
          deltaY: targetCenterY - startY,
        };
      }
    }
  }, []);

  useEffect(() => {
    if (!preloaderDone || !introDone) return;

    measure();

    const resizeObserver = new ResizeObserver(() => measure());
    if (layerCTA.current) resizeObserver.observe(layerCTA.current);
    if (layerFooter.current) resizeObserver.observe(layerFooter.current);

    window.addEventListener("resize", measure, { passive: true });
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [preloaderDone, introDone, measure]);

  // ── 4. TEXT REVEALS HOOK & TRIGGER LOGIC ──
  const triggerPlayOnceTextReveal = useCallback((containerSelector: string, currentStepProg: number, triggerThreshold: number) => {
    if (!scopeRef.current) return;

    const key = containerSelector;
    if (revealedSections.current.has(key)) return;

    if (currentStepProg >= triggerThreshold) {
      revealedSections.current.add(key);

      const targetSection = scopeRef.current.querySelector<HTMLElement>(containerSelector);
      if (targetSection) {
        targetSection.classList.add("revealed");
      }

      const selectors = `${containerSelector} .gs-line-inner, ${containerSelector} .custom-line-inner, ${containerSelector} .reveal-text > *`;
      const elements = scopeRef.current.querySelectorAll<HTMLElement>(selectors);

      elements.forEach((el, idx) => {
        el.style.transition = `transform 0.85s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 0.05}s, opacity 0.85s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 0.05}s`;
        el.style.transform = "translate3d(0, 0px, 0)";
        el.style.opacity = "1";
      });
    }
  }, []);

  useEffect(() => {
    if (!preloaderDone || !introDone || !scopeRef.current) return;

    useTextReveal(scopeRef, ".section-8 .reveal-text");
    useTextReveal(scopeRef, ".section-7 .reveal-text");
    useTextReveal(scopeRef, ".section-appsec .reveal-text");

    return () => {
      if (scopeRef.current) {
        restoreTextReveal(
          scopeRef.current,
          [
            ".section-8 .reveal-text",
            ".section-7 .reveal-text",
            ".section-appsec .reveal-text",
            ".s9-para-desktop", 
            ".s9-para-mobile"
          ].join(",")
        );
      }
    };
  }, [preloaderDone, introDone]);

  // ── 5. ULTRA-SMOOTH CONTINUOUS LERP RENDER ENGINE ──
  useEffect(() => {
    if (!preloaderDone || !introDone || !scopeRef.current) return;

    const scope = scopeRef.current;
    let isRunning = true;

    // Direct Pre-Hide for late sections on load to prevent flashes
    const s8TextElements = scope.querySelectorAll<HTMLElement>(".section-8 .reveal-text");
    s8TextElements.forEach(el => { el.style.opacity = "0"; });

    const s10TextElements = scope.querySelectorAll<HTMLElement>(
      ".section-10 .s10-title, .section-10 .s10-title-sub, .section-10 .s10-para-top, .section-10 .s10-content-wrap, .section-10 .reveal-text"
    );
    s10TextElements.forEach(el => { 
      el.style.opacity = "0"; 
      el.style.visibility = "hidden";
    });

    const s9TextElements = scope.querySelectorAll<HTMLElement>(
      ".s9-global-flight-container, .s9-para-desktop"
    );
    s9TextElements.forEach(el => { 
      el.style.opacity = "0"; 
      el.style.visibility = "hidden";
    });

    // Element Query Cache
    const heroEl = scope.querySelector<HTMLElement>(".hero");
    const heroBg = scope.querySelector<HTMLElement>(".hero-bg");
    const heroLeftInitial = scope.querySelector<HTMLElement>(".hero-left-initial");
    const heroRightText = scope.querySelector<HTMLElement>(".hero-right-text");
    const heroRightInners = scope.querySelectorAll<HTMLElement>(".hero-right-text .custom-line-inner");
    const heroSecWrap = scope.querySelector<HTMLElement>(".hero-secondary-text-wrap");
    const heroContactBtn = scope.querySelector<HTMLElement>(".hero-contact-btn");
    const heroScrollInd = scope.querySelector<HTMLElement>(".hero-scroll-indicator");

    const secTwo = scope.querySelector<HTMLElement>(".section-2");
    const s2TitleMain = scope.querySelector<HTMLElement>(".s2-title-main");
    const s2TitleSub = scope.querySelector<HTMLElement>(".s2-title-sub");
    const s2BodyText = scope.querySelector<HTMLElement>(".s2-body-text");
    const s2Frame1 = scope.querySelector<HTMLElement>(".s2-right-img-frame");
    const s2Frame2 = scope.querySelector<HTMLElement>(".s2-right-img-frame-under");
    const s2ScrollContent = scope.querySelector<HTMLElement>(".s2-scroll-content");

    const secEight = scope.querySelector<HTMLElement>(".section-8");
    const s8BgImg = scope.querySelector<HTMLElement>(".s8-bg-img");

    const secTen = scope.querySelector<HTMLElement>(".section-10");
    const s10BgImg = scope.querySelector<HTMLElement>(".s10-bg-img");
    const s10ContentWrap = scope.querySelector<HTMLElement>(".s10-content-wrap");

    const secSeven = scope.querySelector<HTMLElement>(".section-7");
    const s7BgImg = scope.querySelector<HTMLElement>(".s7-bg-img");

    const secAppSec = scope.querySelector<HTMLElement>(".section-appsec");
    const appSecBg = scope.querySelector<HTMLElement>(".appsec-bg");
    const appSecContent = scope.querySelector<HTMLElement>(".appsec-content");
    const appSecPhone = scope.querySelector<HTMLElement>(".appsec-phone-wrapper");

    const secNine = scope.querySelector<HTMLElement>(".section-9");
    const s9LeftSide = scope.querySelector<HTMLElement>(".s9-left-side");
    const s9RightSide = scope.querySelector<HTMLElement>(".s9-right-side");
    const s9BgLeft = scope.querySelector<HTMLElement>(".s9-bg-img-left");
    const s9BgRight = scope.querySelector<HTMLElement>(".s9-bg-img-right");
    const s9NativeTitle1 = scope.querySelector<HTMLElement>(".s9-native-title-wrapper-1");
    const s9NativeTitle2 = scope.querySelector<HTMLElement>(".s9-native-title-wrapper-2");
    const s9GlobalFlight = scope.querySelector<HTMLElement>(".s9-global-flight-container");
    const s9FlightWrapper = scope.querySelector<HTMLElement>(".s9-flight-wrapper");
    const s9ParaDesktop = scope.querySelector<HTMLElement>(".s9-para-desktop");

    const allS10TextNodes = scope.querySelectorAll<HTMLElement>(
      ".section-10 .s10-title, .section-10 .s10-title-sub, .section-10 .s10-para-top, .section-10 .reveal-text, .section-10 .gs-line-inner, .section-10 .custom-line-inner"
    );

    // Promote elements to hardware layers
    [s2Frame1, s2Frame2, s2ScrollContent, s9LeftSide, s9RightSide, s9BgLeft, s9BgRight, s9FlightWrapper, appSecBg].forEach(el => {
      if (el) {
        el.style.willChange = "transform, opacity, clip-path";
        el.style.transform = "translate3d(0, 0, 0)";
      }
    });

    const ctaInner = scope.querySelector<HTMLElement>(".section-cta .cta-inner-desktop");

    const renderTransforms = () => {
      if (!isRunning) return;

      // UNIFORM LERP MATCHING LENIS / SMOOTHSCROLL ENGINE (0.075)
      const diff = targetProgress.current - currentProgressRef.current;
      currentProgressRef.current += diff * 0.075;

      const stepProgress = currentProgressRef.current * (TOTAL_SCROLL_STEPS - 1);
      const { ctaHeight, footerHeight, vh } = dimensionsRef.current;

      // ── 1. HERO PHASE 1 & 2 (STEPS 0 -> 2.5) ──
      const heroPhase1 = easeOutQuad(Math.min(Math.max(stepProgress / 1.2, 0), 1));
      if (heroBg) {
        const bgScale = (1.0 + heroPhase1 * 0.15 + easeOutQuad(Math.min(Math.max((stepProgress - 1.2) / 1.3, 0), 1)) * 0.15).toFixed(4);
        heroBg.style.transform = `translate3d(0,0,0) scale3d(${bgScale}, ${bgScale}, 1)`;
      }

      if (heroLeftInitial) {
        heroLeftInitial.style.transform = `translate3d(0, ${-heroPhase1 * 100}vh, 0)`;
      }

      if (heroRightText) {
        heroRightText.style.visibility = stepProgress >= 0.1 && stepProgress < 1.4 ? "visible" : "hidden";
        heroRightText.style.opacity = stepProgress >= 0.1 && stepProgress < 1.4 ? "1" : "0";
      }

      if (heroRightInners) {
        const rTextInProg = easeOutQuad(Math.min(Math.max((stepProgress - 0.1) / 0.8, 0), 1));
        const rTextOutProg = easeOutQuad(Math.min(Math.max((stepProgress - 1.0) / 0.4, 0), 1));
        heroRightInners.forEach((inner, i) => {
          if (rTextOutProg > 0) {
            inner.style.opacity = `${1 - rTextOutProg}`;
            inner.style.transform = `translate3d(0, ${-rTextOutProg * 20}px, 0)`;
          } else {
            const indyProg = Math.min(Math.max((rTextInProg - i * 0.04) / 0.7, 0), 1);
            inner.style.opacity = `${indyProg}`;
            inner.style.transform = `translate3d(0, ${(1 - indyProg) * 100}%, 0)`;
          }
        });
      }

      // Hero Secondary Text
      const heroSecProg = easeOutQuad(Math.min(Math.max((stepProgress - 1.2) / 1.3, 0), 1));
      if (heroSecWrap) {
        heroSecWrap.style.visibility = stepProgress >= 1.2 && stepProgress < 3.2 ? "visible" : "hidden";
        heroSecWrap.style.opacity = stepProgress >= 1.2 && stepProgress < 3.2 ? "1" : "0";
        if (stepProgress < 2.5) {
          heroSecWrap.style.transform = `translate3d(0, ${-heroSecProg * 50}vh, 0)`;
        } else {
          const exitProg = easeOutQuad(Math.min(Math.max((stepProgress - 2.5) / 0.7, 0), 1));
          heroSecWrap.style.transform = `translate3d(0, ${-50 - exitProg * 60}vh, 0)`;
        }
      }

      const heroBtnProg = easeOutQuad(Math.min(Math.max((stepProgress - 2.0) / 0.5, 0), 1));
      if (heroContactBtn) heroContactBtn.style.opacity = `${1 - heroBtnProg}`;
      if (heroScrollInd) heroScrollInd.style.opacity = `${1 - heroBtnProg}`;

      if (heroEl) {
        if (stepProgress < 2.5) {
          heroEl.style.visibility = "visible";
          heroEl.style.zIndex = "115";
        } else if (stepProgress < 3.7) {
          heroEl.style.visibility = "visible";
          heroEl.style.zIndex = "80";
        } else {
          heroEl.style.visibility = "hidden";
        }
      }

      // ── 2. SECTION 2 ENTRANCE & INNER SEQUENCING (STEPS 2.5 -> 5.5) ──
      const s2ArriveProg = easeOutQuad(Math.min(Math.max((stepProgress - 2.5) / 1.2, 0), 1));
      if (secTwo) {
        secTwo.style.visibility = stepProgress >= 2.0 && stepProgress < 6.7 ? "visible" : "hidden";
        secTwo.style.transform = `translate3d(0, ${((1 - s2ArriveProg) * 100).toFixed(3)}%, 0)`;
      }

      // Inner animations wait until section 2 is fully revealed (step 3.7)
      const s2TextFadeProg = easeOutQuad(Math.min(Math.max((stepProgress - 3.7) / 0.5, 0), 1));
      [s2TitleMain, s2TitleSub, s2BodyText].forEach((el) => {
        if (el) {
          el.style.opacity = `${(1 - s2TextFadeProg).toFixed(3)}`;
          el.style.transform = `translate3d(0, ${(-s2TextFadeProg * 35).toFixed(2)}px, 0)`;
        }
      });

      const s2Frame1InProg = easeOutQuad(Math.min(Math.max((stepProgress - 4.1) / 0.9, 0), 1));
      const s2Frame1OutProg = easeOutQuad(Math.min(Math.max((stepProgress - 5.0) / 0.5, 0), 1));
      if (s2Frame1) {
        if (s2Frame1OutProg > 0) {
          s2Frame1.style.clipPath = `inset(0% 0% ${(s2Frame1OutProg * 100).toFixed(2)}% 0%)`;
        } else {
          s2Frame1.style.clipPath = `inset(${((1 - s2Frame1InProg) * 100).toFixed(2)}% 0% 0% 0%)`;
        }
      }

      const s2Frame2Prog = easeOutQuad(Math.min(Math.max((stepProgress - 4.9) / 0.6, 0), 1));
      if (s2Frame2) {
        s2Frame2.style.clipPath = `inset(${((1 - s2Frame2Prog) * 100).toFixed(2)}% 0% 0% 0%)`;
      }

      const s2ScrollInProg = easeOutQuad(Math.min(Math.max((stepProgress - 4.1) / 0.8, 0), 1));
      const s2ScrollPhase2 = easeOutQuad(Math.min(Math.max((stepProgress - 4.9) / 0.6, 0), 1));
      if (s2ScrollContent) {
        const yPercent = (1 - s2ScrollInProg) * 100 - s2ScrollPhase2 * 50;
        s2ScrollContent.style.transform = `translate3d(0, ${yPercent.toFixed(2)}%, 0)`;
        s2ScrollContent.style.opacity = "1";
      }

      // ── 3. SECTION 8 (STEPS 5.5 -> 7.0) ──
      const s8ArriveProg = easeOutQuad(Math.min(Math.max((stepProgress - 5.5) / 1.2, 0), 1));
      if (secEight) {
        secEight.style.visibility = stepProgress >= 5.2 && stepProgress < 8.2 ? "visible" : "hidden";
        secEight.style.transform = `translate3d(0, ${((1 - s8ArriveProg) * 100).toFixed(3)}%, 0)`;
      }
      if (s8BgImg) {
        s8BgImg.style.transform = `translate3d(0, ${(1 - s8ArriveProg) * 20}%, 0)`;
      }
      triggerPlayOnceTextReveal(".section-8", stepProgress, 5.8);

      // ── 4. SECTION 10 ──
      const s10ArriveProg = easeOutQuad(Math.min(Math.max((stepProgress - 7.0) / 1.2, 0), 1));
      if (secTen) {
        secTen.style.visibility = stepProgress >= 7.0 && stepProgress < 10.7 ? "visible" : "hidden";
        secTen.style.transform = `translate3d(0, ${((1 - s10ArriveProg) * 100).toFixed(3)}%, 0)`;
      }

      // Inner scroll content/text movements wait until step 8.2 (after full reveal)
      const s10ScrollProg = easeOutQuad(Math.min(Math.max((stepProgress - 8.2) / 1.2, 0), 1));

      allS10TextNodes.forEach((el) => {
        if (stepProgress >= 7.0 && stepProgress < 10.7) {
          el.style.setProperty("opacity", "1", "important");
          el.style.setProperty("visibility", "visible", "important");
        } else {
          el.style.setProperty("opacity", "0", "important");
          el.style.setProperty("visibility", "hidden", "important");
        }
        el.style.transform = `translate3d(0, ${-s10ScrollProg * 100}vh, 0)`;
      });

      if (s10ContentWrap) {
        const cardY = (1 - s10ScrollProg) * 100;
        s10ContentWrap.style.transform = `translate3d(0, ${cardY}vh, 0)`;
        if (stepProgress >= 7.0 && stepProgress < 10.7) {
          s10ContentWrap.style.setProperty("opacity", "1", "important");
          s10ContentWrap.style.setProperty("visibility", "visible", "important");
        } else {
          s10ContentWrap.style.setProperty("opacity", "0", "important");
          s10ContentWrap.style.setProperty("visibility", "hidden", "important");
        }
      }

      if (s10BgImg) {
        const bgScale = (1.1 + s10ScrollProg * 0.1).toFixed(4);
        const bgParallaxY = -s10ScrollProg * 10;
        s10BgImg.style.transform = `translate3d(0, ${bgParallaxY}%, 0) scale3d(${bgScale}, ${bgScale}, 1)`;
      }

      // ── 5. SECTION 7 ──
      const s7ArriveProg = easeOutQuad(Math.min(Math.max((stepProgress - 9.5) / 1.2, 0), 1));
      if (secSeven) {
        secSeven.style.visibility = stepProgress >= 9.2 && stepProgress < 12.7 ? "visible" : "hidden";
        secSeven.style.transform = `translate3d(0, ${((1 - s7ArriveProg) * 100).toFixed(3)}%, 0)`;
      }

      if (s7BgImg) {
        const bgCounterY = -(1 - s7ArriveProg) * 100;
        s7BgImg.style.transform = `translate3d(0, ${bgCounterY}%, 0)`;
      }

      triggerPlayOnceTextReveal(".section-7", stepProgress, 9.8);

      // ── 6. APPSECTION ──
      const appSecArriveProg = easeOutQuad(Math.min(Math.max((stepProgress - 11.5) / 1.2, 0), 1));
      if (secAppSec) {
        secAppSec.style.visibility = stepProgress >= 11.2 && stepProgress < 14.7 ? "visible" : "hidden";
        secAppSec.style.transform = `translate3d(0, ${((1 - appSecArriveProg) * 100).toFixed(3)}%, 0)`;
      }
      if (appSecPhone) {
        const phoneProg = easeOutQuad(Math.min(Math.max((stepProgress - 11.6) / 0.8, 0), 1));
        appSecPhone.style.transform = `translate3d(0, ${(1 - phoneProg) * 40}%, 0)`;
      }
      triggerPlayOnceTextReveal(".section-appsec", stepProgress, 11.8);

      // ── 7. SECTION 9 & FLYING TEXT (STEPS 13.5 -> 15.7) ──
      // Section 9 arrival finishes at step 14.7 (13.5 + 1.2)
      const s9ArriveProg = easeOutQuad(Math.min(Math.max((stepProgress - 13.5) / 1.2, 0), 1));
      if (secNine) {
        secNine.style.visibility = stepProgress >= 13.2 ? "visible" : "hidden";
      }

      if (appSecContent) appSecContent.style.opacity = `${(1 - s9ArriveProg).toFixed(3)}`;
      if (appSecBg) {
        const scaleVal = (1.25 - s9ArriveProg * 0.25).toFixed(4);
        appSecBg.style.transform = `translate3d(0, ${(s9ArriveProg * 12).toFixed(2)}%, 0) scale3d(${scaleVal}, ${scaleVal}, 1)`;
      }

      if (s9LeftSide) s9LeftSide.style.transform = `translate3d(0, ${((1 - s9ArriveProg) * 100).toFixed(3)}%, 0)`;
      if (s9RightSide) s9RightSide.style.transform = `translate3d(0, ${(-(1 - s9ArriveProg) * 100).toFixed(3)}%, 0)`;

      const s9BgScale = (1.1 - s9ArriveProg * 0.1).toFixed(4);
      if (s9BgLeft) s9BgLeft.style.transform = `translate3d(0,0,0) scale3d(${s9BgScale}, ${s9BgScale}, 1)`;
      if (s9BgRight) s9BgRight.style.transform = `translate3d(0,0,0) scale3d(${s9BgScale}, ${s9BgScale}, 1)`;

      // Flight ONLY starts after Section 9 finishes its arrival transition (at step 14.7)
      const flyProg = Math.min(Math.max((stepProgress - 14.7) / 1.0, 0), 1);

      if (s9NativeTitle1) s9NativeTitle1.style.opacity = flyProg > 0 ? "0" : "1";
      if (s9NativeTitle2) s9NativeTitle2.style.opacity = flyProg > 0 ? "0" : "1";

      if (s9GlobalFlight) {
        s9GlobalFlight.style.visibility = flyProg > 0 ? "visible" : "hidden";
        s9GlobalFlight.style.opacity = flyProg > 0 ? "1" : "0";
      }

      if (s9FlightWrapper && flyProg > 0 && s9TargetRectRef.current) {
        const { deltaX, deltaY } = s9TargetRectRef.current;
        s9FlightWrapper.style.transform = `translate3d(${(deltaX * flyProg).toFixed(2)}px, ${(deltaY * flyProg).toFixed(2)}px, 0)`;
      }

      if (s9ParaDesktop) {
        const paraProg = easeOutQuad(Math.min(Math.max((stepProgress - 14.7) / 1.0, 0), 1));
        if (stepProgress >= 14.7) {
          s9ParaDesktop.style.visibility = "visible";
          s9ParaDesktop.style.opacity = `${paraProg.toFixed(3)}`;
          s9ParaDesktop.style.transform = `translate3d(0, ${((1 - paraProg) * 20).toFixed(2)}px, 0)`;
        } else {
          s9ParaDesktop.style.visibility = "hidden";
          s9ParaDesktop.style.opacity = "0";
        }
      }

      // ── 8. CTA REVEAL ──
      const ctaArriveProg = easeOutQuad(Math.min(Math.max((stepProgress - 15.7) / 0.8, 0), 1));
      if (layerCTA.current) {
        const startY = vh;
        const endY = -(ctaHeight - vh);
        const currentY = startY + (endY - startY) * ctaArriveProg;
        layerCTA.current.style.visibility = stepProgress >= 15.5 ? "visible" : "hidden";
        layerCTA.current.style.transform = `translate3d(0, ${currentY.toFixed(2)}px, 0)`;
      }

      if (ctaInner) {
        ctaInner.style.opacity = "1";
        ctaInner.style.transform = "translate3d(0, 0px, 0)";
      }

      // ── 9. FOOTER REVEAL ──
      const footerArriveProg = easeOutQuad(Math.min(Math.max((stepProgress - 16.5) / 0.5, 0), 1));
      if (layerFooter.current) {
        const startY = vh;
        const endY = vh - footerHeight;
        const translateY = startY + (endY - startY) * footerArriveProg;
        layerFooter.current.style.visibility = stepProgress >= 16.2 ? "visible" : "hidden";
        layerFooter.current.style.transform = `translate3d(0, ${translateY.toFixed(2)}px, 0)`;
      }

      rafId.current = requestAnimationFrame(renderTransforms);
    };

    const handleScroll = (e?: any) => {
      const scrollY = e?.scroll !== undefined ? e.scroll : window.scrollY;
      const { totalScrollable, trackTopOffset } = dimensionsRef.current;

      if (totalScrollable <= 0) return;

      const relativeScroll = scrollY - trackTopOffset;
      const trackBottom = relativeScroll + totalScrollable;

      if (fixedFrameRef.current) {
        if (relativeScroll >= 0 && trackBottom >= 0) {
          fixedFrameRef.current.style.position = "fixed";
          fixedFrameRef.current.style.top = "0px";
          fixedFrameRef.current.style.bottom = "auto";
        } else if (trackBottom < 0) {
          fixedFrameRef.current.style.position = "absolute";
          fixedFrameRef.current.style.top = "auto";
          fixedFrameRef.current.style.bottom = "0px";
        } else {
          fixedFrameRef.current.style.position = "absolute";
          fixedFrameRef.current.style.top = "0px";
          fixedFrameRef.current.style.bottom = "auto";
        }
      }

      targetProgress.current = Math.min(Math.max(relativeScroll / totalScrollable, 0), 1);
    };

    const lenis = smootherRef?.current;
    if (lenis && typeof lenis.on === "function") {
      lenis.on("scroll", handleScroll);
    } else {
      window.addEventListener("scroll", handleScroll, { passive: true });
    }

    handleScroll();
    rafId.current = requestAnimationFrame(renderTransforms);

    return () => {
      isRunning = false;
      if (rafId.current) cancelAnimationFrame(rafId.current);
      if (lenis && typeof lenis.off === "function") {
        lenis.off("scroll", handleScroll);
      } else {
        window.removeEventListener("scroll", handleScroll);
      }
    };
  }, [preloaderDone, introDone, smootherRef, triggerPlayOnceTextReveal]);

  return (
    <div ref={scopeRef} className="home-desktop-scope w-full bg-black opacity-100 visible">
      <style jsx global>{`
        .section-10 .s10-title,
        .section-10 .s10-title-sub,
        .section-10 .s10-para-top,
        .section-10 .s10-content-wrap,
        .section-10 .reveal-text,
        .section-8 .reveal-text,
        .s9-global-flight-container,
        .s9-para-desktop {
          opacity: 0;
          visibility: hidden;
        }

        .s2-right-img-frame,
        .s2-right-img-frame-under,
        .s9-left-side,
        .s9-right-side,
        .s9-bg-img-left,
        .s9-bg-img-right,
        .s9-flight-wrapper {
          will-change: transform, opacity, clip-path;
          transform: translate3d(0, 0, 0);
        }
      `}</style>

      <div
        ref={trackRef}
        className="home-track-container relative w-full"
        style={{ height: `${TOTAL_SCROLL_STEPS * 100}vh` }}
      >
        <div
          ref={fixedFrameRef}
          className="pin-all fixed top-0 left-0 h-[100svh] w-full overflow-hidden bg-black z-10 transform-gpu"
        >
          <div className="hero absolute inset-0 h-full w-full structural-layer will-change-transform transform-gpu z-[115]">
            <Hero />
          </div>

          <div 
            className="section-2 absolute inset-0 h-full w-full structural-layer will-change-transform transform-gpu z-[95]"
            style={{ visibility: "hidden" }}
          >
            <SectionTwo />
          </div>

          <div 
            className="section-8 absolute inset-0 h-full w-full structural-layer will-change-transform transform-gpu z-[99]"
            style={{ visibility: "hidden" }}
          >
            <SectionEight preloaderDone={preloaderDone} />
          </div>

          <div 
            className="section-10 absolute inset-0 h-full w-full structural-layer will-change-transform transform-gpu z-[100]"
            style={{ visibility: "hidden" }}
          >
            <SectionTen />
          </div>

          <div 
            className="section-7 absolute inset-0 h-full w-full structural-layer will-change-transform transform-gpu z-[105]"
            style={{ visibility: "hidden" }}
          >
            <SectionSeven />
          </div>

          <div 
            className="section-appsec absolute inset-0 h-full w-full structural-layer will-change-transform transform-gpu z-[110]"
            style={{ visibility: "hidden" }}
          >
            <Appsection />
          </div>

          <div 
            className="section-9 absolute inset-0 h-full w-full structural-layer will-change-transform transform-gpu z-[115]"
            style={{ visibility: "hidden" }}
          >
            <SectionNine />
          </div>

          <div
            ref={layerCTA}
            className="section-cta absolute left-0 top-0 w-full z-[120] will-change-transform transform-gpu"
            style={{ transform: "translate3d(0, 100vh, 0)", visibility: "hidden" }}
          >
            <SectionCTA preloaderDone={preloaderDone} />
          </div>

          <div
            ref={layerFooter}
            className="footer absolute left-0 top-0 w-full z-[125] will-change-transform transform-gpu"
            style={{ transform: "translate3d(0, 100vh, 0)", visibility: "hidden" }}
          >
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}