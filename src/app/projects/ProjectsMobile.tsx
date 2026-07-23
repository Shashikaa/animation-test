"use client";

import { useRef, useEffect, useState, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSite } from "@/src/app/context/SiteContext";
import ProjectsHero from "../../components/Projects/ProjectsHero";
import { restoreTextReveal } from "@/src/app/utils/useTextReveal";
import SectionOne from "@/src/components/Projects/SectionOne";
import SectionTwo from "@/src/components/Projects/SectionTwo";
import SectionCTA from "@/src/components/SectionCTA";
import Footer from "@/src/components/Footer";

gsap.registerPlugin(ScrollTrigger);

type ContactProps = {
  preloaderDone: boolean;
};

// Line splitting utility
function executeMobileSplitting(selector: string) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((element) => {
    const htmlElement = element as HTMLElement;
    if (!htmlElement || htmlElement.dataset.splitComplete === "true") return;

    const rawText = htmlElement.textContent || "";
    const linesArray = rawText.split("\n").map(line => line.trim()).filter(line => line.length > 0);
    
    htmlElement.innerHTML = "";
    linesArray.forEach(lineText => {
      const wrapper = document.createElement("span");
      wrapper.className = "custom-line-wrap";
      wrapper.style.display = "block";
      wrapper.style.overflow = "hidden";
      wrapper.style.position = "relative";

      const inner = document.createElement("span");
      inner.className = "custom-line-inner";
      inner.style.display = "block";
      inner.textContent = lineText;

      wrapper.appendChild(inner);
      htmlElement.appendChild(wrapper);
    });

    htmlElement.dataset.splitComplete = "true";
  });
}

