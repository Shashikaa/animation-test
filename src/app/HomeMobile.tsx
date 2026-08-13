"use client";

import { useRef, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import Hero from "../components/Home/Hero";
import SectionTwo from "../components/Home/SectionTwo";
import Footer from "../components/Footer";
import { useSite } from "./context/SiteContext";
import { useHeroIntro } from "@/src/app/utils/useHeroIntro";

const SectionSeven = dynamic(() => import("../components/Home/Sectionseven"), { ssr: false });
const SectionEight = dynamic(() => import("../components/Home/Sectioneight"), { ssr: false });
const SectionNine = dynamic(() => import("../components/Home/SectionNine"), { ssr: false });
const SectionTen = dynamic(() => import("../components/Home/SectionTen"), { ssr: false });
const Appsection = dynamic(() => import("../components/Appsection"), { ssr: false });

const clamp = (val: number, min = 0, max = 1) => Math.min(Math.max(val, min), max);

function executeInlineSplitting(selector: string) {
  if (typeof document === "undefined") return;
  const element = document.querySelector(selector) as HTMLElement;
  if (!element || element.dataset.splitComplete === "true") return;

  const rawText = element.textContent || "";
  const linesArray = rawText.split("\n").map((line) => line.trim()).filter((line) => line.length > 0);

  element.innerHTML = "";
  linesArray.forEach((lineText) => {
    const wrapper = document.createElement("span");
    wrapper.className = "custom-line-wrap";
    wrapper.style.display = "block";
    wrapper.style.overflow = "hidden";
    wrapper.style.position = "relative";

    const inner = document.createElement("span");
    inner.className = "custom-line-inner";
    inner.style.display = "block";
    inner.textContent = lineText;

    wrapper.appendChild(inner);
    element.appendChild(wrapper);
  });

  element.dataset.splitComplete = "true";
}

export default function HomeMobile() {
  const scopeRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fixedFrameRef = useRef<HTMLDivElement>(null);

  const heroPanelRef = useRef<HTMLDivElement>(null);
  const sec2Ref = useRef<HTMLDivElement>(null);
  const sec8Ref = useRef<HTMLDivElement>(null);
  const sec10Ref = useRef<HTMLDivElement>(null);
  const sec7Ref = useRef<HTMLDivElement>(null);
  const appSecRef = useRef<HTMLDivElement>(null);
  const sec9Ref = useRef<HTMLDivElement>(null);
  const footerLayerRef = useRef<HTMLDivElement>(null);

  const scrollMetricsRef = useRef({ totalScrollable: 0, vh: 0, trackTopOffset: 0 });
  const targetProgress = useRef(0);
  const rafId = useRef<number | null>(null);

  const domCache = useRef<Record<string, HTMLElement | NodeListOf<HTMLElement> | null>>({});

  const { smootherRef } = useSite();
  const { preloaderDone, shouldLoadRest } = useHeroIntro(scopeRef, {
    isMobile: true,
    introDurationMs: 2800,
    unlockScrollEarlyMs: 1800,
  });

  useEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  // 1. UNLOCK LENIS & INITIALIZE
  useEffect(() => {
    const lenis = smootherRef?.current;

    if (!preloaderDone || !shouldLoadRest) {
      if (lenis && typeof lenis.stop === "function") lenis.stop();
      targetProgress.current = 0;
    } else {
      document.body.classList.remove("preloading");
      document.documentElement.classList.remove("preloading");

      if (lenis) {
        if (typeof lenis.resize === "function") lenis.resize();
        if (typeof lenis.start === "function") lenis.start();
      }

      requestAnimationFrame(() => {
        window.dispatchEvent(new Event("scroll"));
      });
    }
  }, [preloaderDone, shouldLoadRest, smootherRef]);

  useEffect(() => {
    if (!shouldLoadRest) return;
    executeInlineSplitting(".hero-title");
    executeInlineSplitting(".hero-right-text");
    executeInlineSplitting(".hero-secondary-para");

    if (scopeRef.current) {
      const heroRightWrap = scopeRef.current.querySelector(".hero-right-text-wrap") as HTMLElement;
      const heroSecWrap = scopeRef.current.querySelector(".hero-secondary-text-wrap") as HTMLElement;

      if (heroRightWrap) {
        heroRightWrap.style.visibility = "hidden";
        heroRightWrap.style.opacity = "0";
      }
      if (heroSecWrap) {
        heroSecWrap.style.visibility = "hidden";
        heroSecWrap.style.opacity = "0";
      }
    }
  }, [shouldLoadRest]);

  // 2. CACHE METRICS
  const updateMetrics = useCallback(() => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const vh = window.innerHeight;
    scrollMetricsRef.current = {
      totalScrollable: rect.height - vh,
      vh,
      trackTopOffset: window.scrollY + rect.top,
    };

    if (scopeRef.current) {
      domCache.current = {
        heroBg: scopeRef.current.querySelector(".hero-bg") as HTMLElement,
        progressFill: scopeRef.current.querySelector(".hero-progress-bar-fill") as HTMLElement,
        heroLeftInitial: scopeRef.current.querySelector(".hero-left-initial") as HTMLElement,
        heroTitleInners: scopeRef.current.querySelectorAll<HTMLElement>(".hero-title .custom-line-inner"),
        heroRightWrap: scopeRef.current.querySelector(".hero-right-text-wrap") as HTMLElement,
        heroRightInners: scopeRef.current.querySelectorAll<HTMLElement>(".hero-right-text .custom-line-inner"),
        heroSecWrap: scopeRef.current.querySelector(".hero-secondary-text-wrap") as HTMLElement,
        heroSecInners: scopeRef.current.querySelectorAll<HTMLElement>(".hero-secondary-para .custom-line-inner"),
        heroControls: scopeRef.current.querySelectorAll<HTMLElement>(".hero-contact-btn, .hero-scroll-indicator, .hero-progress-wrapper"),
        s2Titles: scopeRef.current.querySelectorAll<HTMLElement>(".s2-title-main, .s2-title-sub, .s2-body"),
        s2ScrollWrap: scopeRef.current.querySelector(".s2-mob-scroll-wrapper") as HTMLElement,
        s2Clip1: scopeRef.current.querySelector(".s2-mob-clip-bg-1") as HTMLElement,
        s2Clip2: scopeRef.current.querySelector(".s2-mob-clip-bg-2") as HTMLElement,
        s2Clip3: scopeRef.current.querySelector(".s2-mob-clip-bg-3") as HTMLElement,
        s8BgImg: scopeRef.current.querySelector(".s8-bg-img") as HTMLElement,
        s8MobBg: scopeRef.current.querySelector(".s8-mob-bg") as HTMLElement,
        s10HeaderEls: scopeRef.current.querySelectorAll<HTMLElement>(".s10-title, .s10-title-sub, .s10-para-top"),
        s10ScrollContainer: scopeRef.current.querySelector(".s10-scrollable-container") as HTMLElement,
        s7BgImg: scopeRef.current.querySelector(".s7-bg-img") as HTMLElement,
        s7MobBg: scopeRef.current.querySelector(".s7-mob-bg") as HTMLElement,
        s9BgImg: scopeRef.current.querySelector(".s9-bg-img") as HTMLElement,
      };
    }
  }, []);

  useEffect(() => {
    if (!shouldLoadRest) return;
    updateMetrics();
    window.addEventListener("resize", updateMetrics, { passive: true });
    return () => window.removeEventListener("resize", updateMetrics);
  }, [shouldLoadRest, updateMetrics]);

  // 3. GPU-ACCELERATED RENDER LOOP
  useEffect(() => {
    if (!shouldLoadRest) return;

    const render = () => {
      const currentProg = targetProgress.current;
      // Expanded totalSteps from 9.0 to 9.8 to give Sec 2 equal scroll distance/speed
      const totalSteps = 9.8;
      const stepProgress = currentProg * totalSteps;
      const { vh } = scrollMetricsRef.current;
      const cache = domCache.current;

      // ── Step 0 -> 1: HERO ANIMATIONS ──
      const heroProg = clamp(stepProgress);
      const progressFill = cache.progressFill as HTMLElement;
      const heroBg = cache.heroBg as HTMLElement;
      const heroLeftInitial = cache.heroLeftInitial as HTMLElement;
      const heroTitleInners = cache.heroTitleInners as NodeListOf<HTMLElement>;
      const heroRightWrap = cache.heroRightWrap as HTMLElement;
      const heroRightInners = cache.heroRightInners as NodeListOf<HTMLElement>;
      const heroSecWrap = cache.heroSecWrap as HTMLElement;
      const heroSecInners = cache.heroSecInners as NodeListOf<HTMLElement>;

      if (heroBg) heroBg.style.transform = `scale(${1.0 + heroProg * 0.08})`;
      if (progressFill) progressFill.style.transform = `scaleY(${heroProg})`;

      const titleFade = clamp(heroProg / 0.4);
      if (heroTitleInners) {
        heroTitleInners.forEach((el) => {
          el.style.opacity = `${(1 - titleFade).toFixed(2)}`;
          el.style.transform = `translate3d(0, ${-20 * titleFade}px, 0)`;
        });
      }

      if (heroLeftInitial) heroLeftInitial.style.visibility = heroProg >= 0.4 ? "hidden" : "visible";

      const rightIn = clamp((heroProg - 0.2) / 0.4);
      const rightOut = clamp((heroProg - 0.6) / 0.4);

      if (heroRightWrap) {
        heroRightWrap.style.visibility = heroProg >= 0.2 && heroProg < 0.8 ? "visible" : "hidden";
        heroRightWrap.style.opacity = `${(rightIn * (1 - rightOut)).toFixed(2)}`;
      }

      if (heroRightInners) {
        heroRightInners.forEach((el) => {
          el.style.opacity = `${(rightIn * (1 - rightOut)).toFixed(2)}`;
          el.style.transform = `translate3d(0, ${(1 - rightIn) * 40 - rightOut * 20}px, 0)`;
        });
      }

      const secIn = clamp((heroProg - 0.6) / 0.4);
      if (heroSecWrap) {
        heroSecWrap.style.visibility = secIn > 0 ? "visible" : "hidden";
        heroSecWrap.style.opacity = `${secIn.toFixed(2)}`;
      }
      if (heroSecInners) {
        heroSecInners.forEach((el) => {
          el.style.opacity = `${secIn.toFixed(2)}`;
          el.style.transform = `translate3d(0, ${(1 - secIn) * 100}%, 0)`;
        });
      }

      // ── Step 1 -> 2: SECTION TWO SLIDES UP ──
      const s2Prog = clamp(stepProgress - 1.0);
      if (sec2Ref.current) sec2Ref.current.style.transform = `translate3d(0, ${(1 - s2Prog) * 100}%, 0)`;
      if (heroPanelRef.current && s2Prog > 0) heroPanelRef.current.style.transform = `translate3d(0, ${-s2Prog * 15}%, 0)`;

      // ── Step 2 -> 4.0: SECTION TWO INNER ANIMATIONS (MATCHED SPEED WITH SUB-SERVICES) ──
      // Expanded step window from 1.2 to 2.0 (Step 2.0 -> Step 4.0)
      const s2InnerProg = clamp((stepProgress - 2.0) / 2.0);
      const s2Titles = cache.s2Titles as NodeListOf<HTMLElement>;
      const s2ScrollWrap = cache.s2ScrollWrap as HTMLElement;
      const s2Clip1 = cache.s2Clip1 as HTMLElement;
      const s2Clip2 = cache.s2Clip2 as HTMLElement;
      const s2Clip3 = cache.s2Clip3 as HTMLElement;

      const titleFadeOut = clamp(s2InnerProg / 0.15);
      if (s2Titles) {
        s2Titles.forEach((el) => {
          el.style.opacity = `${(1 - titleFadeOut).toFixed(2)}`;
          el.style.transform = `translate3d(0, ${-30 * titleFadeOut}px, 0)`;
        });
      }

      const scrollInProg = clamp((s2InnerProg - 0.10) / 0.90);
      if (s2ScrollWrap) {
        s2ScrollWrap.style.opacity = `${Math.min(1, scrollInProg * 2.5).toFixed(2)}`;
        s2ScrollWrap.style.transform = `translate3d(0, ${80 - s2InnerProg * 160}%, 0)`;
        s2ScrollWrap.style.pointerEvents = scrollInProg > 0.1 ? "auto" : "none";
      }

      if (s2Clip1) s2Clip1.style.opacity = clamp((s2InnerProg - 0.20) / 0.30).toFixed(2);
      if (s2Clip2) s2Clip2.style.opacity = clamp((s2InnerProg - 0.45) / 0.30).toFixed(2);
      if (s2Clip3) s2Clip3.style.opacity = clamp((s2InnerProg - 0.70) / 0.30).toFixed(2);

      // ── Step 4.0 -> 5.0: SECTION EIGHT (SHIFTED OFFSET BY +0.8) ──
      const s8Prog = clamp(stepProgress - 4.0);
      if (sec8Ref.current) {
        sec8Ref.current.style.transform = `translate3d(0, ${(1 - s8Prog) * 100}%, 0)`;
        sec8Ref.current.style.opacity = `${s8Prog > 0 ? 1 : 0}`;
        sec8Ref.current.style.visibility = s8Prog > 0 ? "visible" : "hidden";
      }

      if (sec2Ref.current && s8Prog > 0) {
        sec2Ref.current.style.transform = `translate3d(0, ${-s8Prog * 15}%, 0)`;
      }

      const s8BgImg = cache.s8BgImg as HTMLElement;
      const s8MobBg = cache.s8MobBg as HTMLElement;
      if (s8BgImg) s8BgImg.style.transform = `translate3d(0, ${(1 - s8Prog) * 20}%, 0)`;
      if (s8MobBg) s8MobBg.style.transform = `scale(${1.35 - s8Prog * 0.35})`;

      // ── Step 5.0 -> 6.0: SECTION TEN ──
      let s10HeaderEls = cache.s10HeaderEls as NodeListOf<HTMLElement>;
      let s10ScrollContainer = cache.s10ScrollContainer as HTMLElement;

      if ((!s10HeaderEls || s10HeaderEls.length === 0) && sec10Ref.current) {
        s10HeaderEls = sec10Ref.current.querySelectorAll<HTMLElement>(".s10-title, .s10-title-sub, .s10-para-top");
        cache.s10HeaderEls = s10HeaderEls;
      }
      if (!s10ScrollContainer && sec10Ref.current) {
        s10ScrollContainer = sec10Ref.current.querySelector(".s10-scrollable-container") as HTMLElement;
        cache.s10ScrollContainer = s10ScrollContainer;
      }

      const s10SlideProg = clamp((stepProgress - 5.0) / 0.5);

      if (sec10Ref.current) {
        sec10Ref.current.style.transform = `translate3d(0, ${(1 - s10SlideProg) * 100}%, 0)`;
        sec10Ref.current.style.opacity = `${s10SlideProg > 0 ? 1 : 0}`;
        sec10Ref.current.style.visibility = s10SlideProg > 0 ? "visible" : "hidden";
      }

      if (sec8Ref.current && s10SlideProg > 0) {
        sec8Ref.current.style.transform = `translate3d(0, ${-s10SlideProg * 15}%, 0)`;
      }

      const s10InnerProg = clamp((stepProgress - 5.4) / 0.6);

      if (s10HeaderEls) {
        s10HeaderEls.forEach((el) => {
          el.style.transform = `translate3d(0, ${-300 * s10InnerProg}px, 0)`;
        });
      }

      if (s10ScrollContainer) {
        const containerY = 100 - s10InnerProg * 320;
        s10ScrollContainer.style.transform = `translate3d(0, ${containerY}%, 0)`;
      }

      // ── Step 6.0 -> 7.0: SECTION SEVEN ──
      const s7Prog = clamp(stepProgress - 6.0);

      if (sec7Ref.current) {
        sec7Ref.current.style.transform = `translate3d(0, ${(1 - s7Prog) * 100}%, 0)`;
        sec7Ref.current.style.opacity = `${s7Prog > 0 ? 1 : 0}`;
        sec7Ref.current.style.visibility = s7Prog > 0 ? "visible" : "hidden";
      }

      if (sec10Ref.current && s7Prog > 0) {
        sec10Ref.current.style.transform = `translate3d(0, ${-s7Prog * 15}%, 0)`;
      }

      let s7BgImg = cache.s7BgImg as HTMLElement;
      let s7MobBg = cache.s7MobBg as HTMLElement;
      if (!s7BgImg && sec7Ref.current) cache.s7BgImg = s7BgImg = sec7Ref.current.querySelector(".s7-bg-img") as HTMLElement;
      if (!s7MobBg && sec7Ref.current) cache.s7MobBg = s7MobBg = sec7Ref.current.querySelector(".s7-mob-bg") as HTMLElement;

      if (s7BgImg) s7BgImg.style.transform = `translate3d(0, ${(1 - s7Prog) * 20}%, 0)`;
      if (s7MobBg) s7MobBg.style.transform = `scale(${1.35 - s7Prog * 0.35})`;

      // ── Step 7.0 -> 8.0: APP SECTION ──
      const appProg = clamp(stepProgress - 7.0);

      if (appSecRef.current) {
        const appHeight = appSecRef.current.offsetHeight || vh;
        const startY = vh;
        const endY = -(appHeight - vh);
        const currentY = startY + (endY - startY) * appProg;
        appSecRef.current.style.transform = `translate3d(0, ${currentY}px, 0)`;
        appSecRef.current.style.opacity = `${appProg > 0 ? 1 : 0}`;
        appSecRef.current.style.visibility = appProg > 0 ? "visible" : "hidden";
      }

      if (sec7Ref.current && appProg > 0) {
        sec7Ref.current.style.transform = `translate3d(0, ${-appProg * 15}%, 0)`;
      }

      // ── Step 8.0 -> 9.0: SECTION NINE ──
      const s9Prog = clamp(stepProgress - 8.0);

      if (sec9Ref.current) {
        sec9Ref.current.style.transform = `translate3d(0, ${(1 - s9Prog) * 100}%, 0)`;
        sec9Ref.current.style.opacity = `${s9Prog > 0 ? 1 : 0}`;
        sec9Ref.current.style.visibility = s9Prog > 0 ? "visible" : "hidden";
      }

      let s9BgImg = cache.s9BgImg as HTMLElement;
      if (!s9BgImg && sec9Ref.current) cache.s9BgImg = s9BgImg = sec9Ref.current.querySelector(".s9-bg-img") as HTMLElement;
      if (s9BgImg) {
        s9BgImg.style.transform = `scale(${1.35 - s9Prog * 0.35}) translate3d(0, ${(1 - s9Prog) * 20}%, 0)`;
      }

      // ── Step 9.0 -> 9.8: FOOTER REVEAL ──
      const footerProgress = clamp((stepProgress - 9.0) / 0.8);

      if (footerLayerRef.current) {
        const footerHeight = footerLayerRef.current.offsetHeight || vh;
        const translateY = vh - footerHeight * footerProgress;
        footerLayerRef.current.style.transform = `translate3d(0, ${translateY}px, 0)`;
        footerLayerRef.current.style.opacity = `${footerProgress > 0 ? 1 : 0}`;
        footerLayerRef.current.style.visibility = footerProgress > 0 ? "visible" : "hidden";
      }
    };

    const handleScroll = (e?: any) => {
      const lenis = smootherRef?.current;
      const scrollY = e?.scroll ?? lenis?.scroll ?? window.scrollY;
      const { totalScrollable, trackTopOffset } = scrollMetricsRef.current;

      if (totalScrollable <= 0) return;

      const relativeScroll = scrollY - trackTopOffset;
      const trackBottom = relativeScroll + totalScrollable;

      if (fixedFrameRef.current) {
        if (relativeScroll >= 0 && trackBottom >= 0) {
          fixedFrameRef.current.style.position = "fixed";
          fixedFrameRef.current.style.top = "0px";
          fixedFrameRef.current.style.bottom = "auto";
        } else if (trackBottom < 0) {
          fixedFrameRef.current.style.position = "absolute";
          fixedFrameRef.current.style.top = "auto";
          fixedFrameRef.current.style.bottom = "0px";
        } else {
          fixedFrameRef.current.style.position = "absolute";
          fixedFrameRef.current.style.top = "0px";
          fixedFrameRef.current.style.bottom = "auto";
        }
      }

      targetProgress.current = clamp(relativeScroll / totalScrollable);

      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(render);
    };

    const lenis = smootherRef?.current;
    if (lenis && typeof lenis.on === "function") {
      lenis.on("scroll", handleScroll);
    } else {
      window.addEventListener("scroll", handleScroll, { passive: true });
    }

    handleScroll();
    render();

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      if (lenis && typeof lenis.off === "function") {
        lenis.off("scroll", handleScroll);
      } else {
        window.removeEventListener("scroll", handleScroll);
      }
    };
  }, [shouldLoadRest, smootherRef]);

  return (
    <div ref={scopeRef} className="relative w-full bg-black text-white">
      <style jsx global>{`
        .hero-right-text:not([data-split-complete="true"]),
        .hero-secondary-para:not([data-split-complete="true"]),
        .hero-right-text-wrap,
        .hero-secondary-text-wrap {
          opacity: 0;
          visibility: hidden;
        }
        .hero-right-text .custom-line-inner,
        .hero-secondary-para .custom-line-inner {
          opacity: 0;
          transform: translate3d(0, 100%, 0);
        }
      `}</style>

      <div
        ref={trackRef}
        className="home-track-container relative w-full"
        style={{ height: "1100vh" }}
      >
        <div
          ref={fixedFrameRef}
          className="fixed top-0 left-0 w-full overflow-hidden bg-black z-10 h-[100dvh]"
        >
          {/* Layer 1: Hero Component */}
          <div
            ref={heroPanelRef}
            className="hero absolute inset-0 w-full h-[100dvh] z-10 gpu-accelerated transform-gpu will-change-transform"
          >
            <Hero />
          </div>

          {shouldLoadRest && (
            <>
              {/* Layer 2: Section Two */}
              <div
                ref={sec2Ref}
                className="section-2 about-stack-layer absolute inset-0 w-full h-[100dvh] z-20 gpu-accelerated will-change-transform"
                style={{ transform: "translate3d(0, 100%, 0)" }}
              >
                <SectionTwo />
              </div>

              {/* Layer 3: Section Eight */}
              <div
                ref={sec8Ref}
                className="section-8 about-stack-layer absolute inset-0 w-full h-[100dvh] z-30 gpu-accelerated will-change-transform"
                style={{ transform: "translate3d(0, 100%, 0)" }}
              >
                <SectionEight />
              </div>

              {/* Layer 4: Section Ten */}
              <div
                ref={sec10Ref}
                className="section-10 about-stack-layer absolute inset-0 w-full h-[100dvh] z-40 gpu-accelerated will-change-transform"
                style={{ transform: "translate3d(0, 100%, 0)", opacity: 0, visibility: "hidden" }}
              >
                <SectionTen />
              </div>

              {/* Layer 5: Section Seven */}
              <div
                ref={sec7Ref}
                className="section-7 about-stack-layer absolute inset-0 w-full h-[100dvh] z-50 gpu-accelerated will-change-transform"
                style={{ transform: "translate3d(0, 100%, 0)", opacity: 0, visibility: "hidden" }}
              >
                <SectionSeven />
              </div>

              {/* Layer 6: App Section */}
              <div
                ref={appSecRef}
                className="section-appsec layer-auto-height gpu-accelerated absolute left-0 top-0 w-full z-[60] will-change-transform"
                style={{ transform: "translate3d(0, 100vh, 0)", opacity: 0, visibility: "hidden" }}
              >
                <Appsection />
              </div>

              {/* Layer 7: Section Nine */}
              <div
                ref={sec9Ref}
                className="section-9 about-stack-layer absolute inset-0 w-full h-[100dvh] z-[70] gpu-accelerated will-change-transform"
                style={{ transform: "translate3d(0, 100%, 0)", opacity: 0, visibility: "hidden" }}
              >
                <SectionNine />
              </div>

              {/* Layer 8: Footer */}
              <div
                ref={footerLayerRef}
                className="footer layer-auto-height gpu-accelerated absolute left-0 top-0 w-full z-[126] will-change-transform"
                style={{ transform: "translate3d(0, 100vh, 0)", opacity: 0, visibility: "hidden" }}
              >
                <Footer />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}