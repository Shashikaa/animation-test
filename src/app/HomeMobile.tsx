"use client";

import { useRef, useEffect, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSite } from "./context/SiteContext";
import dynamic from "next/dynamic";

import Hero        from "../components/Home/Hero";
import SectionOne  from "../components/Home/SectionOne";
import SectionTwo  from "../components/Home/SectionTwo";
import SectionThree from "../components/Home/SectionThree";
import SectionFour from "../components/Home/SectionFour";
import SectionFive from "../components/Home/SectionFive";
import SectionSix  from "../components/Home/SectionSix";
import SectionCTA  from "../components/SectionCTA";
import Footer      from "../components/Footer";

const SectionSeven = dynamic(() => import("../components/Home/Sectionseven"), { ssr: false });
const SectionEight = dynamic(() => import("../components/Home/Sectioneight"), { ssr: false });
const SectionNine  = dynamic(() => import("../components/Home/SectionNine"),  { ssr: false });
const SectionTen   = dynamic(() => import("../components/Home/SectionTen"),   { ssr: false });

import { attachSpeedController } from "./utils/timelineSpeedController";

gsap.registerPlugin(ScrollTrigger);

const vvHeight = () =>
  (typeof visualViewport !== "undefined" && visualViewport != null
    ? visualViewport.height
    : null) ?? window.innerHeight;

const setPinHeight = () => {
  const h  = vvHeight();
  const el = document.querySelector<HTMLElement>(".pin-all");
  if (el) el.style.height = `${h}px`;
};

