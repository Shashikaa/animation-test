"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
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
import SectionTen from "../components/Home/SectionTen";
import SectionCTA from "../components/SectionCTA";
import Footer from "../components/Footer";

import { useTextReveal, restoreTextReveal } from "./utils/useTextReveal";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const { preloaderDone, lenisRef } = useSite();
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

      // ── Initial States ──────────────────────────────────────────

      gsap.set(".hero",      { yPercent: 0, zIndex: 30 });
      gsap.set(".section-1", { yPercent: 0, zIndex: 20 });

      gsap.set(".s1-bg",   { yPercent: 10, scale: 1.0 });
      gsap.set(".s1-card", { yPercent: 80, opacity: 0 });

      gsap.set(".section-2", {
        visibility: "visible",
        clipPath:   "inset(100% 0% 0% 0%)",
        zIndex:     25,
      });

      gsap.set(".s2-bg", { yPercent: 10, scale: 1.0 });

      gsap.set(".section-3", {
        visibility: "hidden",
        clipPath:   "inset(0% 100% 0% 0%)",
        zIndex:     30,
      });

      gsap.set(".section-4", { yPercent: 100, visibility: "visible", zIndex: 40 });
      gsap.set(".section-5", { yPercent: 100, visibility: "visible", zIndex: 50 });
      gsap.set(".s5-card",   { scale: 1, transformOrigin: "center center" });

      gsap.set(".s4-content", { y: 0 });
      gsap.set(".s4-img",     { yPercent: 15 });
      // S4 bg image parallax start
      gsap.set(".s4-bg-img",  { yPercent: 8 });

      gsap.set(".section-6", {
        visibility: "visible",
        clipPath:   "inset(0% 0% 0% 100%)",
        zIndex:     55,
      });

      gsap.set(".section-10", {
        visibility: "hidden",
        clipPath:   "inset(100% 0% 0% 0%)",
        zIndex:     65,
      });
      gsap.set(".s10-card",       { clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(".s10-card-body",  { clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(".s10-video-wrap", { clipPath: "inset(0% 0% 100% 0%)" });
      gsap.set(".s10-bg-img",     { y: "100%" });
gsap.set(".s10-static-bg", { yPercent: 20 });
      gsap.set(".section-7", {
        visibility: "hidden",
        clipPath:   "inset(100% 0% 0% 0%)",
        zIndex:     75,
      });
      // S7 bg image parallax start
      gsap.set(".s7-bg-img", { yPercent: 20 });

      gsap.set(".section-8", {
        visibility: "hidden",
        clipPath:   "inset(100% 0% 0% 0%)",
        zIndex:     80,
      });
      // S8 bg image parallax start (both panels share the same Forest.webp)
      gsap.set(".s8-bg-img", { yPercent: 20 });

      gsap.set(".section-9", {
        visibility: "hidden",
        opacity:    1,
        zIndex:     79,
      });
      // S9 bg image parallax start (revealed via panels splitting)
      gsap.set(".s9-bg-img", { yPercent: 20 });

      gsap.set(".s8-panel-left",  { clipPath: "inset(0% 50% 0% 0%)",  zIndex: 85 });
      gsap.set(".s8-panel-right", { clipPath: "inset(0% 0% 0% 50%)",  zIndex: 85 });
      gsap.set(".s9-title", { opacity: 0, x: 0, y: 4 });
      gsap.set(".s9-para",  { opacity: 0, y: 5 });

      // CTA / Footer
      const footerEl = scopeRef.current?.querySelector<HTMLElement>(".footer");
      const footerH  = footerEl?.offsetHeight ?? 600;
      gsap.set(".footer",      { y: footerH, zIndex: 20 });
      gsap.set(".section-cta", { zIndex: 10 });

      // ════════════════════════════════════════════════════════════
      // Main scrubbed timeline
      // ════════════════════════════════════════════════════════════
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger:         ".pin-all",
          start:           "top top",
          end:             "+=16000",
          scrub:           0.8,
          pin:             true,
          anticipatePin:   1,
          preventOverlaps: true,
          fastScrollEnd:   true,
          onLeave: () => {
            lenisRef.current?.stop();
            requestAnimationFrame(() => lenisRef.current?.start());
          },
        },
      });

      // ── Phase 1: Hero → S1 ─────────────────────────────────────
      tl
        .to(".hero",    { yPercent: -100, duration: 2.0, ease: "none" })
        .to(".s1-bg",   { yPercent: 0, scale: 1, duration: 1.8, ease: "none" }, "<")
        .to(".s1-card", { yPercent: 0, opacity: 1, duration: 1.8, ease: "power2.out" }, 0.3)
        .to({}, { duration: 0.8 })

        // ── Phase 2: S2 ──────────────────────────────────────────
        .to(".section-2", { clipPath: "inset(0% 0% 0% 0%)", duration: 2.0, ease: "power2.inOut" })
        .to(".section-1", { scale: 1.05, duration: 2.0, ease: "power2.inOut" }, "<")
        .to(".s2-bg",     { yPercent: 0, scale: 1, duration: 2.0, ease: "power2.out" }, "<")
        .to({}, { duration: 0.6 })

        // ── Phase 3: S3 ──────────────────────────────────────────
        .set(".section-3", { visibility: "visible" })
        .to(".section-3", { clipPath: "inset(0% 0% 0% 0%)", duration: 2.0, ease: "power2.inOut" })
        .to(".section-2", { scale: 1.05, duration: 2.0, ease: "power2.inOut" }, "<")
        .to({}, { duration: 1.0 })

        // ── Phase 4: S4 ──────────────────────────────────────────
        // Section slides up from yPercent:100; bg image counter-moves from yPercent:8→0
        .to(".section-4",  { yPercent: 0,    duration: 2.8, ease: "power2.out" })
        .to(".s4-content", { y: () => window.innerHeight * -0.45, duration: 3.0, ease: "power1.inOut" }, "<+0.8")
        .to(".s4-img",     { yPercent: -15,  duration: 3.0, ease: "none" }, "<")
        .to(".s4-bg-img",  { yPercent: 0,    duration: 3.0, ease: "none" }, "<")
        .to({}, { duration: 0.8 })

        // ── Phase 5: S5 ──────────────────────────────────────────
        .to(".section-3", { yPercent: -100, duration: 3.0, ease: "power2.inOut" })
        .to(".section-5", { yPercent: 0,    duration: 3.0, ease: "power2.inOut" }, "<")
        .to({}, { duration: 0.8 })

        // ── Phase 6: S6 ──────────────────────────────────────────
        .to(".section-6", { clipPath: "inset(0% 0% 0% 0%)", duration: 2.0, ease: "power2.inOut" })
        .to(".section-5", { scale: 1.05, duration: 2.0, ease: "power2.inOut" }, "<")
        .to({}, { duration: 0.6 })

        // ── Phase 10: S10 over S6 ────────────────────────────────
        .set(".section-10", { visibility: "visible" })
        .to(".section-10", { clipPath: "inset(0% 0% 0% 0%)", duration: 2.0, ease: "power2.inOut" })
        .to(".section-6",  { scale: 1.05, duration: 2.0, ease: "power2.inOut" }, "<")
        .to(".s10-static-bg", { yPercent: 0, duration: 2.0, ease: "power2.out" }, "<")
        .to({}, { duration: 0.5 })
        .to(".s10-title",     { opacity: 0, y: -50, duration: 1.2, ease: "power2.in" })
        .to(".s10-title-sub", { opacity: 0, y: -40, duration: 1.2, ease: "power2.in" }, "<")
        .to(".s10-para-top",  { opacity: 0, y: -50, duration: 1.2, ease: "power2.in" }, "<")
        .to(".s10-card",      { clipPath: "inset(0% 0% 0% 0%)", duration: 2.0, ease: "power2.inOut" }, "<+0.2")
        .to(".s10-card-body", { clipPath: "inset(0% 0% 0% 0%)", duration: 1.8, ease: "power2.out" }, "<")
        .to({}, { duration: 0.6 })
        .to(".s10-video-wrap", { clipPath: "inset(0% 0% 0% 0%)", duration: 1.8, ease: "power2.inOut" })
        .to({}, { duration: 0.6 })
        .to(".s10-video-wrap", { clipPath: "inset(0% 0% 100% 0%)", duration: 1.6, ease: "power2.inOut" })
        .to(".s10-card", {
          y: () => {
            const card = document.querySelector(".s10-card") as HTMLElement;
            if (!card) return -window.innerHeight * 0.7;
            return -card.getBoundingClientRect().top;
          },
          duration: 2.5, ease: "power2.inOut",
        }, "<+0.1")
        .to(".s10-card-body", { y: 50,   duration: 2.5, ease: "power2.inOut" }, "<")
        .to(".s10-bg-img",    { y: "0%", duration: 2.5, ease: "power2.inOut" }, "<")
        .to({}, { duration: 0.6 })

        // ── Phase 7: S7 over S10 ─────────────────────────────────
        // Clip reveals top→bottom; bg image counter-moves from yPercent:8→0
        .set(".section-7", { visibility: "visible" })
        .to(".section-7",  { clipPath: "inset(0% 0% 0% 0%)", duration: 2.0, ease: "power2.inOut" })
        .to(".section-10", { scale: 1.05, duration: 2.0, ease: "power2.inOut" }, "<")
        .to(".s7-bg-img",  { yPercent: 0, duration: 2.0, ease: "power2.out" }, "<")
        .to({}, { duration: 0.8 })

        // ── Phase 8: S8 over S7 ──────────────────────────────────
        // Clip reveals top→bottom; both panel bg images counter-move
        .set(".section-8", { visibility: "visible" })
        .to(".section-8",  { clipPath: "inset(0% 0% 0% 0%)", duration: 2.0, ease: "power2.inOut" })
        .to(".section-7",  { scale: 1.05, duration: 2.0, ease: "power2.inOut" }, "<")
        .to(".s8-bg-img",  { yPercent: 0, duration: 2.0, ease: "power2.out" }, "<")
        .to({}, { duration: 0.8 })

        // ── Phase 9: Panels split → S9 revealed ──────────────────
        // S9 bg image settles to 0 as panels retract and section fades in
        .to(".section-7", { visibility: "hidden", opacity: 0, duration: 0.001 })
        .set(".section-9", { visibility: "visible" })
        .to(".s8-panel-left",  { clipPath: "inset(0% 50% 100% 0%)", duration: 2.0, ease: "power2.inOut" })
        .to(".s8-panel-right", { clipPath: "inset(100% 0% 0% 50%)", duration: 2.0, ease: "power2.inOut" }, "<")
        .to(".s9-bg-img",      { yPercent: 0, duration: 2.0, ease: "power2.out" }, "<")
        .to(".s9-title", { opacity: 1, duration: 1.2, ease: "power2.out" }, "<+1.0")
        .to({}, { duration: 0.8 })
        .to(".s9-title", {
          x: () => {
            const el   = document.querySelector(".s9-title") as HTMLElement;
            const para = document.querySelector(".s9-para")  as HTMLElement;
            if (!el || !para) return 0;
            return para.getBoundingClientRect().right - el.getBoundingClientRect().right;
          },
          y: () => {
            const el   = document.querySelector(".s9-title") as HTMLElement;
            const para = document.querySelector(".s9-para")  as HTMLElement;
            if (!el || !para) return 0;
            return para.getBoundingClientRect().top - el.offsetHeight - 12 - el.getBoundingClientRect().top;
          },
          duration: 1.8,
          ease: "power2.inOut",
        })
        .to(".s9-para", { opacity: 1, y: 0, duration: 1.2, ease: "power3.out" }, "<+1.2")
        .to({}, { duration: 0.8 });

      // ── Text reveals ───────────────────────────────────────────

      // S2
      useTextReveal(scopeRef, ".s2-title-main", { tl, position: "4",    duration: 0.35, stagger: 0.04 });
      useTextReveal(scopeRef, ".s2-title-sub",  { tl, position: "4",    duration: 0.3,  stagger: 0.03 });
      useTextReveal(scopeRef, ".s2-body",        { tl, position: "3.8",  duration: 0.35, stagger: 0.04 });

      // S4
      useTextReveal(scopeRef, ".s4-title", { tl, position: "9.0",    duration: 0.35, stagger: 0.04 });
      useTextReveal(scopeRef, ".s4-para",  { tl, position: ">+0.15", duration: 0.35, stagger: 0.04 });
      useTextReveal(scopeRef, ".s4-cta",   { tl, position: ">+0.15", duration: 0.3,  stagger: 0.03 });

      // S5
      useTextReveal(scopeRef, ".s5-title", { tl, position: "15", duration: 0.35, stagger: 0.04 });
      useTextReveal(scopeRef, ".s5-body",  { tl, position: "15", duration: 0.35, stagger: 0.04 });

      // S10
      useTextReveal(scopeRef, ".s10-title",     { tl, position: "20.5", duration: 0.35, stagger: 0.04 });
      useTextReveal(scopeRef, ".s10-title-sub", { tl, position: "20.6", duration: 0.3,  stagger: 0.03 });
      useTextReveal(scopeRef, ".s10-para-top",  { tl, position: "20.2", duration: 0.3,  stagger: 0.03 });
      useTextReveal(scopeRef, ".s10-card-para", { tl, position: "23.6", duration: 0.4,  stagger: 0.05 });

      // S7
      useTextReveal(scopeRef, ".s7-title", { tl, position: "31.7", duration: 0.35, stagger: 0.04 });
      useTextReveal(scopeRef, ".s7-para",  { tl, position: "31.4", duration: 0.35, stagger: 0.04 });

      // S8
      useTextReveal(scopeRef, ".s8-heading", { tl, position: "34.5",  duration: 0.35, stagger: 0.04 });
      useTextReveal(scopeRef, ".s8-para",    { tl, position: "34.25", duration: 0.35, stagger: 0.04 });

      // ── Timeline 2: CTA → Footer ─────────────────────────────
      gsap.timeline({
        scrollTrigger: {
          trigger:         ".pin-cta-footer",
          start:           "top top",
          end:             () => `+=${footerH}`,
          scrub:           0.8,
          pin:             true,
          anticipatePin:   1,
          preventOverlaps: true,
          onEnter: () => {
            ScrollTrigger.refresh();
          },
        },
      })
        .to(".section-cta", {
    
          duration: 1.5, ease: "power2.inOut",
        })
        .to(".footer", { y: 0, duration: 1.5, ease: "power3.inOut" }, "<");

    }, scopeRef);

    return () => {
      if (scopeRef.current) {
        restoreTextReveal(
          scopeRef.current,
          ".s2-title-main,.s2-title-sub,.s2-body,.s4-title,.s4-para,.s10-card-para,.s4-cta,.s5-title,.s5-body,.s10-title,.s10-title-sub,.s10-para-top,.s7-title,.s7-para,.s8-heading,.s8-para"
        );
      }
      ctx.revert();
    };
  }, [preloaderDone]);

  return (
    <div ref={scopeRef}>
      <PreloaderWrapper />

      <div className="pin-all relative h-screen overflow-hidden">
        <div className="section-1 absolute inset-0 z-20">
          <SectionOne />
        </div>
        <div className="section-2 absolute inset-0 z-[25]" style={{ pointerEvents: "none" }}>
          <SectionTwo />
        </div>
        <div className="section-3 absolute inset-0 z-[30]" style={{ pointerEvents: "none" }}>
          <SectionThree />
        </div>
        <div className="section-4 absolute inset-0 z-[40]" style={{ overflow: "visible", pointerEvents: "none" }}>
          <SectionFour />
        </div>
        <div className="section-5 absolute inset-0 z-[50]" style={{ pointerEvents: "none" }}>
          <SectionFive />
        </div>
        <div className="section-6 absolute inset-0 z-[55]" style={{ pointerEvents: "none" }}>
          <SectionSix />
        </div>
        <div className="section-10 absolute inset-0 z-[65]" style={{ pointerEvents: "none" }}>
          <SectionTen />
        </div>
        <div className="section-7 absolute inset-0 z-[75]" style={{ pointerEvents: "none" }}>
          <SectionSeven />
        </div>
        <div className="section-9 absolute inset-0 z-[79]" style={{ pointerEvents: "none" }}>
          <SectionNine />
        </div>
        <div className="section-8 absolute inset-0 z-[80]" style={{ pointerEvents: "auto" }}>
          <SectionEight />
        </div>
        <div className="hero absolute inset-0 z-[90]" style={{ pointerEvents: "none" }}>
          <Hero />
        </div>
      </div>

      <div className="pin-cta-footer relative h-screen overflow-hidden">
        <div className="section-cta absolute inset-0 z-10">
          <SectionCTA />
        </div>
        <div className="footer absolute left-0 w-full z-20" style={{ bottom: 0 }}>
          <Footer />
        </div>
      </div>
    </div>
  );
}