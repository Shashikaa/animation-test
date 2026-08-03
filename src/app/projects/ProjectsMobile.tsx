"use client";

import { useRef, useEffect, useState, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ProjectsHero from "../../components/Projects/ProjectsHero";
import { restoreTextReveal } from "@/src/app/utils/useTextReveal";
import SectionOne from "@/src/components/Projects/SectionOne";
import SectionTwo from "@/src/components/Projects/SectionTwo";
import SectionCTA from "@/src/components/SectionCTA";
import Footer from "@/src/components/Footer";

gsap.registerPlugin(ScrollTrigger);

// Standardized metrics matching AboutMobile, ContactMobile & SingleProjectPageMobile
const PX_PER_MAIN_PANEL = 850; 
const PX_PER_SUB_STEP = 350;   
const PAUSE_PX = 100;          

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

export default function ProjectsMobile() {
  const scopeRef = useRef<HTMLDivElement>(null);
  const sectionOneRef = useRef<HTMLDivElement>(null);
  const [introDone, setIntroDone] = useState(false);
  const [isSectionTwoActive, setIsSectionTwoActive] = useState(false);

  // Reset scroll position on refresh
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }, []);

  // Handle body overflow logic during initial page loading
  useEffect(() => {
    document.body.style.overflow = introDone ? "" : "hidden";
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

  // 1. Establish precise starting positions cleanly
  useLayoutEffect(() => {
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
  }, []);

  // 2. Play Intro Cinematic immediately
  useEffect(() => {
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
  }, []);

  // 3. Master Scroll Timeline & Layering Controller
  useEffect(() => {
    if (!introDone) return;

    executeMobileSplitting(".scroll-para-1");
    executeMobileSplitting(".scroll-para-2");

    const ctx = gsap.context(() => {
      const ACTION = 1.4;
      const DEAD_SCROLL = 0.2;

      // Projects Page: 5 Main Transitions (Hero Text, Hero->Sec1, Sec1->Sec2, Sec2->CTA, CTA->Footer)
      // 2 Sub-steps (Paragraph 1 & 2 swaps) + 6 Pause breaks
      const MAIN_PANELS_COUNT = 5;
      const SUB_STEPS_COUNT = 2;
      const PAUSES_COUNT = 6;

      const DYNAMIC_SCROLL_TRACK = 
        (MAIN_PANELS_COUNT * PX_PER_MAIN_PANEL) + 
        (SUB_STEPS_COUNT * PX_PER_SUB_STEP) + 
        (PAUSES_COUNT * PAUSE_PX);

      const scrollTl = gsap.timeline({
        defaults: { ease: "none", lazy: true },
        scrollTrigger: {
          trigger: ".master-viewport",
          start: "top top",
          end: `+=${DYNAMIC_SCROLL_TRACK}`,
          pin: true,
          pinType: "fixed",
          scrub: 0.5, // Standardized scrub setting
          anticipatePin: 1,
          preventOverlaps: true,
          fastScrollEnd: true,
          invalidateOnRefresh: false,
        }
      });

      // ── STEP A: HERO TEXT SWAPPING ──
      scrollTl.set([".scroll-para-1 .custom-line-inner", ".scroll-para-2 .custom-line-inner"], { opacity: 0, yPercent: 100 }, 0);

      // 1. Hero text vanishes fast on initial scroll
      scrollTl.to(".hero-text-wrap", { opacity: 0, y: -30, ease: "power2.in", duration: ACTION * 0.5 }, 0);
      scrollTl.set(".hero-text-wrap", { visibility: "hidden" }, ACTION * 0.5);
      
      // 2. Paragraph 1 Entrance
      scrollTl.set(".scroll-para-1", { visibility: "visible" }, ACTION * 0.5);
      scrollTl.to(".scroll-para-1 .custom-line-inner", { 
        opacity: 1, 
        yPercent: 0, 
        stagger: 0.05, 
        duration: ACTION * 0.8, 
        ease: "power2.out" 
      }, ACTION * 0.5);

      // Paragraph 1 Exit
      scrollTl.to(".scroll-para-1 .custom-line-inner", { opacity: 0, y: -30, ease: "power1.in", duration: ACTION * 0.5 }, "+=0.2");
      scrollTl.set(".scroll-para-1", { visibility: "hidden" });
      
      // 3. Paragraph 2 Entrance
      scrollTl.set(".scroll-para-2", { visibility: "visible" }, ">");
      scrollTl.to(".scroll-para-2 .custom-line-inner", { 
        opacity: 1, 
        yPercent: 0, 
        stagger: 0.05, 
        duration: ACTION * 0.8, 
        ease: "power2.out" 
      }, ">");
      
      // Paragraph 2 Exit
      scrollTl.to(".scroll-para-2 .custom-line-inner", { opacity: 0, y: -40, ease: "power1.in", duration: ACTION * 0.5 }, "+=0.2");
      scrollTl.set(".scroll-para-2", { visibility: "hidden" });

      // Background subtle translation during text sequence
      scrollTl.fromTo(
        ".projects-hero-bg", 
        { yPercent: 0 }, 
        { yPercent: -18, ease: "none", duration: scrollTl.duration() }, 
        0
      );

      scrollTl.to({}, { duration: DEAD_SCROLL });

      // ── STEP B: SECTION ONE TALL SCROLL OVER HERO ──
      const getSectionOneScrollDistance = () => {
        if (!sectionOneRef.current) return "100vh";
        const elementHeight = sectionOneRef.current.offsetHeight;
        return `${elementHeight}px`;
      };

      scrollTl.to(".section-one-wrapper", {
        y: () => `-${getSectionOneScrollDistance()}`,
        duration: ACTION * 1.5, 
        ease: "power2.inOut"
      }, ">");

      scrollTl.to(".parallax-img-asset", {
        yPercent: 20,
        ease: "none",
        duration: ACTION * 1.5
      }, "<");

      scrollTl.to({}, { duration: DEAD_SCROLL });

      // ── STEP C: SECTION TWO SLIDES UP OVER SECTION ONE ──
      scrollTl.to(".section-two-wrapper", {
        y: "0vh",
        duration: ACTION,
        ease: "power2.inOut",
        onStart: () => setIsSectionTwoActive(true),
        onReverseComplete: () => setIsSectionTwoActive(false)
      });

      scrollTl.to({}, { duration: DEAD_SCROLL });

      // ── STEP D: SECTION TWO -> CTA (SAME AS HOMEMOBILE) ──
      scrollTl.addLabel("ctaStart", ">")
        .set(".projects-section-cta", { visibility: "visible" }, "ctaStart")
        .fromTo(
          ".projects-section-cta",
          { yPercent: 100 },
          { yPercent: 0, duration: ACTION, ease: "power2.inOut" },
          "ctaStart"
        )
        .to(".section-two-wrapper", { y: "-10vh", duration: ACTION, ease: "power2.inOut" }, "ctaStart");

      scrollTl.to({}, { duration: DEAD_SCROLL });

      // ── STEP D.5: CTA INNER CONTENT FADE OUT FIRST (MATCHING HOMEMOBILE) ──
      scrollTl.addLabel("ctaFadeOut", ">")
        .to(
          [".projects-section-cta .cta-inner-mobile", ".projects-section-cta .cta-inner-desktop"],
          { 
            opacity: 0, 
            y: -30, 
            duration: ACTION * 0.5, 
            ease: "power2.in" 
          }, 
          "ctaFadeOut"
        )
        .to({}, { duration: DEAD_SCROLL });

      // ── STEP E: CTA -> FOOTER ──
      scrollTl.addLabel("footerStart", ">")
        .set(".section-two-wrapper", { visibility: "hidden" }, "footerStart")
        .set(".projects-footer-wrap", { visibility: "visible" }, "footerStart")
        .fromTo(
          ".projects-footer-wrap",
          { yPercent: 100 },
          { 
            yPercent: 0, 
            duration: ACTION, 
            ease: "power2.inOut" 
          },
          "footerStart"
        );

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
          className="projects-section-cta gpu-accelerated absolute inset-x-0 bottom-0 w-full h-auto min-h-[100vh] z-[150]" 
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