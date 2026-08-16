"use client";

import dynamic from "next/dynamic";
import ContactHero from "@/src/components/contact/Hero";
import { useState, useRef, useEffect, useCallback } from "react";
import { useSite } from "@/src/app/context/SiteContext";
import { useHeroIntro } from "@/src/app/utils/useHeroIntro";

const SectionCTA = dynamic(() => import("@/src/components/contact/SectionCTA"));
const SectionOne = dynamic(() => import("@/src/components/contact/SectionOne"));
const FAQSection = dynamic(() => import("@/src/components/contact/FAQSection"));
const Footer = dynamic(() => import("@/src/components/Footer"));

const clamp = (val: number, min = 0, max = 1) =>
  Math.min(Math.max(val, min), max);

const mapRange = (val: number, inMin: number, inMax: number) => {
  if (inMin === inMax) return 0;
  return clamp((val - inMin) / (inMax - inMin));
};

export default function ContactMobile() {
  const scopeRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fixedFrameRef = useRef<HTMLDivElement>(null);

  const layer2ContentRef = useRef<HTMLDivElement>(null);
  const layer3FooterRef = useRef<HTMLDivElement>(null);

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

  const { shouldLoadRest } = useHeroIntro(scopeRef, {
    isMobile: true,
    introDurationMs: 2800,
    unlockScrollEarlyMs: 1800,
  });

  const updateMetrics = useCallback(() => {
    if (!trackRef.current) return;

    const vh = window.innerHeight;
    const vw = window.innerWidth;

    const h2 = layer2ContentRef.current?.offsetHeight || vh;
    const footerHeight = layer3FooterRef.current?.offsetHeight || vh;

    // Distances: Reduced CTA entrance scroll distance to make CTA slide up faster
    const ctaEntranceDist = vh * 0.55; 
    const contentScrollDist = Math.max(0, h2 - vh);
    const footerDist = footerHeight;

    const totalTrackHeight = vh + ctaEntranceDist + contentScrollDist + footerDist;
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
      
const EASE_FACTOR = isAndroid ? 0.1 : 0.5;
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

      const { vh } = scrollMetricsRef.current;
      const h2 = layer2ContentRef.current?.offsetHeight || vh;
      const h3 = layer3FooterRef.current?.offsetHeight || vh;

      // Tightened mapRange: 0.0 -> 0.18 gives CTA a fast, responsive 1:1 speed match with the About page stack transitions
      const contentEntranceProg = mapRange(p, 0.0, 0.18);
      const contentScrollProg = mapRange(p, 0.18, 0.82);
      const footerProgress = mapRange(p, 0.82, 1.0);

      if (layer2ContentRef.current) {
        let layer2Y = vh;
        if (p <= 0.18) {
          layer2Y = vh * (1 - contentEntranceProg);
        } else if (p <= 0.82) {
          layer2Y = -contentScrollProg * Math.max(0, h2 - vh);
        } else {
          layer2Y = -(h2 - vh);
        }
        layer2ContentRef.current.style.transform = `translate3d(0, ${layer2Y}px, 0)`;
      }

      if (layer3FooterRef.current) {
        const y = vh - h3 * footerProgress;
        layer3FooterRef.current.style.transform = `translate3d(0, ${y}px, 0)`;
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
      <div ref={trackRef} className="contact-track-container relative w-full">
        <div
          ref={fixedFrameRef}
          className="fixed top-0 left-0 w-full overflow-hidden z-10 h-svh"
        >
          <div className="absolute inset-0 w-full h-svh z-10 transform-gpu will-change-transform backface-hidden">
            <ContactHero isMobile={true} />
          </div>

          {shouldLoadRest && (
            <>
              <div
                ref={layer2ContentRef}
                id="contact-section"
                className="absolute top-0 left-0 w-full z-20 bg-[#162D24] shadow-[0_-20px_50px_rgba(0,0,0,0.5)] rounded-t-[24px] transform-gpu will-change-transform backface-hidden"
                style={{ transform: "translate3d(0, 100svh, 0)" }}
              >
                <section className="relative w-full pt-4">
                  <SectionCTA />
                </section>
                <section className="relative w-full">
                  <SectionOne />
                </section>
                <section className="relative w-full">
                  <FAQSection onLayoutChange={updateMetrics} />
                </section>
              </div>

              <div
                ref={layer3FooterRef}
                className="absolute top-0 left-0 w-full z-30 shadow-[0_-20px_50px_rgba(0,0,0,0.6)] rounded-t-[24px] transform-gpu will-change-transform backface-hidden"
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