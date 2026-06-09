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

      gsap.set(".hero",      { yPercent: 0, zIndex: 30 });
      gsap.set(".section-1", { yPercent: 0, zIndex: 20 });

      gsap.set(".s1-bg",   { yPercent: 10, scale: 1.0 });
      gsap.set(".s1-card", { yPercent: 80, opacity: 0 });

      gsap.set(".section-2", {
        visibility: "visible",
        clipPath:   "inset(100% 0% 0% 0%)",
        zIndex:     25,
      });

      gsap.set(".s2-bg",       { yPercent: 10, scale: 1.0 });
      gsap.set([".s2-title", ".s2-subtitle", ".s2-body"], {
        opacity: 0,
        y: 40,
      });

      gsap.set(".section-3", {
        visibility: "hidden",
        clipPath:   "inset(0% 100% 0% 0%)",
        zIndex:     30,
      });

      gsap.set(".section-4", { yPercent: 100, visibility: "visible", zIndex: 40 });
      gsap.set(".section-5", { yPercent: 100, visibility: "visible", zIndex: 50 });
      gsap.set(".s5-card",   { scale: 1, transformOrigin: "center center" });

      // S4 content initial state
      gsap.set(".s4-title",   { opacity: 0, y: 32 });
      gsap.set(".s4-para",    { opacity: 0, y: 24 });
      gsap.set(".s4-cta",     { opacity: 0, y: 24 });
      gsap.set(".s4-content", { y: 0 });
      gsap.set(".s4-img",     { yPercent: 15 });

      // S5 text initial state
      gsap.set(".s5-title", { opacity: 0, y: 32 });
      gsap.set(".s5-body",  { opacity: 0, y: 24 });

      // S6 starts off-screen to the right, clipped
      gsap.set(".section-6", {
        visibility: "visible",
        clipPath:   "inset(0% 0% 0% 100%)",
        zIndex:     55,
      });

      // S7 hidden + clipped below — reveals over S6
      gsap.set(".section-7", {
        visibility: "hidden",
        clipPath:   "inset(100% 0% 0% 0%)",
        zIndex:     65,
      });

      // S8 hidden + clipped from top
      gsap.set(".section-8", {
        visibility: "hidden",
        clipPath:   "inset(100% 0% 0% 0%)",
        zIndex:     70,
      });

      gsap.set(".section-9", { opacity: 0, zIndex: 60 });

      gsap.set(".s8-panel-left",  { clipPath: "inset(0% 50% 0% 0%)",  zIndex: 75 });
      gsap.set(".s8-panel-right", { clipPath: "inset(0% 0% 0% 50%)",  zIndex: 75 });

      gsap.set(".s9-title", {
        position:      "absolute",
        zIndex:        80,
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

      // ── Timeline 1: Hero → S1 → S2 → S3 → S4 → S5 → S6 → S7 → S8 → S9 ──
      gsap.timeline({
        scrollTrigger: {
          trigger:         ".pin-all",
          start:           "top top",
          end:             "+=13000",
          scrub:           1.5,
          pin:             true,
          anticipatePin:   1,
          preventOverlaps: true,
          fastScrollEnd:   true,
        },
      })

        // ── Phase 1: Hero exits → S1 bg parallaxes + card rises ──────
        .to(".hero",    { yPercent: -100, duration: 1,   ease: "none" })
        .to(".s1-bg",   { yPercent: 0, scale: 1, duration: 0.8, ease: "none" }, "<")
        .to(".s1-card", { yPercent: 0, opacity: 1, duration: 0.8, ease: "power2.out" }, 0.2)
        .to({}, { duration: 0.4 })

        // ── Phase 2: S2 clips in bottom→top ──────────────────────────
        .to(".section-2", {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.5,
          ease:     "power2.inOut",
        })
        .to(".section-1", { scale: 1.05, duration: 1.5, ease: "power2.inOut" }, "<")
        .to(".s2-bg", { yPercent: 0, scale: 1, duration: 1.5, ease: "power2.out" }, "<")
        .to(".s2-body",     { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, "<0.5")
        .to(".s2-subtitle", { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, "<0.16")
        .to(".s2-title",    { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, "<0.16")
        .to({}, { duration: 0.2 })

        // ── Phase 3: S3 clips in LEFT→RIGHT over S2 ──────────────────
        .set(".section-3", { visibility: "visible" })
        .to(".section-3", {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.5,
          ease:     "power2.inOut",
        })
        .to(".section-2", { scale: 1.05, duration: 1.5, ease: "power2.inOut" }, "<")

        // ── Phase 4: Dwell on S3 ─────────────────────────────────────
        .to({}, { duration: 0.6 })

        // ── Phase 5a: S4 slides up from below ────────────────────────
        .to(".section-4", { yPercent: 0, duration: 2.2, ease: "power2.out" })

        // ── Phase 5b: S4 content fades in ────────────────────────────
        .to(".s4-title", { opacity: 1, y: 0, duration: 0.9, ease: "power2.out" }, "<+0.6")
        .to(".s4-para",  { opacity: 1, y: 0, duration: 0.9, ease: "power2.out" }, "<+0.16")
        .to(".s4-cta",   { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" }, "<+0.16")

        // ── Phase 5c: Scroll s4-content up + parallax image ──────────
        .to(".s4-content", { y: () => window.innerHeight * -0.45, duration: 2.5, ease: "power1.inOut" }, "<+0.4")
        .to(".s4-img",     { yPercent: -15, duration: 2.5, ease: "none" }, "<")

        // ── Phase 5d: Dwell on S4 image ──────────────────────────────
        .to({}, { duration: 0.5 })

        // ── Phase 5e: S5 slides up over S4 ───────────────────────────
        .to(".section-3", { yPercent: -100, duration: 2.0, ease: "power2.inOut" })
        .to(".section-5", { yPercent: 0,    duration: 2.0, ease: "power2.inOut" }, "<")

        // ── Phase 5f: S5 text fades in ───────────────────────────────
        .to(".s5-title", { opacity: 1, y: 0, duration: 0.9, ease: "power2.out" }, "<+0.6")
        .to(".s5-body",  { opacity: 1, y: 0, duration: 0.9, ease: "power2.out" }, "<+0.16")

        // ── Phase 5g: Dwell on S5 ────────────────────────────────────
        .to({}, { duration: 0.5 })

        // ── Phase 6: S6 clips in RIGHT→LEFT over S5 ──────────────────
        .to(".section-6", {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.5,
          ease:     "power2.inOut",
        })
        .to(".section-5", { scale: 1.05, duration: 1.5, ease: "power2.inOut" }, "<")

        // ── Phase 6b: Dwell on S6 ────────────────────────────────────
        .to({}, { duration: 0.4 })

        // ── Phase 7: S7 clips in BOTTOM→TOP over S6 ──────────────────
        .set(".section-7", { visibility: "visible" })
        .to(".section-7", {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.5,
          ease:     "power2.inOut",
        })
        .to(".section-6", { scale: 1.05, duration: 1.5, ease: "power2.inOut" }, "<")

        // ── Phase 7b: Dwell on S7 ────────────────────────────────────
        .to({}, { duration: 0.5 })

        // ── Phase 8: S8 clips in TOP→BOTTOM over S7 ──────────────────
        .set(".section-8", { visibility: "visible" })
        .to(".section-8", {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.5,
          ease:     "power2.inOut",
        })
        .to(".section-7", { scale: 1.05, duration: 1.5, ease: "power2.inOut" }, "<")

        // ── Phase 8b: Dwell on S8 ────────────────────────────────────
        .to({}, { duration: 0.5 })

        // ── Phase 9: S8 panels split + S9 fades in ───────────────────
        .to(".section-7",      { visibility: "hidden", opacity: 0, duration: 0.001 })
        .to(".s8-panel-left",  { clipPath: "inset(0% 50% 100% 0%)", duration: 1.5, ease: "power2.inOut" })
        .to(".s8-panel-right", { clipPath: "inset(100% 0% 0% 50%)", duration: 1.5, ease: "power2.inOut" }, "<")
        .to(".section-9",      { opacity: 1, duration: 1.0, ease: "power2.inOut" }, "<")

        // ── Phase 9b: S9 title animates to corner ────────────────────
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
        .to(".s9-para", { opacity: 1, duration: 0.6, ease: "power2.out" }, "<+0.2")

        // ── Phase 9c: Dwell on S9 ────────────────────────────────────
        .to({}, { duration: 0.6 });

      // ── Timeline 2: CTA pinned → Footer slides up ─────────────────
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
        <div className="section-7 absolute inset-0 z-[65]" style={{ pointerEvents: "none" }}>
          <SectionSeven />
        </div>
        <div className="section-8 absolute inset-0 z-[70]" style={{ pointerEvents: "none" }}>
          <SectionEight />
        </div>
        <div className="section-9 absolute inset-0 z-[60]" style={{ pointerEvents: "none" }}>
          <SectionNine />
        </div>
        <div className="hero absolute inset-0 z-[80]" style={{ pointerEvents: "none" }}>
          <Hero />
        </div>
      </div>

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