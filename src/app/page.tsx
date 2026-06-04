"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip"; // Import Flip
import { useSite } from "./context/SiteContext";

import Hero from "../components/Hero";
import SectionOne from "../components/SectionOne";
import SectionTwo from "../components/SectionTwo";
import SectionThree from "../components/SectionThree";
import SectionFour from "../components/SectionFour";
import SectionFive from "../components/SectionFive";
import PreloaderWrapper from "../components/PreloaderWrapper";
import SectionSix from "../components/SectionSix";
import SectionSeven from "../components/Sectionseven";
import SectionEight from "../components/Sectioneight";
import SectionNine from "../components/SectionNine";

// Register all required plugins globally
gsap.registerPlugin(ScrollTrigger, Flip);

export default function Home() {
  const { preloaderDone } = useSite();
  const scopeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!preloaderDone) return;

    // Use GSAP Context for seamless React scoped selectors and garbage collection
    const ctx = gsap.context(async () => {
      
      // Wait safely for assets and fonts without arbitrary timeout hacks
      await Promise.all([
        document.fonts.ready,
        new Promise<void>((resolve) => {
          if (document.readyState === "complete") resolve();
          else window.addEventListener("load", () => resolve(), { once: true });
        })
      ]);

      // ── Initial States ──────────────────────────────────────────────────
      gsap.set(".hero",      { yPercent: 0, zIndex: 20 });
      gsap.set(".section-1", { yPercent: 0, zIndex: 10 });

      gsap.set([".s3-bg-2", ".s3-bg-3", ".s3-text-2", ".s3-text-3"], { opacity: 0 });
      gsap.set([".s3-bg-1", ".s3-text-1"], { opacity: 1 });
      
      gsap.set([".s3-bar-2", ".s3-bar-3"], { background: "rgba(244,238,223,0.3)" });
      gsap.set(".s3-bar-1", { background: "#F4EEDF" });

      gsap.set(".section-4", { yPercent: 100, visibility: "visible", zIndex: 40 });
      gsap.set(".section-5", { yPercent: 100, visibility: "visible", zIndex: 50 });
      gsap.set(".s5-card", { scale: 1, transformOrigin: "center center" });

      gsap.set([".section-3", ".section-8"], {
        visibility: "hidden",
        clipPath: "inset(100% 0% 0% 0%)",
        zIndex: 30,
      });

      const FADE = 0.4;

      // ── Timeline 1: Hero → Section 1 ──────────────────────────────────
      gsap.timeline({
        scrollTrigger: {
          trigger: ".pin-hero-s1",
          start: "top top",
          end: "+=1500",
          scrub: 1,
          pin: true,
          pinType: "fixed",
          anticipatePin: 1,
        },
      })
      .to(".hero", { yPercent: -100, duration: 1, ease: "none" })
      .to(".section-1", { filter: "blur(4px)", opacity: 0.9, duration: 0.5, ease: "power2.inOut" });

      // ── Timeline 2: S2 → S3(×3) → S4 → S5 ────────────────────────────
      const tl2 = gsap.timeline({
        scrollTrigger: {
          trigger: ".pin-s2-s5",
          start: "top top",
          end: "+=5000",
          scrub: 1,
          pin: true,
          pinType: "fixed",
          anticipatePin: 1,
        },
      });

      tl2.set(".section-3", { visibility: "visible" })
         .to(".section-3", { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "power2.inOut" })
         .to(".section-2", { scale: 1.05, duration: 1.5, ease: "power2.inOut" }, "<")
         .to({}, { duration: 0.53 })
         // Slide 2 Transition
         .to(".s3-bg-1", { opacity: 0, duration: FADE, ease: "power1.inOut" })
         .to(".s3-bg-2", { opacity: 1, duration: FADE, ease: "power1.inOut" }, "<")
         .to(".s3-text-1", { opacity: 0, duration: FADE, ease: "power1.inOut" }, "<")
         .to(".s3-text-2", { opacity: 1, duration: FADE, ease: "power1.inOut" }, "<")
         .to(".s3-bar-1",  { background: "rgba(244,238,223,0.3)", duration: FADE }, "<")
         .to(".s3-bar-2",  { background: "#F4EEDF", duration: FADE }, "<")
         .to({}, { duration: 0.53 })
         // Slide 3 Transition
         .to(".s3-bg-2", { opacity: 0, duration: FADE, ease: "power1.inOut" })
         .to(".s3-bg-3", { opacity: 1, duration: FADE, ease: "power1.inOut" }, "<")
         .to(".s3-text-2", { opacity: 0, duration: FADE, ease: "power1.inOut" }, "<")
         .to(".s3-text-3", { opacity: 1, duration: FADE, ease: "power1.inOut" }, "<")
         .to(".s3-bar-2",  { background: "rgba(244,238,223,0.3)", duration: FADE }, "<")
         .to(".s3-bar-3",  { background: "#F4EEDF", duration: FADE }, "<")
         .to({}, { duration: 0.53 })
         // S4 & S5 Entrance
         .to(".section-4", { yPercent: 0, duration: 2.0, ease: "power3.inOut" })
         .to({}, { duration: 0.5 })
         .to(".section-3", { yPercent: -100, duration: 1.5, ease: "power2.inOut" })
         .to(".section-4", { yPercent: -100, duration: 1.5, ease: "power2.inOut" }, "<")
         .to(".section-5", { yPercent: 0,    duration: 1.5, ease: "power2.inOut" }, "<");

      // Dynamic Card Scale handling without raw window sizing dependencies
      let cardTween: gsap.core.Tween | null = null;
      ScrollTrigger.create({
        trigger: ".pin-s2-s5",
        start: "top top",
        end: "+=5000",
        onLeave: () => {
          if (cardTween) cardTween.kill();
          cardTween = gsap.to(".s5-card", { scaleX: window.innerWidth / 577, scaleY: window.innerHeight / 623, duration: 1.2, ease: "power2.inOut" });
        },
        onEnterBack: () => {
          if (cardTween) cardTween.kill();
          cardTween = gsap.to(".s5-card", { scaleX: 1, scaleY: 1, duration: 1.2, ease: "power2.inOut" });
        },
      });

      // ── Timeline 3: S7 → S8 ───────────────────────────────────────────
      gsap.timeline({
        scrollTrigger: {
          trigger: ".pin-s7-s8",
          start: "top top",
          end: "+=1500",
          scrub: 1,
          pin: true,
          pinType: "fixed",
          anticipatePin: 1,
        },
      })
      .set(".section-8", { visibility: "visible" })
      .to(".section-8", { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "power2.inOut" })
      .to(".section-7", { scale: 1.05, duration: 1.5, ease: "power2.inOut" }, "<");

      // ── Section 9: Elegant Layout Morphing (Flip Plugin) ──────────────────
      const title = document.querySelector<HTMLElement>(".s9-title");
      const targetContainer = document.querySelector<HTMLElement>(".s9-title-target");
      const para = document.querySelector<HTMLElement>(".s9-para");
      const sec = document.querySelector<HTMLElement>(".s9-section");

      if (title && targetContainer && para && sec) {
        gsap.set(para, { opacity: 0, y: 15 });

        // 1. Capture original (First) visual state while layout is in its center CSS structure
        const state = Flip.getState(title);

        // 2. Reposition the node into its end design (Last) structure
        targetContainer.appendChild(title);
        
        // Let CSS values adapt natively for target styles (24px, wrapping configurations etc.)
        gsap.set(title, { clearProps: "all" }); 

        // 3. Construct modern FLIP timeline sequence
        const s9tl = gsap.timeline({ paused: true });
        
        s9tl.add(Flip.from(state, {
          duration: 0.8,
          ease: "power2.inOut",
          scale: true, // Seamlessly changes visual font sizes without tearing layout
        }))
        .to(para, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, "-=0.2");

        // 4. Trigger on scene entrance cleanly
        ScrollTrigger.create({
          trigger: sec,
          start: "top top",
          toggleActions: "play none none reverse",
          animation: s9tl,
        });
      }

      // Final unified layout synchronization
      ScrollTrigger.refresh();

    }, scopeRef); // Scopes selector queries automatically within our component template boundaries

    return () => ctx.revert(); // Erases all listeners, timelines, and configurations instantly on unmount
  }, [preloaderDone]);

  return (
    <div ref={scopeRef}>
      <PreloaderWrapper />

      <div className="pin-hero-s1 relative h-screen">
        <div className="section-1 absolute inset-0 z-10">
          <SectionOne />
        </div>
        <div className="hero absolute inset-0 z-20">
          <Hero />
        </div>
      </div>

      <div className="pin-s2-s5 relative h-screen overflow-hidden">
        <div className="section-2 absolute inset-0 z-10">
          <SectionTwo />
        </div>
        <SectionThree />
        <SectionFour />
        <SectionFive />
      </div>

      <div className="h-screen">
        <SectionSix />
      </div>

      <div className="pin-s7-s8 relative h-screen overflow-hidden">
        <div className="section-7 absolute inset-0 z-10">
          <SectionSeven />
        </div>
        <div className="section-8 absolute inset-0 z-30">
          <SectionEight />
        </div>
      </div>

      <SectionNine />

    </div>
  );
}