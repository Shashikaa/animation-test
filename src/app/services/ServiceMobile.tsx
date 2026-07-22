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

type ServicesMobileProps = {
  preloaderDone: boolean;
};

export default function ServicesMobile({ preloaderDone }: ServicesMobileProps) {
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
    const locked = !preloaderDone || !introDone;
    document.body.style.overflow = locked ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [preloaderDone, introDone]);

  // Handle iOS address bar expansion/collapse gracefully
  useEffect(() => {
    if (typeof window === "undefined") return;

    let lastHeight = window.innerHeight;

    const handleResize = () => {
      const currentHeight = window.innerHeight;
      if (Math.abs(currentHeight - lastHeight) > 40) {
        lastHeight = currentHeight;
        ScrollTrigger.refresh();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 1. Set up safe baseline states before animations run
  useLayoutEffect(() => {
    if (!preloaderDone) return;
    const ctx = gsap.context(() => {
      ScrollTrigger.config({ 
        ignoreMobileResize: false,
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
  }, [preloaderDone]);

  // 2. Intro Sequence
  useEffect(() => {
    if (!preloaderDone) return;

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
  }, [preloaderDone]);

  // 3. Absolute Panel Stacking Scroll Timeline
  useEffect(() => {
    if (!introDone) return;

    const ctx = gsap.context(() => {
      const ACTION = 2.0;

      const triggerSec2Hook = (nextIdx: number) => {
        if (nextIdx !== lastSec2Idx.current) {
          lastSec2Idx.current = nextIdx;
          if ((window as any)._sec2GoTo) {
            (window as any)._sec2GoTo(nextIdx);
          }
        }
      };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".services-pin-master",
          start: "top top",
          end: "+=10000",
          pin: true,
          pinType: "fixed", // Eliminates iOS black gap when URL bar collapses
          scrub: 2, // Buttery smooth touch momentum cushion matching About & Contact Mobile
          anticipatePin: 1,
          invalidateOnRefresh: true
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

      // ── STEP B: Section One un-clips OVER Hero ──
      tl.set(".services-section-one-wrap", { visibility: "visible" })
        .to(".services-section-one-wrap", {
          clipPath: "inset(0% 0% 0% 0%)",
          WebkitClipPath: "inset(0% 0% 0% 0%)",
          duration: ACTION,
          ease: "power2.inOut"
        });

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

      // ── STEP D: SLIDE TRACK STEPPER ──
      tl.to({}, { 
        duration: 4.0,
        onUpdate: function() {
          const p = this.progress();
          if (p < 0.25) triggerSec2Hook(0);
          else if (p < 0.50) triggerSec2Hook(1);
          else if (p < 0.75) triggerSec2Hook(2);
          else triggerSec2Hook(3);
        }
      });

      // ── STEP E: App Section slides up over Section Two ──
      tl.set(".services-appsec-wrap", { visibility: "visible" })
        .to(".services-appsec-wrap", {
          yPercent: 0,
          duration: ACTION,
          ease: "power2.inOut",
          onStart: () => triggerSec2Hook(3),
          onReverseComplete: () => triggerSec2Hook(3)
        });

      // ── STEP F: APP SECTION -> CTA ──
      tl.addLabel("ctaStart")
        .set(".services-section-cta", { visibility: "visible" }, "ctaStart")
        .to(".services-section-cta", { yPercent: 0, duration: ACTION, ease: "none" }, "ctaStart")
        .to(".services-appsec-wrap", { yPercent: -10, duration: ACTION, ease: "none" }, "ctaStart");

      // ── STEP G: CTA -> FOOTER (Fades CTA inner content & hides Appsec layer to prevent flashing) ──
      tl.addLabel("footerStart")
        .to([".services-section-cta .cta-inner-mobile", ".services-section-cta .cta-inner-desktop"], { 
          opacity: 0, 
          duration: ACTION * 0.3, 
          ease: "power1.inOut" 
        }, "footerStart")
        .set(".services-appsec-wrap", { visibility: "hidden" }, `footerStart+=${ACTION * 0.3}`)
        .set(".services-footer-wrap", { visibility: "visible" }, "footerStart+=0.1")
        .to(".services-footer-wrap", { yPercent: 0, duration: ACTION, ease: "none" }, "footerStart+=0.1");

    }, scopeRef);

    return () => ctx.revert();
  }, [introDone]);

  return (
    <div ref={scopeRef}>
      <style jsx global>{`
        /* Pin wrapper fills 100% of visible viewport height */
        .pin-all-services {
          height: 100vh;
          height: 100dvh;
          width: 100%;
        }

        /* Overrides GSAP inline styles on pin-spacer to prevent viewport black gaps on iOS */
        .pin-spacer {
          min-height: 100dvh !important;
        }

        .pin-spacer > .pin-all-services {
          height: 100% !important;
          max-height: none !important;
        }

        .gpu-accelerated {
          will-change: transform, opacity, clip-path;
          transform: translateZ(0);
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
        }

        .services-section-cta {
          background-color: #000;
        }
      `}</style>

      <div className="services-pin-master pin-all-services relative w-full overflow-hidden">
        
        {/* Layer 1: Hero Block */}
        <div className="gpu-accelerated absolute inset-0 w-full h-full" style={{ zIndex: 10 }}>
          <Hero isMobile={true} />
        </div>

        {/* Layer 2: Section One */}
        <div 
          className="services-section-one-wrap gpu-accelerated absolute inset-0 w-full h-full overflow-y-auto" 
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
          className="services-section-two-wrap gpu-accelerated absolute inset-0 w-full h-full overflow-y-auto" 
          style={{ 
            zIndex: 30,
            visibility: "hidden"
          }}
        >
          <SectionTwo isActive={isSectionTwoActive} />
        </div>

        {/* Layer 4: App Section Slide Up Wrapper */}
        <div 
          className="services-appsec-wrap gpu-accelerated absolute inset-x-0 bottom-0 w-full h-[120vh] min-h-[120vh] overflow-y-auto overflow-x-hidden bg-black" 
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
          className="services-section-cta gpu-accelerated absolute inset-0 w-full h-full bg-white z-[150]" 
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