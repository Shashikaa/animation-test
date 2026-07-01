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

  const textTriggersRef = useRef({
    hero: false,
    sec10: false,
    sec7: false,
    sec8: false,
    sec9: false,
  });

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

      gsap.set(".section-3", { display: "block", clipPath: "inset(100% 0% 0% 0%)", opacity: 1, zIndex: 40, yPercent: 0 });
      
      gsap.set(".section-10", { display: "block", yPercent: 100, opacity: 1, zIndex: 60 });
      gsap.set([".s10-title", ".s10-title-sub", ".s10-para-top"], { opacity: 0 });
      
      // 🟢 FIX: Use direct viewport height 'y: "150vh"' to physically force them beneath the screen boundary on load
      gsap.set(".s10-img-right-wrap", { opacity: 1, yPercent: 0, y: "150vh", clipPath: "inset(0% 0% 0% 0%)", display: "block" });
      gsap.set(".s10-content-wrap", { opacity: 1, yPercent: 0, y: "150vh" });

      gsap.set(".section-reviews", { display: "none", clipPath: "inset(100% 0% 0% 0%)", opacity: 1, zIndex: 65 });

      gsap.set(".section-7", { display: "block", yPercent: 100, zIndex: 70 });
      gsap.set([".s7-title", ".s7-para"], { opacity: 0, y: 0 });

      gsap.set(".section-8", { display: "none", clipPath: "inset(100% 0% 0% 0%)", zIndex: 75 });
      gsap.set([".s8-heading", ".s8-para"], { opacity: 0, y: 0 });

      gsap.set(".section-9", { display: "none", opacity: 1, zIndex: 28 });
      gsap.set([".s9-title", ".s9-para-desktop", ".s9-para-mobile"], { opacity: 0, y: 0 });

      gsap.set(".section-cta", { yPercent: 100, zIndex: 95, display: "none" });
      gsap.set(".footer", { yPercent: 100, zIndex: 96, display: "none" });

      gsap.set(".hero-bg", { scale: 1.15, transformOrigin: "center center" });
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
      gsap.set(".s7-bg-img", { yPercent: 0 });
      gsap.set(".s8-bg-img", { yPercent: 20 });
      gsap.set(".s9-bg-img", { yPercent: 0, scale: 1.15 });
      gsap.set(".s8-panel-left", { clipPath: "inset(0% 50% 0% 0%)", zIndex: 85 });
      gsap.set(".s8-panel-right", { clipPath: "inset(0% 0% 0% 50%)", zIndex: 85 });
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
              end: "+=22000",
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
                      return localProgress > 0.35 ? end : start;
                    }
                  }
                  return progress;
                },
                duration: { min: 0.6, max: 1.0 },
                delay: 0.05,
                ease: "power2.inOut",
              },
            },
          });

          textTriggersRef.current = { hero: false, sec10: false, sec7: false, sec8: false, sec9: false };

          // ── HERO SCROLL OVERLAYS ──
          tl.addLabel("heroStart")
            .to(".hero h1, .hero [class*='bottom-8'], .hero-right-text", {
              opacity: 0,
              y: -30,
              duration: 2.0, 
              ease: "power1.out"
            }, "heroStart")
            
            .to(".hero-bg-wrapper", {
              clipPath: "inset(0% 8% 12% 50%)",
              duration: 4.5,
            }, "heroStart+=1.0")
            .to(".hero-bg", {
              scale: 1.0,
              duration: 4.5
            }, "heroStart+=1.0")

            .to({}, {
              duration: 0.1,
              onStart: () => {
                if (!textTriggersRef.current.hero && tl.scrollTrigger && tl.scrollTrigger.direction > 0) {
                  textTriggersRef.current.hero = true;
                  useTextReveal(scopeRef, ".hero-secondary-para", {
                    immediate: true,
                    duration: 0.5,
                    stagger: 0.06
                  });
                }
              }
            }, "heroStart+=3.0");

          // ── HERO EXIT INTO SECTION 2 ──
          tl.addLabel("heroExit")
            .set(".hero h1, .hero [class*='bottom-8'], .hero-right-text", { visibility: "hidden" }, "heroExit")
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

          // ── SECTION 2 INNER ANIMATION & SNAP REGISTRATION ──
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
            
            .addLabel("s2InnerMidpoint", "s2InnerAnimation+=1.0")
            .to(".s2-scroll-content", {
              yPercent: 0,
              opacity: 1,
              duration: 5.0,
              ease: "power2.out"
            }, "s2InnerAnimation+=1.0")
            
            .addLabel("s2InnerSplitReveal", "s2InnerAnimation+=3.5")
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
            .to(".section-3 .s3-services-nav", { x: 0, opacity: 1, duration: 2.5, ease: "power2.out" }, "sec3Start+=1.8")
            .to(".section-3 .s3-text-content-wrapper", { opacity: 1, y: 0, duration: 2.0, ease: "power2.out" }, "sec3Start+=2.0")
            .set([".section-2", ".hero"], { display: "none" }, "sec3Start+=5.0");

          // ── SECTION 3 TO 10 SLIDE UP ──
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
            
            // 🟢 FORCE DOWN: Ensure these remain strictly at y: "100vh" while the first stage text is appearing
            .set([".s10-content-wrap", ".s10-img-right-wrap"], { opacity: 1, yPercent: 0, y: "100vh" }, "sec10Start")
            
            .to({}, {
              duration: 0.1,
              onStart: () => {
                if (!textTriggersRef.current.sec10 && tl.scrollTrigger && tl.scrollTrigger.direction > 0) {
                  textTriggersRef.current.sec10 = true;
                  gsap.set([".s10-title", ".s10-title-sub", ".s10-para-top"], { opacity: 1 });
                  useTextReveal(scopeRef, ".s10-title", { duration: 0.5, stagger: 0.05 });
                  useTextReveal(scopeRef, ".s10-title-sub", { duration: 0.4, stagger: 0.04 });
                  useTextReveal(scopeRef, ".s10-para-top", { duration: 0.5, stagger: 0.03 });
                }
              }
            }, "sec10Start+=3.0")

            .addLabel("sec10TextHide", "sec10Start+=6.0")
            .to([".s10-title", ".s10-title-sub", ".s10-para-top"], {
              opacity: 0,
              y: -100,
              duration: 2.0,
              stagger: 0.03,
              ease: "power2.in"
            }, "sec10TextHide")
            
            .addLabel("sec10ContentReveal", "sec10TextHide+=0.2")
            // 🟢 PURE SCROLL SLIDE: Smoothly slide up from 150vh into view at 0 position with opacity locked to 1
            .fromTo([".s10-content-wrap", ".s10-img-right-wrap"], 
              { opacity: 1, y: "150vh" },
              {
                opacity: 1,
                y: 0,
                duration: 6.5,
                stagger: 0.15,
                ease: "power2.out"
              }, 
              "sec10ContentReveal"
            )
            
            .addLabel("sec10ExitSequence", "sec10ContentReveal+=5.0")
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
            .addLabel("sec10FinalScroll", "sec10ExitSequence+=5.5");

          // ── SECTION 10 TO CUSTOMER REVIEWS WIPE ──
          tl.addLabel("secReviewsStart", "sec10FinalScroll")
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
            .set(".section-10", { display: "none" }, "secReviewsStart+=6.0");

          // ── SECTION 7 SLIDE UP ──
          tl.addLabel("sec7Start", "secReviewsStart+=6.0")
            .to(".section-7", { yPercent: 0, duration: 4.5 }, "sec7Start")
            .to(".s7-bg-img", { yPercent: 0, duration: 4.5 }, "sec7Start")
            .to({}, {
              duration: 0.1,
              onStart: () => {
                if (!textTriggersRef.current.sec7 && tl.scrollTrigger && tl.scrollTrigger.direction > 0) {
                  textTriggersRef.current.sec7 = true;
                  gsap.set([".s7-title", ".s7-para"], { opacity: 1 });
                  useTextReveal(scopeRef, ".s7-title", { duration: 0.4, stagger: 0.05 });
                  useTextReveal(scopeRef, ".s7-para", { duration: 0.4, stagger: 0.05 });
                }
              }
            }, "sec7Start+=1.5")
            .set(".section-reviews", { display: "none" }, "sec7Start+=4.5");

          // ── SECTION 8 REVEAL OVER SECTION 7 ──
          tl.addLabel("sec8Start", "sec7Start+=4.5")
            .set(".section-8", { display: "block" })
            .fromTo(".section-8", 
              { clipPath: "inset(100% 0% 0% 0%)" },
              { clipPath: "inset(0% 0% 0% 0%)", duration: 5.5, ease: "power2.inOut" }, 
              "sec8Start"
            )
            .to(".section-7", { scale: 1, duration: 5.5, ease: "power2.inOut" }, "sec8Start")
            .to(".s8-bg-img", { yPercent: 0, duration: 5.5 }, "sec8Start")
            
            .to({}, {
              duration: 0.1,
              onStart: () => {
                if (!textTriggersRef.current.sec8 && tl.scrollTrigger && tl.scrollTrigger.direction > 0) {
                  textTriggersRef.current.sec8 = true;
                  gsap.set([".s8-heading", ".s8-para"], { opacity: 1 });
                  useTextReveal(scopeRef, ".s8-heading", { duration: 0.4, stagger: 0.05 });
                  useTextReveal(scopeRef, ".s8-para", { duration: 0.4, stagger: 0.05 });
                }
              }
            }, "sec8Start+=3.0");

          // ── SECTION 9 REVEAL ──
          tl.addLabel("sec9Start", "sec8Start+=5.5")
            .set(".section-7", { display: "none" })
            .set(".section-9", { display: "block" })
            .to(".s8-panel-left", { clipPath: "inset(0% 50% 100% 0%)", duration: 3.8 }, "sec9Start")
            .to(".s8-panel-right", { clipPath: "inset(100% 0% 0% 50%)", duration: 3.8 }, "sec9Start")
            .to(".s9-bg-img", { yPercent: 0, scale: 1, duration: 3.8 }, "sec9Start")
            
            .addLabel("sec9TitleFade", "sec9Start+=1.2")
            .to(".s9-title", { opacity: 1, duration: 2.0 }, "sec9TitleFade")
            
            .addLabel("sec9TitleMove", "sec9TitleFade+2.0")
            .to(".s9-title", {
              x: () => {
                const el = document.querySelector(".s9-title") as HTMLElement;
                const para = document.querySelector(".s9-para-desktop") as HTMLElement;
                if (!el || !para) return 0;
                return para.getBoundingClientRect().right - el.getBoundingClientRect().right;
              },
              y: () => {
                const el = document.querySelector(".s9-title") as HTMLElement;
                const para = document.querySelector(".s9-para-desktop") as HTMLElement;
                if (!el || !para) return 0;
                return para.getBoundingClientRect().top - 24 - el.getBoundingClientRect().bottom;
              },
              duration: 3.5,
            }, "sec9TitleMove")
            
            .to({}, {
              duration: 0.1,
              onStart: () => {
                if (!textTriggersRef.current.sec9 && tl.scrollTrigger && tl.scrollTrigger.direction > 0) {
                  textTriggersRef.current.sec9 = true;
                  gsap.set([".s9-para-desktop", ".s9-para-mobile"], { opacity: 1 });
                  useTextReveal(scopeRef, ".s9-para-desktop", { duration: 0.4, stagger: 0.04 });
                  useTextReveal(scopeRef, ".s9-para-mobile", { static: true });
                }
              }
            }, "sec9TitleMove+=3.5")
            .set(".section-8", { display: "none" }, "sec9TitleMove+=3.5");

          // ── CTA REVEAL ──
          tl.addLabel("ctaStart", "sec9TitleMove+=4.5")
            .set(".section-cta", { display: "block" })
            .to(".section-cta", { yPercent: 0, duration: 4.8 }, "ctaStart")
            .to(".section-9", { scale: 1.05, duration: 4.8 }, "ctaStart");

          // ── FOOTER REVEAL ──
          tl.addLabel("footerStart", "ctaStart+=4.8")
            .set(".footer", { display: "block" })
            .to(".footer", { yPercent: 0, duration: 5.5 }, "footerStart")
            .to(".section-9", { scale: 1.05, duration: 5.5 }, "footerStart")
            .to(".section-cta .cta-inner-desktop", { opacity: 0, duration: 4.0, ease: "power1.out" }, "footerStart");

          const totalDuration = tl.totalDuration();
          const labelNames = [
            "heroStart", "heroExit", "textLanding", "s2InnerAnimation", "s2InnerMidpoint", "s2InnerSplitReveal", "sec3Start",
            "sec10Start", "sec10TextHide", "sec10ContentReveal", "sec10ExitSequence", "sec10FinalScroll", 
            "secReviewsStart", "sec7Start", "sec8Start", "sec9Start", 
            "sec9TitleFade", "sec9TitleMove", "ctaStart", "footerStart"
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
            ".s10-title", ".s10-title-sub", ".s10-para-top",
            ".s7-title", ".s7-para",
            ".s8-heading", ".s8-para",
            ".s9-para-desktop", ".s9-para-mobile"
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