export default function HomeMobile() {
  const { preloaderDone, lenisRef, onScrollReady } = useSite();
  const scopeRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    gsap.set(".section-1", { yPercent: 100, zIndex: 90 });
  }, []);

  useEffect(() => {
    if (!preloaderDone) return;

    let vvCleanup:    (() => void) | null = null;
    let speedCleanup: (() => void) | null = null;

    const ctx = gsap.context(() => {

      gsap.ticker.lagSmoothing(0);

      ScrollTrigger.config({
        ignoreMobileResize: true,
        autoRefreshEvents: "visibilitychange,DOMContentLoaded,load",
      });

      const TRANSITION = 2.0;
      const EASE       = "power2.inOut";
      const PAUSE      = 0.8;
      const scrubValue = 0.6;

      const footerEl = scopeRef.current?.querySelector<HTMLElement>(".footer");
      const footerH  = footerEl?.offsetHeight ?? 600;

      gsap.set(".hero",    { yPercent: 0, zIndex: 5 });
      gsap.set(".hero-bg", { yPercent: 0 });

      gsap.set(".section-1", { yPercent: 100, zIndex: 90 });
      gsap.set(".s1-bg",     { yPercent: 10,  scale: 1.0 });
      gsap.set(".s1-card",   { yPercent: 80,  opacity: 0 });

      gsap.set(".section-2", {
        visibility: "visible",
        clipPath:   "inset(100% 0% 0% 0%)",
        zIndex:     95,
      });
      gsap.set(".s2-bg", { yPercent: 10, scale: 1.0 });

      gsap.set(".section-3", {
        visibility: "hidden",
        yPercent:   100,
        zIndex:     100,
      });

      gsap.set(".section-4", { yPercent: 100, visibility: "visible", zIndex: 105 });
      gsap.set(".s5-card",   { scale: 1, transformOrigin: "center center" });
      gsap.set(".s4-content", { y: 0 });
      gsap.set(".s4-bg-img",  { yPercent: 8 });
      gsap.set(".s4-img-mob", { y: 60 });

      gsap.set(".section-5", {
        yPercent:   0,
        clipPath:   "inset(100% 0% 0% 0%)",
        zIndex:     110,
        visibility: "visible",
      });

      gsap.set(".section-6", {
        visibility: "visible",
        yPercent:   100,
        zIndex:     115,
      });

      gsap.set(".section-10",    { visibility: "hidden", yPercent: 0, zIndex: 112 });
      gsap.set(".s10-card",      { clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(".s10-card-body", { clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(".s10-bg-img",    { y: "100%" });
      gsap.set(".s10-static-bg", { yPercent: 20 });

      gsap.set(".section-7", { visibility: "visible", yPercent: 100, zIndex: 130 });
      gsap.set(".s7-bg-img", { yPercent: 20 });

      gsap.set(".section-8", {
        visibility: "hidden",
        yPercent:   100,
        zIndex:     128,
      });
      gsap.set(".s8-bg-img", { yPercent: 20 });

      gsap.set(".section-9", { visibility: "hidden", yPercent: 0, zIndex: 121 });
      gsap.set(".s9-bg-img", { yPercent: 20 });
      gsap.set(".s9-title",  { opacity: 0 });
      gsap.set(".s9-para",   { opacity: 0 });

      gsap.set(".s8-panel-left",  { clipPath: "inset(0% 50% 0% 0%)", zIndex: 145 });
      gsap.set(".s8-panel-right", { clipPath: "inset(0% 0% 0% 50%)", zIndex: 145 });

      gsap.set(".section-cta", { yPercent: 100, zIndex: 150, visibility: "hidden" });
      gsap.set(".footer",      { y: footerH,    zIndex: 151, visibility: "hidden" });

      const buildTimeline = () => {
        const waitForMobBgs = (cb: () => void) => {
          const check = () => {
            if (document.querySelector(".s7-mob-bg") && document.querySelector(".s8-mob-bg")) {
              cb();
            } else {
              requestAnimationFrame(check);
            }
          };
          check();
        };

        waitForMobBgs(() => {
          requestAnimationFrame(() => {
            setPinHeight();
            ScrollTrigger.refresh();

            const vv = typeof visualViewport !== "undefined" ? visualViewport : null;
            if (vv) {
              const onVVResize = () => setPinHeight();
              vv.addEventListener("resize", onVVResize);
              vvCleanup = () => vv.removeEventListener("resize", onVVResize);
            }

            gsap.set(".s7-mob-bg", { scale: 1.15, transformOrigin: "center center" });
            gsap.set(".s8-mob-bg", { scale: 1.15, transformOrigin: "center center" });

            gsap.set(".s10-video-wrap", {
              y: () => {
                const vvH = vvHeight();
                const el  = document.querySelector(".s10-video-wrap") as HTMLElement;
                if (!el) return 500;
                return vvH - el.getBoundingClientRect().top + 20;
              },
              clipPath: "none",
            });

            const tl = gsap.timeline({
              scrollTrigger: {
                trigger:             ".pin-all",
                start:               "top top",
                end:                 "+=17000",
                scrub:               scrubValue,
                pin:                 true,
                anticipatePin:       1,
                preventOverlaps:     true,
                fastScrollEnd:       true,
                invalidateOnRefresh: true,
                onLeave: () => {
                  lenisRef.current?.stop();
                  requestAnimationFrame(() => lenisRef.current?.start());
                },
              },
            });

            tl
              // ── Hero → S1 ────────────────────────────────────────────
              .to(".section-1", { yPercent: 0,   duration: 2.0, ease: "none" })
              .to(".hero-bg",   { yPercent: -20, duration: 2.0, ease: "none" }, "<")
              .to(".s1-bg",     { yPercent: 0, scale: 1, duration: 1.8, ease: "none" }, "<")
              .to(".s1-card",   { yPercent: 0, opacity: 1, duration: 1.8, ease: "power2.out" }, 0.3)
              .to({}, { duration: PAUSE })

              // ── S1 → S2 ──────────────────────────────────────────────
              .set(".section-1", { zIndex: 20 })
              .to(".section-2", { clipPath: "inset(0% 0% 0% 0%)", duration: TRANSITION, ease: EASE })
              .to(".section-1", { scale: 1.05,                     duration: TRANSITION, ease: EASE }, "<")
              .to(".s2-bg",     { yPercent: 0, scale: 1,           duration: TRANSITION, ease: "power2.out" }, "<")
              .to({}, { duration: PAUSE })

              // ── S2 → S3 ──────────────────────────────────────────────
              .set(".section-3", { visibility: "visible" })
              .to(".section-3", { yPercent: 0,  duration: TRANSITION, ease: EASE })
              .to(".section-2", { scale: 1.05,  duration: TRANSITION, ease: EASE }, "<")
              .to({}, { duration: PAUSE })

              // ── S3 → S4 ──────────────────────────────────────────────
              .to(".section-4",  { yPercent: 0,    duration: TRANSITION, ease: EASE })
              .to(".section-3",  { yPercent: -100, duration: TRANSITION, ease: EASE }, "-=1.2")
              .to(".s4-img-mob", { y: -60,          duration: TRANSITION, ease: "none" }, "<")
              .to({}, { duration: PAUSE })

              // ── S4 → S5 ──────────────────────────────────────────────
              .to(".section-5", { clipPath: "inset(0% 0% 0% 0%)", duration: TRANSITION, ease: EASE })
              .to(".section-4", { scale: 1.05,                     duration: TRANSITION, ease: EASE }, "<")
              .to({}, { duration: PAUSE })

              // ── S5 → S6 ──────────────────────────────────────────────
              .to(".section-6", { yPercent: 0,  duration: TRANSITION, ease: EASE })
              .to(".section-5", { scale: 1.05,  duration: TRANSITION, ease: EASE }, "<")
              .to({}, { duration: 0.6 })

              // ── S6 → S10 ─────────────────────────────────────────────
              .set(".section-10", { visibility: "visible" })
              .to(".section-6",     { yPercent: -100, duration: TRANSITION, ease: EASE })
              .to(".s10-static-bg", { yPercent: 0,    duration: TRANSITION, ease: "power2.out" }, "<")
              .to({}, { duration: PAUSE })

              // ── S10 inner ────────────────────────────────────────────
              .set(".s10-title",     { opacity: 1, y: 0 })
              .set(".s10-title-sub", { opacity: 1, y: 0 })
              .set(".s10-para-top",  { opacity: 1, y: 0 })

              .to(".s10-title",      { opacity: 0, y: -60, duration: 1.5, ease: "none" })
              .to(".s10-title-sub",  { opacity: 0, y: -40, duration: 1.5, ease: "none" }, "<")
              .to(".s10-para-top",   { opacity: 0, y: -50, duration: 1.5, ease: "none" }, "<")
              .to(".s10-video-wrap", { y: 0,               duration: 2.0, ease: "none" }, "<")
              .to({}, { duration: 0.3 })
              .to(".s10-card",       { clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, ease: "power2.out" })
              .to(".s10-card-body",  { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "power2.out" }, "<+0.2")
              .to(".s10-video-wrap", {
                y: () => {
                  const el = document.querySelector(".s10-video-wrap") as HTMLElement;
                  if (!el) return -vvHeight() * 0.55;
                  return -(el.getBoundingClientRect().top - 80);
                },
                duration: 1.8, ease: "none",
              }, "<+0.4")
              .to(".s10-video-wrap", { clipPath: "inset(0% 0% 100% 0%)", duration: 1.2, ease: "none" }, "<+0.2")
              .set(".s10-video-wrap", { visibility: "hidden" })
              .to(".s10-card", {
                y: () => {
                  const card = document.querySelector(".s10-card") as HTMLElement;
                  if (!card) return -vvHeight() * 0.7;
                  return -card.getBoundingClientRect().top;
                },
                duration: 2.5, ease: "none",
              })
              .to(".s10-card-body", { y: 30,   duration: 2.5, ease: "none" }, "<")
              .to(".s10-bg-img",    { y: "0%", duration: 2.5, ease: "none" }, "<")
              .to({}, { duration: 0.6 })

              // ── S10 → S7 + S8 ────────────────────────────────────────
              .set(".section-8", { visibility: "visible" })
              .to(".section-7",  { yPercent: 0, duration: TRANSITION, ease: "power3.out" })
              .to(".section-8",  { yPercent: 0, duration: TRANSITION, ease: "power3.out" }, "<")
              .to(".section-10", { scale: 1.05, duration: TRANSITION, ease: EASE }, "<")
              .to(".s7-bg-img",  { yPercent: 0, duration: TRANSITION, ease: "power2.out" }, "<")
              .to(".s8-bg-img",  { yPercent: 0, duration: TRANSITION, ease: "power2.out" }, "<")
              .to(".s7-mob-bg",  { scale: 1,    duration: TRANSITION, ease: "power2.out" }, "<")
              .to({}, { duration: PAUSE })

              // ── S7 → S8 ──────────────────────────────────────────────
              .to(".section-7", { yPercent: -100, duration: TRANSITION, ease: EASE })
              .to(".s8-mob-bg", { scale: 1,       duration: TRANSITION, ease: "power2.out" }, "<")
              .set(".section-8", { clipPath: "inset(0% 0% 0% 0%)" })
              .to({}, { duration: PAUSE })

              .set(".section-7", { visibility: "hidden" })

              // ── S8 → S9 ──────────────────────────────────────────────
              .set(".section-9", { visibility: "visible" })
              .to(".section-8", { clipPath: "inset(0% 0% 100% 0%)", duration: TRANSITION, ease: EASE })
              .to(".s9-bg-img", { yPercent: 0,  duration: TRANSITION, ease: "power2.out" }, "<")
              .to(".s9-title",  { opacity: 1,   duration: 1.2, ease: "power2.out" }, "<+1.0")
              .to(".s9-para",   { opacity: 1,   duration: 1.2, ease: "power3.out" }, "<")
              .to({}, { duration: PAUSE })

              // ── CTA + Footer ──────────────────────────────────────────
              .set(".section-cta", { visibility: "visible" })
              .to(".section-cta", { yPercent: 0,   duration: 3.5, ease: "power3.out" })
              .to(".section-9",   { scale: 1.05,   duration: 3.5, ease: EASE }, "<")
              .to(".s9-bg-img",   { yPercent: -10, duration: 3.5, ease: "none" }, "<")
              .to({}, { duration: 0.5 })

              .set(".footer", { visibility: "visible" })
              .to(".footer",    { y: 0,          duration: 2.5, ease: "power3.out" })
              .to(".section-9", { scale: 1.05,   duration: 2.5, ease: EASE }, "<")
              .to(".s9-bg-img", { yPercent: -20, duration: 2.5, ease: "none" }, "<")
              .to({}, { duration: 1.0 });

            // ── Animation speed controller ──────────────────────────────
            // Touch gets a slightly higher cap (0.26) because momentum
            // flicks travel faster than wheel events. Both values ensure
            // no single animation frame jumps more than ~4% of the full
            // timeline, keeping yPercent slides and clipPath reveals smooth.
            if (tl.scrollTrigger) {
              speedCleanup = attachSpeedController(tl.scrollTrigger, {
                maxProgressPerSecond: 0.26,
                throttleReverse:      true,
              });
            }

            onScrollReady();
          });
        });
      };

      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        (window as any).requestIdleCallback(
          () => document.fonts.ready.then(buildTimeline),
          { timeout: 300 }
        );
      } else {
        setTimeout(() => document.fonts.ready.then(buildTimeline), 0);
      }

    }, scopeRef);

    return () => {
      vvCleanup?.();
      speedCleanup?.();
      ctx.revert();
    };
  }, [preloaderDone]);

  return (
    <div ref={scopeRef}>
      <div className="pin-all relative overflow-hidden" style={{ height: "100svh" }}>

        <div className="section-1 absolute inset-0 z-[90]">
          <SectionOne />
        </div>
        <div className="section-2 absolute inset-0 z-[95]" style={{ pointerEvents: "none", visibility: "hidden" }}>
          <SectionTwo />
        </div>
        <div className="section-3 absolute inset-0 z-[100]" style={{ pointerEvents: "none", visibility: "hidden" }}>
          <SectionThree />
        </div>
        <div className="section-4 absolute inset-0 z-[105]" style={{ overflow: "visible", pointerEvents: "none", visibility: "hidden" }}>
          <SectionFour />
        </div>
        <div className="section-5 absolute inset-0 z-[110]" style={{ pointerEvents: "none", visibility: "hidden" }}>
          <SectionFive />
        </div>
        <div className="section-10 absolute inset-0 z-[112]" style={{ pointerEvents: "none", visibility: "hidden" }}>
          <SectionTen />
        </div>
        <div className="section-6 absolute inset-0 z-[115]" style={{ pointerEvents: "none", visibility: "hidden" }}>
          <SectionSix />
        </div>
        <div className="section-9 absolute inset-0 z-[121]" style={{ pointerEvents: "none", visibility: "hidden" }}>
          <SectionNine />
        </div>
        <div className="section-8 absolute inset-0 z-[128]" style={{ pointerEvents: "auto", visibility: "hidden" }}>
          <SectionEight />
        </div>
        <div className="section-7 absolute inset-0 z-[130]" style={{ pointerEvents: "none", visibility: "hidden" }}>
          <SectionSeven />
        </div>
        <div className="hero absolute inset-0 z-[5]" style={{ pointerEvents: "none" }}>
          <Hero />
        </div>
        <div
          className="section-cta absolute inset-0 z-[150]"
          style={{ pointerEvents: "none", visibility: "hidden" }}
        >
          <SectionCTA />
        </div>
        <div
          className="footer absolute left-0 w-full z-[151]"
          style={{ bottom: 0, pointerEvents: "none", visibility: "hidden" }}
        >
          <Footer />
        </div>
      </div>
    </div>
  );
}