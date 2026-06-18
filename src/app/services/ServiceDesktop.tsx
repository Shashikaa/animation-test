"use client";

import { useRef, useEffect, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSite } from "@/src/app/context/SiteContext";
import { useTextReveal, restoreTextReveal } from "@/src/app/utils/useTextReveal";
import Hero from "@/src/components/Service/Hero";
import SectionOne from "@/src/components/Service/SectionOne";
import SectionTwo from "@/src/components/Service/SectionTwo";

gsap.registerPlugin(ScrollTrigger);

type ServicesDesktopProps = {
  preloaderDone: boolean;
};

export default function ServicesDesktop({ preloaderDone }: ServicesDesktopProps) {
  const { setPreloaderDone } = useSite();
  const scopeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.history.scrollRestoration) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
    document.body.classList.remove("preloading");
    setPreloaderDone(true);
  }, [setPreloaderDone]);

  useLayoutEffect(() => {
    if (!preloaderDone) return;
    const ctx = gsap.context(() => {
      // Hero Defaults
      gsap.set(".service-hero-bg", { scale: 1.3, xPercent: 0, transformOrigin: "center center" });
      gsap.set([".hero-title", ".hero-desc"], { opacity: 0, y: 30 });
      gsap.set(".services-hero-top-layer", { width: "100%" });
      
      // Section One Layout Configs
      gsap.set(".section-one-wrap", { clipPath: "inset(100% 0% 0% 0%)" });
      
      // 🌟 Glass Card & Text Presets to mirror the About page setup
      gsap.set(".s1-glass-card", { x: 40, opacity: 0 }); 
      gsap.set([".s1-static-title", ".s1-static-desc"], { opacity: 0, y: 30 });
      gsap.set([".s1-reveal-top", ".s1-reveal-bottom"], { opacity: 0, y: 40 });
      
      // Section Two Configuration
      gsap.set(".services-section-two-wrap", { visibility: "hidden", clipPath: "inset(0% 0% 0% 100%)" });
    }, scopeRef);
    return () => ctx.revert();
  }, [preloaderDone]);

  useEffect(() => {
    if (!preloaderDone) return;

    const ctx = gsap.context(() => {
      const masterTl = gsap.timeline();

      // PART A: Initial Landing Intro
      masterTl.to(".service-hero-bg", {
        scale: 1.1, 
        duration: 2.2,
        ease: "power2.out"
      }, 0);

      masterTl.to([".hero-title", ".hero-desc"], {
        opacity: 1,
        y: 0,
        duration: 1.4,
        stagger: 0.2,
        ease: "power3.out",
      }, 0.4);

      // PART B: Main Scroll Timeline
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: ".services-hero-master",
          start: "top top",
          end: "+=500%", 
          pin: true,
          scrub: 1.5,
          invalidateOnRefresh: true,
        }
      });

      // ── 1. FIRST PHASE: Compress Hero Layout ──
      scrollTl.to(".hero-text-wrap", {
        opacity: 0,
        y: -40,
        duration: 0.5,
        ease: "power1.out"
      }, 0);

      scrollTl.to(".services-hero-top-layer", {
        width: "calc(100% - 600px)",
        duration: 1.5,
        ease: "power1.inOut",
      }, 0.1);

      // ── 2. SECOND PHASE: Reveal Section One Sheet & Glass Container Slide In ──
      scrollTl.to(".section-one-wrap", {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 1.5,
        ease: "power1.inOut"
      }, 1.6);

      scrollTl.to(".service-hero-bg", {
        xPercent: -8,   
        scale: 1.6,     
        duration: 1.5,
        ease: "power1.inOut",
      }, 1.6);

      // 🌟 Matches Section Five behavior of About: Glass Card slides horizontally & fades in
      scrollTl.to(".s1-glass-card", {
        opacity: 1,
        x: 0,
        duration: 1.5,
        ease: "power2.out"
      }, 2.0);

      // Static text blocks fade up slightly behind it
      scrollTl.to([".s1-static-title", ".s1-static-desc"], {
        opacity: 1,
        y: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: "power2.out"
      }, 2.4);

      // Core structural content animations running natively
      scrollTl.to(".s1-reveal-top", {
        opacity: 1,
        y: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: "power2.out"
      }, 2.2);

      scrollTl.to(".s1-reveal-bottom", {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out"
      }, 2.1);

      // Brief pause to read Section One content
      scrollTl.to({}, { duration: 1.0 });

      // ── 3. THIRD PHASE: Transition to Section Two ──
      scrollTl.set(".services-section-two-wrap", { visibility: "visible" })
        .to(".services-section-two-wrap", {
          clipPath: "inset(0% 0% 0% 0%)", 
          duration: 2.0,
          ease: "power1.inOut",
        })
        .to(".section-one-wrap", {
   
          duration: 2.0,
          ease: "power1.inOut",
        }, "<");

      // Section Two Text Reveal
      useTextReveal(scopeRef, ".s2-reveal-text", {
        tl: scrollTl,
        position: ">-=1.2",
        yOffset: 25,
        stagger: 0.04,
        duration: 0.5,
        ease: "power2.out",
      });

      scrollTl.to({}, { duration: 0.5 });

    }, scopeRef);

    return () => {
      ctx.revert();
      if (scopeRef.current) {
        restoreTextReveal(scopeRef.current, ".s2-reveal-text");
      }
    };
  }, [preloaderDone]);

  return (
    <div ref={scopeRef} className="w-full bg-[#111] relative">
      <div className="services-hero-master relative w-full h-screen overflow-hidden z-10">
        
        <Hero />
        
        <div className="section-one-wrap absolute inset-0 w-full h-full z-20 bg-[#111] overflow-hidden">
          <SectionOne />
        </div>

        <div className="services-section-two-wrap absolute inset-0 w-full h-full z-30 overflow-y-auto bg-[#111]">
          <SectionTwo />
        </div>

      </div>
    </div>
  );
}