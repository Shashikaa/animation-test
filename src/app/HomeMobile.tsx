"use client";

import { useRef, useEffect, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSite } from "./context/SiteContext";
import dynamic from "next/dynamic";

import Hero         from "../components/Home/Hero";
import SectionTwo   from "../components/Home/SectionTwo";
import SectionThree from "../components/Home/SectionThree";
import SectionFour  from "../components/Home/SectionFour";
import SectionFive  from "../components/Home/SectionFive";
import SectionSix   from "../components/Home/SectionSix";
import SectionCTA   from "../components/SectionCTA";
import Footer       from "../components/Footer";

const SectionSeven = dynamic(() => import("../components/Home/Sectionseven"), { ssr: false });
const SectionEight = dynamic(() => import("../components/Home/Sectioneight"), { ssr: false });
const SectionNine  = dynamic(() => import("../components/Home/SectionNine"),  { ssr: false });
const SectionTen   = dynamic(() => import("../components/Home/SectionTen"),   { ssr: false });

import { useTextReveal, restoreTextReveal } from "./utils/useTextReveal";

gsap.registerPlugin(ScrollTrigger);

const vvHeight = () =>
  (typeof visualViewport !== "undefined" && visualViewport != null
    ? visualViewport.height
    : null) ?? window.innerHeight;

