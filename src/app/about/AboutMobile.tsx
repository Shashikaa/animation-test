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
  const pinRef = useRef<HTMLDivElement>(null);
  const lastSec5Idx = useRef<number>(-1);
  const lockedScreenHeight = useRef<number>(BASELINE_VH);

  const { introDone } = useHeroIntro(scopeRef, { isMobile: true });

  useLayoutEffect(() => {
    if (typeof window !== "undefined") {
      lockedScreenHeight.current = window.innerHeight || BASELINE_VH;
      
      // Explicitly lock the container's height in px to prevent keyboard resize shifts
      if (pinRef.current) {
        pinRef.current.style.height = `${lockedScreenHeight.current}px`;
      }
    }

    const ctx = gsap.context(() => {
      gsap.set(".about-hero-panel-left", { yPercent: 0, force3D: true });
      gsap.set(".about-section-one", { yPercent: 100, visibility: "visible", force3D: true });
      gsap.set(".about-section-two", { yPercent: 100, visibility: "visible", force3D: true });
      gsap.set(".about-section-three", { yPercent: 100, visibility: "visible", force3D: true });
      gsap.set(".about-section-four", { yPercent: 100, visibility: "visible", force3D: true });

      gsap.set(".about-section-five", { yPercent: 100, opacity: 1, visibility: "visible", force3D: true });
      gsap.set(".about-section-five .s5-bg", { scale: 1.25, yPercent: 0, force3D: true });

      gsap.set(".about-bottom-stack", { y: lockedScreenHeight.current, zIndex: 150, visibility: "hidden", force3D: true });
      gsap.set(
        [".about-section-cta .cta-inner-mobile", ".about-section-cta .cta-inner-desktop"],
        { opacity: 1, y: 0, pointerEvents: "auto", visibility: "visible" }
      );
    }, scopeRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!introDone) return;

    const isAndroid = /Android/i.test(navigator.userAgent);

    const ctx = gsap.context(() => {
      ScrollTrigger.config({
        ignoreMobileResize: true,
        autoRefreshEvents: "DOMContentLoaded,load,visibilitychange",
      });

      if (!isAndroid) {
        ScrollTrigger.normalizeScroll({
          allowNestedScroll: true,
          lockAxis: true,
        });
      }

      const ACTION = 1.4;
      const DEAD_SCROLL = 0.15;
      const SEC5_CARDS_HOLD = 1.2;
      const UNIFIED_EASE = "power1.inOut";

      const MAIN_PANELS_COUNT = 7;
      const SUB_STEPS_COUNT = 3;
      const PAUSES_COUNT = 6;

      const vh = lockedScreenHeight.current;
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
          invalidateOnRefresh: false,
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

      // --- TRANSITIONS ---
      tl.to(".about-section-one", { yPercent: 0, duration: ACTION })
        .to(".about-hero-bg", { scale: 1.0, yPercent: -15, duration: ACTION }, "<");

      tl.to({}, { duration: DEAD_SCROLL });

      tl.to(".about-section-two", { yPercent: 0, duration: ACTION })
        .to(".about-section-one", { yPercent: -15, duration: ACTION }, "<");

      tl.to({}, { duration: DEAD_SCROLL });

      tl.to(".about-section-three", { yPercent: 0, duration: ACTION })
        .to(".about-section-two", { yPercent: -15, duration: ACTION }, "<");

      tl.to({}, { duration: DEAD_SCROLL });

      tl.to(".about-section-four", { yPercent: 0, duration: ACTION })
        .to(".about-section-three", { yPercent: -15, duration: ACTION }, "<");

      tl.to({}, { duration: DEAD_SCROLL });

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

      const stackElement = document.querySelector(".about-bottom-stack");
      const totalStackHeight = stackElement ? stackElement.clientHeight : vh * 1.5;

      tl.addLabel("ctaStart", ">")
        .set(".about-bottom-stack", { visibility: "visible" }, "ctaStart")
        .to(
          ".about-bottom-stack",
          {
            y: -(totalStackHeight - vh),
            duration: ACTION * 1.8,
            ease: "power1.out",
          },
          "ctaStart"
        )
        .to(".about-section-five", { yPercent: 0, duration: ACTION * 1.8, ease: "power1.out" }, "ctaStart");

      tl.fromTo(
        ".about-section-five .s5-bg",
        { yPercent: 0, scale: 1.0 },
        { yPercent: -55, scale: 1.0, duration: ACTION + SEC5_CARDS_HOLD, ease: "none" },
        "sec5Start"
      );
    }, scopeRef);

    return () => {
      ctx.revert();
      if (!isAndroid) {
        ScrollTrigger.normalizeScroll(false);
      }
    };
  }, [introDone]);

  return (
    <div ref={scopeRef}>
      <div
        ref={pinRef}
        className="about-pin pin-all relative w-full overflow-hidden"
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
          className="about-bottom-stack gpu-accelerated absolute left-0 top-0 w-full h-auto z-[150] flex flex-col"
          style={{ pointerEvents: "auto", visibility: "hidden" }}
        >
          <div className="about-section-cta w-full min-h-screen">
            <SectionCTA />
          </div>
          <div className="about-footer-wrap w-full">
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}