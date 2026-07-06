"use client";

import { useRef, useEffect, useLayoutEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSite } from "@/src/app/context/SiteContext";
import { useTextReveal, restoreTextReveal } from "@/src/app/utils/useTextReveal";
import SubServiceHero from "@/src/components/Service/SubServiceHero";
import SectionOne from "@/src/components/Service/SectionOne";
import SectionTwo from "@/src/components/Service/SectionTwo";
import SectionCTA from "@/src/components/SectionCTA";
import Footer from "@/src/components/Footer";
import { FullServiceData } from "./data";

gsap.registerPlugin(ScrollTrigger);

type SubServicesDesktopProps = {
  preloaderDone: boolean;
  pageData: FullServiceData;
};

export default function SubServicesDesktop({ preloaderDone, pageData }: SubServicesDesktopProps) {
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

  useLayoutEffect(() => {
    if (!preloaderDone) return;
    const ctx = gsap.context(() => {
      gsap.set(".service-hero-bg", { scale: 1.3, xPercent: 0, transformOrigin: "center center" });
      
      // 🌟 ADDED: Include '.hero-btn' selector to initial hidden layout configuration
      gsap.set([".hero-title", ".hero-desc", ".hero-btn"], { opacity: 0, y: 30 });
      
      gsap.set(".services-hero-top-layer", { width: "100%", xPercent: 0 }); 
      gsap.set(".section-one-wrap", { clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(".s1-glass-card", { x: 40, opacity: 0 }); 
      gsap.set([".s1-static-title", ".s1-static-desc"], { opacity: 0, y: 30 });
      gsap.set([".s1-reveal-top", ".s1-reveal-bottom"], { opacity: 0, y: 40 });
      gsap.set(".services-section-two-wrap", { visibility: "hidden", clipPath: "inset(0% 0% 0% 100%)" });
      gsap.set(".services-section-cta", { visibility: "hidden", y: "100%" });
      gsap.set(".services-footer-wrap", { visibility: "hidden", y: "100%" });
    }, scopeRef);
    return () => ctx.revert();
  }, [preloaderDone]);

  useEffect(() => {
    if (!preloaderDone) return;

    const ctx = gsap.context(() => {
      const introTl = gsap.timeline({
        onComplete: () => setIntroDone(true)
      });

      introTl.to(".service-hero-bg", {
        scale: 1.0, 
        duration: 2.2,
        ease: "power2.out"
      }, 0);

      // 🌟 ADDED: Include '.hero-btn' into the cascade list array for an automatic sequential stagger effect
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
      let cachedProgressLabels: number[] = [];

      const scrollTl = gsap.timeline({
        defaults: { ease: "none" }, 
        scrollTrigger: {
          trigger: ".services-hero-master",
          start: "top top",
          end: "+=11000", 
          pin: true,
          pinSpacing: true,
          scrub: 0.8, 
          invalidateOnRefresh: true,
          fastScrollEnd: true,
          preventOverlaps: true,
          snap: {
            snapTo: (progress) => {
              if (cachedProgressLabels.length === 0) return progress;
              if (progress <= 0) return 0;
              if (progress >= 1) return 1;

              for (let i = 0; i < cachedProgressLabels.length - 1; i++) {
                const start = cachedProgressLabels[i];
                const end = cachedProgressLabels[i + 1];

                if (progress >= start && progress <= end) {
                  const localProgress = (progress - start) / (end - start);
                  return localProgress > 0.3 ? end : start;
                }
              }
              return progress;
            },
            duration: { min: 0.7, max: 1.2 },  
            delay: 0.1,                                                                                                                                                                                
            ease: "power2.inOut"              
          }
        }
      });

      // ── PHASE 1: Compress Hero Layout & Translate Left ──
      scrollTl.addLabel("phase1")
        .to(".hero-text-wrap", {
          opacity: 0,
          y: -40,
          duration: 0.5,
          ease: "power1.out"
        }, "phase1")
        .to(".services-hero-top-layer", {
          width: "calc(100% - 600px)", 
          xPercent: -10,              
          duration: 1.5,
          ease: "power1.inOut",
        }, "phase1+=0.1");

      scrollTl.to({}, { duration: 0.2 });

      // ── PHASE 2: Reveal Section One Sheet ──
      scrollTl.addLabel("phase2")
        .to(".section-one-wrap", {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.5,
          ease: "power1.inOut"
        }, "phase2")
        .to(".service-hero-bg", {
          scale: 1.1,     
          duration: 1.5,
          ease: "power1.inOut",
        }, "phase2")
        .to(".s1-glass-card", {
          opacity: 1,
          x: 0,
          duration: 1.5,
          ease: "power2.out"
        }, "phase2+=0.4")
        .to(".s1-reveal-bottom", {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out"
        }, "phase2+=0.5")
        .to(".s1-reveal-top", {
          opacity: 1,
          y: 0,
          stagger: 0.15,
          duration: 0.8,
          ease: "power2.out"
        }, "phase2+=0.6")
        .to([".s1-static-title", ".s1-static-desc"], {
          opacity: 1,
          y: 0,
          duration: 1.2,
          stagger: 0.15,
          ease: "power2.out"
        }, "phase2+=0.8");

      scrollTl.to({}, { duration: 0.2 });

      // ── PHASE 3: Transition to Section Two ──
      scrollTl.addLabel("phase3")
        .set(".services-section-two-wrap", { visibility: "visible" }, "phase3")
        .to(".services-section-two-wrap", {
          clipPath: "inset(0% 0% 0% 0%)", 
          duration: 2.0,
          ease: "power1.inOut",
          onStart: () => setIsSectionTwoActive(true),
          onReverseComplete: () => setIsSectionTwoActive(false)
        }, "phase3")
        .to(".section-one-wrap", {
          duration: 2.0,
          ease: "power1.inOut",
        }, "phase3");

      useTextReveal(scopeRef, ".s2-reveal-text", {
        tl: scrollTl,
        position: "phase3+=0.8",
        yOffset: 25,
        stagger: 0.04,
        duration: 0.5,
        ease: "power2.out",
      });

      scrollTl.to({}, { duration: 0.2 });

      // ── PHASE 4: Section CTA Reveal ──
      scrollTl.addLabel("phase4")
        .set(".services-section-cta", { visibility: "visible" }, "phase4")
        .to(".services-section-cta", {
          y: "0%",
          duration: 2.2,
        }, "phase4");

      scrollTl.to({}, { duration: 0.2 });

      // ── PHASE 5: Footer Reveal ──
      scrollTl.addLabel("phase5")
        .set(".services-footer-wrap", { visibility: "visible" }, "phase5")
        .to(".services-footer-wrap", {
          y: "0%",
          duration: 2.2,
        }, "phase5");

      const totalDuration = scrollTl.totalDuration();
      const labelNames = ["phase1", "phase2", "phase3", "phase4", "phase5"];
      cachedProgressLabels = [0, ...labelNames.map(name => scrollTl.labels[name] / totalDuration), 1];

    }, scopeRef);

    return () => {
      ctx.revert();
      if (scopeRef.current) {
        restoreTextReveal(scopeRef.current, ".s2-reveal-text");
      }
    };
  }, [introDone]);

  return (
    <div ref={scopeRef} className="w-full relative">
      <div className="services-hero-master relative w-full h-screen overflow-hidden z-10">
        
        <SubServiceHero data={pageData.hero} />

        <div className="section-one-wrap absolute inset-0 w-full h-full z-20 overflow-hidden">
          <SectionOne />
        </div>
        
        <div className="services-section-two-wrap absolute inset-0 w-full h-full z-30 overflow-hidden bg-[#111]">
          <SectionTwo isActive={isSectionTwoActive} />
        </div>
        
        <div
          className="services-section-cta absolute inset-0 w-full h-full bg-white"
          style={{ zIndex: 40, transform: "translateY(100%)" }}
        >
          <SectionCTA />
        </div>
        
        <div
          className="services-footer-wrap absolute inset-0 w-full h-full flex flex-col justify-end"
          style={{ zIndex: 50, transform: "translateY(100%)" }}
        >
          <Footer />
        </div>
        
      </div>
    </div>
  );
}