"use client";

import { useRef, useEffect, useLayoutEffect, useCallback, useState } from "react";
import dynamic from "next/dynamic";
import Hero from "../components/Home/Hero";
import SectionTwo from "../components/Home/SectionTwo";
import Footer from "../components/Footer";
import { useSite } from "./context/SiteContext";
import { useHeroIntro } from "@/src/app/utils/useHeroIntro";
import { prefersReducedMotion, settleReducedMotion } from "../lib/reducedMotion";

const SectionSeven = dynamic(() => import("../components/Home/Sectionseven"), { ssr: false });
const SectionEight = dynamic(() => import("../components/Home/Sectioneight"), { ssr: false });
const SectionNine = dynamic(() => import("../components/Home/SectionNine"), { ssr: false });
const SectionTen = dynamic(() => import("../components/Home/SectionTen"), { ssr: false });
const SectionSix = dynamic(() => import("../components/Home/SectionSix"), { ssr: false });
const Appsection = dynamic(() => import("../components/Appsection"), { ssr: false });
const WhatAPoolCosts = dynamic(() => import("../components/Home/WhatAPoolCosts"), { ssr: false });
const SectionCTA = dynamic(() => import("@/src/components/SectionCTA"));

const clamp = (val: number, min = 0, max = 1) => Math.min(Math.max(val, min), max);

// Timeline (1 step ~ 1 viewport of scroll):
//  0-1  Hero            1-2  Section 2 slides up      2-4  Section 2 inner
//  4-5  Section 8       5-6  Section 10               6-7  Section 6 (Projects)
//  7-8  Section 7       8-9  App section (tall)       9-10 Pricing
//  10-11 Section 9
// Animation ends when Section Nine is fully in place (footer is no longer pinned)
const TOTAL_STEPS = 11.0;

// Step numbers for each layer's arrival
const S6_START = 6.0;
const S7_START = 7.0;
const APP_START = 8.0;
const PRICING_START = 9.0;
const S9_START = 10.0;

// Extra pinned scroll at the end so the smoothed animation can finish
// BEFORE the pin releases and the CTA scrolls into view.
const HOLD_VH = 40;

