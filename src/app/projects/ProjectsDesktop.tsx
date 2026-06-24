"use client";

import { useRef, useEffect, useState, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSite } from "@/src/app/context/SiteContext";
import ProjectsHero from "../../components/Projects/ProjectsHero";
import { useTextReveal, restoreTextReveal } from "@/src/app/utils/useTextReveal";
import SectionOne from "@/src/components/Projects/SectionOne";
import SectionTwo from "@/src/components/Projects/SectionTwo";

gsap.registerPlugin(ScrollTrigger);

type ContactProps = {
  preloaderDone: boolean;
};

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
    setPreloaderDone(true);
  }, [setPreloaderDone]);

  // 1. Establish precise starting positions cleanly
  useLayoutEffect(() => {
    if (!preloaderDone) return;
    
    const ctx = gsap.context(() => {
      gsap.set(".projects-hero-bg", { scale: 1.4, transformOrigin: "center center" });
      gsap.set([".hero-title", ".hero-desc"], { opacity: 0, y: 30 });
      
      // Section One uses top placement and standard natural heights
      gsap.set(".section-one-wrapper", { top: "100vh", height: "auto", zIndex: 20 });
      gsap.set(".section-two-wrapper", { y: "100vh", zIndex: 30 });
      gsap.set(".parallax-img-asset", { yPercent: -20 });
    }, scopeRef);
    
    return () => ctx.revert();
  }, [preloaderDone]);

  // 2. Play Intro Cinematic
  useEffect(() => {
    if (!preloaderDone) return;
    
    const ctx = gsap.context(() => {
      const introTl = gsap.timeline({ 
        onComplete: () => setIntroDone(true) 
      });
      
      introTl
        .to(".projects-hero-bg", { scale: 1, duration: 2.2, ease: "power2.out" }, 0)
        .to([".hero-title", ".hero-desc"], { opacity: 1, y: 0, duration: 1.4, stagger: 0.15, ease: "power3.out" }, 0.4);
    }, scopeRef);
    
    return () => ctx.revert();
  }, [preloaderDone]);

  // 3. Master Single Timeline Scroll Pin & Layering Controller
  useEffect(() => {
    if (!introDone) return;

    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: ".master-viewport",
          start: "top top",
          end: "+=5500", 
          pin: true,
          pinSpacing: true,
          scrub: 1, 
          invalidateOnRefresh: true,
        }
      });

      // ── STEP A: TEXT SWAPPING SEQUENCE ──
      // Title fades out
      scrollTl.to(".hero-text-wrap", { opacity: 0, ease: "power1.inOut", duration: 1.2 }, 0);
      
      // Paragraph 1 Text Reveal
      useTextReveal(scopeRef, ".scroll-para-1", {
        tl: scrollTl, position: 0.5, yOffset: 30, duration: 0.7, ease: "power2.out", stagger: 0.04
      });

      // Paragraph 1 Exit: Fast clean fade out
      scrollTl.to(".scroll-para-1", { opacity: 0, ease: "power2.in", duration: 0.4 }, "+=0.6");
      // Explicitly turn it hidden right here so it cannot overlap paragraph 2
      scrollTl.set(".scroll-para-1", { visibility: "hidden" });
      
      // Paragraph 2 Entrance: Starts immediately after paragraph 1 is hidden ("Pristine canvas")
      useTextReveal(scopeRef, ".scroll-para-2", {
        tl: scrollTl, position: ">", yOffset: 30, duration: 0.7, ease: "power2.out", stagger: 0.04
      });
      
      // Paragraph 2 Exit
      scrollTl.to(".scroll-para-2", { opacity: 0, ease: "power1.in", duration: 0.8 }, "+=0.6");
      scrollTl.set(".scroll-para-2", { visibility: "hidden" });

      // ── HOOK UP THE ZOOM TO MATCH ENTIRE TEXT SEQUENCE OVERALL DURATION ──
      // This forces the zoom to start at 0 and run up to the exact ending frame of Paragraph 2's exit.
      scrollTl.fromTo(
        ".projects-hero-bg", 
        { scale: 1 }, 
        { scale: 1.32, ease: "none", duration: scrollTl.duration() }, 
        0
      );

      // ── STEP B: SECTION ONE TALL SCROLL OVER HERO ──
      const getSectionOneScrollDistance = () => {
        if (!sectionOneRef.current) return "100vh";
        const elementHeight = sectionOneRef.current.offsetHeight;
        return `${elementHeight}px`;
      };

      // Starts precisely when Paragraph 2 finishes hiding completely
      scrollTl.to(".section-one-wrapper", {
        y: () => `-${getSectionOneScrollDistance()}`,
        duration: 4.0, 
        ease: "none"
      }, "+=0.1");

      scrollTl.to(".parallax-img-asset", {
        yPercent: 20,
        ease: "none",
        duration: 4.0
      }, "<");

      // ── STEP C: SECTION TWO SLIDES UP OVER SECTION ONE ──
      scrollTl.to(".section-two-wrapper", {
        y: "0vh",
        duration: 2.5,
        ease: "power2.inOut",
        onStart: () => setIsSectionTwoActive(true),
        onReverseComplete: () => setIsSectionTwoActive(false)
      }, "+=0.5");

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
      <div className="master-viewport relative w-full h-screen overflow-hidden">
        
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

      </div>
    </div>
  );
}