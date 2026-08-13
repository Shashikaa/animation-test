"use client";

import dynamic from "next/dynamic";
import { useRef, useEffect, useCallback } from "react";
import ContactHero from "@/src/components/contact/Hero";
import { useSite } from "@/src/app/context/SiteContext";
import { useHeroIntro } from "@/src/app/utils/useHeroIntro";
import { useStackedScroll } from "@/src/app/utils/useStackedScroll";

const SectionCTA = dynamic(() => import("@/src/components/contact/SectionCTA"));
const SectionOne = dynamic(() => import("@/src/components/contact/SectionOne"));
const FAQSection = dynamic(() => import("@/src/components/contact/FAQSection"));
const Footer = dynamic(() => import("@/src/components/Footer"));

const easeOutQuad = (t: number) => t * (2 - t);

export default function ContactMobile() {
  const scopeRef = useRef<HTMLDivElement>(null);
  const layer2ContentRef = useRef<HTMLDivElement>(null);
  const layer3FooterRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number | null>(null);

  const { smootherRef } = useSite();
  const { preloaderDone, shouldLoadRest } = useHeroIntro(scopeRef, {
    isMobile: true,
    introDurationMs: 2800,
    unlockScrollEarlyMs: 1800,
  });

  const { trackRef, fixedFrameRef, rawProgress, scrollMetricsRef } = useStackedScroll({
    totalSteps: 3,
    shouldLoadRest,
  });

  useEffect(() => {
    if (!shouldLoadRest) return;

    const render = () => {
      const p = rawProgress.current;
      const { vh } = scrollMetricsRef.current;

      const h2 = layer2ContentRef.current?.offsetHeight || vh;
      const h3 = layer3FooterRef.current?.offsetHeight || vh;

      // Phase 1: Slide Layer 2 onto screen (0.00 - 0.33)
      // Phase 2: Scroll through Layer 2 body (0.33 - 0.66)
      // Phase 3: Footer slide overlay (0.66 - 1.00)
      let layer2Y = vh;
      if (p <= 0.33) {
        const p1 = easeOutQuad(p / 0.33);
        layer2Y = vh * (1 - p1);
      } else if (p <= 0.66) {
        const p2 = (p - 0.33) / 0.33;
        layer2Y = -p2 * Math.max(0, h2 - vh);
      } else {
        layer2Y = -(h2 - vh);
      }

      if (layer2ContentRef.current) {
        layer2ContentRef.current.style.transform = `translate3d(0, ${layer2Y}px, 0)`;
      }

      let footerY = vh;
      if (p > 0.66) {
        const p3 = easeOutQuad((p - 0.66) / 0.34);
        footerY = vh - p3 * h3;
      }

      if (layer3FooterRef.current) {
        layer3FooterRef.current.style.transform = `translate3d(0, ${footerY}px, 0)`;
      }
    };

    const handleScroll = () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(render);
    };

    const lenis = smootherRef?.current;
    if (lenis && typeof lenis.on === "function") {
      lenis.on("scroll", handleScroll);
    } else {
      window.addEventListener("scroll", handleScroll, { passive: true });
    }

    render();

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      if (lenis && typeof lenis.off === "function") {
        lenis.off("scroll", handleScroll);
      } else {
        window.removeEventListener("scroll", handleScroll);
      }
    };
  }, [shouldLoadRest, smootherRef, rawProgress, scrollMetricsRef]);

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