export default function HomeMobile() {
  const contextValues = useSite() as any;
  const preloaderDone = contextValues.preloaderDone;
  const onScrollReady = contextValues.onScrollReady ?? (() => {});
  const scopeRef = useRef<HTMLDivElement>(null);

  // ── INITIAL PRE-RENDER LAYER ARCHITECTURE ──
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(".hero", { yPercent: 0, zIndex: 90 });
      gsap.set(".section-2", { clipPath: "none", zIndex: 25 });
    }, scopeRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!preloaderDone) return;

    let vvCleanup: (() => void) | null = null;
    let fallbackTimeout: NodeJS.Timeout | null = null;
    let timelineInitialized = false;

    const ctx = gsap.context(() => {
      gsap.ticker.lagSmoothing(0);

      ScrollTrigger.config({
        autoRefreshEvents: "visibilitychange,DOMContentLoaded,load,resize",
      });

      const TRANSITION = 2.0;
      const EASE       = "power2.inOut";
      const PAUSE      = 0.4; 
      const footerEl = scopeRef.current?.querySelector<HTMLElement>(`.footer`);
      const footerH  = footerEl?.offsetHeight ?? 600;

      // ── Structural Sets ────────────────────────────────────
      gsap.set(".hero",    { yPercent: 0, zIndex: 90 });
      gsap.set(".hero-bg-wrapper", { clipPath: "inset(0% 0% 0% 0%)" });
      gsap.set(".hero-bg", { yPercent: 0 });
      gsap.set(".hero h1, .hero-right-text", { opacity: 1, y: 0 });
      
      gsap.set(".hero-secondary-text-wrap", { height: "auto" });
      gsap.set(".hero-secondary-para", { visibility: "hidden" });

      gsap.set(".section-3", {
        visibility: "hidden",
        yPercent:   100,
        zIndex:     100,
      });

      gsap.set(".section-4", { yPercent: 100, visibility: "visible", zIndex: 105 });
      gsap.set(".s5-card",   { scale: 1, transformOrigin: "center center" });
      gsap.set(".s4-content", { y: 0 });
      gsap.set(".s4-bg-img",   { yPercent: 8 });
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

      const waitForMobBgs = (cb: () => void) => {
        let framesChecked = 0;
        const check = () => {
          framesChecked++;
          const hasS7 = document.querySelector(".s7-mob-bg");
          const hasS8 = document.querySelector(".s8-mob-bg");
          
          if ((hasS7 && hasS8) || framesChecked > 60) {
            cb();
          } else {
            requestAnimationFrame(check);
          }
        };
        check();
      };

      const buildTimeline = () => {
        if (timelineInitialized) return;
        timelineInitialized = true;

        waitForMobBgs(() => {
          requestAnimationFrame(() => {
            const pinEl = document.querySelector(".pin-all") as HTMLElement;

            ScrollTrigger.refresh(true);

            const onOrientationChange = () => {
              ScrollTrigger.refresh(true);
            };
            screen.orientation?.addEventListener("change", onOrientationChange);
            vvCleanup = () => screen.orientation?.removeEventListener("change", onOrientationChange);

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
              defaults: { ease: "none" },
              scrollTrigger: {
                trigger:              ".pin-all",
                start:                "top top",
                end:                  "+=12800", 
                scrub:                0.2,       
                pin:                  true,
                anticipatePin:        1,
                preventOverlaps:      true,
                fastScrollEnd:        true,
                invalidateOnRefresh:  true,
                onRefresh: () => {
                  if (pinEl) pinEl.style.removeProperty("max-height");
                }
              },
            });

            tl
              // ── Step 1: FRONT-LOADED HERO TEXT FADEOUT ──
              .to(".hero h1, .hero-right-text", { 
                opacity: 0, 
                y: -40, 
                duration: TRANSITION * 0.4, 
                ease: "power2.in" 
              })
              // Trigger secondary text immediately here
              .addLabel("heroSecondaryReveal")
              .set(".hero-secondary-para", { visibility: "visible" }, "heroSecondaryReveal")
              
              // Let background animations shift over time on their own timeline track
              .to(".hero-bg-wrapper", { 
                clipPath: "inset(0% 0% 40% 0%)", 
                duration: TRANSITION, 
                ease: "power1.inOut" 
              }, 0)
              .to(".hero-bg", { 
                yPercent: -25, 
                duration: TRANSITION, 
                ease: "power1.inOut" 
              }, 0)
              .to({}, { duration: PAUSE })

              // ── Step 2: EXECUTE TEXT FLIGHT + BG FADEOUT SEQUENTIALLY AFTER HERO DONE ──
              .addLabel("textFlightStart")
              .set([".s2-title-main", ".s2-title-sub"], { opacity: 0 }, "textFlightStart")
              
              // Only fade out the images/gradients backgrounds here
              .to([".hero-bg-wrapper", ".hero-gradient-bg"], {
                opacity: 0,
                duration: TRANSITION * 0.6,
                ease: "power2.out"
              }, "textFlightStart")
              
              // Fade in underneath Section Two textual content
              .to([".s2-title-main", ".s2-title-sub"], { opacity: 1, duration: TRANSITION * 0.8 }, "textFlightStart+=0.3")

              // Fly the text directly into Section Two container target coordinates
              .to(".hero-secondary-para", {
                y: () => {
                  const startEl = document.querySelector(".hero-secondary-text-wrap") as HTMLElement;
                  const targetEl = document.querySelector(".s2-body") as HTMLElement;
                  if (!startEl || !targetEl) return 0;
                  return targetEl.getBoundingClientRect().top - startEl.getBoundingClientRect().top;
                },
                x: () => {
                  const startEl = document.querySelector(".hero-secondary-text-wrap") as HTMLElement;
                  const targetEl = document.querySelector(".s2-body") as HTMLElement;
                  if (!startEl || !targetEl) return 0;
                  return targetEl.getBoundingClientRect().left - startEl.getBoundingClientRect().left;
                },
                duration: TRANSITION,
                ease: "power1.inOut"
              }, "textFlightStart")
              .to({}, { duration: PAUSE })

              // ── Section 2 → 3 ─────────────────────────────────────
              .addLabel("sec3Start")
              .set(".section-3", { visibility: "visible" })
              // FIXED: Removed the opacity 0 fade-out so text remains visible until Sec 3 fully overlays it
              .to(".section-3", { yPercent: 0, duration: TRANSITION, ease: EASE }, "sec3Start")
              .set([".section-2", ".hero"], { display: "none" }) 
              .to({}, { duration: PAUSE })

              // ── Section 3 → 4 ─────────────────────────────────────
              .to(".section-4",  { yPercent: 0,    duration: TRANSITION, ease: EASE })
              .to(".section-3",  { yPercent: -100, duration: TRANSITION, ease: EASE }, "-=1.2")
              .to(".s4-img-mob", { y: -60,         duration: TRANSITION, ease: "none" }, "<")
              .to({}, { duration: PAUSE })

              // ── Section 4 → 5 ─────────────────────────────────────
              .to(".section-5", { clipPath: "inset(0% 0% 0% 0%)", duration: TRANSITION, ease: EASE })
              .to({}, { duration: PAUSE })

              // ── Section 5 → 6 ─────────────────────────────────────
              .to(".section-6", { yPercent: 0, duration: TRANSITION, ease: EASE })
              .to(".section-5", { scale: 1.0,  duration: TRANSITION, ease: EASE }, "<")
              .to({}, { duration: PAUSE }) 

              // ── Section 6 → 10 ────────────────────────────────────
              .set(".section-10", { visibility: "visible" })
              .to(".section-6",     { yPercent: -100, duration: TRANSITION, ease: EASE })
              .to(".s10-static-bg", { yPercent: 0,    duration: TRANSITION, ease: "power2.out" }, "<")
              .to({}, { duration: PAUSE })

              .set(".s10-title",     { opacity: 1, y: 0 })
              .set(".s10-title-sub", { opacity: 1, y: 0 })
              .set(".s10-para-top",  { opacity: 1, y: 0 })

              .to(".s10-title",      { opacity: 0, y: -60, duration: 1.5, ease: "none" })
              .to(".s10-title-sub",  { opacity: 0, y: -40, duration: 1.5, ease: "none" }, "<")
              .to(".s10-para-top",   { opacity: 0, y: -50, duration: 1.5, ease: "none" }, "<")
              .to(".s10-video-wrap", { y: 40,               duration: TRANSITION, ease: "none" }, "<")
              .addLabel("s10VideoCentered")
              .to({}, { duration: PAUSE }) 
              .to(".s10-card",      { clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, ease: "power2.out" })
              .to(".s10-card-body", { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "power2.out" }, "<+0.2")
              .to(".s10-video-wrap", {
                y: () => {
                  const el = document.querySelector(".s10-video-wrap") as HTMLElement;
                  if (!el) return -vvHeight() * 0.55;
                  return -(el.getBoundingClientRect().top - 80);
                },
                duration: 1.8, ease: "none",
              }, "s10VideoCentered")
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
              .to({}, { duration: PAUSE }) 

              // ── Section 7 + 8 slide in ────────────────────────────
              .set(".section-8", { visibility: "visible" })
              .to(".section-7",  { yPercent: 0, duration: TRANSITION, ease: "power3.out" })
              .to(".section-8",  { yPercent: 0, duration: TRANSITION, ease: "power3.out" }, "<")
              .to(".s7-bg-img",  { yPercent: 0, duration: TRANSITION, ease: "power2.out" }, "<")
              .to(".s8-bg-img",  { yPercent: 0, duration: TRANSITION, ease: "power2.out" }, "<")
              .to(".s7-mob-bg",  { scale: 1,    duration: TRANSITION, ease: "power2.out" }, "<")
              .to({}, { duration: PAUSE })

              // ── Section 7 exits, 8 stays ──────────────────────────
              .to(".section-7", { yPercent: -100, duration: TRANSITION, ease: EASE })
              .to(".s8-mob-bg", { scale: 1,       duration: TRANSITION, ease: "power2.out" }, "<")
              .set(".section-8", { clipPath: "inset(0% 0% 0% 0%)" })
              .to({}, { duration: PAUSE })

              .set(".section-7", { visibility: "hidden" })

              // ── Section 8 → 9 ─────────────────────────────────────
              .set(".section-9", { visibility: "visible" })
              .to(".section-8", { clipPath: "inset(0% 0% 100% 0%)", duration: TRANSITION, ease: EASE })
              .to(".s9-bg-img", { yPercent: 0, duration: TRANSITION, ease: "power2.out" }, "<")
              .to(".s9-title",  { opacity: 1,  duration: 1.2, ease: "power2.out" }, "<+1.0")
              .to(".s9-para",   { opacity: 1,  duration: 1.2, ease: "power3.out" }, "<")
              .to({}, { duration: PAUSE })

              // ── Section 9 → CTA ───────────────────────────────────
              .set(".section-cta", { visibility: "visible" })
              .to(".section-cta", { yPercent: 0,   duration: TRANSITION, ease: "power3.out" }) 
              .to(".s9-bg-img",   { yPercent: -10, duration: TRANSITION, ease: "none" }, "<")
              .to({}, { duration: PAUSE }) 

              // ── Footer ────────────────────────────────────────────
              .set(".footer", { visibility: "visible" })
              .to(".footer",    { y: 0,          duration: TRANSITION, ease: "power3.out" }) 
              .to(".s9-bg-img", { yPercent: -20, duration: TRANSITION, ease: "none" }, "<")
              .to({}, { duration: 0.4 }); 

            // ── TEXT REVEAL Engine Execution ──
            useTextReveal(scopeRef, ".hero-secondary-para", {
              tl,
              position: "heroSecondaryReveal",
              duration: TRANSITION * 0.8,
              stagger: 0.06,
            });

            requestAnimationFrame(() => {
              if (pinEl) pinEl.style.removeProperty("max-height");
            });

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

      fallbackTimeout = setTimeout(() => {
        if (!timelineInitialized) {
          buildTimeline();
        }
      }, 1000);

    }, scopeRef);

    return () => {
      vvCleanup?.();
      if (fallbackTimeout) clearTimeout(fallbackTimeout);
      if (scopeRef.current) {
        restoreTextReveal(scopeRef.current, ".hero-secondary-para");
      }
      ctx.revert();
    };
  }, [preloaderDone]);

  return (
    <div ref={scopeRef}>
      <div className="pin-all relative overflow-hidden bg-black">
        <div className="section-2 absolute inset-0 z-[25]">
          <SectionTwo />
        </div>
        <div className="section-3 absolute inset-0 z-[30]" style={{ pointerEvents: "none", display: "none" }}>
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
        <div className="section-8 absolute inset-0 z-[128]" style={{ pointerEvents: "none", visibility: "hidden" }}>
          <SectionEight />
        </div>
        <div className="section-7 absolute inset-0 z-[130]" style={{ pointerEvents: "none", visibility: "hidden" }}>
          <SectionSeven />
        </div>
        <div className="hero absolute inset-0 z-[90]" style={{ pointerEvents: "none" }}>
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