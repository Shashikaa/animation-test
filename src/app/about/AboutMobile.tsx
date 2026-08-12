"use client";

import Hero from "@/src/components/About/Hero";
import SectionOne from "@/src/components/About/SectionOne";
import SectionTwo from "@/src/components/About/SectionTwo";
import SectionThree from "@/src/components/About/SectionThree";
import SectionFour from "@/src/components/About/SectionFour";
import SectionFive from "@/src/components/About/SectionFive";
import SectionCTA from "@/src/components/SectionCTA";
import Footer from "@/src/components/Footer";
import { useState, useRef, useEffect, useCallback } from "react";
import { useSite } from "@/src/app/context/SiteContext";
import { useHeroIntro } from "@/src/app/utils/useHeroIntro";

const easeOutQuad = (t: number) => t * (2 - t);

export default function AboutMobile() {
  const [isSectionFiveActive, setIsSectionFiveActive] = useState(false);
  const scopeRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fixedFrameRef = useRef<HTMLDivElement>(null);

  const targetProgress = useRef(0);
  const currentProgress = useRef(0);
  const rafId = useRef<number | null>(null);

  const lastSec5Idx = useRef<number>(-1);

  const { smootherRef } = useSite();
  const { introDone, preloaderDone } = useHeroIntro(scopeRef, { isMobile: true });

  // ── 1. INTRO UNLOCK & LENIS RESUME ──
  useEffect(() => {
    const lenis = smootherRef?.current;

    if (!preloaderDone || !introDone) {
      if (lenis && typeof lenis.stop === "function") lenis.stop();
      targetProgress.current = 0;
      currentProgress.current = 0;
    } else {
      if (lenis && typeof lenis.start === "function") {
        lenis.start();
      }
    }
  }, [preloaderDone, introDone, smootherRef]);

  // ── 2. SECTION 5 TRIGGER HOOK ──
  const triggerSec5Hook = useCallback((nextIdx: number) => {
    if (nextIdx !== lastSec5Idx.current) {
      lastSec5Idx.current = nextIdx;
      if (typeof window !== "undefined" && (window as any)._sec5GoTo) {
        (window as any)._sec5GoTo(nextIdx);
      }
    }
  }, []);

  // ── 3. STACK ANIMATION & FIXED FRAME POSITIONING ──
  useEffect(() => {
    if (!preloaderDone || !introDone) return;

    const panels = trackRef.current?.querySelectorAll<HTMLElement>(".about-stack-layer");
    if (!panels || panels.length === 0) return;

    const updatePhysics = () => {
      const lerpFactor = 0.15;
      currentProgress.current += (targetProgress.current - currentProgress.current) * lerpFactor;

      if (Math.abs(targetProgress.current - currentProgress.current) < 0.0001) {
        currentProgress.current = targetProgress.current;
      }

      // 5 steps for stacked sections (Hero -> S1 -> S2 -> S3 -> S4 -> S5)
      const totalSteps = 5.0;
      const stepProgress = currentProgress.current * totalSteps;

      const s1Progress = easeOutQuad(Math.min(Math.max(stepProgress - 0, 0), 1));
      const s2Progress = easeOutQuad(Math.min(Math.max(stepProgress - 1, 0), 1));
      const s3Progress = easeOutQuad(Math.min(Math.max(stepProgress - 2, 0), 1));
      const s4Progress = easeOutQuad(Math.min(Math.max(stepProgress - 3, 0), 1));
      const s5Progress = easeOutQuad(Math.min(Math.max(stepProgress - 4, 0), 1));

      if (panels[1]) panels[1].style.transform = `translate3d(0, ${(1 - s1Progress) * 100}%, 0)`;
      if (panels[2]) panels[2].style.transform = `translate3d(0, ${(1 - s2Progress) * 100}%, 0)`;
      if (panels[3]) panels[3].style.transform = `translate3d(0, ${(1 - s3Progress) * 100}%, 0)`;
      if (panels[4]) panels[4].style.transform = `translate3d(0, ${(1 - s4Progress) * 100}%, 0)`;
      if (panels[5]) panels[5].style.transform = `translate3d(0, ${(1 - s5Progress) * 100}%, 0)`;

      // Parallax effect on Section 5 background
      const s5Bg = scopeRef.current?.querySelector<HTMLElement>(".s5-bg");
      if (s5Bg) {
        const parallaxProg = Math.min(Math.max((stepProgress - 4.0) / 1.0, 0), 1);
        s5Bg.style.transform = `translate3d(0, ${-parallaxProg * 50}%, 0)`;
      }

      // Section 5 internal state triggers
      if (stepProgress >= 4.2 && stepProgress <= 5.0) {
        setIsSectionFiveActive(true);
        const sec5SubProgress = (stepProgress - 4.2) / 0.8;

        if (sec5SubProgress < 0.33) {
          triggerSec5Hook(0);
        } else if (sec5SubProgress < 0.66) {
          triggerSec5Hook(1);
        } else {
          triggerSec5Hook(2);
        }
      } else {
        if (stepProgress < 4.2) {
          setIsSectionFiveActive(false);
          triggerSec5Hook(0);
        }
      }

      rafId.current = requestAnimationFrame(updatePhysics);
    };

    const handleScroll = () => {
      if (!trackRef.current || !fixedFrameRef.current) return;

      const trackRect = trackRef.current.getBoundingClientRect();
      const vh = window.innerHeight;
      const totalScrollable = trackRect.height - vh;

      if (totalScrollable <= 0) return;

      const buffer = 8;

      // Handle pinning transition logic
      if (trackRect.top <= 0 && trackRect.bottom >= vh - buffer) {
        if (fixedFrameRef.current.style.position !== "fixed") {
          fixedFrameRef.current.style.position = "fixed";
          fixedFrameRef.current.style.top = "0px";
          fixedFrameRef.current.style.bottom = "auto";
        }
      } else if (trackRect.bottom < vh - buffer) {
        if (
          fixedFrameRef.current.style.position !== "absolute" ||
          fixedFrameRef.current.style.bottom !== "0px"
        ) {
          fixedFrameRef.current.style.position = "absolute";
          fixedFrameRef.current.style.top = "auto";
          fixedFrameRef.current.style.bottom = "0px";
        }
      } else {
        if (
          fixedFrameRef.current.style.position !== "absolute" ||
          fixedFrameRef.current.style.top !== "0px"
        ) {
          fixedFrameRef.current.style.position = "absolute";
          fixedFrameRef.current.style.top = "0px";
          fixedFrameRef.current.style.bottom = "auto";
        }
      }

      const currentScroll = Math.max(0, -trackRect.top);
      targetProgress.current = Math.min(Math.max(currentScroll / totalScrollable, 0), 1);
    };

    rafId.current = requestAnimationFrame(updatePhysics);

    const lenis = smootherRef?.current;
    if (lenis && typeof lenis.on === "function") {
      lenis.on("scroll", handleScroll);
    } else {
      window.addEventListener("scroll", handleScroll, { passive: true });
    }

    handleScroll();

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      if (lenis && typeof lenis.off === "function") {
        lenis.off("scroll", handleScroll);
      } else {
        window.removeEventListener("scroll", handleScroll);
      }

      if (typeof window !== "undefined") {
        delete (window as any)._sec5GoTo;
      }
    };
  }, [introDone, preloaderDone, smootherRef, triggerSec5Hook]);

  const isReady = preloaderDone && introDone;

  return (
    <div ref={scopeRef} className="w-full bg-[#162D24]">
      {/* 1. Stack Track Container (Height tuned for 5 card layers) */}
      <div
        ref={trackRef}
        className="about-track-container relative w-full"
        style={{ height: "600vh" }}
      >
        <div
          ref={fixedFrameRef}
          className="fixed top-0 left-0 w-full overflow-hidden bg-[#162D24] z-10 h-[100dvh]"
        >
          {/* Layer 0: Hero */}
          <div className="about-stack-layer absolute inset-0 w-full h-[100dvh] z-10 gpu-accelerated">
            <Hero isMobile={true} />
          </div>

          {/* Layer 1: Section 1 */}
          <div
            className="about-stack-layer absolute inset-0 w-full h-[100dvh] z-20 gpu-accelerated"
            style={{ transform: "translate3d(0, 100%, 0)" }}
          >
            <SectionOne />
          </div>

          {/* Layer 2: Section 2 */}
          <div
            className="about-stack-layer absolute inset-0 w-full h-[100dvh] z-30 gpu-accelerated"
            style={{ transform: "translate3d(0, 100%, 0)" }}
          >
            <SectionTwo />
          </div>

          {/* Layer 3: Section 3 */}
          <div
            className="about-stack-layer absolute inset-0 w-full h-[100dvh] z-40 gpu-accelerated"
            style={{ transform: "translate3d(0, 100%, 0)" }}
          >
            <SectionThree />
          </div>

          {/* Layer 4: Section 4 */}
          <div
            className="about-stack-layer absolute inset-0 w-full h-[100dvh] z-50 gpu-accelerated"
            style={{ transform: "translate3d(0, 100%, 0)" }}
          >
            <SectionFour />
          </div>

          {/* Layer 5: Section 5 */}
          <div
            className="about-stack-layer absolute inset-0 w-full h-[100dvh] z-[60] gpu-accelerated"
            style={{ transform: "translate3d(0, 100%, 0)" }}
          >
            <SectionFive isActive={isSectionFiveActive} />
          </div>
        </div>
      </div>

      {/* 2. Unpinned Continuous Document Flow for CTA + Footer */}
      <div className="relative z-[70] w-full bg-[#162D24]">
        <SectionCTA preloaderDone={isReady} />
        <footer className="w-full bg-[#162D24]">
          <Footer />
        </footer>
      </div>
    </div>
  );
}