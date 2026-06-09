"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";
import { useSite } from "./context/SiteContext";

import Hero from "../components/Home/Hero";
import SectionOne from "../components/Home/SectionOne";
import SectionTwo from "../components/Home/SectionTwo";
import SectionThree from "../components/Home/SectionThree";
import SectionFour from "../components/Home/SectionFour";
import SectionFive from "../components/Home/SectionFive";
import PreloaderWrapper from "../components/PreloaderWrapper";
import SectionSix from "../components/Home/SectionSix";
import SectionSeven from "../components/Home/Sectionseven";
import SectionEight from "../components/Home/Sectioneight";
import SectionNine from "../components/Home/SectionNine";
import SectionCTA from "../components/SectionCTA";
import Footer from "../components/Footer";

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

      requestAnimationFrame(() =>
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            ScrollTrigger.refresh();
          })
        )
      );

      // ── Initial States ────────────────────────────────────────────

      gsap.set(".hero",      { yPercent: 0, zIndex: 20 });
      gsap.set(".section-1", { yPercent: 0, zIndex: 10 });

      // Section 1 entrance: bg parallaxes up, card fades + rises
      gsap.set(".s1-bg",   { yPercent: 10,  scale: 1.0 });
      gsap.set(".s1-card", { yPercent: 80, opacity: 0 });

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

      gsap.set(".section-7", { opacity: 1, visibility: "visible", zIndex: 5 });
      gsap.set(".section-9", { opacity: 0, zIndex: 15 });

      gsap.set(".s8-panel-left",  { clipPath: "inset(0% 50% 0% 0%)",  zIndex: 35 });
      gsap.set(".s8-panel-right", { clipPath: "inset(0% 0% 0% 50%)",  zIndex: 35 });

      gsap.set(".s9-title", {
        position:      "absolute",
        zIndex:        20,
        color:         "#F4EEDF",
        top:           "50%",
        left:          "50%",
        xPercent:      -50,
        yPercent:      -50,
        fontSize:      "46px",
        lineHeight:    1.2,
        whiteSpace:    "nowrap",
        margin:        0,
        padding:       0,
        pointerEvents: "none",
      });
      gsap.set(".s9-para", { opacity: 0 });

      // ── CTA / Footer initial state ────────────────────────────────
      const footerEl = scopeRef.current?.querySelector<HTMLElement>(".footer");
      const footerH  = footerEl?.offsetHeight ?? 600;

      gsap.set(".footer",      { y: footerH, zIndex: 20 });
      gsap.set(".section-cta", { zIndex: 10 });

      const FADE = 0.4;

      // ── Timeline 1: Hero → S1 ─────────────────────────────────────
      gsap.timeline({
        scrollTrigger: {
          trigger:       ".pin-hero-s1",
          start:         "top top",
          end:           "+=1100",
          scrub:         1.5,
          pin:           true,
          anticipatePin: 1,
        },
      })
        // Hero slides up and out
        .to(".hero",    { yPercent: -100, duration: 1,   ease: "none" })
        // BG parallaxes upward + de-scales as hero lifts — runs in sync
        .to(".s1-bg",   { yPercent: 0, scale: 1, duration: 0.8, ease: "none" }, "<")
        // Card floats up + fades in during the second half of the scroll
        .to(".s1-card", { yPercent: 0, opacity: 1, duration: 0.8, ease: "power2.out" }, 0.3)
        // S1 blurs/fades as we approach S2
        .to(".section-1", { opacity: 0.9, duration: 0.5, ease: "power2.inOut" });

      // ── Timeline 2: S2 → S3(×3) → S4 → S5 ───────────────────────
      const tl2 = gsap.timeline({
        scrollTrigger: {
          trigger:         ".pin-s2-s5",
          start:           "top top",
          end:             "+=3800",
          scrub:           1.5,
          pin:             true,
          anticipatePin:   1,
          preventOverlaps: true,
          fastScrollEnd:   true,
        },
      });

      tl2
        .set(".section-3", { visibility: "visible" })
        .to(".section-3", { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "power2.inOut" })
        .to(".section-2", { scale: 1.05, duration: 1.5, ease: "power2.inOut" }, "<")
        .to({}, { duration: 0.15 })
        .to(".s3-bg-1",   { opacity: 0, duration: FADE, ease: "power1.inOut" })
        .to(".s3-bg-2",   { opacity: 1, duration: FADE, ease: "power1.inOut" }, "<")
        .to(".s3-text-1", { opacity: 0, duration: FADE, ease: "power1.inOut" }, "<")
        .to(".s3-text-2", { opacity: 1, duration: FADE, ease: "power1.inOut" }, "<")
        .to(".s3-bar-1",  { background: "rgba(244,238,223,0.3)", duration: FADE }, "<")
        .to(".s3-bar-2",  { background: "#F4EEDF", duration: FADE }, "<")
        .to({}, { duration: 0.15 })
        .to(".s3-bg-2",   { opacity: 0, duration: FADE, ease: "power1.inOut" })
        .to(".s3-bg-3",   { opacity: 1, duration: FADE, ease: "power1.inOut" }, "<")
        .to(".s3-text-2", { opacity: 0, duration: FADE, ease: "power1.inOut" }, "<")
        .to(".s3-text-3", { opacity: 1, duration: FADE, ease: "power1.inOut" }, "<")
        .to(".s3-bar-2",  { background: "rgba(244,238,223,0.3)", duration: FADE }, "<")
        .to(".s3-bar-3",  { background: "#F4EEDF", duration: FADE }, "<")
        .to({}, { duration: 0.2 })
        .to(".section-4", { yPercent: 0,    duration: 1.5, ease: "power3.inOut" })
        .to({}, { duration: 0.2 })
        .to(".section-3", { yPercent: -100, duration: 1.2, ease: "power2.inOut" })
        .to(".section-4", { yPercent: -100, duration: 1.2, ease: "power2.inOut" }, "<")
        .to(".section-5", { yPercent: 0,    duration: 1.2, ease: "power2.inOut" }, "<")
        .to({}, { duration: 0.15 })
        .to(".s5-card", {
          scaleX: () => window.innerWidth  / 577,
          scaleY: () => window.innerHeight / 623,
          duration: 1.2,
          ease: "power2.inOut",
        });

      // ── Pin S6 ────────────────────────────────────────────────────
      ScrollTrigger.create({
        trigger:         ".pin-s6",
        start:           "top top",
        end:             "+=500",
        pin:             true,
        preventOverlaps: true,
        anticipatePin:   1,
      });

      // ── Timeline 3: S7 → S8 → panel split → S9 ───────────────────
      gsap.timeline({
        scrollTrigger: {
          trigger:         ".pin-s7-s9",
          start:           "top top",
          end:             "+=3000",
          scrub:           1.5,
          pin:             true,
          anticipatePin:   1,
          preventOverlaps: true,
          fastScrollEnd:   true,
        },
      })
        .set(".section-8", { visibility: "visible" })
        .to(".section-8", { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "power2.inOut" })
        .to(".section-7", { scale: 1.05, duration: 1.5, ease: "power2.inOut" }, "<")
        .to({}, { duration: 0.5 })
        .to(".section-7", { visibility: "hidden", opacity: 0, duration: 0.001 })
        .to(".s8-panel-left",  { clipPath: "inset(0% 50% 100% 0%)", duration: 1.5, ease: "power2.inOut" })
        .to(".s8-panel-right", { clipPath: "inset(100% 0% 0% 50%)", duration: 1.5, ease: "power2.inOut" }, "<")
        .to(".section-9",      { opacity: 1, duration: 1.0, ease: "power2.inOut" }, "<")
        .to({}, { duration: 0.4 })
        .to(".s9-title", {
          duration:  1.0,
          ease:      "power2.inOut",
          fontSize:  "24px",
          xPercent:  0,
          yPercent:  0,
          top: () => {
            const bottomOffset = 10.5 * 16 + 112 + 29;
            return window.innerHeight - bottomOffset + "px";
          },
          left: () => window.innerWidth - 64 - 276 + "px",
        })
        .to(".s9-para", { opacity: 1, duration: 0.6, ease: "power2.out" }, "<+0.2");

      // ── Timeline 4: CTA pinned → Footer slides up ─────────────────
      gsap.timeline({
        scrollTrigger: {
          trigger:         ".pin-cta-footer",
          start:           "top top",
          end:             () => `+=${footerH}`,
          scrub:           1.5,
          pin:             true,
          anticipatePin:   1,
          preventOverlaps: true,
        },
      })
        .to(".section-cta", {
          scale:    1.04,
          filter:   "blur(3px)",
          opacity:  0.85,
          duration: 1,
          ease:     "power2.inOut",
        })
        .to(".footer", {
          y:        0,
          duration: 1,
          ease:     "power3.inOut",
        }, "<");

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

      {/* Pin S6 */}
      <div className="pin-s6 h-screen overflow-hidden">
        <SectionSix />
      </div>

      {/* Pin 3: S7 → S8 → S9 */}
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

      {/* Pin 4: CTA → Footer slide-up */}
      <div className="pin-cta-footer relative h-screen overflow-hidden">
        <div className="section-cta absolute inset-0 z-10">
          <SectionCTA />
        </div>
        <div
          className="footer absolute left-0 w-full z-20"
          style={{ bottom: 0 }}
        >
          <Footer />
        </div>
      </div>
    </div>
  );
}