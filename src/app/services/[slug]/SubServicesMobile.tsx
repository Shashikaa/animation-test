"use client";

import { useRef, useEffect, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useHeroIntro } from "@/src/app/utils/useHeroIntro";
import { restoreTextReveal } from "@/src/app/utils/useTextReveal";
import SubServiceHero from "@/src/components/Service/SubServiceHero";
import SubServiceSectionOne from "@/src/components/Service/SubServiceSectionOne";
import SubServiceFAQSection from "@/src/components/Service/SubServiceFAQSection";
import SectionCTA from "@/src/components/SectionCTA";
import Footer from "@/src/components/Footer";
import { FullServiceData } from "./data";

gsap.registerPlugin(ScrollTrigger);

type SubServicesMobileProps = {
  pageData: FullServiceData;
};

// Standardized Metrics aligned with AboutMobile
const PX_PER_MAIN_PANEL = 850;
const PX_PER_SUB_STEP = 350;
const PAUSE_PX = 150;
const BASELINE_VH = 800;

export default function SubServicesMobile({ pageData }: SubServicesMobileProps) {
  const scopeRef = useRef<HTMLDivElement>(null);

  // Single unified utility hook configured for Mobile
  const { introDone } = useHeroIntro(scopeRef, { isMobile: true });

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(".subservice-hero-panel", { yPercent: 0, force3D: true });
      gsap.set(".services-hero-top-layer", { width: "100%", xPercent: 0, force3D: true });

      // Panel layouts matching the standard initial state setup
      gsap.set(".section-one-wrap", { yPercent: 100, zIndex: 20, visibility: "visible", force3D: true });

      gsap.set(".s10-seq-container", { y: 0, force3D: true });
      gsap.set(".s10-seq-p", { opacity: 1 });

      gsap.set(".s1-glass-card", { x: 40, opacity: 0, force3D: true });
      gsap.set([".s1-static-title", ".s1-static-desc"], { opacity: 0, y: 30, force3D: true });
      gsap.set([".s1-reveal-top", ".s1-reveal-bottom"], { opacity: 0, y: 40, force3D: true });

      gsap.set(".services-faq-wrap", { yPercent: 100, zIndex: 30, visibility: "visible", force3D: true });
      gsap.set(".faq-content", { opacity: 1, y: 0 });

      gsap.set(".services-section-cta", { yPercent: 100, zIndex: 95, visibility: "hidden", force3D: true });
      gsap.set(
        [".services-section-cta .cta-inner-desktop", ".services-section-cta .cta-inner-mobile"],
        { opacity: 1, y: 0, pointerEvents: "auto", visibility: "visible" }
      );
      gsap.set(".services-footer-wrap", { yPercent: 100, zIndex: 96, visibility: "hidden", force3D: true });
    }, scopeRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!introDone) return;

    const isAndroid = /Android/i.test(navigator.userAgent);

    const ctx = gsap.context(() => {
      ScrollTrigger.config({ ignoreMobileResize: true });

      if (!isAndroid) {
        ScrollTrigger.normalizeScroll({
          allowNestedScroll: true,
          lockAxis: true,
        });
      }

      const ACTION = 1.4;
      const DEAD_SCROLL = 0.15;
      const UNIFIED_EASE = "power1.inOut";

      const MAIN_PANELS_COUNT = 5;
      const SUB_STEPS_COUNT = 3;
      const PAUSES_COUNT = 7;

      const vh = window.innerHeight || BASELINE_VH;
      const scaleFactor = vh / BASELINE_VH;

      const DYNAMIC_SCROLL_TRACK =
        (MAIN_PANELS_COUNT * PX_PER_MAIN_PANEL +
          SUB_STEPS_COUNT * PX_PER_SUB_STEP +
          PAUSES_COUNT * PAUSE_PX) *
        scaleFactor;

      const tl = gsap.timeline({
        defaults: { ease: UNIFIED_EASE, lazy: true },
        scrollTrigger: {
          trigger: ".services-hero-master",
          start: "top top",
          end: `+=${DYNAMIC_SCROLL_TRACK}`,
          pin: true,
          pinType: "fixed",
          scrub: isAndroid ? 0.2 : 0.6,
          anticipatePin: 1,
          preventOverlaps: true,
          fastScrollEnd: true,
          invalidateOnRefresh: true,
        },
      });

      // --- PHASE 1: HERO INNER ANIMATIONS (TEXT & BG TRANSITION) ---
      tl.addLabel("phase1")
        .to(
          ".hero-text-wrap",
          {
            opacity: 0,
            y: -30,
            duration: ACTION * 0.25,
            ease: "power2.in",
          },
          "phase1"
        )
        .to(
          ".services-hero-top-layer",
          {
            width: "0%",
            xPercent: -100,
            duration: ACTION,
          },
          "phase1"
        )
        .to(
          ".service-hero-bg",
          {
            scale: 1.0,
            duration: ACTION,
          },
          "phase1"
        );

      tl.to({}, { duration: DEAD_SCROLL });

      // --- PHASE 2: SECTION ONE SLIDES UP OVER HERO ---
      tl.addLabel("phase2")
        .to(
          ".section-one-wrap",
          {
            yPercent: 0,
            duration: ACTION,
          },
          "phase2"
        )
        .to(".subservice-hero-panel", { yPercent: -15, duration: ACTION }, "phase2")
        .to(
          ".service-hero-bg",
          {
            scale: 1.05,
            duration: ACTION,
          },
          "phase2"
        );

      tl.to({}, { duration: DEAD_SCROLL });

      // --- PHASE 2.5: EXPAND IMAGE CONTAINER ---
      tl.addLabel("phase2_expanded")
        .to(
          [".s10-para-top", ".s10-title"],
          {
            opacity: 0,
            y: -35,
            duration: ACTION * 0.4,
            ease: "power2.in",
          },
          "phase2_expanded"
        )
        .to(
          ".s10-img-absolute-container",
          {
            width: "100vw",
            height: "100dvh",
            right: "0px",
            bottom: "0px",
            borderRadius: "0px",
            duration: ACTION,
          },
          "phase2_expanded"
        )
        .to(
          ".s10-img-element",
          {
            scale: 1.06,
            duration: ACTION,
          },
          "phase2_expanded"
        );

      tl.to({}, { duration: DEAD_SCROLL });

      // --- SEQUENTIAL PARAGRAPHS ROLL UP ---
      tl.addLabel("text1")
        .to(".s10-seq-container", { y: -380, duration: ACTION })
        .addLabel("text2")
        .to(".s10-seq-container", { y: -760, duration: ACTION })
        .addLabel("text3")
        .to(".s10-seq-container", { y: -1240, duration: ACTION })
        .addLabel("text4");

      tl.to({}, { duration: DEAD_SCROLL });

      // --- PHASE 2.6: FAQ SECTION SLIDE UP ---
      tl.addLabel("faq", "text4")
        .to(
          ".services-faq-wrap",
          {
            yPercent: 0,
            duration: ACTION,
          },
          "faq"
        )
        .to(".section-one-wrap", { yPercent: -15, duration: ACTION }, "faq");

      tl.to({}, { duration: DEAD_SCROLL });

      // --- CTA REVEAL TRACK ---
      tl.addLabel("ctaStart", ">")
        .set(".services-section-cta", { visibility: "visible" }, "ctaStart")
        .fromTo(
          ".services-section-cta",
          { yPercent: 100 },
          { yPercent: 0, duration: ACTION },
          "ctaStart"
        )
        .to(".services-faq-wrap", { yPercent: -15, duration: ACTION }, "ctaStart");

      tl.to({}, { duration: DEAD_SCROLL });

      // --- FOOTER REVEAL TRACK ---
      tl.addLabel("footerStart", ">")
        .set(".services-footer-wrap", { visibility: "visible" }, "footerStart")
        .fromTo(
          ".services-footer-wrap",
          { yPercent: 100 },
          {
            yPercent: 0,
            duration: ACTION,
            ease: "power1.out",
          },
          "footerStart"
        );
    }, scopeRef);

    return () => {
      ctx.revert();
      if (!isAndroid) {
        ScrollTrigger.normalizeScroll(false);
      }
      if (scopeRef.current) {
        restoreTextReveal(scopeRef.current, ".s2-reveal-text");
      }
    };
  }, [introDone]);

  return (
    <div ref={scopeRef} className="w-full relative min-h-[100dvh] bg-black text-white overflow-hidden">
      <div
        className="services-hero-master pin-all-subservices relative w-full h-[100dvh] overflow-hidden z-10"
        style={{ visibility: "visible" }}
      >
        {/* Layer 1: Hero */}
        <div className="subservice-hero-panel gpu-accelerated absolute inset-0 w-full h-full" style={{ zIndex: 10 }}>
          <SubServiceHero data={pageData.hero} />
        </div>

        {/* Layer 2: Section One */}
        <div
          className="section-one-wrap gpu-accelerated absolute inset-0 w-full h-full overflow-hidden"
          style={{ zIndex: 20 }}
        >
          <SubServiceSectionOne data={pageData.sectionOne} />
        </div>

        {/* Layer 3: FAQ */}
        <div
          className="services-faq-wrap gpu-accelerated absolute inset-0 w-full h-full overflow-hidden"
          style={{ zIndex: 30 }}
        >
          <SubServiceFAQSection data={pageData.sectionTwo} />
        </div>

        {/* Layer 4: Section CTA */}
        <div
          className="services-section-cta gpu-accelerated absolute bottom-0 left-0 w-full min-h-[100dvh] bg-black"
          style={{ zIndex: 95, pointerEvents: "auto", visibility: "hidden" }}
        >
          <SectionCTA />
        </div>

        {/* Layer 5: Footer */}
        <div
          className="services-footer-wrap gpu-accelerated absolute left-0 bottom-0 w-full"
          style={{ zIndex: 96, pointerEvents: "auto", visibility: "hidden" }}
        >
          <Footer />
        </div>
      </div>
    </div>
  );
}