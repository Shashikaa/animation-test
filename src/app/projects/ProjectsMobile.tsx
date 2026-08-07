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
import { useHeroIntro } from "@/src/app/utils/useHeroIntro";

gsap.registerPlugin(ScrollTrigger);

const PX_PER_MAIN_PANEL = 850; 
const PX_PER_SUB_STEP = 350;   
const PAUSE_PX = 100;          

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
  const [isSectionTwoActive, setIsSectionTwoActive] = useState(false);

  // Single unified utility hook configured for Mobile
  const { introDone } = useHeroIntro(scopeRef, { isMobile: true });

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(".scroll-para-1", { opacity: 1, visibility: "hidden", force3D: true });
      
      gsap.set(".section-one-wrapper", { yPercent: 100, zIndex: 20, force3D: true });
      gsap.set(".section-two-wrapper", { yPercent: 100, zIndex: 30, force3D: true });
      gsap.set(".parallax-img-asset", { yPercent: -20, force3D: true });

      gsap.set(".projects-section-cta", { yPercent: 100, zIndex: 150, visibility: "hidden", force3D: true });
      gsap.set(
        [".projects-section-cta .cta-inner-mobile", ".projects-section-cta .cta-inner-desktop"], 
        { opacity: 1, y: 0, pointerEvents: "auto", visibility: "visible" }
      );
      gsap.set(".projects-footer-wrap", { yPercent: 100, zIndex: 151, visibility: "hidden", force3D: true });
    }, scopeRef);
    
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!introDone) return;

    executeMobileSplitting(".scroll-para-1");

    const ctx = gsap.context(() => {
      // Normalize mobile touch scroll behavior to lock address bar
      const isTouchDevice = ScrollTrigger.isTouch > 0 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
      if (isTouchDevice) {
        ScrollTrigger.normalizeScroll(true);
      }

      const ACTION = 1.4;
      const DEAD_SCROLL = 0.2;

      const MAIN_PANELS_COUNT = 4;
      const SUB_STEPS_COUNT = 1;
      const PAUSES_COUNT = 5;

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
          scrub: 0.5,
          anticipatePin: 1,
          preventOverlaps: true,
          fastScrollEnd: true,
          invalidateOnRefresh: true,
        }
      });

      scrollTl.set(".scroll-para-1 .custom-line-inner", { opacity: 0, yPercent: 100 }, 0);

      scrollTl.to(".hero-text-wrap", { opacity: 0, y: -30, ease: "power2.in", duration: ACTION * 0.5 }, 0);
      scrollTl.set(".hero-text-wrap", { visibility: "hidden" }, ACTION * 0.5);
      
      scrollTl.set(".scroll-para-1", { visibility: "visible" }, ACTION * 0.5);
      scrollTl.to(".scroll-para-1 .custom-line-inner", { 
        opacity: 1, 
        yPercent: 0, 
        stagger: 0.05, 
        duration: ACTION * 0.8, 
        ease: "power2.out" 
      }, ACTION * 0.5);

      scrollTl.to(".scroll-para-1 .custom-line-inner", { opacity: 0, y: -30, ease: "power1.in", duration: ACTION * 0.5 }, "+=0.2");
      scrollTl.set(".scroll-para-1", { visibility: "hidden" });

      scrollTl.fromTo(
        [".projects-hero-bg", ".about-hero-bg", ".hero-bg-anim"], 
        { yPercent: 0 }, 
        { yPercent: -9, ease: "none", duration: scrollTl.duration() }, 
        0
      );

      scrollTl.to({}, { duration: DEAD_SCROLL });

      scrollTl.to(".section-one-wrapper", {
        yPercent: 0,
        duration: ACTION * 1.5, 
        ease: "power2.inOut"
      }, ">");

      scrollTl.to(".parallax-img-asset", {
        yPercent: 20,
        ease: "none",
        duration: ACTION * 1.5
      }, "<");

      scrollTl.to({}, { duration: DEAD_SCROLL });

      scrollTl.to(".section-two-wrapper", {
        yPercent: 0,
        duration: ACTION,
        ease: "power2.inOut",
        onStart: () => setIsSectionTwoActive(true),
        onReverseComplete: () => setIsSectionTwoActive(false)
      });

      scrollTl.to({}, { duration: DEAD_SCROLL });

      scrollTl.addLabel("ctaStart", ">")
        .set(".projects-section-cta", { visibility: "visible" }, "ctaStart")
        .fromTo(
          ".projects-section-cta",
          { yPercent: 100 },
          { yPercent: 0, duration: ACTION, ease: "power2.inOut" },
          "ctaStart"
        )
        .to(".section-two-wrapper", { yPercent: -10, duration: ACTION, ease: "power2.inOut" }, "ctaStart");

      scrollTl.to({}, { duration: DEAD_SCROLL });

      scrollTl.addLabel("ctaFadeOut", ">")
        .to(
          [".projects-section-cta .cta-inner-mobile", ".projects-section-cta .cta-inner-desktop"],
          { 
            opacity: 0, 
            y: -30, 
            duration: ACTION * 0.1, 
            ease: "power2.in" 
          }, 
          "ctaFadeOut"
        )
        .set(
          [".projects-section-cta .cta-inner-mobile", ".projects-section-cta .cta-inner-desktop"],
          { 
            pointerEvents: "none", 
            visibility: "hidden" 
          }
        );

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
      if (ScrollTrigger.isTouch) {
        ScrollTrigger.normalizeScroll(false);
      }
      if (scopeRef.current) {
        restoreTextReveal(scopeRef.current, ".scroll-para-1");
      }
    };
  }, [introDone]);

  return (
    <div 
      ref={scopeRef} 
      className="w-full relative min-h-[100vh] overflow-hidden text-white"
    >
      <div className="master-viewport pin-all-projects relative w-full overflow-hidden">
        
        {/* Layer 1: Hero Section */}
        <div className="projects-hero-master gpu-accelerated absolute inset-0 w-full h-full z-10">
          <ProjectsHero />
        </div>

        {/* Layer 2: Section One Container */}
        <div 
          className="section-one-wrapper gpu-accelerated absolute inset-0 w-full h-full"
          style={{ zIndex: 20 }}
        >
          <SectionOne />
        </div>

        {/* Layer 3: Section Two Container */}
        <div 
          className="section-two-wrapper gpu-accelerated absolute inset-0 w-full h-full"
          style={{ zIndex: 30 }}
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