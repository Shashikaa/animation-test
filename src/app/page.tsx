"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
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

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const { preloaderDone } = useSite();

  useEffect(() => {
    if (!preloaderDone) return;

    const id = setTimeout(async () => {
      await document.fonts.ready;
      await new Promise<void>((resolve) => {
        if (document.readyState === "complete") {
          resolve();
        } else {
          window.addEventListener("load", () => resolve(), { once: true });
        }
      });

      ScrollTrigger.getAll().forEach((t) => t.kill());

      // ── Initial states ─────────────────────────────────────────────────
      gsap.set(".hero",      { yPercent: 0, zIndex: 20 });
      gsap.set(".section-1", { yPercent: 0, zIndex: 10 });

      gsap.set(".section-3", {
        visibility: "hidden",
        clipPath: "inset(100% 0% 0% 0%)",
        zIndex: 30,
      });

      gsap.set(".s3-bg-1",   { opacity: 1 });
      gsap.set(".s3-bg-2",   { opacity: 0 });
      gsap.set(".s3-bg-3",   { opacity: 0 });

      gsap.set(".s3-text-1", { opacity: 1 });
      gsap.set(".s3-text-2", { opacity: 0 });
      gsap.set(".s3-text-3", { opacity: 0 });

      gsap.set(".s3-bar-1",  { background: "#F4EEDF" });
      gsap.set(".s3-bar-2",  { background: "rgba(244,238,223,0.3)" });
      gsap.set(".s3-bar-3",  { background: "rgba(244,238,223,0.3)" });

      // S4 starts off-screen below — zIndex 40, slides up over S3
      gsap.set(".section-4", { yPercent: 100, visibility: "visible", zIndex: 40 });

      // S5 starts off-screen below — zIndex 50, slides up over S4
      gsap.set(".section-5", { yPercent: 100, visibility: "visible", zIndex: 50 });

      gsap.set(".s5-card", {
        scaleX: 1,
        scaleY: 1,
        transformOrigin: "center center",
      });

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const cardW = 577;
      const cardH = 623;
      const scaleX = vw / cardW;
      const scaleY = vh / cardH;

      const FADE = 0.4;

      // ── Timeline 1: Hero → Section 1 ──────────────────────────────────
      const tl1 = gsap.timeline({
        scrollTrigger: {
          trigger: ".pin-hero-s1",
          scroller: document.documentElement,
          start: "top top",
          end: "+=1500",
          scrub: 1,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
        },
      });

      tl1.to(".hero", { yPercent: -100, duration: 1, ease: "none" });
      tl1.to(".section-1", {
        filter: "blur(4px)",
        opacity: 0.9,
        duration: 0.5,
        ease: "power2.inOut",
      });

      // ── Timeline 2: S2 → S3(×3) → S4 → S5 ────────────────────────────
      const tl2 = gsap.timeline({
        scrollTrigger: {
          trigger: ".pin-s2-s5",
          scroller: document.documentElement,
          start: "top top",
          end: "+=5000",
          scrub: 1,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
        },
      });

      // S3 clips in over S2
      tl2.set(".section-3", { visibility: "visible" });
      tl2.to(".section-3", {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 1.5,
        ease: "power2.inOut",
      });
      tl2.to(".section-2", { scale: 1.05, duration: 1.5, ease: "power2.inOut" }, "<");

      // Dwell on slide 1
      tl2.to({}, { duration: 0.53 });

      // Slide 1 → 2
      tl2.to(".s3-bg-1",   { opacity: 0, duration: FADE, ease: "power1.inOut" });
      tl2.to(".s3-bg-2",   { opacity: 1, duration: FADE, ease: "power1.inOut" }, "<");
      tl2.to(".s3-text-1", { opacity: 0, duration: FADE, ease: "power1.inOut" }, "<");
      tl2.to(".s3-text-2", { opacity: 1, duration: FADE, ease: "power1.inOut" }, "<");
      tl2.to(".s3-bar-1",  { background: "rgba(244,238,223,0.3)", duration: FADE }, "<");
      tl2.to(".s3-bar-2",  { background: "#F4EEDF", duration: FADE }, "<");

      // Dwell on slide 2
      tl2.to({}, { duration: 0.53 });

      // Slide 2 → 3
      tl2.to(".s3-bg-2",   { opacity: 0, duration: FADE, ease: "power1.inOut" });
      tl2.to(".s3-bg-3",   { opacity: 1, duration: FADE, ease: "power1.inOut" }, "<");
      tl2.to(".s3-text-2", { opacity: 0, duration: FADE, ease: "power1.inOut" }, "<");
      tl2.to(".s3-text-3", { opacity: 1, duration: FADE, ease: "power1.inOut" }, "<");
      tl2.to(".s3-bar-2",  { background: "rgba(244,238,223,0.3)", duration: FADE }, "<");
      tl2.to(".s3-bar-3",  { background: "#F4EEDF", duration: FADE }, "<");

      // Dwell on slide 3
      tl2.to({}, { duration: 0.53 });

      // ── S4 slides UP from below over S3 ───────────────────────────────
      tl2.to(".section-4", { yPercent: 0, duration: 2.0, ease: "power3.inOut" });

      // Dwell on S4
      tl2.to({}, { duration: 0.5 });

      // ── S3 + S4 exit UP together; S5 slides UP from below ─────────────
      tl2.to(".section-3", { yPercent: -100, duration: 1.5, ease: "power2.inOut" });
      tl2.to(".section-4", { yPercent: -100, duration: 1.5, ease: "power2.inOut" }, "<");
      tl2.to(".section-5", { yPercent: 0,    duration: 1.5, ease: "power2.inOut" }, "<");

      // ── Card expand ───────────────────────────────────────────────────
      let cardTween: gsap.core.Tween | null = null;

      ScrollTrigger.create({
        trigger: ".pin-s2-s5",
        scroller: document.documentElement,
        start: "top top",
        end: "+=5000",
        onLeave: () => {
          if (cardTween) cardTween.kill();
          cardTween = gsap.to(".s5-card", {
            scaleX,
            scaleY,
            duration: 1.2,
            ease: "power2.inOut",
          });
        },
        onEnterBack: () => {
          if (cardTween) cardTween.kill();
          cardTween = gsap.to(".s5-card", {
            scaleX: 1,
            scaleY: 1,
            duration: 1.2,
            ease: "power2.inOut",
          });
        },
      });

      ScrollTrigger.refresh();
    }, 100);

    return () => {
      clearTimeout(id);
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [preloaderDone]);

  return (
    <main>
      <PreloaderWrapper />

      {/* Pin 1: Hero (z20) slides up → S1 (z10) revealed */}
      <div
        className="pin-hero-s1"
        style={{ position: "relative", height: "100vh" }}
      >
        <div className="section-1 absolute inset-0" style={{ zIndex: 10 }}>
          <SectionOne />
        </div>
        <div className="hero absolute inset-0" style={{ zIndex: 20 }}>
          <Hero />
        </div>
      </div>

      {/* Pin 2:
            S2  z10  base layer, always present
            S3  z30  clips in over S2, shows ×3 slides
            S4  z40  slides UP from below over S3, then exits up with S3
            S5  z50  slides UP from below as S3+S4 exit             */}
      <div
        className="pin-s2-s5"
        style={{
          position: "relative",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <div className="section-2 absolute inset-0" style={{ zIndex: 10 }}>
          <SectionTwo />
        </div>
        <SectionThree />
        <SectionFour />
        <SectionFive />
      </div>

      {/* Normal scroll sections — flow naturally below the pinned block */}
      <div style={{ height: "100vh" }}>
        <SectionSix />
      </div>

      <div style={{ height: "100vh" }}>
        <SectionSeven />
      </div>
    </main>
  );
}