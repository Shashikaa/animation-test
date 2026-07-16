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

function executeDesktopSplitting(selector: string) {
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

export default function ProjectsDesktop({ preloaderDone }: ContactProps) {
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
    document.body.classList.remove("preloading");
    setPreloaderDone(true);
  }, [setPreloaderDone]);

  // Handle body scrolling lock while preloading or intro running
  useEffect(() => {
    const locked = !preloaderDone || !introDone;
    document.body.style.overflow = locked ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [preloaderDone, introDone]);

  // 1. Establish precise starting positions cleanly BEFORE browser paint
  useLayoutEffect(() => {
    if (!preloaderDone) return;
    
    const ctx = gsap.context(() => {
      // Hero setup triggers instantly to prevent lagging
      gsap.set(".projects-hero-bg", { scale: 1.6, yPercent: 0, transformOrigin: "center center" });
      gsap.set([".hero-title", ".hero-desc"], { opacity: 0, y: 30 });
      
      gsap.set([".scroll-para-1", ".scroll-para-2"], { opacity: 1, visibility: "hidden" });
      
      // Structural layering initial setups
      gsap.set(".section-one-wrapper", { top: "100vh", y: 0, height: "auto", zIndex: 20 });
      gsap.set(".section-two-wrapper", { y: "100vh", zIndex: 30 });
      gsap.set(".parallax-img-asset", { yPercent: -20 });

      // Ensure hidden text blocks are clean before layout animation passes mount
      gsap.set(".master-viewport .reveal-text", { opacity: 0, y: 40 });

      // Clean positioning hooks for lower layers
      gsap.set([".projects-section-cta", ".projects-footer-wrap"], { yPercent: 100, visibility: "hidden" });
      gsap.set(".projects-section-cta", { zIndex: 70 });
      gsap.set(".projects-footer-wrap", { zIndex: 80 });
    }, scopeRef);
    
    return () => ctx.revert();
  }, [preloaderDone]);

  // 2. Play Intro Cinematic cleanly without delaying layout staging
  useEffect(() => {
    if (!preloaderDone) return;
    
    const ctx = gsap.context(() => {
      const introTl = gsap.timeline({ 
        onComplete: () => setIntroDone(true) 
      });
      
      introTl
        .to(".projects-hero-bg", { scale: 1.3, duration: 2.2, ease: "power2.out" }, 0)
        .to([".hero-title", ".hero-desc"], { opacity: 1, y: 0, duration: 1.4, stagger: 0.15, ease: "power3.out" }, 0.4);
    }, scopeRef);
    
    return () => ctx.revert();
  }, [preloaderDone]);

  // 3. Master Single Timeline Scroll Pin & Layering Controller
  useEffect(() => {
    if (!introDone) return;

    executeDesktopSplitting(".scroll-para-1");
    executeDesktopSplitting(".scroll-para-2");

    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: ".master-viewport",
          start: "top top",
          end: "+=10000", 
          pin: true,
          pinSpacing: true,
          scrub: 1.2, 
          invalidateOnRefresh: true,
          // Live scroll engine callback track handles geometry monitoring across views
          onUpdate: () => {
            const revealElements = document.querySelectorAll(".master-viewport .reveal-text");
            
            revealElements.forEach((el) => {
              const htmlEl = el as HTMLElement;
              if (htmlEl.dataset.revealed === "true") return;

              const rect = htmlEl.getBoundingClientRect();
              const windowHeight = window.innerHeight;

              // Animate elements forward exactly once when crossing standard window horizons
              if (rect.top > 0 && rect.top < windowHeight * 0.85) {
                htmlEl.dataset.revealed = "true";
                
                const delay = parseFloat(htmlEl.getAttribute("data-reveal-delay") || "0");
                const duration = parseFloat(htmlEl.getAttribute("data-reveal-duration") || "1.4");

                gsap.to(htmlEl, {
                  opacity: 1,
                  y: 0,
                  duration: duration,
                  delay: delay,
                  ease: "power3.out",
                  overwrite: "auto"
                });
              }
            });
          }
        }
      });

      // ── STEP A: TEXT SWAPPING SEQUENCE ──
      scrollTl.set([".scroll-para-1 .custom-line-inner", ".scroll-para-2 .custom-line-inner"], { opacity: 0, yPercent: 100 }, 0);

      scrollTl.to(".hero-text-wrap", { opacity: 0, y: -30, ease: "power1.inOut", duration: 1.5 }, 0);
      scrollTl.set(".hero-text-wrap", { visibility: "hidden" }, 1.5);
      
      scrollTl.set(".scroll-para-1", { visibility: "visible" }, 1.5);
      scrollTl.to(".scroll-para-1 .custom-line-inner", { 
        opacity: 1, 
        yPercent: 0, 
        stagger: 0.1, 
        duration: 2.0, 
        ease: "power2.out" 
      }, 1.5);

      scrollTl.to(".scroll-para-1 .custom-line-inner", { opacity: 0, y: -30, ease: "power1.in", duration: 1.5 }, "+=1.5");
      scrollTl.set(".scroll-para-1", { visibility: "hidden" });
      
      scrollTl.set(".scroll-para-2", { visibility: "visible" }, ">");
      scrollTl.to(".scroll-para-2 .custom-line-inner", { 
        opacity: 1, 
        yPercent: 0, 
        stagger: 0.1, 
        duration: 2.0, 
        ease: "power2.out" 
      }, ">");
      
      scrollTl.to(".scroll-para-2 .custom-line-inner", { opacity: 0, y: -60, ease: "power1.in", duration: 2.0 }, "+=1.5");
      scrollTl.set(".scroll-para-2", { visibility: "hidden" });

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

      scrollTl.addLabel("sectionOneStart", "+=0.1");

      scrollTl.to(".section-one-wrapper", {
        y: () => `-${getSectionOneScrollDistance()}`,
        duration: 4.0, 
        ease: "none"
      }, "sectionOneStart");

      scrollTl.to(".parallax-img-asset", {
        yPercent: 20,
        ease: "none",
        duration: 4.0
      }, "sectionOneStart");

      // ── STEP C: SECTION TWO SLIDES UP OVER SECTION ONE ──
      scrollTl.addLabel("sectionTwoStart", "+=0.5");
      scrollTl.to(".section-two-wrapper", {
        y: "0vh",
        duration: 2.5,
        ease: "power2.inOut",
        onStart: () => setIsSectionTwoActive(true),
        onReverseComplete: () => setIsSectionTwoActive(false)
      }, "sectionTwoStart");

      // ── STEP D: CTA REVEAL TRACK ──
      scrollTl.addLabel("ctaStart", "+=0.5")
        .set(".projects-section-cta", { visibility: "visible" }, "ctaStart")
        .to(".projects-section-cta", { yPercent: 0, duration: 4.8 }, "ctaStart");

      // ── STEP E: FOOTER REVEAL TRACK ──
      scrollTl.addLabel("footerStart", "ctaStart+=4.8")
        .set(".projects-footer-wrap", { visibility: "visible" }, "footerStart")
        .to(".projects-footer-wrap", { yPercent: 0, duration: 5.5 }, "footerStart")
        .to(".projects-section-cta .cta-inner-desktop", { opacity: 0, duration: 4.0, ease: "power1.out" }, "footerStart");

    }, scopeRef);

    const refreshTimeout = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);

    return () => {
      ctx.revert();
      clearTimeout(refreshTimeout);
      if (scopeRef.current) {
        restoreTextReveal(scopeRef.current, ".scroll-para-1");
        restoreTextReveal(scopeRef.current, ".scroll-para-2");
      }
    };
  }, [introDone]);

  return (
    <div 
      ref={scopeRef} 
      className={`w-full relative ${!introDone ? "h-screen overflow-hidden" : "overflow-x-hidden"}`}
    >
      <div className="master-viewport relative w-full h-screen overflow-hidden bg-black">
        
        {/* Layer 1: Hero Section */}
        <div className="projects-hero-master absolute inset-0 w-full h-full z-10">
          <ProjectsHero />
        </div>

        {/* Layer 2: Section One Container */}
        <div 
          ref={sectionOneRef}
          className="section-one-wrapper absolute left-0 right-0 w-full h-auto"
        >
          <SectionOne />
        </div>

        {/* Layer 3: Section Two Container */}
        <div className="section-two-wrapper absolute inset-0 w-full h-full">
          <SectionTwo isActive={isSectionTwoActive}/>
        </div>
        
        {/* Layer 4: CTA Section Container */}
        <div
          className="projects-section-cta absolute bottom-0 left-0 w-full structural-layer"
          style={{ zIndex: 70 }}
        >
          <SectionCTA />
        </div>
        
        {/* Layer 5: Footer Container */}
        <div
          className="projects-footer-wrap absolute left-0 bottom-0 w-full structural-layer"
          style={{ zIndex: 80 }}
        >
          <Footer />
        </div>

      </div>
    </div>
  );
}