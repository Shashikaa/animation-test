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

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.history.scrollRestoration) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
    document.body.classList.remove("preloading");
    setPreloaderDone(true);
  }, [setPreloaderDone]);

  useEffect(() => {
    const locked = !preloaderDone || !introDone;
    document.body.style.overflow = locked ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [preloaderDone, introDone]);

  // 1. Set up safe baseline states before animations run
  useLayoutEffect(() => {
    if (!preloaderDone) return;
    const ctx = gsap.context(() => {
      gsap.set(".service-hero-bg", { scale: 1.3 });
      gsap.set([".hero-title", ".hero-desc", ".hero-btn"], { opacity: 0, y: 30 });
      gsap.set(".services-hero-top-layer", { clipPath: "inset(0px 0px 0px 0px)", WebkitClipPath: "inset(0px 0px 0px 0px)" });

      // Initialize Section One with bottom-to-top mask hide
      gsap.set(".services-section-one-wrap", { 
        visibility: "hidden",
        clipPath: "inset(100% 0% 0% 0%)",
        WebkitClipPath: "inset(100% 0% 0% 0%)"
      });

      // Section Two comes in via standard slide over Section One
      gsap.set(".services-section-two-wrap", { 
        visibility: "hidden", 
        yPercent: 100 
      });

      // App Section Initial Baseline
      gsap.set(".services-appsec-wrap", {
        visibility: "hidden",
        yPercent: 100
      });

      // ── ALIGNED WITH ABOUT SPEC BASICS FOR CTA & FOOTER ──
      gsap.set(".services-section-cta", { yPercent: 100, zIndex: 150, visibility: "hidden" });
      gsap.set([".services-section-cta .cta-inner-mobile", ".services-section-cta .cta-inner-desktop"], { opacity: 1, y: 0 });
      gsap.set(".services-footer-wrap", { yPercent: 100, zIndex: 151, visibility: "hidden" });
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
      const DEAD_SCROLL = 0.4;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".services-pin-master",
          start: "top top",
          end: "+=11000", // Adjusted layout capacity footprint
          pin: true,
          scrub: 0.2,    
          invalidateOnRefresh: true
        }
      });

      // ── STEP A: Compress Hero & Move Layout Elements ──
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

      // ── STEP B: Section One un-clips directly OVER the Hero ──
      tl.set(".services-section-one-wrap", { visibility: "visible" })
        .to(".services-section-one-wrap", {
          clipPath: "inset(0% 0% 0% 0%)",
          WebkitClipPath: "inset(0% 0% 0% 0%)",
          duration: ACTION,
          ease: "power2.inOut"
        });

      tl.to({}, { duration: DEAD_SCROLL });

      // ── STEP C: Section Two slides up over Section One ──
      tl.set(".services-section-two-wrap", { visibility: "visible" })
        .to(".services-section-two-wrap", { 
          yPercent: 0, 
          duration: ACTION, 
          ease: "power2.inOut",
          onUpdate: function() {
            const progress = this.progress();
            setIsSectionTwoActive(progress > 0.2);
          }
        });

      // Bi-directional Mobile triggers for Section Two Slider tracks
      tl.to({}, { duration: 2.0 });
      tl.call(() => { if ((window as any)._sec2GoTo) (window as any)._sec2GoTo(0); });
      
      tl.to({}, { duration: 2.0 });
      tl.call(() => { if ((window as any)._sec2GoTo) (window as any)._sec2GoTo(1); });

      tl.to({}, { duration: 2.0 });
      tl.call(() => { if ((window as any)._sec2GoTo) (window as any)._sec2GoTo(2); });

      tl.to({}, { duration: 2.0 });
      tl.call(() => { if ((window as any)._sec2GoTo) (window as any)._sec2GoTo(3); });

      tl.to({}, { duration: DEAD_SCROLL });

      // ── STEP D: App Section slides up over Section Two ──
      tl.set(".services-appsec-wrap", { visibility: "visible" })
        .to(".services-appsec-wrap", {
          yPercent: 0,
          duration: ACTION,
          ease: "power2.inOut"
        });

      tl.to({}, { duration: DEAD_SCROLL });

      // ── STEP E: MATCHING ABOUT DESIGN: APP SECTION -> CTA ──
      tl.addLabel("ctaStart", ">")
        .set(".services-section-cta", { visibility: "visible" }, "ctaStart")
        .to(".services-section-cta", { yPercent: 0, duration: ACTION, ease: "none" }, "ctaStart")
        .to(".services-appsec-wrap", { yPercent: -10, duration: ACTION, ease: "none" }, "ctaStart");

      tl.to({}, { duration: DEAD_SCROLL }); 

      // ── STEP F: MATCHING ABOUT DESIGN: CTA -> FOOTER ──
      tl.addLabel("footerStart", ">")
        .to([".services-section-cta .cta-inner-mobile", ".services-section-cta .cta-inner-desktop"], { opacity: 0, duration: ACTION * 0.3, ease: "none" }, "footerStart")
        .set(".services-footer-wrap", { visibility: "visible" }, "footerStart+=0.1")
        .to(".services-footer-wrap", { yPercent: 0, duration: ACTION, ease: "none" }, "footerStart+=0.1") 
        .to(".services-appsec-wrap", { yPercent: -20, duration: ACTION, ease: "none" }, "footerStart+=0.1");

    }, scopeRef);

    return () => ctx.revert();
  }, [introDone]);

  return (
    <div ref={scopeRef}>
      <style jsx global>{`
        .pin-all {
          height: 100lvh; 
        }
      `}</style>

      <div className="services-pin-master pin-all relative w-full overflow-hidden">
        
        {/* Layer 1: Hero Block */}
        <div className="absolute inset-0 w-full h-full" style={{ zIndex: 10 }}>
          <Hero isMobile={true} />
        </div>

        {/* Layer 2: Section One */}
        <div 
          className="services-section-one-wrap absolute inset-0 w-full h-full overflow-y-auto" 
          style={{ 
            zIndex: 20,
            clipPath: "inset(100% 0% 0% 0%)",
            WebkitClipPath: "inset(100% 0% 0% 0%)"
          }}
        >
          <SectionOne />
        </div>

        {/* Layer 3: Section Two Context */}
        <div 
          className="services-section-two-wrap absolute inset-0 w-full h-full overflow-y-auto" 
          style={{ zIndex: 30 }}
        >
          <SectionTwo isActive={isSectionTwoActive} />
        </div>

        {/* Layer 4: App Section Slide Up Wrapper */}
        <div 
          className="services-appsec-wrap absolute top-0 left-0 w-full h-full overflow-y-auto bg-black" 
          style={{ zIndex: 35 }}
        >
          <Appsection />
        </div>

        {/* Layer 5: Section CTA Block - Updated zIndex and visibility attributes to align with About */}
        <div 
          className="services-section-cta absolute inset-0 w-full h-full bg-white z-[150]" 
          style={{ pointerEvents: "auto", visibility: "hidden" }}
        >
          <SectionCTA />
        </div>

        {/* Layer 6: Footer Wrapper Frame - Updated zIndex and positioning to match About */}
        <div 
          className="services-footer-wrap absolute left-0 bottom-0 w-full z-[151]" 
          style={{ pointerEvents: "auto", visibility: "hidden" }}
        >
          <Footer />
        </div>

      </div>
    </div>
  );
}