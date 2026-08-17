"use client";

import dynamic from "next/dynamic";
import { useState, useRef, useEffect, useCallback } from "react";
import ProjectsHero from "../../components/Projects/ProjectsHero";
import { useSite } from "@/src/app/context/SiteContext";
import { useHeroIntro } from "@/src/app/utils/useHeroIntro";
import { restoreTextReveal } from "@/src/app/utils/useTextReveal";

const SectionOne = dynamic(() => import("@/src/components/Projects/SectionOne"));
const SectionTwo = dynamic(() => import("@/src/components/Projects/SectionTwo"));
const Footer = dynamic(() => import("@/src/components/Footer"));

const clamp = (val: number, min = 0, max = 1) =>
  Math.min(Math.max(val, min), max);

function executeMobileSplitting(selector: string) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((element) => {
    const htmlElement = element as HTMLElement;
    if (!htmlElement || htmlElement.dataset.splitComplete === "true") return;

    const rawText = htmlElement.textContent || "";
    const linesArray = rawText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    htmlElement.innerHTML = "";
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
      htmlElement.appendChild(wrapper);
    });

    htmlElement.dataset.splitComplete = "true";
  });
}

export default function ProjectsMobile() {
  const [isSectionTwoActive, setIsSectionTwoActive] = useState(false);
  const scopeRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fixedFrameRef = useRef<HTMLDivElement>(null);

  const heroPanelRef = useRef<HTMLDivElement>(null);
  const sectionOneRef = useRef<HTMLDivElement>(null);
  const sectionTwoRef = useRef<HTMLDivElement>(null);
  const footerLayerRef = useRef<HTMLDivElement>(null);

  const scrollMetricsRef = useRef({
    totalScrollable: 0,
    vh: 0,
    trackTopOffset: 0,
  });

  const lastSizeRef = useRef({ width: 0, height: 0 });

  const currentProgress = useRef(0);
  const targetProgress = useRef(0);
  const rafId = useRef<number | null>(null);

  const { smootherRef } = useSite();
  const { preloaderDone, shouldLoadRest } = useHeroIntro(scopeRef, {
    isMobile: true,
    introDurationMs: 2800,
    unlockScrollEarlyMs: 1800,
  });

  useEffect(() => {
    if (!shouldLoadRest) return;
    executeMobileSplitting(".scroll-para-1");

    return () => {
      if (scopeRef.current) {
        restoreTextReveal(scopeRef.current, ".scroll-para-1");
      }
    };
  }, [shouldLoadRest]);

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

  const updateMetrics = useCallback(() => {
    if (!trackRef.current) return;

    const vh = window.innerHeight;
    const vw = window.innerWidth;

    const footerHeight = footerLayerRef.current?.offsetHeight || vh;

    // Dynamically calculate track height based on step views + footer height
    const totalTrackHeight = vh * 4 + footerHeight;

    trackRef.current.style.height = `${totalTrackHeight}px`;

    const rect = trackRef.current.getBoundingClientRect();

    scrollMetricsRef.current = {
      totalScrollable: Math.max(0, totalTrackHeight - vh),
      vh,
      trackTopOffset: window.scrollY + rect.top,
    };

    lastSizeRef.current = { width: vw, height: vh };
  }, []);

  const handleResize = useCallback(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const { width, height } = lastSizeRef.current;

    const isLikelyAddressBarToggle =
      vw === width && Math.abs(vh - height) < 150;

    if (isLikelyAddressBarToggle) return;

    updateMetrics();
  }, [updateMetrics]);

  useEffect(() => {
    if (!shouldLoadRest) return;

    updateMetrics();

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("orientationchange", updateMetrics, {
      passive: true,
    });

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", updateMetrics);
    };
  }, [shouldLoadRest, updateMetrics, handleResize]);

  useEffect(() => {
    if (!shouldLoadRest) return;

    let isRunning = true;

    const isAndroid =
      typeof navigator !== "undefined" && /android/i.test(navigator.userAgent);

    // Dynamic easing and delta capping matching AboutMobile
const EASE_FACTOR = isAndroid ? 0.06 : 0.06;
    const MAX_PROGRESS_DELTA_PER_FRAME = 0.006;

    let lastTime = performance.now();

    const render = () => {
      if (!isRunning) return;

      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const dynamicEase = 1 - Math.exp(-EASE_FACTOR * 60 * dt);

      let delta =
        (targetProgress.current - currentProgress.current) * dynamicEase;

      if (Math.abs(delta) > MAX_PROGRESS_DELTA_PER_FRAME) {
        delta = Math.sign(delta) * MAX_PROGRESS_DELTA_PER_FRAME;
      }

      currentProgress.current += delta;

      const p = currentProgress.current;
      const totalSteps = 4.5;
      const stepProgress = p * totalSteps;

      const { vh } = scrollMetricsRef.current;

      // ── Hero Text Reveal ──
      const heroTextWrap =
        scopeRef.current?.querySelector<HTMLElement>(".hero-text-wrap");
      const scrollPara1 =
        scopeRef.current?.querySelector<HTMLElement>(".scroll-para-1");
      const paraLines = scopeRef.current?.querySelectorAll<HTMLElement>(
        ".scroll-para-1 .custom-line-inner"
      );
      const parallaxImg =
        scopeRef.current?.querySelector<HTMLElement>(".parallax-img-asset");

      const heroTextFade = clamp(stepProgress / 0.4);
      if (heroTextWrap) {
        heroTextWrap.style.opacity = `${1 - heroTextFade}`;
        heroTextWrap.style.transform = `translate3d(0, ${
          -30 * heroTextFade
        }px, 0)`;
        heroTextWrap.style.visibility = heroTextFade >= 1 ? "hidden" : "visible";
      }

      if (scrollPara1 && paraLines) {
        const paraProgress = clamp((stepProgress - 0.3) / 0.5);
        scrollPara1.style.visibility = paraProgress > 0 ? "visible" : "hidden";

        paraLines.forEach((line, idx) => {
          const lineStaggerProg = clamp((paraProgress - idx * 0.1) / 0.6);
          line.style.opacity = `${lineStaggerProg}`;
          line.style.transform = `translate3d(0, ${
            (1 - lineStaggerProg) * 100
          }%, 0)`;
        });
      }

      // ── Section One Reveal & Parallax Image Transform ──
      const s1Prog = clamp(stepProgress - 1.0);
      if (heroPanelRef.current) {
        heroPanelRef.current.style.transform = `translate3d(0, ${
          -s1Prog * 15
        }%, 0)`;
      }
      if (sectionOneRef.current) {
        sectionOneRef.current.style.transform = `translate3d(0, ${
          (1 - s1Prog) * 100
        }%, 0)`;
      }

      if (parallaxImg) {
        const imgY = -20 + s1Prog * 40;
        parallaxImg.style.transform = `translate3d(0, ${imgY.toFixed(2)}%, 0)`;
      }

      // ── Section Two ──
      const s2Prog = clamp(stepProgress - 2.0);
      if (sectionTwoRef.current) {
        sectionTwoRef.current.style.transform = `translate3d(0, ${
          (1 - s2Prog) * 100
        }%, 0)`;
      }

      if (stepProgress >= 2.2 && stepProgress <= 4.5) {
        setIsSectionTwoActive(true);
      } else {
        setIsSectionTwoActive(false);
      }

      // ── Footer Layer ──
      const footerProgress = clamp(stepProgress - 3.5);
      if (footerLayerRef.current) {
        const footerHeight = footerLayerRef.current.offsetHeight || vh;
        const translateY = vh - footerHeight * footerProgress;
        footerLayerRef.current.style.transform = `translate3d(0, ${translateY}px, 0)`;
      }

      rafId.current = requestAnimationFrame(render);
    };

    const handleScroll = (e?: any) => {
      const lenis = smootherRef?.current;
      const scrollY = e?.scroll ?? lenis?.scroll ?? window.scrollY;
      const { totalScrollable, trackTopOffset } = scrollMetricsRef.current;

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
    rafId.current = requestAnimationFrame(render);

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
  }, [shouldLoadRest, smootherRef]);

  return (
    <div ref={scopeRef} className="w-full bg-[#162D24]">
      <div
        ref={trackRef}
        className="projects-track-container relative w-full"
      >
        <div
          ref={fixedFrameRef}
          className="fixed top-0 left-0 w-full overflow-hidden bg-[#162D24] z-10 h-svh"
        >
          <div
            ref={heroPanelRef}
            className="projects-hero-master absolute inset-0 w-full h-svh z-10 transform-gpu will-change-transform backface-hidden"
          >
            <ProjectsHero isMobile={true} />
          </div>

          {shouldLoadRest && (
            <>
              <div
                ref={sectionOneRef}
                className="about-stack-layer absolute inset-0 w-full h-svh z-20 transform-gpu will-change-transform backface-hidden"
                style={{ transform: "translate3d(0, 100%, 0)" }}
              >
                <SectionOne />
              </div>

              <div
                ref={sectionTwoRef}
                className="about-stack-layer absolute inset-0 w-full h-svh z-30 transform-gpu will-change-transform backface-hidden"
                style={{ transform: "translate3d(0, 100%, 0)" }}
              >
                <SectionTwo isActive={isSectionTwoActive} />
              </div>

              <div
                ref={footerLayerRef}
                className="layer-auto-height transform-gpu absolute left-0 top-0 w-full z-[151] will-change-transform backface-hidden"
                style={{ transform: "translate3d(0, 100svh, 0)" }}
              >
                <Footer />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}