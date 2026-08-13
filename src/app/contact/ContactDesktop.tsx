"use client";

import dynamic from "next/dynamic";
import ContactHero from "@/src/components/contact/Hero";
import SectionOne from "@/src/components/contact/SectionOne";
import SectionCTA from "@/src/components/contact/SectionCTA";
import FAQSection from "@/src/components/contact/FAQSection";
import Footer from "@/src/components/Footer";
import { useState, useRef, useEffect, useCallback } from "react";
import { useSite } from "@/src/app/context/SiteContext";
import { useHeroIntro } from "@/src/app/utils/useHeroIntro";
import { useTextReveal, restoreTextReveal } from "@/src/app/utils/useTextReveal";

const TOTAL_SCROLL_STEPS = 9;

// QUADRATIC EASING MATCHING HOME DESKTOP
const easeOutQuad = (t: number) => t * (2 - t);

export default function ContactDesktop() {
  const scopeRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fixedFrameRef = useRef<HTMLDivElement>(null);

  const scrollMetricsRef = useRef({
    scrollDistance: 0,
    totalScrollable: 0,
    trackTopOffset: 0,
    vh: 0,
  });

  const targetProgress = useRef(0);
  const revealedSections = useRef<Set<string>>(new Set());
  const rafId = useRef<number | null>(null);

  const { smootherRef } = useSite();
  const { preloaderDone, shouldLoadRest } = useHeroIntro(scopeRef, {
    isMobile: false,
  });

  // ── 1. UNLOCK SCROLL & CONTROL LENIS ──
  useEffect(() => {
    const lenis = smootherRef?.current;

    if (!preloaderDone || !shouldLoadRest) {
      if (lenis && typeof lenis.stop === "function") lenis.stop();
      targetProgress.current = 0;
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

  // ── 2. CACHE METRICS TO PREVENT LAYOUT THRASHING ──
  const measure = useCallback(() => {
    if (!trackRef.current) return;

    const rect = trackRef.current.getBoundingClientRect();
    const vh = window.innerHeight;
    const cardContainer = scopeRef.current?.querySelector(".contact-cards-container");

    const scrollDistance = cardContainer
      ? cardContainer.getBoundingClientRect().height + 96
      : vh;

    scrollMetricsRef.current = {
      scrollDistance,
      vh,
      trackTopOffset: window.scrollY + rect.top,
      totalScrollable: rect.height - vh,
    };
  }, []);

  useEffect(() => {
    if (!shouldLoadRest) return;
    measure();

    const resizeObserver = new ResizeObserver(() => measure());
    if (trackRef.current) resizeObserver.observe(trackRef.current);

    window.addEventListener("resize", measure, { passive: true });
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [shouldLoadRest, measure]);

  // ── 3. TEXT REVEAL HELPER ──
  const triggerPlayOnceTextReveal = useCallback((
    containerSelector: string,
    currentStepProg: number,
    triggerThreshold: number
  ) => {
    if (!scopeRef.current) return;

    const key = containerSelector;
    if (revealedSections.current.has(key)) return;

    if (currentStepProg >= triggerThreshold) {
      revealedSections.current.add(key);

      const lineInners = scopeRef.current.querySelectorAll<HTMLElement>(
        `${containerSelector} .gs-line-inner, ${containerSelector} .custom-line-inner, ${containerSelector} .reveal-text > *`
      );

      lineInners.forEach((el, idx) => {
        el.style.transition = `transform 0.85s cubic-bezier(0.16, 1, 0.3, 1) ${
          idx * 0.05
        }s, opacity 0.85s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 0.05}s`;
        el.style.transform = "translate3d(0, 0px, 0)";
        el.style.opacity = "1";
      });
    }
  }, []);

  useEffect(() => {
    if (!shouldLoadRest || !scopeRef.current) return;

    useTextReveal(scopeRef, ".faq-scroll-wrapper .reveal-text");

    const lineInners = scopeRef.current.querySelectorAll<HTMLElement>(
      ".faq-scroll-wrapper .gs-line-inner, .faq-scroll-wrapper .custom-line-inner, .faq-scroll-wrapper .reveal-text > *"
    );
    lineInners.forEach((el) => {
      el.style.transform = "translate3d(0, 45px, 0)";
      el.style.opacity = "0";
    });

    return () => {
      if (scopeRef.current) {
        restoreTextReveal(scopeRef.current, ".faq-scroll-wrapper .reveal-text");
      }
    };
  }, [shouldLoadRest]);

  // ── 4. ULTRA-SMOOTH CONTINUOUS LERP RENDER ENGINE (HOMEDESKTOP PARITY) ──
  useEffect(() => {
    if (!shouldLoadRest || !scopeRef.current) return;

    const scope = scopeRef.current;
    let isRunning = true;
    let currentProgress = targetProgress.current;

    // Cache element nodes
    const heroBg = scope.querySelector<HTMLElement>(".contact-hero-bg");
    const ctaWrapper = scope.querySelector<HTMLElement>(".cta-scroll-wrapper");
    const sec1Wrapper = scope.querySelector<HTMLElement>(".section-one-scroll-wrapper");
    const sec1Bg = scope.querySelector<HTMLElement>(".contact-one-bg");
    const rightTrack = scope.querySelector<HTMLElement>(".contact-right-scroll-track");
    const faqWrapper = scope.querySelector<HTMLElement>(".faq-scroll-wrapper");
    const footerWrapper = scope.querySelector<HTMLElement>(".footer-scroll-wrapper");

    // Hardware promote elements for fluid GPU rendering
    [heroBg, ctaWrapper, sec1Wrapper, sec1Bg, rightTrack, faqWrapper, footerWrapper].forEach((el) => {
      if (el) {
        el.style.willChange = "transform, opacity";
        el.style.transform = "translate3d(0, 0, 0)";
      }
    });

    const renderTransforms = () => {
      if (!isRunning) return;

      // CONTINUOUS SILKY PHYSICS LERP INERTIA
      currentProgress += (targetProgress.current - currentProgress) * 0.08;

      const stepProgress = currentProgress * (TOTAL_SCROLL_STEPS - 1);
      const { scrollDistance } = scrollMetricsRef.current;

      // 1. HERO OUT & CTA ENTER (STEPS 0 -> 1.8)
      const p1 = easeOutQuad(Math.min(Math.max(stepProgress / 1.8, 0), 1));
      if (heroBg) {
        heroBg.style.transform = `translate3d(0, ${(-100 * p1).toFixed(2)}px, 0)`;
      }
      if (ctaWrapper) {
        ctaWrapper.style.transform = `translate3d(0, ${(-100 * p1).toFixed(2)}%, 0)`;
      }

      // 2. SECTION ONE ENTER (STEPS 1.8 -> 3.6)
      const p2 = easeOutQuad(Math.min(Math.max((stepProgress - 1.8) / 1.8, 0), 1));
      if (sec1Wrapper) {
        sec1Wrapper.style.visibility = stepProgress >= 1.6 ? "visible" : "hidden";
        sec1Wrapper.style.transform = `translate3d(0, ${((1 - p2) * 100).toFixed(3)}%, 0)`;
      }

      // 3. SECTION ONE RIGHT TRACK SCROLL (STEPS 3.6 -> 5.2)
      const p3 = easeOutQuad(Math.min(Math.max((stepProgress - 3.6) / 1.6, 0), 1));
      if (sec1Bg) {
        sec1Bg.style.transform = `translate3d(0, ${(-35 * p3).toFixed(2)}%, 0)`;
      }
      if (rightTrack) {
        rightTrack.style.transform = `translate3d(0, ${(-scrollDistance * p3).toFixed(2)}px, 0)`;
      }

      // 4. FAQ SECTION ENTER (STEPS 5.2 -> 6.8)
      const p4 = easeOutQuad(Math.min(Math.max((stepProgress - 5.2) / 1.6, 0), 1));
      if (faqWrapper) {
        faqWrapper.style.visibility = stepProgress >= 5.0 ? "visible" : "hidden";
        faqWrapper.style.transform = `translate3d(0, ${((1 - p4) * 100).toFixed(3)}%, 0)`;
      }

      triggerPlayOnceTextReveal(".faq-scroll-wrapper", stepProgress, 5.6);

      // 5. FOOTER SLIDES UP OVER FAQ (STEPS 6.8 -> 8.0)
      const p5 = easeOutQuad(Math.min(Math.max((stepProgress - 6.8) / 1.2, 0), 1));
      if (footerWrapper) {
        footerWrapper.style.visibility = stepProgress >= 6.6 ? "visible" : "hidden";
        footerWrapper.style.transform = `translate3d(0, ${((1 - p5) * 100).toFixed(3)}%, 0)`;
      }

      // Keep RAF loop running indefinitely for fluid momentum smoothing
      rafId.current = requestAnimationFrame(renderTransforms);
    };

    const handleScroll = (e?: any) => {
      const scrollY = e?.scroll !== undefined ? e.scroll : window.scrollY;
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
  }, [shouldLoadRest, smootherRef, triggerPlayOnceTextReveal]);

  return (
    <div ref={scopeRef} className="w-full bg-black">
      <div
        ref={trackRef}
        className="contact-track-container relative w-full"
        style={{ height: `${TOTAL_SCROLL_STEPS * 100}vh` }}
      >
        <div
          ref={fixedFrameRef}
          className="contact-pin fixed top-0 left-0 h-[100svh] w-full overflow-hidden bg-black z-10 transform-gpu"
        >
          {/* HERO COMPONENT */}
          <div className="absolute inset-0 h-full w-full z-10 transform-gpu">
            <ContactHero />
          </div>

          {/* CTA SCROLL WRAPPER */}
          <div
            className="cta-scroll-wrapper absolute top-full left-0 w-full h-screen z-20 pointer-events-auto will-change-transform transform-gpu"
            style={{ transform: "translate3d(0, 0%, 0)" }}
          >
            <SectionCTA />
          </div>

          {/* DOWNSTREAM SECTIONS */}
          {shouldLoadRest && (
            <>
              {/* SECTION ONE WRAPPER */}
              <div
                className="section-one-scroll-wrapper absolute top-0 left-0 w-full h-screen z-30 will-change-transform transform-gpu"
                style={{ visibility: "hidden", transform: "translate3d(0, 100%, 0)" }}
              >
                <SectionOne />
              </div>

              {/* FAQ SECTION WRAPPER */}
              <div
                className="faq-scroll-wrapper absolute top-0 left-0 w-full h-screen z-40 will-change-transform transform-gpu"
                style={{ visibility: "hidden", transform: "translate3d(0, 100%, 0)" }}
              >
                <FAQSection />
              </div>

              {/* FOOTER WRAPPER */}
              <div
                className="footer-scroll-wrapper absolute top-0 left-0 w-full h-screen z-50 flex flex-col justify-end pointer-events-none will-change-transform transform-gpu"
                style={{ visibility: "hidden", transform: "translate3d(0, 100%, 0)" }}
              >
                <div className="w-full pointer-events-auto">
                  <Footer />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}