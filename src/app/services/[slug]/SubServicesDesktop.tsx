"use client";

import { useRef, useEffect, useLayoutEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSite } from "@/src/app/context/SiteContext";
import { useTextReveal, restoreTextReveal } from "@/src/app/utils/useTextReveal";
import SubServiceHero from "@/src/components/Service/SubServiceHero";
import SubServiceSectionOne from "@/src/components/Service/SubServiceSectionOne";
import SubServiceFAQSection from "@/src/components/Service/SubServiceFAQSection";
import SectionCTA from "@/src/components/SectionCTA";
import Footer from "@/src/components/Footer";
import { FullServiceData } from "./data";

gsap.registerPlugin(ScrollTrigger);

const isTouchOnly = () => ScrollTrigger.isTouch === 1;

// Standardized Desktop Metrics (Matched to Home Setup)
const PX_PER_MAIN_PANEL = 1000;
const PX_PER_SUB_STEP = 600;
const PAUSE_PX = 350;

type SubServicesDesktopProps = {
  pageData: FullServiceData;
};

export default function SubServicesDesktop({ pageData }: SubServicesDesktopProps) {
  const { setPreloaderDone, preloaderDone } = useSite();
  const scopeRef = useRef<HTMLDivElement>(null);
  
  const [introDone, setIntroDone] = useState(false);

  // Setup initial scroll state and preloader signals
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.history.scrollRestoration) {
      window.history.scrollRestoration = "manual";
    }

    const isFullyReady = preloaderDone && introDone;

    if (!isFullyReady) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      window.scrollTo(0, 0);
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    }

    document.body.classList.remove("preloading");
    setPreloaderDone(true);

    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [setPreloaderDone, preloaderDone, introDone]);

  // Offscreen layout setup
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.config({
        ignoreMobileResize: true,
        autoRefreshEvents: "DOMContentLoaded,load,visibilitychange,resize",
      });

      gsap.set(".service-hero-bg", { scale: 1.4, xPercent: 0, force3D: true, transformOrigin: "center center" });
      gsap.set([".hero-title", ".hero-desc", ".hero-btn"], { opacity: 0, y: -60, force3D: true });
      gsap.set(".services-hero-top-layer", { width: "100%", force3D: true }); 
      
      gsap.set(".section-one-wrap", { clipPath: "inset(100% 0% 0% 0%)", WebkitClipPath: "inset(100% 0% 0% 0%)", force3D: true });
      
      gsap.set(".s10-seq-container", { y: 0, force3D: true });
      gsap.set(".s10-seq-p", { opacity: 1, force3D: true });

      gsap.set(".s1-glass-card", { x: 40, opacity: 0, force3D: true }); 
      gsap.set([".s1-static-title", ".s1-static-desc"], { opacity: 0, y: 30, force3D: true });
      gsap.set([".s1-reveal-top", ".s1-reveal-bottom"], { opacity: 0, y: 40, force3D: true });

      // Panel setups
      gsap.set(".services-faq-wrap", { visibility: "hidden", yPercent: 100, force3D: true });
      gsap.set(".services-section-two-wrap", { visibility: "hidden", clipPath: "inset(0% 0% 0% 100%)", WebkitClipPath: "inset(0% 0% 0% 100%)", force3D: true });
      
      // CTA and Footer tracking sets
      gsap.set(".services-section-cta", { yPercent: 100, visibility: "hidden", zIndex: 95, force3D: true });
      gsap.set(".services-footer-wrap", { yPercent: 100, visibility: "hidden", zIndex: 96, force3D: true });
      gsap.set([".cta-inner-desktop", ".cta-inner-mobile"], { opacity: 1, force3D: true });
    }, scopeRef);
    return () => ctx.revert();
  }, []);

  // Play Intro Cinematic Animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      const introTl = gsap.timeline({
        onComplete: () => {
          setIntroDone(true);
        }
      });

      introTl.to(".service-hero-bg", {
        scale: 1.15, 
        duration: 1.5,
        ease: "power2.out"
      }, 0);

      introTl.to([".hero-title", ".hero-desc", ".hero-btn"], {
        opacity: 1,
        y: 0,
        duration: 1.0,
        stagger: 0.15,
        ease: "power2.out",
      }, 0.2);
    }, scopeRef);

    return () => ctx.revert();
  }, []);

  // Master Single ScrollTrigger Timeline
  useEffect(() => {
    if (!introDone || !preloaderDone) return;

    if (isTouchOnly()) {
      ScrollTrigger.normalizeScroll(true);
    }

    let vvCleanup: (() => void) | null = null;

    const ctx = gsap.context(() => {
      gsap.ticker.lagSmoothing(500, 33);

      const performanceTargets = [
        ".services-hero-master", ".service-hero-bg", ".services-hero-top-layer",
        ".section-one-wrap", ".s1-glass-card", ".s10-seq-container",
        ".s10-img-absolute-container", ".s10-img-element", ".services-faq-wrap",
        ".services-section-cta", ".services-footer-wrap"
      ];

      performanceTargets.forEach(selector => {
        gsap.set(selector, {
          force3D: true,
          willChange: "transform, opacity, clip-path"
        });
      });

      const buildTimeline = () => {
        ScrollTrigger.refresh();

        const vv = typeof visualViewport !== "undefined" ? visualViewport : null;
        if (vv) {
          const onVVResize = () => ScrollTrigger.refresh(true);
          vv.addEventListener("resize", onVVResize);
          vvCleanup = () => vv.removeEventListener("resize", onVVResize);
        }

        // Standardized Duration Metrics (Matched to Home Setup)
        const PANEL_ACTION = 2.0;
        const SUB_ACTION = 1.8;
        const PAUSE_ACTION = 0.4;

        const MAIN_PANELS_COUNT = 6;
        const SUB_STEPS_COUNT = 3;
        const PAUSES_COUNT = 5;

        const DYNAMIC_SCROLL_TRACK = 
          (MAIN_PANELS_COUNT * PX_PER_MAIN_PANEL) + 
          (SUB_STEPS_COUNT * PX_PER_SUB_STEP) + 
          (PAUSES_COUNT * PAUSE_PX);

        const tl = gsap.timeline({
          defaults: { ease: "none" }, 
          scrollTrigger: {
            trigger: ".sub-services-pin",
            start: "top top",
            end: `+=${DYNAMIC_SCROLL_TRACK}`, 
            scrub: 1,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            preventOverlaps: true,
            invalidateOnRefresh: true,
          }
        });

        // ── HERO HOLD BUFFER ──
        tl.addLabel("heroStart", 0);
        tl.set(".hero-btn", { pointerEvents: "auto", zIndex: 50 }, 0);
        tl.set(".hero-text-wrap", { transformOrigin: "left bottom" }, 0);

        tl.to(".hero-text-wrap", { y: 10, scale: 0.75, duration: PANEL_ACTION * 0.5 }, 0)
          .to(".services-hero-top-layer", { width: "60%", duration: PANEL_ACTION * 0.5 }, 0)
          .to(".hero-btn", { opacity: 0, duration: PANEL_ACTION * 0.1, ease: "power2.out", pointerEvents: "none" }, 0);

        tl.to({}, { duration: PAUSE_ACTION });

        // ── SECTION 1 REVEAL ──
        tl.addLabel("sec1Start", ">")
          .to(".section-one-wrap", {
            clipPath: "inset(0% 0% 0% 0%)",
            WebkitClipPath: "inset(0% 0% 0% 0%)",
            duration: PANEL_ACTION, 
            ease: "power2.inOut"
          }, "sec1Start")
          .to(".service-hero-bg", {
            xPercent: -8,
            scale: 1.6,     
            duration: PANEL_ACTION, 
            ease: "power2.inOut",
          }, "sec1Start");

        tl.to({}, { duration: PAUSE_ACTION });

        // ── SCALE UP ──
        tl.addLabel("sec1Expanded", ">")
          .to([".s10-para-top", ".s10-title"], {
            opacity: 0,
            y: -45,
            duration: PANEL_ACTION * 0.4,
            ease: "power2.in"
          }, "sec1Expanded")
          
          .to(".s10-img-absolute-container", {
            width: "100vw",
            height: "100vh",
            right: "0px",
            bottom: "0px",
            borderRadius: "0px",
            duration: PANEL_ACTION, 
            ease: "power2.inOut"
          }, "sec1Expanded")
          
          .to(".s10-img-element", {
            scale: 1.06,
            duration: PANEL_ACTION, 
            ease: "power2.inOut"
          }, "sec1Expanded");

        tl.to({}, { duration: PAUSE_ACTION });

        // ── SEQUENTIAL PARAGRAPHS ROLL UP ──
        tl.addLabel("text1", ">")
          .to(".s10-seq-container", { y: -380, duration: SUB_ACTION, ease: "power2.inOut" }, "text1");
          
        tl.addLabel("text2", ">")
          .to(".s10-seq-container", { y: -760, duration: SUB_ACTION, ease: "power2.inOut" }, "text2");
          
        tl.addLabel("text3", ">")
          .to(".s10-seq-container", { y: -1100, duration: SUB_ACTION, ease: "power2.inOut" }, "text3");
          
        tl.addLabel("text4", ">");

        tl.to({}, { duration: PAUSE_ACTION });

        // ── FAQ SECTION SLIDE UP ──
        tl.addLabel("faqStart", ">")
          .set(".services-faq-wrap", { visibility: "visible" }, "faqStart")
          .to(".services-faq-wrap", {
            yPercent: 0,
            duration: PANEL_ACTION, 
            ease: "power2.inOut"
          }, "faqStart");

        tl.to({}, { duration: PAUSE_ACTION });

        // ── CTA REVEAL TRACK ──
        tl.addLabel("ctaStart", ">")
          .set(".services-section-cta", { 
            visibility: "visible",
            onStart: () => {
              window.dispatchEvent(new Event("resize"));
            }
          }, "ctaStart")
          .to(".services-section-cta", { yPercent: 0, duration: PANEL_ACTION, ease: "power2.out" }, "ctaStart")
          .to(".services-faq-wrap", { scale: 1.0, duration: PANEL_ACTION }, "ctaStart");

        tl.to({}, { duration: PAUSE_ACTION });

        // ── CTA INNER CONTENT FADE OUT FIRST (MATCHING HOME) ──
        tl.addLabel("ctaFadeOut", ">")
          .to(".services-section-cta .cta-inner-desktop", { 
            opacity: 0, 
            y: -40, 
            duration: PANEL_ACTION * 0.5, 
            ease: "power2.in" 
          }, "ctaFadeOut")
          .to({}, { duration: PAUSE_ACTION });

        // ── FOOTER REVEAL TRACK ──
        tl.addLabel("footerStart", ">")
          .set(".services-footer-wrap", { visibility: "visible" }, "footerStart")
          .to(".services-footer-wrap", { yPercent: 0, duration: PANEL_ACTION, ease: "power2.out" }, "footerStart")
          .to(".services-faq-wrap", { scale: 0.92, duration: PANEL_ACTION }, "footerStart");
      };

      requestAnimationFrame(buildTimeline);

    }, scopeRef);

    return () => {
      vvCleanup?.();
      if (isTouchOnly()) {
        ScrollTrigger.normalizeScroll(false);
      }
      if (scopeRef.current) {
        restoreTextReveal(scopeRef.current, ".services-faq-wrap .reveal-text");
      }
      ctx.revert();
    };
  }, [introDone, preloaderDone]);

  return (
    <div ref={scopeRef}>
      <div className="sub-services-pin relative h-screen w-screen overflow-hidden bg-black" style={{ visibility: "visible" }}>
        
        {/* Layer 1: Hero view base */}
        <div className="services-hero-wrap relative z-10 pointer-events-auto w-full h-full">
          <SubServiceHero data={pageData.hero} />
        </div>
        
        {/* Layer 2: Section One scrolling sheet */}
        <div className="section-one-wrap absolute inset-0 w-full h-full z-20 overflow-hidden">
          <SubServiceSectionOne data={pageData.sectionOne} />
        </div>

        {/* Layer 3: FAQ slide overlay */}
        <div className="services-faq-wrap absolute inset-0 w-full h-full z-30 overflow-hidden">
          <SubServiceFAQSection data={pageData.sectionTwo} />
        </div>

        {/* Layer 4: Section CTA wrapper */}
        <div className="services-section-cta absolute bottom-0 left-0 w-full structural-layer pointer-events-auto" style={{ zIndex: 95 }}>
          <SectionCTA preloaderDone={preloaderDone} />
        </div>

        {/* Layer 5: Footer wrapper */}
        <div className="services-footer-wrap absolute left-0 bottom-0 w-full structural-layer" style={{ zIndex: 96 }}>
          <Footer />
        </div>
        
      </div>
    </div>
  );
}