export default function ProjectsMobile({ preloaderDone }: ContactProps) {
  const { setPreloaderDone } = useSite();
  const scopeRef = useRef<HTMLDivElement>(null);
  const sectionOneRef = useRef<HTMLDivElement>(null);
  const [introDone, setIntroDone] = useState(false);
  const [isSectionTwoActive, setIsSectionTwoActive] = useState(false);

  // Reset scroll position on refresh
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
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

  // 1. Establish precise starting positions cleanly
  useLayoutEffect(() => {
    if (!preloaderDone) return;
    
    const ctx = gsap.context(() => {
      ScrollTrigger.config({ 
        ignoreMobileResize: true,
        autoRefreshEvents: "DOMContentLoaded,load,visibilitychange" 
      });

      gsap.set(".projects-hero-bg", { scale: 1.6, yPercent: 0, transformOrigin: "center center", force3D: true });
      gsap.set([".hero-title", ".hero-desc"], { opacity: 0, y: 30, force3D: true });
      
      gsap.set([".scroll-para-1", ".scroll-para-2"], { opacity: 1, visibility: "hidden", force3D: true });
      
      gsap.set(".section-one-wrapper", { top: "100vh", height: "auto", zIndex: 20, force3D: true });
      gsap.set(".section-two-wrapper", { y: "100vh", zIndex: 30, force3D: true });
      gsap.set(".parallax-img-asset", { yPercent: -20, force3D: true });

      gsap.set(".projects-section-cta", { yPercent: 100, zIndex: 150, visibility: "hidden", force3D: true });
      gsap.set([".projects-section-cta .cta-inner-mobile", ".projects-section-cta .cta-inner-desktop"], { opacity: 1, y: 0 });
      gsap.set(".projects-footer-wrap", { yPercent: 100, zIndex: 151, visibility: "hidden", force3D: true });
    }, scopeRef);
    
    return () => ctx.revert();
  }, [preloaderDone]);

  // 2. Play Intro Cinematic
  useEffect(() => {
    if (!preloaderDone) return;
    
    const ctx = gsap.context(() => {
      const introTl = gsap.timeline({ 
        onComplete: () => {
          setIntroDone(true);
          setTimeout(() => ScrollTrigger.refresh(), 50);
        }
      });
      
      introTl
        .to(".projects-hero-bg", { scale: 1.3, duration: 2.2, ease: "power2.out" }, 0)
        .to([".hero-title", ".hero-desc"], { opacity: 1, y: 0, duration: 1.4, stagger: 0.15, ease: "power3.out" }, 0.4);
    }, scopeRef);
    
    return () => ctx.revert();
  }, [preloaderDone]);

  // 3. Master Scroll Timeline & Layering Controller
  useEffect(() => {
    if (!introDone) return;

    executeMobileSplitting(".scroll-para-1");
    executeMobileSplitting(".scroll-para-2");

    const ctx = gsap.context(() => {
      const ACTION = 1.8;
      const DEAD_SCROLL = 0.2;

      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: ".master-viewport",
          start: "top top",
          end: "+=6500", // Adjusted for snappy mobile gesture responsiveness
          pin: true,
          pinType: "fixed",
          scrub: 1.0,
          anticipatePin: 1,
          preventOverlaps: true,
          fastScrollEnd: true,
          invalidateOnRefresh: false,
        }
      });

      // ── STEP A: FAST HERO TEXT SWAPPING (MATCHES HOME HERO SPEED) ──
      scrollTl.set([".scroll-para-1 .custom-line-inner", ".scroll-para-2 .custom-line-inner"], { opacity: 0, yPercent: 100 }, 0);

      // 1. Hero text vanishes fast on initial touch scroll
      scrollTl.to(".hero-text-wrap", { opacity: 0, y: -30, ease: "power2.in", duration: 0.5 }, 0);
      scrollTl.set(".hero-text-wrap", { visibility: "hidden" }, 0.5);
      
      // 2. Paragraph 1 Entrance
      scrollTl.set(".scroll-para-1", { visibility: "visible" }, 0.5);
      scrollTl.to(".scroll-para-1 .custom-line-inner", { 
        opacity: 1, 
        yPercent: 0, 
        stagger: 0.05, 
        duration: 1.0, 
        ease: "power2.out" 
      }, 0.5);

      // Paragraph 1 Exit
      scrollTl.to(".scroll-para-1 .custom-line-inner", { opacity: 0, y: -30, ease: "power1.in", duration: 0.8 }, "+=0.6");
      scrollTl.set(".scroll-para-1", { visibility: "hidden" });
      
      // 3. Paragraph 2 Entrance
      scrollTl.set(".scroll-para-2", { visibility: "visible" }, ">");
      scrollTl.to(".scroll-para-2 .custom-line-inner", { 
        opacity: 1, 
        yPercent: 0, 
        stagger: 0.05, 
        duration: 1.0, 
        ease: "power2.out" 
      }, ">");
      
      // Paragraph 2 Exit
      scrollTl.to(".scroll-para-2 .custom-line-inner", { opacity: 0, y: -40, ease: "power1.in", duration: 0.8 }, "+=0.6");
      scrollTl.set(".scroll-para-2", { visibility: "hidden" });

      // Background subtle translation during text sequence
      scrollTl.fromTo(
        ".projects-hero-bg", 
        { yPercent: 0 }, 
        { yPercent: -18, ease: "none", duration: scrollTl.duration() }, 
        0
      );

      // ── STEP B: SECTION ONE TALL SCROLL OVER HERO ──
      const getSectionOneScrollDistance = () => {
        if (!sectionOneRef.current) return "100vh";
        const elementHeight = sectionOneRef.current.offsetHeight;
        return `${elementHeight}px`;
      };

      scrollTl.to(".section-one-wrapper", {
        y: () => `-${getSectionOneScrollDistance()}`,
        duration: 3.5, 
        ease: "none"
      }, "+=0.1");

      scrollTl.to(".parallax-img-asset", {
        yPercent: 20,
        ease: "none",
        duration: 3.5
      }, "<");

      // ── STEP C: SECTION TWO SLIDES UP OVER SECTION ONE ──
      scrollTl.to(".section-two-wrapper", {
        y: "0vh",
        duration: 2.0,
        ease: "power2.inOut",
        onStart: () => setIsSectionTwoActive(true),
        onReverseComplete: () => setIsSectionTwoActive(false)
      }, "+=0.2");

      scrollTl.to({}, { duration: DEAD_SCROLL });

      // ── STEP D: SECTION TWO -> CTA ──
      scrollTl.addLabel("ctaStart", ">")
        .set(".projects-section-cta", { visibility: "visible" }, "ctaStart")
        .to(".projects-section-cta", { yPercent: 0, duration: ACTION, ease: "none" }, "ctaStart")
        .to(".section-two-wrapper", { y: "-10vh", duration: ACTION, ease: "none" }, "ctaStart");

      scrollTl.to({}, { duration: DEAD_SCROLL });

      // ── STEP E: CTA -> FOOTER (FAST CTA FADE + FOOTER SLIDE-UP) ──
      scrollTl.addLabel("footerStart", ">")
        .to([".projects-section-cta .cta-inner-mobile", ".projects-section-cta .cta-inner-desktop"], { 
          opacity: 0, 
          duration: ACTION * 0.4, 
          ease: "power1.in" 
        }, "footerStart")
        .set(".section-two-wrapper", { visibility: "hidden" }, `footerStart+=${ACTION * 0.4}`)
        .set(".projects-footer-wrap", { visibility: "visible" }, "footerStart")
        .to(".projects-footer-wrap", { 
          yPercent: 0, 
          duration: ACTION, 
          ease: "power2.out" 
        }, "footerStart");

    }, scopeRef);

    return () => {
      ctx.revert();
      if (scopeRef.current) {
        restoreTextReveal(scopeRef.current, ".scroll-para-1");
        restoreTextReveal(scopeRef.current, ".scroll-para-2");
      }
    };
  }, [introDone]);

  return (
    <div 
      ref={scopeRef} 
      className="w-full relative bg-[#19211C] min-h-screen overflow-hidden text-white"
    >
      <div className="master-viewport pin-all-projects relative w-full overflow-hidden">
        
        {/* Layer 1: Hero Section */}
        <div className="projects-hero-master gpu-accelerated absolute inset-0 w-full h-full z-10">
          <ProjectsHero />
        </div>

        {/* Layer 2: Section One Container */}
        <div 
          ref={sectionOneRef}
          className="section-one-wrapper gpu-accelerated absolute left-0 right-0 w-full h-auto"
          style={{ top: "100vh", zIndex: 20 }}
        >
          <SectionOne />
        </div>

        {/* Layer 3: Section Two Container */}
        <div 
          className="section-two-wrapper gpu-accelerated absolute inset-0 w-full h-full"
          style={{ transform: "translateY(100vh)", zIndex: 30 }}
        >
          <SectionTwo isActive={isSectionTwoActive}/>
        </div>

        {/* Layer 4: Section CTA Block */}
        <div 
          className="projects-section-cta gpu-accelerated absolute inset-0 w-full h-full bg-white z-[150]" 
          style={{ 
            pointerEvents: "auto", 
            visibility: "hidden"
          }}
        >
          <SectionCTA />
        </div>

        {/* Layer 5: Footer Wrapper Frame */}
        <div 
          className="projects-footer-wrap gpu-accelerated absolute left-0 bottom-0 w-full z-[151]" 
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