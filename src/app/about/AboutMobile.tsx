"use client";

import Hero from "@/src/components/About/Hero";
import SectionOne from "@/src/components/About/SectionOne";
import SectionTwo from "@/src/components/About/SectionTwo";
import SectionThree from "@/src/components/About/SectionThree";
import SectionFour from "@/src/components/About/SectionFour";
import SectionFive from "@/src/components/About/SectionFive";
import SectionCTA from "@/src/components/SectionCTA";
import { useState, useRef, useEffect, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Footer from "@/src/components/Footer";
import { useHeroIntro } from "@/src/app/utils/useHeroIntro";

gsap.registerPlugin(ScrollTrigger);

const PX_PER_MAIN_PANEL = 850;
const PX_PER_SUB_STEP = 450;
const PAUSE_PX = 150;
const BASELINE_VH = 800;

export default function AboutMobile() {
  const [isSectionFiveActive, setIsSectionFiveActive] = useState(false);
  const scopeRef = useRef<HTMLDivElement>(null);
  const lastSec5Idx = useRef<number>(-1);

  const { introDone } = useHeroIntro(scopeRef, { isMobile: true });

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(".about-hero-panel-left", { yPercent: 0, force3D: true });
      gsap.set(".about-section-one", { yPercent: 100, visibility: "visible", force3D: true });
      gsap.set(".about-section-two", { yPercent: 100, visibility: "visible", force3D: true });
      gsap.set(".about-section-three", { yPercent: 100, visibility: "visible", force3D: true });
      gsap.set(".about-section-four", { yPercent: 100, visibility: "visible", force3D: true });

      gsap.set(".about-section-five", { yPercent: 100, opacity: 1, visibility: "visible", force3D: true });
      gsap.set(".about-section-five .s5-bg", { scale: 1.25, yPercent: 0, force3D: true });

      gsap.set(".about-section-cta", { yPercent: 100, zIndex: 150, visibility: "hidden", force3D: true });
      gsap.set(
        [".about-section-cta .cta-inner-mobile", ".about-section-cta .cta-inner-desktop"],
        { opacity: 1, y: 0, pointerEvents: "auto", visibility: "visible" }
      );
      gsap.set(".about-footer-wrap", { yPercent: 100, zIndex: 160, visibility: "hidden", force3D: true });
    }, scopeRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!introDone) return;

    const isAndroid = /Android/i.test(navigator.userAgent);

    const ctx = gsap.context(() => {
      ScrollTrigger.config({ ignoreMobileResize: true });

      const ACTION = 1.4;
      const DEAD_SCROLL = 0.15;
      const SEC5_CARDS_HOLD = 1.2;
      const UNIFIED_EASE = "power1.inOut";

      const MAIN_PANELS_COUNT = 7;
      const SUB_STEPS_COUNT = 3;
      const PAUSES_COUNT = 7;

      const vh = window.innerHeight || BASELINE_VH;
      const scaleFactor = vh / BASELINE_VH;

      const DYNAMIC_SCROLL_TRACK =
        (MAIN_PANELS_COUNT * PX_PER_MAIN_PANEL +
          SUB_STEPS_COUNT * PX_PER_SUB_STEP +
          PAUSES_COUNT * PAUSE_PX) *
        scaleFactor;

      const triggerSec5Hook = (nextIdx: number) => {
        if (nextIdx !== lastSec5Idx.current) {
          lastSec5Idx.current = nextIdx;
          if ((window as any)._sec5GoTo) {
            (window as any)._sec5GoTo(nextIdx);
          }
        }
      };

      const tl = gsap.timeline({
        defaults: { ease: UNIFIED_EASE, lazy: true },
        scrollTrigger: {
          trigger: ".about-pin",
          start: "top top",
          end: `+=${DYNAMIC_SCROLL_TRACK}`,
          pin: true,
          pinType: "fixed",
          scrub: isAndroid ? 0.2 : 0.6,
          anticipatePin: 1,
          preventOverlaps: true,
          fastScrollEnd: true,
          invalidateOnRefresh: true,
          onUpdate: () => {
            const sec5Time = tl.labels["sec5FullyRevealed"];
            const ctaTime = tl.labels["ctaStart"];

            if (typeof sec5Time === "number" && typeof ctaTime === "number") {
              const currentTime = tl.time();

              if (currentTime >= sec5Time && currentTime < ctaTime) {
                const sec5Progress = (currentTime - sec5Time) / (ctaTime - sec5Time);

                if (sec5Progress < 0.33) {
                  triggerSec5Hook(0);
                } else if (sec5Progress < 0.66) {
                  triggerSec5Hook(1);
                } else {
                  triggerSec5Hook(2);
                }
              } else if (currentTime < sec5Time) {
                triggerSec5Hook(0);
              }
            }
          },
        },
      });

      // --- TRANSITION 1: Hero -> Section One ---
      tl.to(".about-section-one", { yPercent: 0, duration: ACTION })
        .to(".about-hero-bg", { scale: 1.0, yPercent: -15, duration: ACTION }, "<");

      tl.to({}, { duration: DEAD_SCROLL });

      // --- TRANSITION 2: Section One -> Section Two ---
      tl.to(".about-section-two", { yPercent: 0, duration: ACTION })
        .to(".about-section-one", { yPercent: -15, duration: ACTION }, "<");

      tl.to({}, { duration: DEAD_SCROLL });

      // --- TRANSITION 3: Section Two -> Section Three ---
      tl.to(".about-section-three", { yPercent: 0, duration: ACTION })
        .to(".about-section-two", { yPercent: -15, duration: ACTION }, "<");

      tl.to({}, { duration: DEAD_SCROLL });

      // --- TRANSITION 4: Section Three -> Section Four ---
      tl.to(".about-section-four", { yPercent: 0, duration: ACTION })
        .to(".about-section-three", { yPercent: -15, duration: ACTION }, "<");

      tl.to({}, { duration: DEAD_SCROLL });

      // --- TRANSITION 5: Section Four -> Section Five ---
      tl.addLabel("sec5Start")
        .to(
          ".about-section-five",
          {
            yPercent: 0,
            duration: ACTION,
            onStart: () => setIsSectionFiveActive(true),
            onReverseComplete: () => {
              setIsSectionFiveActive(false);
              triggerSec5Hook(0);
            },
          },
          "sec5Start"
        )
        .to(".about-section-four", { yPercent: -15, duration: ACTION }, "sec5Start");

      tl.addLabel("sec5FullyRevealed", `sec5Start+=${ACTION}`);

      tl.to({}, { duration: SEC5_CARDS_HOLD });

      // --- TRANSITION 6: Section Five -> CTA ---
      tl.addLabel("ctaStart", ">")
        .set(".about-section-cta", { visibility: "visible" }, "ctaStart")
        .fromTo(
          ".about-section-cta",
          { yPercent: 100 },
          {
            yPercent: 0,
            duration: ACTION * 1.2,
            ease: "power1.out",
          },
          "ctaStart"
        )
        .to(".about-section-five", { yPercent: 0, duration: ACTION * 1.2, ease: "power1.out" }, "ctaStart");

      tl.fromTo(
        ".about-section-five .s5-bg",
        { yPercent: 0, scale: 1.0 },
        { yPercent: -55, scale: 1.0, duration: ACTION + SEC5_CARDS_HOLD, ease: "none" },
        "sec5Start"
      );

      tl.to({}, { duration: DEAD_SCROLL });

      // --- TRANSITION 7: CTA -> Footer Wrap ---
      tl.addLabel("footerStart", ">")
        .set(".about-footer-wrap", { visibility: "visible" }, "footerStart")
        .fromTo(
          ".about-footer-wrap",
          { yPercent: 100 },
          { yPercent: 0, duration: ACTION, ease: "power1.out" },
          "footerStart"
        );

      // Force refresh on next frame to sync pinned trigger calculations
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    }, scopeRef);

    return () => {
      ctx.revert();
    };
  }, [introDone]);

  return (
    <div ref={scopeRef}>
      <div
        className="about-pin pin-all relative w-full overflow-hidden h-[100dvh]"
        style={{ visibility: "visible" }}
      >
        <div className="about-hero-panel-left gpu-accelerated absolute inset-0 w-full h-full" style={{ zIndex: 10 }}>
          <Hero isMobile={true} />
        </div>

        <div className="about-section-one gpu-accelerated absolute inset-0 w-full h-full" style={{ zIndex: 20 }}>
          <SectionOne />
        </div>

        <div className="about-section-two gpu-accelerated absolute inset-0 w-full h-full" style={{ zIndex: 30 }}>
          <SectionTwo />
        </div>

        <div className="about-section-three gpu-accelerated absolute inset-0 w-full h-full" style={{ zIndex: 40 }}>
          <SectionThree />
        </div>

        <div className="about-section-four gpu-accelerated absolute inset-0 w-full h-full" style={{ zIndex: 50 }}>
          <SectionFour />
        </div>

        <div
          className="about-section-five gpu-accelerated absolute inset-0 w-full h-full"
          style={{ zIndex: 60 }}
        >
          <SectionFive isActive={isSectionFiveActive} />
        </div>

        <div
          className="about-section-cta gpu-accelerated absolute inset-x-0 bottom-0 w-full h-auto min-h-[100dvh] z-[150]"
          style={{ pointerEvents: "auto", visibility: "hidden" }}
        >
          <SectionCTA />
        </div>

        <div className="about-footer-wrap gpu-accelerated absolute left-0 bottom-0 w-full z-[160]" style={{ pointerEvents: "auto", visibility: "hidden" }}>
          <Footer />
        </div>
      </div>
    </div>
  );
}