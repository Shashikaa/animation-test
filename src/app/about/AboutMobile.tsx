"use client";

import Hero from "@/src/components/About/Hero";
import SectionOne from "@/src/components/About/SectionOne";
import SectionTwo from "@/src/components/About/SectionTwo";
import SectionThree from "@/src/components/About/SectionThree";
import SectionFour from "@/src/components/About/SectionFour";
import SectionFive from "@/src/components/About/SectionFive";
import SectionCTA from "@/src/components/SectionCTA";
import { useState, useRef, useEffect, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Footer from "@/src/components/Footer";
import { useSite } from "@/src/app/context/SiteContext";

gsap.registerPlugin(ScrollTrigger);

// Touch scroll parameters
const PX_PER_MAIN_PANEL = 850;
const PX_PER_SUB_STEP = 350;  
const PAUSE_PX = 100;         

export default function AboutMobile() {
  const { setPreloaderDone } = useSite(); 
  const [introDone, setIntroDone] = useState(false);
  const [isSectionFiveActive, setIsSectionFiveActive] = useState(false);
  const scopeRef = useRef<HTMLDivElement>(null);
  const lastSec5Idx = useRef<number>(-1);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo(0, 0);
    setPreloaderDone(true);
  }, [setPreloaderDone]);

  // Lock scrolling during intro
  useEffect(() => {
    const locked = !introDone;
    document.body.style.overflow = locked ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [introDone]);

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

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.config({ 
        ignoreMobileResize: true,
        autoRefreshEvents: "DOMContentLoaded,load,visibilitychange" 
      });

      gsap.set(".about-hero-bg", { scale: 1.3, force3D: true });
      gsap.set([".hero-title", ".hero-desc"], { opacity: 0, y: 30, force3D: true });

      gsap.set(".about-section-one", { yPercent: 100, force3D: true });
      gsap.set(".about-section-two", { visibility: "hidden", yPercent: 100, force3D: true });
      
      gsap.set(".about-section-three", { 
        visibility: "hidden", 
        clipPath: "inset(100% 0% 0% 0%)",
        WebkitClipPath: "inset(100% 0% 0% 0%)",
        force3D: true
      });

      gsap.set(".about-section-four", { visibility: "hidden", yPercent: 0, force3D: true });

      gsap.set(".about-section-five", { yPercent: 100, force3D: true });
      gsap.set(".about-section-five .s5-bg", { scale: 1.25, yPercent: 0, force3D: true });

      gsap.set(".about-section-cta", { yPercent: 100, zIndex: 150, visibility: "hidden", force3D: true });
      gsap.set([".about-section-cta .cta-inner-mobile", ".about-section-cta .cta-inner-desktop"], { opacity: 1, y: 0 });
      gsap.set(".about-footer-wrap", { yPercent: 100, zIndex: 151, visibility: "hidden", force3D: true });
    }, scopeRef);

    return () => ctx.revert();
  }, []);

  // Hero Intro Sequence
  useEffect(() => {
    const ctx = gsap.context(() => {
      const introTl = gsap.timeline({
        onComplete: () => {
          setIntroDone(true);
          setTimeout(() => ScrollTrigger.refresh(), 50);
        }
      });

      introTl.to(".about-hero-bg", { scale: 1.1, duration: 2.2, ease: "power2.out" }, 0);
      introTl.to([".hero-title", ".hero-desc"], { opacity: 1, y: 0, duration: 1.4, stagger: 0.2, ease: "power3.out" }, 0.4);
      introTl.to(".about-section-five", { opacity: 1, duration: 1.2, ease: "linear" }, 0.2);

    }, scopeRef);

    return () => ctx.revert();
  }, []);

  // Master Section Transition Scroll Timeline
  useEffect(() => {
    if (!introDone) return;

    const ctx = gsap.context(() => {
      const ACTION = 1.4; 
      const DEAD_SCROLL = 0.2; 

      const MAIN_PANELS_COUNT = 7;
      const SUB_STEPS_COUNT = 2;
      const PAUSES_COUNT = 5;

      const DYNAMIC_SCROLL_TRACK = 
        (MAIN_PANELS_COUNT * PX_PER_MAIN_PANEL) + 
        (SUB_STEPS_COUNT * PX_PER_SUB_STEP) + 
        (PAUSES_COUNT * PAUSE_PX);

      const triggerSec5Hook = (nextIdx: number) => {
        if (nextIdx !== lastSec5Idx.current) {
          lastSec5Idx.current = nextIdx;
          if ((window as any)._sec5GoTo) {
            (window as any)._sec5GoTo(nextIdx);
          }
        }
      };

      const tl = gsap.timeline({
        defaults: { ease: "none", lazy: true },
        scrollTrigger: {
          trigger: ".about-pin",
          start: "top top",
          end: `+=${DYNAMIC_SCROLL_TRACK}`,
          scrub: 0.2,
          pin: true,
          pinType: "fixed",
          anticipatePin: 1,
          preventOverlaps: true,
          fastScrollEnd: true,
          invalidateOnRefresh: false,
        },
      });

      // ── Step 1: Section 1 ──
      tl.to(".about-section-one", { yPercent: 0, duration: ACTION, ease: "power2.inOut" })
        .to(".about-hero-bg", { scale: 1.0, yPercent: -10, duration: ACTION, ease: "power2.inOut" }, "<");

      tl.to({}, { duration: DEAD_SCROLL }); 

      // ── Step 2: Section 2 ──
      tl.set(".about-section-two", { visibility: "visible" })
        .to(".about-section-two", { yPercent: 0, duration: ACTION, ease: "power2.inOut" });
      
      tl.to({}, { duration: DEAD_SCROLL }); 

      // ── Step 3: Section 3 ──
      tl.set(".about-section-three", { visibility: "visible" })
        .fromTo(
          ".about-section-three",
          { clipPath: "inset(100% 0% 0% 0%)", WebkitClipPath: "inset(100% 0% 0% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", WebkitClipPath: "inset(0% 0% 0% 0%)", duration: ACTION, ease: "power2.inOut" }
        );
      
      tl.to({}, { duration: DEAD_SCROLL }); 

      // ── Step 4: Section 4 ──
      tl.set(".about-section-four", { visibility: "visible" })
        .addLabel("sec3to4Transition")
        .to(".about-section-three", { yPercent: -100, duration: ACTION, ease: "power2.inOut" }, "sec3to4Transition")
        .fromTo(".about-section-four .s4-img-bg", 
          { yPercent: 15 },
          { yPercent: 0, duration: ACTION, ease: "power2.inOut" }, 
          "sec3to4Transition"
        );
      
      tl.to({}, { duration: DEAD_SCROLL }); 

      // ── Step 5: Section 5 Reveal ──
      tl.addLabel("sec5Start")
        .set(".about-section-five", { visibility: "visible" }, "sec5Start")
        .to(".about-section-five", { 
          yPercent: 0, 
          duration: ACTION, 
          ease: "power2.inOut",
          onStart: () => setIsSectionFiveActive(true),
          onReverseComplete: () => {
            setIsSectionFiveActive(false);
            triggerSec5Hook(0);
          }
        }, "sec5Start");

      tl.fromTo(".about-section-five .s5-bg", 
        { yPercent: 5, scale: 1.25 }, 
        { yPercent: -25, scale: 1.25, ease: "none", duration: ACTION * 2.0 }, 
        "sec5Start"
      );

      tl.addLabel("sec5FullyRevealed", `sec5Start+=${ACTION}`);

      // ── Section 5 Inner Cards ──
      tl.addLabel("sec5_card2", "sec5FullyRevealed+=0.2")
        .call(() => triggerSec5Hook(1), [], "sec5_card2");

      tl.addLabel("sec5_card3", "sec5_card2+=0.6")
        .call(() => triggerSec5Hook(2), [], "sec5_card3");

      tl.to({}, { duration: DEAD_SCROLL }); 

      // ── Step 6: CTA Reveal Track ──
      tl.addLabel("ctaStart", ">")
        .set(".about-section-cta", { visibility: "visible" }, "ctaStart")
        .to(".about-section-cta", { yPercent: 0, duration: ACTION, ease: "power2.inOut" }, "ctaStart") 
        .to(".about-section-five", { yPercent: -2, duration: ACTION, ease: "power2.inOut" }, "ctaStart");

      tl.to({}, { duration: DEAD_SCROLL });

      // ── Step 7: Footer Reveal Track ──
      tl.addLabel("footerStart", ">")
        .to([".about-section-cta .cta-inner-mobile", ".about-section-cta .cta-inner-desktop"], { 
          opacity: 0, 
          duration: ACTION * 0.4, 
          ease: "power1.inOut" 
        }, "footerStart")
        .set(".about-section-five", { visibility: "hidden" }, `footerStart+=${ACTION * 0.4}`)
        .set(".about-footer-wrap", { visibility: "visible" }, "footerStart")
        .fromTo(".about-footer-wrap", 
          { yPercent: 100 },
          { yPercent: 0, duration: ACTION, ease: "power2.inOut" }, 
          "footerStart"
        );

    }, scopeRef);

    return () => ctx.revert();
  }, [introDone]);

  return (
    <div ref={scopeRef}>
      <div 
        className="about-pin pin-all relative w-full overflow-hidden"
        style={{ visibility: "visible" }}
      >
        <div className="about-hero-panel-left gpu-accelerated absolute inset-0 w-full h-full" style={{ zIndex: 10 }}>
          <Hero isMobile={true} />
        </div>

        <div className="about-section-one gpu-accelerated absolute inset-0 w-full h-full" style={{ zIndex: 20 }}>
          <SectionOne />
        </div>

        <div className="about-section-two gpu-accelerated absolute inset-0 w-full h-full" style={{ zIndex: 30 }}>
          <SectionTwo />
        </div>

        <div 
          className="about-section-three gpu-accelerated absolute inset-0 w-full h-full" 
          style={{ 
            zIndex: 40, 
            clipPath: "inset(100% 0% 0% 0%)",
            WebkitClipPath: "inset(100% 0% 0% 0%)"
          }}
        >
          <SectionThree />
        </div>

        <div className="about-section-four gpu-accelerated absolute inset-0 w-full h-full" style={{ zIndex: 35 }}>
          <SectionFour />
        </div>

        <div 
          className="about-section-five gpu-accelerated absolute inset-0 w-full h-full" 
          style={{ 
            zIndex: 45,
            opacity: 0,
            visibility: "hidden"
          }}
        >
          <SectionFive isActive={isSectionFiveActive} />
        </div>

        <div className="about-section-cta gpu-accelerated absolute inset-0 w-full h-full z-[150]" style={{ pointerEvents: "auto", visibility: "hidden" }}>
          <SectionCTA />
        </div>

        <div className="about-footer-wrap gpu-accelerated absolute left-0 bottom-0 w-full z-[151]" style={{ pointerEvents: "auto", visibility: "hidden" }}>
          <Footer />
        </div>
      </div>
    </div>
  );
}