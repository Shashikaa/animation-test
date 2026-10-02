"use client";

import dynamic from "next/dynamic";
import { useState, useRef, useEffect, useCallback } from "react";
import ProjectsHero from "../../components/Projects/ProjectsHero";
import { useSite } from "@/src/app/context/SiteContext";
import { useHeroIntro } from "@/src/app/utils/useHeroIntro";
import { restoreTextReveal } from "@/src/app/utils/useTextReveal";
import { prefersReducedMotion, settleReducedMotion } from "../../lib/reducedMotion";

const SectionOne = dynamic(() => import("@/src/components/Projects/SectionOne"));
const SectionTwo = dynamic(() => import("@/src/components/Projects/SectionTwo"));
const SectionCTA = dynamic(() => import("@/src/components/SectionCTA"));
const Footer = dynamic(() => import("@/src/components/Footer"));

const clamp = (val: number, min = 0, max = 1) =>
  Math.min(Math.max(val, min), max);

// Animation length (unchanged): scroll speed per step stays identical
const TOTAL_SCROLL_STEPS = 3.6;

// Extra scroll held at the end of the pin so the smoothed animation can
// finish (Section 2 fully in place) BEFORE the pin releases and the CTA
// starts scrolling into view. Increase if you still see it on fast flicks.
const HOLD_VH = 40;

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

  const scrollMetricsRef = useRef({
    totalScrollable: 0,
    animScrollable: 0,
    vh: 0,
    trackTopOffset: 0,
  });

  const lastSizeRef = useRef({ width: 0, height: 0 });

  const currentProgress = useRef(0);
  const targetProgress = useRef(0);
  const rafId = useRef<number | null>(null);

  const { smootherRef } = useSite();
  const { introDone, preloaderDone, shouldLoadRest } = useHeroIntro(scopeRef, {
    isMobile: true,
    introDurationMs: 2800,
    unlockScrollEarlyMs: 1800,
  });

  useEffect(() => {
    if (!shouldLoadRest) return;
    executeMobileSplitting(".scroll-para-1");
    executeMobileSplitting(".scroll-para-2");

    return () => {
      if (scopeRef.current) {
        restoreTextReveal(scopeRef.current, ".scroll-para-1");
        restoreTextReveal(scopeRef.current, ".scroll-para-2");
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

    const rect = trackRef.current.getBoundingClientRect();

    const totalScrollable = Math.max(0, rect.height - vh);
    // Scroll distance that drives the animation (same as the old full track)
    const animScrollable = Math.max(1, totalScrollable - (HOLD_VH / 100) * vh);

    scrollMetricsRef.current = {
      totalScrollable,
      animScrollable,
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
    // Reduced motion: skip the pinned scroll-scrub entirely and leave content
    // settled and visible. The CSS media query alone cannot stop this rAF loop.
    if (prefersReducedMotion()) {
      isRunning = false;
      settleReducedMotion(scopeRef.current);
      return;
    }


    const isAndroid =
      typeof navigator !== "undefined" && /android/i.test(navigator.userAgent);

    const EASE_FACTOR = isAndroid ? 0.08 : 0.08;
    const MAX_PROGRESS_DELTA_PER_FRAME = 0.01;

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
      const stepProgress = p * TOTAL_SCROLL_STEPS;

      // ── DOM References ──
      const heroTextWrap =
        scopeRef.current?.querySelector<HTMLElement>(".hero-text-wrap");
      const scrollPara1 =
        scopeRef.current?.querySelector<HTMLElement>(".scroll-para-1");
      const para1Lines = scopeRef.current?.querySelectorAll<HTMLElement>(
        ".scroll-para-1 .custom-line-inner"
      );
      const scrollPara2 =
        scopeRef.current?.querySelector<HTMLElement>(".scroll-para-2");
      const para2Lines = scopeRef.current?.querySelectorAll<HTMLElement>(
        ".scroll-para-2 .custom-line-inner"
      );
      const parallaxImg =
        scopeRef.current?.querySelector<HTMLElement>(".parallax-img-asset");

      // ── Hero Fade (0.0 -> 0.4) ──
      const heroTextFade = clamp(stepProgress / 0.4);
      if (heroTextWrap) {
        heroTextWrap.style.opacity = `${1 - heroTextFade}`;
        heroTextWrap.style.transform = `translate3d(0, ${
          -30 * heroTextFade
        }px, 0)`;
        heroTextWrap.style.visibility = heroTextFade >= 1 ? "hidden" : "visible";
      }

      // ── Para 1 (0.3 -> 1.1) ──
      const para1In = clamp((stepProgress - 0.3) / 0.5);
      const para1Out = clamp((stepProgress - 0.8) / 0.3);

      if (scrollPara1) {
        scrollPara1.style.visibility =
          stepProgress >= 0.3 && stepProgress <= 1.1 ? "visible" : "hidden";
        scrollPara1.style.opacity = `${1 - para1Out}`;
        scrollPara1.style.transform = `translate3d(0, ${-20 * para1Out}px, 0)`;
      }

      if (para1Lines) {
        para1Lines.forEach((line, idx) => {
          const lineProg = clamp((para1In - idx * 0.1) / 0.6);
          line.style.opacity = `${lineProg}`;
          line.style.transform = `translate3d(0, ${
            (1 - lineProg) * 100
          }%, 0)`;
        });
      }

      // ── Para 2 (1.1 -> 1.6) ──
      const para2In = clamp((stepProgress - 1.1) / 0.5);

      if (scrollPara2) {
        scrollPara2.style.visibility = stepProgress >= 1.1 ? "visible" : "hidden";
      }

      if (para2Lines) {
        para2Lines.forEach((line, idx) => {
          const lineProg = clamp((para2In - idx * 0.1) / 0.6);
          line.style.opacity = `${lineProg}`;
          line.style.transform = `translate3d(0, ${
            (1 - lineProg) * 100
          }%, 0)`;
        });
      }

      // ── Sec One (1.6 -> 2.6) ──
      const s1Prog = clamp((stepProgress - 1.6) / 1.0);

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

      // ── Sec Two (2.6 -> 3.6) ──
      const s2Prog = clamp((stepProgress - 2.6) / 1.0);
      if (sectionTwoRef.current) {
        sectionTwoRef.current.style.transform = `translate3d(0, ${
          (1 - s2Prog) * 100
        }%, 0)`;
      }

      if (stepProgress >= 2.8) {
        setIsSectionTwoActive(true);
      } else {
        setIsSectionTwoActive(false);
      }

      rafId.current = requestAnimationFrame(render);
    };

    const handleScroll = (e?: any) => {
      const lenis = smootherRef?.current;
      const scrollY = e?.scroll ?? lenis?.scroll ?? window.scrollY;
      const { totalScrollable, animScrollable, trackTopOffset } =
        scrollMetricsRef.current;

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

      // Animation completes after `animScrollable`; the remaining HOLD_VH is a
      // hold so the smoothed animation catches up before the pin releases.
      targetProgress.current = clamp(relativeScroll / animScrollable);
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

  const isReady = preloaderDone && introDone;

  return (
    <div ref={scopeRef} className="w-full bg-[#162D24]">
      {/* VIRTUAL PINNED TRACK: animation length + short hold at the end */}
      <div
        ref={trackRef}
        className="projects-track-container relative w-full gp-pin-track"
        style={{ height: `${TOTAL_SCROLL_STEPS * 100 + HOLD_VH}vh` }}
      >
        <div
          ref={fixedFrameRef}
          className="fixed top-0 left-0 w-full overflow-hidden bg-[#162D24] z-10 h-svh transform-gpu"
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
            </>
          )}
        </div>
      </div>

      {/* NATURAL DOCUMENT FLOW FOR CTA AND FOOTER */}
      {shouldLoadRest && (
        <div className="relative z-20 w-full bg-[#162D24]">
          <SectionCTA preloaderDone={isReady} />
          <Footer />
        </div>
      )}
    </div>
  );
}