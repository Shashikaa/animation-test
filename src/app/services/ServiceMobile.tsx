"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSite } from "@/src/app/context/SiteContext";
import Hero from "@/src/components/Service/Hero";
import SectionOne from "@/src/components/Service/SectionOne";
import SectionTwo from "@/src/components/Service/SectionTwo";
import Appsection from "@/src/components/Appsection"; 
import SectionCTA from "@/src/components/SectionCTA";
import Footer from "@/src/components/Footer";

gsap.registerPlugin(ScrollTrigger);

// Standardized Metrics matching AboutMobile, ContactMobile, ProjectsMobile & SubServicesMobile
const PX_PER_MAIN_PANEL = 850; 
const PX_PER_SUB_STEP = 350;   
const PAUSE_PX = 100;          

export default function ServicesMobile() {
  const { setPreloaderDone } = useSite(); 
  const [introDone, setIntroDone] = useState(false);
  const scopeRef = useRef<HTMLDivElement>(null);
  const [isSectionTwoActive, setIsSectionTwoActive] = useState(false);
  const lastSec2Idx = useRef<number>(-1);

  // Reset scroll mechanics on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.history.scrollRestoration) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
    document.body.classList.remove("preloading");
    setPreloaderDone(true);
  }, [setPreloaderDone]);

  // Handle body overflow logic during initial page loading
  useEffect(() => {
    const locked = !introDone;
    document.body.style.overflow = locked ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [introDone]);

  // Refresh ScrollTrigger only on width/orientation change
  useEffect(() => {
    if (typeof window === "undefined") return;

    let lastWidth = window.innerWidth;

    const handleResize = () => {
      const currentWidth = window.innerWidth;
      if (currentWidth !== lastWidth) {
        lastWidth = currentWidth;
        ScrollTrigger.refresh();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 1. Set up safe baseline states before animations run
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.config({ 
        ignoreMobileResize: true,
        autoRefreshEvents: "DOMContentLoaded,load,visibilitychange" 
      });

      gsap.set(".service-hero-bg", { scale: 1.3, force3D: true });
      gsap.set([".hero-title", ".hero-desc", ".hero-btn"], { opacity: 0, y: 30, force3D: true });
      gsap.set(".services-hero-top-layer", { clipPath: "inset(0px 0px 0px 0px)", WebkitClipPath: "inset(0px 0px 0px 0px)", force3D: true });

      // Initialize Section One with bottom-to-top mask hide
      gsap.set(".services-section-one-wrap", { 
        visibility: "hidden",
        clipPath: "inset(100% 0% 0% 0%)",
        WebkitClipPath: "inset(100% 0% 0% 0%)",
        force3D: true
      });

      // Section Two initial state
      gsap.set(".services-section-two-wrap", { 
        visibility: "hidden", 
        yPercent: 100,
        force3D: true
      });
      gsap.set(".s2-inner-fade-target", { opacity: 0, force3D: true });

      // App Section Initial Baseline
      gsap.set(".services-appsec-wrap", {
        visibility: "hidden",
        yPercent: 100,
        force3D: true
      });

      // Initial States for CTA & Footer
      gsap.set(".services-section-cta", { yPercent: 100, zIndex: 150, visibility: "hidden", force3D: true });
      gsap.set([".services-section-cta .cta-inner-mobile", ".services-section-cta .cta-inner-desktop"], { opacity: 1, y: 0 });
      gsap.set(".services-footer-wrap", { yPercent: 100, zIndex: 151, visibility: "hidden", force3D: true });
    }, scopeRef);
    return () => ctx.revert();
  }, []);

  // 2. Intro Sequence
  useEffect(() => {
    const ctx = gsap.context(() => {
      const masterTl = gsap.timeline();

      masterTl.to(".service-hero-bg", {
        scale: 1.0,
        duration: 2.2,
        ease: "power2.out",
        onComplete: () => {
          setIntroDone(true);
          setTimeout(() => ScrollTrigger.refresh(), 50);
        }
      }, 0);

      masterTl.to([".hero-title", ".hero-desc", ".hero-btn"], {
        opacity: 1,
        y: 0,
        duration: 1.4,
        stagger: 0.2,
        ease: "power3.out",
      }, 0.4);

    }, scopeRef);

    return () => ctx.revert();
  }, []);

  // 3. Absolute Panel Stacking Scroll Timeline
  useEffect(() => {
    if (!introDone) return;

    const ctx = gsap.context(() => {
      const isTouchDevice = ScrollTrigger.isTouch > 0 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
      if (isTouchDevice) {
        ScrollTrigger.normalizeScroll(true);
      }

      const ACTION = 1.4;
      const DEAD_SCROLL = 0.2;

      const MAIN_PANELS_COUNT = 6;
      const SUB_STEPS_COUNT = 3; 
      const PAUSES_COUNT = 7;

      const DYNAMIC_SCROLL_TRACK = 
        (MAIN_PANELS_COUNT * PX_PER_MAIN_PANEL) + 
        (SUB_STEPS_COUNT * PX_PER_SUB_STEP) + 
        (PAUSES_COUNT * PAUSE_PX);

      const triggerSec2Hook = (nextIdx: number) => {
        if (nextIdx !== lastSec2Idx.current) {
          lastSec2Idx.current = nextIdx;
          if ((window as any)._sec2GoTo) {
            (window as any)._sec2GoTo(nextIdx);
          }
          gsap.set(".s2-inner-fade-target", { opacity: 1 });
        }
      };

      const tl = gsap.timeline({
        defaults: { ease: "none", lazy: true },
        scrollTrigger: {
          trigger: ".services-pin-master",
          start: "top top",
          end: `+=${DYNAMIC_SCROLL_TRACK}`,
          pin: true,
          pinType: "fixed",
          scrub: 0.5,
          anticipatePin: 1,
          preventOverlaps: true,
          fastScrollEnd: true,
          invalidateOnRefresh: false,
        }
      });

      // ── STEP A: Compress Hero ──
      tl.to([".hero-text-wrap", ".hero-btn"], {
        y: "-=380px",    
        duration: ACTION, 
        ease: "power2.inOut"
      }, 0)
      .to(".services-hero-top-layer", {
        clipPath: "inset(0px 0px 400px 0px)",
        WebkitClipPath: "inset(0px 0px 320px 0px)",
        duration: ACTION,
        ease: "power2.inOut",
      }, 0)
      .to(".service-hero-bg", {
        y: "-=80px",     
        duration: ACTION,
        ease: "power2.inOut"
      }, 0);

      tl.to({}, { duration: DEAD_SCROLL });

      // ── STEP B: Section One un-clips OVER Hero ──
      tl.set(".services-section-one-wrap", { visibility: "visible" })
        .to(".services-section-one-wrap", {
          clipPath: "inset(0% 0% 0% 0%)",
          WebkitClipPath: "inset(0% 0% 0% 0%)",
          duration: ACTION,
          ease: "power2.inOut"
        });

      tl.to({}, { duration: DEAD_SCROLL });

      // ── STEP C: Section Two & Text Slide Up Together ──
      tl.set(".services-section-two-wrap", { visibility: "visible" })
        .to(".services-section-two-wrap", { 
          yPercent: 0, 
          duration: ACTION, 
          ease: "power2.inOut",
          onStart: () => setIsSectionTwoActive(true),
          onReverseComplete: () => {
            setIsSectionTwoActive(false);
            gsap.set(".services-section-two-wrap", { visibility: "hidden" });
            triggerSec2Hook(0);
          }
        })
        .to(".s2-inner-fade-target", { 
          opacity: 1, 
          duration: ACTION, 
          ease: "power2.inOut"
        }, "<");

      // ── STEP D: DISCRETE STEPPER SLIDE TRACK (3 SLIDES) ──
      const stepDuration = ACTION * 0.5;

      tl.call(() => triggerSec2Hook(0), [], ">")
        .to(".s2-inner-fade-target", { opacity: 1, duration: stepDuration });

      tl.call(() => triggerSec2Hook(1), [], ">")
        .to(".s2-inner-fade-target", { opacity: 1, duration: stepDuration });

      tl.call(() => triggerSec2Hook(2), [], ">")
        .to(".s2-inner-fade-target", { opacity: 1, duration: stepDuration });

      tl.to({}, { duration: DEAD_SCROLL });

      // ── STEP E: App Section slides up over Section Two ──
      tl.set(".services-appsec-wrap", { visibility: "visible" })
        .to(".s2-inner-fade-target", { opacity: 1, duration: ACTION * 0.5 }, "appsecStart")
        .to(".services-appsec-wrap", {
          yPercent: 0,
          duration: ACTION,
          ease: "power2.inOut",
          onStart: () => triggerSec2Hook(2),
          onReverseComplete: () => triggerSec2Hook(2)
        }, "appsecStart");

      tl.to({}, { duration: DEAD_SCROLL });

      // ── STEP F: APP SECTION -> CTA ──
      tl.addLabel("ctaStart")
        .set(".services-section-cta", { visibility: "visible" }, "ctaStart")
        .fromTo(
          ".services-section-cta",
          { yPercent: 100 },
          { yPercent: 0, duration: ACTION, ease: "power2.inOut" },
          "ctaStart"
        )
        .to(".services-appsec-wrap", { yPercent: -10, duration: ACTION, ease: "power2.inOut" }, "ctaStart");

      tl.to({}, { duration: DEAD_SCROLL });

      // ── STEP F.5: CTA INNER CONTENT FADE OUT FIRST ──
      tl.addLabel("ctaFadeOut", ">")
        .to(
          [".services-section-cta .cta-inner-mobile", ".services-section-cta .cta-inner-desktop"],
          { 
            opacity: 0, 
            y: -30, 
            duration: ACTION * 0.1, 
            ease: "power2.in" 
          }, 
          "ctaFadeOut"
        )
        .to({}, { duration: 0 });

      // ── STEP G: CTA -> FOOTER ──
      tl.addLabel("footerStart")
        .set(".services-appsec-wrap", { visibility: "hidden" }, "footerStart")
        .set(".services-footer-wrap", { visibility: "visible" }, "footerStart")
        .to(".services-footer-wrap", { yPercent: 0, duration: ACTION, ease: "power2.inOut" }, "footerStart");

    }, scopeRef);

    return () => ctx.revert();
  }, [introDone]);

  return (
    <div ref={scopeRef}>
      <div className="services-pin-master pin-all-services relative w-full overflow-hidden">
        
        {/* Layer 1: Hero Block */}
        <div className="gpu-accelerated absolute inset-0 w-full h-full" style={{ zIndex: 10 }}>
          <Hero isMobile={true} />
        </div>

        {/* Layer 2: Section One */}
        <div 
          className="services-section-one-wrap gpu-accelerated absolute inset-0 w-full h-full" 
          style={{ 
            zIndex: 20,
            clipPath: "inset(100% 0% 0% 0%)",
            WebkitClipPath: "inset(100% 0% 0% 0%)",
            visibility: "hidden"
          }}
        >
          <SectionOne />
        </div>

        {/* Layer 3: Section Two Context */}
        <div 
          className="services-section-two-wrap gpu-accelerated absolute inset-0 w-full h-full" 
          style={{ 
            zIndex: 30,
            visibility: "hidden"
          }}
        >
          <SectionTwo isActive={isSectionTwoActive} />
        </div>

        {/* Layer 4: App Section Slide Up Wrapper */}
        <div 
          className="services-appsec-wrap gpu-accelerated absolute inset-x-0 bottom-0 w-full h-auto min-h-[100dvh] overflow-x-hidden bg-black" 
          style={{ 
            zIndex: 35,
            pointerEvents: "auto",
            visibility: "hidden"
          }}
        >
          <Appsection />
        </div>

        {/* Layer 5: Section CTA Block */}
        <div 
          className="services-section-cta gpu-accelerated absolute inset-x-0 bottom-0 w-full h-auto min-h-[100dvh] z-[150]" 
          style={{ 
            pointerEvents: "auto", 
            visibility: "hidden"
          }}
        >
          <SectionCTA />
        </div>

        {/* Layer 6: Footer Wrapper Frame */}
        <div 
          className="services-footer-wrap gpu-accelerated absolute left-0 bottom-0 w-full z-[151]" 
          style={{ 
            pointerEvents: "auto", 
            visibility: "hidden" 
          }}
        >
          <Footer />
        </div>

      </div>
    </div>
  );
}