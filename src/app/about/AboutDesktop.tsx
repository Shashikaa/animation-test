"use client";

import Hero from "@/src/components/About/Hero";
import SectionOne from "@/src/components/About/SectionOne";
import SectionTwo from "@/src/components/About/SectionTwo";
import SectionThree from "@/src/components/About/SectionThree";
import SectionFour from "@/src/components/About/SectionFour";
import SectionFive from "@/src/components/About/SectionFive";
import SectionCTA from "@/src/components/SectionCTA";
import Footer from "@/src/components/Footer";
import { useState, useRef, useEffect } from "react";
import { useSite } from "@/src/app/context/SiteContext";
import { useHeroIntro } from "@/src/app/utils/useHeroIntro";
import { useTextReveal, restoreTextReveal } from "@/src/app/utils/useTextReveal";

const TOTAL_SCROLL_STEPS = 12;
const easeOutQuad = (t: number) => t * (2 - t);
const easeInOutQuad = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

export default function AboutDesktop() {
  const [isSectionFiveActive, setIsSectionFiveActive] = useState(false);
  const scopeRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fixedFrameRef = useRef<HTMLDivElement>(null);
  const footerWrapRef = useRef<HTMLDivElement>(null);

  const targetProgress = useRef(0);
  const currentProgress = useRef(0);
  const isInitialized = useRef(false);
  const rafId = useRef<number | null>(null);

  const revealedSections = useRef<Set<string>>(new Set());
  const lastSec5Idx = useRef<number>(-1);

  const { smootherRef } = useSite();

  // Run desktop intro sequence
  const { introDone, preloaderDone } = useHeroIntro(scopeRef, { isMobile: false });

  // ── 1. UNLOCK SCROLL & LENIS IMMEDIATELY UPON INTRO READY ──
  useEffect(() => {
    const lenis = smootherRef?.current;

    if (!preloaderDone || !introDone) {
      if (lenis && typeof lenis.stop === "function") lenis.stop();
      window.scrollTo(0, 0);
      targetProgress.current = 0;
      currentProgress.current = 0;

      if (fixedFrameRef.current) {
        fixedFrameRef.current.style.position = "fixed";
        fixedFrameRef.current.style.top = "0px";
        fixedFrameRef.current.style.bottom = "auto";
      }
    } else {
      if (lenis && typeof lenis.start === "function") {
        lenis.start();
      }
      // Trigger instant scroll update to prevent first-scroll lag
      window.dispatchEvent(new Event("scroll"));
    }
  }, [preloaderDone, introDone, smootherRef]);

  const triggerPlayOnceTextReveal = (
    containerSelector: string,
    currentStepProg: number,
    triggerThreshold: number
  ) => {
    if (!scopeRef.current) return;

    const key = containerSelector;
    if (revealedSections.current.has(key)) return;

    if (currentStepProg >= triggerThreshold) {
      revealedSections.current.add(key);

      const lineInners = scopeRef.current.querySelectorAll<HTMLElement>(
        `${containerSelector} .gs-line-inner`
      );

      lineInners.forEach((el, idx) => {
        el.style.transition = `transform 0.85s cubic-bezier(0.16, 1, 0.3, 1) ${
          idx * 0.08
        }s, opacity 0.85s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 0.08}s`;
        el.style.transform = "translate3d(0, 0%, 0) rotateZ(0deg)";
        el.style.opacity = "1";
      });
    }
  };

  useEffect(() => {
    if (!preloaderDone || !introDone || !scopeRef.current) return;

    useTextReveal(scopeRef, ".about-section-one .reveal-text");
    useTextReveal(scopeRef, ".about-section-two .reveal-text");
    useTextReveal(scopeRef, ".about-section-three .reveal-text");
    useTextReveal(scopeRef, ".about-section-four .reveal-text");

    return () => {
      if (scopeRef.current) {
        restoreTextReveal(
          scopeRef.current,
          [
            ".about-section-one .reveal-text",
            ".about-section-two .reveal-text",
            ".about-section-three .reveal-text",
            ".about-section-four .reveal-text",
          ].join(",")
        );
      }
    };
  }, [introDone, preloaderDone]);

  useEffect(() => {
    if (!preloaderDone || !introDone) return;

    const heroLeft = scopeRef.current?.querySelector<HTMLElement>(".about-hero-panel-left");
    const heroRight = scopeRef.current?.querySelector<HTMLElement>(".about-hero-panel-right");
    const heroBgs = scopeRef.current?.querySelectorAll<HTMLElement>(".about-hero-bg");

    // 🔥 PRE-WARM GPU COMPOSITING LAYERS TO PREVENT 1ST-SECOND LAG
    if (heroLeft) {
      heroLeft.style.willChange = "clip-path, transform";
      heroLeft.style.transform = "translate3d(0,0,0)";
    }
    if (heroRight) {
      heroRight.style.willChange = "clip-path, transform";
      heroRight.style.transform = "translate3d(0,0,0)";
    }
    heroBgs?.forEach((bg) => {
      bg.style.willChange = "transform";
      bg.style.transform = "translate3d(0,0,0) scale(1.15)";
    });

    const triggerSec5Hook = (nextIdx: number) => {
      if (nextIdx !== lastSec5Idx.current) {
        lastSec5Idx.current = nextIdx;
        if ((window as any)._sec5GoTo) {
          (window as any)._sec5GoTo(nextIdx);
        }
      }
    };

    const updatePhysics = () => {
      if (!isInitialized.current) {
        currentProgress.current = targetProgress.current;
        isInitialized.current = true;
      } else {
        currentProgress.current += (targetProgress.current - currentProgress.current) * 0.08;
      }

      const progress = currentProgress.current;
      const stepProgress = progress * (TOTAL_SCROLL_STEPS - 1);
      const vh = window.innerHeight;

      const secTwo = scopeRef.current?.querySelector<HTMLElement>(".about-section-two");
      const secThree = scopeRef.current?.querySelector<HTMLElement>(".about-section-three");
      const secFour = scopeRef.current?.querySelector<HTMLElement>(".about-section-four");
      const s4GlassCard = scopeRef.current?.querySelector<HTMLElement>(".s4-glass-card");
      const secFive = scopeRef.current?.querySelector<HTMLElement>(".about-section-five");
      const s5Bg = scopeRef.current?.querySelector<HTMLElement>(".s5-bg");
      const secCta = scopeRef.current?.querySelector<HTMLElement>(".about-section-cta");
      const ctaInner = scopeRef.current?.querySelector<HTMLElement>(".cta-inner-desktop");
      const footerWrap = scopeRef.current?.querySelector<HTMLElement>(".about-footer-wrap");

      // ── STEP 0 -> 1: HERO CURTAIN SPLIT ──
      const s1Prog = easeInOutQuad(Math.min(Math.max(stepProgress - 0, 0), 1));

      if (heroLeft && heroRight) {
        const clipVal = s1Prog * 100;
        const leftInset = `inset(0% 50% ${clipVal}% 0%)`;
        const rightInset = `inset(${clipVal}% 0% 0% 50%)`;

        heroLeft.style.clipPath = leftInset;
        (heroLeft.style as any).webkitClipPath = leftInset;

        heroRight.style.clipPath = rightInset;
        (heroRight.style as any).webkitClipPath = rightInset;
      }

      if (heroBgs && heroBgs.length > 0) {
        const scaleVal = 1.15 - s1Prog * 0.15;
        heroBgs.forEach((bg) => {
          bg.style.transform = `translate3d(0,0,0) scale(${scaleVal})`;
        });
      }

      triggerPlayOnceTextReveal(".about-section-one", stepProgress, 0.4);

      // ── STEP 1.2 -> 2.2: SECTION TWO ──
      const s2Prog = easeInOutQuad(Math.min(Math.max(stepProgress - 1.2, 0), 1));
      if (secTwo) {
        secTwo.style.visibility = "visible";
        secTwo.style.transform = `translate3d(0, ${(1 - s2Prog) * 100}%, 0)`;
      }
      triggerPlayOnceTextReveal(".about-section-two", stepProgress, 1.8);

      // ── STEP 2.4 -> 3.4: SECTION THREE ──
      const s3Prog = easeInOutQuad(Math.min(Math.max(stepProgress - 2.4, 0), 1));
      if (secThree) {
        secThree.style.visibility = "visible";
        const clipInset = (1 - s3Prog) * 100;
        const insetStr = `inset(${clipInset}% 0% 0% 0%)`;
        secThree.style.clipPath = insetStr;
        (secThree.style as any).webkitClipPath = insetStr;
      }
      triggerPlayOnceTextReveal(".about-section-three", stepProgress, 3.0);

      // ── STEP 3.6 -> 4.6: SECTION FOUR ──
      const s4Prog = easeInOutQuad(Math.min(Math.max(stepProgress - 3.6, 0), 1));
      if (secFour) {
        secFour.style.visibility = "visible";
        const clipInset = (1 - s4Prog) * 100;
        const insetStr = `inset(${clipInset}% 0% 0% 0%)`;
        secFour.style.clipPath = insetStr;
        (secFour.style as any).webkitClipPath = insetStr;
      }
      if (s4GlassCard) {
        const glassProg = Math.min(Math.max((stepProgress - 4.0) / 0.6, 0), 1);
        s4GlassCard.style.opacity = `${glassProg}`;
        s4GlassCard.style.transform = `translate3d(0, ${(1 - glassProg) * 40}px, 0)`;
      }
      triggerPlayOnceTextReveal(".about-section-four", stepProgress, 4.2);

      // ── STEP 4.8 -> 5.8: SECTION FIVE ──
      const s5Prog = easeInOutQuad(Math.min(Math.max(stepProgress - 4.8, 0), 1));
      if (secFive) {
        secFive.style.visibility = "visible";
        secFive.style.transform = `translate3d(0, ${(1 - s5Prog) * 100}%, 0)`;
      }

      if (stepProgress >= 5.5 && stepProgress < 8.2) {
        setIsSectionFiveActive(true);
        const sec5SubProgress = (stepProgress - 5.5) / 2.7;

        if (sec5SubProgress < 0.33) {
          triggerSec5Hook(0);
        } else if (sec5SubProgress < 0.66) {
          triggerSec5Hook(1);
        } else {
          triggerSec5Hook(2);
        }
      } else {
        if (stepProgress < 5.5) {
          setIsSectionFiveActive(false);
          triggerSec5Hook(0);
        }
      }

      if (s5Bg) {
        const parallaxProg = Math.min(Math.max((stepProgress - 4.8) / 3.4, 0), 1);
        s5Bg.style.transform = `translate3d(0, ${-parallaxProg * 50}%, 0)`;
      }

      // ── STEP 8.2 -> 9.4: CTA ──
      const ctaProg = easeOutQuad(Math.min(Math.max(stepProgress - 8.2, 0), 1));
      if (secCta) {
        secCta.style.visibility = "visible";
        secCta.style.transform = `translate3d(0, ${(1 - ctaProg) * 100}%, 0)`;
      }

      if (ctaInner) {
        const fadeProg = Math.min(Math.max((stepProgress - 9.2) / 0.6, 0), 1);
        ctaInner.style.opacity = `${1 - fadeProg}`;
        ctaInner.style.transform = `translate3d(0, ${-fadeProg * 40}px, 0)`;
      }

      // ── STEP 9.8 -> 11.0: FOOTER ──
      const footerHeight = footerWrapRef.current ? footerWrapRef.current.offsetHeight : vh;
      const footerRawProg = Math.min(Math.max((stepProgress - 9.8) / 1.2, 0), 1);
      const footerProg = easeOutQuad(footerRawProg);

      if (footerWrap) {
        footerWrap.style.visibility = "visible";
        const footerY = (1 - footerProg) * footerHeight;
        footerWrap.style.transform = `translate3d(0, ${footerY}px, 0)`;
      }

      rafId.current = requestAnimationFrame(updatePhysics);
    };

    const handleScroll = () => {
      if (!trackRef.current || !fixedFrameRef.current) return;

      const trackRect = trackRef.current.getBoundingClientRect();
      const vh = window.innerHeight;
      const totalScrollable = trackRect.height - vh;

      if (totalScrollable <= 0) return;

      if (trackRect.top <= 0 && trackRect.bottom >= vh) {
        fixedFrameRef.current.style.position = "fixed";
        fixedFrameRef.current.style.top = "0px";
        fixedFrameRef.current.style.bottom = "auto";
      } else if (trackRect.bottom < vh) {
        fixedFrameRef.current.style.position = "absolute";
        fixedFrameRef.current.style.top = "auto";
        fixedFrameRef.current.style.bottom = "0px";
      } else {
        fixedFrameRef.current.style.position = "absolute";
        fixedFrameRef.current.style.top = "0px";
        fixedFrameRef.current.style.bottom = "auto";
      }

      const currentScroll = Math.max(0, -trackRect.top);
      targetProgress.current = Math.min(Math.max(currentScroll / totalScrollable, 0), 1);
    };

    handleScroll();
    rafId.current = requestAnimationFrame(updatePhysics);

    const lenis = smootherRef?.current;
    if (lenis) {
      lenis.on("scroll", handleScroll);
    } else {
      window.addEventListener("scroll", handleScroll, { passive: true });
    }

    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
      if (lenis) {
        lenis.off("scroll", handleScroll);
      } else {
        window.removeEventListener("scroll", handleScroll);
      }
      // Clean up GPU hints
      if (heroLeft) heroLeft.style.willChange = "";
      if (heroRight) heroRight.style.willChange = "";
      heroBgs?.forEach((bg) => (bg.style.willChange = ""));
    };
  }, [introDone, preloaderDone, smootherRef]);

  return (
    <div ref={scopeRef}>
      <div
        ref={trackRef}
        className="about-track-container relative w-full"
        style={{ height: `${TOTAL_SCROLL_STEPS * 100}vh` }}
      >
        <div
          ref={fixedFrameRef}
          className="about-pin fixed top-0 left-0 h-[100svh] w-full overflow-hidden bg-[#162D24] z-10"
        >
          {/* SECTION ONE */}
          <div
            className="about-section-one absolute inset-0 h-full w-full structural-layer bg-[#162D24]"
            style={{ zIndex: 10 }}
          >
            <SectionOne />
          </div>

          {/* HERO COMPONENT */}
          <div
            className="absolute inset-0 h-full w-full structural-layer"
            style={{ zIndex: 20 }}
          >
            <Hero isMobile={false} />
          </div>

          {/* SECTION TWO */}
          <div
            className="about-section-two absolute inset-0 h-full w-full structural-layer"
            style={{ zIndex: 30, visibility: "hidden", transform: "translate3d(0, 100%, 0)" }}
          >
            <SectionTwo />
          </div>

          {/* SECTION THREE */}
          <div
            className="about-section-three absolute inset-0 h-full w-full structural-layer"
            style={{ zIndex: 40, visibility: "hidden", clipPath: "inset(100% 0% 0% 0%)", WebkitClipPath: "inset(100% 0% 0% 0%)" }}
          >
            <SectionThree />
          </div>

          {/* SECTION FOUR */}
          <div
            className="about-section-four absolute inset-0 h-full w-full structural-layer"
            style={{ zIndex: 50, visibility: "hidden", clipPath: "inset(100% 0% 0% 0%)", WebkitClipPath: "inset(100% 0% 0% 0%)" }}
          >
            <SectionFour />
          </div>

          {/* SECTION FIVE */}
          <div
            className="about-section-five absolute inset-0 h-full w-full structural-layer"
            style={{ zIndex: 60, visibility: "hidden", transform: "translate3d(0, 100%, 0)" }}
          >
            <SectionFive isActive={isSectionFiveActive} />
          </div>

          {/* SECTION CTA */}
          <div
            className="about-section-cta absolute bottom-0 left-0 w-full structural-layer"
            style={{ zIndex: 90, visibility: "hidden", transform: "translate3d(0, 100%, 0)" }}
          >
            <SectionCTA />
          </div>

          {/* FOOTER WRAP */}
          <div
            ref={footerWrapRef}
            className="about-footer-wrap absolute left-0 bottom-0 w-full structural-layer"
            style={{ zIndex: 100, visibility: "hidden", transform: "translate3d(0, 100%, 0)" }}
          >
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}