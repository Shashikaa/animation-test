"use client";

import dynamic from "next/dynamic";
import { useRef, useEffect, useCallback } from "react";
import ContactHero from "@/src/components/contact/Hero";
import { useSite } from "@/src/app/context/SiteContext";
import { useHeroIntro } from "@/src/app/utils/useHeroIntro";

const SectionCTA = dynamic(() => import("@/src/components/contact/SectionCTA"));
const SectionOne = dynamic(() => import("@/src/components/contact/SectionOne"));
const FAQSection = dynamic(() => import("@/src/components/contact/FAQSection"));
const Footer = dynamic(() => import("@/src/components/Footer"));

const clamp = (val: number, min = 0, max = 1) => Math.min(Math.max(val, min), max);

export default function ContactMobile() {
  const scopeRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fixedFrameRef = useRef<HTMLDivElement>(null);

  const layer2ContentRef = useRef<HTMLDivElement>(null);
  const layer3FooterRef = useRef<HTMLDivElement>(null);

  const scrollMetricsRef = useRef({
    totalScrollable: 0,
    vh: 0,
    h2: 0,
    h3: 0,
    dist1: 0,
    dist2: 0,
    dist3: 0,
    trackTopOffset: 0,
  });

  const rawProgress = useRef(0);
  const rafId = useRef<number | null>(null);

  const { smootherRef } = useSite();
  const { preloaderDone, shouldLoadRest } = useHeroIntro(scopeRef, {
    isMobile: true,
    introDurationMs: 2800,
    unlockScrollEarlyMs: 1800,
  });

  useEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  const updateMetrics = useCallback(() => {
    if (!trackRef.current || !layer2ContentRef.current || !layer3FooterRef.current) return;

    const vh = window.innerHeight;
    const h2 = layer2ContentRef.current.offsetHeight || vh;
    const h3 = layer3FooterRef.current.offsetHeight || vh;

    const dist1 = vh;
    const dist2 = Math.max(0, h2 - vh);
    const dist3 = h3;

    const totalScrollable = dist1 + dist2 + dist3;
    const totalTrackHeight = totalScrollable + vh;

    scrollMetricsRef.current = {
      totalScrollable,
      vh,
      h2,
      h3,
      dist1,
      dist2,
      dist3,
      trackTopOffset: window.scrollY + trackRef.current.getBoundingClientRect().top,
    };

    trackRef.current.style.height = `${totalTrackHeight}px`;

    const lenis = smootherRef?.current;
    if (lenis && typeof lenis.resize === "function") {
      lenis.resize();
    }
  }, [smootherRef]);

  useEffect(() => {
    if (!shouldLoadRest) return;

    updateMetrics();

    const resizeObserver = new ResizeObserver(() => updateMetrics());
    if (layer2ContentRef.current) resizeObserver.observe(layer2ContentRef.current);
    if (layer3FooterRef.current) resizeObserver.observe(layer3FooterRef.current);

    window.addEventListener("resize", updateMetrics, { passive: true });

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateMetrics);
    };
  }, [shouldLoadRest, updateMetrics]);

  useEffect(() => {
    if (!shouldLoadRest) return;

    const render = () => {
      const currentProg = rawProgress.current;
      const { totalScrollable, vh, h2, h3, dist1, dist2, dist3 } = scrollMetricsRef.current;

      if (totalScrollable <= 0) return;

      const relativeScroll = currentProg * totalScrollable;

      // Linear motion profile matching About page travel velocity
      let layer2Y = vh;
      if (relativeScroll <= dist1) {
        const p1 = relativeScroll / dist1;
        layer2Y = vh * (1 - p1);
      } else if (relativeScroll <= dist1 + dist2) {
        layer2Y = -(relativeScroll - dist1);
      } else {
        layer2Y = -(h2 - vh);
      }

      if (layer2ContentRef.current) {
        layer2ContentRef.current.style.transform = `translate3d(0, ${layer2Y}px, 0)`;
      }

      let footerY = vh;
      if (relativeScroll > dist1 + dist2 && dist3 > 0) {
        const footerProgress = Math.min((relativeScroll - (dist1 + dist2)) / dist3, 1);
        footerY = vh - h3 * footerProgress;
      }

      if (layer3FooterRef.current) {
        layer3FooterRef.current.style.transform = `translate3d(0, ${footerY}px, 0)`;
      }
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

      rawProgress.current = clamp(relativeScroll / totalScrollable);

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

  return (
    <div ref={scopeRef} className="w-full bg-[#162D24]">
      <div ref={trackRef} className="contact-track-container relative w-full">
        <div
          ref={fixedFrameRef}
          className="fixed top-0 left-0 w-full overflow-hidden z-10 h-[100dvh]"
        >
          <div className="absolute inset-0 w-full h-[100dvh] z-10 gpu-accelerated">
            <ContactHero isMobile={true} />
          </div>

          {shouldLoadRest && (
            <>
              <div
                ref={layer2ContentRef}
                id="contact-section"
                className="absolute top-0 left-0 w-full z-20 bg-[#162D24] shadow-[0_-20px_50px_rgba(0,0,0,0.5)] rounded-t-[24px] gpu-accelerated will-change-transform"
                style={{ transform: "translate3d(0, 100vh, 0)" }}
              >
                <section className="relative w-full pt-4">
                  <SectionCTA />
                </section>
                <section className="relative w-full">
                  <SectionOne />
                </section>
                <section className="relative w-full">
                  <FAQSection />
                </section>
              </div>

              <div
                ref={layer3FooterRef}
                className="absolute top-0 left-0 w-full z-30 shadow-[0_-20px_50px_rgba(0,0,0,0.6)] rounded-t-[24px] gpu-accelerated will-change-transform"
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