function executeInlineSplitting(selector: string) {
  if (typeof document === "undefined") return;
  const element = document.querySelector(selector) as HTMLElement;
  if (!element || element.dataset.splitComplete === "true") return;

  const rawText = element.textContent || "";
  const linesArray = rawText.split("\n").map((line) => line.trim()).filter((line) => line.length > 0);

  element.innerHTML = "";
  linesArray.forEach((lineText) => {
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
  const scopeRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fixedFrameRef = useRef<HTMLDivElement>(null);
  const ctaWrapRef = useRef<HTMLDivElement>(null);

  const heroPanelRef = useRef<HTMLDivElement>(null);
  const sec2Ref = useRef<HTMLDivElement>(null);
  const sec8Ref = useRef<HTMLDivElement>(null);
  const sec10Ref = useRef<HTMLDivElement>(null);
  const sec6Ref = useRef<HTMLDivElement>(null);
  const sec7Ref = useRef<HTMLDivElement>(null);
  const appSecRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);
  const sec9Ref = useRef<HTMLDivElement>(null);

  const scrollMetricsRef = useRef({
    totalScrollable: 0,
    animScrollable: 0,
    vh: 0,
    trackTopOffset: 0,
    pricingHeight: 0,
  });
  const lastSizeRef = useRef({ width: 0, height: 0 });

  const currentProgress = useRef(0);
  const targetProgress = useRef(0);
  const rafId = useRef<number | null>(null);

  const domCache = useRef<Record<string, HTMLElement | NodeListOf<HTMLElement> | null>>({});

  const [metricsReady, setMetricsReady] = useState(false);

  const { smootherRef } = useSite();
  const { preloaderDone, shouldLoadRest } = useHeroIntro(scopeRef, {
    isMobile: true,
    introDurationMs: 0,
    unlockScrollEarlyMs: 0,
  });

  useEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  // 1. UNLOCK LENIS & INITIALIZE
  useEffect(() => {
    const lenis = smootherRef?.current;

    if (!preloaderDone || !shouldLoadRest) {
      if (lenis && typeof lenis.stop === "function") lenis.stop();
      targetProgress.current = 0;
      currentProgress.current = 0;
    } else {
      document.body.classList.remove("preloading");
      document.documentElement.classList.remove("preloading");

      if (lenis) {
        if (typeof lenis.resize === "function") lenis.resize();
        if (typeof lenis.start === "function") lenis.start();
      }

      requestAnimationFrame(() => {
        window.dispatchEvent(new Event("scroll"));
      });
    }
  }, [preloaderDone, shouldLoadRest, smootherRef]);

  // Must be a layout effect declared BEFORE the metrics layout effect, so the
  // split lines (.custom-line-inner) exist when updateMetrics caches them.
  useLayoutEffect(() => {
    if (!shouldLoadRest) return;
    executeInlineSplitting(".hero-left-initial h1");
    executeInlineSplitting(".hero-title");
    executeInlineSplitting(".hero-right-text");
    executeInlineSplitting(".hero-secondary-para");

    if (scopeRef.current) {
      const heroRightWrap = scopeRef.current.querySelector(".hero-right-text-wrap") as HTMLElement;
      const heroSecWrap = scopeRef.current.querySelector(".hero-secondary-text-wrap") as HTMLElement;

      if (heroRightWrap) {
        heroRightWrap.style.visibility = "hidden";
        heroRightWrap.style.opacity = "0";
      }
      if (heroSecWrap) {
        heroSecWrap.style.visibility = "hidden";
        heroSecWrap.style.opacity = "0";
      }
    }
  }, [shouldLoadRest]);

  // 2. CACHE METRICS & DYNAMIC HEIGHT CALCULATION
  const updateMetrics = useCallback(() => {
    if (!trackRef.current) return;

    const vh = window.innerHeight;
    const vw = window.innerWidth;

    const appHeight = appSecRef.current?.offsetHeight || vh;
    // Pricing is at least one viewport; if its content is taller it scrolls through
    const pricingHeight = Math.max(vh, pricingRef.current?.offsetHeight || vh);

    // 8.8 viewports for the fixed-height steps (hero, S2, S8, S10, S6, S7, S9),
    // plus the tall App section and Pricing, plus the end hold.
    // Track height is left as authored under reduced motion: the pinned frame
    // positions its children absolutely, so collapsing the track to natural
    // height collapses the frame too and takes the content with it. Only the
    // animation is removed, not the layout.
    const totalTrackHeight = vh * 8.8 + appHeight + pricingHeight + (HOLD_VH / 100) * vh;

    trackRef.current.style.height = `${totalTrackHeight}px`;
    // Placeholder min-height is only needed before the real height is known
    trackRef.current.style.minHeight = "0px";

    const rect = trackRef.current.getBoundingClientRect();
    const totalScrollable = Math.max(0, totalTrackHeight - vh);

    scrollMetricsRef.current = {
      totalScrollable,
      // Scroll distance that drives the animation; the remainder is the hold
      animScrollable: Math.max(1, totalScrollable - (HOLD_VH / 100) * vh),
      vh,
      trackTopOffset: window.scrollY + rect.top,
      pricingHeight,
    };

    lastSizeRef.current = { width: vw, height: vh };

    if (scopeRef.current) {
      domCache.current = {
        heroBg: scopeRef.current.querySelector(".hero-bg") as HTMLElement,
        progressFill: scopeRef.current.querySelector(".hero-progress-bar-fill") as HTMLElement,
        heroLeftInitial: scopeRef.current.querySelector(".hero-left-initial") as HTMLElement,
        heroTitleInners: scopeRef.current.querySelectorAll<HTMLElement>(
          ".hero-left-initial h1 .custom-line-inner, .hero-title .custom-line-inner"
        ),
        heroRightWrap: scopeRef.current.querySelector(".hero-right-text-wrap") as HTMLElement,
        heroRightInners: scopeRef.current.querySelectorAll<HTMLElement>(".hero-right-text .custom-line-inner"),
        heroSecWrap: scopeRef.current.querySelector(".hero-secondary-text-wrap") as HTMLElement,
        heroSecInners: scopeRef.current.querySelectorAll<HTMLElement>(".hero-secondary-para .custom-line-inner"),
        s2Titles: scopeRef.current.querySelectorAll<HTMLElement>(".s2-title-main, .s2-title-sub, .s2-body"),
        s2ScrollWrap: scopeRef.current.querySelector(".s2-mob-scroll-wrapper") as HTMLElement,
        s2Clip1: scopeRef.current.querySelector(".s2-mob-clip-bg-1") as HTMLElement,
        s2Clip2: scopeRef.current.querySelector(".s2-mob-clip-bg-2") as HTMLElement,
        s2Clip3: scopeRef.current.querySelector(".s2-mob-clip-bg-3") as HTMLElement,
        s8BgImg: scopeRef.current.querySelector(".s8-bg-img") as HTMLElement,
        s8MobBg: scopeRef.current.querySelector(".s8-mob-bg") as HTMLElement,
        s10HeaderEls: scopeRef.current.querySelectorAll<HTMLElement>(".s10-title, .s10-title-sub, .s10-para-top"),
        s10ScrollContainer: scopeRef.current.querySelector(".s10-scrollable-container") as HTMLElement,
        s7BgImg: scopeRef.current.querySelector(".s7-bg-img") as HTMLElement,
        s7MobBg: scopeRef.current.querySelector(".s7-mob-bg") as HTMLElement,
        s9BgImg: scopeRef.current.querySelector(".s9-bg-img") as HTMLElement,
      };
    }
  }, []);

  const handleResize = useCallback(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const { width, height } = lastSizeRef.current;

    const isLikelyAddressBarToggle = vw === width && Math.abs(vh - height) < 150;
    if (isLikelyAddressBarToggle) return;

    updateMetrics();
  }, [updateMetrics]);

  // Runs before paint so the track has its real height on the first visible frame
  useLayoutEffect(() => {
    if (!shouldLoadRest) return;

    updateMetrics();
    setMetricsReady(true);

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("orientationchange", updateMetrics, { passive: true });

    // The App section and Pricing are dynamically imported (ssr: false), so
    // their real heights arrive after mount. Re-measure when they change so the
    // track is always long enough to scroll through them.
    let ro: ResizeObserver | null = null;
    let roRaf: number | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => {
        if (roRaf) cancelAnimationFrame(roRaf);
        roRaf = requestAnimationFrame(updateMetrics);
      });
      if (appSecRef.current) ro.observe(appSecRef.current);
      if (pricingRef.current) ro.observe(pricingRef.current);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", updateMetrics);
      if (roRaf) cancelAnimationFrame(roRaf);
      if (ro) ro.disconnect();
    };
  }, [shouldLoadRest, updateMetrics, handleResize]);

  // 3. CONTINUOUS ANIMATION LOOP WITH VELOCITY CAPPING
  useEffect(() => {
    if (!shouldLoadRest) return;

    let isRunning = true;
    const isAndroid = typeof navigator !== "undefined" && /android/i.test(navigator.userAgent);
    const EASE_FACTOR = isAndroid ? 0.06 : 0.06;
    // Scaled so smoothing speed in steps/frame matches the old 9-step timeline
    const MAX_PROGRESS_DELTA_PER_FRAME = (0.006 * 9) / TOTAL_STEPS;

    // Reduced motion: skip the pinned scroll-scrub entirely and leave content
    // in its settled, visible state. Without this the rAF loop below would keep
    // writing transforms and the CSS media query would have no effect on it.
    if (prefersReducedMotion()) {
      isRunning = false;
      settleReducedMotion(scopeRef.current);
      return;
    }

    let lastTime = performance.now();

    const render = () => {
      if (!isRunning) return;

      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const dynamicEase = 1 - Math.exp(-EASE_FACTOR * 60 * dt);

      let delta = (targetProgress.current - currentProgress.current) * dynamicEase;

      if (Math.abs(delta) > MAX_PROGRESS_DELTA_PER_FRAME) {
        delta = Math.sign(delta) * MAX_PROGRESS_DELTA_PER_FRAME;
      }

      currentProgress.current += delta;

      const p = currentProgress.current;
      const stepProgress = p * TOTAL_STEPS;
      const { vh, pricingHeight } = scrollMetricsRef.current;
      const cache = domCache.current;

      // ── Step 0 -> 1: HERO ANIMATIONS ──
      const heroProg = clamp(stepProgress);
      const progressFill = cache.progressFill as HTMLElement;
      const heroBg = cache.heroBg as HTMLElement;
      const heroLeftInitial = cache.heroLeftInitial as HTMLElement;
      const heroTitleInners = cache.heroTitleInners as NodeListOf<HTMLElement>;
      const heroRightWrap = cache.heroRightWrap as HTMLElement;
      const heroRightInners = cache.heroRightInners as NodeListOf<HTMLElement>;
      const heroSecWrap = cache.heroSecWrap as HTMLElement;
      const heroSecInners = cache.heroSecInners as NodeListOf<HTMLElement>;

      if (heroBg) heroBg.style.transform = `scale(${1.0 + heroProg * 0.08})`;
      if (progressFill) progressFill.style.transform = `scaleY(${heroProg})`;

      const titleFade = clamp(heroProg / 0.4);

      if (heroLeftInitial) {
        heroLeftInitial.style.opacity = `${(1 - titleFade).toFixed(2)}`;
        heroLeftInitial.style.transform = `translate3d(0, ${-20 * titleFade}px, 0)`;
        heroLeftInitial.style.visibility = heroProg >= 0.4 ? "hidden" : "visible";
      }

      if (heroTitleInners) {
        heroTitleInners.forEach((el) => {
          el.style.opacity = `${(1 - titleFade).toFixed(2)}`;
          el.style.transform = `translate3d(0, ${-20 * titleFade}px, 0)`;
        });
      }

      const rightIn = clamp((heroProg - 0.2) / 0.4);
      const rightOut = clamp((heroProg - 0.6) / 0.4);

      if (heroRightWrap) {
        heroRightWrap.style.visibility = heroProg >= 0.2 && heroProg < 0.8 ? "visible" : "hidden";
        heroRightWrap.style.opacity = `${(rightIn * (1 - rightOut)).toFixed(2)}`;
      }

      if (heroRightInners) {
        heroRightInners.forEach((el) => {
          el.style.opacity = `${(rightIn * (1 - rightOut)).toFixed(2)}`;
          el.style.transform = `translate3d(0, ${(1 - rightIn) * 40 - rightOut * 20}px, 0)`;
        });
      }

      const secIn = clamp((heroProg - 0.6) / 0.4);
      if (heroSecWrap) {
        heroSecWrap.style.visibility = secIn > 0 ? "visible" : "hidden";
        heroSecWrap.style.opacity = `${secIn.toFixed(2)}`;
      }
      if (heroSecInners) {
        heroSecInners.forEach((el) => {
          el.style.opacity = `${secIn.toFixed(2)}`;
          el.style.transform = `translate3d(0, ${(1 - secIn) * 100}%, 0)`;
        });
      }

      // ── Step 1 -> 2: SECTION TWO SLIDES UP ──
      const s2Prog = clamp(stepProgress - 1.0);
      if (sec2Ref.current) {
        sec2Ref.current.style.transform = `translate3d(0, ${(1 - s2Prog) * 100}%, 0)`;
        sec2Ref.current.style.opacity = `${s2Prog > 0 ? 1 : 0}`;
        sec2Ref.current.style.visibility = s2Prog > 0 ? "visible" : "hidden";
      }
      if (heroPanelRef.current && s2Prog > 0) heroPanelRef.current.style.transform = `translate3d(0, ${-s2Prog * 15}%, 0)`;

      // ── Step 2 -> 4.0: SECTION TWO INNER ANIMATIONS & BACKGROUND CLIPS ──
      const s2InnerProg = clamp((stepProgress - 2.0) / 2.0);
      const s2Titles = cache.s2Titles as NodeListOf<HTMLElement>;
      const s2ScrollWrap = cache.s2ScrollWrap as HTMLElement;
      let s2Clip1 = cache.s2Clip1 as HTMLElement;
      let s2Clip2 = cache.s2Clip2 as HTMLElement;
      let s2Clip3 = cache.s2Clip3 as HTMLElement;

      if (!s2Clip1 && sec2Ref.current) cache.s2Clip1 = s2Clip1 = sec2Ref.current.querySelector(".s2-mob-clip-bg-1") as HTMLElement;
      if (!s2Clip2 && sec2Ref.current) cache.s2Clip2 = s2Clip2 = sec2Ref.current.querySelector(".s2-mob-clip-bg-2") as HTMLElement;
      if (!s2Clip3 && sec2Ref.current) cache.s2Clip3 = s2Clip3 = sec2Ref.current.querySelector(".s2-mob-clip-bg-3") as HTMLElement;

      const titleFadeOut = clamp(s2InnerProg / 0.15);
      if (s2Titles) {
        s2Titles.forEach((el) => {
          el.style.opacity = `${(1 - titleFadeOut).toFixed(2)}`;
          el.style.transform = `translate3d(0, ${-30 * titleFadeOut}px, 0)`;
        });
      }

      const scrollInProg = clamp((s2InnerProg - 0.10) / 0.90);
      if (s2ScrollWrap) {
        s2ScrollWrap.style.opacity = `${Math.min(1, scrollInProg * 2.5).toFixed(2)}`;
        s2ScrollWrap.style.transform = `translate3d(0, ${80 - s2InnerProg * 160}%, 0)`;
        s2ScrollWrap.style.pointerEvents = scrollInProg > 0.1 ? "auto" : "none";
      }

      // Smooth Dynamic Clip-Path Revelations
      const clip1Prog = clamp((s2InnerProg - 0.15) / 0.25);
      if (s2Clip1) {
        const insetBottom = (100 - clip1Prog * 100).toFixed(2);
        s2Clip1.style.clipPath = `inset(0% 0% ${insetBottom}% 0%)`;
      }

      const clip2Prog = clamp((s2InnerProg - 0.45) / 0.25);
      if (s2Clip2) {
        const insetBottom = (100 - clip2Prog * 100).toFixed(2);
        s2Clip2.style.clipPath = `inset(0% 0% ${insetBottom}% 0%)`;
      }

      const clip3Prog = clamp((s2InnerProg - 0.75) / 0.25);
      if (s2Clip3) {
        const insetBottom = (100 - clip3Prog * 100).toFixed(2);
        s2Clip3.style.clipPath = `inset(0% 0% ${insetBottom}% 0%)`;
      }

      // ── Step 4.0 -> 5.0: SECTION EIGHT ──
      const s8Prog = clamp(stepProgress - 4.0);
      if (sec8Ref.current) {
        sec8Ref.current.style.transform = `translate3d(0, ${(1 - s8Prog) * 100}%, 0)`;
        sec8Ref.current.style.opacity = `${s8Prog > 0 ? 1 : 0}`;
        sec8Ref.current.style.visibility = s8Prog > 0 ? "visible" : "hidden";
      }

      if (sec2Ref.current && s8Prog > 0) {
        sec2Ref.current.style.transform = `translate3d(0, ${-s8Prog * 15}%, 0)`;
      }

      const s8BgImg = cache.s8BgImg as HTMLElement;
      const s8MobBg = cache.s8MobBg as HTMLElement;
      if (s8BgImg) s8BgImg.style.transform = `translate3d(0, ${(1 - s8Prog) * 20}%, 0)`;
      if (s8MobBg) s8MobBg.style.transform = `scale(${1.35 - s8Prog * 0.35})`;

      // ── Step 5.0 -> 6.0: SECTION TEN ──
      let s10HeaderEls = cache.s10HeaderEls as NodeListOf<HTMLElement>;
      let s10ScrollContainer = cache.s10ScrollContainer as HTMLElement;

      if ((!s10HeaderEls || s10HeaderEls.length === 0) && sec10Ref.current) {
        s10HeaderEls = sec10Ref.current.querySelectorAll<HTMLElement>(".s10-title, .s10-title-sub, .s10-para-top");
        cache.s10HeaderEls = s10HeaderEls;
      }
      if (!s10ScrollContainer && sec10Ref.current) {
        s10ScrollContainer = sec10Ref.current.querySelector(".s10-scrollable-container") as HTMLElement;
        cache.s10ScrollContainer = s10ScrollContainer;
      }

      const s10SlideProg = clamp((stepProgress - 5.0) / 0.5);

      if (sec10Ref.current) {
        sec10Ref.current.style.transform = `translate3d(0, ${(1 - s10SlideProg) * 100}%, 0)`;
        sec10Ref.current.style.opacity = `${s10SlideProg > 0 ? 1 : 0}`;
        sec10Ref.current.style.visibility = s10SlideProg > 0 ? "visible" : "hidden";
      }

      if (sec8Ref.current && s10SlideProg > 0) {
        sec8Ref.current.style.transform = `translate3d(0, ${-s10SlideProg * 15}%, 0)`;
      }

      const s10InnerProg = clamp((stepProgress - 5.4) / 0.6);

      if (s10HeaderEls) {
        s10HeaderEls.forEach((el) => {
          el.style.transform = `translate3d(0, ${-300 * s10InnerProg}px, 0)`;
        });
      }

      if (s10ScrollContainer) {
        const containerY = 100 - s10InnerProg * 320;
        s10ScrollContainer.style.transform = `translate3d(0, ${containerY}%, 0)`;
      }

      // ── Step 6.0 -> 7.0: SECTION SIX (PROJECTS) ──
      const s6Prog = clamp(stepProgress - S6_START);

      if (sec6Ref.current) {
        sec6Ref.current.style.transform = `translate3d(0, ${(1 - s6Prog) * 100}%, 0)`;
        sec6Ref.current.style.opacity = `${s6Prog > 0 ? 1 : 0}`;
        sec6Ref.current.style.visibility = s6Prog > 0 ? "visible" : "hidden";
      }

      if (sec10Ref.current && s6Prog > 0) {
        sec10Ref.current.style.transform = `translate3d(0, ${-s6Prog * 15}%, 0)`;
      }

      // ── Step 7.0 -> 8.0: SECTION SEVEN ──
      const s7Prog = clamp(stepProgress - S7_START);

      if (sec7Ref.current) {
        sec7Ref.current.style.transform = `translate3d(0, ${(1 - s7Prog) * 100}%, 0)`;
        sec7Ref.current.style.opacity = `${s7Prog > 0 ? 1 : 0}`;
        sec7Ref.current.style.visibility = s7Prog > 0 ? "visible" : "hidden";
      }

      if (sec6Ref.current && s7Prog > 0) {
        sec6Ref.current.style.transform = `translate3d(0, ${-s7Prog * 15}%, 0)`;
      }

      let s7BgImg = cache.s7BgImg as HTMLElement;
      let s7MobBg = cache.s7MobBg as HTMLElement;
      if (!s7BgImg && sec7Ref.current) cache.s7BgImg = s7BgImg = sec7Ref.current.querySelector(".s7-bg-img") as HTMLElement;
      if (!s7MobBg && sec7Ref.current) cache.s7MobBg = s7MobBg = sec7Ref.current.querySelector(".s7-mob-bg") as HTMLElement;

      if (s7BgImg) s7BgImg.style.transform = `translate3d(0, ${(1 - s7Prog) * 20}%, 0)`;
      if (s7MobBg) s7MobBg.style.transform = `scale(${1.35 - s7Prog * 0.35})`;

      // ── Step 8.0 -> 9.0: APP SECTION ──
      const appProg = clamp(stepProgress - APP_START);

      if (appSecRef.current) {
        const appHeight = appSecRef.current.offsetHeight || vh;
        const startY = vh;
        const endY = -(appHeight - vh);
        const currentY = startY + (endY - startY) * appProg;
        appSecRef.current.style.transform = `translate3d(0, ${currentY}px, 0)`;
        appSecRef.current.style.opacity = `${appProg > 0 ? 1 : 0}`;
        appSecRef.current.style.visibility = appProg > 0 ? "visible" : "hidden";
      }

      if (sec7Ref.current && appProg > 0) {
        sec7Ref.current.style.transform = `translate3d(0, ${-appProg * 15}%, 0)`;
      }

      // ── Step 9.0 -> 10.0: PRICING (slides up over App, scrolls if taller than screen) ──
      const pricingProg = clamp(stepProgress - PRICING_START);

      if (pricingRef.current) {
        const h = pricingHeight || vh;
        const startY = vh;
        const endY = -Math.max(0, h - vh);
        const currentY = startY + (endY - startY) * pricingProg;
        pricingRef.current.style.transform = `translate3d(0, ${currentY}px, 0)`;
        pricingRef.current.style.opacity = `${pricingProg > 0 ? 1 : 0}`;
        pricingRef.current.style.visibility = pricingProg > 0 ? "visible" : "hidden";
      }

      // ── Step 10.0 -> 11.0: SECTION NINE ──
      const s9Prog = clamp(stepProgress - S9_START);

      if (sec9Ref.current) {
        sec9Ref.current.style.transform = `translate3d(0, ${(1 - s9Prog) * 100}%, 0)`;
        sec9Ref.current.style.opacity = `${s9Prog > 0 ? 1 : 0}`;
        sec9Ref.current.style.visibility = s9Prog > 0 ? "visible" : "hidden";
      }

      let s9BgImg = cache.s9BgImg as HTMLElement;
      if (!s9BgImg && sec9Ref.current) cache.s9BgImg = s9BgImg = sec9Ref.current.querySelector(".s9-bg-img") as HTMLElement;
      if (s9BgImg) {
        s9BgImg.style.transform = `scale(${1.35 - s9Prog * 0.35}) translate3d(0, ${(1 - s9Prog) * 20}%, 0)`;
      }

      // Footer reveal removed: CTA + Footer now scroll in normal document flow.

      rafId.current = requestAnimationFrame(render);
    };

    const handleScroll = (e?: any) => {
      const lenis = smootherRef?.current;
      const scrollY = e?.scroll ?? lenis?.scroll ?? window.scrollY;
      const { totalScrollable, animScrollable, trackTopOffset } = scrollMetricsRef.current;

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

      // Animation completes after animScrollable; the remaining HOLD_VH is a hold
      // so the smoothed animation catches up before the pin releases.
      targetProgress.current = clamp(relativeScroll / animScrollable);

      // Keep CTA + Footer hidden until the user is near the end of the pinned track
      if (ctaWrapRef.current) {
        const nearEnd = relativeScroll > totalScrollable - scrollMetricsRef.current.vh * 1.5;
        ctaWrapRef.current.style.visibility = nearEnd ? "visible" : "hidden";
      }
    };

    const lenis = smootherRef?.current;
    if (lenis && typeof lenis.on === "function") {
      lenis.on("scroll", handleScroll);
    } else {
      window.addEventListener("scroll", handleScroll, { passive: true });
    }

    handleScroll();
    rafId.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (rafId.current) cancelAnimationFrame(rafId.current);
      if (lenis && typeof lenis.off === "function") {
        lenis.off("scroll", handleScroll);
      } else {
        window.removeEventListener("scroll", handleScroll);
      }
    };
    // metricsReady is a dependency so handleScroll() re-runs once the CTA wrapper exists
  }, [shouldLoadRest, smootherRef, metricsReady]);

  const isReady = preloaderDone;

  return (
    <div ref={scopeRef} className="relative w-full bg-black text-white">
      <style jsx global>{`
        .about-stack-layer {
          visibility: hidden;
        }
        .hero-right-text:not([data-split-complete="true"]),
        .hero-secondary-para:not([data-split-complete="true"]),
        .hero-right-text-wrap,
        .hero-secondary-text-wrap {
          opacity: 0;
          visibility: hidden;
        }
        .hero-right-text .custom-line-inner,
        .hero-secondary-para .custom-line-inner {
          opacity: 0;
          transform: translate3d(0, 100%, 0);
        }
      `}</style>

      {/* VIRTUAL PINNED TRACK: animation length + short hold at the end */}
      <div
        ref={trackRef}
        className="home-track-container relative w-full"
        style={{ minHeight: "1200svh" }}
      >
        <div
          ref={fixedFrameRef}
          className="fixed top-0 left-0 w-full overflow-hidden bg-black z-10 h-svh"
        >
          {/* Layer 1: Hero Component */}
          <div
            ref={heroPanelRef}
            className="hero absolute inset-0 w-full h-svh z-10 transform-gpu will-change-transform backface-hidden"
          >
            <Hero />
          </div>

          {shouldLoadRest && (
            <>
              {/* Layer 2: Section Two */}
              <div
                ref={sec2Ref}
                className="section-2 about-stack-layer absolute inset-0 w-full h-svh z-20 transform-gpu will-change-transform backface-hidden"
                style={{ transform: "translate3d(0, 100%, 0)", opacity: 0, visibility: "hidden" }}
              >
                <SectionTwo />
              </div>

              {/* Layer 3: Section Eight */}
              <div
                ref={sec8Ref}
                className="section-8 about-stack-layer absolute inset-0 w-full h-svh z-30 transform-gpu will-change-transform backface-hidden"
                style={{ transform: "translate3d(0, 100%, 0)", opacity: 0, visibility: "hidden" }}
              >
                <SectionEight />
              </div>

              {/* Layer 4: Section Ten */}
              <div
                ref={sec10Ref}
                className="section-10 about-stack-layer absolute inset-0 w-full h-svh z-40 transform-gpu will-change-transform backface-hidden"
                style={{ transform: "translate3d(0, 100%, 0)", opacity: 0, visibility: "hidden" }}
              >
                <SectionTen />
              </div>

              {/* Layer 5: Section Six (Projects) */}
              <div
                ref={sec6Ref}
                className="section-six about-stack-layer absolute inset-0 w-full h-svh z-[45] overflow-hidden transform-gpu will-change-transform backface-hidden"
                style={{ transform: "translate3d(0, 100%, 0)", opacity: 0, visibility: "hidden" }}
              >
                <SectionSix />
              </div>

              {/* Layer 6: Section Seven */}
              <div
                ref={sec7Ref}
                className="section-7 about-stack-layer absolute inset-0 w-full h-svh z-50 transform-gpu will-change-transform backface-hidden"
                style={{ transform: "translate3d(0, 100%, 0)", opacity: 0, visibility: "hidden" }}
              >
                <SectionSeven />
              </div>

              {/* Layer 7: App Section */}
              <div
                ref={appSecRef}
                className="section-appsec layer-auto-height transform-gpu absolute left-0 top-0 w-full z-[60] will-change-transform backface-hidden"
                style={{ transform: "translate3d(0, 100svh, 0)", opacity: 0, visibility: "hidden" }}
              >
                <Appsection />
              </div>

              {/* Layer 8: Pricing (What a pool costs) */}
              <div
                ref={pricingRef}
                className="section-pricing layer-auto-height transform-gpu absolute left-0 top-0 w-full z-[65] bg-black will-change-transform backface-hidden"
                style={{
                  minHeight: "100svh",
                  transform: "translate3d(0, 100svh, 0)",
                  opacity: 0,
                  visibility: "hidden",
                }}
              >
                <WhatAPoolCosts />
              </div>

              {/* Layer 9: Section Nine */}
              <div
                ref={sec9Ref}
                className="section-9 about-stack-layer absolute inset-0 w-full h-svh z-[70] transform-gpu will-change-transform backface-hidden"
                style={{ transform: "translate3d(0, 100%, 0)", opacity: 0, visibility: "hidden" }}
              >
                <SectionNine />
              </div>
            </>
          )}
        </div>
      </div>

      {/* NATURAL DOCUMENT FLOW FOR CTA AND FOOTER */}
      {shouldLoadRest && metricsReady && (
        <div
          ref={ctaWrapRef}
          className="relative z-20 w-full bg-black"
          style={{ visibility: "hidden" }}
        >
          <SectionCTA />
          <Footer />
        </div>
      )}
    </div>
  );
}