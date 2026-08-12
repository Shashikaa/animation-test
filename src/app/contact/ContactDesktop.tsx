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

// Continuous 9-step scroll sequence matching About architecture
const TOTAL_SCROLL_STEPS = 9;

export default function ContactDesktop() {
  const scopeRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fixedFrameRef = useRef<HTMLDivElement>(null);

  const scrollDistanceRef = useRef<number>(0);
  const progressRef = useRef(0);
  const revealedSections = useRef<Set<string>>(new Set());

  const { smootherRef } = useSite();
  const { introDone, preloaderDone, shouldLoadRest } = useHeroIntro(scopeRef, {
    isMobile: false,
  });

  // ── 1. UNLOCK SCROLL & FORCE INSTANT SCROLL RESPONSIVENESS ──
  useEffect(() => {
    const lenis = smootherRef?.current;

    if (!preloaderDone || !shouldLoadRest) {
      if (lenis && typeof lenis.stop === "function") lenis.stop();
      progressRef.current = 0;
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

  // ── 2. CACHE DYNAMIC TRACK DISTANCE ──
  useEffect(() => {
    if (!shouldLoadRest) return;

    const measure = () => {
      const cardContainer = scopeRef.current?.querySelector(".contact-cards-container");
      scrollDistanceRef.current = cardContainer
        ? cardContainer.getBoundingClientRect().height + 96
        : window.innerHeight;
    };

    measure();

    window.addEventListener("resize", measure, { passive: true });
    return () => {
      window.removeEventListener("resize", measure);
    };
  }, [shouldLoadRest]);

  // ── 3. TEXT REVEAL HELPER ──
  const triggerPlayOnceTextReveal = (
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
        el.style.transition = `transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${
          idx * 0.05
        }s, opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 0.05}s`;
        el.style.transform = "translate3d(0, 0px, 0)";
        el.style.opacity = "1";
      });
    }
  };

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

  // ── 4. DIRECT GPU SCROLL RENDERING (NO GSAP) ──
  useEffect(() => {
    if (!shouldLoadRest || !scopeRef.current) return;

    const scope = scopeRef.current;
    const heroBg = scope.querySelector<HTMLElement>(".contact-hero-bg");
    const ctaWrapper = scope.querySelector<HTMLElement>(".cta-scroll-wrapper");
    const sec1Wrapper = scope.querySelector<HTMLElement>(".section-one-scroll-wrapper");
    const sec1Bg = scope.querySelector<HTMLElement>(".contact-one-bg");
    const rightTrack = scope.querySelector<HTMLElement>(".contact-right-scroll-track");
    const faqWrapper = scope.querySelector<HTMLElement>(".faq-scroll-wrapper");
    const footerWrapper = scope.querySelector<HTMLElement>(".footer-scroll-wrapper");

    const renderTransforms = () => {
      const stepProgress = progressRef.current * (TOTAL_SCROLL_STEPS - 1);
      const scrollDistance = scrollDistanceRef.current;

      // 1. HERO OUT & CTA ENTER (STEPS 0 -> 1.8)
      const p1 = Math.min(Math.max(stepProgress / 1.8, 0), 1);
      if (heroBg) {
        heroBg.style.transform = `translate3d(0, ${-100 * p1}px, 0)`;
      }
      if (ctaWrapper) {
        ctaWrapper.style.transform = `translate3d(0, ${-100 * p1}%, 0)`;
      }

      // 2. SECTION ONE ENTER (STEPS 1.8 -> 3.6)
      const p2 = Math.min(Math.max((stepProgress - 1.8) / 1.8, 0), 1);
      if (sec1Wrapper) {
        sec1Wrapper.style.visibility = stepProgress >= 1.6 ? "visible" : "hidden";
        sec1Wrapper.style.transform = `translate3d(0, ${(1 - p2) * 100}%, 0)`;
      }

      // 3. SECTION ONE RIGHT TRACK SCROLL (STEPS 3.6 -> 5.2)
      const p3 = Math.min(Math.max((stepProgress - 3.6) / 1.6, 0), 1);
      if (sec1Bg) {
        sec1Bg.style.transform = `translate3d(0, ${-35 * p3}%, 0)`;
      }
      if (rightTrack) {
        rightTrack.style.transform = `translate3d(0, ${-scrollDistance * p3}px, 0)`;
      }

      // 4. FAQ SECTION ENTER (STEPS 5.2 -> 6.8)
      const p4 = Math.min(Math.max((stepProgress - 5.2) / 1.6, 0), 1);
      if (faqWrapper) {
        faqWrapper.style.visibility = stepProgress >= 5.0 ? "visible" : "hidden";
        faqWrapper.style.transform = `translate3d(0, ${(1 - p4) * 100}%, 0)`;
      }

      // Trigger text reveal animations inside FAQ
      triggerPlayOnceTextReveal(".faq-scroll-wrapper", stepProgress, 5.6);

      // 5. FOOTER SLIDES UP OVER FAQ (STEPS 6.8 -> 8.0)
      // Note: FAQ content opacity remains 100% without fading out
      const p5 = Math.min(Math.max((stepProgress - 6.8) / 1.2, 0), 1);
      if (footerWrapper) {
        footerWrapper.style.visibility = stepProgress >= 6.6 ? "visible" : "hidden";
        footerWrapper.style.transform = `translate3d(0, ${(1 - p5) * 100}%, 0)`;
      }
    };

    const handleScroll = () => {
      if (!trackRef.current || !fixedFrameRef.current) return;

      const trackRect = trackRef.current.getBoundingClientRect();
      const vh = window.innerHeight;
      const totalScrollable = trackRect.height - vh;

      if (totalScrollable <= 0) return;

      if (trackRect.top <= 0 && trackRect.bottom >= vh) {
        fixedFrameRef.current.style.position = "fixed";
        fixedFrameRef.current.style.top = "0px";
        fixedFrameRef.current.style.bottom = "auto";
      } else if (trackRect.bottom < vh) {
        fixedFrameRef.current.style.position = "absolute";
        fixedFrameRef.current.style.top = "auto";
        fixedFrameRef.current.style.bottom = "0px";
      } else {
        fixedFrameRef.current.style.position = "absolute";
        fixedFrameRef.current.style.top = "0px";
        fixedFrameRef.current.style.bottom = "auto";
      }

      const currentScroll = Math.max(0, -trackRect.top);
      progressRef.current = Math.min(Math.max(currentScroll / totalScrollable, 0), 1);

      requestAnimationFrame(renderTransforms);
    };

    handleScroll();

    const lenis = smootherRef?.current;
    if (lenis && typeof lenis.on === "function") {
      lenis.on("scroll", handleScroll);
    } else {
      window.addEventListener("scroll", handleScroll, { passive: true });
    }

    return () => {
      if (lenis && typeof lenis.off === "function") {
        lenis.off("scroll", handleScroll);
      } else {
        window.removeEventListener("scroll", handleScroll);
      }
    };
  }, [shouldLoadRest, smootherRef]);

  return (
    <div ref={scopeRef} className="w-full bg-black">
      <div
        ref={trackRef}
        className="contact-track-container relative w-full"
        style={{ height: `${TOTAL_SCROLL_STEPS * 100}vh` }}
      >
        <div
          ref={fixedFrameRef}
          className="contact-pin fixed top-0 left-0 h-[100svh] w-full overflow-hidden bg-black z-10"
        >
          {/* HERO COMPONENT */}
          <div className="absolute inset-0 h-full w-full z-10">
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