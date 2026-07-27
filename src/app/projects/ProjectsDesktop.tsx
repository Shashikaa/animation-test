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
  preloaderDone?: boolean;
};

// Dedicated Desktop Scroll Metrics matching Snap Setup
const PX_PER_MAIN_PANEL = 1250;
const PX_PER_SUB_STEP = 550; 
const PAUSE_PX = 150;

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

export default function ProjectsDesktop({ preloaderDone: propPreloaderDone = true }: ContactProps) {
  const { setPreloaderDone, preloaderDone } = useSite();
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

  // Lock body overflow strictly during hero intro
  useEffect(() => {
    const locked = !introDone;
    document.body.style.overflow = locked ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [introDone]);

  // Establish precise starting positions cleanly BEFORE browser paint
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.config({
        ignoreMobileResize: true,
        autoRefreshEvents: "DOMContentLoaded,load,visibilitychange,resize",
      });

      gsap.set(".projects-hero-bg", { scale: 1.4, yPercent: 0, force3D: true, transformOrigin: "center center" });
      gsap.set([".hero-title", ".hero-desc"], { opacity: 0, y: 30, force3D: true });
      
      gsap.set([".scroll-para-1", ".scroll-para-2"], { opacity: 1, visibility: "hidden" });
      
      gsap.set(".section-one-wrapper", { top: "100vh", y: 0, height: "auto", zIndex: 20 });
      gsap.set(".section-two-wrapper", { y: "100vh", zIndex: 30 });
      gsap.set(".parallax-img-asset", { yPercent: -20 });

      gsap.set([".projects-section-cta", ".projects-footer-wrap"], { yPercent: 100, visibility: "hidden", force3D: true });
      gsap.set(".projects-section-cta", { zIndex: 95 });
      gsap.set(".projects-footer-wrap", { zIndex: 96 });
    }, scopeRef);
    
    return () => ctx.revert();
  }, []);

  // Hero Intro Sequence matched to About Desktop setup
  useEffect(() => {
    const ctx = gsap.context(() => {
      const introTl = gsap.timeline({ 
        onComplete: () => {
          setIntroDone(true);
          setTimeout(() => ScrollTrigger.refresh(), 50);
        }
      });
      
      introTl
        .to(".projects-hero-bg", { scale: 1.15, duration: 1.5, ease: "power2.out" }, 0)
        .to([".hero-title", ".hero-desc"], { opacity: 1, y: 0, duration: 1.0, stagger: 0.15, ease: "power2.out" }, 0.2);
    }, scopeRef);
    
    return () => ctx.revert();
  }, []);

  // Master Timeline with Snap Engine + Preserved Original Section Animations
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

      useTextReveal(scopeRef, ".section-one-wrapper .reveal-text");

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

        const MAIN_PANELS_COUNT = 6;
        const SUB_STEPS_COUNT = 2;
        const PAUSES_COUNT = 4;

        const DYNAMIC_SCROLL_TRACK = 
          (MAIN_PANELS_COUNT * PX_PER_MAIN_PANEL) + 
          (SUB_STEPS_COUNT * PX_PER_SUB_STEP) + 
          (PAUSES_COUNT * PAUSE_PX);

        const scrollTl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: ".master-viewport",
            start: "top top",
            end: `+=${DYNAMIC_SCROLL_TRACK}`,
            pin: true,
            pinSpacing: true,
            scrub: 1,
            anticipatePin: 1,
            preventOverlaps: true,
            invalidateOnRefresh: true,
            snap: {
              directional: false,
              snapTo: (value, self) => {
                const totalDur = scrollTl.totalDuration();
                if (!totalDur) return value;

                const labelTimes = Array.from(
                  new Set(
                    Object.keys(scrollTl.labels).map(name =>
                      Number((scrollTl.labels[name] / totalDur).toFixed(5))
                    )
                  )
                ).sort((a, b) => a - b);

                if (labelTimes.length < 2) return value;

                const curProgress = self ? self.progress : value;
                const isScrollingDown = value >= curProgress;

                for (let i = 0; i < labelTimes.length - 1; i++) {
                  const start = labelTimes[i];
                  const end = labelTimes[i + 1];

                  if (curProgress >= start - 0.0001 && curProgress <= end + 0.0001) {
                    const gap = end - start;
                    if (gap <= 0.00001) continue;

                    const localProgress = (curProgress - start) / gap;

                    if (isScrollingDown) {
                      return localProgress >= 0.35 ? end : start;
                    } else {
                      return localProgress <= 0.50 ? start : end;
                    }
                  }
                }

                return value;
              },
              duration: { min: 0.4, max: 0.8 },
              delay: 0.05,
              ease: "power3.inOut"
            }
          }
        });

        const revealedElements = new Set<string>();

        // ── ORIGINAL ANIMATION STEP 1: HERO INNER TEXT SWAPPING ──
        scrollTl.addLabel("start", 0); 
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

        // ── ORIGINAL ANIMATION STEP 2: SECTION ONE SCROLL UP + HERO PARAGRAPH TWO EXIT ──
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

        // ── ORIGINAL ANIMATION STEP 3: SECTION TWO SLIDES UP OVER SECTION ONE ──
        scrollTl.addLabel("sectionTwoStart", "sectionOneEnd+=0.2");
        scrollTl.to(".section-two-wrapper", {
          y: "0vh",
          duration: 2.5,
          ease: "power2.inOut",
          onStart: () => setIsSectionTwoActive(true),
          onReverseComplete: () => setIsSectionTwoActive(false)
        }, "sectionTwoStart");

        // ── ORIGINAL ANIMATION STEP 4: CTA REVEAL TRACK ──
        scrollTl.addLabel("ctaStart", "sectionTwoStart+=2.5");
        scrollTl.set(".projects-section-cta", { visibility: "visible" }, "ctaStart")
          .to(".projects-section-cta", { yPercent: 0, duration: 4.8 }, "ctaStart")
          .set(".section-two-wrapper", { pointerEvents: "none" }, "ctaStart");

        // ── ORIGINAL ANIMATION STEP 5: FOOTER REVEAL TRACK ──
        scrollTl.addLabel("footerStart", "ctaStart+=4.8")
          .set(".projects-footer-wrap", { visibility: "visible" }, "footerStart")
          .to(".projects-footer-wrap", { yPercent: 0, duration: 5.5 }, "footerStart")
          .to(".projects-section-cta .cta-inner-desktop", { opacity: 0, duration: 4.0, ease: "power1.out" }, "footerStart");

        scrollTl.addLabel("end");
      };

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
          className="projects-section-cta absolute bottom-0 left-0 w-full h-full structural-layer pointer-events-auto"
          style={{ zIndex: 95 }}
        >
          <SectionCTA preloaderDone={preloaderDone ?? propPreloaderDone} />
        </div>
        
        {/* Layer 5: Footer Container */}
        <div
          className="projects-footer-wrap absolute left-0 bottom-0 w-full structural-layer"
          style={{ zIndex: 96 }}
        >
          <Footer />
        </div>

      </div>
    </div>
  );
}