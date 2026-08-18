"use client";

import React, { useRef, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { useSite } from "./context/SiteContext";
import { useHeroIntro } from "./utils/useHeroIntro";

import Hero from "../components/Home/Hero";
import SectionTwo from "../components/Home/SectionTwo";
import Footer from "../components/Footer";

const SectionCTA = dynamic(() => import("../components/SectionCTA"), { ssr: false });
const SectionSeven = dynamic(() => import("../components/Home/Sectionseven"), { ssr: false });
const SectionEight = dynamic(() => import("../components/Home/Sectioneight"), { ssr: false });
const SectionNine = dynamic(() => import("../components/Home/SectionNine"), { ssr: false });
const SectionTen = dynamic(() => import("../components/Home/SectionTen"), { ssr: false });
const Appsection = dynamic(() => import("../components/Appsection"), { ssr: false });

import { useTextReveal, restoreTextReveal } from "./utils/useTextReveal";

const TOTAL_SCROLL_STEPS = 16.8;

const easeOutQuad = (t: number) => t * (2 - t);
const clamp = (v: number, min = 0, max = 1) => Math.min(Math.max(v, min), max);

function executeDesktopSplitting(selector: string) {
  if (typeof document === "undefined") return;

  const element = document.querySelector(selector) as HTMLElement;
  if (!element || element.dataset.splitComplete === "true") return;

  const rawText = element.textContent || "";
  const linesArray = rawText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const fragment = document.createDocumentFragment();

  linesArray.forEach((lineText) => {
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

  const dimensionsRef = useRef({
    ctaHeight: 0,
    footerHeight: 0,
    vh: 0,
    vw: 0,
    trackTopOffset: 0,
    totalScrollable: 0,
  });

  const lastSizeRef = useRef({ width: 0, height: 0 });

  const s9TargetRectRef = useRef<{
    deltaX: number;
    deltaY: number;
  } | null>(null);

  const targetProgress = useRef(0);
  const smoothProgress = useRef(0);
  const rafId = useRef<number | null>(null);
  const revealedSections = useRef<Set<string>>(new Set());

  const context = useSite();
  const smootherRef = context?.smootherRef;

  const { introDone, preloaderDone } = useHeroIntro(scopeRef, {
    isMobile: false,
    introDurationMs: 0,
    unlockScrollEarlyMs: 0,
  });

  useEffect(() => {
    executeDesktopSplitting(".hero-title");
    executeDesktopSplitting(".hero-right-text");
    executeDesktopSplitting(".hero-secondary-para");

    const heroRightText = document.querySelector<HTMLElement>(".hero-right-text");

    if (heroRightText) {
      heroRightText.style.visibility = "hidden";
      heroRightText.style.opacity = "0";
    }

    const s9Flight = scopeRef.current?.querySelector<HTMLElement>(
      ".s9-global-flight-container"
    );

    if (s9Flight) {
      s9Flight.style.visibility = "hidden";
      s9Flight.style.opacity = "0";
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const lenis = smootherRef?.current;
    const isFullyReady = preloaderDone && introDone;

    if (!isFullyReady) {
      if (lenis && typeof lenis.stop === "function") lenis.stop();

      targetProgress.current = 0;
      smoothProgress.current = 0;
    } else {
      if (lenis) {
        if (typeof lenis.resize === "function") lenis.resize();
        if (typeof lenis.start === "function") lenis.start();
      }

      requestAnimationFrame(() => {
        window.dispatchEvent(new Event("scroll"));
      });
    }
  }, [preloaderDone, introDone, smootherRef]);

  const measure = useCallback(() => {
    if (!trackRef.current) return;

    const rect = trackRef.current.getBoundingClientRect();
    const vh = window.innerHeight;
    const vw = window.innerWidth;

    dimensionsRef.current = {
      ctaHeight: layerCTA.current?.offsetHeight || vh,
      footerHeight:
        layerFooter.current?.offsetHeight ||
        layerFooter.current?.scrollHeight ||
        vh,
      vh,
      vw,
      trackTopOffset: window.scrollY + rect.top,
      totalScrollable: rect.height - vh,
    };

    if (scopeRef.current) {
      const target = scopeRef.current.querySelector<HTMLElement>(
        ".s9-target-wrapper"
      );

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

    lastSizeRef.current = { width: vw, height: vh };
  }, []);

  const handleResize = useCallback(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const { width, height } = lastSizeRef.current;

    if (vw === width && Math.abs(vh - height) < 150) return;

    measure();
  }, [measure]);

  useEffect(() => {
    if (!preloaderDone || !introDone) return;

    measure();

    const resizeObserver = new ResizeObserver(() => measure());

    if (layerCTA.current) resizeObserver.observe(layerCTA.current);
    if (layerFooter.current) resizeObserver.observe(layerFooter.current);

    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [preloaderDone, introDone, measure, handleResize]);

  const triggerProgressTextReveal = useCallback(
    (
      containerSelector: string,
      currentStepProg: number,
      triggerThreshold: number
    ) => {
      if (!scopeRef.current) return;

      const key = containerSelector;

      if (revealedSections.current.has(key)) return;

      if (currentStepProg >= triggerThreshold) {
        revealedSections.current.add(key);

        const targetSection =
          scopeRef.current.querySelector<HTMLElement>(containerSelector);

        if (targetSection) {
          targetSection.classList.add("revealed");
        }

        const selectors = `${containerSelector} .gs-line-inner, ${containerSelector} .custom-line-inner, ${containerSelector} .reveal-text > *`;

        const elements =
          scopeRef.current.querySelectorAll<HTMLElement>(selectors);

        elements.forEach((el, idx) => {
          el.style.transition = `transform 0.85s cubic-bezier(0.16, 1, 0.3, 1) ${
            idx * 0.05
          }s, opacity 0.85s cubic-bezier(0.16, 1, 0.3, 1) ${
            idx * 0.05
          }s`;

          el.style.transform = "translate3d(0, 0px, 0)";
          el.style.opacity = "1";
        });
      }
    },
    []
  );

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
            ".s9-para-mobile",
          ].join(",")
        );
      }
    };
  }, [preloaderDone, introDone]);

  useEffect(() => {
    if (!preloaderDone || !introDone || !scopeRef.current) return;

    const scope = scopeRef.current;

    let isRunning = true;
    let lastTime = performance.now();

    const EASE_FACTOR = 0.15;
    const MAX_PROGRESS_DELTA_PER_FRAME = 0.008;

    const s8TextElements =
      scope.querySelectorAll<HTMLElement>(".section-8 .reveal-text");

    s8TextElements.forEach((el) => {
      el.style.opacity = "0";
    });

    const s10TextElements = scope.querySelectorAll<HTMLElement>(
      ".section-10 .s10-title, .section-10 .s10-title-sub, .section-10 .s10-para-top, .section-10 .s10-content-wrap, .section-10 .reveal-text"
    );

    s10TextElements.forEach((el) => {
      el.style.opacity = "0";
      el.style.visibility = "hidden";
    });

    const s9TextElements = scope.querySelectorAll<HTMLElement>(
      ".s9-global-flight-container, .s9-para-desktop"
    );

    s9TextElements.forEach((el) => {
      el.style.opacity = "0";
      el.style.visibility = "hidden";
    });

    const heroEl = scope.querySelector<HTMLElement>(".hero");
    const heroBg = scope.querySelector<HTMLElement>(".hero-bg");
    const heroLeftInitial = scope.querySelector<HTMLElement>(".hero-left-initial");
    const heroRightText = scope.querySelector<HTMLElement>(".hero-right-text");
    const heroRightInners =
      scope.querySelectorAll<HTMLElement>(".hero-right-text .custom-line-inner");
    const heroSecWrap =
      scope.querySelector<HTMLElement>(".hero-secondary-text-wrap");
    const heroContactBtn =
      scope.querySelector<HTMLElement>(".hero-contact-btn");
    const heroScrollInd =
      scope.querySelector<HTMLElement>(".hero-scroll-indicator");

    const secTwo = scope.querySelector<HTMLElement>(".section-2");
    const s2TitleMain = scope.querySelector<HTMLElement>(".s2-title-main");
    const s2TitleSub = scope.querySelector<HTMLElement>(".s2-title-sub");
    const s2BodyText = scope.querySelector<HTMLElement>(".s2-body-text");
    const s2Frame1 =
      scope.querySelector<HTMLElement>(".s2-right-img-frame");
    const s2Frame2 =
      scope.querySelector<HTMLElement>(".s2-right-img-frame-under");
    const s2ScrollContent =
      scope.querySelector<HTMLElement>(".s2-scroll-content");

    const secEight = scope.querySelector<HTMLElement>(".section-8");
    const s8BgImg = scope.querySelector<HTMLElement>(".s8-bg-img");

    const secTen = scope.querySelector<HTMLElement>(".section-10");
    const s10BgImg = scope.querySelector<HTMLElement>(".s10-bg-img");
    const s10ContentWrap =
      scope.querySelector<HTMLElement>(".s10-content-wrap");

    const s7AppLayer =
      scope.querySelector<HTMLElement>(".section-7-app-layer");
    const s7BgImg = scope.querySelector<HTMLElement>(".s7-bg-img");

    const appSecBg = scope.querySelector<HTMLElement>(".appsec-bg");
    const appSecContent = scope.querySelector<HTMLElement>(".appsec-content");

    const secNine = scope.querySelector<HTMLElement>(".section-9");
    const s9LeftSide = scope.querySelector<HTMLElement>(".s9-left-side");
    const s9RightSide = scope.querySelector<HTMLElement>(".s9-right-side");
    const s9BgLeft = scope.querySelector<HTMLElement>(".s9-bg-img-left");
    const s9BgRight = scope.querySelector<HTMLElement>(".s9-bg-img-right");
    const s9NativeTitle1 =
      scope.querySelector<HTMLElement>(".s9-native-title-wrapper-1");
    const s9NativeTitle2 =
      scope.querySelector<HTMLElement>(".s9-native-title-wrapper-2");
    const s9GlobalFlight =
      scope.querySelector<HTMLElement>(".s9-global-flight-container");
    const s9FlightWrapper =
      scope.querySelector<HTMLElement>(".s9-flight-wrapper");
    const s9ParaDesktop =
      scope.querySelector<HTMLElement>(".s9-para-desktop");

    const allS10TextNodes = scope.querySelectorAll<HTMLElement>(
      ".section-10 .s10-title, .section-10 .s10-title-sub, .section-10 .s10-para-top, .section-10 .reveal-text, .section-10 .gs-line-inner, .section-10 .custom-line-inner"
    );

    const ctaInner =
      scope.querySelector<HTMLElement>(".section-cta .cta-inner-desktop");

    [
      s2Frame1,
      s2Frame2,
      s2ScrollContent,
      s7AppLayer,
      s9LeftSide,
      s9RightSide,
      s9BgLeft,
      s9BgRight,
      s9FlightWrapper,
      appSecBg,
    ].forEach((el) => {
      if (el) {
        el.style.willChange = "transform, opacity, clip-path";
        el.style.transform = "translate3d(0, 0, 0)";
      }
    });

    const renderTransforms = (time: number) => {
      if (!isRunning) return;

      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const dynamicEase = 1 - Math.exp(-EASE_FACTOR * 60 * dt);

      let delta =
        (targetProgress.current - smoothProgress.current) * dynamicEase;

      if (Math.abs(delta) > MAX_PROGRESS_DELTA_PER_FRAME) {
        delta = Math.sign(delta) * MAX_PROGRESS_DELTA_PER_FRAME;
      }

      smoothProgress.current = clamp(smoothProgress.current + delta);

      const stepProgress =
        smoothProgress.current * (TOTAL_SCROLL_STEPS - 1);

      const { ctaHeight, footerHeight, vh } = dimensionsRef.current;

      const heroPhase1 = easeOutQuad(clamp(stepProgress / 1.2));

      if (heroBg) {
        const bgScale = (
          1.0 +
          heroPhase1 * 0.15 +
          easeOutQuad(clamp((stepProgress - 1.2) / 1.3)) * 0.15
        ).toFixed(4);

        heroBg.style.transform = `translate3d(0,0,0) scale3d(${bgScale}, ${bgScale}, 1)`;
      }

      if (heroLeftInitial) {
        heroLeftInitial.style.transform = `translate3d(0, ${
          -heroPhase1 * 100
        }vh, 0)`;
      }

      if (heroRightText) {
        heroRightText.style.visibility =
          stepProgress >= 0.1 && stepProgress < 1.4 ? "visible" : "hidden";

        heroRightText.style.opacity =
          stepProgress >= 0.1 && stepProgress < 1.4 ? "1" : "0";
      }

      if (heroRightInners) {
        const rTextInProg = easeOutQuad(clamp((stepProgress - 0.1) / 0.8));
        const rTextOutProg = easeOutQuad(clamp((stepProgress - 1.0) / 0.4));

        heroRightInners.forEach((inner, i) => {
          if (rTextOutProg > 0) {
            inner.style.opacity = `${1 - rTextOutProg}`;
            inner.style.transform = `translate3d(0, ${
              -rTextOutProg * 20
            }px, 0)`;
          } else {
            const indyProg = clamp((rTextInProg - i * 0.04) / 0.7);

            inner.style.opacity = `${indyProg}`;
            inner.style.transform = `translate3d(0, ${
              (1 - indyProg) * 100
            }%, 0)`;
          }
        });
      }

      const heroSecProg = easeOutQuad(clamp((stepProgress - 1.2) / 1.3));

      if (heroSecWrap) {
        heroSecWrap.style.visibility =
          stepProgress >= 1.2 && stepProgress < 3.2 ? "visible" : "hidden";

        heroSecWrap.style.opacity =
          stepProgress >= 1.2 && stepProgress < 3.2 ? "1" : "0";

        if (stepProgress < 2.5) {
          heroSecWrap.style.transform = `translate3d(0, ${
            -heroSecProg * 50
          }vh, 0)`;
        } else {
          const exitProg = easeOutQuad(clamp((stepProgress - 2.5) / 0.7));

          heroSecWrap.style.transform = `translate3d(0, ${
            -50 - exitProg * 60
          }vh, 0)`;
        }
      }

      const heroBtnProg = easeOutQuad(clamp((stepProgress - 2.0) / 0.5));

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

      const s2ArriveProg = clamp((stepProgress - 2.5) / 1.0);

      if (secTwo) {
        secTwo.style.visibility =
          stepProgress >= 2.0 && stepProgress < 7.0 ? "visible" : "hidden";

        secTwo.style.transform = `translate3d(0, ${(
          (1 - s2ArriveProg) *
          100
        ).toFixed(3)}%, 0)`;
      }

      const s2TextFadeProg = clamp((stepProgress - 3.55) / 0.55);

      [s2TitleMain, s2TitleSub, s2BodyText].forEach((el) => {
        if (!el) return;

        el.style.opacity = `${(1 - s2TextFadeProg).toFixed(3)}`;
        el.style.transform = `translate3d(0, ${(
          -s2TextFadeProg * 30
        ).toFixed(2)}px, 0)`;
      });

      const s2Frame1InProg = clamp((stepProgress - 3.85) / 0.7);
      const s2Frame1OutProg = clamp((stepProgress - 4.75) / 0.7);

      if (s2Frame1) {
        if (s2Frame1OutProg > 0) {
          s2Frame1.style.clipPath = `inset(0% 0% ${(
            s2Frame1OutProg * 100
          ).toFixed(2)}% 0%)`;
        } else {
          s2Frame1.style.clipPath = `inset(${(
            (1 - s2Frame1InProg) *
            100
          ).toFixed(2)}% 0% 0% 0%)`;
        }
      }

      const s2Frame2Prog = clamp((stepProgress - 4.55) / 0.75);

      if (s2Frame2) {
        s2Frame2.style.clipPath = `inset(${(
          (1 - s2Frame2Prog) *
          100
        ).toFixed(2)}% 0% 0% 0%)`;
      }

      const s2ScrollInProg = clamp((stepProgress - 3.85) / 0.75);
      const s2ScrollPhase2 = clamp((stepProgress - 4.6) / 0.85);

      if (s2ScrollContent) {
        const yPercent =
          (1 - s2ScrollInProg) * 100 - s2ScrollPhase2 * 50;

        s2ScrollContent.style.transform = `translate3d(0, ${yPercent.toFixed(
          2
        )}%, 0)`;

        s2ScrollContent.style.opacity = stepProgress >= 3.75 ? "1" : "0";
      }

      const s8ArriveProg = easeOutQuad(clamp((stepProgress - 5.5) / 1.2));

      if (secEight) {
        secEight.style.visibility =
          stepProgress >= 5.2 && stepProgress < 8.2 ? "visible" : "hidden";

        secEight.style.transform = `translate3d(0, ${(
          (1 - s8ArriveProg) *
          100
        ).toFixed(3)}%, 0)`;
      }

      if (s8BgImg) {
        s8BgImg.style.transform = `translate3d(0, ${
          (1 - s8ArriveProg) * 20
        }%, 0)`;
      }

      triggerProgressTextReveal(".section-8", stepProgress, 5.8);

      const s10ArriveProg = easeOutQuad(clamp((stepProgress - 7.0) / 1.2));

      if (secTen) {
        secTen.style.visibility =
          stepProgress >= 7.0 && stepProgress < 10.7 ? "visible" : "hidden";

        secTen.style.transform = `translate3d(0, ${(
          (1 - s10ArriveProg) *
          100
        ).toFixed(3)}%, 0)`;
      }

      const s10ScrollProg = easeOutQuad(clamp((stepProgress - 8.2) / 1.2));

      allS10TextNodes.forEach((el) => {
        if (stepProgress >= 7.0 && stepProgress < 10.7) {
          el.style.setProperty("opacity", "1", "important");
          el.style.setProperty("visibility", "visible", "important");
        } else {
          el.style.setProperty("opacity", "0", "important");
          el.style.setProperty("visibility", "hidden", "important");
        }

        el.style.transform = `translate3d(0, ${
          -s10ScrollProg * 100
        }vh, 0)`;
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

      const s7ArriveProg = easeOutQuad(clamp((stepProgress - 9.4) / 1.2));
      const appStackProg = easeOutQuad(clamp((stepProgress - 10.6) / 1.4));

      if (s7AppLayer) {
        s7AppLayer.style.visibility =
          stepProgress >= 9.1 && stepProgress < 13.4 ? "visible" : "hidden";

        const layerYVh =
          (1 - s7ArriveProg) * 100 - appStackProg * 100;

        s7AppLayer.style.transform = `translate3d(0, ${layerYVh.toFixed(
          3
        )}vh, 0)`;
      }

      if (s7BgImg) {
        const bgCounterY = -(1 - s7ArriveProg) * 100;

        s7BgImg.style.transform = `translate3d(0, ${bgCounterY.toFixed(
          3
        )}%, 0)`;
      }

      triggerProgressTextReveal(".section-7", stepProgress, 9.7);
      triggerProgressTextReveal(".section-appsec", stepProgress, 11.05);

      const s9ArriveProg = easeOutQuad(clamp((stepProgress - 12.3) / 1.2));

      if (secNine) {
        secNine.style.visibility =
          stepProgress >= 12.1 ? "visible" : "hidden";
      }

      if (appSecContent) {
        appSecContent.style.opacity = `${(1 - s9ArriveProg).toFixed(3)}`;
      }

      if (appSecBg) {
        const scaleVal = (1.25 - s9ArriveProg * 0.25).toFixed(4);

        appSecBg.style.transform = `translate3d(0, ${(
          s9ArriveProg * 12
        ).toFixed(2)}%, 0) scale3d(${scaleVal}, ${scaleVal}, 1)`;
      }

      if (s9LeftSide) {
        s9LeftSide.style.transform = `translate3d(0, ${(
          (1 - s9ArriveProg) *
          100
        ).toFixed(3)}%, 0)`;
      }

      if (s9RightSide) {
        s9RightSide.style.transform = `translate3d(0, ${(
          -(1 - s9ArriveProg) *
          100
        ).toFixed(3)}%, 0)`;
      }

      const s9BgScale = (1.1 - s9ArriveProg * 0.1).toFixed(4);

      if (s9BgLeft) {
        s9BgLeft.style.transform = `translate3d(0,0,0) scale3d(${s9BgScale}, ${s9BgScale}, 1)`;
      }

      if (s9BgRight) {
        s9BgRight.style.transform = `translate3d(0,0,0) scale3d(${s9BgScale}, ${s9BgScale}, 1)`;
      }

      const flyProg = clamp((stepProgress - 13.5) / 1.0);

      if (s9NativeTitle1) s9NativeTitle1.style.opacity = flyProg > 0 ? "0" : "1";
      if (s9NativeTitle2) s9NativeTitle2.style.opacity = flyProg > 0 ? "0" : "1";

      if (s9GlobalFlight) {
        s9GlobalFlight.style.visibility = flyProg > 0 ? "visible" : "hidden";
        s9GlobalFlight.style.opacity = flyProg > 0 ? "1" : "0";
      }

      if (s9FlightWrapper && flyProg > 0 && s9TargetRectRef.current) {
        const { deltaX, deltaY } = s9TargetRectRef.current;

        s9FlightWrapper.style.transform = `translate3d(${(
          deltaX * flyProg
        ).toFixed(2)}px, ${(deltaY * flyProg).toFixed(2)}px, 0)`;
      }

      if (s9ParaDesktop) {
        const paraProg = easeOutQuad(clamp((stepProgress - 13.5) / 1.0));

        if (stepProgress >= 13.5) {
          s9ParaDesktop.style.visibility = "visible";
          s9ParaDesktop.style.opacity = `${paraProg.toFixed(3)}`;
          s9ParaDesktop.style.transform = `translate3d(0, ${(
            (1 - paraProg) *
            20
          ).toFixed(2)}px, 0)`;
        } else {
          s9ParaDesktop.style.visibility = "hidden";
          s9ParaDesktop.style.opacity = "0";
        }
      }

      const ctaArriveProg = easeOutQuad(clamp((stepProgress - 14.5) / 0.8));

      if (layerCTA.current) {
        const startY = vh;
        const endY = -(ctaHeight - vh);

        const currentY =
          startY + (endY - startY) * ctaArriveProg;

        layerCTA.current.style.visibility =
          stepProgress >= 14.3 ? "visible" : "hidden";

        layerCTA.current.style.transform = `translate3d(0, ${currentY.toFixed(
          2
        )}px, 0)`;
      }

      if (ctaInner) {
        ctaInner.style.opacity = "1";
        ctaInner.style.transform = "translate3d(0, 0px, 0)";
      }

      const footerArriveProg = easeOutQuad(clamp((stepProgress - 15.3) / 0.5));

      if (layerFooter.current) {
        const startY = vh;
        const endY = vh - footerHeight;

        const translateY =
          startY + (endY - startY) * footerArriveProg;

        layerFooter.current.style.visibility =
          stepProgress >= 15.1 ? "visible" : "hidden";

        layerFooter.current.style.transform = `translate3d(0, ${translateY.toFixed(
          2
        )}px, 0)`;
      }

      rafId.current = requestAnimationFrame(renderTransforms);
    };

    const handleScroll = (e?: any) => {
      const scrollY =
        e?.scroll !== undefined ? e.scroll : window.scrollY;

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

      targetProgress.current = clamp(relativeScroll / totalScrollable);
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

      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }

      if (lenis && typeof lenis.off === "function") {
        lenis.off("scroll", handleScroll);
      } else {
        window.removeEventListener("scroll", handleScroll);
      }
    };
  }, [
    preloaderDone,
    introDone,
    smootherRef,
    triggerProgressTextReveal,
  ]);

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

        .section-2,
        .s2-right-img-frame,
        .s2-right-img-frame-under,
        .s2-scroll-content,
        .section-7-app-layer,
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
            className="section-7-app-layer absolute left-0 top-0 h-[200vh] w-full structural-layer will-change-transform transform-gpu z-[105]"
            style={{
              visibility: "hidden",
              transform: "translate3d(0, 100vh, 0)",
            }}
          >
            <div className="section-7 absolute left-0 top-0 h-[100vh] w-full overflow-hidden">
              <SectionSeven />
            </div>

            <div className="section-appsec absolute left-0 top-[100vh] h-[100vh] w-full overflow-hidden">
              <Appsection />
            </div>
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
            style={{
              transform: "translate3d(0, 100vh, 0)",
              visibility: "hidden",
            }}
          >
            <SectionCTA preloaderDone={preloaderDone} />
          </div>

          <div
            ref={layerFooter}
            className="footer absolute left-0 top-0 w-full z-[125] will-change-transform transform-gpu"
            style={{
              transform: "translate3d(0, 100vh, 0)",
              visibility: "hidden",
            }}
          >
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}