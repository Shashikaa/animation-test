"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSite } from "@/src/app/context/SiteContext";
import SubServiceHero from "@/src/components/Service/SubServiceHero";
import SectionOne from "@/src/components/Service/SectionOne";
import SectionTwo from "@/src/components/Service/SectionTwo";
import SectionCTA from "@/src/components/SectionCTA";
import Footer from "@/src/components/Footer";
import { FullServiceData } from "./data";

gsap.registerPlugin(ScrollTrigger);

type SubServicesMobileProps = {
  pageData: FullServiceData;
  preloaderDone: boolean;
};

export default function SubServicesMobile({ pageData, preloaderDone }: SubServicesMobileProps) {
  const { setPreloaderDone } = useSite(); 
  const [introDone, setIntroDone] = useState(false);
  const [isSectionTwoActive, setIsSectionTwoActive] = useState(false);
  const scopeRef = useRef<HTMLDivElement>(null);

  // 1. Handle Preloader Context & Reset Viewport Position
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.history.scrollRestoration) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
    document.body.classList.remove("preloading");
    setPreloaderDone(true);
  }, [setPreloaderDone]);

  // 2. Body Scroll Locking Toggle (Only active during intro asset scales)
  useEffect(() => {
    const locked = !preloaderDone || !introDone;
    document.body.style.overflow = locked ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [preloaderDone, introDone]);

  // 3. Set up safe baseline states before animations run
  useLayoutEffect(() => {
    if (!preloaderDone) return;
    const ctx = gsap.context(() => {
      gsap.set(".service-hero-bg", { scale: 1.3 });
      gsap.set([".hero-title", ".hero-desc", ".hero-btn"], { opacity: 0, y: 30 }); 
      
      gsap.set(".services-hero-top-layer", { 
        clipPath: "inset(0% 0% 0% 0%)", 
        WebkitClipPath: "inset(0% 0% 0% 0%)" 
      });

      gsap.set(".mobile-section-one", { 
        visibility: "hidden",
        clipPath: "inset(100% 0% 0% 0%)",
        WebkitClipPath: "inset(100% 0% 0% 0%)"
      });

      gsap.set(".mobile-section-two", { 
        visibility: "hidden", 
        yPercent: 100 
      });

      gsap.set(".mobile-cta", { visibility: "hidden", yPercent: 100 });
      gsap.set(".mobile-footer", { visibility: "hidden", yPercent: 100 });
    }, scopeRef);
    return () => ctx.revert();
  }, [preloaderDone]);

  // 4. Intro Sequence Timeline
  useEffect(() => {
    if (!preloaderDone) return;

    const ctx = gsap.context(() => {
      const masterTl = gsap.timeline({
        onComplete: () => setIntroDone(true)
      });

      masterTl.to(".service-hero-bg", {
        scale: 1.0,
        duration: 2.2,
        ease: "power2.out",
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

  // 5. Absolute Panel Stacking Scroll Timeline
  useEffect(() => {
    if (!introDone) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".services-scroll-runway", // Trigger on the outer runway layout box
          start: "top top",
          end: "bottom bottom", 
          pin: ".services-pin-master",       // Pin strictly the inner viewport container
          scrub: 0.2,    
          invalidateOnRefresh: true,
        }
      });

      // STEP A: Hero top layer image clips UP (0% to 100%)
      tl.to(".hero-text-wrap", {
        opacity: 0,
        y: -40,
        duration: 2.0, 
      }, 0)
      .to(".services-hero-top-layer", {
        clipPath: "inset(0% 0% 100% 0%)",
        WebkitClipPath: "inset(0% 0% 100% 0%)",
        duration: 2.0,
        ease: "none",
      }, 0)
      .to(".service-hero-bg", {
        scale: 1.1,
        duration: 2.0,
        ease: "none"
      }, 0);

      tl.to({}, { duration: 0.4 }); 

      // STEP B: Section One un-clips directly OVER the stationary base
      tl.set(".mobile-section-one", { visibility: "visible", pointerEvents: "auto" })
        .to(".mobile-section-one", {
          clipPath: "inset(0% 0% 0% 0%)",
          WebkitClipPath: "inset(0% 0% 0% 0%)",
          duration: 2.0,
          ease: "none"
        });

      tl.to({}, { duration: 0.4 });

      // STEP C: Section Two slides up over Section One
      tl.set(".mobile-section-two", { visibility: "visible", pointerEvents: "auto" })
        .to(".mobile-section-two", { 
          yPercent: 0, 
          duration: 2.0, 
          ease: "power2.inOut",
          onUpdate: function() {
            const progress = this.progress();
            setIsSectionTwoActive(progress > 0.2);
          }
        });

      tl.to({}, { duration: 0.4 });

      // STEP D: CTA Panel slides up cleanly over Section Two
      tl.set(".mobile-cta", { visibility: "visible", pointerEvents: "auto" })
        .to(".mobile-cta", {
          yPercent: 0,
          duration: 2.0, 
          ease: "power2.inOut"
        });

      tl.to({}, { duration: 0.4 }); 

      // STEP E: Footer Panel slides up cleanly over the CTA
      tl.set(".mobile-footer", { visibility: "visible", pointerEvents: "auto" })
        .to(".mobile-footer", {
          yPercent: 0,
          duration: 2.0, 
          ease: "power2.inOut"
        });

      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 150);

    }, scopeRef);

    return () => ctx.revert();
  }, [introDone]);

  return (
    <div ref={scopeRef} className="w-full relative">
      
      {/* NATIVE SCROLL RUNWAY - Gives the window actual physical room to scroll on touch devices */}
      <div className="services-scroll-runway w-full h-[600vh] relative clear-both block">
        
        {/* PINNED BOX - Stays frozen in place while the user scrolls through the runway */}
        <div className="services-pin-master fixed top-0 left-0 w-full h-[100dvh] overflow-hidden select-none touch-none">
          
          {/* Layer 1: SubServiceHero */}
          <SubServiceHero data={pageData.hero} />

          {/* Layer 2: Section One */}
          <div 
            className="mobile-section-one absolute inset-0 w-full h-full overflow-y-auto bg-[#142420] pointer-events-none" 
            style={{ 
              zIndex: 20,
              visibility: "hidden",
              clipPath: "inset(100% 0% 0% 0%)",
              WebkitClipPath: "inset(100% 0% 0% 0%)"
            }}
          >
            <SectionOne />
          </div>

          {/* Layer 3: Section Two Context */}
          <div 
            className="mobile-section-two absolute inset-0 w-full h-full overflow-y-auto bg-[#111] pointer-events-none" 
            style={{ 
              zIndex: 30,
              visibility: "hidden",
              transform: "translateY(100%)"
            }}
          >
            <SectionTwo isActive={isSectionTwoActive} />
          </div>

          {/* Layer 4: Section CTA Block */}
          <div 
            className="mobile-cta absolute inset-0 w-full h-full bg-white pointer-events-none" 
            style={{ 
              zIndex: 40,
              visibility: "hidden",
              transform: "translateY(100%)"
            }}
          >
            <SectionCTA />
          </div>

          {/* Layer 5: Footer Wrapper Frame */}
          <div 
            className="mobile-footer absolute inset-0 w-full h-full flex flex-col justify-end pointer-events-none" 
            style={{ 
              zIndex: 50,
              visibility: "hidden",
              transform: "translateY(100%)"
            }}
          >
            <Footer />
          </div>

        </div>
      </div>
    </div>
  );
}