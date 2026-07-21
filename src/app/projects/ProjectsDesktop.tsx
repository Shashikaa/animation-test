"use client";

import { useRef, useEffect, useState, useLayoutEffect } from "react";
import gsap from "gsap"; 
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSite } from "@/src/app/context/SiteContext";
import ProjectsHero from "../../components/Projects/ProjectsHero";
import { useTextReveal, restoreTextReveal } from "@/src/app/utils/useTextReveal"; 
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

  const isTouchOnly = () => ScrollTrigger.isTouch === 1;

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
      gsap.set(".projects-hero-bg", { scale: 1.6, yPercent: 0, transformOrigin: "center center" });
      gsap.set([".hero-title", ".hero-desc"], { opacity: 0, y: 30 });
      
      gsap.set([".scroll-para-1", ".scroll-para-2"], { opacity: 1, visibility: "hidden" });
      
      gsap.set(".section-one-wrapper", { top: "100vh", y: 0, height: "auto", zIndex: 20 });
      gsap.set(".section-two-wrapper", { y: "100vh", zIndex: 30 });
      gsap.set(".parallax-img-asset", { yPercent: -20 });

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

    if (isTouchOnly()) {
      ScrollTrigger.normalizeScroll(true);
    }

    let vvCleanup: (() => void) | null = null;

    executeDesktopSplitting(".scroll-para-1");
    executeDesktopSplitting(".scroll-para-2");

    const ctx = gsap.context(() => {
      gsap.ticker.lagSmoothing(0);

      ScrollTrigger.config({
        ignoreMobileResize: true,
        autoRefreshEvents: "visibilitychange,DOMContentLoaded,load,resize",
      });

      // Unified hardware layer optimization targets mapping layout
      const performanceTargets = [
        ".projects-hero-bg", ".section-one-wrapper", ".section-two-wrapper",
        ".parallax-img-asset", ".projects-section-cta", ".projects-footer-wrap"
      ];

      performanceTargets.forEach(selector => {
        gsap.set(selector, {
          force3D: true,
          willChange: "transform, opacity"
        });
      });

      // Initialize the DOM text splitting structures for Section One
      useTextReveal(scopeRef, ".section-one-wrapper .reveal-text");

      // Setup clean starting visibility constraints for the lines
      gsap.set(".section-one-wrapper .reveal-text", { visibility: "visible", opacity: 1 });
      gsap.set([
        ".section-one-wrapper .reveal-text .gs-line-inner",
        ".section-one-wrapper .reveal-text > *"
      ], { y: 45, opacity: 0 });

      const buildTimeline = () => {
        ScrollTrigger.refresh();

        const vv = typeof visualViewport !== "undefined" ? visualViewport : null;
        if (vv) {
          const onVVResize = () => ScrollTrigger.refresh(true);
          vv.addEventListener("resize", onVVResize);
          vvCleanup = () => vv.removeEventListener("resize", onVVResize);
        }

        const scrollTl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: ".master-viewport",
            start: "top top",
            end: "+=11000",
            pin: true,
            pinSpacing: true,
            scrub: 1.2,
            invalidateOnRefresh: true,
            snap: {
              snapTo: (progress) => {
                const labels = Object.keys(scrollTl.labels).map(name => scrollTl.labels[name] / scrollTl.totalDuration());
                labels.sort((a, b) => a - b);
                
                const currentProg = scrollTl.progress();
                const isForward = scrollTl.scrollTrigger ? scrollTl.scrollTrigger.direction > 0 : true;

                for (let i = 0; i < labels.length - 1; i++) {
                  const start = labels[i];
                  const end = labels[i + 1];

                  if (currentProg >= start && currentProg <= end) {
                    const localProgress = (currentProg - start) / (end - start);

                    if (isForward) {
                      return localProgress >= 0.35 ? end : start;
                    } else {
                      return localProgress <= 0.40 ? start : end;
                    }
                  }
                }
                return progress;
              },
              duration: { min: 0.3, max: 0.6 },
              delay: 0.01, 
              ease: "power1.inOut"
            }
          }
        });

        const revealedElements = new Set<string>();

        // ── STEP A: HERO INNER TEXT SWAPPING ANIMATION ──
        scrollTl.addLabel("phaseHeroMain", 0); 
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

        scrollTl.addLabel("phaseHeroParaOne", 3.5); 

        scrollTl.to(".scroll-para-1 .custom-line-inner", { opacity: 0, y: -30, ease: "power1.in", duration: 1.5 }, 3.5);
        scrollTl.set(".scroll-para-1", { visibility: "hidden" }, 5.0);
        
        scrollTl.set(".scroll-para-2", { visibility: "visible" }, 5.0);
        scrollTl.to(".scroll-para-2 .custom-line-inner", { 
          opacity: 1, 
          yPercent: 0, 
          stagger: 0.1, 
          duration: 2.0, 
          ease: "power2.out" 
        }, 5.0);

        scrollTl.addLabel("phaseHeroParaTwo", 7.0); 

        // ── STEP B: SECTION ONE SCROLL UP + HERO PARAGRAPH TWO EXIT ──
        const getSectionOneScrollDistance = () => {
          if (!sectionOneRef.current) return "100vh";
          const elementHeight = sectionOneRef.current.offsetHeight;
          return `${elementHeight}px`;
        };

        scrollTl.addLabel("sectionOneStart", 7.0);

        scrollTl.to(".scroll-para-2 .custom-line-inner", { 
          opacity: 0, 
          y: -60, 
          ease: "power1.in", 
          duration: 1.5 
        }, "sectionOneStart");
        
        scrollTl.set(".scroll-para-2", { visibility: "hidden" }, "sectionOneStart+=1.5");

        scrollTl.to(".section-one-wrapper", {
          y: () => `-${getSectionOneScrollDistance()}`,
          duration: 4.5, 
          ease: "none"
        }, "sectionOneStart");

        scrollTl.to(".parallax-img-asset", {
          yPercent: 20,
          ease: "none",
          duration: 4.5
        }, "sectionOneStart");

        scrollTl.call(() => {
          const isForward = scrollTl.scrollTrigger ? scrollTl.scrollTrigger.direction > 0 : true;
          const selectorKey = ".section-one-wrapper .reveal-text";
          
          if (isForward && !revealedElements.has(selectorKey)) {
            revealedElements.add(selectorKey);

            gsap.to([
              ".section-one-wrapper .reveal-text .gs-line-inner",
              ".section-one-wrapper .reveal-text > *"
            ], {
              y: 0,
              opacity: 1,
              stagger: 0.05,
              duration: 0.8,
              ease: "power2.out",
              overwrite: "auto"
            });
          }
        }, [], "sectionOneStart+=0.4");

        scrollTl.addLabel("sectionOneEnd", "sectionOneStart+=4.5");

        scrollTl.fromTo(
          ".projects-hero-bg", 
          { yPercent: 0 }, 
          { yPercent: -18, ease: "none", duration: 11.5 }, 
          0
        );

        // ── STEP C: SECTION TWO SLIDES UP OVER SECTION ONE ──
        scrollTl.addLabel("sectionTwoStart", "sectionOneEnd+=0.2");
        scrollTl.to(".section-two-wrapper", {
          y: "0vh",
          duration: 2.5,
          ease: "power2.inOut",
          onStart: () => setIsSectionTwoActive(true),
          onReverseComplete: () => setIsSectionTwoActive(false)
        }, "sectionTwoStart");

        // ── STEP D: CTA REVEAL TRACK ──
        scrollTl.addLabel("ctaStart", "sectionTwoStart+=2.5");
        scrollTl.set(".projects-section-cta", { visibility: "visible" }, "ctaStart")
          .to(".projects-section-cta", { yPercent: 0, duration: 4.8 }, "ctaStart");

        // ── STEP E: FOOTER REVEAL TRACK ──
        scrollTl.addLabel("footerStart", "ctaStart+=4.8")
          .set(".projects-footer-wrap", { visibility: "visible" }, "footerStart")
          .to(".projects-footer-wrap", { yPercent: 0, duration: 5.5 }, "footerStart")
          .to(".projects-section-cta .cta-inner-desktop", { opacity: 0, duration: 4.0, ease: "power1.out" }, "footerStart");

        scrollTl.addLabel("end");
      };

      // 🌟 FIXED: Builds timeline instantly on the next frame without font-loading stalls
      requestAnimationFrame(buildTimeline);

    }, scopeRef);

    return () => {
      vvCleanup?.();
      if (isTouchOnly()) {
        ScrollTrigger.normalizeScroll(false);
      }
      ctx.revert();
      if (scopeRef.current) {
        restoreTextReveal(scopeRef.current, ".scroll-para-1");
        restoreTextReveal(scopeRef.current, ".scroll-para-2");
        restoreTextReveal(scopeRef.current, ".section-one-wrapper .reveal-text");
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