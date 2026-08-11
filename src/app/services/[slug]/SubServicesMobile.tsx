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

// Standardized Metrics
const PX_PER_MAIN_PANEL = 850; 
const PX_PER_SUB_STEP = 350;   
const PAUSE_PX = 100;          

export default function SubServicesMobile({ pageData }: SubServicesMobileProps) {
  const scopeRef = useRef<HTMLDivElement>(null);

  // Single unified utility hook configured for Mobile
  const { introDone } = useHeroIntro(scopeRef, { isMobile: true });

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(".services-hero-top-layer", { width: "100%", xPercent: 0, force3D: true }); 
      
      // Position Section One fully below the screen for a smooth slide-up
      gsap.set(".section-one-wrap", { yPercent: 100, visibility: "hidden", force3D: true });
      
      gsap.set(".s10-seq-container", { y: 0, force3D: true });
      gsap.set(".s10-seq-p", { opacity: 1 });

      gsap.set(".s1-glass-card", { x: 40, opacity: 0, force3D: true }); 
      gsap.set([".s1-static-title", ".s1-static-desc"], { opacity: 0, y: 30, force3D: true });
      gsap.set([".s1-reveal-top", ".s1-reveal-bottom"], { opacity: 0, y: 40, force3D: true });

      gsap.set(".services-faq-wrap", { visibility: "hidden", y: "100%", force3D: true });
      gsap.set(".faq-content", { opacity: 1, y: 0 });
      
      gsap.set([".services-section-cta", ".services-footer-wrap"], { yPercent: 100, visibility: "hidden", force3D: true });
      gsap.set([".services-section-cta .cta-inner-desktop", ".services-section-cta .cta-inner-mobile"], { opacity: 1 });
      gsap.set(".services-section-cta", { zIndex: 95 });
      gsap.set(".services-footer-wrap", { zIndex: 96 });
    }, scopeRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!introDone) return;

    const ctx = gsap.context(() => {
      const isTouchDevice = ScrollTrigger.isTouch > 0 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
      if (isTouchDevice) {
        ScrollTrigger.normalizeScroll(true);
      }

      const ACTION = 1.4;
      const DEAD_SCROLL = 0.2;

      const MAIN_PANELS_COUNT = 5;
      const SUB_STEPS_COUNT = 3;
      const PAUSES_COUNT = 7;

      const DYNAMIC_SCROLL_TRACK = 
        (MAIN_PANELS_COUNT * PX_PER_MAIN_PANEL) + 
        (SUB_STEPS_COUNT * PX_PER_SUB_STEP) + 
        (PAUSES_COUNT * PAUSE_PX);

      const scrollTl = gsap.timeline({
        defaults: { ease: "none", lazy: true }, 
        scrollTrigger: {
          trigger: ".services-hero-master",
          start: "top top",
          end: `+=${DYNAMIC_SCROLL_TRACK}`,
          pin: true,
          pinType: "fixed",
          pinSpacing: true,
          scrub: 0.5,
          invalidateOnRefresh: false,
          fastScrollEnd: true,
          preventOverlaps: true
        }
      });

      // ── PHASE 1: HERO INNER ANIMATIONS (TEXT & BG TRANSITION) ──
      scrollTl.addLabel("phase1")
        .to(".hero-text-wrap", {
          opacity: 0,
          y: -30,
          duration: ACTION * 0.25,
          ease: "power2.in"
        }, "phase1")

        .to(".services-hero-top-layer", {
          width: "0%", 
          xPercent: -100,
          duration: ACTION, 
          ease: "power2.inOut",
        }, "phase1")

        .to(".service-hero-bg", {
          scale: 1.0,
          duration: ACTION,
          ease: "power2.inOut"
        }, "phase1");

      scrollTl.to({}, { duration: DEAD_SCROLL });

      // ── PHASE 2: SECTION ONE SLIDES UP OVER HERO ──
      scrollTl.addLabel("phase2")
        .set(".section-one-wrap", { visibility: "visible" }, "phase2")
        .to(".section-one-wrap", {
          yPercent: 0,
          duration: ACTION, 
          ease: "power2.inOut"
        }, "phase2")
        .to(".service-hero-bg", {
          scale: 1.05,     
          duration: ACTION, 
          ease: "power2.inOut",
        }, "phase2");

      scrollTl.to({}, { duration: DEAD_SCROLL });

      // ── PHASE 2.5: EXPAND IMAGE CONTAINER ──
      scrollTl.addLabel("phase2_expanded")
        .to([".s10-para-top", ".s10-title"], {
          opacity: 0,
          y: -35,
          duration: ACTION * 0.4,
          ease: "power2.in"
        }, "phase2_expanded")
        
        .to(".s10-img-absolute-container", {
          width: "100vw",
          height: "100dvh",
          right: "0px",
          bottom: "0px",
          borderRadius: "0px",
          duration: ACTION, 
          ease: "power2.inOut"
        }, "phase2_expanded")
        
        .to(".s10-img-element", {
          scale: 1.06,
          duration: ACTION, 
          ease: "power2.inOut"
        }, "phase2_expanded");

      scrollTl.to({}, { duration: DEAD_SCROLL });

      // ── SEQUENTIAL PARAGRAPHS ROLL UP ──
      scrollTl.addLabel("text1")
        .to(".s10-seq-container", { y: -380, duration: ACTION, ease: "power2.inOut" })
        .addLabel("text2")
        .to(".s10-seq-container", { y: -760, duration: ACTION, ease: "power2.inOut" })
        .addLabel("text3")
        .to(".s10-seq-container", { y: -1240, duration: ACTION, ease: "power2.inOut" })
        .addLabel("text4");

      scrollTl.to({}, { duration: DEAD_SCROLL });

      // ── PHASE 2.6: FAQ SECTION SLIDE UP ──
      scrollTl.addLabel("faq", "text4")
        .set(".services-faq-wrap", { visibility: "visible" }, "faq")
        .to(".services-faq-wrap", {
          y: "0%",
          duration: ACTION, 
          ease: "power2.inOut"
        }, "faq");

      scrollTl.to({}, { duration: DEAD_SCROLL });

      // ── CTA REVEAL TRACK ──
      scrollTl.addLabel("ctaStart", ">")
        .set(".services-section-cta", { visibility: "visible" }, "ctaStart")
        .to(".services-section-cta", { yPercent: 0, duration: ACTION, ease: "power2.inOut" }, "ctaStart")
        .to(".services-faq-wrap", { yPercent: -10, duration: ACTION, ease: "power2.inOut" }, "ctaStart");

      scrollTl.to({}, { duration: DEAD_SCROLL });

      // ── FOOTER REVEAL TRACK (Slides up directly over CTA) ──
      scrollTl.addLabel("footerStart", ">")
        .set(".services-footer-wrap", { visibility: "visible" }, "footerStart")
        .to(".services-footer-wrap", { 
          yPercent: 0, 
          duration: ACTION, 
          ease: "power2.inOut" 
        }, "footerStart");

    }, scopeRef);

    return () => {
      ctx.revert();
      if (ScrollTrigger.isTouch) {
        ScrollTrigger.normalizeScroll(false);
      }
      if (scopeRef.current) {
        restoreTextReveal(scopeRef.current, ".s2-reveal-text");
      }
    };
  }, [introDone]);

  return (
    <div ref={scopeRef} className="w-full relative min-h-[100dvh] bg-black text-white overflow-hidden">
      <div className="services-hero-master pin-all-subservices relative w-full overflow-hidden z-10">
        
        {/* Layer 1: Hero view base */}
        <div className="gpu-accelerated absolute inset-0 w-full h-full z-10">
          <SubServiceHero data={pageData.hero} />
        </div>
        
        {/* Layer 2: Section One scrolling sheet */}
        <div className="section-one-wrap gpu-accelerated absolute inset-0 w-full h-full z-20 overflow-hidden">
          <SubServiceSectionOne data={pageData.sectionOne} />
        </div>

        {/* Layer 3: FAQ slide overlay */}
        <div className="services-faq-wrap gpu-accelerated absolute inset-0 w-full h-full z-30 overflow-hidden">
          <SubServiceFAQSection data={pageData.sectionTwo} />
        </div>

        {/* Layer 4: Section CTA wrapper */}
        <div className="services-section-cta gpu-accelerated absolute bottom-0 left-0 w-full structural-layer z-[95] bg-black">
          <SectionCTA />
        </div>

        {/* Layer 5: Footer wrapper */}
        <div className="services-footer-wrap gpu-accelerated absolute left-0 bottom-0 w-full structural-layer z-[96]">
          <Footer />
        </div>
        
      </div>
    </div>
  );
}