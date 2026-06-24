"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSite } from "@/src/app/context/SiteContext";
import ProjectsHero from "../../components/Projects/ProjectsHero"; 
import SectionOne from "@/src/components/Projects/SectionOne";
import SectionTwo from "@/src/components/Projects/SectionTwo";

gsap.registerPlugin(ScrollTrigger);

type ContactProps = {
  preloaderDone: boolean;
};

export default function ProjectsMobile({ preloaderDone }: ContactProps) {
  const { setPreloaderDone } = useSite();
  const [introDone, setIntroDone] = useState(false);
  const scopeRef = useRef<HTMLDivElement>(null);
  const sectionOneRef = useRef<HTMLDivElement>(null);

  // State to pass to Section Two activation context
  const [isSectionTwoActive, setIsSectionTwoActive] = useState(false);

  // 1. Reset viewport states and handle window flags on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    setPreloaderDone(true);
  }, [setPreloaderDone]);

  // 2. Setup baseline layout states before render paint
  useLayoutEffect(() => {
    if (!preloaderDone) return;
    const ctx = gsap.context(() => {
      // Scale up layout for the upcoming zoom-out sequence
      gsap.set(".projects-hero-bg", { scale: 1.3, yPercent: 0 });
      gsap.set([".hero-title", ".hero-desc"], { opacity: 0, y: 30 });

      // Match hidden initial state for paragraphs
      gsap.set(".scroll-para-1", { opacity: 0, visibility: "hidden", display: "block" });
      gsap.set(".scroll-para-2", { opacity: 0, visibility: "hidden", display: "none" });

      // Layer 2 & 3 baseline offsets positioning
      gsap.set(".section-one-wrapper", { top: "100vh", height: "auto", zIndex: 20 });
      gsap.set(".section-two-wrapper", { y: "100vh", zIndex: 30 });

      // Pull image higher inside SectionOne to prepare for the downward parallax sweep
      gsap.set(".parallax-img-asset", { yPercent: -20 });
    }, scopeRef);
    return () => ctx.revert();
  }, [preloaderDone]);

  // 3. Fire zoom-out timeline instantly when the preloader ends
  useEffect(() => {
    if (!preloaderDone) return;
    const ctx = gsap.context(() => {
      const masterTl = gsap.timeline();
      masterTl
        // Zooms out background image smoothly
        .to(".projects-hero-bg", { scale: 1.0, duration: 2.2, ease: "power2.out", onComplete: () => setIntroDone(true) }, 0)
        // Staggers the appearance of text content
        .to([".hero-title", ".hero-desc"], { opacity: 1, y: 0, duration: 1.4, stagger: 0.2, ease: "power3.out" }, 0.4);
    }, scopeRef);
    return () => ctx.revert();
  }, [preloaderDone]);

  // 4. Master Single Timeline Scroll Pin & Layering Controller
  useEffect(() => {
    if (!introDone) return;

    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: ".master-viewport",
          start: "top top",
          end: "+=5000", // Smooth scroll duration tracking layout layers
          pin: true,
          pinSpacing: true, 
          scrub: 1,
          invalidateOnRefresh: true,
        }
      });

      // ── STEP A: HERO ANIMATIONS & SCROLL TEXTS ──
      scrollTl.to(".hero-text-wrap", { opacity: 0, ease: "power1.inOut", duration: 1.5 }, 0);

      // Paragraph 1 Slide Up
      scrollTl.set(".scroll-para-1", { visibility: "visible" });
      scrollTl.to(".scroll-para-1", { opacity: 1, y: 0, duration: 1.0, ease: "power2.out" }, 0.8);

      // Paragraph 1 Crossfade Swap
      scrollTl.to(".scroll-para-1", { opacity: 0, ease: "power1.in", duration: 1.2 }, "+=0.8");
      scrollTl.set(".scroll-para-1", { display: "none", visibility: "hidden" });
      scrollTl.set(".scroll-para-2", { display: "block", visibility: "visible", opacity: 0 });

      // Paragraph 2 Slide Up
      scrollTl.to(".scroll-para-2", { opacity: 1, y: 0, duration: 1.0, ease: "power2.out" }, "<");
      scrollTl.to(".scroll-para-2", { opacity: 0, ease: "power1.in", duration: 1.0 }, "+=0.8");

      // Background background scale sync
      scrollTl.to(".projects-hero-bg", { scale: 1.15, ease: "power1.inOut", duration: 2.0 }, 0);

      // ── STEP B: SECTION ONE TALL SCROLL OVER HERO ──
      // Calculate how far Section One needs to move based on its natural mobile content height
      const getSectionOneScrollDistance = () => {
        if (!sectionOneRef.current) return "100vh";
        return `${sectionOneRef.current.offsetHeight}px`;
      };

      scrollTl.to(".section-one-wrapper", {
        y: () => `-${getSectionOneScrollDistance()}`,
        duration: 3.5,
        ease: "none"
      }, "+=0.2");

      // Parallax text asset counter shift inside Section One
      scrollTl.to(".parallax-img-asset", {
        yPercent: 20,
        ease: "none",
        duration: 3.5
      }, "<");

      // ── STEP C: SECTION TWO SLIDES UP OVER SECTION ONE ──
      scrollTl.to(".section-two-wrapper", {
        y: "0vh",
        duration: 2.5,
        ease: "power2.inOut",
        onStart: () => setIsSectionTwoActive(true),
        onReverseComplete: () => setIsSectionTwoActive(false)
      }, "+=0.4");

    }, scopeRef);

    const refreshTimeout = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);

    return () => {
      ctx.revert();
      clearTimeout(refreshTimeout);
    };
  }, [introDone]);

  return (
    <div 
      ref={scopeRef} 
      className={`w-full relative bg-[#19211C] ${!introDone ? "h-screen overflow-hidden" : "overflow-x-hidden"}`}
    >
      {/* Master viewport tracking all structural animation steps */}
      <div className="master-viewport relative w-full h-screen overflow-hidden">
        
        {/* Layer 1: Pinned Hero View */}
        <div className="projects-hero-master absolute inset-0 w-full h-full z-10">
          <ProjectsHero />
        </div>

        {/* Layer 2: Section One Wrapper Layer (Using variable auto height configuration) */}
        <div 
          ref={sectionOneRef}
          className="section-one-wrapper absolute left-0 right-0 w-full h-auto"
        >
          <SectionOne />
        </div>

        {/* Layer 3: Section Two Container Layer */}
        <div className="section-two-wrapper absolute inset-0 w-full h-full">
          <SectionTwo isActive={isSectionTwoActive} />
        </div>

      </div>
    </div>
  );
}