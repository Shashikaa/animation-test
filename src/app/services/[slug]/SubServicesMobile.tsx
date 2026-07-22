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

type SubServicesMobileProps = {
  preloaderDone: boolean;
  pageData: FullServiceData;
};

export default function SubServicesMobile({ preloaderDone, pageData }: SubServicesMobileProps) {
  const { setPreloaderDone } = useSite();
  const scopeRef = useRef<HTMLDivElement>(null);
  
  const [introDone, setIntroDone] = useState(false);
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

  useLayoutEffect(() => {
    if (!preloaderDone) return;
    const ctx = gsap.context(() => {
      ScrollTrigger.config({ 
        ignoreMobileResize: false,
        autoRefreshEvents: "DOMContentLoaded,load,visibilitychange" 
      });

      gsap.set(".service-hero-bg", { scale: 1.3, xPercent: 0, transformOrigin: "center center", force3D: true });
      gsap.set([".hero-title", ".hero-desc", ".hero-btn"], { opacity: 0, y: 30, force3D: true });
      gsap.set(".services-hero-top-layer", { width: "100%", xPercent: 0, force3D: true }); 
      gsap.set(".section-one-wrap", { clipPath: "inset(100% 0% 0% 0%)", force3D: true });
      
      gsap.set(".s10-seq-container", { y: 0, force3D: true });
      gsap.set(".s10-seq-p", { opacity: 1 });

      gsap.set(".s1-glass-card", { x: 40, opacity: 0, force3D: true }); 
      gsap.set([".s1-static-title", ".s1-static-desc"], { opacity: 0, y: 30, force3D: true });
      gsap.set([".s1-reveal-top", ".s1-reveal-bottom"], { opacity: 0, y: 40, force3D: true });

      // FAQ panel starts completely below the screen view frame
      gsap.set(".services-faq-wrap", { visibility: "hidden", y: "100%", force3D: true });
      gsap.set(".services-section-two-wrap", { visibility: "hidden", clipPath: "inset(0% 0% 0% 100%)", force3D: true });
      
      // CTA & Footer Setup matching About structure
      gsap.set([".services-section-cta", ".services-footer-wrap"], { yPercent: 100, visibility: "hidden", force3D: true });
      gsap.set([".services-section-cta .cta-inner-desktop", ".services-section-cta .cta-inner-mobile"], { opacity: 1 });
      gsap.set(".services-section-cta", { zIndex: 95 });
      gsap.set(".services-footer-wrap", { zIndex: 96 });
    }, scopeRef);
    return () => ctx.revert();
  }, [preloaderDone]);

  useEffect(() => {
    if (!preloaderDone) return;

    const ctx = gsap.context(() => {
      const introTl = gsap.timeline({
        onComplete: () => {
          setIntroDone(true);
          setTimeout(() => ScrollTrigger.refresh(), 50);
        }
      });

      introTl.to(".service-hero-bg", {
        scale: 1.0, 
        duration: 2.2,
        ease: "power2.out"
      }, 0);

      introTl.to([".hero-title", ".hero-desc", ".hero-btn"], {
        opacity: 1,
        y: 0,
        duration: 1.4,
        stagger: 0.2,
        ease: "power3.out",
      }, 0.4);
    }, scopeRef);

    return () => ctx.revert();
  }, [preloaderDone]);

  useEffect(() => {
    if (!introDone) return;

    const ctx = gsap.context(() => {
      // Disable GSAP touch normalization so iOS WebKit handles browser chrome hiding cleanly
      ScrollTrigger.normalizeScroll(false);

      const scrollTl = gsap.timeline({
        defaults: { ease: "none" }, 
        scrollTrigger: {
          trigger: ".services-hero-master",
          start: "top top",
          end: "+=9500", // Adjusted scroll length to remove dead space
          pin: true,
          pinType: "fixed", // Prevents layout pops on mobile WebKit when URL bar collapses
          pinSpacing: true,
          scrub: 1, 
          invalidateOnRefresh: true,
          fastScrollEnd: true,
          preventOverlaps: true
        }
      });

      // ── PHASE 1: Compress Hero Layout ──
      scrollTl.addLabel("phase1")
        .to(".hero-text-wrap", {
          opacity: 0,
          y: -40,
          duration: 0.8,
          ease: "power1.out"
        }, "phase1")
        .to(".services-hero-top-layer", {
          width: "calc(100% - 600px)", 
          xPercent: -10,              
          duration: 3.0, 
          ease: "power1.inOut",
         }, "phase1+=0.1");

      // ── PHASE 2: Reveal Section One Sheet ──
      scrollTl.addLabel("phase2")
        .to(".section-one-wrap", {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 3.0, 
          ease: "power1.inOut"
        }, "phase2")
        .to(".service-hero-bg", {
          scale: 1.1,     
          duration: 3.0, 
          ease: "power1.inOut",
        }, "phase2");

      // ── PHASE 2.5: Scale Up Cleanly ──
      scrollTl.addLabel("phase2_expanded")
        .to([".s10-para-top", ".s10-title"], {
          opacity: 0,
          y: -45,
          duration: 1.2,
          ease: "power2.in"
        }, "phase2_expanded")
        
        .to(".s10-img-absolute-container", {
          width: "100vw",
          height: "100vh",
          right: "0px",
          bottom: "0px",
          borderRadius: "0px",
          duration: 3.0, 
          ease: "power2.inOut"
        }, "phase2_expanded")
        
        .to(".s10-img-element", {
          scale: 1.06,
          duration: 3.0, 
          ease: "power2.inOut"
        }, "phase2_expanded");

      // ── SEQUENTIAL PARAGRAPHS ROLL UP ──
      scrollTl.addLabel("text1")
              .to(".s10-seq-container", { y: -380, duration: 3.0 })
              .addLabel("text2")
              .to(".s10-seq-container", { y: -760, duration: 3.0 })
              .addLabel("text3")
              .to(".s10-seq-container", { y: -1100, duration: 3.0 })
              .addLabel("text4");

      // ── PHASE 2.6: FAQ Section Slide Up ──
      scrollTl.addLabel("faq", "text4")
        .set(".services-faq-wrap", { visibility: "visible" }, "faq")
        .to(".services-faq-wrap", {
          y: "0%",
          duration: 3.0, 
          ease: "power1.inOut"
        }, "faq");

      // ── CTA REVEAL TRACK (Directly linked after FAQ) ──
      scrollTl.addLabel("ctaStart", ">")
        .set(".services-section-cta", { visibility: "visible" }, "ctaStart")
        .to(".services-section-cta", { yPercent: 0, duration: 3.0, ease: "power1.inOut" }, "ctaStart")
        .to(".services-faq-wrap", { yPercent: -10, duration: 3.0, ease: "power1.inOut" }, "ctaStart");

      // ── FOOTER REVEAL TRACK (CTA Inner Fades Out) ──
      scrollTl.addLabel("footerStart", ">")
        .to([".services-section-cta .cta-inner-desktop", ".services-section-cta .cta-inner-mobile"], { 
          opacity: 0, 
          duration: 1.2, 
          ease: "power1.out" 
        }, "footerStart")
        .set(".services-footer-wrap", { visibility: "visible" }, "footerStart+=0.1")
        .to(".services-footer-wrap", { yPercent: 0, duration: 3.0, ease: "power1.inOut" }, "footerStart+=0.1")
        .to(".services-faq-wrap", { yPercent: -20, duration: 3.0, ease: "power1.inOut" }, "footerStart+=0.1");

    }, scopeRef);

    return () => {
      ctx.revert();
      if (scopeRef.current) {
        restoreTextReveal(scopeRef.current, ".s2-reveal-text");
      }
    };
  }, [introDone]);

  return (
    <div ref={scopeRef} className="w-full relative min-h-screen bg-black text-white overflow-hidden">
      <style jsx global>{`
        /* Pin wrapper fills 100% of visible viewport height */
        .pin-all-subservices {
          height: 100vh;
          height: 100dvh;
          width: 100%;
        }

        /* Overrides GSAP inline styles on pin-spacer to prevent viewport black gaps on iOS */
        .pin-spacer {
          min-height: 100dvh !important;
        }

        .pin-spacer > .pin-all-subservices {
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
        <div className="services-section-cta gpu-accelerated absolute bottom-0 left-0 w-full structural-layer z-[95]">
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