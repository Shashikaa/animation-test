"use client";

import { useRef, useEffect, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSite } from "./context/SiteContext";
import dynamic from "next/dynamic";

import Hero from "../components/Home/Hero";
import SectionTwo from "../components/Home/SectionTwo";
import SectionThree from "../components/Home/SectionThree";
import SectionCTA from "../components/SectionCTA";
import Footer from "../components/Footer";

const SectionSeven = dynamic(() => import("../components/Home/Sectionseven"), { ssr: false });
const SectionEight = dynamic(() => import("../components/Home/Sectioneight"), { ssr: false });
const SectionNine = dynamic(() => import("../components/Home/SectionNine"), { ssr: false });
const SectionTen = dynamic(() => import("../components/Home/SectionTen"), { ssr: false });
const SectionReviews = dynamic(() => import("../components/Home/SectionReviews"), { ssr: false });

import { useTextReveal, restoreTextReveal } from "./utils/useTextReveal";

gsap.registerPlugin(ScrollTrigger);

const isTouchOnly = () => ScrollTrigger.isTouch === 1;

export default function HomeDesktop() {
  const contextValues = useSite() as any;
  const preloaderDone = contextValues.preloaderDone;
  const onScrollReady = contextValues.onScrollReady ?? (() => {});
  const scopeRef = useRef<HTMLDivElement>(null);

  // ── INITIAL STATE SETTING ──
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(".hero", { yPercent: 0, zIndex: 90, display: "block", opacity: 1 });
      gsap.set(".hero-bg-wrapper", { opacity: 1, visibility: "visible" });
      gsap.set(".hero-gradient-bg", { opacity: 1, visibility: "visible" });

      gsap.set(".section-2", { display: "block", clipPath: "none", zIndex: 45, opacity: 1 });
      gsap.set(".s2-right-img-frame", { clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(".s2-right-img-frame-under", { clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(".s2-scroll-content", { yPercent: 100, y: 0, opacity: 0 });

      // ── SECTION 3 HARD INITIAL STATE MASKED AT BOTTOM ──
      gsap.set(".section-3", { display: "block", clipPath: "inset(100% 0% 0% 0%)", opacity: 1, zIndex: 40, yPercent: 0 });
      
      // ── SECTION 10 SLIDE UP INITIAL STATE ──
      gsap.set(".section-10", { display: "block", yPercent: 100, opacity: 1, zIndex: 60 });
      gsap.set([".s10-title", ".s10-title-sub", ".s10-para-top"], { opacity: 0, y: 80 });
      
      gsap.set(".s10-img-right-wrap", { opacity: 0, yPercent: 120, y: 0, clipPath: "inset(0% 0% 0% 0%)", display: "block" });
      gsap.set(".s10-content-wrap", { opacity: 0, yPercent: 120, y: 0 });

      // ── SECTION REVIEWS INITIAL HIDE STATE ──
      gsap.set(".section-reviews", { display: "none", clipPath: "inset(100% 0% 0% 0%)", opacity: 1, zIndex: 65 });

      gsap.set(".section-7", { display: "block", yPercent: 100, zIndex: 70 });
      gsap.set(".section-8", { display: "none", clipPath: "inset(100% 0% 0% 0%)", zIndex: 75 });
      gsap.set(".section-9", { display: "none", opacity: 1, zIndex: 28 });
      gsap.set(".section-cta", { yPercent: 100, zIndex: 95, display: "none" });
      gsap.set(".footer", { yPercent: 100, zIndex: 96, display: "none" });

      gsap.set(".hero-bg", { scale: 1.15, transformOrigin: "center center" });
      gsap.set(".hero-secondary-para", { visibility: "hidden" });
    }, scopeRef);
    return () => ctx.revert();
  }, []);

  // ── MAIN RUNTIME ENGINE ──
  useEffect(() => {
    if (!preloaderDone) return;

    if (isTouchOnly()) {
      ScrollTrigger.normalizeScroll(true);
    }

    let vvCleanup: (() => void) | null = null;

    const ctx = gsap.context(() => {
      gsap.ticker.lagSmoothing(0);

      ScrollTrigger.config({
        ignoreMobileResize: true,
        autoRefreshEvents: "visibilitychange,DOMContentLoaded,load,resize",
      });

      const performanceTargets = [
        ".hero", ".hero-bg-wrapper", ".hero-bg", ".hero-gradient-bg", ".hero-secondary-para", ".hero-right-text",
        ".section-2", ".s2-right-img-frame", ".s2-right-img-frame-under", ".s2-scroll-content", ".section-3",
        ".section-7", ".section-8", ".section-9", ".section-10", ".section-reviews",
        ".s7-bg-img", ".s8-bg-img", ".s9-bg-img", ".s10-bg-img", ".s10-static-bg", ".s10-img-right-wrap"
      ];

      performanceTargets.forEach(selector => {
        gsap.set(selector, {
          force3D: true,
          willChange: "transform, opacity, clip-path",
          transformStyle: "preserve-3d"
        });
      });

      const scrubValue = 0.8;

      gsap.set(".s10-bg-img", { y: "100%" });
      gsap.set(".s10-static-bg", { yPercent: 12 });
      gsap.set(".s7-bg-img", { yPercent: 20 });
      gsap.set(".s8-bg-img", { yPercent: 20 });
      gsap.set(".s9-bg-img", { yPercent: 0, scale: 1.15 });
      gsap.set(".s8-panel-left", { clipPath: "inset(0% 50% 0% 0%)", zIndex: 85 });
      gsap.set(".s8-panel-right", { clipPath: "inset(0% 0% 0% 50%)", zIndex: 85 });
      gsap.set(".s9-para", { opacity: 0, y: 5 });
      gsap.set(".footer", { yPercent: 100 });

      gsap.set(".s9-title", {
        opacity: 0,
        position: "absolute",
        left: "50%",
        top: "50%",
        xPercent: -50,
        yPercent: -50,
        x: 0,
        y: 0
      });

      const buildTimeline = () => {
        requestAnimationFrame(() => {
          ScrollTrigger.refresh();

          const vv = typeof visualViewport !== "undefined" ? visualViewport : null;
          if (vv) {
            const onVVResize = () => ScrollTrigger.refresh(true);
            vv.addEventListener("resize", onVVResize);
            vvCleanup = () => vv.removeEventListener("resize", onVVResize);
          }

          let cachedProgressLabels: number[] = [];

          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: ".pin-all",
              end: "+=26000",
              scrub: scrubValue,
              pin: true,
              anticipatePin: 1,
              preventOverlaps: true,
              fastScrollEnd: true,
              invalidateOnRefresh: true,
              snap: {
                snapTo: (progress) => {
                  if (cachedProgressLabels.length === 0) return progress;
                  if (progress <= 0) return 0;
                  if (progress >= 1) return 1;

                  for (let i = 0; i < cachedProgressLabels.length - 1; i++) {
                    const start = cachedProgressLabels[i];
                    const end = cachedProgressLabels[i + 1];

                    if (progress >= start && progress <= end) {
                      const localProgress = (progress - start) / (end - start);
                      return localProgress > 0.3 ? end : start;
                    }
                  }
                  return progress;
                },
                duration: { min: 0.7, max: 1.2 },
                delay: 0.1,
                ease: "power2.inOut",
              },
            },
          });

          // ── HERO SCROLL OVERLAYS ──
          tl.addLabel("heroStart")
            .to(".hero h1, .hero [class*='bottom-8'], .hero-right-text", {
              opacity: 0,
              y: -40,
              duration: 2.5
            }, "heroStart")
            .to(".hero-bg-wrapper", {
              clipPath: "inset(0% 8% 12% 50%)",
              duration: 4.5
            }, "heroStart")
            .to(".hero-bg", {
              scale: 1.0,
              duration: 4.5
            }, "heroStart")
            .to({}, { duration: 1.2 });

          // ── HERO EXIT INTO SECTION 2 ──
          tl.addLabel("heroExit")
            .set([".s2-title-main", ".s2-title-sub"], { opacity: 0 }, "heroExit")
            .to([".s2-title-main", ".s2-title-sub"], { opacity: 1, duration: 2.0 }, "heroExit")
            .to(".hero-bg-wrapper", {
              clipPath: "inset(0% 8% 100% 50%)",
              duration: 3.8,
              ease: "power1.inOut"
            }, "heroExit")
            .to([".hero-bg-wrapper", ".hero-gradient-bg"], { 
              opacity: 0, 
              duration: 2.0, 
              ease: "power2.out" 
            }, "heroExit+=1.2")
            .to(".hero-secondary-para", {
              x: () => {
                const startEl = document.querySelector(".hero-secondary-text-wrap") as HTMLElement;
                const targetEl = document.querySelector(".s2-body") as HTMLElement;
                if (!startEl || !targetEl) return 0;
                const currentTransform = gsap.getProperty(startEl, "x") as number;
                return targetEl.getBoundingClientRect().left - (startEl.getBoundingClientRect().left - currentTransform);
              },
              y: () => {
                const startEl = document.querySelector(".hero-secondary-text-wrap") as HTMLElement;
                const targetEl = document.querySelector(".s2-body") as HTMLElement;
                if (!startEl || !targetEl) return 0;
                const currentTransform = gsap.getProperty(startEl, "y") as number;
                return targetEl.getBoundingClientRect().top - (startEl.getBoundingClientRect().top - currentTransform);
              },
              duration: 3.8,
              ease: "power1.inOut"
            }, "heroExit")
            .addLabel("textLanding", "heroExit+=3.8");

          // ── SECTION 2 INNER ANIMATION ──
          tl.addLabel("s2InnerAnimation", "textLanding")
            .to(".s2-right-img-frame", {
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 4.0,
              ease: "power2.inOut"
            }, "s2InnerAnimation")
            .to(".hero-secondary-para", {
              opacity: 0,
              duration: 1.5,
              ease: "power1.out"
            }, "s2InnerAnimation")
            .to(".s2-scroll-content", {
              yPercent: 0,
              opacity: 1,
              duration: 5.0,
              ease: "power2.out"
            }, "s2InnerAnimation+=1.0")
            .to(".s2-right-img-frame", {
              clipPath: "inset(0% 0% 100% 0%)",
              duration: 4.0,
              ease: "power2.inOut"
            }, "s2InnerAnimation+=3.5")
            .to(".s2-right-img-frame-under", {
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 4.0,
              ease: "power2.inOut"
            }, "s2InnerAnimation+=3.5")
            .to(".s2-scroll-content", {
              y: -500,
              duration: 6.0,
              ease: "none"
            }, "s2InnerAnimation+=5.0");

          // ── SECTION 2 TO 3 REVEAL WIPE ──
          tl.addLabel("sec3Start")
            .set(".section-3", { zIndex: 50, display: "block" }, "sec3Start")
            .fromTo(".section-3",
              { clipPath: "inset(100% 0% 0% 0%)" },
              {
                clipPath: "inset(0% 0% 0% 0%)",
                duration: 5.0,
                ease: "power2.inOut",
                clearProps: "clipPath"
              },
              "sec3Start"
            )
            .to(".s2-scroll-content, .s2-title-main, .s2-title-sub", { opacity: 0, duration: 2.0 }, "sec3Start")
            .to(".section-3 .s3-services-nav", { x: 0, opacity: 1, duration: 2.5, ease: "power2.out" }, "sec3Start+=1.8")
            .to(".section-3 .s3-text-content-wrapper", { opacity: 1, y: 0, duration: 2.0, ease: "power2.out" }, "sec3Start+=2.0")
            .set(".section-2", { display: "none" }, "sec3Start+=5.0")
            .set([".section-2", ".hero"], { display: "none" })
            .to({}, { duration: 0.2 });

          // ── SECTION 3 TO 10 SLIDE UP OVER 3 ──
          tl.addLabel("sec10Start")
            .set(".section-10", { zIndex: 60, display: "block" }, "sec10Start")
            .fromTo(".section-10", 
              { yPercent: 100 },
              { 
                yPercent: 0, 
                duration: 6.0, 
                ease: "power2.inOut"
              }, 
              "sec10Start"
            )
            .fromTo(".s10-static-bg", { yPercent: 12 }, { yPercent: 0, duration: 6.0, ease: "power2.out" }, "sec10Start")
            .set(".section-3", { display: "none" }, "sec10Start+=6.0")
            .set([".s10-content-wrap", ".s10-img-right-wrap"], { opacity: 0, yPercent: 120 }, "sec10Start")
            .to([".s10-title", ".s10-title-sub", ".s10-para-top"], {
              opacity: 1,
              y: 0,
              duration: 3.0,
              stagger: 0.1,
              ease: "power2.out"
            }, "sec10Start+=3.2")
            .addLabel("sec10TextHide")
            .to([".s10-title", ".s10-title-sub", ".s10-para-top"], {
              opacity: 0,
              y: -80,
              duration: 2.5,
              stagger: 0.05,
              ease: "power2.in"
            }, "sec10TextHide")
            .addLabel("sec10ContentReveal")
            .fromTo([".s10-content-wrap", ".s10-img-right-wrap"], 
              { opacity: 0, yPercent: 120 },
              {
                opacity: 1,
                yPercent: 0,
                y: 0,
                clearProps: "yPercent", 
                duration: 5.0,
                stagger: 0.15,
                ease: "power2.out"
              }, 
              "sec10TextHide+=1.8"
            )
            .to({}, { duration: 4.5 })
            .addLabel("sec10ExitSequence")
            .to(".s10-img-right-wrap", { 
              clipPath: "inset(0% 0% 100% 0%)", 
              y: -60,                                   
              opacity: 0,
              duration: 5.5,
              ease: "power2.inOut"
            }, "sec10ExitSequence")
            .to(".s10-content-wrap", { 
              opacity: 0, 
              y: -100, 
              duration: 5.0,
              ease: "power2.inOut"
            }, "sec10ExitSequence")
            .addLabel("sec10FinalScroll")
            .to({}, { duration: 0.2 });

          // ── SECTION 10 TO CUSTOMER REVIEWS WIPE ──
          tl.addLabel("secReviewsStart")
            .set(".section-reviews", { zIndex: 65, display: "block" }, "secReviewsStart")
            .fromTo(".section-reviews",
              { clipPath: "inset(100% 0% 0% 0%)" },
              {
                clipPath: "inset(0% 0% 0% 0%)",
                duration: 6.0,
                ease: "power2.inOut",
                clearProps: "clipPath"
              },
              "secReviewsStart"
            )
            .set(".section-10", { display: "none" }, "secReviewsStart+=6.0")
            .to({}, { duration: 5.0 });

          // ── SECTION 7 SLIDE UP (Reviews remains normal/no scale down) ──
          tl.addLabel("sec7Start")
            .to(".section-7", { yPercent: 0, duration: 4.2 }, "sec7Start")
            .to(".s7-bg-img", { yPercent: 0, duration: 4.2 }, "sec7Start")
            .to({}, { duration: 0.2 })
            .set(".section-reviews", { display: "none" });

          // ── SECTION 8 REVEAL ──
          tl.addLabel("sec8Start")
            .set(".section-8", { display: "block" })
            .to(".section-8", { clipPath: "inset(0% 0% 0% 0%)", duration: 3.8 }, "sec8Start")
            .to(".section-7", { scale: 1.0, duration: 3.8 }, "sec8Start")
            .to(".s8-bg-img", { yPercent: 0, duration: 3.8 }, "sec8Start")
            .to({}, { duration: 0.2 });

          // ── SECTION 9 REVEAL ──
          tl.addLabel("sec9Start")
            .set(".section-7", { display: "none" })
            .set(".section-9", { display: "block" })
            .to(".s8-panel-left", { clipPath: "inset(0% 50% 100% 0%)", duration: 3.8 }, "sec9Start")
            .to(".s8-panel-right", { clipPath: "inset(100% 0% 0% 50%)", duration: 3.8 }, "sec9Start")
            .to(".s9-bg-img", { yPercent: 0, scale: 1, duration: 3.8 }, "sec9Start")
            .addLabel("sec9TitleFade")
            .to(".s9-title", { opacity: 1, duration: 2.0 }, "sec9Start+=1.2")
            .addLabel("sec9TitleMove")
            .to(".s9-title", {
              x: () => {
                const el = document.querySelector(".s9-title") as HTMLElement;
                const para = document.querySelector(".s9-para") as HTMLElement;
                if (!el || !para) return 0;
                return para.getBoundingClientRect().right - el.getBoundingClientRect().right;
              },
              y: () => {
                const el = document.querySelector(".s9-title") as HTMLElement;
                const para = document.querySelector(".s9-para") as HTMLElement;
                if (!el || !para) return 0;
                return para.getBoundingClientRect().top - 16 - el.getBoundingClientRect().bottom;
              },
              duration: 3.5,
            })
            .to(".s9-para", { opacity: 1, y: 0, duration: 2.0 }, "<+1.5")
            .to({}, { duration: 0.2 })
            .set(".section-8", { display: "none" });

          // ── CTA REVEAL ──
          tl.addLabel("ctaStart")
            .set(".section-cta", { display: "block" })
            .to(".section-cta", { yPercent: 0, duration: 4.8 }, "ctaStart")
            .to(".section-9", { scale: 1.05, duration: 4.8 }, "ctaStart")
            .to({}, { duration: 0.2 });

          // ── FOOTER REVEAL ──
          tl.addLabel("footerStart")
            .set(".footer", { display: "block" })
            .to(".footer", { yPercent: 0, duration: 5.5 }, "footerStart")
            .to(".section-9", { scale: 1.05, duration: 5.5 }, "footerStart");

          // ── REMAINING TEXT REVEALS ──
          useTextReveal(scopeRef, ".hero-secondary-para", { tl, position: "heroStart+=2.5", duration: 0.5, stagger: 0.06 });
          useTextReveal(scopeRef, ".s7-title", { tl, position: "sec7Start+=1.7", duration: 0.4, stagger: 0.05, yOffset: -10 });
          useTextReveal(scopeRef, ".s7-para", { tl, position: "sec7Start+=1.7", duration: 0.4, stagger: 0.05, yOffset: -10 });
          useTextReveal(scopeRef, ".s8-heading", { tl, position: "sec8Start+=1.9", duration: 0.4, stagger: 0.05 });
          useTextReveal(scopeRef, ".s8-para", { tl, position: "sec8Start+=1.8", duration: 0.4, stagger: 0.05 });

          const totalDuration = tl.totalDuration();
          const labelNames = [
            "heroStart", "heroExit", "textLanding", "s2InnerAnimation", "sec3Start",
            "sec10Start", "sec10TextHide", "sec10ContentReveal", "sec10ExitSequence", "sec10FinalScroll", 
            "secReviewsStart", "sec7Start", "sec8Start", "sec9Start", "sec9TitleFade", "sec9TitleMove", 
            "ctaStart", "footerStart"
          ];
          cachedProgressLabels = [0, ...labelNames.map(name => tl.labels[name] / totalDuration), 1];

          onScrollReady();
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

      if (isTouchOnly()) {
        ScrollTrigger.normalizeScroll(false);
      }

      if (scopeRef.current) {
        restoreTextReveal(
          scopeRef.current,
          [
            ".hero-secondary-para",
            ".s2-title-main", ".s2-title-sub", ".s2-body",
            ".s7-title", ".s7-para",
            ".s8-heading", ".s8-para",
          ].join(",")
        );
      }
      ctx.revert();
    };
  }, [preloaderDone]);

  return (
    <div ref={scopeRef}>
      <div className="pin-all relative h-screen w-screen overflow-hidden bg-black">
        
        <div className="section-2 absolute inset-0 h-full w-full structural-layer">
          <SectionTwo />
        </div>
        <div className="section-3 absolute inset-0 h-full w-full structural-layer">
          <SectionThree />
        </div>
        <div className="section-10 absolute inset-0 h-full w-full structural-layer">
          <SectionTen />
        </div>

        <div className="section-reviews absolute inset-0 h-full w-full structural-layer">
          <SectionReviews />
        </div>

        <div className="section-7 absolute inset-0 h-full w-full structural-layer">
          <SectionSeven />
        </div>
        <div className="section-9 absolute inset-0 h-full w-full structural-layer">
          <SectionNine />
        </div>
        <div className="section-8 absolute inset-0 h-full w-full structural-layer">
          <SectionEight />
        </div>
        <div className="hero absolute inset-0 h-full w-full structural-layer">
          <Hero />
        </div>
        <div className="section-cta absolute bottom-0 left-0 w-full structural-layer">
          <SectionCTA />
        </div>
        <div className="footer absolute left-0 bottom-0 w-full structural-layer">
          <Footer />
        </div>
      </div>
    </div>
  );
}