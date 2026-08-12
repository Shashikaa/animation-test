"use client";

import dynamic from "next/dynamic";
import { useState, useRef, useEffect, useCallback } from "react";
import ContactHero from "@/src/components/contact/Hero";
import { useSite } from "@/src/app/context/SiteContext";
import { useHeroIntro } from "@/src/app/utils/useHeroIntro";

const SectionCTA = dynamic(() => import("@/src/components/contact/SectionCTA"));
const SectionOne = dynamic(() => import("@/src/components/contact/SectionOne"));
const FAQSection = dynamic(() => import("@/src/components/contact/FAQSection"));
const Footer = dynamic(() => import("@/src/components/Footer"));

const easeOutQuad = (t: number) => t * (2 - t);

export default function ContactMobile() {
  const scopeRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fixedFrameRef = useRef<HTMLDivElement>(null);

  const ctaLayerRef = useRef<HTMLDivElement>(null);
  const sectionOneLayerRef = useRef<HTMLDivElement>(null);
  const faqLayerRef = useRef<HTMLDivElement>(null);
  const footerLayerRef = useRef<HTMLDivElement>(null);

  const scrollMetricsRef = useRef({ totalScrollable: 0, vh: 0, trackTopOffset: 0 });
  const targetProgress = useRef(0);
  const rafId = useRef<number | null>(null);

  const { smootherRef } = useSite();
  const { introDone, preloaderDone, shouldLoadRest } = useHeroIntro(scopeRef, {
    isMobile: true,
    introDurationMs: 2800,
    unlockScrollEarlyMs: 1800,
  });

  // 1. UNLOCK LENIS & INITIALIZE INSTANTLY
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

      // Trigger scroll event on next tick for immediate alignment
      requestAnimationFrame(() => {
        window.dispatchEvent(new Event("scroll"));
      });
    }
  }, [preloaderDone, shouldLoadRest, smootherRef]);

  // 2. CACHE METRICS TO PREVENT LAYOUT THRASHING
  const updateMetrics = useCallback(() => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const vh = window.innerHeight;
    scrollMetricsRef.current = {
      totalScrollable: rect.height - vh,
      vh,
      trackTopOffset: window.scrollY + rect.top,
    };
  }, []);

  useEffect(() => {
    if (!shouldLoadRest) return;
    updateMetrics();
    window.addEventListener("resize", updateMetrics, { passive: true });
    return () => window.removeEventListener("resize", updateMetrics);
  }, [shouldLoadRest, updateMetrics]);

  // 3. GPU-ACCELERATED RENDER LOOP (Continuous contiguous step sequence)
  useEffect(() => {
    if (!shouldLoadRest) return;

    const render = () => {
      const currentProg = targetProgress.current;
      // Contiguous timeline with 4 total transition steps (CTA -> SecOne -> FAQ -> Footer)
      const totalSteps = 4;
      const stepProgress = currentProg * totalSteps;

      const { vh } = scrollMetricsRef.current;

      // Step 1: CTA Reveal (Step 0.0 -> 1.0)
      const ctaProgress = easeOutQuad(Math.min(Math.max(stepProgress - 0, 0), 1));
      if (ctaLayerRef.current) {
        const ctaHeight = ctaLayerRef.current.offsetHeight || vh;
        const startY = vh;
        const endY = -(ctaHeight - vh);
        const currentY = startY + (endY - startY) * ctaProgress;
        ctaLayerRef.current.style.transform = `translate3d(0, ${currentY}px, 0)`;
      }

      // Step 2: Section One Reveal (Step 1.0 -> 2.0)
      const sec1Progress = easeOutQuad(Math.min(Math.max(stepProgress - 1, 0), 1));
      if (sectionOneLayerRef.current) {
        const sec1Height = sectionOneLayerRef.current.offsetHeight || vh;
        const startY = vh;
        const endY = -(sec1Height - vh);
        const currentY = startY + (endY - startY) * sec1Progress;
        sectionOneLayerRef.current.style.transform = `translate3d(0, ${currentY}px, 0)`;
      }

      // Step 3: FAQ Reveal (Step 2.0 -> 3.0)
      const faqProgress = easeOutQuad(Math.min(Math.max(stepProgress - 2, 0), 1));
      if (faqLayerRef.current) {
        const faqHeight = faqLayerRef.current.offsetHeight || vh;
        const startY = vh;
        const endY = -(faqHeight - vh);
        const currentY = startY + (endY - startY) * faqProgress;
        faqLayerRef.current.style.transform = `translate3d(0, ${currentY}px, 0)`;
      }

      // Step 4: Footer Reveal (Step 3.0 -> 4.0)
      const footerProgress = easeOutQuad(Math.min(Math.max(stepProgress - 3, 0), 1));
      if (footerLayerRef.current) {
        const footerHeight = footerLayerRef.current.offsetHeight || vh;
        const startY = vh;
        const endY = vh - footerHeight;
        const translateY = startY + (endY - startY) * footerProgress;
        footerLayerRef.current.style.transform = `translate3d(0, ${translateY}px, 0)`;
      }
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

      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(render);
    };

    const lenis = smootherRef?.current;
    if (lenis && typeof lenis.on === "function") {
      lenis.on("scroll", handleScroll);
    } else {
      window.addEventListener("scroll", handleScroll, { passive: true });
    }

    handleScroll();
    render();

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
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
      <div
        ref={trackRef}
        className="contact-track-container relative w-full"
        style={{ height: "500vh" }}
      >
        <div
          ref={fixedFrameRef}
          className="fixed top-0 left-0 w-full overflow-hidden bg-[#162D24] z-10 h-[100dvh]"
        >
          {/* Layer 1: Hero */}
          <div className="contact-hero-panel absolute inset-0 w-full h-[100dvh] z-10 gpu-accelerated transform-gpu will-change-transform">
            <ContactHero isMobile={true} />
          </div>

          {shouldLoadRest && (
            <>
              {/* Layer 2: CTA */}
              <div
                ref={ctaLayerRef}
                className="layer-auto-height gpu-accelerated absolute left-0 top-0 w-full z-20 will-change-transform"
                style={{ transform: "translate3d(0, 100vh, 0)" }}
              >
                <SectionCTA />
              </div>

              {/* Layer 3: Section One */}
              <div
                ref={sectionOneLayerRef}
                className="layer-auto-height gpu-accelerated absolute left-0 top-0 w-full z-30 will-change-transform"
                style={{ transform: "translate3d(0, 100vh, 0)" }}
              >
                <SectionOne />
              </div>

              {/* Layer 4: FAQ */}
              <div
                ref={faqLayerRef}
                className="layer-auto-height gpu-accelerated absolute left-0 top-0 w-full z-40 will-change-transform"
                style={{ transform: "translate3d(0, 100vh, 0)" }}
              >
                <FAQSection />
              </div>

              {/* Layer 5: Footer */}
              <div
                ref={footerLayerRef}
                className="layer-auto-height gpu-accelerated absolute left-0 top-0 w-full z-50 will-change-transform"
                style={{ transform: "translate3d(0, 100vh, 0)" }}
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