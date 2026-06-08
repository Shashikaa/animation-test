"use client";

/**
 * page.tsx — GSAP only, Lenis-safe
 * ─────────────────────────────────────────────────────────────────
 * ALL scroll animations live here in GSAP + ScrollTrigger.
 * CSS scroll-driven animations (animation-timeline) are removed —
 * they read native scrollTop which Lenis virtualises, so they
 * desynced from the scrub and killed smooth scrolling.
 *
 * What changed from the original:
 *   - section-9 initial opacity: now set to 0 (was 1 — caused it
 *     to cover section-7 before the panel split animation)
 *   - section-9 fades in during the panel split (not before)
 *   - s8-panel z-index stacking: panels must sit ABOVE section-9
 *     so the clip-path reveal actually uncovers it
 *   - No CSS animations on .hero / .section-1 — GSAP only
 * ─────────────────────────────────────────────────────────────────
 */

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";
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

gsap.registerPlugin(ScrollTrigger, Flip);

export default function Home() {
  const { preloaderDone } = useSite();
  const scopeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!preloaderDone) return;

    const ctx = gsap.context(async () => {

      await Promise.all([
        document.fonts.ready,
        new Promise<void>((resolve) => {
          if (document.readyState === "complete") resolve();
          else window.addEventListener("load", () => resolve(), { once: true });
        }),
      ]);

      gsap.ticker.lagSmoothing(0);
      ScrollTrigger.config({ ignoreMobileResize: true });
      ScrollTrigger.refresh();

      // ── Initial States ────────────────────────────────────────────

      gsap.set(".hero",      { yPercent: 0, zIndex: 20 });
      gsap.set(".section-1", { yPercent: 0, zIndex: 10 });

      gsap.set([".s3-bg-2", ".s3-bg-3", ".s3-text-2", ".s3-text-3"], { opacity: 0 });
      gsap.set([".s3-bg-1",  ".s3-text-1"], { opacity: 1 });
      gsap.set([".s3-bar-2", ".s3-bar-3"], { background: "rgba(244,238,223,0.3)" });
      gsap.set(".s3-bar-1",  { background: "#F4EEDF" });

      gsap.set(".section-4", { yPercent: 100, visibility: "visible", zIndex: 40 });
      gsap.set(".section-5", { yPercent: 100, visibility: "visible", zIndex: 50 });
      gsap.set(".s5-card",   { scale: 1, transformOrigin: "center center" });

      gsap.set([".section-3", ".section-8"], {
        visibility: "hidden",
        clipPath: "inset(100% 0% 0% 0%)",
        zIndex: 30,
      });

      // section-7: sits behind section-8 and section-9
      gsap.set(".section-7", { opacity: 1, visibility: "visible", zIndex: 5 });

      // FIX: section-9 starts at opacity 0 so it does NOT cover section-7.
      // It will fade in during the panel split in Timeline 3.
      // z-index must be above section-7 (5) but below section-8 panels (35).
      gsap.set(".section-9", { opacity: 0, zIndex: 15 });

      // S8 panels sit on top of everything in pin-s7-s9 (z-index 35)
      // and clip-path animate to reveal section-9 (z-index 15) beneath.
      gsap.set(".s8-panel-left",  { clipPath: "inset(0% 50% 0% 0%)",  zIndex: 35 });
      gsap.set(".s8-panel-right", { clipPath: "inset(0% 0% 0% 50%)",  zIndex: 35 });

      gsap.set(".s9-title", {
        position: "absolute",
        zIndex: 20,
        color: "#F4EEDF",
        top: "50%",
        left: "50%",
        xPercent: -50,
        yPercent: -50,
        fontSize: "46px",
        lineHeight: 1.2,
        whiteSpace: "nowrap",
        margin: 0,
        padding: 0,
        pointerEvents: "none",
      });
      gsap.set(".s9-para", { opacity: 0 });

      const FADE = 0.4;

      // ── Timeline 1: Hero → S1 ─────────────────────────────────────
      gsap.timeline({
        scrollTrigger: {
          trigger: ".pin-hero-s1",
          start: "top top",
          end: "+=1500",
          scrub: 0.50,
          pin: true,
          anticipatePin: 1,
          fastScrollEnd: true,
          preventOverlaps: true,
        },
      })
      .to(".hero",      { yPercent: -100, duration: 1,   ease: "none" })
      .to(".section-1", { filter: "blur(4px)", opacity: 0.9, duration: 0.5, ease: "power2.inOut" });

      // ── Timeline 2: S2 → S3(×3) → S4 → S5 ───────────────────────
      const tl2 = gsap.timeline({
        scrollTrigger: {
          trigger: ".pin-s2-s5",
          start: "top top",
          end: "+=6000",
          scrub: 0.50,
          pin: true,
          anticipatePin: 1,
          fastScrollEnd: true,
          preventOverlaps: true,
        },
      });

      tl2
        .set(".section-3", { visibility: "visible" })
        .to(".section-3", { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "power2.inOut" })
        .to(".section-2", { scale: 1.05, duration: 1.5, ease: "power2.inOut" }, "<")
        .to({}, { duration: 0.53 })
        .to(".s3-bg-1",   { opacity: 0, duration: FADE, ease: "power1.inOut" })
        .to(".s3-bg-2",   { opacity: 1, duration: FADE, ease: "power1.inOut" }, "<")
        .to(".s3-text-1", { opacity: 0, duration: FADE, ease: "power1.inOut" }, "<")
        .to(".s3-text-2", { opacity: 1, duration: FADE, ease: "power1.inOut" }, "<")
        .to(".s3-bar-1",  { background: "rgba(244,238,223,0.3)", duration: FADE }, "<")
        .to(".s3-bar-2",  { background: "#F4EEDF", duration: FADE }, "<")
        .to({}, { duration: 0.53 })
        .to(".s3-bg-2",   { opacity: 0, duration: FADE, ease: "power1.inOut" })
        .to(".s3-bg-3",   { opacity: 1, duration: FADE, ease: "power1.inOut" }, "<")
        .to(".s3-text-2", { opacity: 0, duration: FADE, ease: "power1.inOut" }, "<")
        .to(".s3-text-3", { opacity: 1, duration: FADE, ease: "power1.inOut" }, "<")
        .to(".s3-bar-2",  { background: "rgba(244,238,223,0.3)", duration: FADE }, "<")
        .to(".s3-bar-3",  { background: "#F4EEDF", duration: FADE }, "<")
        .to({}, { duration: 0.53 })
        .to(".section-4", { yPercent: 0,    duration: 2.0, ease: "power3.inOut" })
        .to({}, { duration: 0.5 })
        .to(".section-3", { yPercent: -100, duration: 1.5, ease: "power2.inOut" })
        .to(".section-4", { yPercent: -100, duration: 1.5, ease: "power2.inOut" }, "<")
        .to(".section-5", { yPercent: 0,    duration: 1.5, ease: "power2.inOut" }, "<")
        .to({}, { duration: 0.5 })
        .to(".s5-card", {
          scaleX: () => window.innerWidth  / 577,
          scaleY: () => window.innerHeight / 623,
          duration: 1.5,
          ease: "power2.inOut",
        });

      // ── Timeline 3: S7 → S8 → panel split → S9 ───────────────────
      gsap.timeline({
        scrollTrigger: {
          trigger: ".pin-s7-s9",
          start: "top top",
          end: "+=3000",
          scrub: 0.50,
          pin: true,
          anticipatePin: 1,
          fastScrollEnd: true,
          preventOverlaps: true,
        },
      })
        // Phase 1: S8 wipes down over S7 (S7 scales subtly behind)
        .set(".section-8", { visibility: "visible" })
        .to(".section-8", { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "power2.inOut" })
        .to(".section-7", { scale: 1.05, duration: 1.5, ease: "power2.inOut" }, "<")
        .to({}, { duration: 0.5 })
        // Phase 2: hide S7 once fully behind S8
        .to(".section-7", { visibility: "hidden", opacity: 0, duration: 0.001 })
        // Phase 3: S8 panels split open AND section-9 fades in simultaneously.
        // section-9 was opacity:0 — it becomes visible exactly as the panels reveal it.
        .to(".s8-panel-left",  { clipPath: "inset(0% 50% 100% 0%)", duration: 1.5, ease: "power2.inOut" })
        .to(".s8-panel-right", { clipPath: "inset(100% 0% 0% 50%)", duration: 1.5, ease: "power2.inOut" }, "<")
        .to(".section-9",      { opacity: 1, duration: 1.0, ease: "power2.inOut" }, "<")
        .to({}, { duration: 0.4 })
        // Phase 4: S9 title animates to final position
        .to(".s9-title", {
          duration: 1.0,
          ease: "power2.inOut",
          fontSize: "24px",
          xPercent: 0,
          yPercent: 0,
          top: () => {
            const bottomOffset = 10.5 * 16 + 112 + 29;
            return window.innerHeight - bottomOffset + "px";
          },
          left: () => window.innerWidth - 64 - 276 + "px",
        })
        // Phase 5: S9 paragraph fades in
        .to(".s9-para", { opacity: 1, duration: 0.6, ease: "power2.out" }, "<+0.2");

    }, scopeRef);

    return () => ctx.revert();
  }, [preloaderDone]);

  return (
    <div ref={scopeRef}>
      <PreloaderWrapper />

      {/* Pin 1: Hero → S1 */}
      <div className="pin-hero-s1 relative h-screen">
        <div className="section-1 absolute inset-0 z-10">
          <SectionOne />
        </div>
        <div className="hero absolute inset-0 z-20">
          <Hero />
        </div>
      </div>

      {/* Pin 2: S2 → S3 → S4 → S5 */}
      <div className="pin-s2-s5 relative h-screen overflow-hidden">
        <div className="section-2 absolute inset-0 z-10">
          <SectionTwo />
        </div>
        <SectionThree />
        <SectionFour />
        <SectionFive />
      </div>

      {/* S6: plain scroll */}
      <div className="h-screen">
        <SectionSix />
      </div>

      {/*
        Pin 3: S7 → S8 → S9
        Z-index stacking order (bottom to top):
          section-7  z-[5]   — background, scales subtly, visible at start
          section-9  z-[15]  — starts opacity:0, fades in when panels split
          section-8  z-[30]  — clip-path wipe over S7
          s8 panels  z-[35]  — sit on S8, split to show S9
        section-9 must be ABOVE section-7 but BELOW section-8.
      */}
      <div className="pin-s7-s9 relative h-screen overflow-hidden">
        <div className="section-7 absolute inset-0 z-[5]">
          <SectionSeven />
        </div>
        <div className="section-9 absolute inset-0 z-[15]">
          <SectionNine />
        </div>
        <div className="section-8 absolute inset-0 z-[30]">
          <SectionEight />
        </div>
      </div>

    </div>
  );
}