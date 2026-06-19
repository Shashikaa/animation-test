"use client";

import { useRef, useEffect, useLayoutEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSite } from "@/src/app/context/SiteContext";
import { useTextReveal, restoreTextReveal } from "@/src/app/utils/useTextReveal";
import Hero from "@/src/components/Service/Hero";
import SectionOne from "@/src/components/Service/SectionOne";
import SectionTwo from "@/src/components/Service/SectionTwo";
import SectionCTA from "@/src/components/SectionCTA";
import Footer from "@/src/components/Footer";

gsap.registerPlugin(ScrollTrigger);

type ServicesDesktopProps = {
  preloaderDone: boolean;
};

export default function ServicesDesktop({ preloaderDone }: ServicesDesktopProps) {
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
      gsap.set([".hero-title", ".hero-desc"], { opacity: 0, y: 30 });
      gsap.set(".services-hero-top-layer", { width: "100%" });
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
        scale: 1.1, 
        duration: 2.2,
        ease: "power2.out"
      }, 0);

      introTl.to([".hero-title", ".hero-desc"], {
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
      // 🌟 UPDATED: 5 distinct transition phases * 2200px = 11000px total distance
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: ".services-hero-master",
          start: "top top",
          end: "+=11000", 
          pin: true,
          scrub: 0.8, // 🌟 UPDATED: Matches the tactile response weight of your premium profiles
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

      // ── 2. SECOND PHASE: Reveal Section One Sheet ──
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

      scrollTl.to(".s1-glass-card", {
        opacity: 1,
        x: 0,
        duration: 1.5,
        ease: "power2.out"
      }, 2.0);

      scrollTl.to([".s1-static-title", ".s1-static-desc"], {
        opacity: 1,
        y: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: "power2.out"
      }, 2.4);

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

      scrollTl.to({}, { duration: 0.3 });

      // ── 3. THIRD PHASE: Transition to Section Two ──
      scrollTl.set(".services-section-two-wrap", { visibility: "visible" })
        .to(".services-section-two-wrap", {
          clipPath: "inset(0% 0% 0% 0%)", 
          duration: 2.0,
          ease: "power1.inOut",
          onStart: () => setIsSectionTwoActive(true),
          onReverseComplete: () => setIsSectionTwoActive(false)
        })
        .to(".section-one-wrap", {
          duration: 2.0,
          ease: "power1.inOut",
        }, "<");

      useTextReveal(scopeRef, ".s2-reveal-text", {
        tl: scrollTl,
        position: ">-=0.2",
        yOffset: 25,
        stagger: 0.04,
        duration: 0.5,
        ease: "power2.out",
      });

      scrollTl.to({}, { duration: 0.3 });

      // ── 4. FOURTH PHASE: Section CTA Reveal ──
      scrollTl.addLabel("ctaStart")
        .set(".services-section-cta", { visibility: "visible" }, "ctaStart")
        .to(".services-section-cta", {
          y: "0%",
          duration: 2.2,
          ease: "power1.inOut"
        }, "ctaStart");

      scrollTl.to({}, { duration: 0.3 });

      // ── 5. FIFTH PHASE: Footer Reveal ──
      scrollTl.addLabel("footerStart")
        .set(".services-footer-wrap", { visibility: "visible" }, "footerStart")
        .to(".services-footer-wrap", {
          y: "0%",
          duration: 2.2,
          ease: "power1.inOut"
        }, "footerStart");

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
        <Hero />
        <div className="section-one-wrap absolute inset-0 w-full h-full z-20  overflow-hidden">
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